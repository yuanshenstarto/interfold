# Tasks: Basic Outline Editor

**Input**: Design documents from `/specs/001-outline-editor/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Test-first development is required per constitution. Contract and integration tests will be written before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app (Next.js)**: `src/app/`, `src/server/`, `src/lib/`
- **Tests**: `tests/contract/`, `tests/integration/`, `tests/unit/`
- Paths shown below use T3 Stack structure from plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency installation

- [ ] T001 Install virtual scrolling library: `pnpm add @tanstack/react-virtual`
- [ ] T002 Install debounce utility: `pnpm add use-debounce`
- [ ] T003 [P] Install test dependencies: `pnpm add -D vitest @testing-library/react @testing-library/user-event @vitejs/plugin-react happy-dom`
- [ ] T004 [P] Create Vitest configuration file at `vitest.config.ts` with React plugin and happy-dom environment
- [ ] T005 [P] Create test setup file at `tests/setup.ts` for shared test utilities
- [ ] T006 [P] Add test scripts to `package.json`: `"test": "vitest"` and `"test:ui": "vitest --ui"`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database Schema

- [ ] T007 Create shared types file at `src/lib/outline/types.ts` with AtomicSet, Intersection, OutlineNode, OutlineNodeWithContent interfaces
- [ ] T008 Create validation schemas file at `src/lib/outline/validation.ts` with Zod schemas for all tRPC inputs
- [ ] T009 Update database schema in `src/server/db/schema.ts` to add atomicSets table with indexes
- [ ] T010 Update database schema in `src/server/db/schema.ts` to add intersections table with indexes
- [ ] T011 Update database schema in `src/server/db/schema.ts` to add intersectionElements junction table with composite primary key
- [ ] T012 Update database schema in `src/server/db/schema.ts` to add outlineNodes table with self-referencing foreign key
- [ ] T013 Add Drizzle relations for atomicSets, intersections, intersectionElements, outlineNodes in `src/server/db/schema.ts`
- [ ] T014 Run database migration: `pnpm db:push` to apply schema changes to PostgreSQL

### Utility Functions

- [ ] T015 [P] Create utility functions file at `src/lib/outline/utils.ts` with calculatePathFromRoot and other helpers
- [ ] T016 [P] Create custom keyboard hook at `src/lib/outline/useOutlineKeyboard.ts` for handling Enter, Tab, Arrow keys

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create and Edit Outline Nodes (Priority: P1) 🎯 MVP

**Goal**: Users can create hierarchical outline structures using Enter/Tab shortcuts and persist data across sessions

**Independent Test**: Open editor, type text, press Enter to create siblings, press Tab to create children, refresh page to verify persistence

### Contract Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T017 [P] [US1] Contract test for atomicSet.findOrCreate in `tests/contract/atomicSet.test.ts`
- [ ] T018 [P] [US1] Contract test for outline.createNode in `tests/contract/outline.test.ts`
- [ ] T019 [P] [US1] Contract test for outline.getUserOutline in `tests/contract/outline.test.ts`
- [ ] T020 [P] [US1] Contract test for outline.updateNodeContent in `tests/contract/outline.test.ts`

### tRPC Routers for User Story 1

- [ ] T021 [P] [US1] Create atomicSet router at `src/server/api/routers/atomicSet.ts` with getAll, findOrCreate procedures
- [ ] T022 [P] [US1] Create intersection router at `src/server/api/routers/intersection.ts` with create, getById procedures
- [ ] T023 [US1] Create outline router at `src/server/api/routers/outline.ts` with getUserOutline, createNode, updateNodeContent procedures
- [ ] T024 [US1] Update tRPC root router in `src/server/api/root.ts` to export atomicSet, intersection, outline routers

### Frontend Components for User Story 1

- [ ] T025 [US1] Create authenticated outliner page at `src/app/outliner/page.tsx` with auth redirect
- [ ] T026 [US1] Create OutlineEditor container component at `src/app/outliner/_components/OutlineEditor.tsx` with query for getUserOutline
- [ ] T027 [US1] Create OutlineNode component at `src/app/outliner/_components/OutlineNode.tsx` with input field and auto-save
- [ ] T028 [US1] Implement debounced auto-save in OutlineNode component using `use-debounce` (2 second delay)
- [ ] T029 [US1] Add visual save indicator (Saving.../Saved) to OutlineNode component

### Integration Tests for User Story 1

- [ ] T030 [US1] Integration test: Create root node and verify persistence in `tests/integration/outline-creation.test.ts`
- [ ] T031 [US1] Integration test: Create sibling node with Enter key in `tests/integration/outline-creation.test.ts`
- [ ] T032 [US1] Integration test: Create child node with Enter+Tab in `tests/integration/outline-creation.test.ts`
- [ ] T033 [US1] Integration test: Edit node content and verify auto-save in `tests/integration/outline-creation.test.ts`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Navigate and Reorganize Outline (Priority: P2)

**Goal**: Users can navigate with arrow keys and reorganize hierarchy with Tab/Shift+Tab

**Independent Test**: Create multi-level outline, use arrow keys to navigate, use Tab/Shift+Tab to adjust hierarchy, verify structure updates

### Contract Tests for User Story 2

- [ ] T034 [P] [US2] Contract test for outline.moveNode in `tests/contract/outline.test.ts`
- [ ] T035 [P] [US2] Contract test for outline.deleteNode in `tests/contract/outline.test.ts`
- [ ] T036 [P] [US2] Contract test for outline.toggleExpanded in `tests/contract/outline.test.ts`
- [ ] T037 [P] [US2] Contract test for outline.reorderNodes in `tests/contract/outline.test.ts`

### tRPC Router Extensions for User Story 2

- [ ] T038 [US2] Add moveNode procedure to outline router in `src/server/api/routers/outline.ts`
- [ ] T039 [US2] Add deleteNode procedure to outline router in `src/server/api/routers/outline.ts`
- [ ] T040 [US2] Add toggleExpanded procedure to outline router in `src/server/api/routers/outline.ts`
- [ ] T041 [US2] Add reorderNodes procedure to outline router in `src/server/api/routers/outline.ts`

### Frontend Keyboard Navigation for User Story 2

- [ ] T042 [US2] Create OutlineKeyHandler component at `src/app/outliner/_components/OutlineKeyHandler.tsx` for global keyboard events
- [ ] T043 [US2] Implement Arrow Up/Down navigation in OutlineKeyHandler to move focus between nodes
- [ ] T044 [US2] Implement Arrow Left/Right for collapse/expand in OutlineKeyHandler
- [ ] T045 [US2] Implement Tab key handler in OutlineKeyHandler to indent node (call moveNode mutation)
- [ ] T046 [US2] Implement Shift+Tab key handler in OutlineKeyHandler to outdent node (call moveNode mutation)
- [ ] T047 [US2] Implement Backspace handler in OutlineKeyHandler to delete empty node (call deleteNode mutation)
- [ ] T048 [US2] Add focus management with refs in OutlineEditor component to track currently focused node
- [ ] T049 [US2] Add collapse/expand toggle UI button in OutlineNode component (calls toggleExpanded mutation)

### Integration Tests for User Story 2

- [ ] T050 [US2] Integration test: Navigate down with Arrow Down key in `tests/integration/outline-navigation.test.ts`
- [ ] T051 [US2] Integration test: Navigate up with Arrow Up key in `tests/integration/outline-navigation.test.ts`
- [ ] T052 [US2] Integration test: Indent node with Tab key in `tests/integration/outline-navigation.test.ts`
- [ ] T053 [US2] Integration test: Outdent node with Shift+Tab key in `tests/integration/outline-navigation.test.ts`
- [ ] T054 [US2] Integration test: Delete empty node with Backspace in `tests/integration/outline-navigation.test.ts`
- [ ] T055 [US2] Integration test: Collapse/expand node with Arrow Left/Right in `tests/integration/outline-navigation.test.ts`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Automatic Set Intersection Creation (Priority: P3)

**Goal**: System automatically creates atomic sets and intersections based on node paths (manifold theory foundation)

**Independent Test**: Create path "React > Hooks > Closure", query database to verify intersection with elements [React, Hooks, Closure] exists

### Contract Tests for User Story 3

- [ ] T056 [P] [US3] Contract test for intersection.create in `tests/contract/intersection.test.ts`
- [ ] T057 [P] [US3] Contract test for intersection.softDelete in `tests/contract/intersection.test.ts`
- [ ] T058 [P] [US3] Contract test for intersection.findByAtomicSets in `tests/contract/intersection.test.ts`
- [ ] T059 [P] [US3] Contract test for atomicSet.getIntersections in `tests/contract/atomicSet.test.ts`

### Backend Logic for User Story 3

- [ ] T060 [US3] Implement calculatePathFromRoot helper function in `src/lib/outline/utils.ts` with recursive query
- [ ] T061 [US3] Update outline.createNode in `src/server/api/routers/outline.ts` to create atomic sets and intersections
- [ ] T062 [US3] Add intersection creation logic to outline.createNode: extract node names from path, find/create atomic sets
- [ ] T063 [US3] Add intersection element insertion to outline.createNode: populate junction table with atomic set IDs
- [ ] T064 [US3] Update outline.moveNode in `src/server/api/routers/outline.ts` to create new intersection with new path
- [ ] T065 [US3] Add soft delete logic to outline.moveNode: mark old intersection as isDeleted=true
- [ ] T066 [US3] Update outline.deleteNode in `src/server/api/routers/outline.ts` to soft delete associated intersections
- [ ] T067 [US3] Add getIntersections procedure to atomicSet router in `src/server/api/routers/atomicSet.ts` (inverted index query)
- [ ] T068 [US3] Add findByAtomicSets procedure to intersection router in `src/server/api/routers/intersection.ts`
- [ ] T069 [US3] Add softDelete procedure to intersection router in `src/server/api/routers/intersection.ts`

### Integration Tests for User Story 3

- [ ] T070 [US3] Integration test: Create node path and verify atomic sets created in `tests/integration/set-intersection.test.ts`
- [ ] T071 [US3] Integration test: Create node path and verify intersection created with correct createdViaPath in `tests/integration/set-intersection.test.ts`
- [ ] T072 [US3] Integration test: Create duplicate path and verify atomic sets reused in `tests/integration/set-intersection.test.ts`
- [ ] T073 [US3] Integration test: Move node and verify old intersection soft deleted in `tests/integration/set-intersection.test.ts`
- [ ] T074 [US3] Integration test: Delete node and verify intersection soft deleted in `tests/integration/set-intersection.test.ts`
- [ ] T075 [US3] Integration test: Query intersections by atomic set (inverted index) in `tests/integration/set-intersection.test.ts`

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Performance & Polish

**Purpose**: Improvements that affect multiple user stories

- [ ] T076 [P] Implement virtual scrolling in OutlineEditor component using `@tanstack/react-virtual` for 1000+ nodes
- [ ] T077 [P] Add performance monitoring tRPC middleware in `src/server/api/trpc.ts` to log query/mutation latency
- [ ] T078 [P] Add ARIA labels to OutlineNode component: role="treeitem", aria-level, aria-expanded
- [ ] T079 [P] Add ARIA tree role to OutlineEditor component: role="tree", aria-label="Outline Editor"
- [ ] T080 [P] Add focus visible styles to OutlineNode in Tailwind CSS for keyboard users
- [ ] T081 [P] Add loading skeleton UI to OutlineEditor component while fetching outline
- [ ] T082 [P] Add error boundary to outliner page at `src/app/outliner/error.tsx` for graceful error handling
- [ ] T083 [P] Add offline queue for mutations in `src/lib/outline/utils.ts` using TanStack Query retry config
- [ ] T084 Test color contrast ratios with Chrome DevTools to ensure WCAG 2.1 AA compliance
- [ ] T085 Test keyboard navigation with screen reader (VoiceOver on macOS or NVDA on Windows)
- [ ] T086 Run Lighthouse audit and ensure Performance Score ≥ 90
- [ ] T087 Profile React component render times with React DevTools Profiler for 1000-node outline

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Performance & Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 for outline.createNode, but independently testable with own navigation features
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Enhances US1 createNode logic but doesn't block US1/US2 functionality

### Within Each User Story

- Contract tests MUST be written and FAIL before implementation
- Models/schema before services
- Services/routers before UI components
- Core implementation before integration tests
- Story complete before moving to next priority

### Parallel Opportunities

- **Setup tasks (T001-T006)**: All can run in parallel
- **Foundational schema tasks (T009-T012)**: Can run in parallel (different tables)
- **Foundational utilities (T015-T016)**: Can run in parallel with schema
- **US1 contract tests (T017-T020)**: All can run in parallel
- **US1 routers (T021-T022)**: Can run in parallel (different files)
- **US2 contract tests (T034-T037)**: All can run in parallel
- **US2 router extensions (T038-T041)**: Can run in parallel (different procedures)
- **US3 contract tests (T056-T059)**: All can run in parallel
- **Performance tasks (T076-T083)**: Most can run in parallel (different concerns)

---

## Parallel Example: User Story 1

```bash
# Launch all contract tests for User Story 1 together:
Task: "Contract test for atomicSet.findOrCreate in tests/contract/atomicSet.test.ts"
Task: "Contract test for outline.createNode in tests/contract/outline.test.ts"
Task: "Contract test for outline.getUserOutline in tests/contract/outline.test.ts"
Task: "Contract test for outline.updateNodeContent in tests/contract/outline.test.ts"

# Launch all routers for User Story 1 together (after tests fail):
Task: "Create atomicSet router at src/server/api/routers/atomicSet.ts"
Task: "Create intersection router at src/server/api/routers/intersection.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T006)
2. Complete Phase 2: Foundational (T007-T016) - CRITICAL blocking phase
3. Complete Phase 3: User Story 1 (T017-T033)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

**Deliverable**: Basic outliner with create, edit, auto-save, persistence

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP! 🎯)
3. Add User Story 2 → Test independently → Deploy/Demo (Enhanced navigation)
4. Add User Story 3 → Test independently → Deploy/Demo (Manifold theory foundation)
5. Add Performance & Polish → Final release

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T016)
2. Once Foundational is done:
   - Developer A: User Story 1 (T017-T033)
   - Developer B: User Story 2 (T034-T055) - can start after US1 createNode implemented
   - Developer C: User Story 3 (T056-T075) - can enhance US1 logic in parallel
3. Stories complete and integrate independently
4. All developers: Performance & Polish (T076-T087)

---

## Task Summary

**Total Tasks**: 87 tasks

**Breakdown by Phase**:
- Phase 1 (Setup): 6 tasks
- Phase 2 (Foundational): 10 tasks
- Phase 3 (User Story 1 - P1): 17 tasks (4 tests + 8 implementation + 5 integration tests)
- Phase 4 (User Story 2 - P2): 22 tasks (4 tests + 11 implementation + 7 integration tests)
- Phase 5 (User Story 3 - P3): 20 tasks (4 tests + 12 implementation + 6 integration tests)
- Phase 6 (Performance & Polish): 12 tasks

**Parallel Opportunities**: 34 tasks marked [P] for parallel execution

**Independent Test Criteria**:
- US1: Open editor, create nodes with Enter/Tab, verify persistence after refresh
- US2: Navigate with arrows, reorganize with Tab/Shift+Tab, verify structure changes
- US3: Create path, query database, verify atomic sets and intersections exist

**Suggested MVP Scope**: Phase 1 + Phase 2 + Phase 3 (User Story 1 only) = 33 tasks

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (Red-Green-Refactor)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
