/**
 * Contract tests for atomicSet tRPC router
 * Tests the API contract without implementation details
 * Following test-first development: these tests should FAIL initially
 */

import { describe, it, expect, beforeEach } from "vitest";
import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import { appRouter } from "~/server/api/root";
import { createMockTRPCContext } from "../utils/trpc";

type RouterInput = inferRouterInputs<typeof appRouter>;
type RouterOutput = inferRouterOutputs<typeof appRouter>;

describe("atomicSet.findOrCreate", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeEach(() => {
    // Create authenticated context with test user
    const ctx = createMockTRPCContext({
      userId: "test-user-123",
      userName: "Test User",
      userEmail: "test@example.com",
    });

    caller = appRouter.createCaller(ctx);
  });

  it("should create a new atomic set when name doesn't exist", async () => {
    const input: RouterInput["atomicSet"]["findOrCreate"] = {
      name: "React",
    };

    const result: RouterOutput["atomicSet"]["findOrCreate"] =
      await caller.atomicSet.findOrCreate(input);

    expect(result.id).toBeDefined();
    expect(result.name).toBe("React");
    expect(result.userId).toBe("test-user-123");
    expect(result.wasCreated).toBe(true);
    expect(result.createdAt).toBeInstanceOf(Date);
  });

  it("should return existing atomic set when name already exists", async () => {
    const input: RouterInput["atomicSet"]["findOrCreate"] = {
      name: "Hooks",
    };

    // First call - creates new atomic set
    const firstResult = await caller.atomicSet.findOrCreate(input);
    expect(firstResult.wasCreated).toBe(true);

    // Second call - returns existing atomic set
    const secondResult = await caller.atomicSet.findOrCreate(input);
    expect(secondResult.wasCreated).toBe(false);
    expect(secondResult.id).toBe(firstResult.id);
    expect(secondResult.name).toBe(firstResult.name);
  });

  it("should create atomic set with metadata", async () => {
    const input: RouterInput["atomicSet"]["findOrCreate"] = {
      name: "JavaScript",
      metadata: { category: "language", level: "advanced" },
    };

    const result = await caller.atomicSet.findOrCreate(input);

    expect(result.metadata).toEqual({
      category: "language",
      level: "advanced",
    });
  });

  it("should trim whitespace from name", async () => {
    const input: RouterInput["atomicSet"]["findOrCreate"] = {
      name: "  TypeScript  ",
    };

    const result = await caller.atomicSet.findOrCreate(input);

    expect(result.name).toBe("TypeScript");
  });

  it("should reject empty name", async () => {
    const input: RouterInput["atomicSet"]["findOrCreate"] = {
      name: "",
    };

    await expect(caller.atomicSet.findOrCreate(input)).rejects.toThrow();
  });

  it("should reject name exceeding 200 characters", async () => {
    const input: RouterInput["atomicSet"]["findOrCreate"] = {
      name: "a".repeat(201),
    };

    await expect(caller.atomicSet.findOrCreate(input)).rejects.toThrow();
  });
});

describe("atomicSet.getAll", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeEach(() => {
    const ctx = createMockTRPCContext({
      userId: "test-user-456",
      userName: "Test User 2",
      userEmail: "test2@example.com",
    });

    caller = appRouter.createCaller(ctx);
  });

  it("should return empty array when no atomic sets exist", async () => {
    const result: RouterOutput["atomicSet"]["getAll"] =
      await caller.atomicSet.getAll();

    expect(result.atomicSets).toEqual([]);
  });

  it("should return all atomic sets for user", async () => {
    // Create some atomic sets
    await caller.atomicSet.findOrCreate({ name: "React" });
    await caller.atomicSet.findOrCreate({ name: "Vue" });
    await caller.atomicSet.findOrCreate({ name: "Angular" });

    const result = await caller.atomicSet.getAll();

    expect(result.atomicSets).toHaveLength(3);
    expect(result.atomicSets.map((s) => s.name)).toContain("React");
    expect(result.atomicSets.map((s) => s.name)).toContain("Vue");
    expect(result.atomicSets.map((s) => s.name)).toContain("Angular");
  });

  it("should return atomic sets sorted alphabetically", async () => {
    await caller.atomicSet.findOrCreate({ name: "Zebra" });
    await caller.atomicSet.findOrCreate({ name: "Apple" });
    await caller.atomicSet.findOrCreate({ name: "Mango" });

    const result = await caller.atomicSet.getAll();

    const names = result.atomicSets.map((s) => s.name);
    expect(names).toEqual(["Apple", "Mango", "Zebra"]);
  });
});
