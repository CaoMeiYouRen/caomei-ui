# GitHub Projects 看板使用约定

> 适用于 caomei-ui 及下游协作项目的跨仓规划看板。

---

## 1. 看板定位

- **唯一聚合视图**：user-owned Project `CaoMei UI 项目`（`https://github.com/users/CaoMeiYouRen/projects/2`）
- 职责：**跨仓规划与状态的聚合视图**，不替代各仓 `docs/design/governance/` 的权威决策记录。
- 权威事实源：**各仓 governance 文档**；看板只反映状态流转。

---

## 2. Status 列定义（5 列，严禁增减）

| 列名 | 语义 | 对应本仓规划状态 | 触发动作 |
|------|------|------------------|----------|
| **Backlog** | 评估→backlog，未决策 | `docs/plan/backlog.md` 在册候选 | 评估通过、登记 backlog |
| **Todo** | 用户已决策，登记 `todo.md` | `docs/plan/todo.md` 当前阶段条目 | 用户决策授权、登记 todo |
| **In Progress** | 阶段/原子条目实施中 | PDTFC+ D/A/V/T 阶段进行中 | 开发者开始实施 |
| **In Review** | **等人工介入：待决策/验收/授权提交** | 等用户决策、批次完成待验收、待授权提交/推送 | 实施完成、推入审查态 |
| **Done** | 阶段收口、条目归档 | `docs/plan/todo-archive.md` 已归档 | 用户验收通过、提交归档 |

> **关键约定**：`In Review` **不代表**本地 Review Gate（R1/R2）或 V 阶段——那些是实施环内部动作，不表达等待。`In Review` 仅表达「条目卡在等人工」。

---

## 3. 自定义字段（克制原则）

| 字段 | 类型 | 选项/配置 | 维护责任 |
|------|------|-----------|----------|
| **Priority** | Single select | P0(阻断/紧急,红) / P1(高,橙) / P2(正常,黄) / P3(低/可选,绿) | PM/开发者 |
| **Iteration** | Iteration | 按 2 周迭代创建，含 breaks | PM |
| **Size** | Single select | XS(≤0.5d) / S(1d) / M(2-3d) / L(1 周) / XL(>1 周) | 开发者估算 |
| **Repository** | 内建 | 自动同步 issue 所属仓 | — |

**禁止新增**同义字段（如 Target date、Estimate 等与 Iteration/Size 重叠的字段）。

---

## 4. 视图

| 视图 | 类型 | 用途 | 核心配置 |
|------|------|------|----------|
| **Board** | Board | 日常流转、拖拽状态 | Group by Status，显示 Priority/Iteration/Size |
| **Roadmap** | Roadmap | 迭代排期、时间线视角 | Group by Iteration，显示 Status/Priority |

**不创建** Table 视图（批量编辑可在 Board 复制粘贴单元格完成）。

---

## 5. 自动化（内置 workflow）

| Workflow | 状态 | 说明 |
|----------|------|------|
| Item closed → Done | ✅ 启用 | issue/PR 关闭自动置 Done |
| Pull request merged → Done | ✅ 保留启用 | 迁移类多批次条目若误置，人工拖回 In Review |
| Auto-close issue | ✅ 保留启用 | Status 变更→关闭 issue，与 governance 闭环纪律配合使用 |
| Auto-add to project | ❌ 不启用 | Free 计划仅 1 条；三仓聚合靠手动 `gh project item-add` 或 issue 创建时手动加入 |
| Auto-add sub-issues | ✅ 启用 | 子 issue 自动入看板 |

---

## 6. 条目组织规范

- **大任务拆解**：使用 **Sub-issues** 对应本仓「原子条目」粒度。
- **跨条目依赖**：用 Issue dependencies 标记阻塞关系。
- **Draft issue 仅作草稿**：确定要做时尽快 Convert 为真 issue（落具体仓库、得编号、可被 PR 关联）。
- **跨仓条目**：直接在看板 `Add item → Paste URL` 或 `#` 搜索添加任意有权限仓库的 issue。

---

## 7. Agent 读写边界与坐标纪律

| 场景 | Agent 行为 | 权限要求 |
|------|------------|----------|
| **读看板定位工作** | 查询 Status/Iteration/Priority，决定下一步动作 | `read:project` |
| **同步状态** | 实施完成后将条目拖入 `In Review`；用户验收后拖入 `Done` | `project` |
| **创建条目** | 新任务决策后，在对应仓库建 issue 再加入看板（或直接建 draft 再 convert） | `project` |
| **不得做** | 修改看板结构（列/字段/视图/workflow）、批量改写他人条目、绕过 `In Review` 直入 `Done` | — |

**坐标纪律**：
- 本地规划文档（`todo.md`/`backlog.md`）只保留**摘要标题 + 看板条目深链**（`Copy link to project`）。
- 实际内容、状态、优先级、迭代、估算**以远程 Project 为准**，本地不再双写。
- 规划文档仅作「当前阶段在做什么」的极简索引。

---

## 8. 维护节奏

- **每迭代开始**：PM 创建 Iteration，清理 Backlog→Todo。
- **每日/每 PR**：开发者同步条目 Status。
- **迭代结束**：Roadmap 视图回顾，Done 条目归档，生成 status update 快照。
- **季度**：Review 字段/视图/自动化是否膨胀，删减冗余。

---

## 9. 关联文档

- [规划规范](../standards/planning.md)
- [AI 协作规范](../standards/ai-collaboration.md)
- [跨项目 AI Agent 协作调研](../design/governance/2026-09-26-cross-project-agent-collaboration-research.md)
- [GitHub Projects 最佳实践调研](../design/governance/2026-09-26-github-projects-best-practices-research.md)
