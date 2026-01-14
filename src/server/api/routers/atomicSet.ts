/**
 * tRPC router for atomic set operations
 * Implements manifold theory vertices (concepts/tags)
 */

import { eq, and, asc } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { atomicSets } from "~/server/db/schema";
import {
  findOrCreateAtomicSetSchema,
  getAtomicSetByIdSchema,
} from "~/lib/outline/validation";

export const atomicSetRouter = createTRPCRouter({
  /**
   * Get all atomic sets for the current user
   * Returns sorted alphabetically by name
   */
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const results = await ctx.db
      .select()
      .from(atomicSets)
      .where(eq(atomicSets.userId, ctx.session.user.id))
      .orderBy(asc(atomicSets.name));

    return {
      atomicSets: results,
    };
  }),

  /**
   * Find existing atomic set by name or create new one
   * Ensures unique atomic sets per user (enforced by DB unique constraint)
   */
  findOrCreate: protectedProcedure
    .input(findOrCreateAtomicSetSchema)
    .mutation(async ({ ctx, input }) => {
      const trimmedName = input.name.trim();

      // Try to find existing atomic set
      const existing = await ctx.db
        .select()
        .from(atomicSets)
        .where(
          and(
            eq(atomicSets.userId, ctx.session.user.id),
            eq(atomicSets.name, trimmedName)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        return {
          ...existing[0]!,
          wasCreated: false,
        };
      }

      // Create new atomic set
      const newAtomicSet = await ctx.db
        .insert(atomicSets)
        .values({
          userId: ctx.session.user.id,
          name: trimmedName,
          metadata: input.metadata ?? null,
        })
        .returning();

      return {
        ...newAtomicSet[0]!,
        wasCreated: true,
      };
    }),

  /**
   * Get atomic set by ID
   */
  getById: protectedProcedure
    .input(getAtomicSetByIdSchema)
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select()
        .from(atomicSets)
        .where(
          and(
            eq(atomicSets.id, input.id),
            eq(atomicSets.userId, ctx.session.user.id)
          )
        )
        .limit(1);

      if (result.length === 0) {
        throw new Error("Atomic set not found");
      }

      return result[0]!;
    }),
});
