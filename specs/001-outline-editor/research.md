# Research: Basic Outline Editor

**Date**: 2026-01-14
**Feature**: Basic Outline Editor (001-outline-editor)

## Overview

This document captures research decisions and technical approaches for implementing the basic outline editor within the existing T3 Stack infrastructure.

---

## 1. Test Framework Setup

### Decision: Vitest + Testing Library

**Rationale**:
- **Vitest** is Vite-native, aligns with Next.js Turbopack (both Vite-based)
- **React Testing Library** for component testing (industry standard)
- **tRPC Testing** utilities available for contract tests
- Fast execution with watch mode for TDD workflow
- TypeScript-first with excellent type inference

**Alternatives Considered**:
- **Jest**: Mature but slower than Vitest, requires additional config for ESM
- **Playwright Component Testing**: Overkill for contract/integration tests (better for E2E)

**Implementation Notes**:
- Install: `pnpm add -D vitest @testing-library/react @testing-library/user-event @vitejs/plugin-react happy-dom`
- Configure `vitest.config.ts` with React plugin and happy-dom environment
- Use `@trpc/server/unstable-core-do-not-import` for tRPC procedure testing

---

## 2. Virtual Scrolling for Large Outlines

### Decision: @tanstack/react-virtual

**Rationale**:
- Lightweight (< 15KB), TypeScript-first
- From TanStack ecosystem (already using TanStack Query)
- Virtualization required for 1000+ nodes at 60fps
- Supports dynamic heights (outline nodes vary in content length)
- Keyboard navigation compatible with virtualized lists

**Alternatives Considered**:
- **react-window**: Popular but less actively maintained, no dynamic heights without hacks
- **react-virtuoso**: Feature-rich but larger bundle (25KB+), may be overkill for MVP

**Implementation Notes**:
- Install: `pnpm add @tanstack/react-virtual`
- Use `useVirtualizer` hook with `document.getElementById('scrollElement')` as parent
- Measure node heights dynamically with `measureElement` option
- Maintain focus index separately from scroll position for keyboard nav

---

## 3. Keyboard Event Handling

### Decision: Native React `onKeyDown` with Custom Hook

**Rationale**:
- No library needed - React's built-in event handling sufficient
- Custom `useOutlineKeyboard` hook for reusable logic
- Prevent default browser behavior (Tab focus trap, Enter form submission)
- Focus management via refs and `element.focus()`

**Alternatives Considered**:
- **react-hotkeys-hook**: Adds 8KB, unnecessary for simple keyboard shortcuts
- **Mousetrap**: jQuery-era library, not React-friendly
- **@react-aria/focus**: Excellent but focused on accessibility patterns, overkill for outliner

**Implementation Notes**:
```typescript
const useOutlineKeyboard = (nodeId: string, callbacks: KeyboardCallbacks) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        callbacks.onEnter(e.shiftKey);
        break;
      case 'Tab':
        e.preventDefault();
        callbacks.onTab(e.shiftKey); // Shift+Tab for outdent
        break;
      case 'ArrowDown':
        callbacks.onArrowDown();
        break;
      case 'ArrowUp':
        callbacks.onArrowUp();
        break;
      case 'Backspace':
        if (e.currentTarget.textContent === '') {
          e.preventDefault();
          callbacks.onDelete();
        }
        break;
    }
  };
  return { handleKeyDown };
};
```

---

## 4. Auto-Save Strategy

### Decision: Debounced Mutations with TanStack Query

**Rationale**:
- Use `useMutation` from tRPC with manual trigger
- Debounce input changes with `useDebouncedCallback` (2s delay)
- Queue mutations during network offline with `retry` config
- Visual feedback via `isLoading` state from mutation

**Alternatives Considered**:
- **Optimistic updates**: Risky for MVP - can cause data inconsistency if server rejects
- **Immediate save on each keystroke**: Too many server requests, poor performance
- **Manual save button**: Against UX expectations (users expect auto-save)

**Implementation Notes**:
- Install: `pnpm add use-debounce` (3KB, TypeScript-native)
- Debounce configuration: 2000ms delay, leading edge false
- Mutation retry: 3 attempts with exponential backoff
- Show "Saving..." indicator when `mutation.isLoading === true`
- Show "Saved" checkmark when `mutation.isSuccess === true` (fade after 2s)

---

## 5. Drizzle Schema Design for Manifold Model

### Decision: Four Tables with Inverted Index

**Rationale**:
- **Atomic Sets Table**: Stores unique concepts/tags
- **Intersections Table**: Stores hyperedges with `created_via_path` JSONB
- **Outline Nodes Table**: Stores UI tree structure (projection)
- **Intersection Elements Junction Table**: Many-to-many between intersections and atomic sets

**Schema Details**:

```typescript
// src/server/db/schema.ts

export const atomicSets = pgTable('pg-drizzle_atomic_set', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(), // Enforce uniqueness
  userId: uuid('user_id').references(() => user.id, { onDelete: 'cascade' }),
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const intersections = pgTable('pg-drizzle_intersection', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => user.id, { onDelete: 'cascade' }),
  createdViaPath: jsonb('created_via_path').$type<string[]>().notNull(), // Ordered array of atomic set IDs
  content: text('content'), // Optional text content attached to intersection
  isDeleted: boolean('is_deleted').notNull().default(false), // Soft delete
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const intersectionElements = pgTable('pg-drizzle_intersection_element', {
  intersectionId: uuid('intersection_id').references(() => intersections.id, { onDelete: 'cascade' }),
  atomicSetId: uuid('atomic_set_id').references(() => atomicSets.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: primaryKey(table.intersectionId, table.atomicSetId),
  atomicSetIdx: index('atomic_set_idx').on(table.atomicSetId), // Inverted index
}));

export const outlineNodes = pgTable('pg-drizzle_outline_node', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => user.id, { onDelete: 'cascade' }),
  intersectionId: uuid('intersection_id').references(() => intersections.id, { onDelete: 'set null' }),
  parentId: uuid('parent_id').references((): AnyPgColumn => outlineNodes.id, { onDelete: 'cascade' }),
  orderPosition: integer('order_position').notNull(), // Position among siblings
  isExpanded: boolean('is_expanded').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  userIdx: index('user_idx').on(table.userId),
  parentIdx: index('parent_idx').on(table.parentId),
}));
```

**Indexing Strategy**:
- `atomicSets.name`: Unique index for fast lookup and duplicate prevention
- `intersectionElements.atomicSetId`: Index for inverted queries (find all intersections containing a set)
- `outlineNodes.userId`: Index for fetching user's outline
- `outlineNodes.parentId`: Index for fetching children of a node

---

## 6. Data Denormalization vs. Normalization

### Decision: Hybrid Approach

**Rationale**:
- **Normalized**: Atomic sets and intersections (manifold theory integrity)
- **Denormalized**: Outline nodes duplicate intersection data for fast tree rendering
- **Tradeoff**: Write complexity vs. read performance (reads >> writes for outliner)

**Sync Strategy**:
- When outline node changes, update or create corresponding intersection
- When intersection deleted, set `outlineNode.intersectionId = NULL` (preserve tree structure)
- Background job (future) to clean up orphaned intersections (soft deleted > 30 days)

---

## 7. Optimistic UI Updates

### Decision: Deferred for MVP

**Rationale**:
- **Complexity**: Requires manual cache updates and rollback logic
- **Risk**: Can cause data inconsistency bugs in MVP
- **Alternative**: Show loading states with auto-save indicator
- **Future**: Add optimistic updates in v2 once core functionality stable

---

## 8. Accessibility (WCAG 2.1 AA)

### Decision: ARIA + Keyboard Navigation + Focus Management

**Rationale**:
- **role="tree"** and **role="treeitem"** for outline structure
- **aria-expanded** for collapse/expand state
- **aria-level** for nesting depth
- **tabindex** management for keyboard navigation
- Focus visible styles for keyboard users

**Implementation Notes**:
```typescript
<div role="tree" aria-label="Outline Editor">
  <div
    role="treeitem"
    aria-expanded={isExpanded}
    aria-level={level}
    tabIndex={isFocused ? 0 : -1}
  >
    <input
      type="text"
      value={content}
      aria-label={`Outline node: ${content}`}
    />
  </div>
</div>
```

**Testing**:
- Verify with VoiceOver (macOS) and NVDA (Windows)
- Ensure all actions accessible via keyboard
- Validate color contrast with Chrome DevTools

---

## 9. Error Handling and Edge Cases

### Decision: Defensive Programming + User Feedback

**Error Scenarios**:
1. **Network offline**: Queue mutations, show "Offline" indicator, retry on reconnect
2. **Duplicate atomic set creation**: Use `ON CONFLICT DO NOTHING` in Drizzle
3. **Deep nesting (10+ levels)**: Allow but warn user at level 10 ("Consider flattening")
4. **Long text (1000+ chars)**: Truncate display in tree, show full text on focus
5. **Rapid Enter presses**: Debounce node creation (100ms)
6. **Concurrent tab edits**: Last write wins (acceptable for single-user MVP)

**Validation**:
- Zod schema for all tRPC inputs
- Max text length: 5000 characters
- Max nesting depth: 20 levels (enforced server-side)

---

## 10. Performance Monitoring

### Decision: Built-in Metrics + Lighthouse

**Metrics to Track**:
- **Frontend**: React DevTools Profiler for render times
- **Backend**: tRPC middleware logging for API latency
- **Database**: Drizzle query logging (dev mode only)
- **Lighthouse**: CI integration for performance score

**Implementation**:
```typescript
// tRPC middleware for performance logging
const performanceMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();
  const result = await next();
  const duration = Date.now() - start;
  console.log(`[tRPC] ${path}: ${duration}ms`);
  return result;
});
```

---

## Summary

All research items resolved. Key decisions:
- **Testing**: Vitest + React Testing Library
- **Virtual Scrolling**: @tanstack/react-virtual
- **Keyboard Handling**: Custom hook with native React events
- **Auto-Save**: Debounced mutations with TanStack Query
- **Database**: Four-table design with inverted index
- **Accessibility**: ARIA roles + keyboard navigation
- **Performance**: Monitoring via tRPC middleware + Lighthouse

**Dependencies to Add**:
```bash
pnpm add @tanstack/react-virtual use-debounce
pnpm add -D vitest @testing-library/react @testing-library/user-event @vitejs/plugin-react happy-dom
```

**Ready for Phase 1**: Data model, API contracts, and quickstart documentation.
