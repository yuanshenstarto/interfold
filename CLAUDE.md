# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Layers** (formerly "lisct") is a knowledge management and information organization system based on set theory and Lisp-inspired operations. The core concept is to represent all information as sets and their intersections, allowing automatic aggregation and avoiding the limitations of traditional hierarchical or graph-based structures.

**Current Status**: Early planning/design phase - no implementation code exists yet.

## Core Concepts

### Problem Being Solved
- **Data fragmentation**: Information scattered across multiple locations (e.g., notes vs. error corrections for the same concept)
- **Tree structure limitations**: Rigid hierarchies (like Dewey Decimal) and overlapping branches causing redundancy
- **Bidirectional linking limitations**: Links hide details; relationship context gets lost in graph visualizations
- **No automatic aggregation**: Traditional systems require manual linking; information remains isolated

### Solution Architecture
1. **Set-based representation**: Treat all information as sets
2. **Intersection-driven hierarchy**: Use intersections like (A,B) and (A,B,C) to create implicit tree structures
   - A set's intersection with another is always a subset, naturally forming hierarchies
   - Example: Set A contains (A,B), which contains (A,B,C)
3. **Automatic aggregation**: Information automatically appears in all relevant contexts through intersection mechanics
4. **Lisp-based operations**: Use S-expressions to manipulate sets and metadata
   - Example: `(.chat @alice @bob)` creates a chat collection with two users

### Design Philosophy
The project name and architecture draw from multiple conceptual sources:
- **Taoism**: Simplicity generating complexity (大道至简，但又衍生万物)
- **Lisp**: Self-extension and infinite extensibility
- **Holography**: Information encoded on surfaces (like black hole information paradox)
- **Wormholes**: Intersections as connections between universes (sets)
- **Universal interconnection**: All things are related and influence each other

Naming themes: overlapping, bridges, wormholes, layers, lists

## Development Context

### Language
The primary language for this codebase will be **Chinese** for documentation and comments, as evidenced by `stories.org` being entirely in Chinese. Code identifiers should follow standard English conventions, but user-facing text and internal documentation may be in Chinese.

### Project Documentation
- `stories.org`: Core project vision and problem/solution description (Emacs org-mode format)
- `README.md`: Currently empty, will need project introduction

### Critical Implementation Considerations

When implementing this system:

1. **Set operations are fundamental**: The entire system is built on set theory - intersections, unions, and subset relationships drive the data model
2. **Lisp S-expressions for syntax**: User-facing syntax should use parenthesized list notation
3. **Intersection mechanics**: The key insight is that (A,B) is automatically a subset of both A and B, creating bidirectional relationships without explicit linking
4. **Meta-operation support**: The system should support "operations on operations" following Lisp philosophy
5. **Universal applicability**: Should work for diverse use cases: chat, blogs, forums, Notion-like databases

### No Build/Test Commands Yet
This repository has no build system, package manager, or test framework configured. These will need to be established as implementation begins.

## Git Information
- Remote: `git@github.com-work:yuanshenstarto/layers.git`
- Main branch: `main`
