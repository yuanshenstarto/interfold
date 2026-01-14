# tRPC Contract: AtomicSet Router

**Router**: `atomicSet`
**Path**: `src/server/api/routers/atomicSet.ts`
**Date**: 2026-01-14

## Overview

The atomicSet router provides operations for managing atomic sets (vertices in the hypergraph). These represent unique concepts/tags used in intersections.

---

## Procedures

### 1. `getAll`

**Type**: Query (protected procedure)
**Purpose**: Fetch all atomic sets for the authenticated user

**Input**:
```typescript
// No input - uses ctx.session.user.id
```

**Output**:
```typescript
{
  atomicSets: Array<{
    id: string;
    name: string;
    metadata: Record<string, unknown> | null;
    createdAt: Date;
  }>;
}
```

**Behavior**:
- Returns all atomic sets belonging to the user
- Ordered by name (alphabetical)
- Returns empty array if no atomic sets exist

**Errors**:
- `UNAUTHORIZED` if not authenticated

---

### 2. `getById`

**Type**: Query (protected procedure)
**Purpose**: Fetch a single atomic set by ID

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
  name: string;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}
```

**Behavior**:
- Returns atomic set if it exists and belongs to user
- Includes metadata if present

**Errors**:
- `UNAUTHORIZED` if not authenticated
- `NOT_FOUND` if atomic set doesn't exist or doesn't belong to user

---

### 3. `getByName`

**Type**: Query (protected procedure)
**Purpose**: Fetch an atomic set by exact name match

**Input**:
```typescript
{
  name: string;
}
```

**Output**:
```typescript
{
  id: string;
  name: string;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
} | null
```

**Behavior**:
- Returns atomic set if name matches (case-sensitive)
- Returns `null` if no match found
- Used internally by outline router to find or create atomic sets

**Errors**:
- `UNAUTHORIZED` if not authenticated

---

### 4. `create`

**Type**: Mutation (protected procedure)
**Purpose**: Create a new atomic set

**Input**:
```typescript
{
  name: string;                    // Unique display name (1-200 chars)
  metadata?: Record<string, unknown>; // Optional metadata (max 1KB)
}
```

**Output**:
```typescript
{
  id: string;
  name: string;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}
```

**Behavior**:
- Creates atomic set with given name
- Enforces uniqueness via database constraint
- Returns created atomic set

**Validation**:
- `name` must be 1-200 characters
- `name` must not be empty or whitespace-only
- `name` must be unique per user
- `metadata` max size: 1KB (if provided)

**Errors**:
- `UNAUTHORIZED` if not authenticated
- `CONFLICT` if atomic set with same name already exists
- `BAD_REQUEST` if validation fails

---

### 5. `findOrCreate`

**Type**: Mutation (protected procedure)
**Purpose**: Find atomic set by name, or create if doesn't exist (idempotent)

**Input**:
```typescript
{
  name: string;
  metadata?: Record<string, unknown>;
}
```

**Output**:
```typescript
{
  id: string;
  name: string;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  wasCreated: boolean;             // true if newly created, false if existing
}
```

**Behavior**:
- Check if atomic set with name exists for user
- If exists: return existing atomic set
- If not exists: create new atomic set
- Idempotent operation (safe to call multiple times)

**Usage**:
- Primary operation used by outline router when creating nodes
- Ensures no duplicate atomic sets for same concept

**Errors**:
- `UNAUTHORIZED` if not authenticated
- `BAD_REQUEST` if validation fails

---

### 6. `updateMetadata`

**Type**: Mutation (protected procedure)
**Purpose**: Update metadata for an atomic set (name is immutable)

**Input**:
```typescript
{
  id: string;
  metadata: Record<string, unknown>;
}
```

**Output**:
```typescript
{
  id: string;
  name: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
}
```

**Behavior**:
- Updates metadata field (replaces entire object)
- Name cannot be changed (immutability per manifold theory)

**Validation**:
- `id` must exist and belong to user
- `metadata` max size: 1KB

**Errors**:
- `UNAUTHORIZED` if not authenticated
- `NOT_FOUND` if atomic set doesn't exist
- `BAD_REQUEST` if metadata too large

---

### 7. `getIntersections`

**Type**: Query (protected procedure)
**Purpose**: Find all intersections containing a specific atomic set (inverted index query)

**Input**:
```typescript
{
  atomicSetId: string;
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
  }>;
}
```

**Behavior**:
- Uses inverted index (intersectionElements table)
- Returns all intersections where this atomic set appears
- Excludes soft-deleted intersections (isDeleted = true)
- Ordered by createdAt descending

**Usage**:
- Future: Enable perspective switching by atomic set
- Future: Show "where is this concept used?"

**Errors**:
- `UNAUTHORIZED` if not authenticated
- `NOT_FOUND` if atomic set doesn't exist

---

## Shared Types (src/lib/outline/types.ts)

```typescript
export interface AtomicSet {
  id: string;
  name: string;
  userId: string;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

export interface CreateAtomicSetInput {
  name: string;
  metadata?: Record<string, unknown>;
}

export interface FindOrCreateAtomicSetInput {
  name: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateAtomicSetMetadataInput {
  id: string;
  metadata: Record<string, unknown>;
}

export interface GetIntersectionsInput {
  atomicSetId: string;
}
```

---

## Usage Examples (Client)

### List All Atomic Sets

```typescript
import { api } from "~/trpc/react";

function AtomicSetList() {
  const { data, isLoading } = api.atomicSet.getAll.useQuery();

  if (isLoading) return <div>Loading...</div>;

  return (
    <ul>
      {data?.atomicSets.map(set => (
        <li key={set.id}>{set.name}</li>
      ))}
    </ul>
  );
}
```

### Find or Create (Idempotent)

```typescript
const findOrCreate = api.atomicSet.findOrCreate.useMutation();

function handleCreateNode(nodeText: string) {
  // Idempotent: safe to call multiple times with same name
  findOrCreate.mutate({ name: nodeText }, {
    onSuccess: (data) => {
      console.log(data.wasCreated ? 'Created new' : 'Found existing');
    }
  });
}
```

### Show Where Atomic Set is Used (Future Feature)

```typescript
function AtomicSetUsage({ atomicSetId }: { atomicSetId: string }) {
  const { data } = api.atomicSet.getIntersections.useQuery({ atomicSetId });

  return (
    <div>
      <h3>Used in {data?.intersections.length} places:</h3>
      <ul>
        {data?.intersections.map(intersection => (
          <li key={intersection.id}>
            Path: {intersection.createdViaPath.join(' > ')}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## Performance Considerations

- **Unique Constraint**: Database ensures no duplicates (fast index lookup)
- **Inverted Index**: `getIntersections` uses indexed `intersectionElements.atomicSetId`
- **Alphabetical Sort**: `getAll` sorted by name for predictable order
- **Metadata Size Limit**: 1KB prevents large payloads

---

## Security

- All procedures require authentication via `protectedProcedure`
- User ID from `ctx.session.user.id` enforces row-level security
- Atomic set names are user-scoped (different users can have same names)
- No cross-user access possible

---

## Manifold Theory Compliance

- **Immutability**: Atomic set names cannot be changed (once created, identity is fixed)
- **Uniqueness**: One atomic set per concept per user (enforced by database)
- **Reusability**: Same atomic set can appear in multiple intersections
- **Metadata Flexibility**: Metadata allows future extensions without schema changes

---

## Testing

See `tests/contract/atomicSet.test.ts` for contract test examples:
- Create atomic set
- Find or create (idempotent behavior)
- Unique constraint violation handling
- Inverted index queries
