# 2026-09-26 跨项目 AI Agent 协作调研报告

> 来源：用户调研需求——caomei-ui（上游组件库）须依据 momei / dependfix 的反馈调整，下游亦须依据 caomei-ui 的改动修改迁移方案，需调研项目间 AI agent 的协作方式。
> 评估主体：caomei-ui（本仓）。
> 事实源与 revision：本仓 HEAD `f6f5341`（工作区另含 stepper 未提交改动，与本调研无关、未触碰）；momei `63c0e073`；dependfix `82bb9a1`。三仓只读盘点，**零 `src/` 改动**。
> 方法：本地三仓代码与治理文档盘点 + 联网多源交叉核对（协议层 / 协作载体 / CI 事件 / 记忆层）；对将采纳的机制做反向验证（GitHub Projects 跨 org 边界、mem0 部署形态）。
> 口径声明：本记录为**调研与方案记录**，产出时 L1~L3 均未实施；含用户已裁定项（§5、§8）与待后续授权项。
> 快照日期：2026-09-26。

## 1. 结论摘要

| 问题 | 结论 |
| :--- | :--- |
| 协作载体：本地还是 GitHub | **GitHub 为协作平面**（Issues = 反馈台账通道、user-owned Project 聚合三仓、决策权威记录落各仓 `docs/design/governance/`），本地只做执行；本地路径污染靠**坐标纪律**解决（仓库内容禁止机器本地绝对路径） |
| 记忆存放：mem0 还是本地 | **三层分工**：权威协作状态 → GitHub / 仓库文档；可复用协作经验 → mem0（self-hosted）；会话任务态 → 各仓 `.session/`。mem0 不承担协作必需状态 |
| 落地路径 | L1 契约与模板层 → L2 本地工具层 → L3 CI 事件层，递进实施；本轮只交付本报告 |

## 2. 问题与协作拓扑

**拓扑**：caomei-ui（Vue 3 组件库，替代下游 PrimeVue、规避 PrimeUI 商业许可风险）为上游；momei（Nuxt 4，`caomei-ui@0.2.0` 精确锁定、迁移进行中）与 dependfix（pnpm monorepo，零消费、评估稿在册）为下游。协作是**双向**的：

1. **下游 → 上游**：迁移实测中发现的缺口 / 文档缺口 / 设计疑问，须回传上游评估并落点（Backlog / 文档补强 / 不纳入）。
2. **上游 → 下游**：能力补齐、破坏性变更、冻结面声明，须同步下游并驱动迁移方案修订。

已有的闭环实例（人工流程）证明流程可行，但**通道、模板、通知、记忆均未机制化**，依赖单次实践。

## 3. 本地现状盘点

### 3.1 已有协作机制（人工流程，质量较好）

| 机制 | 载体 | 现状 |
| :--- | :--- | :--- |
| 下游反馈闭环 | momei `docs/design/governance/2026-09-25-caomei-ui-upstream-feedback.md` → 本仓 [2026-09-25-momei-upstream-feedback-evaluation.md](./2026-09-25-momei-upstream-feedback-evaluation.md)（commit `bedd2de`） | 单次实践，未模板化 |
| 迁移交接三件套 | [可行性评估](./2026-09-17-momei-migration-feasibility.md) / [交接计划](./2026-09-17-momei-migration-handover-plan.md) / [库侧资产](./2026-09-17-momei-migration-assets.md) | momei 范式完整，未抽象为可复用模板 |
| 跨仓评估纪律 | [AI 协作规范 §8](../../standards/ai-collaboration.md)：跨仓只读评估须钉目标仓 revision + 工作区脏状态；「能力未实现」判断多载体存在时须回扫全部载体 | 已成文，散落在 standards，agent 开局触达率低 |
| 破坏性变更披露 | CHANGELOG `BREAKING CHANGES` + [发布指南 §9](../../guide/release.md) 下游修复指引 | 人工披露，无发布即通知 |
| 下游兼容回归 | [发布指南 §10](../../guide/release.md)（`repository_dispatch` 或 reusable workflow） | **已规划未启动**（用户裁定等 dependfix 迁移后评估） |
| 升级纪律 | momei 迁移方案 §5.6（0.x 精确锁定、升级前读 BREAKING CHANGES、禁 `file:` 进提交等） | 未进任一 AGENTS.md |

### 3.2 缺口清单

| # | 缺口 | 证据 |
| :--- | :--- | :--- |
| 1 | 反馈通道单向、非模板化、无统一台账 | momei 有范例；dependfix 反馈散落 Backlog 注记，无台账 |
| 2 | 版本口径漂移 | dependfix 评估基于 0.1.0 快照、momei 消费 0.2.0、本仓已 0.3.0，靠评估时人工声明差异 |
| 3 | 无发布 → 下游通知机制 | 下游 breakage 只能靠实际迁移时发现 |
| 4 | 升级纪律 / 协作约定不进 AGENTS.md | 三仓 AGENTS.md 均无跨项目协作章节 |
| 5 | agent 矩阵无跨仓角色与技能化约束 | 本仓 8 agent 全部面向仓内开发 |
| 6 | 迁移方案未模板化 | momei 交接范式无法直接复用到 dependfix（且 dependfix 评估稿能力面快照已过时：`DataTable` 三项缺口已被 0.3.0 交付） |

## 4. 业界实践交叉核对

| 层 | 模式 | 来源 | 适用性判定 |
| :--- | :--- | :--- | :--- |
| 协议层 | A2A / MCP agent 互通协议 | Google A2A 官方、AWS、WorkOS、arXiv 综述 | **不采用**：单人多仓场景过重，协议栈解决的是 agent 产品间互操作，非仓库级协作 |
| 协作载体层 | meta-repo / root-repo 协调层（总览 AGENTS.md + clone 脚本 + 统一工作区） | Bishoy Youssef、Gary Sheng、Reddit r/opencodeCLI 多源一致 | **部分采用**：统一工作区事实存在，但协调层放 GitHub 而非本地根目录文件（见 §5.1） |
| 契约层 | 版本化契约文档 + revision 钉定 + 单一事实源指针 | 本仓既有实践；Codex「版本化事实源」理念 | **采用**：只需模板化与载体统一 |
| 事件层 | GitHub `repository_dispatch` / reusable workflow 跨仓触发 | GitHub Actions 官方能力；本仓 [发布指南 §10](../../guide/release.md) 已规划 | **采用**（L3） |
| 会话层 | 同工作区多 agent 并行会话互发任务 | OpenChamber session dispatch（支持跨 directory / projectId） | **采用**（L2，只读核查优先） |
| 记忆层 | 跨项目经验记忆（mem0 / Session Wisdom） | mem0 官方分层记忆模型；社区「记忆分层」共识 | **采用**（分层，见 §5.2） |

## 5. 两问评估（用户 2026-09-26 已裁定，均采纳推荐项）

### 5.1 Q1：协作载体放本地还是 GitHub？

**结论：GitHub 为协作平面（状态 / 台账 / 通知），本地只做执行；本地路径污染不靠「放本地」解决，靠「坐标纪律」解决。**

**事实核对**：

- `gh` 已认证 `CaoMeiYouRen`，三仓 `has_issues=true`（open issues：本仓 3 / momei 6 / dependfix 0），Issues 通道现成可用。
- **Projects 跨 org 有硬边界**：org-owned Project 不能聚合其他 org 的 issue（GitHub community 讨论 #6212、#10709 至今为未实现的特性请求）；**user-owned Project（挂 `CaoMeiYouRen` 账号）可聚合任何有权限仓库的 issue**——dependfix 位于 `dependfix` org 但当前账号有访问权，三仓可用同一个 user Project 看板聚合。
- momei 迁移方案已明确「本地联调临时 `file:../caomei-ui` 不得进提交」，即**相对本地布局引用本来就视作污染**，与本次结论同向。

**机制映射**：

| 协作内容 | 载体 | 坐标规范 |
| :--- | :--- | :--- |
| 下游反馈（momei / dependfix → caomei-ui） | GitHub Issue（label `upstream-feedback`，模板化「现象 → 实测 → 建议」） | 引用写 `owner/repo#n`、commit SHA、npm 版本号 |
| 上游改动通知 / 迁移调整（caomei-ui → 下游） | Release 时 `repository_dispatch` + 下游建 tracking issue | 同上 |
| 跨仓迁移路线图 | user-owned Project（三仓聚合）+ 各仓 tracking issue | — |
| 决策 / 评估权威记录 | 各仓 `docs/design/governance/`（git 版本化、可 review、有机检） | issue 只做通道与状态，不做权威记录 |
| 机器本地布局（工作区父目录绝对路径等） | **只出现在 gitignored 文件或 mem0**，仓库内容零出现 | 本地路径仅作提示，不作引用 |

**理由**：GitHub 是唯一天然跨机器、可审计、agent 可直接读写（`gh` CLI）的存储；issue 的弱点（非 git 版本化、变更无 review）正好由「决策落 governance 文档」补偿，与本仓 `check:governance-records` 机检纪律完全兼容。

**坐标纪律（拟入 AGENTS.md，L1）**：仓库内容（代码 / 文档 / issue 模板 / 提交信息）禁止机器本地绝对路径；跨仓引用一律使用 `owner/repo#n` + commit SHA + 包版本号；本地路径仅允许出现在 gitignored 文件或 mem0 记忆中。

### 5.2 Q2：跨项目 agent 记忆放 mem0 还是本地？

**结论：不是二选一，按「权威性」分层。**

| 层 | 载体 | 存什么 | 边界 |
| :--- | :--- | :--- | :--- |
| 权威协作状态 | GitHub Issues / Projects + 各仓 docs | 反馈台账、迁移批次状态、决策记录 | 需版本化 / 审计 / 跨机器；**不写 mem0**（防双源漂移） |
| 软性经验记忆 | mem0（self-hosted，经 mem0-mcp 接入） | 可复用协作经验（如「跨仓评估须钉 revision」的验证做法、口径漂移教训） | 遵循全局 mem0 规范：简短、可跨项目复用、不含密钥 |
| 会话任务态 | 各仓 `.session/`（现状保留） | 单次任务进度 | 一次性，不进记忆库 |
| 本地便利索引 | gitignored 的工作区映射文件（可选） | 本地路径 → 仓库映射 | 机器相关，进仓库即污染 |

**Caveat**：mem0 为 self-hosted REST 部署（mem0-mcp 包装自建 mem0 REST API，`MEM0_API_URL`），可达性绑定部署主机——换机器工作而 mem0 不可达时，唯一可靠记忆是 GitHub + 仓库文档。故 mem0 **只放锦上添花的经验，不放协作必需状态**。

## 6. 推荐方案（L1~L3 递进）

### L1 契约与模板层（纯文档，优先）

1. **下游反馈模板化**：把 momei 范例固化为 `.github/ISSUE_TEMPLATE/upstream-feedback.yml`（三仓共用）：现象 → 实测 → 建议 → 期望 + 钉 revision / 版本口径 / 工作区脏状态。
2. **反馈台账 = issue 列表**：label 体系（`upstream-feedback` / `downstream-feedback` / `migration`）+ user-owned Project 视图聚合三仓；台账状态以 issue 为准，决策落 governance 文档。
3. **三仓 AGENTS.md 增补「跨项目协作」章节**：协作拓扑、事实源指针、坐标纪律（§5.1）、升级纪律（0.x 精确锁定、升级前读 BREAKING CHANGES、禁 `file:` 提交）、口径回扫规则（AGENTS.md 为受保护文件，逐仓需用户批准）。
4. **机器可读版本清单**：本仓发布时产出 `compat-manifest.json`（版本 + 能力面 + 冻结面 + BREAKING 列表），下游 agent 升级前必读。

### L2 本地工具层（半自动）

5. **OpenChamber 跨目录会话派发**：上游会话派下游只读核查会话（验证反馈可复现性）、下游会话派上游评估会话——承载双向协作；默认只读，写操作仍走 issue / PR。
6. **mem0 协作经验分区**：按 §5.2 分层写入，与 Session Wisdom 蒸馏机制对齐。

### L3 CI 事件层（自动化）

7. **发布通知**：本仓 release 后 `repository_dispatch` 通知下游触发升级评估（dependfix 跨 org 需 PAT / token 配置）。
8. **跨仓兼容回归**：落地 [发布指南 §10](../../guide/release.md) 已规划的 reusable workflow（下游 typecheck + build）。

**不采用**：A2A 协议、git submodule meta-repo、跨仓实时 agent 对话总线（无稳定需求、维护成本高）。

## 7. 风险与边界

- **AGENTS.md 为受保护文件**：三仓增补跨项目章节须逐仓经用户明示批准，不在本轮范围。
- **跨仓写操作纪律**：仍走「文档回传 / PR」，不做静默双向改文件（与 [AI 协作规范 §8](../../standards/ai-collaboration.md) 一致）。
- **dependfix 位于 `dependfix` org**：CI 跨仓触发需额外 token；user-owned Project 聚合依赖当前账号持续有访问权。
- **版本口径风险未彻底消除**：compat-manifest 只解决「下游读到哪个版本」，反馈针对版本与评估版本的差异仍须保留人工声明（既有纪律）。
- **模板与台账先手动跑通一轮**（dependfix 迁移是现成试验场），再考虑自动化。

## 8. 登记结果与后续

- **本轮交付**：本报告 + [治理索引](./index.md) 登记，**L1~L3 均未实施**。
- **用户裁定（2026-09-26）**：Q1 采纳「GitHub 协作平面 + 坐标纪律」；Q2 采纳「三层记忆分工」；报告归口本仓 governance。
- **后续候选（待用户授权启动）**：L1 四项（issue 模板 / label 与 Project / AGENTS.md 章节 / compat-manifest）→ L2 两项 → L3 两项；实施时按 [规划规范](../../standards/planning.md) 走「评估 → backlog → 用户决策」。

## 9. 调研来源

- 本地：三仓 `AGENTS.md`、`.opencode/` 配置、momei 迁移方案与 upstream-feedback、dependfix `docs/design/governance/caomei-ui-migration.md`、本仓 [AI 协作规范](../../standards/ai-collaboration.md) / [发布指南](../../guide/release.md) / [版本策略](../../guide/version-policy.md)、三仓 `git log` 与 `gh api` 取证（`has_issues` / open issues）。
- 联网（2026-09-26 检索）：Google A2A 官方公告、WorkOS「MCP vs A2A」、AWS open protocols 系列、arXiv「A Survey of Agent Interoperability Protocols」；Bishoy Youssef「Setting Up AI Coding Assistants for Large Multi-Repo Solutions」（root-repo 模式）、Gary Sheng「The Right Way To Work Across Multiple Repos with AI Agents」、Reddit r/opencodeCLI multi-repo 讨论；GitHub community 讨论 #6212 / #10709（Projects 跨 org 边界）、GitHub Docs「About Projects」；mem0 官方记忆分层文章、Braintrust「Best AI agent memory tools in 2026」。
- 反向验证：GitHub Projects 跨 org 限制与 user-owned Project 聚合能力（官方文档 + community 讨论交叉）；mem0 部署形态（本地 mem0-mcp README 证实 self-hosted REST）。
