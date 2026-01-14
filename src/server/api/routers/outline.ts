/**
 * tRPC router for outline node operations
 * Implements tree structure projection of the hypergraph
 */

import { eq, and, isNull, asc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { outlineNodes } from "~/server/db/schema";
import {
  createOutlineNodeSchema,
  updateNodeContentSchema,
  getNodeByIdSchema,
} from "~/lib/outline/validation";
import { buildTree, getNextOrderIndex } from "~/lib/outline/utils";

export const outlineRouter = createTRPCRouter({
  /**
   * Get user's complete outline as hierarchical tree
   * Returns root nodes with nested children
   */
  getUserOutline: protectedProcedure.query(async ({ ctx }) => {
    const allNodes = await ctx.db
      .select()
      .from(outlineNodes)
      .where(eq(outlineNodes.userId, ctx.session.user.id))
      .orderBy(asc(outlineNodes.orderIndex));

    // Build hierarchical tree structure
    const tree = buildTree(allNodes);

    return {
      nodes: tree,
    };
  }),

  /**
   * Create a new outline node
   * Auto-calculates orderIndex if not provided
   */
  createNode: protectedProcedure
    .input(createOutlineNodeSchema)
    .mutation(async ({ ctx, input }) => {
      const trimmedContent = input.content.trim();

      // Verify parent exists if parentId is provided
      if (input.parentId) {
        const parent = await ctx.db
          .select()
          .from(outlineNodes)
          .where(
            and(
              eq(outlineNodes.id, input.parentId),
              eq(outlineNodes.userId, ctx.session.user.id)
            )
          )
          .limit(1);

        if (parent.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Parent node not found",
          });
        }
      }

      // Calculate orderIndex if not provided
      let orderIndex = input.orderIndex;
      if (orderIndex === undefined) {
        // Get all siblings to calculate next orderIndex
        const siblings = await ctx.db
          .select()
          .from(outlineNodes)
          .where(
            and(
              eq(outlineNodes.userId, ctx.session.user.id),
              input.parentId
                ? eq(outlineNodes.parentId, input.parentId)
                : isNull(outlineNodes.parentId)
            )
          );

        orderIndex = getNextOrderIndex(input.parentId, siblings);
      }

      // Create node
      const newNode = await ctx.db
        .insert(outlineNodes)
        .values({
          userId: ctx.session.user.id,
          parentId: input.parentId,
          content: trimmedContent,
          orderIndex,
          isExpanded: true, // Default to expanded
        })
        .returning();

      return newNode[0]!;
    }),

  /**
   * Update node content (text)
   * Only the content field can be updated via this endpoint
   */
  updateNodeContent: protectedProcedure
    .input(updateNodeContentSchema)
    .mutation(async ({ ctx, input }) => {
      const trimmedContent = input.content.trim();

      const result = await ctx.db
        .update(outlineNodes)
        .set({
          content: trimmedContent,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(outlineNodes.id, input.id),
            eq(outlineNodes.userId, ctx.session.user.id)
          )
        )
        .returning();

      if (result.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Node not found or does not belong to user",
        });
      }

      return result[0]!;
    }),

  /**
   * Get node by ID
   */
  getNodeById: protectedProcedure
    .input(getNodeByIdSchema)
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select()
        .from(outlineNodes)
        .where(
          and(
            eq(outlineNodes.id, input.id),
            eq(outlineNodes.userId, ctx.session.user.id)
          )
        )
        .limit(1);

      if (result.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Node not found",
        });
      }

      return result[0]!;
    }),
});
