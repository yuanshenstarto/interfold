/**
 * Contract tests for outline tRPC router
 * Tests the API contract without implementation details
 * Following test-first development: these tests should FAIL initially
 */

import { describe, it, expect, beforeEach } from "vitest";
import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import { appRouter } from "~/server/api/root";
import { createMockTRPCContext } from "../utils/trpc";

type RouterInput = inferRouterInputs<typeof appRouter>;
type RouterOutput = inferRouterOutputs<typeof appRouter>;

describe("outline.getUserOutline", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeEach(() => {
    const ctx = createMockTRPCContext({
      userId: "test-user-outline-1",
      userName: "Outline Test User",
      userEmail: "outline@example.com",
    });

    caller = appRouter.createCaller(ctx);
  });

  it("should return empty array when no nodes exist", async () => {
    const result: RouterOutput["outline"]["getUserOutline"] =
      await caller.outline.getUserOutline();

    expect(result.nodes).toEqual([]);
  });

  it("should return hierarchical tree structure", async () => {
    // Create root node
    const root = await caller.outline.createNode({
      parentId: null,
      content: "Root Node",
    });

    // Create child node
    const child = await caller.outline.createNode({
      parentId: root.id,
      content: "Child Node",
    });

    const result = await caller.outline.getUserOutline();

    expect(result.nodes).toHaveLength(1); // One root node
    expect(result.nodes[0]!.content).toBe("Root Node");
    expect(result.nodes[0]!.children).toHaveLength(1);
    expect(result.nodes[0]!.children[0]!.content).toBe("Child Node");
  });

  it("should return nodes sorted by orderIndex", async () => {
    // Create nodes with specific order
    await caller.outline.createNode({
      parentId: null,
      content: "Node 3",
      orderIndex: 2,
    });
    await caller.outline.createNode({
      parentId: null,
      content: "Node 1",
      orderIndex: 0,
    });
    await caller.outline.createNode({
      parentId: null,
      content: "Node 2",
      orderIndex: 1,
    });

    const result = await caller.outline.getUserOutline();

    const contents = result.nodes.map((n) => n.content);
    expect(contents).toEqual(["Node 1", "Node 2", "Node 3"]);
  });
});

describe("outline.createNode", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeEach(() => {
    const ctx = createMockTRPCContext({
      userId: "test-user-create-1",
      userName: "Create Test User",
      userEmail: "create@example.com",
    });

    caller = appRouter.createCaller(ctx);
  });

  it("should create a root node", async () => {
    const input: RouterInput["outline"]["createNode"] = {
      parentId: null,
      content: "My First Note",
    };

    const result: RouterOutput["outline"]["createNode"] =
      await caller.outline.createNode(input);

    expect(result.id).toBeDefined();
    expect(result.parentId).toBeNull();
    expect(result.content).toBe("My First Note");
    expect(result.userId).toBe("test-user-create-1");
    expect(result.orderIndex).toBe(0); // First root node
    expect(result.isExpanded).toBe(true); // Default expanded
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  it("should create a child node", async () => {
    // Create parent first
    const parent = await caller.outline.createNode({
      parentId: null,
      content: "Parent",
    });

    // Create child
    const child = await caller.outline.createNode({
      parentId: parent.id,
      content: "Child",
    });

    expect(child.parentId).toBe(parent.id);
    expect(child.orderIndex).toBe(0); // First child of parent
  });

  it("should auto-increment orderIndex for siblings", async () => {
    // Create three sibling nodes
    const node1 = await caller.outline.createNode({
      parentId: null,
      content: "Node 1",
    });
    const node2 = await caller.outline.createNode({
      parentId: null,
      content: "Node 2",
    });
    const node3 = await caller.outline.createNode({
      parentId: null,
      content: "Node 3",
    });

    expect(node1.orderIndex).toBe(0);
    expect(node2.orderIndex).toBe(1);
    expect(node3.orderIndex).toBe(2);
  });

  it("should respect custom orderIndex", async () => {
    const node = await caller.outline.createNode({
      parentId: null,
      content: "Custom Order",
      orderIndex: 5,
    });

    expect(node.orderIndex).toBe(5);
  });

  it("should trim whitespace from content", async () => {
    const node = await caller.outline.createNode({
      parentId: null,
      content: "  Trimmed Content  ",
    });

    expect(node.content).toBe("Trimmed Content");
  });

  it("should reject empty content", async () => {
    await expect(
      caller.outline.createNode({
        parentId: null,
        content: "",
      })
    ).rejects.toThrow();
  });

  it("should reject content exceeding 5000 characters", async () => {
    await expect(
      caller.outline.createNode({
        parentId: null,
        content: "a".repeat(5001),
      })
    ).rejects.toThrow();
  });

  it("should reject invalid parent ID", async () => {
    await expect(
      caller.outline.createNode({
        parentId: "non-existent-id",
        content: "Test",
      })
    ).rejects.toThrow();
  });
});

describe("outline.updateNodeContent", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeEach(() => {
    const ctx = createMockTRPCContext({
      userId: "test-user-update-1",
      userName: "Update Test User",
      userEmail: "update@example.com",
    });

    caller = appRouter.createCaller(ctx);
  });

  it("should update node content", async () => {
    // Create node
    const node = await caller.outline.createNode({
      parentId: null,
      content: "Original Content",
    });

    // Update content
    const input: RouterInput["outline"]["updateNodeContent"] = {
      id: node.id,
      content: "Updated Content",
    };

    const result: RouterOutput["outline"]["updateNodeContent"] =
      await caller.outline.updateNodeContent(input);

    expect(result.id).toBe(node.id);
    expect(result.content).toBe("Updated Content");
    expect(result.updatedAt.getTime()).toBeGreaterThan(node.updatedAt.getTime());
  });

  it("should trim whitespace from updated content", async () => {
    const node = await caller.outline.createNode({
      parentId: null,
      content: "Original",
    });

    const result = await caller.outline.updateNodeContent({
      id: node.id,
      content: "  Updated  ",
    });

    expect(result.content).toBe("Updated");
  });

  it("should reject empty content", async () => {
    const node = await caller.outline.createNode({
      parentId: null,
      content: "Original",
    });

    await expect(
      caller.outline.updateNodeContent({
        id: node.id,
        content: "",
      })
    ).rejects.toThrow();
  });

  it("should reject content exceeding 5000 characters", async () => {
    const node = await caller.outline.createNode({
      parentId: null,
      content: "Original",
    });

    await expect(
      caller.outline.updateNodeContent({
        id: node.id,
        content: "a".repeat(5001),
      })
    ).rejects.toThrow();
  });

  it("should reject invalid node ID", async () => {
    await expect(
      caller.outline.updateNodeContent({
        id: "non-existent-id",
        content: "Updated",
      })
    ).rejects.toThrow();
  });

  it("should only update nodes belonging to the user", async () => {
    // Create node with different user
    const otherUserCtx = createMockTRPCContext({
      userId: "other-user",
      userName: "Other User",
      userEmail: "other@example.com",
    });

    const otherCaller = appRouter.createCaller(otherUserCtx);
    const otherNode = await otherCaller.outline.createNode({
      parentId: null,
      content: "Other User's Node",
    });

    // Try to update with current user (should fail)
    await expect(
      caller.outline.updateNodeContent({
        id: otherNode.id,
        content: "Malicious Update",
      })
    ).rejects.toThrow();
  });
});
