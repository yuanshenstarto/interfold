# Feature Specification: Basic Outline Editor

**Feature Branch**: `001-outline-editor`
**Created**: 2026-01-14
**Status**: Draft
**Input**: User description: "base on @CLAUDE.md and this t3 stack, implement the basic outline editor"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create and Edit Outline Nodes (Priority: P1)

Users can create hierarchical outline structures by typing text and using simple keyboard shortcuts to create sibling and child nodes.

**Why this priority**: This is the core MVP functionality - the foundational interaction model that enables all outline creation. Without this, users cannot input any information into the system.

**Independent Test**: Can be fully tested by opening the editor, typing text, pressing Enter to create siblings, pressing Tab to create children, and verifying the outline structure persists. Delivers immediate value as a basic note-taking tool.

**Acceptance Scenarios**:

1. **Given** an empty outline editor, **When** user types "React" and presses Enter, **Then** a new empty sibling node appears below
2. **Given** a node with text "React", **When** user presses Enter then Tab, **Then** a new child node is created indented under "React"
3. **Given** a node with text "Hooks", **When** user presses Tab, **Then** the node becomes a child of the node above it
4. **Given** a child node, **When** user presses Shift+Tab, **Then** the node moves up one level in hierarchy
5. **Given** a node with text, **When** user clicks on it, **Then** cursor appears and text becomes editable
6. **Given** multiple nodes, **When** user refreshes the page, **Then** all nodes and their hierarchy are preserved

---

### User Story 2 - Navigate and Reorganize Outline (Priority: P2)

Users can efficiently navigate through their outline using keyboard shortcuts and mouse interactions, and reorganize nodes by changing their hierarchy.

**Why this priority**: After basic creation, users need to navigate and refine their outline structure. This enables users to organize information effectively without starting over.

**Independent Test**: Create a multi-level outline, use arrow keys to navigate between nodes, use Tab/Shift+Tab to adjust hierarchy, and verify the structure updates correctly.

**Acceptance Scenarios**:

1. **Given** multiple nodes in the outline, **When** user presses Arrow Down, **Then** focus moves to the next node in document order
2. **Given** multiple nodes in the outline, **When** user presses Arrow Up, **Then** focus moves to the previous node
3. **Given** a node with children, **When** user presses Arrow Right, **Then** the node's children become visible (if collapsed)
4. **Given** an expanded node with children, **When** user presses Arrow Left, **Then** the node's children collapse
5. **Given** a focused node, **When** user drags it to a different position, **Then** the node moves to the new location with its children
6. **Given** a node, **When** user presses Backspace on an empty node, **Then** the node is deleted and focus moves to the previous node

---

### User Story 3 - Automatic Set Intersection Creation (Priority: P3)

As users create hierarchical outlines, the system automatically creates set intersections based on the path from root to each node, enabling the manifold theory foundation.

**Why this priority**: This establishes the mathematical foundation for multi-perspective views. While invisible to basic users initially, it enables the future perspective-switching feature and differentiates Interfold from traditional outliners.

**Independent Test**: Create a path "React > Hooks > Closure", query the database to verify an intersection record exists with elements [React, Hooks, Closure] in that order, and verify the intersection can be retrieved.

**Acceptance Scenarios**:

1. **Given** user creates path "React > Hooks > Closure", **When** the node is saved, **Then** system creates atomic sets for "React", "Hooks", "Closure" (if they don't exist) and an intersection containing all three
2. **Given** an intersection (A, B, C) already exists, **When** user creates the same path again in a different location, **Then** system reuses the existing atomic sets and creates a new intersection record
3. **Given** user creates "React > useState", **When** saved, **Then** system creates intersection (React, useState) using the existing "React" atomic set
4. **Given** a node path changes from "A > B > C" to "A > B > D", **When** saved, **Then** the old intersection is archived and a new intersection (A, B, D) is created
5. **Given** a node is deleted, **When** confirmed, **Then** the associated intersection is marked as deleted but preserved for data integrity

---

### Edge Cases

- What happens when user creates a very deeply nested outline (10+ levels)?
- How does system handle very long node text (1000+ characters)?
- What happens when user rapidly presses Enter multiple times?
- How does system handle paste operations with formatted text?
- What happens when user tries to Tab on the first node (no parent available)?
- How does system handle concurrent edits from the same user in multiple tabs?
- What happens when user loses internet connection while editing?
- How does system handle special characters, emojis, and multi-byte characters in node text?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a text input field for each outline node that accepts plain text
- **FR-002**: System MUST create a new sibling node when user presses Enter key
- **FR-003**: System MUST create a new child node when user presses Enter followed by Tab
- **FR-004**: System MUST indent a node one level when user presses Tab key
- **FR-005**: System MUST outdent a node one level when user presses Shift+Tab key
- **FR-006**: System MUST navigate to the next node when user presses Arrow Down key
- **FR-007**: System MUST navigate to the previous node when user presses Arrow Up key
- **FR-008**: System MUST delete empty nodes when user presses Backspace
- **FR-009**: System MUST persist outline structure and content across browser sessions
- **FR-010**: System MUST support Unicode characters including emojis in node text
- **FR-011**: System MUST create atomic set records for each unique node name in the path
- **FR-012**: System MUST create intersection records capturing the full path from root to each node
- **FR-013**: System MUST preserve the order of elements in the created_via_path for each intersection
- **FR-014**: System MUST prevent creation of duplicate atomic sets with the same name
- **FR-015**: System MUST allow multiple intersection records with the same element set but different created_via_path
- **FR-016**: System MUST maintain referential integrity between intersections and atomic sets
- **FR-017**: System MUST auto-save changes within 2 seconds of user stopping typing
- **FR-018**: System MUST show visual feedback when content is being saved
- **FR-019**: System MUST prevent data loss by queueing saves during network interruptions
- **FR-020**: System MUST require user authentication to access their outline data

### Key Entities

- **Atomic Set**: Represents a unique concept or tag (e.g., "React", "Hooks"). Contains a unique identifier, display name, and optional metadata. Each atomic set is created once and reused across multiple intersections.

- **Intersection**: Represents a specific combination of atomic sets corresponding to a path in the outline (e.g., "React > Hooks > Closure"). Contains a set of atomic set references (unordered mathematically), the created_via_path (ordered list preserving user's perspective), optional content text, creation timestamp, and soft deletion flag.

- **Outline Node**: Represents the user-facing tree structure. Contains text content, parent node reference, position order among siblings, expansion state (collapsed/expanded), and links to the corresponding intersection record.

- **User**: Represents an authenticated user who owns outline data. Contains authentication credentials, session information, and references to their outline trees.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a 10-node outline in under 60 seconds using only keyboard shortcuts
- **SC-002**: Users can reorganize a 20-node outline by changing at least 5 node hierarchies in under 2 minutes
- **SC-003**: System saves changes within 2 seconds of user stopping typing, with visual confirmation
- **SC-004**: System supports outlines with at least 1000 nodes without performance degradation (scrolling remains smooth at 60fps)
- **SC-005**: 95% of users successfully create a multi-level outline (at least 3 levels deep) on their first session
- **SC-006**: Zero data loss occurs during network interruptions - all edits are queued and saved when connection restores
- **SC-007**: Keyboard navigation responds within 50ms of key press for outlines up to 1000 nodes
- **SC-008**: Users can access their outline data from any device after authenticating

## Assumptions *(optional)*

### Design Assumptions

- Users are familiar with basic text editing concepts (cursor positioning, selection, copy/paste)
- Users understand hierarchical structure from experience with file systems or other outliners
- Users primarily interact with keyboard for speed but expect mouse support for discovery
- Users expect auto-save behavior similar to Google Docs or Notion
- Single-user editing model for MVP (no real-time collaboration)

### Technical Assumptions

- PostgreSQL database is available and configured
- User authentication system (Better Auth) is operational
- Users have modern browsers supporting ES2020+ JavaScript
- Network latency is typically under 200ms for most users
- Users have sufficient local storage for client-side caching (at least 5MB)

### Business Assumptions

- Target users are knowledge workers who organize information in notes/documentation
- Users value keyboard efficiency over visual polish for MVP
- Users are willing to learn a small set of keyboard shortcuts (Enter, Tab, Shift+Tab, Arrows)
- Privacy is important - users expect their outline data to be secure and private

## Out of Scope *(optional)*

### Explicitly Excluded for MVP

- Rich text formatting (bold, italic, colors, fonts)
- Markdown syntax support
- Multiple outline documents or workspaces
- Perspective switching UI (data model supports it, but UI is future work)
- Real-time collaboration or multi-user editing
- Mobile app or touch-optimized interface
- Import/export functionality (CSV, JSON, Markdown)
- Search functionality across outline nodes
- Tagging or labeling nodes beyond the path-based set system
- Undo/redo functionality (browser's native undo may work partially)
- Drag-and-drop reordering (keyboard-only for MVP)
- Node templates or snippets
- Keyboard shortcut customization
- Dark mode or theme customization

### Future Considerations

- These excluded items may be added in future iterations based on user feedback
- The data model (atomic sets + intersections) supports perspective switching when UI is ready
- Real-time collaboration would require significant architectural changes (consider for v2.0)
