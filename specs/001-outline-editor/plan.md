# Implementation Plan: Basic Outline Editor

**Branch**: `001-outline-editor` | **Date**: 2026-01-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-outline-editor/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement a keyboard-driven outline editor with three core user stories: (P1) Create and edit hierarchical outline nodes using Enter/Tab shortcuts, (P2) Navigate and reorganize nodes with arrow keys, and (P3) Automatically create set intersections and atomic sets based on node paths to establish the manifold theory foundation. The system will use the existing T3 Stack (Next.js 15, tRPC 11, Drizzle ORM, PostgreSQL) to provide a fast, type-safe implementation with auto-save, authentication, and support for 1000+ nodes without performance degradation.

## Technical Context

**Language/Version**: TypeScript 5 (strict mode), React 19, Node.js 20+
**Primary Dependencies**: Next.js 15 (App Router), tRPC 11, Drizzle ORM 0.41, Better Auth 1.3, TanStack Query 5.69, Tailwind CSS v4
**Storage**: PostgreSQL 16+ with Drizzle ORM (already configured via `start-database.sh`)
**Testing**: Vitest (for unit/integration tests), Playwright (for E2E tests) - to be configured
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari latest), desktop-first with keyboard navigation
**Project Type**: Web application (Next.js full-stack) - single unified codebase
**Performance Goals**:
- Frontend: Render 1000 nodes with virtual scrolling at 60fps
- Backend: tRPC mutations < 200ms p95, queries < 100ms p95
- Keyboard response: < 50ms latency for all interactions
- Auto-save debounce: 2 seconds after typing stops

**Constraints**:
- Type safety enforced end-to-end (tRPC + Drizzle)
- No client-side state management libraries (use TanStack Query)
- Keyboard-first interaction model (no drag-and-drop for MVP)
- Single-user editing (no real-time collaboration)
- Plain text only (no rich text formatting)

**Scale/Scope**:
- Support 1000+ outline nodes per user
- Targeting 100-1000 users for MVP
- Single outline workspace per user
- Database: ~1MB storage per 1000 nodes estimate

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Type Safety First (NON-NEGOTIABLE)
- ✅ **PASS**: Using TypeScript 5 strict mode
- ✅ **PASS**: tRPC 11 provides end-to-end type safety for all API routes
- ✅ **PASS**: Drizzle ORM generates types from schema (single source of truth)
- ✅ **PASS**: Zod validation for all tRPC inputs and environment variables
- ✅ **PASS**: No `any` types planned - strict typing enforced

### II. Test-First Development (REQUIRED)
- ✅ **PASS**: Plan includes contract tests for all tRPC endpoints
- ✅ **PASS**: Integration tests required for user journeys (acceptance scenarios)
- ✅ **PASS**: Test framework setup (Vitest) included in research phase
- ⚠️ **NOTE**: Tests will be written before implementation per TDD cycle

### III. Performance Budgets (ENFORCED)
- ✅ **PASS**: Specific metrics defined (60fps rendering, <200ms API p95, <50ms keyboard response)
- ✅ **PASS**: Virtual scrolling planned for 1000+ nodes
- ✅ **PASS**: Auto-save debounce (2s) to reduce server load
- ✅ **PASS**: TanStack Query for efficient caching and request deduplication
- ✅ **PASS**: Performance monitoring strategy to be defined in research phase

### IV. UX Consistency & Accessibility
- ✅ **PASS**: Keyboard navigation is primary interaction model (WCAG 2.1 AA)
- ✅ **PASS**: Tailwind CSS v4 for consistent styling
- ✅ **PASS**: Focus management for screen readers
- ✅ **PASS**: Reusable outline node component
- ⚠️ **NOTE**: Color contrast and ARIA labels to be verified in implementation

### V. Manifold Theory Integrity (ARCHITECTURAL)
- ✅ **PASS**: Pure set model - atomic sets + intersections as core entities
- ✅ **PASS**: Intersections store `created_via_path` (ordered) and `elements` (unordered set)
- ✅ **PASS**: Tree structure (OutlineNode) is a projection, not the core data
- ✅ **PASS**: No automatic subset generation - only user-created intersections
- ✅ **PASS**: Inverted index planned: `atomic_set_id → [intersection_ids]`
- ✅ **PASS**: Content attaches to intersections, not to atomic sets

### VI. Progressive Complexity (DESIGN PHILOSOPHY)
- ✅ **PASS**: UI presents as traditional outliner (Level 1)
- ✅ **PASS**: Manifold theory is invisible to basic users
- ✅ **PASS**: No mathematical terminology in UI
- ✅ **PASS**: Simple keyboard shortcuts (Enter, Tab, Arrows)
- ✅ **PASS**: Foundation laid for perspective switching (future feature)

### VII. Code Quality Standards (ENFORCED)
- ✅ **PASS**: Biome already configured for linting and formatting
- ✅ **PASS**: TypeScript compilation required before commits
- ✅ **PASS**: Conventional commit format to be followed
- ✅ **PASS**: Code review required via PR process
- ✅ **PASS**: No new dependencies needed - using existing T3 Stack

### Technical Stack Compliance
- ✅ **PASS**: Next.js 15 with App Router (locked stack)
- ✅ **PASS**: tRPC 11 (locked stack)
- ✅ **PASS**: Drizzle ORM with PostgreSQL (locked stack)
- ✅ **PASS**: Better Auth for authentication (locked stack)
- ✅ **PASS**: TanStack Query via tRPC (locked stack)
- ✅ **PASS**: Tailwind CSS v4 (locked stack)
- ✅ **PASS**: Biome for code quality (locked stack)
- ✅ **PASS**: pnpm package manager (locked stack)

### Gate Decision: ✅ **APPROVED - Proceed to Phase 0**

All constitutional principles are satisfied. No violations or complexity justifications required.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── outliner/
│   │   ├── page.tsx                    # Main outliner page (authenticated)
│   │   └── _components/
│   │       ├── OutlineEditor.tsx       # Main editor component
│   │       ├── OutlineNode.tsx         # Individual node component
│   │       └── OutlineKeyHandler.tsx   # Keyboard event handler
│   ├── api/
│   │   └── trpc/[trpc]/
│   │       └── route.ts                # Existing tRPC handler
│   ├── layout.tsx                      # Existing root layout
│   └── page.tsx                        # Existing home page
├── server/
│   ├── api/
│   │   ├── routers/
│   │   │   ├── outline.ts              # NEW: Outline CRUD operations
│   │   │   ├── atomicSet.ts            # NEW: Atomic set operations
│   │   │   ├── intersection.ts         # NEW: Intersection operations
│   │   │   └── post.ts                 # Existing example router
│   │   ├── root.ts                     # Update to include new routers
│   │   └── trpc.ts                     # Existing tRPC setup
│   ├── better-auth/                    # Existing auth config
│   └── db/
│       ├── schema.ts                   # UPDATE: Add outline tables
│       └── index.ts                    # Existing DB client
├── trpc/
│   ├── react.tsx                       # Existing tRPC React setup
│   ├── server.ts                       # Existing server-side caller
│   └── query-client.ts                 # Existing query config
└── lib/
    └── outline/
        ├── types.ts                    # Shared outline types
        ├── validation.ts               # Zod schemas for outline data
        └── utils.ts                    # Utility functions (path building, etc.)

tests/
├── contract/
│   ├── outline.test.ts                 # Contract tests for outline router
│   ├── atomicSet.test.ts               # Contract tests for atomic set router
│   └── intersection.test.ts            # Contract tests for intersection router
├── integration/
│   ├── outline-creation.test.ts        # User Story 1 tests
│   ├── outline-navigation.test.ts      # User Story 2 tests
│   └── set-intersection.test.ts        # User Story 3 tests
└── setup.ts                            # Test setup and utilities
```

**Structure Decision**: Using Next.js 15 App Router structure (existing). All new code integrates into the established T3 Stack pattern:
- **Frontend**: React Server Components in `src/app/outliner/` with client components for interactive editor
- **Backend**: tRPC routers in `src/server/api/routers/` for type-safe API
- **Database**: Drizzle schema extensions in `src/server/db/schema.ts`
- **Testing**: Separate directories for contract, integration, and unit tests
- **Shared Types**: `src/lib/outline/` for reusable utilities and types

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitutional violations. All implementation decisions align with established principles and the existing T3 Stack architecture.
