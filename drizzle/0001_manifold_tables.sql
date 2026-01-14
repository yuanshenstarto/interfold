-- Manifold Theory Tables - Sparse Hypergraph Architecture
-- Created: 2026-01-14

-- AtomicSets: Vertices in the hypergraph
CREATE TABLE "pg-drizzle_atomic_set" (
	"id" uuid PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"name" text NOT NULL,
	"metadata" jsonb,
	"createdAt" timestamp with time zone NOT NULL
);

--> statement-breakpoint

-- Intersections: Hyperedges in the hypergraph
CREATE TABLE "pg-drizzle_intersection" (
	"id" uuid PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"createdViaPath" jsonb NOT NULL,
	"content" text,
	"isDeleted" boolean NOT NULL,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL
);

--> statement-breakpoint

-- IntersectionElements: Junction table for many-to-many relationship
CREATE TABLE "pg-drizzle_intersection_element" (
	"intersectionId" uuid NOT NULL,
	"atomicSetId" uuid NOT NULL,
	CONSTRAINT "pg-drizzle_intersection_element_intersectionId_atomicSetId_pk" PRIMARY KEY("intersectionId","atomicSetId")
);

--> statement-breakpoint

-- OutlineNodes: Tree structure projection of the hypergraph
CREATE TABLE "pg-drizzle_outline_node" (
	"id" uuid PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"parentId" uuid,
	"content" text NOT NULL,
	"orderIndex" integer NOT NULL,
	"isExpanded" boolean NOT NULL,
	"intersectionId" uuid,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL
);

--> statement-breakpoint

-- Foreign key constraints
ALTER TABLE "pg-drizzle_atomic_set" ADD CONSTRAINT "pg-drizzle_atomic_set_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;

--> statement-breakpoint

ALTER TABLE "pg-drizzle_intersection_element" ADD CONSTRAINT "pg-drizzle_intersection_element_intersectionId_pg-drizzle_intersection_id_fk" FOREIGN KEY ("intersectionId") REFERENCES "public"."pg-drizzle_intersection"("id") ON DELETE cascade ON UPDATE no action;

--> statement-breakpoint

ALTER TABLE "pg-drizzle_intersection_element" ADD CONSTRAINT "pg-drizzle_intersection_element_atomicSetId_pg-drizzle_atomic_set_id_fk" FOREIGN KEY ("atomicSetId") REFERENCES "public"."pg-drizzle_atomic_set"("id") ON DELETE cascade ON UPDATE no action;

--> statement-breakpoint

ALTER TABLE "pg-drizzle_intersection" ADD CONSTRAINT "pg-drizzle_intersection_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;

--> statement-breakpoint

ALTER TABLE "pg-drizzle_outline_node" ADD CONSTRAINT "pg-drizzle_outline_node_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;

--> statement-breakpoint

ALTER TABLE "pg-drizzle_outline_node" ADD CONSTRAINT "pg-drizzle_outline_node_intersectionId_pg-drizzle_intersection_id_fk" FOREIGN KEY ("intersectionId") REFERENCES "public"."pg-drizzle_intersection"("id") ON DELETE no action ON UPDATE no action;

--> statement-breakpoint

-- Indexes for atomic sets
CREATE INDEX "atomic_set_user_idx" ON "pg-drizzle_atomic_set" USING btree ("userId");

--> statement-breakpoint

CREATE INDEX "atomic_set_name_idx" ON "pg-drizzle_atomic_set" USING btree ("name");

--> statement-breakpoint

CREATE UNIQUE INDEX "atomic_set_user_name_unique" ON "pg-drizzle_atomic_set" USING btree ("userId","name");

--> statement-breakpoint

-- Indexes for intersection elements
CREATE INDEX "intersection_element_atomic_set_idx" ON "pg-drizzle_intersection_element" USING btree ("atomicSetId");

--> statement-breakpoint

-- Indexes for intersections
CREATE INDEX "intersection_user_idx" ON "pg-drizzle_intersection" USING btree ("userId");

--> statement-breakpoint

CREATE INDEX "intersection_deleted_idx" ON "pg-drizzle_intersection" USING btree ("isDeleted");

--> statement-breakpoint

-- Indexes for outline nodes
CREATE INDEX "outline_node_user_idx" ON "pg-drizzle_outline_node" USING btree ("userId");

--> statement-breakpoint

CREATE INDEX "outline_node_parent_idx" ON "pg-drizzle_outline_node" USING btree ("parentId");

--> statement-breakpoint

CREATE INDEX "outline_node_order_idx" ON "pg-drizzle_outline_node" USING btree ("parentId","orderIndex");

--> statement-breakpoint

CREATE INDEX "outline_node_intersection_idx" ON "pg-drizzle_outline_node" USING btree ("intersectionId");
