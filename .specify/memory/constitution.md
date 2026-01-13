# Interfold Project Constitution

<!--
Sync Impact Report:
Version: 1.0.0 (initial ratification)
Changes:
  - Initial constitution creation
  - Established 7 core principles: Type Safety, Test-First Development, Performance Budgets,
    UX Consistency, Manifold Theory Integrity, Progressive Complexity, Code Quality Standards
  - Added sections: Technical Stack Requirements, Development Workflow
  - Governance rules established

Templates Status:
  ✅ plan-template.md - Constitution Check section aligns with principles
  ✅ spec-template.md - Success criteria and requirements align with quality standards
  ✅ tasks-template.md - Task structure supports test-first and parallel execution
  ⚠️ No command files found in .specify/templates/commands/ - will need verification if added

Follow-up TODOs:
  - None - all placeholders filled
-->

## Core Principles

### I. Type Safety First (NON-NEGOTIABLE)

**Rule**: All code MUST leverage TypeScript's type system to its fullest extent.

- End-to-end type safety via tRPC - no manual type definitions for API contracts
- Strict TypeScript configuration enforced (`strict: true` minimum)
- Drizzle schema serves as single source of truth for database types
- No `any` types except in documented exceptional cases (require inline justification)
- Zod schemas for all external data validation (environment variables, API inputs)
- Build MUST fail on type errors - no warnings tolerated in CI

**Rationale**: Type safety prevents entire classes of bugs at compile time. With tRPC and Drizzle, the T3 Stack enables zero-cost type safety across the entire application stack - this is our competitive advantage.

### II. Test-First Development (REQUIRED)

**Rule**: Tests MUST be written before implementation for all non-trivial features.

- **Test Development Cycle**:
  1. Write tests based on acceptance criteria
  2. Verify tests fail (red)
  3. Get user/stakeholder approval on test scenarios
  4. Implement minimum code to pass tests (green)
  5. Refactor while keeping tests green
- **Contract Tests**: Required for all tRPC endpoints - verify API contracts
- **Integration Tests**: Required for multi-component user journeys
- **Unit Tests**: Encouraged for complex business logic, not mandatory for simple CRUD
- Tests run in CI - failed tests block merges

**Rationale**: Test-first development ensures we build what's needed, catches regressions early, and serves as living documentation. It's cheaper to catch bugs in tests than in production.

### III. Performance Budgets (ENFORCED)

**Rule**: Performance characteristics MUST be measurable and monitored.

- **Frontend Performance**:
  - First Contentful Paint (FCP) < 1.2s on 3G
  - Time to Interactive (TTI) < 3.5s on 3G
  - Lighthouse Performance Score ≥ 90
  - Bundle size monitored - warn on 10% increase
- **Backend Performance**:
  - API response time p95 < 200ms (excluding external dependencies)
  - Database query time p95 < 50ms
  - Memory usage < 512MB per instance under normal load
- **Development Performance**:
  - Hot reload < 500ms with Turbopack
  - Type checking < 5s on incremental builds
- **Monitoring**: Performance regression tests in CI for critical paths
- **Exceptions**: Performance violations require written justification in PR

**Rationale**: Interfold's vision of multi-dimensional knowledge navigation requires instant perspective switching. Slow performance breaks the cognitive flow and destroys the manifold exploration experience.

### IV. UX Consistency & Accessibility

**Rule**: User interface MUST be predictable, accessible, and respect cognitive load principles.

- **Design System Compliance**:
  - All UI components follow established patterns (document in design system)
  - Consistent spacing, typography, and color usage via Tailwind theme
  - Reusable components for common patterns (buttons, inputs, modals)
- **Accessibility Standards**:
  - WCAG 2.1 Level AA compliance minimum
  - Keyboard navigation for all interactive elements
  - Screen reader support verified with actual testing
  - Color contrast ratios ≥ 4.5:1 for normal text, 3:1 for large text
- **Progressive Disclosure**:
  - Complex features hidden behind simple interfaces initially
  - Advanced users discover power features organically
  - No feature gates that confuse basic users
- **Zero Extra Cognitive Load**:
  - Information architecture reflects user's mental model
  - Outliner works like traditional editors for basic users
  - Manifold features emerge naturally from usage

**Rationale**: Interfold's core value proposition is "zero extra cognitive burden" while enabling multi-dimensional knowledge organization. Inconsistent UX or accessibility barriers destroy this promise.

### V. Manifold Theory Integrity (ARCHITECTURAL)

**Rule**: All data modeling MUST respect the mathematical foundations of manifold theory and set theory.

- **Pure Set Model**:
  - Everything is a set (atomic or intersection)
  - No independent "content" data type - content attaches to intersections
  - Sets are immutable identifiers; intersections record relationships
- **Perspective-Relative Trees**:
  - Tree structure is a projection, not the data
  - Same intersection appears in multiple perspectives automatically
  - Perspective switching regenerates tree from hypergraph
- **Sparse Hypergraph Storage**:
  - Only user-created intersections exist (no automatic subset generation)
  - Intersections are unordered sets mathematically (preserve `created_via_path` for UX)
  - Efficient index: `atomic_set_id → [intersection_ids]`
- **Violations**: Any feature that requires "placing" content in "one location" violates manifold principles

**Rationale**: Manifold theory is the foundational innovation that differentiates Interfold from all other knowledge management systems. Compromising this integrity destroys the product's core value.

### VI. Progressive Complexity (DESIGN PHILOSOPHY)

**Rule**: System MUST hide complexity from basic users while enabling power users.

- **Level 1 (Basic)**: Traditional outliner with Tab/Enter navigation
- **Level 2 (Discovery)**: User notices same content appears in multiple perspectives
- **Level 3 (Mastery)**: Deliberate use of multi-perspective organization
- **Level 4 (Power)**: Lisp expressions for automation (optional, not forced)
- **Implementation Guideline**:
  - Features default to simple mode
  - Advanced capabilities discoverable through usage patterns
  - Documentation separates basic tutorials from advanced guides
  - No feature requires understanding manifold theory to use
- **Anti-pattern**: Exposing implementation details (hypergraphs, set theory) in basic UX

**Rationale**: From the project philosophy - "基础用户完全可以当传统大纲编辑器使用" (basic users can use it as a traditional outliner). Complexity should be opt-in, not mandatory.

### VII. Code Quality Standards (ENFORCED)

**Rule**: All code MUST pass automated quality gates before merge.

- **Linting & Formatting**:
  - Biome configuration enforced (replaces ESLint + Prettier)
  - No warnings allowed in production builds
  - `pnpm check` passes before every commit
- **Code Review Requirements**:
  - All PRs require review approval
  - Reviewers verify: type safety, test coverage, performance impact, UX consistency
  - No "LGTM" without testing locally on complex changes
- **Commit Discipline**:
  - Conventional commits format (feat/fix/docs/refactor/test)
  - Atomic commits - one logical change per commit
  - Commit messages explain "why", code explains "how"
- **Dependency Management**:
  - Dependencies justified before addition (no "just in case" libraries)
  - Security updates applied within 7 days for high/critical CVEs
  - Deprecated dependencies replaced proactively
- **Documentation Standards**:
  - Complex algorithms include inline rationale comments
  - API changes update relevant documentation immediately
  - Breaking changes require migration guides

**Rationale**: High code quality standards reduce technical debt, enable confident refactoring, and make onboarding new contributors faster. This is essential for a long-term project with architectural complexity.

---

## Technical Stack Requirements

### Core Technologies (LOCKED)

These form the foundation and MUST NOT be changed without constitutional amendment:

- **Framework**: Next.js 15 with App Router - server components by default
- **API Layer**: tRPC 11 - end-to-end type safety
- **Database**: PostgreSQL with Drizzle ORM - type-safe queries
- **Authentication**: Better Auth - extensible, type-safe auth
- **State Management**: TanStack Query (via tRPC) - server state caching
- **Styling**: Tailwind CSS v4 - utility-first CSS
- **Type System**: TypeScript 5 strict mode
- **Package Manager**: pnpm - fast, efficient
- **Code Quality**: Biome - unified linting and formatting

### Permitted Additions

Libraries may be added if they meet ALL criteria:

1. Fill a specific gap not covered by existing stack
2. TypeScript-first with excellent type definitions
3. Active maintenance (commits within 3 months)
4. Bundle size justified (< 50KB added for specialized tools)
5. No overlap with existing dependencies

### Prohibited Patterns

- **Client-side state management libraries** (Redux, MobX, Zustand) - use TanStack Query + tRPC
- **Alternative ORMs** (Prisma, TypeORM) - Drizzle is standard
- **CSS-in-JS libraries** (styled-components, emotion) - use Tailwind
- **Alternative validation** (Yup, Joi, class-validator) - use Zod
- **jQuery or any DOM manipulation library** - React handles this

**Exception Process**: If a prohibited pattern is genuinely needed, document justification in ADR (Architecture Decision Record) and propose constitutional amendment.

---

## Development Workflow

### Branch Strategy

- **main**: Production-ready code, protected
- **Feature branches**: `###-feature-name` format (e.g., `001-perspective-switcher`)
- **Integration**: CI runs on all branches, PR required for main
- **Branch Lifetime**: Delete after merge (keep history clean)

### Pre-Commit Requirements

Before committing, developer MUST run and pass:

```bash
pnpm check          # Biome linting and formatting
pnpm typecheck      # TypeScript compilation
pnpm test          # Run tests (when test suite exists)
```

Git hooks should enforce this automatically (consider using `husky` + `lint-staged`).

### Pull Request Process

1. **Create PR** with description:
   - User story or issue reference
   - What changed and why
   - Testing performed
   - Performance impact (if applicable)
   - Screenshots for UI changes
2. **Constitution Checklist**:
   - [ ] Type safety verified (no `any` types without justification)
   - [ ] Tests written before implementation (or N/A for trivial changes)
   - [ ] Performance budget checked (or N/A)
   - [ ] UX consistency verified (or N/A)
   - [ ] Manifold integrity preserved (for data model changes)
   - [ ] Code quality checks pass (`pnpm check`, `pnpm typecheck`)
3. **Review & Approval**: One approval required minimum
4. **Merge Strategy**: Squash commits for feature branches, preserve for main

### Definition of Done

A feature is "done" when ALL criteria met:

- [ ] Code implemented and passing type checks
- [ ] Tests written and passing (contract + integration for user stories)
- [ ] Performance benchmarks within budgets
- [ ] UI tested across target browsers (Chrome, Firefox, Safari latest)
- [ ] Accessibility verified (keyboard nav + screen reader spot check)
- [ ] Code review approved
- [ ] Documentation updated (if public API changed)
- [ ] Deployed to staging and smoke tested

---

## Governance

### Constitutional Authority

This constitution supersedes all other project documentation, conventions, and practices. When conflicts arise, constitution principles take precedence.

### Amendment Process

**Minor Amendments** (clarifications, wording improvements):
- Propose via PR to constitution file
- One approval required
- Increment PATCH version

**Major Amendments** (new principles, removed principles, stack changes):
- Propose via RFC (Request for Comments) document
- Discussion period minimum 7 days
- Approval from 2+ core contributors required
- Increment MAJOR or MINOR version based on impact
- Update all dependent templates immediately

### Compliance Review

**Per PR**: Reviewers verify constitutional compliance via checklist

**Quarterly**: Team reviews adherence to principles, identifies violations, proposes improvements

**Annual**: Evaluate if principles still serve project goals, propose major amendments if needed

### Violation Handling

- **Accidental violations**: Fix in follow-up PR, document lesson learned
- **Deliberate violations**: Only permitted with explicit justification in PR description, tracked as technical debt
- **Repeated violations**: Indicate constitution needs amendment (too strict) or team needs training

### Version Control

Version numbers follow semantic versioning:
- **MAJOR**: Backward-incompatible changes (removing principles, stack changes)
- **MINOR**: New principles or materially expanded guidance
- **PATCH**: Clarifications, wording improvements, non-semantic fixes

---

**Version**: 1.0.0 | **Ratified**: 2026-01-13 | **Last Amended**: 2026-01-13
