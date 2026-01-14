/**
 * Zod validation schemas for tRPC input validation
 * Enforces data integrity and type safety per constitution principle I
 */

import { z } from "zod";

// ============================================================================
// Atomic Set Schemas
// ============================================================================

export const createAtomicSetSchema = z.object({
  name: z
    .string()
    .min(1, "Name must not be empty")
    .max(200, "Name must not exceed 200 characters")
    .trim(),
  metadata: z.record(z.unknown()).optional(),
});

export const findOrCreateAtomicSetSchema = z.object({
  name: z
    .string()
    .min(1, "Name must not be empty")
    .max(200, "Name must not exceed 200 characters")
    .trim(),
  metadata: z.record(z.unknown()).optional(),
});

export const updateAtomicSetMetadataSchema = z.object({
  id: z.string().uuid("Invalid atomic set ID"),
  metadata: z.record(z.unknown()),
});

export const getIntersectionsSchema = z.object({
  atomicSetId: z.string().uuid("Invalid atomic set ID"),
});

export const getAtomicSetByIdSchema = z.object({
  id: z.string().uuid("Invalid atomic set ID"),
});

export const getAtomicSetByNameSchema = z.object({
  name: z.string().min(1),
});

// ============================================================================
// Intersection Schemas
// ============================================================================

export const createIntersectionSchema = z.object({
  atomicSetIds: z
    .array(z.string().uuid())
    .min(1, "Must include at least 1 atomic set")
    .max(20, "Cannot exceed 20 atomic sets"),
  createdViaPath: z
    .array(z.string().uuid())
    .min(1, "Path must include at least 1 atomic set"),
  content: z
    .string()
    .max(5000, "Content must not exceed 5000 characters")
    .optional(),
});

export const updateIntersectionContentSchema = z.object({
  id: z.string().uuid("Invalid intersection ID"),
  content: z
    .string()
    .min(1, "Content must not be empty")
    .max(5000, "Content must not exceed 5000 characters"),
});

export const softDeleteIntersectionSchema = z.object({
  id: z.string().uuid("Invalid intersection ID"),
});

export const findByAtomicSetsSchema = z.object({
  atomicSetIds: z
    .array(z.string().uuid())
    .min(1, "Must include at least 1 atomic set"),
  exactMatch: z.boolean().default(false),
});

export const getIntersectionByIdSchema = z.object({
  id: z.string().uuid("Invalid intersection ID"),
});

export const getAllIntersectionsSchema = z.object({
  includeDeleted: z.boolean().default(false),
});

// ============================================================================
// Outline Node Schemas
// ============================================================================

export const createOutlineNodeSchema = z.object({
  parentId: z.string().uuid("Invalid parent ID").nullable(),
  content: z
    .string()
    .max(5000, "Content must not exceed 5000 characters")
    .trim()
    .default(""),
  orderIndex: z.number().int().nonnegative().optional(),
});

export const updateNodeContentSchema = z.object({
  id: z.string().uuid("Invalid node ID"),
  content: z
    .string()
    .min(1, "Content must not be empty")
    .max(5000, "Content must not exceed 5000 characters")
    .trim(),
});

export const moveNodeSchema = z.object({
  id: z.string().uuid("Invalid node ID"),
  newParentId: z.string().uuid("Invalid parent ID").nullable(),
  newOrderIndex: z.number().int().nonnegative(),
});

export const deleteNodeSchema = z.object({
  id: z.string().uuid("Invalid node ID"),
});

export const reorderNodesSchema = z.object({
  parentId: z.string().uuid("Invalid parent ID").nullable(),
  nodeIds: z
    .array(z.string().uuid())
    .min(1, "Must include at least 1 node ID"),
});

export const toggleExpandedSchema = z.object({
  id: z.string().uuid("Invalid node ID"),
});

export const getNodeByIdSchema = z.object({
  id: z.string().uuid("Invalid node ID"),
});

// ============================================================================
// Type Inference Exports
// ============================================================================

// Atomic Set types
export type CreateAtomicSetInput = z.infer<typeof createAtomicSetSchema>;
export type FindOrCreateAtomicSetInput = z.infer<
  typeof findOrCreateAtomicSetSchema
>;
export type UpdateAtomicSetMetadataInput = z.infer<
  typeof updateAtomicSetMetadataSchema
>;
export type GetIntersectionsInput = z.infer<typeof getIntersectionsSchema>;

// Intersection types
export type CreateIntersectionInput = z.infer<typeof createIntersectionSchema>;
export type UpdateIntersectionContentInput = z.infer<
  typeof updateIntersectionContentSchema
>;
export type SoftDeleteIntersectionInput = z.infer<
  typeof softDeleteIntersectionSchema
>;
export type FindByAtomicSetsInput = z.infer<typeof findByAtomicSetsSchema>;

// Outline Node types
export type CreateOutlineNodeInput = z.infer<typeof createOutlineNodeSchema>;
export type UpdateNodeContentInput = z.infer<typeof updateNodeContentSchema>;
export type MoveNodeInput = z.infer<typeof moveNodeSchema>;
export type DeleteNodeInput = z.infer<typeof deleteNodeSchema>;
export type ReorderNodesInput = z.infer<typeof reorderNodesSchema>;
export type ToggleExpandedInput = z.infer<typeof toggleExpandedSchema>;
