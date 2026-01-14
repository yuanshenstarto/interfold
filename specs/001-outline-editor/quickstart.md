# Quickstart: Basic Outline Editor Implementation

**Date**: 2026-01-14
**Feature**: Basic Outline Editor (001-outline-editor)
**Prerequisites**: PostgreSQL running via `./start-database.sh`, environment variables configured

## Overview

This guide walks through implementing the basic outline editor from database schema to UI components, following the T3 Stack patterns and constitutional principles.

---

## Step 1: Database Schema Migration

### 1.1 Create Migration File

```bash
pnpm db:generate
# This generates a migration file in drizzle/migrations/
```

### 1.2 Update `src/server/db/schema.ts`

Add the four new tables (see `data-model.md` for complete schema):

```typescript
import { relations } from "drizzle-orm";
import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  index,
  primaryKey,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

// ===== Atomic Sets (Vertices) =====
export const atomicSets = pgTable('pg-drizzle_atomic_set', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  userId: uuid('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  userIdx: index('atomic_set_user_idx').on(table.userId),
}));

// ===== Intersections (Hyperedges) =====
export const intersections = pgTable('pg-drizzle_intersection', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  createdViaPath: jsonb('created_via_path').$type<string[]>().notNull(),
  content: text('content'),
  isDeleted: boolean('is_deleted').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  userIdx: index('intersection_user_idx').on(table.userId),
  deletedIdx: index('intersection_deleted_idx').on(table.isDeleted),
}));

// ===== Intersection Elements (Junction) =====
export const intersectionElements = pgTable('pg-drizzle_intersection_element', {
  intersectionId: uuid('intersection_id').notNull().references(() => intersections.id, { onDelete: 'cascade' }),
  atomicSetId: uuid('atomic_set_id').notNull().references(() => atomicSets.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.intersectionId, table.atomicSetId] }),
  atomicSetIdx: index('intersection_element_atomic_idx').on(table.atomicSetId),
}));

// ===== Outline Nodes (Tree Projection) =====
export const outlineNodes = pgTable('pg-drizzle_outline_node', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  intersectionId: uuid('intersection_id').references(() => intersections.id, { onDelete: 'set null' }),
  parentId: uuid('parent_id').references((): AnyPgColumn => outlineNodes.id, { onDelete: 'cascade' }),
  orderPosition: integer('order_position').notNull(),
  isExpanded: boolean('is_expanded').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  userIdx: index('outline_node_user_idx').on(table.userId),
  parentIdx: index('outline_node_parent_idx').on(table.parentId),
  parentOrderIdx: index('outline_node_parent_order_idx').on(table.parentId, table.orderPosition),
}));

// ===== Relations =====
export const atomicSetsRelations = relations(atomicSets, ({ one, many }) => ({
  user: one(user, {
    fields: [atomicSets.userId],
    references: [user.id],
  }),
  intersectionElements: many(intersectionElements),
}));

export const intersectionsRelations = relations(intersections, ({ one, many }) => ({
  user: one(user, {
    fields: [intersections.userId],
    references: [user.id],
  }),
  intersectionElements: many(intersectionElements),
  outlineNodes: many(outlineNodes),
}));

export const intersectionElementsRelations = relations(intersectionElements, ({ one }) => ({
  intersection: one(intersections, {
    fields: [intersectionElements.intersectionId],
    references: [intersections.id],
  }),
  atomicSet: one(atomicSets, {
    fields: [intersectionElements.atomicSetId],
    references: [atomicSets.id],
  }),
}));

export const outlineNodesRelations = relations(outlineNodes, ({ one, many }) => ({
  user: one(user, {
    fields: [outlineNodes.userId],
    references: [user.id],
  }),
  intersection: one(intersections, {
    fields: [outlineNodes.intersectionId],
    references: [intersections.id],
  }),
  parent: one(outlineNodes, {
    fields: [outlineNodes.parentId],
    references: [outlineNodes.id],
    relationName: 'children',
  }),
  children: many(outlineNodes, {
    relationName: 'children',
  }),
}));
```

### 1.3 Run Migration

```bash
pnpm db:push
# Applies schema changes to PostgreSQL database
```

---

## Step 2: Shared Types and Validation

### 2.1 Create `src/lib/outline/types.ts`

```typescript
export interface AtomicSet {
  id: string;
  name: string;
  userId: string;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

export interface Intersection {
  id: string;
  userId: string;
  createdViaPath: string[];
  content: string | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OutlineNode {
  id: string;
  userId: string;
  intersectionId: string | null;
  parentId: string | null;
  orderPosition: number;
  isExpanded: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OutlineNodeWithContent extends OutlineNode {
  content: string | null;
  createdViaPath: string[];
}
```

### 2.2 Create `src/lib/outline/validation.ts`

```typescript
import { z } from "zod";

export const createNodeSchema = z.object({
  parentId: z.string().uuid().nullable(),
  orderPosition: z.number().int().min(0),
  content: z.string().min(1).max(5000),
});

export const updateNodeContentSchema = z.object({
  nodeId: z.string().uuid(),
  content: z.string().min(1).max(5000),
});

export const moveNodeSchema = z.object({
  nodeId: z.string().uuid(),
  newParentId: z.string().uuid().nullable(),
  newOrderPosition: z.number().int().min(0),
});

export const createAtomicSetSchema = z.object({
  name: z.string().min(1).max(200).trim(),
  metadata: z.record(z.unknown()).optional(),
});

export const createIntersectionSchema = z.object({
  atomicSetIds: z.array(z.string().uuid()).min(1).max(20),
  createdViaPath: z.array(z.string().uuid()).min(1).max(20),
  content: z.string().max(5000).optional(),
});
```

---

## Step 3: tRPC Routers

### 3.1 Create `src/server/api/routers/atomicSet.ts`

```typescript
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { atomicSets, intersectionElements } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";
import { createAtomicSetSchema } from "~/lib/outline/validation";

export const atomicSetRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const sets = await ctx.db.query.atomicSets.findMany({
      where: eq(atomicSets.userId, ctx.session.user.id),
      orderBy: (atomicSets, { asc }) => [asc(atomicSets.name)],
    });
    return { atomicSets: sets };
  }),

  findOrCreate: protectedProcedure
    .input(createAtomicSetSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Try to find existing
      const existing = await ctx.db.query.atomicSets.findFirst({
        where: and(
          eq(atomicSets.name, input.name),
          eq(atomicSets.userId, userId),
        ),
      });

      if (existing) {
        return { ...existing, wasCreated: false };
      }

      // Create new
      const [created] = await ctx.db
        .insert(atomicSets)
        .values({
          name: input.name,
          userId,
          metadata: input.metadata ?? null,
        })
        .returning();

      return { ...created!, wasCreated: true };
    }),

  // Add other procedures from contracts/atomic-set-router.md
});
```

### 3.2 Create `src/server/api/routers/outline.ts`

```typescript
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { outlineNodes, intersections, atomicSets, intersectionElements } from "~/server/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { createNodeSchema, updateNodeContentSchema } from "~/lib/outline/validation";

export const outlineRouter = createTRPCRouter({
  getUserOutline: protectedProcedure.query(async ({ ctx }) => {
    const nodes = await ctx.db.query.outlineNodes.findMany({
      where: eq(outlineNodes.userId, ctx.session.user.id),
      with: {
        intersection: true,
      },
      orderBy: (outlineNodes, { asc }) => [
        asc(outlineNodes.parentId),
        asc(outlineNodes.orderPosition),
      ],
    });

    return {
      nodes: nodes.map((node) => ({
        id: node.id,
        parentId: node.parentId,
        orderPosition: node.orderPosition,
        isExpanded: node.isExpanded,
        content: node.intersection?.content ?? null,
        createdViaPath: node.intersection?.createdViaPath ?? [],
        createdAt: node.createdAt,
        updatedAt: node.updatedAt,
      })),
    };
  }),

  createNode: protectedProcedure
    .input(createNodeSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // 1. Calculate path from root to new node
      const path = await calculatePathFromRoot(ctx.db, input.parentId, userId);

      // 2. Extract node name from content (simplified - take first word)
      const nodeName = input.content.split(' ')[0]?.trim() ?? input.content;
      path.push(nodeName);

      // 3. Find or create atomic sets
      const atomicSetIds: string[] = [];
      for (const name of path) {
        const result = await ctx.db.transaction(async (tx) => {
          const existing = await tx.query.atomicSets.findFirst({
            where: and(eq(atomicSets.name, name), eq(atomicSets.userId, userId)),
          });
          if (existing) return existing;

          const [created] = await tx.insert(atomicSets).values({
            name,
            userId,
          }).returning();
          return created!;
        });
        atomicSetIds.push(result.id);
      }

      // 4. Create intersection
      const [intersection] = await ctx.db
        .insert(intersections)
        .values({
          userId,
          createdViaPath: atomicSetIds,
          content: input.content,
        })
        .returning();

      // 5. Create intersection elements
      await ctx.db.insert(intersectionElements).values(
        atomicSetIds.map((atomicSetId) => ({
          intersectionId: intersection!.id,
          atomicSetId,
        })),
      );

      // 6. Create outline node
      const [node] = await ctx.db
        .insert(outlineNodes)
        .values({
          userId,
          intersectionId: intersection!.id,
          parentId: input.parentId,
          orderPosition: input.orderPosition,
        })
        .returning();

      return { node, intersection, atomicSets: atomicSetIds };
    }),

  // Add other procedures from contracts/outline-router.md
});

async function calculatePathFromRoot(
  db: any,
  parentId: string | null,
  userId: string,
): Promise<string[]> {
  if (!parentId) return [];

  // Recursive query to get path
  const parent = await db.query.outlineNodes.findFirst({
    where: and(eq(outlineNodes.id, parentId), eq(outlineNodes.userId, userId)),
    with: { intersection: true },
  });

  if (!parent || !parent.intersection) return [];

  // Get atomic set names from intersection
  const elements = await db.query.intersectionElements.findMany({
    where: eq(intersectionElements.intersectionId, parent.intersection.id),
    with: { atomicSet: true },
  });

  return elements.map((el: any) => el.atomicSet.name);
}
```

### 3.3 Update `src/server/api/root.ts`

```typescript
import { atomicSetRouter } from "~/server/api/routers/atomicSet";
import { outlineRouter } from "~/server/api/routers/outline";
import { intersectionRouter } from "~/server/api/routers/intersection"; // Create this next
import { postRouter } from "~/server/api/routers/post";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

export const appRouter = createTRPCRouter({
  post: postRouter,
  atomicSet: atomicSetRouter,
  outline: outlineRouter,
  intersection: intersectionRouter,
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
```

---

## Step 4: Frontend Components

### 4.1 Create `src/app/outliner/page.tsx`

```typescript
import { redirect } from "next/navigation";
import { auth } from "~/server/better-auth/server";
import OutlineEditor from "./_components/OutlineEditor";

export default async function OutlinerPage() {
  const session = await auth();
  if (!session) {
    redirect("/api/auth/signin");
  }

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Outline Editor</h1>
      <OutlineEditor />
    </main>
  );
}
```

### 4.2 Create `src/app/outliner/_components/OutlineEditor.tsx`

```typescript
"use client";

import { api } from "~/trpc/react";
import OutlineNode from "./OutlineNode";
import { useState } from "react";

export default function OutlineEditor() {
  const { data, isLoading } = api.outline.getUserOutline.useQuery();
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);

  if (isLoading) {
    return <div>Loading outline...</div>;
  }

  const rootNodes = data?.nodes.filter((node) => node.parentId === null) ?? [];

  return (
    <div
      role="tree"
      aria-label="Outline Editor"
      className="space-y-1"
    >
      {rootNodes.map((node) => (
        <OutlineNode
          key={node.id}
          node={node}
          allNodes={data?.nodes ?? []}
          level={1}
          isFocused={focusedNodeId === node.id}
          onFocusChange={setFocusedNodeId}
        />
      ))}
    </div>
  );
}
```

### 4.3 Create `src/app/outliner/_components/OutlineNode.tsx`

```typescript
"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { useDebouncedCallback } from "use-debounce";
import type { OutlineNodeWithContent } from "~/lib/outline/types";

interface OutlineNodeProps {
  node: OutlineNodeWithContent;
  allNodes: OutlineNodeWithContent[];
  level: number;
  isFocused: boolean;
  onFocusChange: (nodeId: string | null) => void;
}

export default function OutlineNode({
  node,
  allNodes,
  level,
  isFocused,
  onFocusChange,
}: OutlineNodeProps) {
  const [localContent, setLocalContent] = useState(node.content ?? "");
  const utils = api.useUtils();

  const updateContent = api.outline.updateNodeContent.useMutation({
    onSuccess: () => {
      void utils.outline.getUserOutline.invalidate();
    },
  });

  const debouncedSave = useDebouncedCallback((content: string) => {
    updateContent.mutate({ nodeId: node.id, content });
  }, 2000);

  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newContent = e.target.value;
    setLocalContent(newContent);
    debouncedSave(newContent);
  };

  const children = allNodes.filter((n) => n.parentId === node.id);

  return (
    <div
      role="treeitem"
      aria-level={level}
      aria-expanded={node.isExpanded}
      className="outline-node"
      style={{ paddingLeft: `${(level - 1) * 24}px` }}
    >
      <input
        type="text"
        value={localContent}
        onChange={handleContentChange}
        onFocus={() => onFocusChange(node.id)}
        onBlur={() => onFocusChange(null)}
        className="w-full border border-gray-300 rounded px-2 py-1"
        aria-label={`Outline node: ${localContent}`}
      />

      {node.isExpanded && children.length > 0 && (
        <div className="children">
          {children.map((child) => (
            <OutlineNode
              key={child.id}
              node={child}
              allNodes={allNodes}
              level={level + 1}
              isFocused={isFocused}
              onFocusChange={onFocusChange}
            />
          ))}
        </div>
      )}

      {updateContent.isLoading && (
        <span className="text-xs text-gray-500">Saving...</span>
      )}
    </div>
  );
}
```

---

## Step 5: Install Dependencies

```bash
pnpm add @tanstack/react-virtual use-debounce
pnpm add -D vitest @testing-library/react @testing-library/user-event @vitejs/plugin-react happy-dom
```

---

## Step 6: Testing Setup

### 6.1 Create `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
  },
});
```

### 6.2 Add Test Script to `package.json`

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui"
  }
}
```

---

## Step 7: Run the Application

```bash
# Start database (if not running)
./start-database.sh

# Run development server
pnpm dev

# Navigate to http://localhost:3000/outliner
```

---

## Next Steps

1. **Implement keyboard navigation** (Arrow keys, Enter, Tab)
2. **Add contract tests** for all tRPC procedures
3. **Add integration tests** for user stories
4. **Implement virtual scrolling** with `@tanstack/react-virtual`
5. **Add ARIA labels** and test with screen readers
6. **Performance profiling** with React DevTools

See `research.md` and contract files for detailed implementation guidance.

---

## Troubleshooting

### Database Connection Issues
```bash
# Verify PostgreSQL is running
docker ps | grep postgres

# Check connection string in .env
echo $DATABASE_URL
```

### Type Errors
```bash
# Regenerate Drizzle types
pnpm db:generate

# Check TypeScript compilation
pnpm typecheck
```

### tRPC Errors
- Verify routers are exported in `root.ts`
- Check session authentication in procedures
- Use browser DevTools Network tab to inspect requests

---

## Constitutional Compliance Checklist

- [x] TypeScript strict mode enabled
- [x] tRPC for end-to-end type safety
- [x] Drizzle schema as single source of truth
- [x] Zod validation for all inputs
- [x] Manifold theory integrity (pure set model)
- [x] Progressive complexity (simple UI, complex data model)
- [x] Tailwind CSS for styling
- [x] Better Auth for authentication
- [x] No prohibited dependencies added

---

**Ready for Implementation**: Follow this quickstart to build the MVP incrementally, starting with database schema and working up to UI components.
