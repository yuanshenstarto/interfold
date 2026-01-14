# tRPC Contract: Outline Router

**Router**: `outline`
**Path**: `src/server/api/routers/outline.ts`
**Date**: 2026-01-14

## Overview

The outline router provides type-safe CRUD operations for outline nodes, managing the tree structure displayed to users.

---

## Procedures

### 1. `getUserOutline`

**Type**: Query (public procedure → authenticated)
**Purpose**: Fetch the entire outline tree for the authenticated user

**Input**:
```typescript
// No input - uses ctx.session.user.id
```

**Output**:
```typescript
{
  nodes: Array<{
    id: string;
    parentId: string | null;
    orderPosition: number;
    isExpanded: boolean;
    content: string | null;        // From linked intersection
    createdViaPath: string[];      // From linked intersection
    createdAt: Date;
    updatedAt: Date;
  }>;
}
```

**Behavior**:
- Returns all outline nodes for the user, ordered by (parentId, orderPosition)
- Includes content and path from linked intersections via LEFT JOIN
- Returns empty array if user has no outline nodes
- Requires authentication (uses `protectedProcedure`)

**Errors**:
- `UNAUTHORIZED` if not authenticated

---

### 2. `createNode`

**Type**: Mutation (protected procedure)
**Purpose**: Create a new outline node and its corresponding intersection

**Input**:
```typescript
{
  parentId: string | null;         // null for root node
  orderPosition: number;           // Position among siblings
  content: string;                 // Text content (max 5000 chars)
}
```

**Output**:
```typescript
{
  node: {
    id: string;
    parentId: string | null;
    orderPosition: number;
    isExpanded: boolean;
    intersectionId: string;
    createdAt: Date;
    updatedAt: Date;
  };
  intersection: {
    id: string;
    createdViaPath: string[];
    content: string;
  };
  atomicSets: Array<{
    id: string;
    name: string;
  }>;
}
```

**Behavior**:
1. Calculate path from root to new node
2. Extract node names from path
3. Find or create atomic sets for each name
4. Create intersection with atomic sets and content
5. Create outline node linked to intersection
6. Return created entities

**Validation**:
- `content` must be 1-5000 characters
- `parentId` must exist and belong to user (if provided)
- `orderPosition` must be >= 0
- Max depth check: 20 levels

**Errors**:
- `UNAUTHORIZED` if not authenticated
- `BAD_REQUEST` if validation fails
- `NOT_FOUND` if parentId doesn't exist

---

### 3. `updateNodeContent`

**Type**: Mutation (protected procedure)
**Purpose**: Update text content of a node (creates new intersection if path changed)

**Input**:
```typescript
{
  nodeId: string;
  content: string;                 // New text content
}
```

**Output**:
```typescript
{
  node: {
    id: string;
    intersectionId: string;
    updatedAt: Date;
  };
  intersection: {
    id: string;
    content: string;
    updatedAt: Date;
  };
}
```

**Behavior**:
- Find node and its intersection
- Update intersection content
- Update node's updatedAt timestamp

**Validation**:
- `content` must be 1-5000 characters
- `nodeId` must exist and belong to user

**Errors**:
- `UNAUTHORIZED` if not authenticated
- `NOT_FOUND` if node doesn't exist
- `BAD_REQUEST` if content validation fails

---

### 4. `moveNode`

**Type**: Mutation (protected procedure)
**Purpose**: Move a node to a new parent (re-parenting / indenting)

**Input**:
```typescript
{
  nodeId: string;
  newParentId: string | null;      // null to make root
  newOrderPosition: number;        // Position among new siblings
}
```

**Output**:
```typescript
{
  node: {
    id: string;
    parentId: string | null;
    orderPosition: number;
    intersectionId: string;
    updatedAt: Date;
  };
  newIntersection: {
    id: string;
    createdViaPath: string[];
  };
  oldIntersectionId: string;       // Marked as deleted
}
```

**Behavior**:
1. Verify node belongs to user
2. Check for cycles (node can't be moved under its own descendant)
3. Calculate new path from root
4. Create new intersection with new path
5. Mark old intersection as isDeleted = true
6. Update node's parentId, orderPosition, intersectionId
7. Recursively update all descendant nodes' intersections

**Validation**:
- `nodeId` must exist and belong to user
- `newParentId` must exist and belong to user (if provided)
- No cycle creation allowed
- Max depth check: 20 levels after move

**Errors**:
- `UNAUTHORIZED` if not authenticated
- `NOT_FOUND` if node or newParent doesn't exist
- `BAD_REQUEST` if cycle would be created or max depth exceeded

---

### 5. `deleteNode`

**Type**: Mutation (protected procedure)
**Purpose**: Delete a node and all its descendants

**Input**:
```typescript
{
  nodeId: string;
}
```

**Output**:
```typescript
{
  deletedNodeIds: string[];        // IDs of deleted nodes (node + descendants)
  deletedIntersectionIds: string[]; // IDs of marked-deleted intersections
}
```

**Behavior**:
1. Find node and all descendants (recursive query)
2. Mark all linked intersections as isDeleted = true
3. Delete all nodes (CASCADE deletes descendants)
4. Return IDs for client-side cache invalidation

**Validation**:
- `nodeId` must exist and belong to user

**Errors**:
- `UNAUTHORIZED` if not authenticated
- `NOT_FOUND` if node doesn't exist

---

### 6. `reorderNodes`

**Type**: Mutation (protected procedure)
**Purpose**: Reorder siblings (batch update orderPosition)

**Input**:
```typescript
{
  parentId: string | null;         // Parent whose children to reorder
  nodeOrders: Array<{
    nodeId: string;
    newPosition: number;
  }>;
}
```

**Output**:
```typescript
{
  updatedNodes: Array<{
    id: string;
    orderPosition: number;
    updatedAt: Date;
  }>;
}
```

**Behavior**:
- Verify all nodes belong to same parent
- Update orderPosition for each node in transaction
- Return updated nodes

**Validation**:
- All `nodeId`s must exist and belong to user
- All nodes must share the same parentId
- Positions must be unique and sequential (0, 1, 2, ...)

**Errors**:
- `UNAUTHORIZED` if not authenticated
- `NOT_FOUND` if any node doesn't exist
- `BAD_REQUEST` if validation fails

---

### 7. `toggleExpanded`

**Type**: Mutation (protected procedure)
**Purpose**: Toggle node's expanded/collapsed state (UI only)

**Input**:
```typescript
{
  nodeId: string;
  isExpanded: boolean;
}
```

**Output**:
```typescript
{
  node: {
    id: string;
    isExpanded: boolean;
    updatedAt: Date;
  };
}
```

**Behavior**:
- Update node's isExpanded field
- No effect on intersections or atomic sets

**Validation**:
- `nodeId` must exist and belong to user

**Errors**:
- `UNAUTHORIZED` if not authenticated
- `NOT_FOUND` if node doesn't exist

---

## Shared Types (src/lib/outline/types.ts)

```typescript
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

export interface CreateNodeInput {
  parentId: string | null;
  orderPosition: number;
  content: string;
}

export interface UpdateNodeContentInput {
  nodeId: string;
  content: string;
}

export interface MoveNodeInput {
  nodeId: string;
  newParentId: string | null;
  newOrderPosition: number;
}

export interface DeleteNodeInput {
  nodeId: string;
}

export interface ReorderNodesInput {
  parentId: string | null;
  nodeOrders: Array<{
    nodeId: string;
    newPosition: number;
  }>;
}

export interface ToggleExpandedInput {
  nodeId: string;
  isExpanded: boolean;
}
```

---

## Usage Examples (Client)

### Fetch User's Outline

```typescript
import { api } from "~/trpc/react";

function OutlineEditor() {
  const { data, isLoading } = api.outline.getUserOutline.useQuery();

  if (isLoading) return <div>Loading...</div>;
  if (!data) return <div>No outline found</div>;

  return (
    <div>
      {data.nodes.map(node => (
        <OutlineNode key={node.id} node={node} />
      ))}
    </div>
  );
}
```

### Create New Node

```typescript
const createNode = api.outline.createNode.useMutation({
  onSuccess: () => {
    // Invalidate and refetch outline
    utils.outline.getUserOutline.invalidate();
  },
});

function handleCreateNode(parentId: string | null, content: string) {
  createNode.mutate({
    parentId,
    orderPosition: 0, // Will be calculated based on siblings
    content,
  });
}
```

### Auto-Save Content with Debounce

```typescript
import { useDebouncedCallback } from 'use-debounce';

const updateContent = api.outline.updateNodeContent.useMutation();

const debouncedSave = useDebouncedCallback((nodeId: string, content: string) => {
  updateContent.mutate({ nodeId, content });
}, 2000);

function handleContentChange(nodeId: string, content: string) {
  debouncedSave(nodeId, content);
}
```

---

## Performance Considerations

- **Batch Operations**: `reorderNodes` batches multiple updates in single transaction
- **Recursive Queries**: `moveNode` uses CTE for descendant lookup (efficient)
- **Indexing**: All queries use indexed columns (userId, parentId, orderPosition)
- **Caching**: TanStack Query caches `getUserOutline` result (refetch on mutation)

---

## Security

- All procedures require authentication via `protectedProcedure`
- User ID from `ctx.session.user.id` enforces row-level security
- No cross-user data access possible
- Input validation via Zod schemas

---

## Testing

See `tests/contract/outline.test.ts` for contract test examples.
