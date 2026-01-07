# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Manifold** (曾用名: "lisct") is a knowledge management and information organization system based on set theory and Lisp-inspired operations. The core concept is to represent all information as sets and their intersections, allowing automatic aggregation and avoiding the limitations of traditional hierarchical or graph-based structures.

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
- 包含什么，就会被什么所包含
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

## Mathematical Model（数学模型）

### 核心数学结构：稀疏超图（Sparse Hypergraph）

经过深入分析，Manifold 的底层数学模型是 **稀疏超图**，而非传统的树或图结构。

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

### No Build/Test Commands Yet
This repository has no build system, package manager, or test framework configured. These will need to be established as implementation begins.

## Git Information
- Remote: `git@github.com-work:yuanshenstarto/layers.git`
- Main branch: `main`
