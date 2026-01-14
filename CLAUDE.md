# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Interfold** (曾用名: "Manifold", "lisct") is a knowledge management and information organization system based on set theory, manifold theory, and Lisp-inspired operations. The core concept is to represent all information as sets and their intersections, allowing automatic aggregation and avoiding the limitations of traditional hierarchical or graph-based structures.

**命名含义**:
- **Interfold（交叠）**: Inter（之间）+ Fold（折叠），表达信息在不同维度之间的交叠与折叠
- **基于 Manifold 理论**: 底层架构基于数学中的流形（Manifold）概念 - "同一本体在不同坐标系（视角）下的不同表现"
- **核心理念**: 项目关注的不是组织方法，而是信息的统一本体 - 那个隐藏在各种视角下、让所有信息被联系到一起的存在
- **品牌定位**: Interfold（产品层）+ Manifold（架构层）= 完整的技术与品牌故事

**Current Status**: Implementation in progress using T3 Stack (Next.js, tRPC, Drizzle ORM, Better Auth).

---

## Tech Stack & Development

### Technology Stack
This project is built with the [T3 Stack](https://create.t3.gg/):
- **Next.js 15** - React framework with App Router
- **tRPC 11** - End-to-end typesafe APIs
- **Drizzle ORM** - TypeScript ORM for PostgreSQL
- **Better Auth** - Authentication with GitHub OAuth support
- **TanStack Query** - Data fetching and caching
- **Tailwind CSS v4** - Styling
- **Biome** - Linting and formatting
- **TypeScript 5** - Type safety
- **pnpm** - Package manager

### Project Structure
```
src/
├── app/                          # Next.js App Router
│   ├── api/
│   │   ├── auth/[...all]/       # Better Auth API routes
│   │   └── trpc/[trpc]/         # tRPC API handler
│   ├── _components/             # Server components
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
├── server/
│   ├── api/
│   │   ├── routers/             # tRPC route handlers
│   │   ├── root.ts              # Root tRPC router
│   │   └── trpc.ts              # tRPC setup & procedures
│   ├── better-auth/             # Authentication configuration
│   │   ├── config.ts            # Better Auth setup
│   │   ├── client.ts            # Client-side auth
│   │   └── server.ts            # Server-side auth
│   └── db/
│       ├── schema.ts            # Database schema (Drizzle)
│       └── index.ts             # Database client
├── trpc/
│   ├── react.tsx                # tRPC React Query setup
│   ├── server.ts                # Server-side tRPC caller
│   └── query-client.ts          # Query client config
└── env.js                       # Environment variable validation
```

### Common Commands

**Development**:
```bash
pnpm dev              # Start development server with Turbopack
pnpm build            # Build for production
pnpm start            # Start production server
pnpm preview          # Build and start production server
```

**Code Quality**:
```bash
pnpm check            # Run Biome linter and formatter checks
pnpm check:write      # Auto-fix safe issues
pnpm check:unsafe     # Auto-fix including unsafe changes
pnpm typecheck        # Run TypeScript type checking
```

**Database**:
```bash
./start-database.sh   # Start local PostgreSQL in Docker
pnpm db:push          # Push schema changes to database
pnpm db:generate      # Generate migrations
pnpm db:migrate       # Run migrations
pnpm db:studio        # Open Drizzle Studio (database GUI)
```

### Environment Setup

1. **Copy environment template**:
   ```bash
   cp .env.example .env
   ```

2. **Required environment variables** (see `.env.example`):
   - `DATABASE_URL` - PostgreSQL connection string
   - `BETTER_AUTH_SECRET` - Secret for session signing (production only)
   - `BETTER_AUTH_GITHUB_CLIENT_ID` - GitHub OAuth app ID
   - `BETTER_AUTH_GITHUB_CLIENT_SECRET` - GitHub OAuth secret

3. **Start local database**:
   ```bash
   ./start-database.sh  # Starts PostgreSQL in Docker
   pnpm db:push         # Initialize database schema
   ```

### Architecture Notes

**tRPC Setup**:
- Context includes database client and user session from Better Auth
- `publicProcedure` - Available to all users (session optional)
- `protectedProcedure` - Requires authentication
- Includes timing middleware with artificial delay in development (100-500ms) to catch waterfall issues

**Authentication**:
- Better Auth configured with email/password and GitHub OAuth
- Session data available in tRPC context via `ctx.session`
- Protected routes check `ctx.session?.user` existence

**Database**:
- PostgreSQL with Drizzle ORM
- Table prefix: `pg-drizzle_*` (configured in schema.ts)
- Tables: `user`, `session`, `account`, `verification`, `post`
- Uses relations API for type-safe joins

**Path Aliases**:
- `~/` maps to `src/` (configured in tsconfig.json)
- Example: `import { db } from "~/server/db"`

### Development Workflow

1. **Starting development**:
   ```bash
   ./start-database.sh  # Start database (first time)
   pnpm dev             # Start Next.js dev server
   ```

2. **Making database changes**:
   - Edit `src/server/db/schema.ts`
   - Run `pnpm db:push` to apply changes
   - Or use `pnpm db:generate` + `pnpm db:migrate` for migration files

3. **Adding tRPC endpoints**:
   - Create/edit routers in `src/server/api/routers/`
   - Export from `src/server/api/root.ts`
   - Use in components via `api.routerName.procedureName.useQuery()`

4. **Code formatting**:
   - Biome runs automatically on save (if IDE configured)
   - Manual: `pnpm check:write`

---

## Understanding Manifold Theory（理解流形理论）

### 什么是流形？（初学者指南）

流形（Manifold）是 Interfold 底层架构的数学基础。用最简单的话说：

> **流形 = 一个整体很复杂的空间，但局部看起来像我们熟悉的平坦空间**

#### 日常例子：地球表面 🌍

```
局部视角（你所在的位置）：
  - 看起来是平的
  - 可以用简单的地图（x, y 坐标）表示
  - 导航很容易

全局视角（从太空看）：
  - 实际是球形的
  - 没有单一的平面地图可以完美覆盖
  - 需要多个局部地图拼接

这就是一个2维流形！
```

#### 核心特征

1. **局部坐标系**
   ```
   在北京：用(经度 116°, 纬度 40°)描述位置
   在纽约：用(经度 -74°, 纬度 41°)描述位置

   同一个地球，不同的局部坐标系
   ```

2. **坐标变换**
   ```
   从北京坐标系 → 纽约坐标系
   需要一个转换规则

   这就是流形的核心：
   - 多个局部视角（坐标系）
   - 它们之间可以转换
   - 但描述的是同一个整体
   ```

3. **统一本体**
   ```
   地球本身（本体）是统一的
   但从不同位置看到的景象（表现）是多样的
   ```

### Manifold 理论如何映射到 Interfold？

| 流形概念 | Interfold 实现 | 例子 |
|---------|---------------|------|
| **本体（整体）** | 信息本身 | "React Hooks 的闭包陷阱"这条知识 |
| **局部坐标系** | 不同视角 | React 视角、Hooks 视角、Closure 视角 |
| **局部表示** | 树状大纲 | 从某个视角展开的树状结构 |
| **坐标变换** | 视角切换 | 点击切换视角，树结构自动重组 |
| **全局结构** | 超图 | 所有交集关系的完整网络 |

#### 具体对比

**传统笔记系统**：
```
React/
  ├─ Hooks/
  │   └─ closure-trap.md  ← 文件只能在一个位置
  └─ ...

问题：这个笔记应该放在 React 下还是 JavaScript 下？
```

**Interfold（基于 Manifold 理论）**：
```
同一条信息，多个视角自动可见：

从 React 视角看：
React
  └─ Hooks
       └─ Closure
           └─ "闭包陷阱内容"

从 Closure 视角看：
Closure
  └─ React
       └─ Hooks
           └─ "闭包陷阱内容"

从 JavaScript 视角看：
JavaScript
  └─ Closure
       └─ React
           └─ "闭包陷阱内容"
```

**关键洞察**：
- 信息本身（本体）只存储一次
- 但可以从任何相关视角（局部坐标系）访问
- 视角切换（坐标变换）是自动的

### 为什么叫 "Interfold"？

**Interfold = Inter（之间）+ Fold（折叠）**

1. **几何意义**：维度的折叠与交叠
   ```
   高维知识空间 → 折叠(fold) → 树状视图（低维投影）
   不同视角的树 → 交叠(inter) → 形成交集
   ```

2. **与 Manifold 的关联**
   ```
   Manifold（流形）：描述整体空间的几何结构
   Fold（折叠）：流形的局部坐标变换
   Interfold（交叠）：不同流形/视角的重叠交汇
   ```

3. **品牌叙事**
   ```
   技术层：Manifold 理论（数学基础）
   产品层：Interfold 体验（用户界面）

   完整故事：
   "Interfold 是一个基于 Manifold 理论的知识管理系统。
    你的知识像流形一样，可以从任何视角展开，
    在不同维度之间自由折叠和交叠。"
   ```

### 哲学深度

**东西方哲学的共鸣**：

| 哲学传统 | 核心概念 | 与 Manifold/Interfold 的对应 |
|---------|---------|---------------------------|
| **道家** | 道生一，一生二，二生三，三生万物 | 本体（道）是统一的，表现（万物）是多样的 |
| **佛教** | 因陀罗网：珠珠相映，重重无尽 | 每个视角映照所有其他视角 |
| **全息原理** | 部分包含整体信息 | 每个局部坐标系包含全局信息 |
| **现象学** | 本体在现象中显现 | 信息本体在不同视角中显现 |

**一句话总结**：
> Manifold 描述了"一即一切，一切即一"的数学结构，Interfold 则是让用户在这个结构中自由探索的工具。

## Core Concepts

### Problem Being Solved
- **Data fragmentation**: Information scattered across multiple locations (e.g., notes vs. error corrections for the same concept)
- **Tree structure limitations**: Rigid hierarchies (like Dewey Decimal) and overlapping branches causing redundancy
- **Bidirectional linking limitations**: Links hide details; relationship context gets lost in graph visualizations
- **No automatic aggregation**: Traditional systems require manual linking; information remains isolated

### Solution Architecture - 核心突破

#### 1. **一切皆集合**（Pure Set Model）
- **关键**: 不存在"内容"这个独立数据类型，所有信息都是集合，就像黑洞的所有信息都可以被包含在其表面上一样，内部没有信息。集合本身就是信息
- 集合可以包含交集类型的子集
- 原子集合：不再细分的最小信息单元，也是集合
- 类比：原子不是"不同类型的东西"，只是"不再细分的粒子"
- **集合的特性**： 交换律，比如存在 (A,B,C)之后，在B下，因为省略的原因，就会看到(A,C)，AC的顺序是没有变化的；而且有一个恨好的应用，在阅读别人分享的知识树的时候，只要在某个节点上添加自己的内容，比如“JS”，那么这个树的整个路径都会作为 JS 的子集，被自动收集到自己的JS笔记里面。

#### 2. **视角相对的树结构**（Perspective-Relative Trees）
用户在 React 视角下创建大纲：
```
React
  └─ Hooks
       └─ Closure
```
系统记录交集 `(React, Hooks, Closure)` 的存在，自动生成其他视角：

```
Hooks 视角：               Closure 视角：
Hooks                     Closure
  └─ React                  └─ React
       └─ Closure                └─ Hooks
```

**突破性**: 同一信息在不同视角下自动重组为不同的层级结构，树不再固定。

#### 3. **自动聚合的本质**
- 用户自然地在描述复合信息（如"JavaScript 的闭包原理"）
- 应用金字塔原理等思考技巧时，信息自然形成树状结构
- 路径上的所有集合元素自动关联，无需人工决定"信息属于 A 和 B"
- 交集不会自动产生，只有用户创建的交集才存在（无交集爆炸问题）

#### 4. **零额外认知负担**
- 基础用户：完全当传统大纲编辑器使用，维护一棵树
- 进阶用户：发现同一信息可以从多个视角访问
- 高级用户：利用 Lisp 表达式进行元编程和自动化

#### 5. **Lisp-based operations**
- 进阶功能，不强制暴露给基础用户
- 代表用户层的底层实现
- 用户可以无限扩展使用方式，让应用完全适应自己
- Example: `(.chat @alice @bob)` creates a chat collection with two users, infact it creates a set: ((internal chat) (internal user alice) (internal user bob)).

### 用户交互模型（User Interaction Model）

#### 基础操作：大纲编辑器
- **换行**: 创建同级节点
- **Tab 缩进**: 创建下级节点，或者说创建一个隐藏了上级信息的交集
- **路径即交集**: 从根到叶的路径上所有元素构成该信息的集合成员
- 示例：在 `React > Hooks > Closure` 下输入内容，自动创建交集 `(React, Hooks, Closure)`

#### 视角切换
- **单击**: 在当前视图展开/折叠
- **双击/特殊操作**: 切换到以该元素为根的视角
- **面包屑导航**: 显示当前路径
- **多窗口/分屏**: 同时查看多个视角

#### 发现和导航
- **根视角**: 用户设置的起始集合（如"工作"、"学习"）
- **最近访问**: 显示最近查看的视角
- **全局搜索**: 快速跳转到任何集合元素
- **关联提示**: 显示当前元素参与的其他交集

### 日常类比（Everyday Metaphors）

#### 照片和相册
传统笔记软件就像纸质相册，一张照片只能放在一个相册里。想把全家福同时放在"2024春节"和"奶奶的照片"里？得打印两份。

**Interfold** 就像现代手机相册：
- 一张照片（信息）可以同时出现在多个相册（视角）里
- 系统自动识别：这是2024年、这是春节、这有奶奶、这是聚餐
- 打开任何一个相册，都能看到这张照片
- 从"奶奶"相册进入，按"春节/生日/日常"组织；从"春节"相册进入，按"奶奶/爸妈/孩子"组织
- **同样的照片，不同的组织方式，自动生成**

#### 图书馆的多重索引
传统图书馆的书必须选择一个位置摆放（按作者？按主题？按年份？）。

**Interfold** 像是理想的图书馆索引系统：
- 同一本《三体》
- 在"科幻小说"索引下能找到
- 在"中国作家"索引下能找到
- 在"获奖作品"索引下能找到
- 书只有一本，但所有索引系统都指向它

### 与现有方案的本质区别

| 方案 | 信息-分类关系 | 多维组织 | 层级表达 | 自动重组 |
|------|--------------|----------|---------|---------|
| 文件夹 | 1对1 | ✗ | ✓ 固定树 | ✗ |
| 标签 | 1对多 | ✓ 扁平 | ✗ 无层级 | ✗ |
| 双向链接 | 多对多 | ✓ 手动建立 | ✗ 图状 | ✗ |
| Notion DB | 1对多 | ✓ 需预设字段 | ○ 通过关系 | ✗ |
| **Interfold** | **多对多** | **✓ 自动** | **✓ 多视角树** | **✓ 自动** |

**独特价值**：
1. **消除存储位置焦虑** - "React Hooks 的闭包陷阱"属于 React？Hooks？闭包？JavaScript？无需选择，自动在所有视角下正确归类
2. **知识的多面体视图** - 同一信息可以按技术栈、题型、难度等多个维度自动组织
3. **写作即结构化** - 用户在自然表达时就已经建立结构，无需事后整理

### Design Philosophy

Interfold 的设计哲学源自多个概念来源：

- **Manifold Theory（流形理论）**: Same entity, different coordinate systems (perspectives)
  - 核心数学基础：统一本体的多视角表现
- **Interfold（交叠）**: Folding and unfolding between dimensions
  - 产品名称：维度之间的折叠与交叠
- **Taoism（道家）**: Simplicity generating complexity (大道至简，但又衍生万物)
  - 本体统一，表现多样
- **Lisp**: Self-extension and infinite extensibility
  - 同像性（homoiconicity）：代码即数据
- **Holography（全息）**: Information encoded on surfaces (like black hole information paradox)
  - 每个部分包含整体的信息，"一花一世界"
- **Indra's Net（因陀罗网）**: Pearls reflecting each other infinitely
  - 珠珠相映，重重无尽
- **Universal interconnection（普遍联系）**: All things are related and influence each other
  - 包含什么，就会被什么所包含

**命名历程**: overlapping → bridges → wormholes → layers → lists → unity → holography → **manifold** → **interfold**

## Development Context

### Language
The primary language for this codebase will be **Chinese** for documentation and comments, as evidenced by `stories.org` being entirely in Chinese. Code identifiers should follow standard English conventions, but user-facing text and internal documentation may be in Chinese.

### Project Documentation
- `stories.org`: Core project vision and problem/solution description (Emacs org-mode format)
- `README.md`: Currently empty, will need project introduction

### MVP 核心功能（Minimum Viable Product）

实现原型时，专注于三个核心功能验证核心价值：

#### 1. 大纲编辑器（Outliner）
- 换行创建同级节点
- Tab 缩进创建下级节点
- 输入和编辑文本内容
- 路径上所有元素自动构成集合交集

#### 2. 视角切换（Perspective Switch）
- 右键菜单："以此为根视角"
- 显示所有包含该元素的交集，按新视角重新组织层级
- 面包屑导航显示当前位置

#### 3. 搜索/跳转（Search & Navigation）
- 输入关键词，找到所有包含该元素的集合
- 快速在不同视角间切换
- 显示元素参与的交集数量

### 典型使用场景（Use Cases）

#### 场景 1：前端学习笔记
**传统方案痛点**: "React Hooks 的闭包陷阱"应该放在 React 文件夹还是 JavaScript 文件夹？

**Interfold 解决方案**:
- 用户在大纲中输入：`React > Hooks > Closure > 闭包陷阱`
- 系统自动创建交集 `(React, Hooks, Closure, 闭包陷阱)`
- 从 React 视角看：树状组织的 React 知识
- 从 Closure 视角看：所有关于闭包的内容，包括 React Hooks 的部分
- 从 JavaScript 视角看：按语言特性组织的知识
- **同一条笔记，三个视角自动可见**

#### 场景 2：org-roam 散布信息的聚合
**传统方案痛点**: org-roam 中散布在不同文档中的 jsapi 内容无法自动聚合到一个文档并生成树状图。

**Interfold 解决方案**:
- 用户在多个地方写了包含 jsapi 的内容
- 每条都自然地标记了所属集合（如 `jsapi > DOM`, `jsapi > Event`, `jsapi > Storage`）
- 打开 "jsapi 视角"，自动看到：
  ```
  jsapi
    ├─ DOM
    │   └─ querySelector
    ├─ Event
    │   └─ addEventListener
    └─ Storage
        └─ localStorage
  ```
- **信息自动聚合，层级自动生成**

#### 场景 3：项目知识库的多维查看
**需求**: 同一个技术方案需要从"技术栈"、"模块"、"问题类型"多个维度查看

**Interfold 解决方案**:
- 创建 `(Frontend, React, Authentication, JWT, Security)`
- 从 Frontend 视角：所有前端相关技术方案
- 从 Authentication 视角：所有认证相关内容
- 从 Security 视角：所有安全问题及解决方案
- **无需预设字段，无需维护多个视图**

## Mathematical Model（数学模型）

### 核心数学结构：稀疏超图（Sparse Hypergraph）

经过深入分析，Interfold 的底层数学模型是 **稀疏超图**（基于 Manifold 理论），而非传统的树或图结构。

#### 为什么是超图？

**关键洞察**：
- 用户输入 `A > B > C` 时，不是在创建"A 包含 B，B 包含 C"的层级关系
- 而是在创建 **交集 (A, B, C)**，其中 A、B、C 是**平等的**集合成员
- **树状结构只是这个交集在"A 视角"下的投影表现**，不是数据的固有属性

**数学定义**：
```
超图 H = (V, E)
- V: 原子集合（顶点），如 {React, Hooks, Closure, JavaScript, ...}
- E: 用户创建的交集（超边），如 {{React, Hooks, Closure}, {JavaScript, Closure}, ...}
- 每个超边是 V 的一个子集，可以包含任意数量的元素
- 不要求"向下封闭"：不会自动生成所有子集（避免组合爆炸）
```

**与传统图的区别**：
- 传统图的边连接 2 个顶点
- 超图的超边可以连接 n 个顶点（n ≥ 1）
- (A,B,C) 是一个 3 元超边，不需要分解为 3 条普通边

#### 数据结构设计

```python
class AtomicSet:
    """原子集合（顶点/0-单纯形）"""
    id: str                    # 唯一标识
    name: str                  # 显示名称
    metadata: dict             # 可选的元数据

class Intersection:
    """交集（超边/k-单纯形，k = len(elements) - 1）"""
    elements: Set[AtomicSet]           # 无序集合！满足交换律
    content: Any                       # 附着的信息/内容
    created_via_path: List[AtomicSet]  # 保留用户创建时的视角顺序
    created_at: datetime               # 创建时间

# 例子
React = AtomicSet(id="react", name="React")
Hooks = AtomicSet(id="hooks", name="Hooks")
Closure = AtomicSet(id="closure", name="Closure")

intersection = Intersection(
    elements={React, Hooks, Closure},        # 数学上无序
    content="闭包陷阱的详细说明...",
    created_via_path=[React, Hooks, Closure]  # 用户的视角
)
```

**为什么保留 `created_via_path`？**
- **数学上**：集合是无序的，(A,B,C) = (B,A,C) = (C,B,A)
- **展示上**：用户在特定视角下创建，这个视角决定了默认展示顺序
- **视角切换规则**：从 B 视角展开时，B 提到最前，A 和 C 保持相对顺序

#### 核心特性

1. **顶点不重复**：每个原子集合（如 React）只存储一次
2. **关系通过超边表达**：(A,B,C) 作为一个整体存在，不拆分
3. **稀疏性**：只存储用户明确创建的交集，不自动生成所有子集
4. **无损无重复存储**：在存储层面，每个信息只记录一次
5. **多视角投影**：在展示层面，根据选择的根元素动态生成树状结构

#### 可视化策略

不同规模的交集采用不同的可视化方式：

##### 低维交集（2-3 个元素）：图状可视化

**2 元交集 (A,B)**：
```
A ━━━━━ B  （一条边）
```

**3 元交集 (A,B,C)** - 多种可视化方式：

1. **单纯复形风格**（传统几何表示）：
```
      A
     /|\
    / │ \
   /  △  \   △ 表示填充的面
  /___|___\
 B         C

注意：如果 (A,C) 不作为独立交集存在，可以用虚线表示
```

2. **星形表示法**（超边节点）：
```
     A
     |
     |
  B──●──C    ● 代表超边本身（作为一个可点击的节点）
```

3. **包围圈/包围盒**：
```
  ┌─────────┐
  │ A   B   │
  │   C     │  虚线框表示超边
  └─────────┘
```

4. **颜色编码**：
```
A ─── B ─── C

用相同的背景色或高亮色标识属于同一超边
```

##### 高维交集（4+ 个元素）：组合可视化

当交集包含 4 个以上元素时，无法在 2D/3D 空间中完整可视化为单纯复形：

**策略 1：符号表示**
```
[A, B, C, D, E]  （5 元超边）
  └─ 点击展开查看详情
      - 包含 5 个元素
      - 切换到树状视图
      - 切换到列表视图
```

**策略 2：降维投影**
```
固定某些维度，在低维子空间中可视化：
- 固定 A：在 (B,C,D,E) 的 4 维子空间中查看
- 继续固定 B：在 (C,D,E) 的 3 维子空间中查看（可以画三角形）
```

**策略 3：交互式探索**
```
显示部分连接 + "还有 N 个元素" 的提示
点击展开查看完整列表
```

##### 视图模式总结

| 交集大小 | 主要可视化方式 | 备选方式 |
|---------|---------------|---------|
| 1 元 | 单个顶点 | - |
| 2 元 | 一条边 | - |
| 3 元 | 填充三角形/星形节点 | 包围圈/颜色编码 |
| 4-5 元 | 简化投影 + 符号标记 | 树状/列表视图 |
| 6 元+ | 树状/列表视图 | 交互式降维 |

#### 与其他数学结构的关系

| 结构 | 关系 | 说明 |
|------|------|------|
| **单纯复形** | 特殊情况 | 如果自动生成所有子集，超图变成单纯复形 |
| **偏序集** | 可导出 | 用子集关系 ⊆ 可将超图视为偏序集 |
| **哈斯图** | 可视化方式 | 偏序集的标准可视化，显示覆盖关系 |
| **普通图** | 退化情况 | 如果所有超边都只包含 2 个元素 |

#### 操作示例

**用户创建的操作**：
```
1. React > Hooks > Closure
2. JavaScript > Closure
3. React > useState
4. React > Hooks > useEffect
```

**存储的超图**：
```
顶点 V = {React, Hooks, Closure, JavaScript, useState, useEffect}

超边 E = {
  {React, Hooks, Closure}    - "闭包陷阱内容"
  {JavaScript, Closure}      - "JS 闭包内容"
  {React, useState}          - "状态管理内容"
  {React, Hooks, useEffect}  - "副作用内容"
}
```

**从 Closure 视角生成的树**：
```
Closure
├─ [via React > Hooks]
│  └─ "闭包陷阱内容"
└─ [via JavaScript]
   └─ "JS 闭包内容"
```

**图状可视化**：
```
        Hooks
       /  |  \
      /   |   \
  React   |   useEffect
    | \   |    /
    |  \  |   /
    |   \ |  /
useState  Closure
            |
        JavaScript

图例：
- ● 实心点：顶点（原子集合）
- ━ 实线：2 元超边
- △ 填充区域：3 元超边
```

### Critical Implementation Considerations

When implementing this system:

#### 核心原则
1. **一切皆集合**: 不存在独立的"内容"数据类型，所有信息都是集合
   - 集合只包含交集类型的子集
   - 原子集合是最小不可分的信息单元
   - 数据模型必须保持类型统一

2. **树状大纲视图是对每一个集合做递归的省略父集的最近子集展开**: 从根到节点的路径上所有元素构成该信息的集合成员
   - 例如：`React > Hooks > Closure` 自动创建交集 `(React, Hooks, Closure)`
   - 交集满足交换律：`(React, Hooks)` 等同于 `(Hooks, React)`

3. **视角决定层级**: 同一交集在不同视角下展现不同的树结构
   - 选择哪个元素作为根，决定了如何组织其他元素
   - 必须能高效地从不同视角重构树结构

4. **嵌套集合支持**: 支持 `((King, son) Prince)` 这样的复合概念
   - 用于表达更精确的包含关系
   - 避免歧义（如区分 "son - King" 和 "(King, son)"）

5. **lisp的同像性**：支持像lisp那样，使用list来表示集合和交集，也可以使用list来表达操作这些list的程序。
   - 于是就可以实现”待办应用“、”flash card“等应用或者小插件。也可以灵活地封装自己对于列表的操作。

#### 技术实现要点
5. **索引和查询**:
   - 需要高效查找"包含某元素的所有交集"
   - 考虑使用倒排索引：元素 -> 包含它的交集列表
   - 缓存常用视角的树结构

6. **渐进式披露复杂性**:
   - Level 1: 基础用户只需理解大纲编辑器
   - Level 2: 发现视角切换功能
   - Level 3: 主动利用多视角组织
   - Level 4: Lisp 表达式元编程

7. **Lisp S-expressions for advanced users**:
   - 不强制暴露给基础用户
   - 用于元编程和自动化
   - 示例：`(.chat @alice @bob)`, `(intersection React 进阶)`
   - 这些是所有数据的底层实现，虽然用户可以不用在乎，但是整个应用有着简单一致的可以无限扩展的底层。

8. **性能考虑**:
   - 大规模数据（1000+ 节点）时的视角切换速度
   - 实时更新所有相关视图
   - 考虑使用增量计算和虚拟化渲染

## Implementation Guidelines

When implementing Interfold features:

1. **Database Schema for Hypergraph**:
   - Create tables for atomic sets (vertices) and intersections (hyperedges)
   - Index atomic sets for fast lookups
   - Store intersection elements as array/JSONB for flexible querying
   - Consider `created_via_path` for preserving user's original perspective

2. **API Design**:
   - Create tRPC routers for set operations (create, query, delete)
   - Implement perspective switching logic server-side
   - Use TanStack Query for caching perspective trees
   - Consider real-time updates for collaborative features

3. **UI Components Priority** (MVP):
   - Outliner component (Tab/Shift+Tab for indent/dedent)
   - Perspective switcher (context menu or button)
   - Breadcrumb navigation
   - Search/filter for atomic sets

4. **Performance Considerations**:
   - Implement inverted index: atomic_set_id → list of intersection_ids
   - Cache frequently accessed perspectives
   - Use virtual scrolling for large outlines
   - Lazy load intersection details

## Git Information
- Remote: `git@github.com-work:yuanshenstarto/layers.git`
- Main branch: `main`

## Active Technologies
- TypeScript 5 (strict mode), React 19, Node.js 20+ + Next.js 15 (App Router), tRPC 11, Drizzle ORM 0.41, Better Auth 1.3, TanStack Query 5.69, Tailwind CSS v4 (001-outline-editor)
- PostgreSQL 16+ with Drizzle ORM (already configured via `start-database.sh`) (001-outline-editor)

## Recent Changes
- 001-outline-editor: Added TypeScript 5 (strict mode), React 19, Node.js 20+ + Next.js 15 (App Router), tRPC 11, Drizzle ORM 0.41, Better Auth 1.3, TanStack Query 5.69, Tailwind CSS v4
