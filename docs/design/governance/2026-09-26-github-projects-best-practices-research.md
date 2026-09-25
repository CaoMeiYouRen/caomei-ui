# 2026-09-26 GitHub Projects 使用经验与最佳实践调研

> 来源：用户已初步建立看板 `https://github.com/users/CaoMeiYouRen/projects/2/views/1`（「CaoMei UI 项目」，描述原文 `caomei-ui项目组件库开发，以及和下游项目协作`），反馈「从 backlog 到 done 的规划机制很符合目前的项目开发流程」，需调研 GitHub Projects 的使用经验与最佳实践。
> 评估主体：caomei-ui（本仓）。
> 关联记录：[2026-09-26 跨项目 AI Agent 协作调研](./2026-09-26-cross-project-agent-collaboration-research.md)（该记录 L1 方案的「user-owned Project 聚合三仓」即本看板）。
> 事实源与 revision：本仓 HEAD `5c8acbf`；看板实况以公开页面元数据为准（标题 / 描述 / views/1 存在）。
> **取证边界（须先声明）**：本机 `gh` token 缺 `read:project` scope（`gh project` CLI 报 499、GraphQL `projectV2` 报 `INSUFFICIENT_SCOPES`，token 现有 `read:org` / `repo`），**未能机读看板的字段 / 视图 / workflow / 条目配置**；以下「现状」仅含公开可见信息与用户陈述（backlog → done 规划机制），逐项配置核对待补 scope 后进行。
> 方法：GitHub 官方文档（Best practices / built-in automations / auto-add / API）+ GitHub Blog + 社区实践多源交叉核对；对 agent 读写路径做本地实测。
> 快照日期：2026-09-26。

## 1. 结论摘要

| # | 结论 |
| :--- | :--- |
| 1 | 「Backlog → Done」的 Status 流转与本仓 [规划规范](../../standards/planning.md)「评估 → backlog → 用户决策 → todo → 阶段交付 → 归档」同构，方向正确；建议 Status 列收敛为 **5 列以内**并开启内置自动化；**Review 列裁定为「待裁定（人工审查）」**（当下等用户决策 / 验收 / 授权提交，未来多人协作承接 code review，见 §3.1.1） |
| 2 | Projects 的正确定位：**跨仓规划与状态的聚合视图**；权威决策记录仍落各仓 `docs/design/governance/`（与协作调研报告 §5.1 一致，防双源漂移） |
| 3 | **agent 读写看板的前置条件是给 token 补 `read:project`（写入需 `project` / `workflow` scope）**——本次实测已撞上该墙，这是看板进 agent 工作流的第一道门 |
| 4 | 内置 workflow（item closed / PR merged → Done、auto-add、auto-archive）先用足，不够再上 GraphQL / Actions 自动化 |
| 5 | 自定义字段克制：优先 `Repository`（内建）+ `Priority` + `Iteration` 或日期字段；单选字段写清描述与颜色，遵守「单一事实源」 |

## 2. 核心能力盘点（官方文档口径）

| 能力 | 要点 |
| :--- | :--- |
| 视图（views） | table / board / roadmap 三种布局；filter / sort / group / slice by / 列宽 / 列上限；roadmap 可按项目自定义字段、milestone、repository 分组 |
| 自定义字段 | text / number / date / single select / iteration；单选可配颜色与描述；iteration 支持按周排期与 breaks，可回看历史迭代速率 |
| 内置自动化 | 默认开启两条：**issue/PR 关闭 → Done**、**PR 合并 → Done**；另有 auto-add（按 filter 自动入库）、auto-archive（按条件自动归档）、反向「status 变更 → 关闭 issue」 |
| 自动化限额 | auto-add workflow 数量按计划：Free **1** / Pro、Team 5 / Enterprise 20；同一仓可多条但 filter 须互异 |
| Insights | 基于条目的可配置图表（burnup / breakdown 等），可分享 |
| 模板 | 项目可设为模板（视图 / 字段 / workflow / insights / draft 条目随模板复制）；另有一次性「Make a copy」 |
| CLI / API | `gh project` 命令族（item-add / item-create / item-list / copy / view 等）+ GraphQL `projectV2`；**均需 `project` 系 scope** |
| 导出 | 任意视图可导出 TSV（可进 Excel / Google Sheets） |
| 批量编辑 | table 布局复制粘贴单元格批量赋值；board 多选拖拽 |
| 条目层级 | sub-issues 分解大 issue、issue dependencies 标记阻塞关系、issue types 分类 |

## 3. 最佳实践（多源交叉核对后采纳项）

### 3.1 Status 设计

- **5 列以内**（社区共识：超过 5~6 列失去看板的视觉简洁性）；典型 `Backlog / Todo / In Progress / Review / Done`。
- 与本仓流程映射建议（**Review 列语义经用户裁定，见 §3.1.1**）：

| 看板 Status | 对应 [规划规范](../../standards/planning.md) 状态 |
| :--- | :--- |
| Backlog | [backlog.md](../../plan/backlog.md) 在册候选（评估 → backlog，未决策） |
| Todo | 用户已决策、已登记 [todo.md](../../plan/todo.md)（登记 = 范围授权） |
| In Progress | 阶段 / 原子条目实施中 |
| Review（待裁定） | **等人工审查 / 裁定**：待用户决策、待验收、待授权提交；多人协作后兼作 code review（§3.1.1） |
| Done | 阶段收口、条目归档（todo-archive） |

#### 3.1.1 Review 列语义（用户 2026-09-26 裁定）

**背景**：当前开发以人机协作为主，code review 在本地会话内闭环（Review Gate R1/R2、V 阶段），条目提交推送时不会经过「In review」状态；若强制本地 review 进列，条目会在 In Progress ↔ In review 间频繁拖动，只增维护成本、不增信息量。

**裁定**：Review 列保留但**重新定位为「待裁定（人工审查）」**，看板状态表达「条目卡在等谁」：

- **当下语义**：等人工介入——待用户决策（D 项）、批次完成待验收、待授权提交 / 推送（与「提交推送需明示授权」纪律对应）。本仓 PDTFC+ 流程中这是最长的等待态，5 列因此各有信息量。
- **未来语义**：引入多人协作时，该列自然承接 PR / code review 审查职责，无需再改列结构。
- **不采纳**：把本地 Review Gate / V 阶段映射为看板状态（实施环内部动作，不表达等待）。

### 3.2 自动化用足内置、再上 API

- 默认两条 workflow（closed / merged → Done）**保留**；注意社区报告的两个坑：
  1. **PR 合并 → Done 只反映 PR 态**：一个 issue 关联多个 PR 或「PR 合并但 issue 未闭环」时会被提前置 Done——本仓迁移类条目（多批次交付）尤须注意，必要时关掉该条、改手动或 GraphQL 细粒度控制；
  2. **「status 变更 → 关闭 issue」方向慎开**：与本仓「决策落 governance 文档后才闭环」的纪律冲突。
- auto-add：按仓库 + filter（`is:issue`、`label:`、`no:assignee` 等，支持取反）把新 issue 自动入看板；**注意存量不补**（启用前已存在的条目不会自动加入），且 **Free 计划仅 1 条**——三仓聚合要么升级 Pro，要么用 GraphQL / Actions 补。
- auto-archive：Done 中满足条件（如关闭超 N 天）的条目自动归档，保持看板干净。

### 3.3 字段与视图

- **单一事实源**（官方明确）：目标日期、优先级等信息只在一处维护；issue 的 assignee / labels / milestone 与项目自动同步，不要再建同义自定义字段。
- 字段克制起步：`Priority`（single select，配色 + 描述）+ `Iteration`（若有节奏）或 `Target date`；迁移 / 协作场景可加 `Repo` 视图切片（也可直接用内建 Repository 字段 group by）。
- 视图按用途分而不堆：board（日常流转）+ table（批量编辑 / 全字段）+ roadmap（时间线，迁移批次排期很适合）；用 filter + slice by 快速切「某下游 / 某优先级 / 某人」。
- Project README / description 写清用途与视图说明（官方最佳实践），status updates 记录「On track / At risk」级别的进展快照。

### 3.4 条目组织

- 大任务用 **sub-issues** 拆小（对应本仓「原子条目」习惯）；跨条目依赖用 issue dependencies 标记。
- **draft issue 只当草稿**：未落到具体仓库前没有 issue 编号、不能被 PR 关联（社区常见困惑「怎么全是 draft」）；确定要做时尽快 convert 成真 issue——这也符合本仓「决策后登记 todo」的纪律。
- 跨 org 条目：user-owned Project 可聚合任意有权限仓库的 issue（粘 URL 或 `#` 搜索添加），与协作调研 §5.1 结论一致。

## 4. 对本项目的关键发现（实测）

### 4.1 agent 读写看板的 scope 墙

- `gh project list/view` → 499；GraphQL `projectV2` → `INSUFFICIENT_SCOPES`（需 `read:project`，写入需 `project`，workflow 类需 `workflow`）。
- **影响**：协作调研 L1 的「issue 列表即台账 + Project 聚合」若要 agent 参与（自动建条目、同步状态、读看板做规划），须先给 token 补 scope：
  - 只读规划：`read:project`；
  - agent 同步状态 / 建条目：`project`；
  - 改 workflow 配置：`workflow`（一般不必给 agent）。
- GitHub 官方亦提示：只读场景可用细粒度 PAT 的 `read:project`，遵循最小权限。

### 4.2 自动化与多仓聚合的计划限制

- Free 计划 1 条 auto-add：三仓（caomei-ui / momei / dependfix）自动入库不敷使用；替代路径：① 升级 Pro（5 条）；② GraphQL `addProjectV2ItemById` + `issue` 事件触发的 Actions / 本地脚本（chrisreddington、josh-ops 等实践均走此路）；③ 手动 + `gh project item-add`。
- `gh project item-add <n> --owner CaoMeiYouRen --url <issue url>` 是 agent 最轻的写入口（补 scope 后即可用）。

## 5. 经验与坑（社区汇总，采纳相关项）

| 坑 / 经验 | 处置 |
| :--- | :--- |
| auto-add 不补存量条目 | 启用后手动 bulk add 一次存量 |
| PR merged → Done 误置 | 多 PR / 长批次 issue 关掉该 workflow 或改 GraphQL 精确控制 |
| draft issue 不进仓库 | 及时 convert；模板里明确「先建 issue 再入看板」 |
| 字段膨胀 | 删同义字段，遵守单一事实源；字段顺序把 Status 排最上 |
| 看板列过多 | ≤ 5 列 |
| 数据外流 | Export view → TSV 做周报 / 回顾（也绕过 API） |
| 深链 | 「Copy link to project」发条目深链，协作沟通用 |
| 与 milestone 的分工 | milestone 表版本 / 时间盒，Project 表流程状态；不重复表达同一信息 |

## 6. 建议落点（待用户决策，不在本轮实施）

1. **补 token scope**（`read:project` 起步，需 agent 写入时加 `project`）→ 机器核验看板字段 / 视图 / workflow 实况，回填本记录 §取证边界。
2. **Status 列与 workflow 收口**：按 §3.1 映射核对现有列名（含 Review 列改名「待裁定（人工审查）」，§3.1.1 已裁定）；开启 / 调整内置 workflow（PR merged → Done 对迁移长批次条目评估关闭）。
3. **auto-add 配置**：三仓聚合按 §4.2 选型（Pro / GraphQL 自动化 / 手动 + CLI）。
4. **Project README**：写入用途、视图说明、与 [规划规范](../../standards/planning.md) 的状态映射（§3.1 表）。
5. **进 AGENTS.md 的看板使用约定**（并入协作调研 L1 第 3 项的跨项目协作章节）：agent 读看板定位工作、写状态的边界与坐标纪律。
6. **insights / status updates**：迁移批次推进期启用 roadmap 视图 + 进展快照，替代部分人工周报。

## 7. 调研来源

- 官方：GitHub Docs「Best practices for Projects」「Using the built-in automations」「Adding items automatically」「Using the API to manage Projects」「Customizing the board layout」、GitHub Blog「10 things you didn't know you could do with GitHub Projects」、`gh project` CLI 手册。
- 社区：note.com「Best Practices for Adopting and Establishing GitHub Projects」（5 状态 + 3 内置 workflow 起步法）、unwiredlearning（列数上限）、dev.to（看板列与 git 状态映射）、chrisreddington / josh-ops（GraphQL / Actions 自动化入库）、StackOverflow / GitHub community #170443 / #10317（scope、draft issue、PR 误关 issue 等坑）。
- 本地实测：`gh project` CLI 与 GraphQL `projectV2` 的 scope 报错（2026-09-26）；看板公开元数据（标题「CaoMei UI 项目」、描述、views/1）。
