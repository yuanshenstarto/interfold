"use client";

/**
 * OutlineEditor - main container component for outline editing
 * Fetches and manages the outline tree structure
 */

import { api } from "~/trpc/react";
import { OutlineNode } from "./OutlineNode";
import { useState } from "react";
import type { OutlineNodeWithChildren } from "~/lib/outline/types";

// Flatten tree to get all nodes for sibling lookup
function flattenNodes(nodes: OutlineNodeWithChildren[]): OutlineNodeWithChildren[] {
  const result: OutlineNodeWithChildren[] = [];
  for (const node of nodes) {
    result.push(node);
    if (node.children.length > 0) {
      result.push(...flattenNodes(node.children));
    }
  }
  return result;
}

export function OutlineEditor() {
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);

  // Fetch user's outline
  const { data, isLoading, error } = api.outline.getUserOutline.useQuery();

  // Mutations
  const createNodeMutation = api.outline.createNode.useMutation({
    onSuccess: () => {
      // Refetch outline after creating node
      void utils.outline.getUserOutline.invalidate();
    },
  });

  const utils = api.useUtils();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading your outline...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-red-800">Error loading outline: {error.message}</p>
      </div>
    );
  }

  const nodes = data?.nodes ?? [];
  const allNodes = flattenNodes(nodes);

  // Handle creating the first root node
  const handleCreateRootNode = () => {
    createNodeMutation.mutate({
      parentId: null,
      content: "",
    });
  };

  if (nodes.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
        <p className="mb-4 text-gray-600">
          Your outline is empty. Start by creating your first note.
        </p>
        <button
          onClick={handleCreateRootNode}
          disabled={createNodeMutation.isPending}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {createNodeMutation.isPending ? "Creating..." : "Create First Note"}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="space-y-1">
        {nodes.map((node) => (
          <OutlineNode
            key={node.id}
            node={node}
            depth={0}
            isFocused={focusedNodeId === node.id}
            onFocus={() => setFocusedNodeId(node.id)}
            allNodes={allNodes}
          />
        ))}
      </div>
    </div>
  );
}
