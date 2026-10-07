# Phase 20 M2-5：执行层规则重述与失效引用收敛

> 创建时间：2026-10-07
> 关联条目：[待办事项](../../plan/todo.md) Phase 20 **M2-5**（基建与治理守卫补口）
> 依据：`check-audit-protocol` 只覆盖审计协议数值（轮次 / 时长），任务粒度阈值仍散落在 skill / agent 定义中；候选 B30 的「失效引用」复核后判定 **`.github` 面原锚点有效**（`.github/**` 由 GitHub 渲染，slug 不补 `_`），无清零对象；本批同时补齐「AI 资产链接与 GitHub slug 锚点」的机检面。
> 快照：本仓工作区（`pnpm verify` exit 0、`ai:check` / `check:audit-protocol` 全绿）；**未推送**

---

## 1. 结论

- **重述收敛**：把「任务粒度阈值（默认 10 文件 / 800 行新增）」在**执行层 AI 资产**中的 3 处重述改为**链接引用**（唯一权威 = [规划规范 §5](../../standards/planning.md#_5-任务粒度约束)）：
  - `.github/skills/code-reviewer/SKILL.md`（Step 1.4）
  - `.github/agents/code-reviewer.agent.md`
  - `.github/agents/full-stack-master.agent.md`（同类回扫）
- **约束载体**：扩展 `check:audit-protocol` 的规则面至**任务粒度阈值**（新增 `granularity-threshold` 规则），并新增 `check:ai-asset-links` 守卫（AI 资产相对链接 + GitHub slug 锚点机检）；各补单测与负向对照。
- **失效引用复核（结论：本批前无失效引用）**：对 AI 资产（`AGENTS.md` / `CLAUDE.md` / `.github/**/*.md`）的相对链接、锚点与代码引用逐条核对——原 `#4-阶段与条目命名` 在 **GitHub 渲染**下有效（`.github/**` 由 GitHub 渲染，数字开头标题的 slug **不补** `_`），`./xxx.md` 为说明性 code span，故**不存在需清零的失效引用**。本批新增链接统一为 GitHub slug 形态，并把「源文件渲染器 → slug 形态」约定写入 [文档规范 §3 格式要求](../../standards/documentation.md)。
- `ai:check` / `check:audit-protocol` 全绿；`pnpm verify` exit 0。

---

## 2. 重述收敛（逐处）

| 文件 | 收敛前 | 收敛后（`.github` 面改写**要点**；锚点为 GitHub slug） |
|:---|:---|:---|
| `.github/skills/code-reviewer/SKILL.md` | 「超过阈值（默认 10 文件或 800 行新增，项目可调整）」 | 「超过任务粒度阈值（见规划规范 §5 任务粒度约束；锚点 `#5-任务粒度约束`）」 |
| `.github/agents/code-reviewer.agent.md` | 「超过阈值（默认 10 文件或 800 行新增）」 | 「超过任务粒度阈值（见规划规范 §5 任务粒度约束；锚点 `#5-任务粒度约束`）」 |
| `.github/agents/full-stack-master.agent.md` | 「改动超任务粒度约束（默认 10 文件或 800 行新增）」 | 「改动超任务粒度约束（见规划规范 §5 任务粒度约束；锚点 `#5-任务粒度约束`）」 |

- 上表「收敛后」列按 `.github` 文件的**字面内容**书写，故锚点为 GitHub slug（不补 `_`）；本记录自身（`docs/` 面）引用 `docs/` 标题时用 VitePress slug（`#_5-…`），两者形态不同、不可互抄。

- 原则依据：`code-reviewer` SKILL.md Step 5.6「规范单点声明」——治理定义不得重复抄写权威文档的数值 / 阈值，应一行链接引用。
- 审计协议数值（轮次 / 时长）经复查仍为 0 处重述（`check:audit-protocol` 原有两条规则）。

---

## 3. 失效引用复核与 slug 形态约定

| 文件 | 复核结论 |
|:---|:---|
| `.github/skills/code-reviewer/references/code-quality-checklist.md` | `planning.md#4-阶段与条目命名` 保持 **GitHub slug** 形态（无 `_`）——该文件由 GitHub 渲染，标题 id 为 `user-content-4-阶段与条目命名`；**原引用有效，无需修改** |

- **slug 形态随渲染器而定**（本批写入 [文档规范 §3](../../standards/documentation.md)）：链接 `docs/` 内标题、且源文件也在 `docs/`（VitePress 渲染）→ 用 VitePress slug（数字开头补 `_`，如 `#_5-任务粒度约束`）；源文件在 `.github/**` / 仓库根（**GitHub 渲染**）→ 用 GitHub slug（不补 `_`，如 `#5-任务粒度约束`）。两种形态对同一标题**不通用**。
- **证据链**：`docs/.vitepress/dist/standards/planning.html` 的元素 id 为 `_5-任务粒度约束`（VitePress 面）；GitHub 渲染 `planning.md` 的标题 id 为 `user-content-5-任务粒度约束`（GitHub 面）。本批 `.github/**` 的 3 处新增链接按 GitHub 形态书写。
- **门禁边界与本批补齐**：`docs:check:links` 覆盖 `.github/**`（路径 + 宽松锚点归一化，不校验渲染器 slug）；`docs:check:structure` 的 VitePress slug 校验只覆盖 `docs/` 内站内链接。故 `.github/**` 的 slug 形态此前**无机检**——本批新增 `check:ai-asset-links`（接入 `governance:check`）按 **GitHub slug** 校验 AI 资产的相对链接与锚点，并补「VitePress 形态误用于 `.github`」的负向对照。

---

## 4. 守卫扩展（约束载体）

- **`check:audit-protocol`**（`scripts/governance/check-audit-protocol.mjs`）新增规则 `granularity-threshold`：命中同行含「N 文件」与「NNN 行」（中英双形态）的表述；charter 由「审计协议数值」扩为「审计协议数值 / 任务粒度阈值」，输出注明两处单点声明位置（AI 协作规范 §3.1 / §3.4、规划规范 §5）。测试补 4 例（3 重述形态 + 链接引用反例）与 3 条边界反例（仅文件数 / 仅行数 / 英文仅 files 不命中；跨行拆分不在判定面，已在规则注释声明）。
- **`check:ai-asset-links`**（新增 `scripts/governance/check-ai-asset-links.mjs`，接入 `governance:check`）：按 **GitHub slug** 校验 `AGENTS.md` / `CLAUDE.md` / `.github/**` 的相对链接与锚点（T1 `missing-target` / T2 `bad-anchor` / T3 下界 + 哨兵）；剥离围栏与行内 code span。测试 12 例，含「VitePress 形态 `#_5-` 误用于 `.github` → bad-anchor」负向对照。
- **判别力（负向对照）**：
  - `check:audit-protocol`：临时仓库注入「默认 10 文件或 800 行新增」→ **exit 1**；清空后 exit 0。
  - `check:ai-asset-links`：构造 `#_5-任务粒度约束` 锚点（VitePress 形态）→ **exit 1**（`bad-anchor`）。
- **slug 形态**：`.github/**` 链接使用 **GitHub slug**（`#5-任务粒度约束`，无 `_`）；AI 资产复扫 **0 处锚点失配**。

---

## 5. 规模、质量门与 Review Gate

- **规模**：AI 资产 3 文件（`SKILL.md` / `code-reviewer.agent.md` / `full-stack-master.agent.md`，均 +1 −1）；规范 2 文件（`documentation.md` +1 / `ai-collaboration.md` +1 −1）；守卫 4 文件（`check-audit-protocol.mjs` +21 −7 / 其测试 +18 / `check-ai-asset-links.mjs` 新增 199 / 其测试 新增 118）；`package.json`（+2 −1）；文档载体 3 文件（本记录 / 治理索引 / `todo.md`）。**零组件库 `src/**` 改动**。
- **粒度说明（>10 文件的拆分依据）**：本批为**单一原子条目**，且 Review Gate 的 blocker 明确要求「约束载体 = 为 `.github` 面 GitHub slug 补机检」——该载体（新增 `check-ai-asset-links` + 其测试）与收敛内容**不可分割**（分拆会让护栏晚于被守护的改写落地）。**代码 / 脚本 / 规范改动合计约 363 行（不含本记录本体，< 800）**，文件数超出仅因「1 项规则改 3 处 AI 资产 + 2 个守卫脚本（含测试）+ 规范与治理载体」，无独立同质批次可拆。
- **质量门（本批实测）**：
  - `pnpm check:audit-protocol` **exit 0**（0 处命中）；`pnpm check:ai-asset-links` **exit 0**（33 文件）。
  - `pnpm ai:check` **exit 0**。
  - `pnpm verify` **exit 0**（`lint:check` / `lint:css:check` / `lint:md:check` / `typecheck` / `typecheck:docs` / `test` **113 文件 / 2242 例** / `build` / `check:build` / `check:resolver` / `check:nuxt` / `docs:build` / `docs:check:i18n-routing` / `governance:check` 全绿）。
  - 负向对照两处（§4）各命中 1 处、还原后全绿。
- **V 阶段**：本批为执行层规则 / 守卫收敛，无可见 UI 面，按 PDTFC+ 显式跳过 `@ui-validator`。
- **Review Gate**：见 §6；本地留痕 `artifacts/review-gate/2026-10-07-phase20-m2-5-audit-protocol-convergence.md`。

## 6. Review Gate 结论

- **R1（第 1 轮，`deep`）`Reject`**：1 blocker / 1 warning / 4 suggest。
  - **RG-B1（blocker）**：`.github/**` 内 4 处锚点误用 VitePress slug（`#_5-` / `#_4-`）——`.github/**` 由 **GitHub** 渲染，数字开头标题 slug **不补** `_`，故引入 3 处失效锚点并把 1 处原本有效的锚点改坏。
  - **RG-W1（warning）**：记录 §3 的成因与门禁口径事实错误（误称 `.github` 不在 `docs:check:links` 受检面）。
  - suggest：`ai-collaboration.md` 内联阈值 / 规则边界注释 / 负例偏薄 / `todo.md` 状态时点。
- **R2（第 2 轮，`deep`，复审）`Reject`**：2 blocker（均 RG-B1 复发）/ 2 warning / 2 suggest。
  - **RG-B1（复发）①**：治理索引摘要仍复述失效 slug 与错误结论 → 已改写为「失效引用复核（本批前无失效引用）」。
  - **RG-B1（复发）②**：`documentation.md §3` 按「目标位置」而非「源文件所在渲染器」表述，会复现 RG-B1 → 已改为「源文件渲染器决定 slug」，并补 `check-ai-asset-links` 机检。
  - **RG-W3**：记录 §2/§5 与实际 diff 自相矛盾 → §2 改为字面内容 + GitHub slug，§5 按实际 diff 重列。
  - **RG-W4**：`todo.md` 状态先于 Pass → 已回退「待开工」，Pass 后回填。
  - **RG-S5 / S6**：依据句与留痕指针 → 依据句改写（判定原引用有效）；留痕于 F 阶段落盘。
- **R3（第 3 轮，`deep`，复审 blocker 修复点）`Pass`**：0 blocker / 1 warning（RG-W3 残余，非阻断）。审计方独立复跑：`check-audit-protocol` 0 命中 exit 0、`check-ai-asset-links` OK（33 文件）exit 0、`ai:check` / `check-planning-numbers` / `check-governance-records` exit 0、两份守卫单测 50 例、`pnpm test` **113 文件 / 2242 例**、ESLint exit 0；两处负向对照独立复现（各 exit 1）；RG-B1 ①② 关闭、约束载体具备独立判别力（`.github` 源用 `#_5-` → `bad-anchor` exit 1）。
  - **RG-W3（warning，残余）**：记录 §5 / 索引的 verify 计数与实测不符（`112/2230` → `113/2242`）→ 已改为 `113 文件 / 2242 例`。
  - follow-up（非阻断）：守卫边界加固（同文件锚点、重复标题 `-1` 后缀、`--fixture` 硬锁）登记为后续候选。
- **实测用时**：R1 派发 `2026-10-08T01:16:26+08:00`；R2 派发 `2026-10-08T01:29:39+08:00`（各轮返回未单独取戳，均 ≤ 20 分钟时间盒）。

## 7. 未覆盖边界（采信调用方证据）

- 审计方未复跑完整 `pnpm verify`（对高风险子门定向复跑）；未对 `.github/**` 做真实 GitHub 渲染抓取（以 GitHub slug 算法 + 目标标题存在性静态判定）。
- `.claude` / `.opencode` 镜像为符号链接到 `.github`，不在受检面（沿用既有设计）。
- **`check-ai-asset-links` 的已知边界**（后续可加固，非本批修复点）：① 同文件锚点 `](#x)` 未校验；② `extractHeadings` 不去重，未建模 GitHub 同名标题的 `-1` 后缀（对指向第二个同名标题的合法锚点可能假阳）；③ `--fixture` 仅告警、无硬锁（与既有守卫同模式，且已拒绝多余参数）。
- 本批无可见 UI 面，`@ui-validator` 显式跳过。
