"use client";

/**
 * OutlineNode - individual editable node component
 * Features: debounced auto-save, keyboard shortcuts, visual save indicator
 */

import { useState, useEffect, useRef } from "react";
import { useDebouncedCallback } from "use-debounce";
import { api } from "~/trpc/react";
import { useOutlineKeyboard } from "~/lib/outline/useOutlineKeyboard";
import type { OutlineNodeWithChildren } from "~/lib/outline/types";

interface OutlineNodeProps {
  node: OutlineNodeWithChildren;
  depth: number;
  isFocused: boolean;
  onFocus: () => void;
  allNodes?: OutlineNodeWithChildren[]; // For finding siblings
}

export function OutlineNode({
  node,
  depth,
  isFocused,
  onFocus,
  allNodes = [],
}: OutlineNodeProps) {
  const [content, setContent] = useState(node.content);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "idle">(
    "saved"
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const utils = api.useUtils();

  // Update local state when node content changes from server
  useEffect(() => {
    setContent(node.content);
  }, [node.content]);

  // Mutation for updating node content
  const updateMutation = api.outline.updateNodeContent.useMutation({
    onMutate: () => {
      setSaveStatus("saving");
    },
    onSuccess: () => {
      setSaveStatus("saved");
      // Refetch to get latest data
      void utils.outline.getUserOutline.invalidate();
    },
    onError: (error) => {
      setSaveStatus("idle");
      console.error("Failed to save:", error);
    },
  });

  // Mutation for creating sibling node
  const createNodeMutation = api.outline.createNode.useMutation({
    onSuccess: () => {
      // Refetch outline after creating node
      void utils.outline.getUserOutline.invalidate();
    },
  });

  // Mutation for moving node (indent/outdent)
  const moveNodeMutation = api.outline.moveNode.useMutation({
    onSuccess: () => {
      // Refetch outline after moving node
      void utils.outline.getUserOutline.invalidate();
    },
  });

  // Helper: Find previous sibling node
  const findPreviousSibling = (): OutlineNodeWithChildren | null => {
    // Get all siblings (nodes with same parent)
    const siblings = allNodes.filter(n => n.parentId === node.parentId);
    const currentIndex = siblings.findIndex(n => n.id === node.id);

    if (currentIndex > 0) {
      return siblings[currentIndex - 1]!;
    }
    return null;
  };

  // Debounced auto-save (2 second delay)
  const debouncedSave = useDebouncedCallback((newContent: string) => {
    if (newContent.trim() && newContent !== node.content) {
      updateMutation.mutate({
        id: node.id,
        content: newContent,
      });
    } else if (newContent.trim()) {
      // Content is same, mark as saved
      setSaveStatus("saved");
    }
  }, 2000);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    setSaveStatus("idle");
    debouncedSave(newContent);
  };

  // Keyboard shortcuts
  const keyboardHandlers = useOutlineKeyboard({
    onEnter: () => {
      // Create sibling node after current node with blank content
      createNodeMutation.mutate({
        parentId: node.parentId,
        content: "",
        orderIndex: node.orderIndex + 1,
      });
    },
    onTab: () => {
      // Indent node: make it a child of previous sibling
      const previousSibling = findPreviousSibling();

      if (previousSibling) {
        // Move current node to be a child of previous sibling
        moveNodeMutation.mutate({
          id: node.id,
          newParentId: previousSibling.id,
          newOrderIndex: previousSibling.children.length, // Add as last child
        });
      }
    },
    onShiftTab: () => {
      // Outdent node: make it a sibling of parent
      if (node.parentId) {
        // TODO: Implement in Phase 4
        console.log("Shift+Tab pressed - outdent");
      }
    },
  });

  // Calculate indentation
  const indentClass = depth > 0 ? `ml-${depth * 6}` : "";

  return (
    <div className={`outline-node ${indentClass}`}>
      {/* Node input */}
      <div className="flex items-center gap-2">
        {/* Bullet point */}
        <span className="text-gray-400">•</span>

        {/* Content input */}
        <input
          ref={inputRef}
          type="text"
          value={content}
          onChange={handleChange}
          onFocus={onFocus}
          onKeyDown={keyboardHandlers.handleKeyDown}
          className={`
            flex-1 border-b border-transparent px-2 py-1 outline-none transition-colors
            hover:border-gray-200 focus:border-blue-500
            ${isFocused ? "bg-blue-50" : "bg-transparent"}
          `}
          placeholder="Enter note content..."
        />

        {/* Save status indicator */}
        {saveStatus !== "saved" && (
          <span
            className={`text-sm ${
              saveStatus === "saving" ? "text-blue-600" : "text-gray-400"
            }`}
          >
            {saveStatus === "saving" ? "Saving..." : ""}
          </span>
        )}
      </div>

      {/* Child nodes (recursive) */}
      {node.children.length > 0 && node.isExpanded && (
        <div className="ml-6 mt-1 space-y-1">
          {node.children.map((child) => (
            <OutlineNode
              key={child.id}
              node={child}
              depth={depth + 1}
              isFocused={false}
              onFocus={() => {}}
              allNodes={allNodes}
            />
          ))}
        </div>
      )}
    </div>
  );
}
