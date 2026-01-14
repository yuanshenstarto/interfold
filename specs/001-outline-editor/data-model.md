# Data Model: Basic Outline Editor

**Date**: 2026-01-14
**Feature**: Basic Outline Editor (001-outline-editor)

## Overview

This document defines the database schema and data relationships for the outline editor, based on manifold theory principles and the sparse hypergraph mathematical model.

---

## Entity Relationship Diagram

```
┌─────────────────┐
│     User        │
│  (from Better   │
│      Auth)      │
└────────┬────────┘
         │
         │ 1:N
         │
    ┌────▼────────────────┐
    │   AtomicSet         │
    │  (Vertices)         │
    │  - id (PK)          │
    │  - name (UNIQUE)    │
    │  - userId (FK)      │
    │  - metadata         │
    │  - createdAt        │
    └─────┬───────────────┘
          │
          │ N:M
          │
    ┌─────▼───────────────────────┐
    │  IntersectionElement        │
    │  (Junction Table)           │
    │  - intersectionId (FK, PK)  │
    │  - atomicSetId (FK, PK)     │
    └─────┬───────────────────────┘
          │
          │ N:1
          │
    ┌─────▼─────────────────┐
    │   Intersection        │
    │  (Hyperedges)         │
    │  - id (PK)            │
    │  - userId (FK)        │
    │  - createdViaPath     │◄─────┐
    │  - content            │      │
    │  - isDeleted          │      │
    │  - createdAt          │      │ 1:N
    │  - updatedAt          │      │
    └───────────────────────┘      │
                                   │
                          ┌────────┴───────────┐
                          │   OutlineNode      │
                          │  (Tree Projection) │
                          │  - id (PK)         │
                          │  - userId (FK)     │
                          │  - intersectionId  │
                          │  - parentId (self) │
                          │  - orderPosition   │
                          │  - isExpanded      │
                          │  - createdAt       │
                          │  - updatedAt       │
                          └────────────────────┘
```

---

## Tables

### 1. AtomicSet (Vertices)

**Purpose**: Stores unique concepts/tags that form the building blocks of intersections.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| `name` | TEXT | NOT NULL, UNIQUE | Display name (e.g., "React", "Hooks") |
| `userId` | UUID | FOREIGN KEY → user.id ON DELETE CASCADE | Owner of this atomic set |
| `metadata` | JSONB | NULLABLE | Optional metadata (e.g., color, icon) |
| `createdAt` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |

**Indexes**:
- PRIMARY KEY on `id`
- UNIQUE constraint on `name` (enforces manifold theory: single definition per concept)
- INDEX on `userId` for user-scoped queries

**Validation Rules**:
- `name` must be 1-200 characters
- `name` must not be empty or whitespace-only
- `metadata` max size: 1KB

**Sample Data**:
```sql
INSERT INTO "pg-drizzle_atomic_set" (id, name, userId, metadata)
VALUES
  ('a1', 'React', 'user1', '{"color": "#61DAFB"}'),
  ('a2', 'Hooks', 'user1', NULL),
  ('a3', 'Closure', 'user1', NULL);
```

---

### 2. Intersection (Hyperedges)

**Purpose**: Stores combinations of atomic sets representing paths in the outline (e.g., "React > Hooks > Closure").

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| `userId` | UUID | FOREIGN KEY → user.id ON DELETE CASCADE | Owner of this intersection |
| `createdViaPath` | JSONB | NOT NULL | Ordered array of atomic set IDs (preserves user's perspective) |
| `content` | TEXT | NULLABLE | Optional text content attached to this intersection |
| `isDeleted` | BOOLEAN | NOT NULL, DEFAULT FALSE | Soft delete flag (preserves data integrity) |
| `createdAt` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updatedAt` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes**:
- PRIMARY KEY on `id`
- INDEX on `userId` for user-scoped queries
- INDEX on `isDeleted` for filtering active intersections
- GIN INDEX on `createdViaPath` for JSONB queries (PostgreSQL-specific)

**Validation Rules**:
- `createdViaPath` must be an array of 1-20 valid atomic set IDs
- `content` max length: 5000 characters
- `userId` must match all atomic sets in `createdViaPath`

**Sample Data**:
```sql
INSERT INTO "pg-drizzle_intersection" (id, userId, createdViaPath, content, isDeleted)
VALUES
  ('i1', 'user1', '["a1", "a2", "a3"]', 'Content about React Hooks closures', FALSE),
  ('i2', 'user1', '["a1", "a2"]', 'Content about React Hooks', FALSE);
```

---

### 3. IntersectionElement (Junction Table)

**Purpose**: Many-to-many relationship between intersections and atomic sets. Enables inverted index queries.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `intersectionId` | UUID | FOREIGN KEY → intersection.id ON DELETE CASCADE, PRIMARY KEY (composite) | Reference to intersection |
| `atomicSetId` | UUID | FOREIGN KEY → atomicSet.id ON DELETE CASCADE, PRIMARY KEY (composite) | Reference to atomic set |

**Indexes**:
- PRIMARY KEY on (`intersectionId`, `atomicSetId`)
- INDEX on `atomicSetId` (inverted index: find all intersections containing a specific atomic set)

**Validation Rules**:
- Both foreign keys must reference existing records
- No duplicate pairs allowed (enforced by PRIMARY KEY)

**Sample Data**:
```sql
INSERT INTO "pg-drizzle_intersection_element" (intersectionId, atomicSetId)
VALUES
  ('i1', 'a1'),  -- Intersection i1 contains React
  ('i1', 'a2'),  -- Intersection i1 contains Hooks
  ('i1', 'a3'),  -- Intersection i1 contains Closure
  ('i2', 'a1'),  -- Intersection i2 contains React
  ('i2', 'a2');  -- Intersection i2 contains Hooks
```

---

### 4. OutlineNode (Tree Projection)

**Purpose**: Stores the user-facing tree structure. This is a denormalized projection of the hypergraph for fast rendering.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| `userId` | UUID | FOREIGN KEY → user.id ON DELETE CASCADE | Owner of this node |
| `intersectionId` | UUID | FOREIGN KEY → intersection.id ON DELETE SET NULL, NULLABLE | Link to intersection (can be null if intersection deleted) |
| `parentId` | UUID | FOREIGN KEY → outlineNode.id ON DELETE CASCADE, NULLABLE | Self-referencing parent (null = root node) |
| `orderPosition` | INTEGER | NOT NULL | Position among siblings (0-indexed) |
| `isExpanded` | BOOLEAN | NOT NULL, DEFAULT TRUE | UI state: collapsed or expanded |
| `createdAt` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updatedAt` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes**:
- PRIMARY KEY on `id`
- INDEX on `userId` for fetching user's entire outline
- INDEX on `parentId` for fetching children of a node
- INDEX on (`parentId`, `orderPosition`) for ordered sibling queries

**Validation Rules**:
- `parentId` must not create cycles (enforced at application layer)
- `orderPosition` must be >= 0
- Max depth: 20 levels (enforced at application layer)

**Sample Data**:
```sql
INSERT INTO "pg-drizzle_outline_node" (id, userId, intersectionId, parentId, orderPosition, isExpanded)
VALUES
  ('n1', 'user1', 'i2', NULL, 0, TRUE),       -- Root: React > Hooks
  ('n2', 'user1', 'i1', 'n1', 0, TRUE);       -- Child: React > Hooks > Closure
```

---

## Data Integrity Rules

### 1. Atomic Set Uniqueness (Manifold Theory)
- **Rule**: Each atomic set name is globally unique per user
- **Enforcement**: UNIQUE constraint on `atomicSets.name`
- **Rationale**: Prevents duplicate concepts (e.g., two "React" atomic sets)

### 2. Intersection Element Consistency
- **Rule**: All atomic set IDs in `createdViaPath` must exist in `intersectionElements` for that intersection
- **Enforcement**: Application logic + database triggers (future)
- **Rationale**: Ensures mathematical consistency of hypergraph

### 3. Soft Deletion Preservation
- **Rule**: Deleted intersections remain in database with `isDeleted = TRUE`
- **Enforcement**: Application never hard-deletes intersections
- **Rationale**: Preserves manifold theory data integrity for historical queries

### 4. Tree Structure Integrity
- **Rule**: Outline nodes must form a valid tree (no cycles, single root per user)
- **Enforcement**: Application logic validates before writes
- **Rationale**: UI requires tree structure for rendering

---

## State Transitions

### Creating a New Outline Node

1. User types "React" in root → presses Enter → types "Hooks" → presses Tab
2. Application logic:
   - **Step 1**: Find or create atomic set "React" (id: a1)
   - **Step 2**: Find or create atomic set "Hooks" (id: a2)
   - **Step 3**: Create intersection with `createdViaPath = ["a1", "a2"]`
   - **Step 4**: Insert rows in `intersectionElements`: (i2, a1) and (i2, a2)
   - **Step 5**: Create outline node with `intersectionId = i2`, `parentId = n1`

### Deleting an Outline Node

1. User deletes node with Backspace
2. Application logic:
   - **Step 1**: Mark intersection as `isDeleted = TRUE` (soft delete)
   - **Step 2**: Set `outlineNode.intersectionId = NULL` (preserve tree structure)
   - **Step 3**: Delete outline node (CASCADE deletes all children)

### Moving a Node (Re-parenting)

1. User presses Tab to indent a node
2. Application logic:
   - **Step 1**: Update `outlineNode.parentId` to new parent
   - **Step 2**: Recalculate path from root to node
   - **Step 3**: Create new intersection with new path
   - **Step 4**: Update `outlineNode.intersectionId` to new intersection
   - **Step 5**: Mark old intersection as `isDeleted = TRUE`

---

## Query Patterns

### Fetch Entire Outline for User

```sql
SELECT
  n.id, n.parentId, n.orderPosition, n.isExpanded,
  i.content, i.createdViaPath
FROM "pg-drizzle_outline_node" n
LEFT JOIN "pg-drizzle_intersection" i ON n.intersectionId = i.id
WHERE n.userId = :userId
ORDER BY n.parentId NULLS FIRST, n.orderPosition ASC;
```

### Find All Intersections Containing Atomic Set (Inverted Index)

```sql
SELECT DISTINCT i.*
FROM "pg-drizzle_intersection" i
JOIN "pg-drizzle_intersection_element" ie ON i.id = ie.intersectionId
WHERE ie.atomicSetId = :atomicSetId
  AND i.userId = :userId
  AND i.isDeleted = FALSE;
```

### Get Node Path (Breadcrumb)

```sql
WITH RECURSIVE node_path AS (
  SELECT id, parentId, intersectionId, 0 AS depth
  FROM "pg-drizzle_outline_node"
  WHERE id = :nodeId

  UNION ALL

  SELECT n.id, n.parentId, n.intersectionId, np.depth + 1
  FROM "pg-drizzle_outline_node" n
  JOIN node_path np ON n.id = np.parentId
)
SELECT * FROM node_path ORDER BY depth DESC;
```

---

## Drizzle ORM Schema Code

See `research.md` Section 5 for the complete Drizzle schema definition with indexes and relations.

---

## Migration Strategy

### Initial Migration (001_create_outline_tables.sql)

```sql
-- Atomic Sets
CREATE TABLE "pg-drizzle_atomic_set" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  "userId" UUID NOT NULL REFERENCES "pg-drizzle_user"(id) ON DELETE CASCADE,
  metadata JSONB,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_atomic_set_user ON "pg-drizzle_atomic_set"("userId");

-- Intersections
CREATE TABLE "pg-drizzle_intersection" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "pg-drizzle_user"(id) ON DELETE CASCADE,
  "createdViaPath" JSONB NOT NULL,
  content TEXT,
  "isDeleted" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_intersection_user ON "pg-drizzle_intersection"("userId");
CREATE INDEX idx_intersection_deleted ON "pg-drizzle_intersection"("isDeleted");
CREATE INDEX idx_intersection_path ON "pg-drizzle_intersection" USING GIN("createdViaPath");

-- Intersection Elements (Junction)
CREATE TABLE "pg-drizzle_intersection_element" (
  "intersectionId" UUID NOT NULL REFERENCES "pg-drizzle_intersection"(id) ON DELETE CASCADE,
  "atomicSetId" UUID NOT NULL REFERENCES "pg-drizzle_atomic_set"(id) ON DELETE CASCADE,
  PRIMARY KEY ("intersectionId", "atomicSetId")
);

CREATE INDEX idx_intersection_element_atomic ON "pg-drizzle_intersection_element"("atomicSetId");

-- Outline Nodes
CREATE TABLE "pg-drizzle_outline_node" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "pg-drizzle_user"(id) ON DELETE CASCADE,
  "intersectionId" UUID REFERENCES "pg-drizzle_intersection"(id) ON DELETE SET NULL,
  "parentId" UUID REFERENCES "pg-drizzle_outline_node"(id) ON DELETE CASCADE,
  "orderPosition" INTEGER NOT NULL,
  "isExpanded" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_outline_node_user ON "pg-drizzle_outline_node"("userId");
CREATE INDEX idx_outline_node_parent ON "pg-drizzle_outline_node"("parentId");
CREATE INDEX idx_outline_node_parent_order ON "pg-drizzle_outline_node"("parentId", "orderPosition");
```

---

## Future Enhancements (Out of Scope for MVP)

- **Full-text search** on `intersection.content` using PostgreSQL `tsvector`
- **Versioning**: Add `intersectionHistory` table for undo/redo
- **Collaborative editing**: Add `intersectionLock` table for conflict resolution
- **Perspective switching**: Query intersections by atomic set and regenerate tree

---

## Summary

The data model implements a **sparse hypergraph** with:
- **AtomicSet**: Vertices (unique concepts)
- **Intersection**: Hyperedges (combinations of atomic sets)
- **IntersectionElement**: Junction table (inverted index)
- **OutlineNode**: Tree projection (denormalized for fast rendering)

This design satisfies all manifold theory principles while providing efficient queries for the outline editor UI.
