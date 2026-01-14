/**
 * tRPC router for intersection operations
 * Implements manifold theory hyperedges (set combinations)
 */

import { eq, and, inArray } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  intersections,
  intersectionElements,
  atomicSets,
} from "~/server/db/schema";
import {
  createIntersectionSchema,
  getIntersectionByIdSchema,
  findByAtomicSetsSchema,
  softDeleteIntersectionSchema,
} from "~/lib/outline/validation";

export const intersectionRouter = createTRPCRouter({
  /**
   * Create a new intersection (hyperedge) with atomic sets
   * Automatically creates junction table entries for inverted index
   */
  create: protectedProcedure
    .input(createIntersectionSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify all atomic sets exist and belong to user
      const atomicSetRecords = await ctx.db
        .select()
        .from(atomicSets)
        .where(
          and(
            eq(atomicSets.userId, ctx.session.user.id),
            inArray(atomicSets.id, input.atomicSetIds)
          )
        );

      if (atomicSetRecords.length !== input.atomicSetIds.length) {
        throw new Error("One or more atomic sets not found");
      }

      // Create intersection
      const newIntersection = await ctx.db
        .insert(intersections)
        .values({
          userId: ctx.session.user.id,
          createdViaPath: input.createdViaPath,
          content: input.content ?? null,
        })
        .returning();

      const intersection = newIntersection[0]!;

      // Create junction table entries (inverted index)
      await ctx.db.insert(intersectionElements).values(
        input.atomicSetIds.map((atomicSetId) => ({
          intersectionId: intersection.id,
          atomicSetId,
        }))
      );

      return intersection;
    }),

  /**
   * Get intersection by ID with its atomic sets
   */
  getById: protectedProcedure
    .input(getIntersectionByIdSchema)
    .query(async ({ ctx, input }) => {
      const intersection = await ctx.db
        .select()
        .from(intersections)
        .where(
          and(
            eq(intersections.id, input.id),
            eq(intersections.userId, ctx.session.user.id)
          )
        )
        .limit(1);

      if (intersection.length === 0) {
        throw new Error("Intersection not found");
      }

      // Get atomic sets for this intersection
      const elements = await ctx.db
        .select({
          atomicSet: atomicSets,
        })
        .from(intersectionElements)
        .innerJoin(
          atomicSets,
          eq(intersectionElements.atomicSetId, atomicSets.id)
        )
        .where(eq(intersectionElements.intersectionId, input.id));

      return {
        ...intersection[0]!,
        atomicSets: elements.map((e) => ({
          id: e.atomicSet.id,
          name: e.atomicSet.name,
        })),
      };
    }),

  /**
   * Find intersections containing specific atomic sets
   * Used for checking if an intersection already exists
   */
  findByAtomicSets: protectedProcedure
    .input(findByAtomicSetsSchema)
    .query(async ({ ctx, input }) => {
      // Get all intersections that contain at least one of the atomic sets
      const candidateIntersections = await ctx.db
        .selectDistinct({ intersectionId: intersectionElements.intersectionId })
        .from(intersectionElements)
        .where(inArray(intersectionElements.atomicSetId, input.atomicSetIds));

      if (candidateIntersections.length === 0) {
        return { intersections: [] };
      }

      // For each candidate, check if it contains ALL the required atomic sets
      const results = [];

      for (const candidate of candidateIntersections) {
        const elements = await ctx.db
          .select({ atomicSetId: intersectionElements.atomicSetId })
          .from(intersectionElements)
          .where(eq(intersectionElements.intersectionId, candidate.intersectionId));

        const atomicSetIds = elements.map((e) => e.atomicSetId);

        // Check if all required atomic sets are present
        const hasAllRequired = input.atomicSetIds.every((id) =>
          atomicSetIds.includes(id)
        );

        if (!hasAllRequired) {
          continue;
        }

        // If exactMatch is required, check set sizes match
        if (input.exactMatch && atomicSetIds.length !== input.atomicSetIds.length) {
          continue;
        }

        // Get intersection details
        const intersection = await ctx.db
          .select()
          .from(intersections)
          .where(
            and(
              eq(intersections.id, candidate.intersectionId),
              eq(intersections.userId, ctx.session.user.id),
              eq(intersections.isDeleted, false)
            )
          )
          .limit(1);

        if (intersection.length > 0) {
          results.push(intersection[0]!);
        }
      }

      return { intersections: results };
    }),

  /**
   * Soft delete intersection (mark as deleted, don't actually remove)
   * Preserves data for potential undo/history features
   */
  softDelete: protectedProcedure
    .input(softDeleteIntersectionSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .update(intersections)
        .set({ isDeleted: true })
        .where(
          and(
            eq(intersections.id, input.id),
            eq(intersections.userId, ctx.session.user.id)
          )
        )
        .returning();

      if (result.length === 0) {
        throw new Error("Intersection not found");
      }

      return result[0]!;
    }),
});
