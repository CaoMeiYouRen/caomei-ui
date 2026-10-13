# Phase 23 M3-2：依赖 PR 治理（陈旧 PR 清理与延后项触发条件复核）

> 阶段 / 条目：Phase 23 M3-2（CI 环境与依赖治理）。
> 裁定依据：[下一阶段范围评估（第七轮）](./2026-10-12-next-stage-scope-evaluation-7.md) §8.1 **D5**——**清理陈旧 PR + 延后项维持跟踪**。
> 关联：[Phase 22 M2-3 依赖大版本升级逐项评估与达标升级](./2026-10-10-phase22-m2-3-major-upgrades.md)（两个延后项的来源）。

## 1. 背景与触发

Phase 22 M2-3 逐项评估时处置了 7 个 open PR（达标即升 3 / 陈旧 2 / 延后 2），但两个**陈旧 PR**（`vite` / `vitest`）当时只做「口径订正」未关闭，两个**延后项**（`reka-ui` / `conventional-changelog`）的触发条件表述偏定性、不易判定。本条目收口这两类：逐 PR 给出「本仓现值 + PR 基线 + 处置」，并把延后项触发条件**改为可判定**。

## 2. open PR 全量处置表

盘点命令：`gh pr list --state open`（2026-10-13 实测，共 **4 个**）。「本仓现值」取自 `pnpm-lock.yaml` 解析值与 `package.json` 声明。

| PR | 依赖 | PR 基线 → 目标 | 本仓现值 | 分类 | 处置 |
|:-:|:---|:---|:---|:---|:---|
| [#1](https://github.com/CaoMeiYouRen/caomei-ui/pull/1) | `vitest`（dev） | `3.2.7` → `4.1.11` | `^4.1.11`（解析 `4.1.11`） | 陈旧 | **关闭** + 说明现值（目标已落地） |
| [#2](https://github.com/CaoMeiYouRen/caomei-ui/pull/2) | `vite`（dev） | `5.4.21` → `8.3.0` | `^8.3.1`（解析 `8.3.1`） | 陈旧 | **关闭** + 说明现值（现值已高于目标） |
| [#12](https://github.com/CaoMeiYouRen/caomei-ui/pull/12) | `reka-ui`（runtime） | `2.10.4` → `2.11.0` | `2.10.4`（精确钉定） | 延后（回归） | **维持 open + 条件触发**（见 §4.1） |
| [#17](https://github.com/CaoMeiYouRen/caomei-ui/pull/17) | `conventional-changelog`（dev） | `7.2.0` → `8.1.3` | `7.2.0`（精确钉定） | 延后（不兼容） | **维持 open + 条件触发**（见 §4.2） |

分类口径：**陈旧** = PR 目标版本已在本仓落地或已被更高版本覆盖（PR 分支未随主分支 rebase，`mergeable` 为 `CONFLICTING`），无剩余变更；**延后** = 目标版本存在本仓无法接受的回归 / 不兼容，须等触发条件满足。

## 3. 陈旧 PR 关闭执行记录

2026-10-13 执行（先评论说明、后关闭）：

| PR | 说明评论 | 关闭时间（UTC） | 合并 |
|:-:|:---|:---|:---|
| #1 | [issuecomment-6138071785](https://github.com/CaoMeiYouRen/caomei-ui/pull/1#issuecomment-6138071785) | `2026-10-13T04:12:59Z` | 未合并（`mergedAt = null`） |
| #2 | [issuecomment-6138073005](https://github.com/CaoMeiYouRen/caomei-ui/pull/2#issuecomment-6138073005) | `2026-10-13T04:13:06Z` | 未合并（`mergedAt = null`） |

评论内容 = 「本仓现值 + 本 PR 基线 + 处置 + 后续新版本由 Dependabot 另行开 PR」。关闭后复核：open PR 由 4 → **2**（仅剩 #12 / #17）。

## 4. 延后项触发条件复核

### 4.1 `reka-ui` 2.11.0（PR #12）

- **本仓现值** `2.10.4`（`package.json` 精确钉定）；PR #12 分支名为 `reka-ui-2.10.5`，但当前 diff 已随上游推进到 **`2.10.4` → `2.11.0`**（上游 `latest` = `2.11.0`，2026-10-05 发布；**时点快照 2026-10-13，属外部易变事实、可能随上游发布变化**）。
- **回归复核（2026-10-13 实测）**：临时以 `reka-ui@2.11.0` 覆盖本仓依赖后执行 `pnpm vitest run src/components/input-number/input-number.test.ts` → **4 例失败 / 45 例通过**，即 **2.11.0 仍未消除 2.10.5 的步进模型 emit 回归**。失败面（4 例）：`点击增加按钮按 step 步进并应用 precision`、`点击减少按钮按 step 步进并钳制`、`step 非正时回退为 1`、`步进按 step 累加且不被吸附到 step 整数倍`。复核后依赖已还原为 `2.10.4`（工作区洁净）。
- **触发条件（可判定）**：在 `reka-ui` **≥ `2.11.0`**（含 PR #12 的目标版本）下**上述命令 4 例全过**（回归消除），**或**本仓显式适配其步进行为变更。

### 4.2 `conventional-changelog` 8（PR #17）

- **本仓现值** `7.2.0`（`package.json` 精确钉定）；PR 目标 `8.1.3`（拉入 `conventional-changelog-writer@9`）。
- **不兼容复核（2026-10-13）**：`npm view conventional-changelog-cmyr-config version` → **3.0.0**（与 Phase 22 M2-3 时一致，未发布支持 writer 9 的新版）→ 触发条件**未满足**。
- **触发条件（可判定）**：`npm view conventional-changelog-cmyr-config version` 返回值 **> 3.0.0** 且其模板 API 兼容 writer 9（届时复跑 `pnpm changelog` 无 `headerPartial is not a function`）。

## 5. 告警面复核

`gh api repos/CaoMeiYouRen/caomei-ui/dependabot/alerts`（`state == "open"`）：

- 开着告警 **1 项**：`node-forge`（`high` / **development** 作用域 / 无修复版本）；
- **运行时（`runtime`）作用域开告警 = 0**（清零状态保持）。

即本条目范围外的 `node-forge` 为既有无补丁项（Phase 22 M2-2 已登记），不因本批次变化。

## 6. 载体同步

- [`docs/plan/backlog.md`](../../plan/backlog.md) §1.6：`reka-ui` 行补 2026-10-13 实测复核（2.11.0 仍 4 例失败）与可判定触发；`conventional-changelog` 行补 2026-10-13 版本复核与可判定触发。两行均**维持**，不外迁、不删除。
- 陈旧 PR 关闭属 GitHub 侧动作，无库内条目需迁出（两者从未登记为候选）。

## 7. 质量门

本批为**治理动作 + 纯文档批次**（GitHub 侧关闭 2 个 PR；库内零 `src/**` 零 `test/**` 零 `.github/**` 改动）：

- `pnpm lint:md:check` / `pnpm docs:check` / `pnpm governance:check`；
- `pnpm verify` 常驻链。

## 8. Review Gate

R1 `standard` **`Pass`**（0 blocker / 0 warning / 3 suggest）。本批为 M3-1 / M3-2 两条目**合并单分区审计**（5 文件 / +172 −3，未触发并发分区阈值）。3 条 suggest 均**同批采纳**，记「已修复未复审」：

- **RG-S01**（首次）§4.1 触发条件主语「`reka-ui` 最新版」为移动引用 → 改为 **≥ `2.11.0`**（锚定 PR #12 目标版本）。
- **RG-S02**（首次）§4.1 的 registry `latest` 属仓库外易变事实 → 补「时点快照 2026-10-13」标注。
- **RG-S03**（首次，流程类）§8 回填会刷新记录 mtime → 回填后重写审计工件以保证 `check-review-gate-artifacts` 新鲜度（同批执行）。

**实测用时约 3 分 35 秒**，未超 10 分钟时间盒。审计工件：`artifacts/review-gate/2026-10-13-phase23-m3-ci-env-dependency-governance.md`（本地态、git-ignored）。
