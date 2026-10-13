# Phase 24 M1-2：下游兼容检查回归判别力补齐（负向对照）

> 创建时间：2026-10-14（本地 +08:00；run 发生在 2026-10-13 UTC 16:13 ~ 16:15）
> 阶段条目：Phase 24 M1-2（主线 M1 机制收口与回归判别力）
> 前序：[Phase 22 M1-1 记录](./2026-10-12-phase22-m1-1-downstream-compat-first-run.md)（run #1：管道贯通）→ [Phase 23 M2-1 记录](./2026-10-13-phase23-m2-1-downstream-compat-explicit-version-run.md)（run #2：重装生效）

## 1. 结论摘要

- **交付**：`Downstream Compat` 的**负向对照首次真实执行**——`workflow_dispatch` 传 `caomei-ui-version=0.2.0`（**已知不兼容版本**），run `38428793169` **`failure`**：步骤 1 ~ 10 全 `success`，**步骤 11 `Typecheck downstream` 失败**、步骤 12 `Build downstream` `skipped`。**期望红、实际红**，红点落在**下游自身的类型检查步**（非安装失败、非管道缺陷）。
- **判别力三段至此齐备**：管道贯通（run #1 / run #2 / 本 run 的 1 ~ 10 步）✓ / 重装生效（run #2 的版本差 + 本 run 的错误面反证）✓ / **回归判别力 ✓（本批新增：装了会破坏下游的版本 → 报红，且失败可逐条归因到版本面缺口）**。口径见 §4。
- **失败归因（6 条 TS 诊断，全部落在 `DataTable` 能力面）**：`DataTableSortMeta` 非导出成员 ×2、`#groupheader` 槽缺失 ×1、`#expansion` 槽缺失 ×2、隐式 `any` 连带 ×1——**正是 Phase 13 在 `0.3.0` 补齐的行分组 / 行展开 / 多列排序**；本仓实测 **`0.2.0` 这三类能力标记 0 处、`0.3.0` 齐备**（§5）。
- **被测版本选择**（用户 2026-10-14 裁定）：`0.2.0`——**紧邻 `0.3.0` 的最小距离**，其缺口即 Phase 13 立项的原始缺口（dependfix `apps/platform` 真实在用），故这次红具备**语义归因价值**，而非「占位包」式的退化对照。
- **本批不改 workflow、不改下游**：`downstream-compat.yml` 零改动；未触碰 dependfix 任何文件（只读 checkout + 上游 runner 内的一次性安装）；**未发布任何版本**（本 run 由 `workflow_dispatch` 触发，非 tag 触发）。
- **未覆盖边界显式登记**（§6）：tag 自动触发分支仍未执行；「实际安装版本」仍未在 run 内独立校验；`momei` 仍未接入；本次红的**判面边界**——`tags-input` 组件在 `0.2.0` 同样不存在，但 6 条诊断中**未出现**相关命中（属 `typecheck` 判面的已知盲区，非本批交付目标）。

## 2. run 事实（可复算）

| 项 | 值 |
|:---|:---|
| run id | `38428793169` |
| 触发 | `workflow_dispatch`（`master` @ `4773f7e6a6d211cf9ce9440e5d43ee373fa644e5`；**使用远端工作流版本**，本地未推送提交不参与） |
| 入参 | `caomei-ui-version=0.2.0` |
| 触发时点 | `2026-10-13T16:13:56Z`（`gh workflow run` 返回）→ run `createdAt` `2026-10-13T16:13:59Z` |
| 结论 | **`failure`**；作业 `Compat / dependfix` |
| 耗时 | run `16:13:59Z` → `16:15:15Z` ≈ **1 分 16 秒**；作业 `16:14:03Z` → `16:15:14Z` ≈ **1 分 11 秒** |
| 步骤 | 作业共 **17** 个步骤项（编号 1–12 + 4 个 `Post …` + `Complete job`）；**步骤 1–10 全 `success`**、**步骤 11 `Typecheck downstream` `failure`**、步骤 12 `Build downstream` `skipped` |
| 运行器镜像 | `Image: ubuntu-24.04`（日志 `Runner Image` 组；**仍处 2026-10-19 迁移窗口之前**，与 [Phase 23 M3-1 口径](./2026-10-13-phase23-m3-1-ci-runner-image-migration.md) 一致 —— 附带读数，供 M2-1 检测点对照） |
| 被测版本 | **`0.2.0`**（显式入参：日志 `target caomei-ui version: 0.2.0`，未回落到 `npm view` 分支） |
| 下游归因 | **`dependfix/dependfix @ 1a6aca1587ba2ccf16edebfba7c6ce93b9342602`**（job summary + 日志；较 run #2 的 `edbe5e04…` 已推进 → 移动目标） |
| override | `pnpm --filter @dependfix/platform add "caomei-ui@0.2.0"` 步骤 `success`，变更计数原始串 **`+1   -2 +-`** |

- 复算命令：`gh run view 38428793169 --json status,conclusion,jobs`；`gh run view 38428793169 --log`（本次取数落盘 `/tmp/opencode/` 之外的本地态路径，不入库）。
- **下游为移动目标**：本次 SHA `1a6aca15…`、run #2 `edbe5e04…`、run #1 `46c6fb61` 三者互不相同 —— 按工作流注释与[发布指南 §10](../../guide/release.md) 口径，红/绿均须先按该 SHA 归因。
- 本地工作区在该 run 期间**零改动**（工作区与 `origin/master` 的差异仅为本 session 未推送的规划提交，不参与远端工作流版本解析）。

## 3. 负向对照设计

| 项 | 设计 |
|:---|:---|
| 目的 | 补齐判别力第三段：证明本机制**能区分**「新版本破坏下游」与「不破坏」，而非只会出绿 |
| 形态 | `workflow_dispatch` 显式传入一个**已知会破坏下游**的历史版本；期望**红**，且红点必须落在下游验证步（`typecheck` / `build`），不能落在安装或管道步 |
| 被测版本 | **`0.2.0`**（用户裁定）：`0.3.0` 之前的最后一个版本，缺 Phase 13 补齐的 `DataTable` 行分组 / 行展开 / 多列排序与 `tags-input` 组件 |
| 不做什么 | **不发布版本**（沿用既有 registry 版本）；**不改 workflow**；**不改下游仓任何文件** |
| 反证要求 | 若为绿，则判别力不成立，须如实登记为未达标；若为红，须逐条归因到 caomei-ui 版本面缺口（而非下游自身改动 / 网络 / 安装失败） |

- **版本差仍然成立**：下游 `apps/platform` 锁定 `caomei-ui@0.6.0`，本次目标 `0.2.0` —— override 步骤 `success` 且变更计数非零，**版本面确已改变**。

## 4. 判别力三段结论

| 口径 | 含义 | 证据 | 状态 |
|:---|:---|:---|:---|
| **管道贯通** | Actions 运行时无缺陷、步骤可执行、结论可归因（下游 SHA + 被测版本） | run #1 `38238208301`（[记录](./2026-10-12-phase22-m1-1-downstream-compat-first-run.md)）；run #2 `38332448537`；本 run 步骤 1–10 全绿（含 `Checkout` ×2 / `Setup pnpm` / `Setup Node.js` / `Resolve target version` / `Record downstream revision` / `Install` / `Override` / `Setup build chain`） | **成立** |
| **重装生效** | override **确实改变**了被安装的 `caomei-ui` 版本 | run #2：版本差 + `+1 −1`；本 run：override `success` + **类型面反证**——若 `0.6.0` 仍在使用，`DataTableSortMeta` 必然存在、`#groupheader` / `#expansion` 槽必然存在，**不可能出现 §5 的 6 条诊断** | **成立** |
| **回归判别力** | 结论能区分「新版本破坏下游」与「不破坏」 | **本 run（负向对照）**：安装已知不兼容的 `0.2.0` → `Typecheck downstream` **红**，6 条诊断**逐条**归因到版本面缺口 | **成立（本批新增）** |

- **正向方向仍待真实发布验证**：本段判别力由**负向对照**建立；「被测版本**新于**下游锁定版本」的正向用例仍需一次真实发布 tag 触发（[发布指南 §10](../../guide/release.md) 的口径保持不变，`push: tags: v*` 分支**至今从未执行**）。
- 表格口径与 [Phase 23 M2-1 §5](./2026-10-13-phase23-m2-1-downstream-compat-explicit-version-run.md) 逐字对齐，本批只把第三行由「未成立」改写为「成立（负向对照路径）」。

## 5. 失败归因（可复算）

### 5.1 run 内诊断原文（6 条 TS 诊断 + 1 条 pnpm 收敛）

```text
app/pages/alerts.vue(19,32): error TS2724: '"caomei-ui"' has no exported member named 'DataTableSortMeta'. Did you mean 'DataTableSortEvent'?
app/pages/alerts.vue(582,55): error TS2339: Property 'groupheader' does not exist on type ...
app/pages/batch-runs.vue(428,28): error TS2339: Property 'expansion' does not exist on type ...
app/pages/pr-checks.vue(17,32): error TS2724: '"caomei-ui"' has no exported member named 'DataTableSortMeta'. Did you mean 'DataTableSortEvent'?
app/pages/pr-checks.vue(462,28): error TS2339: Property 'expansion' does not exist on type ...
app/pages/pr-checks.vue(474,68): error TS7006: Parameter 'source' implicitly has an 'any' type.
[ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL] @dependfix/platform@0.3.0 typecheck: `nuxt typecheck`
```

- 日志内 `##[error]` 行共 **7** 条 = 上述 **6 条 TS 诊断** + **1 条 pnpm 收敛行**；步骤 11 退出即失败。

### 5.2 归因链（诊断 → 能力 → 版本）

| # | 诊断 | 对应的 caomei-ui 能力 | 引入版本 |
|:-:|:---|:---|:---|
| 1 / 4 | `DataTableSortMeta` 非导出成员（`alerts.vue` / `pr-checks.vue`） | `DataTable` **多列排序**类型面 | `0.3.0`（Phase 13 M1） |
| 2 | `#groupheader` 槽不存在（`alerts.vue`） | `DataTable` **行分组 / 可折叠分组** | `0.3.0`（Phase 13 M1） |
| 3 / 5 | `#expansion` 槽不存在（`batch-runs.vue` / `pr-checks.vue`） | `DataTable` **行展开** | `0.3.0`（Phase 13 M1） |
| 6 | `source` 隐式 `any`（`pr-checks.vue`） | 上列槽缺位的**连带**（槽类型未解析导致回调参数推断失败） | 连带项 |

### 5.3 本仓版本面实证（复算命令与读数）

| 检查 | `v0.1.0` | `v0.2.0` | `v0.3.0` |
|:---|:---|:---|:---|
| `DataTableSortMeta` 出现文件数（`git ls-tree` + `git show` 全文计数，**限 `src/components/data-table/`**） | 0 | **0** | **4**（`types.ts` / `index.ts` / `data-table.vue` / `data-table.sorting-multi.test.ts`） |
| 行分组 / 行展开 / 多列排序标记（`rowgroup` \| `expandablerowgroup` \| `multiSortMeta` \| `expandedRows`，限于 `src/components/data-table/`） | 0 | **0** | 有（`data-table.grouping.test.ts` 39 / `data-table.expansion.test.ts` 12 / `data-table.sorting-multi.test.ts` 33 / `data-table.vue` 55 / `types.ts` 23 / `index.ts` 3） |
| `src/components/tags-input/` 文件数 | 0 | **0** | **4** |

- 结论：`0.2.0` 在**上述三类能力上确实为空**，而 dependfix `apps/platform` 的 `alerts.vue` / `batch-runs.vue` / `pr-checks.vue` **正是这些能力的消费方**（迁移评估记录 §1 先决条件 1 即此）→ run 内红与版本面缺口的对应关系**逐条闭合**。
- **判面边界（如实登记）**：dependfix `apps/platform/app/components/repo-form-dialog.vue` 在用 `TagsInput`（`search/code` 实测），而 `0.2.0` 无该组件，但**本 run 的 6 条诊断中没有 TagsInput 相关命中** —— `typecheck` 步对「未注册组件」形态的拦截力弱于「已知组件的未知 prop / 槽」。属本机制的**已知盲区**，本批不改判面、不改 workflow。

## 6. 未覆盖边界（显式登记）

1. **tag 自动触发分支**仍未执行（`push: tags: v*`）——run #1 / run #2 / 本 run 均为 `workflow_dispatch`；需下一次真实发布。
2. **正向方向（被测版本新于下游锁定版本）**未验证——本批以负向对照建立判别力；正向用例仍待发布 tag。
3. **「实际安装版本」仍未在 run 内被独立校验**——本批的「重装生效」由「override `success` + 错误面反证」推断，未由步骤直接断言；拟加的校验步骤维持 Backlog 候选（未验证的 workflow 改动不入库）。
4. **`momei` 仍未接入**（单条阻塞：`nuxt build` 在上游 runner 的无凭据可行性未验证）。
5. **`tags-input` 缺口未被 `typecheck` 命中**（§5.3 判面边界）。
6. **本次红不代表下游当前分支的健康度**——`1a6aca15…` 与 caomei-ui `0.6.0` 的组合仍是 run #1 / run #2 口径下的绿；本 run 的红是**人为降级**的结果。

## 7. 载体同步

- [发布指南 §10](../../guide/release.md)（中英）：判别力口径段把「回归判别力**尚未成立**」改写为「**已由负向对照路径成立**（run `38428793169`，被测 `0.2.0` → `Typecheck` 红 + 逐条归因）」，正向方向仍待发布 tag。
- `docs/plan/todo.md`：M1-2 状态回填（与本记录 §9 Review Gate 结论**同批**落地，不早于结论）。
- `docs/design/governance/index.md`：本记录登记。
- `.session`：本 session 收尾时按 todo-manager Step 3 同步（本批**不命中**阶段登记 / 归档 / 范围变更三类触发点，故不触发 Step 3.5 阶段态同批同步）。

## 8. 质量门

- 本批**零代码 / 零 workflow / 零 `src/**` / 零 `test/**`**（纯文档 + 外部 run 取证）。
- `docs:check` **12 段全绿**（integrity 361 / links 363 / structure 322 页 + 侧栏 7 组 48 条目 / config-links 157 / i18n-parity 60 对 / version 0.6.0 / interpolation 322 / example-refs 322 md · 382 引用 · 363 文件 / showcase 14 / demo-external-images 363 / line-count ok〔`todo-archive.md` 355 行，阈值内〕/ i18n-old-dirs）；`governance:check` **exit 0**（`check-governance-records` **169 记录 / 360 指针**、`check-governance-counts` **72 条**（修复后按 staging 终态复算；修复前快照为 71 条）、`check-planning-numbers` 0 命中、`check-docs-git-revision` / `check-final-newline` / `check:licenses` 等全通过）。
- **`pnpm verify`：连续两轮命中「已知并行负载 flaky 类」**（本机 8 核 / 运行期 load average ≈ 4.5）——首轮 `date-picker.test.ts`「readonly 时脚本改值不生效且 DOM 回滚」1 例、第二轮 `calendar.test.ts` + `multi-select.test.ts` 各 1 例（**两轮失败面互不相同**，属该类的典型特征，非本轮引入）。**处置**：① 逐例隔离复跑 `date-picker.test.ts` **30 / 30 通过**；② 全量 `vitest run --maxWorkers=2` **118 文件 / 2320 例全绿（exit 0）**；③ verify 链其余步骤（`lint:check` / `lint:css:check` / `lint:md:check` / `typecheck` / `typecheck:docs` / `build` / `check:build` / `check:resolver` / `check:nuxt` / `docs:build` / `docs:check:i18n-routing`）逐项 **exit 0**。该类的根因与既有缓解（`vitest.config.ts` 的 `maxWorkers: 4` 兜底）见 [Phase 18 M2-1 flaky 类记录](./2026-10-01-phase18-m2-1-flaky-class.md)；本轮为**同类的环境侧复现**，未新增逐例修复面。
- 外部运行证据：run `38428793169` **`failure`**（步骤 1–10 绿、步骤 11 红、步骤 12 跳过，1 分 16 秒），失败面 6 条 TS 诊断逐条归因（§5）。

## 9. Review Gate

- audit-depth：`standard`（外部 run 取证 + 跨载体口径 + 归因链）。时间盒：≤ 10 分钟。**实测用时 R1 上界 ≤ 3 分 30 秒**（`00:33:03` → 取戳 `00:36:33 +08:00`），未超时间盒。
- **R1 `standard` `Reject`**（**1 blocker / 0 warning / 1 suggest**）。
- 修复（同批收口）：① RG-B01 → 治理索引条目删去「`pnpm verify` exit 0」失实断言，改为「`docs:check` 12 段全绿 + `governance:check` exit 0 + **verify 链其余步骤** exit 0（全量 `vitest` 两轮命中已知并行负载 flaky 类 → 隔离复跑 + `--maxWorkers=2` 118 文件 / 2320 例全绿）」，与 §8 同一事实；② RG-S01（suggest）→ §5.3 首行的计数口径补「**限 `src/components/data-table/`**」（全仓口径为 11 处，含 `docs/` / `examples/`；限定后为 4，与同表次行自洽）。
- **R2（delta）`quick` `Pass`**（**0 blocker / 0 warning**；2 项 findings **全部关闭**、无新范围；新增 1 条 follow-up suggest = §8 计数快照 `71 → 72` 滞后 → 同批采纳并复算回填）。**实测用时上界 ≤ 3 分 6 秒**（`00:36:33` → 取戳 `00:39:39 +08:00`，该上界含返回后的修复操作），未超 5 分钟时间盒。
- 审计工件：本轮 `artifacts/review-gate/` 下**未落盘**本条目证据记录（`artifacts/` 为 git-ignored 本地态；跨轮对账基线以上文 R1 / R2 结论为准）。

## 10. 已知观察

1. **全量 `vitest` 本机两轮命中已知并行负载 flaky 类**（本机 8 核 / 运行期 load average ≈ 4.5；首轮 `date-picker.test.ts` 1 例、二轮 `calendar.test.ts` + `multi-select.test.ts` 各 1 例，失败面互不相同）——该类根因与既有缓解（`vitest.config.ts` 的 `maxWorkers: 4` 兜底、`test/helpers/settle.ts` 条件轮询）见 [Phase 18 M2-1 flaky 类记录](./2026-10-01-phase18-m2-1-flaky-class.md)。本批为**同类的高负载环境侧复现**（非本批引入、未新增逐例修复面），未登记为新候选；若后续在同类环境下反复阻塞 `verify`，再按 [规划规范 §3](../../standards/planning.md) 评估是否单列候选。
2. **本批未改动任何 workflow**：`downstream-compat.yml` 零 diff；本次负向对照完全由既有 `workflow_dispatch` 入参能力承载。
