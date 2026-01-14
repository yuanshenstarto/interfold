# tRPC Contract: Intersection Router

**Router**: `intersection`
**Path**: `src/server/api/routers/intersection.ts`
**Date**: 2026-01-14

## Overview

The intersection router provides operations for managing intersections (hyperedges in the hypergraph). These represent specific combinations of atomic sets corresponding to paths in the outline.

---

## Procedures

### 1. `getAll`

**Type**: Query (protected procedure)
**Purpose**: Fetch all active intersections for the authenticated user

**Input**:
```typescript
{
  includeDeleted?: boolean;        // Optional: include soft-deleted (default: false)
}
```

**Output**:
```typescript
{
  intersections: Array<{
    id: string;
    createdViaPath: string[];      // Ordered array of atomic set IDs
    content: string | null;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
    atomicSets: Array<{            // Populated from junction table
      id: string;
      name: string;
    }>;
  }>;
}
```

**Behavior**:
- Returns all intersections belonging to user
- By default excludes soft-deleted (isDeleted = true)
- Includes atomic set names via JOIN on intersectionElements
- Ordered by createdAt descending

**Errors**:
- `UNAUTHORIZED` if not authenticated

---

### 2. `getById`

**Type**: Query (protected procedure)
**Purpose**: Fetch a single intersection by ID

**Input**:
```typescript
{
  id: string;
}
```

**Output**:
```typescript
{
  id: string;
  createdViaPath: string[];
  content: string | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  atomicSets: Array<{
    id: string;
    name: string;
  }>;
}
```

**Behavior**:
- Returns intersection if it exists and belongs to user
- Includes atomic sets from junction table
- Returns soft-deleted intersections (caller filters if needed)

**Errors**:
- `UNAUTHORIZED` if not authenticated
- `NOT_FOUND` if intersection doesn't exist or doesn't belong to user

---

### 3. `create`

**Type**: Mutation (protected procedure)
**Purpose**: Create a new intersection with atomic sets

**Input**:
```typescript
{
  atomicSetIds: string[];          // Array of atomic set IDs (1-20 items)
  createdViaPath: string[];        // Ordered path (same IDs, preserves user's perspective)
  content?: string;                // Optional text content (max 5000 chars)
}
```

**Output**:
```typescript
{
  id: string;
  createdViaPath: string[];
  content: string | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  atomicSets: Array<{
    id: string;
    name: string;
  }>;
}
```

**Behavior**:
1. Validate all atomic set IDs exist and belong to user
2. Create intersection record
3. Insert rows in intersectionElements junction table
4. Return created intersection with populated atomic sets

**Validation**:
- `atomicSetIds` must contain 1-20 valid atomic set IDs
- All atomic set IDs must belong to user
- `createdViaPath` must contain same IDs as `atomicSetIds` (order may differ)
- `content` max length: 5000 characters (if provided)

**Errors**:
- `UNAUTHORIZED` if not authenticated
- `BAD_REQUEST` if validation fails
- `NOT_FOUND` if any atomic set ID doesn't exist

---

### 4. `updateContent`

**Type**: Mutation (protected procedure)
**Purpose**: Update text content of an intersection

**Input**:
```typescript
{
  id: string;
  content: string;
}
```

**Output**:
```typescript
{
  id: string;
  content: string;
  updatedAt: Date;
}
```

**Behavior**:
- Updates content field
- Updates updatedAt timestamp
- Does not modify atomic sets or createdViaPath

**Validation**:
- `id` must exist and belong to user
- `content` must be 1-5000 characters

**Errors**:
- `UNAUTHORIZED` if not authenticated
- `NOT_FOUND` if intersection doesn't exist
- `BAD_REQUEST` if content validation fails

---

### 5. `softDelete`

**Type**: Mutation (protected procedure)
**Purpose**: Mark intersection as deleted (soft delete for data integrity)

**Input**:
```typescript
{
  id: string;
}
```

**Output**:
```typescript
{
  id: string;
  isDeleted: boolean;              // Always true
  updatedAt: Date;
}
```

**Behavior**:
- Sets isDeleted = true
- Updates updatedAt timestamp
- Does NOT delete from database (preserves manifold theory integrity)
- Junction table entries remain intact

**Usage**:
- Called by outline router when node deleted or path changed
- Preserves historical data for future features (undo, analytics)

**Errors**:
- `UNAUTHORIZED` if not authenticated
- `NOT_FOUND` if intersection doesn't exist

---

### 6. `findByAtomicSets`

**Type**: Query (protected procedure)
**Purpose**: Find intersections containing specific atomic set(s) - inverted index query

**Input**:
```typescript
{
  atomicSetIds: string[];          // Find intersections containing ALL these sets
  exactMatch?: boolean;            // Optional: require exact match (default: false)
}
```

**Output**:
```typescript
{
  intersections: Array<{
    id: string;
    createdViaPath: string[];
    content: string | null;
    createdAt: Date;
    atomicSets: Array<{
      id: string;
      name: string;
    }>;
  }>;
}
```

**Behavior**:
- If `exactMatch = false`: Returns intersections containing ALL specified atomic sets (may contain more)
- If `exactMatch = true`: Returns intersections containing EXACTLY the specified atomic sets (no more, no less)
- Excludes soft-deleted intersections
- Uses inverted index via intersectionElements table

**Usage**:
- Future: Perspective switching (find all intersections containing "React")
- Future: Duplicate detection (find existing intersection with same path)

**Errors**:
- `UNAUTHORIZED` if not authenticated

---

### 7. `getStatistics`

**Type**: Query (protected procedure)
**Purpose**: Get usage statistics for intersections

**Input**:
```typescript
// No input - uses ctx.session.user.id
```

**Output**:
```typescript
{
  total: number;                   // Total intersections (including deleted)
  active: number;                  // Active intersections (isDeleted = false)
  deleted: number;                 // Soft-deleted intersections
  avgAtomicSetsPerIntersection: number; // Average cardinality
  maxDepth: number;                // Longest createdViaPath length
}
```

**Behavior**:
- Aggregates statistics across all user's intersections
- Useful for debugging and future analytics

**Errors**:
- `UNAUTHORIZED` if not authenticated

---

## Shared Types (src/lib/outline/types.ts)

```typescript
export interface Intersection {
  id: string;
  userId: string;
  createdViaPath: string[];
  content: string | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IntersectionWithAtomicSets extends Intersection {
  atomicSets: Array<{
    id: string;
    name: string;
  }>;
}

export interface CreateIntersectionInput {
  atomicSetIds: string[];
  createdViaPath: string[];
  content?: string;
}

export interface UpdateIntersectionContentInput {
  id: string;
  content: string;
}

export interface SoftDeleteIntersectionInput {
  id: string;
}

export interface FindByAtomicSetsInput {
  atomicSetIds: string[];
  exactMatch?: boolean;
}

export interface IntersectionStatistics {
  total: number;
  active: number;
  deleted: number;
  avgAtomicSetsPerIntersection: number;
  maxDepth: number;
}
```

---

## Usage Examples (Client)

### List All Active Intersections

```typescript
import { api } from "~/trpc/react";

function IntersectionList() {
  const { data } = api.intersection.getAll.useQuery({ includeDeleted: false });

  return (
    <ul>
      {data?.intersections.map(intersection => (
        <li key={intersection.id}>
          Path: {intersection.atomicSets.map(s => s.name).join(' > ')}
          <br />
          Content: {intersection.content}
        </li>
      ))}
    </ul>
  );
}
```

### Find Intersections by Atomic Set (Perspective Switching)

```typescript
function PerspectiveView({ atomicSetId }: { atomicSetId: string }) {
  const { data } = api.intersection.findByAtomicSets.useQuery({
    atomicSetIds: [atomicSetId],
    exactMatch: false, // Find all intersections containing this set
  });

  return (
    <div>
      <h2>All paths containing this concept:</h2>
      {data?.intersections.map(intersection => (
        <div key={intersection.id}>
          {intersection.createdViaPath.join(' > ')}
        </div>
      ))}
    </div>
  );
}
```

### Usage Statistics (Debug Panel)

```typescript
function IntersectionStats() {
  const { data } = api.intersection.getStatistics.useQuery();

  return (
    <dl>
      <dt>Total Intersections:</dt>
      <dd>{data?.total}</dd>
      <dt>Active:</dt>
      <dd>{data?.active}</dd>
      <dt>Deleted:</dt>
      <dd>{data?.deleted}</dd>
      <dt>Avg Depth:</dt>
      <dd>{data?.avgAtomicSetsPerIntersection.toFixed(1)}</dd>
      <dt>Max Depth:</dt>
      <dd>{data?.maxDepth}</dd>
    </dl>
  );
}
```

---

## Performance Considerations

- **Inverted Index**: `findByAtomicSets` uses indexed `intersectionElements.atomicSetId`
- **Soft Deletes**: Adds `WHERE isDeleted = false` filter (indexed)
- **JOIN Strategy**: Uses efficient INNER JOIN via junction table
- **Pagination**: Future enhancement for large result sets (> 1000 intersections)

---

## Security

- All procedures require authentication via `protectedProcedure`
- User ID from `ctx.session.user.id` enforces row-level security
- Atomic sets must belong to user (validated on create)
- No cross-user data access possible

---

## Manifold Theory Compliance

- **Sparse Hypergraph**: Only user-created intersections exist (no automatic subset generation)
- **Soft Deletion**: Preserves data integrity (deleted intersections remain in database)
- **Ordered vs. Unordered**: `atomicSetIds` are unordered sets mathematically, `createdViaPath` preserves user's order
- **Reusability**: Same atomic sets can appear in multiple intersections

---

## Future Enhancements (Out of Scope for MVP)

- **Versioning**: Add `intersectionHistory` table for undo/redo
- **Collaboration**: Add conflict resolution for concurrent edits
- **Full-Text Search**: Index `content` field with PostgreSQL tsvector
- **Batch Operations**: `bulkSoftDelete` for performance

---

## Testing

See `tests/contract/intersection.test.ts` for contract test examples:
- Create intersection with atomic sets
- Update content
- Soft delete behavior
- Inverted index queries (findByAtomicSets)
- Statistics aggregation
