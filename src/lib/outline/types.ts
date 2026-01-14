/**
 * Shared TypeScript types for the Interfold outline editor
 * Based on sparse hypergraph architecture (Manifold theory)
 */

// ============================================================================
// Atomic Sets (Vertices in the hypergraph)
// ============================================================================

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

export interface FindOrCreateAtomicSetOutput extends AtomicSet {
  wasCreated: boolean; // true if newly created, false if existing
}

export interface UpdateAtomicSetMetadataInput {
  id: string;
  metadata: Record<string, unknown>;
}

export interface GetIntersectionsInput {
  atomicSetId: string;
}

// ============================================================================
// Intersections (Hyperedges in the hypergraph)
// ============================================================================

export interface Intersection {
  id: string;
  userId: string;
  createdViaPath: string[]; // Ordered array preserving user's perspective
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
  atomicSetIds: string[]; // Unordered set of atomic set IDs (1-20 items)
  createdViaPath: string[]; // Ordered path (same IDs, preserves user's perspective)
  content?: string; // Optional text content (max 5000 chars)
}

export interface UpdateIntersectionContentInput {
  id: string;
  content: string;
}

export interface SoftDeleteIntersectionInput {
  id: string;
}

export interface FindByAtomicSetsInput {
  atomicSetIds: string[]; // Find intersections containing ALL these sets
  exactMatch?: boolean; // Optional: require exact match (default: false)
}

export interface IntersectionStatistics {
  total: number; // Total intersections (including deleted)
  active: number; // Active intersections (isDeleted = false)
  deleted: number; // Soft-deleted intersections
  avgAtomicSetsPerIntersection: number; // Average cardinality
  maxDepth: number; // Longest createdViaPath length
}

// ============================================================================
// Outline Nodes (Tree structure projection)
// ============================================================================

export interface OutlineNode {
  id: string;
  userId: string;
  parentId: string | null; // null for root nodes
  content: string;
  orderIndex: number; // Position among siblings (0-based)
  isExpanded: boolean; // Collapse/expand state (UI)
  createdAt: Date;
  updatedAt: Date;
}

export interface OutlineNodeWithContent extends OutlineNode {
  intersectionId: string | null; // Associated intersection (if path exists)
}

export interface OutlineNodeWithChildren extends OutlineNode {
  children: OutlineNodeWithChildren[]; // Recursive structure for tree
  depth: number; // Distance from root (0 for root nodes)
}

export interface CreateOutlineNodeInput {
  parentId: string | null; // null for root nodes
  content: string; // Node text content (1-5000 chars)
  orderIndex?: number; // Optional: position among siblings (defaults to end)
}

export interface UpdateNodeContentInput {
  id: string;
  content: string; // New content (1-5000 chars)
}

export interface MoveNodeInput {
  id: string;
  newParentId: string | null; // null to move to root
  newOrderIndex: number; // Position among new siblings
}

export interface DeleteNodeInput {
  id: string;
}

export interface ReorderNodesInput {
  parentId: string | null; // Parent whose children to reorder (null for root)
  nodeIds: string[]; // Ordered array of node IDs (defines new order)
}

export interface ToggleExpandedInput {
  id: string;
}

// ============================================================================
// Query Outputs
// ============================================================================

export interface GetUserOutlineOutput {
  nodes: OutlineNodeWithChildren[]; // Root nodes with nested children
}

export interface GetNodePathOutput {
  path: Array<{
    id: string;
    content: string;
  }>; // Ordered array from root to target node
}

// ============================================================================
// Utility Types
// ============================================================================

export type NodePath = Array<{
  id: string;
  content: string;
}>;

export type TreeNode<T> = T & {
  children: TreeNode<T>[];
};
