/**
 * Utility functions for the Interfold outline editor
 * Includes path calculation and tree manipulation helpers
 */

import type { OutlineNode, OutlineNodeWithChildren } from "./types";

/**
 * Calculate the full path from root to a specific node
 * Returns an array of node IDs from root to target (inclusive)
 *
 * @param nodeId - Target node ID
 * @param nodesMap - Map of all nodes by ID
 * @returns Ordered array of node IDs from root to target
 */
export function calculatePathFromRoot(
  nodeId: string,
  nodesMap: Map<string, OutlineNode>
): string[] {
  const path: string[] = [];
  let currentId: string | null = nodeId;

  // Walk up the tree until we reach a root node (parentId === null)
  while (currentId !== null) {
    const node = nodesMap.get(currentId);
    if (!node) {
      throw new Error(`Node not found: ${currentId}`);
    }

    path.unshift(currentId); // Add to beginning of path
    currentId = node.parentId;
  }

  return path;
}

/**
 * Build a hierarchical tree structure from flat array of nodes
 * Uses parentId relationships to create nested children arrays
 *
 * @param nodes - Flat array of outline nodes
 * @returns Root nodes with nested children (tree structure)
 */
export function buildTree(nodes: OutlineNode[]): OutlineNodeWithChildren[] {
  // Create a map for O(1) lookups
  const nodesMap = new Map<string, OutlineNodeWithChildren>();
  const rootNodes: OutlineNodeWithChildren[] = [];

  // Initialize all nodes with empty children array
  for (const node of nodes) {
    nodesMap.set(node.id, {
      ...node,
      children: [],
      depth: 0, // Will be calculated later
    });
  }

  // Build parent-child relationships
  for (const node of nodes) {
    const nodeWithChildren = nodesMap.get(node.id)!;

    if (node.parentId === null) {
      // Root node
      rootNodes.push(nodeWithChildren);
    } else {
      // Child node - add to parent's children array
      const parent = nodesMap.get(node.parentId);
      if (parent) {
        parent.children.push(nodeWithChildren);
      }
    }
  }

  // Sort children by orderIndex
  function sortChildren(node: OutlineNodeWithChildren, depth = 0) {
    node.depth = depth;
    node.children.sort((a, b) => a.orderIndex - b.orderIndex);
    for (const child of node.children) {
      sortChildren(child, depth + 1);
    }
  }

  // Sort root nodes and recursively sort all children
  rootNodes.sort((a, b) => a.orderIndex - b.orderIndex);
  for (const root of rootNodes) {
    sortChildren(root);
  }

  return rootNodes;
}

/**
 * Flatten a tree structure back to a flat array
 * Useful for bulk operations on all nodes
 *
 * @param roots - Root nodes with nested children
 * @returns Flat array of all nodes
 */
export function flattenTree(roots: OutlineNodeWithChildren[]): OutlineNode[] {
  const flattened: OutlineNode[] = [];

  function traverse(node: OutlineNodeWithChildren) {
    // Exclude children and depth from flattened result
    const { children, depth, ...flatNode } = node;
    flattened.push(flatNode);

    for (const child of children) {
      traverse(child);
    }
  }

  for (const root of roots) {
    traverse(root);
  }

  return flattened;
}

/**
 * Get all sibling nodes (nodes with same parent)
 *
 * @param nodeId - Target node ID
 * @param nodes - All outline nodes
 * @returns Array of sibling nodes (including target node)
 */
export function getSiblings(
  nodeId: string,
  nodes: OutlineNode[]
): OutlineNode[] {
  const targetNode = nodes.find((n) => n.id === nodeId);
  if (!targetNode) {
    throw new Error(`Node not found: ${nodeId}`);
  }

  return nodes
    .filter((n) => n.parentId === targetNode.parentId)
    .sort((a, b) => a.orderIndex - b.orderIndex);
}

/**
 * Get the next available orderIndex for a new child node
 *
 * @param parentId - Parent node ID (or null for root)
 * @param nodes - All outline nodes
 * @returns Next available orderIndex
 */
export function getNextOrderIndex(
  parentId: string | null,
  nodes: OutlineNode[]
): number {
  const siblings = nodes.filter((n) => n.parentId === parentId);
  if (siblings.length === 0) {
    return 0;
  }

  return Math.max(...siblings.map((n) => n.orderIndex)) + 1;
}

/**
 * Reorder siblings after a node is moved or deleted
 * Ensures orderIndex values are sequential (0, 1, 2, ...)
 *
 * @param parentId - Parent node ID (or null for root)
 * @param nodes - All outline nodes
 * @returns Updated nodes with corrected orderIndex
 */
export function reorderSiblings(
  parentId: string | null,
  nodes: OutlineNode[]
): OutlineNode[] {
  const siblings = nodes.filter((n) => n.parentId === parentId);
  const nonSiblings = nodes.filter((n) => n.parentId !== parentId);

  // Sort by current orderIndex
  siblings.sort((a, b) => a.orderIndex - b.orderIndex);

  // Reassign sequential orderIndex
  const reorderedSiblings = siblings.map((node, index) => ({
    ...node,
    orderIndex: index,
  }));

  return [...nonSiblings, ...reorderedSiblings];
}

/**
 * Extract node content (text) from a path of nodes
 * Used to create atomic set names from outline paths
 *
 * @param path - Array of node IDs
 * @param nodesMap - Map of all nodes by ID
 * @returns Array of node content strings
 */
export function getContentFromPath(
  path: string[],
  nodesMap: Map<string, OutlineNode>
): string[] {
  return path.map((nodeId) => {
    const node = nodesMap.get(nodeId);
    if (!node) {
      throw new Error(`Node not found: ${nodeId}`);
    }
    return node.content;
  });
}

/**
 * Check if a node is an ancestor of another node
 * Prevents circular parent-child relationships
 *
 * @param ancestorId - Potential ancestor node ID
 * @param descendantId - Potential descendant node ID
 * @param nodesMap - Map of all nodes by ID
 * @returns True if ancestorId is an ancestor of descendantId
 */
export function isAncestor(
  ancestorId: string,
  descendantId: string,
  nodesMap: Map<string, OutlineNode>
): boolean {
  let currentId: string | null = descendantId;

  while (currentId !== null) {
    if (currentId === ancestorId) {
      return true;
    }

    const node = nodesMap.get(currentId);
    if (!node) {
      break;
    }

    currentId = node.parentId;
  }

  return false;
}
