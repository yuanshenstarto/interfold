import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  pgTableCreator,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const createTable = pgTableCreator((name) => `pg-drizzle_${name}`);

export const posts = createTable(
  "post",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    name: d.varchar({ length: 256 }),
    createdById: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => user.id),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("created_by_idx").on(t.createdById),
    index("name_idx").on(t.name),
  ]
);

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date()
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date()
  ),
});

export const userRelations = relations(user, ({ many }) => ({
  account: many(account),
  session: many(session),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

// ============================================================================
// Manifold Theory Tables - Sparse Hypergraph Architecture
// ============================================================================

/**
 * AtomicSets: Vertices in the hypergraph
 * Represents unique concepts/tags (e.g., "React", "Hooks", "Closure")
 */
export const atomicSets = createTable(
  "atomic_set",
  (d) => ({
    id: d.uuid().$defaultFn(() => crypto.randomUUID()).primaryKey(),
    userId: d
      .text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: d.text().notNull(), // Display name (e.g., "React")
    metadata: d.jsonb().$type<Record<string, unknown>>(), // Optional metadata
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [
    index("atomic_set_user_idx").on(t.userId),
    index("atomic_set_name_idx").on(t.name),
    // Unique constraint: one atomic set per name per user
    uniqueIndex("atomic_set_user_name_unique").on(t.userId, t.name),
  ]
);

/**
 * Intersections: Hyperedges in the hypergraph
 * Represents user-created combinations of atomic sets (e.g., (React, Hooks, Closure))
 */
export const intersections = createTable(
  "intersection",
  (d) => ({
    id: d.uuid().$defaultFn(() => crypto.randomUUID()).primaryKey(),
    userId: d
      .text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdViaPath: d.jsonb().$type<string[]>().notNull(), // Ordered path preserving user's perspective
    content: d.text(), // Optional text content
    isDeleted: d.boolean().$defaultFn(() => false).notNull(), // Soft delete flag
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date())
      .notNull(),
  }),
  (t) => [
    index("intersection_user_idx").on(t.userId),
    index("intersection_deleted_idx").on(t.isDeleted),
  ]
);

/**
 * IntersectionElements: Junction table for many-to-many relationship
 * Maps intersections to their constituent atomic sets (inverted index)
 */
export const intersectionElements = createTable(
  "intersection_element",
  (d) => ({
    intersectionId: d
      .uuid()
      .notNull()
      .references(() => intersections.id, { onDelete: "cascade" }),
    atomicSetId: d
      .uuid()
      .notNull()
      .references(() => atomicSets.id, { onDelete: "cascade" }),
  }),
  (t) => [
    // Composite primary key
    primaryKey({ columns: [t.intersectionId, t.atomicSetId] }),
    // Index for inverted lookups (find intersections by atomic set)
    index("intersection_element_atomic_set_idx").on(t.atomicSetId),
  ]
);

/**
 * OutlineNodes: Tree structure projection of the hypergraph
 * User's hierarchical outline view (tree is a projection, not the source of truth)
 */
export const outlineNodes = createTable(
  "outline_node",
  (d) => ({
    id: d.uuid().$defaultFn(() => crypto.randomUUID()).primaryKey(),
    userId: d
      .text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    parentId: d.uuid(), // null for root nodes
    content: d.text().notNull(), // Node text content
    orderIndex: d.integer().notNull(), // Position among siblings (0-based)
    isExpanded: d.boolean().$defaultFn(() => true).notNull(), // Collapse/expand state
    intersectionId: d.uuid().references(() => intersections.id), // Associated intersection (if path exists)
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date())
      .notNull(),
  }),
  (t) => [
    index("outline_node_user_idx").on(t.userId),
    index("outline_node_parent_idx").on(t.parentId),
    index("outline_node_order_idx").on(t.parentId, t.orderIndex),
    index("outline_node_intersection_idx").on(t.intersectionId),
  ]
);

// ============================================================================
// Drizzle Relations - Manifold Theory Tables
// ============================================================================

export const atomicSetRelations = relations(atomicSets, ({ one, many }) => ({
  user: one(user, {
    fields: [atomicSets.userId],
    references: [user.id],
  }),
  intersectionElements: many(intersectionElements),
}));

export const intersectionRelations = relations(
  intersections,
  ({ one, many }) => ({
    user: one(user, {
      fields: [intersections.userId],
      references: [user.id],
    }),
    intersectionElements: many(intersectionElements),
    outlineNodes: many(outlineNodes),
  })
);

export const intersectionElementRelations = relations(
  intersectionElements,
  ({ one }) => ({
    intersection: one(intersections, {
      fields: [intersectionElements.intersectionId],
      references: [intersections.id],
    }),
    atomicSet: one(atomicSets, {
      fields: [intersectionElements.atomicSetId],
      references: [atomicSets.id],
    }),
  })
);

export const outlineNodeRelations = relations(outlineNodes, ({ one, many }) => ({
  user: one(user, {
    fields: [outlineNodes.userId],
    references: [user.id],
  }),
  parent: one(outlineNodes, {
    fields: [outlineNodes.parentId],
    references: [outlineNodes.id],
    relationName: "parentChildren",
  }),
  children: many(outlineNodes, {
    relationName: "parentChildren",
  }),
  intersection: one(intersections, {
    fields: [outlineNodes.intersectionId],
    references: [intersections.id],
  }),
}));

// Update user relations to include new tables
export const userRelationsExtended = relations(user, ({ many }) => ({
  account: many(account),
  session: many(session),
  atomicSets: many(atomicSets),
  intersections: many(intersections),
  outlineNodes: many(outlineNodes),
}));
