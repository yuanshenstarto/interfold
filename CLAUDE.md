# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Manifold** (曾用名: "Layers", "lisct") is a knowledge management and information organization system based on set theory and Lisp-inspired operations. The core concept is to represent all information as sets and their intersections, allowing automatic aggregation and avoiding the limitations of traditional hierarchical or graph-based structures.

**命名含义**: Manifold（流形）源自数学，表达"同一本体在不同坐标系（视角）下的不同表现"。项目关注的不是组织方法，而是信息的统一本体 - 那个隐藏在各种视角下、让所有信息被联系到一起的存在。

**Current Status**: Early planning/design phase - no implementation code exists yet.

## Core Concepts

### Problem Being Solved
- **Data fragmentation**: Information scattered across multiple locations (e.g., notes vs. error corrections for the same concept)
- **Tree structure limitations**: Rigid hierarchies (like Dewey Decimal) and overlapping branches causing redundancy
- **Bidirectional linking limitations**: Links hide details; relationship context gets lost in graph visualizations
- **No automatic aggregation**: Traditional systems require manual linking; information remains isolated

### Solution Architecture - 核心突破

#### 1. **一切皆集合**（Pure Set Model）
- **关键**: 不存在"内容"这个独立数据类型，所有信息都是集合
- 集合可以包含交集类型的子集
- 原子集合：不再细分的最小信息单元，也是集合
- 类比：原子不是"不同类型的东西"，只是"不再细分的粒子"

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
- Example: `(.chat @alice @bob)` creates a chat collection with two users

### 用户交互模型（User Interaction Model）

#### 基础操作：大纲编辑器
- **换行**: 创建同级节点
- **Tab 缩进**: 创建下级节点
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

**Manifold** 就像现代手机相册：
- 一张照片（信息）可以同时出现在多个相册（视角）里
- 系统自动识别：这是2024年、这是春节、这有奶奶、这是聚餐
- 打开任何一个相册，都能看到这张照片
- 从"奶奶"相册进入，按"春节/生日/日常"组织；从"春节"相册进入，按"奶奶/爸妈/孩子"组织
- **同样的照片，不同的组织方式，自动生成**

#### 图书馆的多重索引
传统图书馆的书必须选择一个位置摆放（按作者？按主题？按年份？）。

**Manifold** 像是理想的图书馆索引系统：
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
| **Manifold** | **多对多** | **✓ 自动** | **✓ 多视角树** | **✓ 自动** |

**独特价值**：
1. **消除存储位置焦虑** - "React Hooks 的闭包陷阱"属于 React？Hooks？闭包？JavaScript？无需选择，自动在所有视角下正确归类
2. **知识的多面体视图** - 同一信息可以按技术栈、题型、难度等多个维度自动组织
3. **写作即结构化** - 用户在自然表达时就已经建立结构，无需事后整理

### Design Philosophy
The project name and architecture draw from multiple conceptual sources:
- **Taoism**: Simplicity generating complexity (大道至简，但又衍生万物)
- **Lisp**: Self-extension and infinite extensibility
- **Holography**: Information encoded on surfaces (like black hole information paradox)
  - 每个部分包含整体的信息，"一花一世界"
- **Wormholes**: Intersections as connections between universes (sets)
- **Universal interconnection**: All things are related and influence each other
- **Manifold (流形)**: Same entity, different coordinate systems (perspectives)

Naming considerations: overlapping, bridges, wormholes, layers, lists, unity, holography

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

**Manifold 解决方案**:
- 用户在大纲中输入：`React > Hooks > Closure > 闭包陷阱`
- 系统自动创建交集 `(React, Hooks, Closure, 闭包陷阱)`
- 从 React 视角看：树状组织的 React 知识
- 从 Closure 视角看：所有关于闭包的内容，包括 React Hooks 的部分
- 从 JavaScript 视角看：按语言特性组织的知识
- **同一条笔记，三个视角自动可见**

#### 场景 2：org-roam 散布信息的聚合
**传统方案痛点**: org-roam 中散布在不同文档中的 jsapi 内容无法自动聚合到一个文档并生成树状图。

**Manifold 解决方案**:
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

**Manifold 解决方案**:
- 创建 `(Frontend, React, Authentication, JWT, Security)`
- 从 Frontend 视角：所有前端相关技术方案
- 从 Authentication 视角：所有认证相关内容
- 从 Security 视角：所有安全问题及解决方案
- **无需预设字段，无需维护多个视图**

### Critical Implementation Considerations

When implementing this system:

#### 核心原则
1. **一切皆集合**: 不存在独立的"内容"数据类型，所有信息都是集合
   - 集合只包含交集类型的子集
   - 原子集合是最小不可分的信息单元
   - 数据模型必须保持类型统一

2. **路径即交集**: 从根到节点的路径上所有元素构成该信息的集合成员
   - 例如：`React > Hooks > Closure` 自动创建交集 `(React, Hooks, Closure)`
   - 交集满足交换律：`(React, Hooks)` 等同于 `(Hooks, React)`

3. **视角决定层级**: 同一交集在不同视角下展现不同的树结构
   - 选择哪个元素作为根，决定了如何组织其他元素
   - 必须能高效地从不同视角重构树结构

4. **嵌套集合支持**: 支持 `((King, son) Prince)` 这样的复合概念
   - 用于表达更精确的包含关系
   - 避免歧义（如区分 "son - King" 和 "(King, son)"）

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

8. **性能考虑**:
   - 大规模数据（1000+ 节点）时的视角切换速度
   - 实时更新所有相关视图
   - 考虑使用增量计算和虚拟化渲染

### No Build/Test Commands Yet
This repository has no build system, package manager, or test framework configured. These will need to be established as implementation begins.

## Git Information
- Remote: `git@github.com-work:yuanshenstarto/layers.git`
- Main branch: `main`
