# Phase 24 M3-1：暂存区卫生机检（提交路径守卫）

> 创建时间：2026-10-14
> 阶段条目：Phase 24 M3-1（主线 M3 治理装置与规划载体补口）
> 来源：[Phase 23 M2-1 记录](./2026-10-13-phase23-m2-1-downstream-compat-explicit-version-run.md) §1 / §9 的 R3 blocker（「修复未 `git add` → 索引版与工作区不一致、复审读旧快照」）——该批次按 [AI 协作规范 §3.5](../../standards/ai-collaboration.md) 把它登记为「下一次治理装置批次」的候选，Phase 24 D4 裁定纳入（[第八轮范围评估 §8.1](./2026-10-13-next-stage-scope-evaluation-8.md)）。

## 1. 结论摘要

- **交付**：新增 `scripts/governance/check-staging-hygiene.mjs`（279 行）——**提交路径**守卫，与 `check-review-gate-artifacts.mjs` **同层**接入 `.husky/pre-commit`（排在 `lint-staged` **之前**，以检测作者留下的「改后未 `git add`」状态），并新增 `pnpm check:staging-hygiene` 脚本入口。
- **规则从「文档必查」升级为「机检」**：该规格原先只写在 [AI 协作规范 §9](../../standards/ai-collaboration.md) 的「复审 / 提交前的暂存区卫生」（仅标注「Review Gate 必查」，无机检载体）——本批把它落成守卫，并在 §9 与 [开发规范 §12](../../standards/development.md) 登记**机检面**。
- **判别力三条独立证据**：① 单测 **27 例**（含正例 / 反例 / 形态矩阵 / 受检面断言 / fail-closed 回归，见 §5）；② **真实仓库负向对照**——对已暂存文件追加一行制造 `AM`，守卫 `exit 1` 并指名该文件，还原后 `exit 0`（§3）；③ CLI 夹具对照——`AM` / `MM` / 非 git 目录 `exit 1`、干净夹具 `exit 0`、空暂存夹具跳过（§5）。
- **不覆盖 `??`（未跟踪）与「仅工作区未暂存改动」**：前者无索引版本可比、后者索引未被触碰，均不构成「索引 ≠ 工作区」的读旧快照风险（形态矩阵见 §2）。

## 2. 判别规则与受检面

| 编号 | 失败码 | 触发条件 |
|:---|:---|:---|
| T1 | `git-error` | `git diff --cached --name-only` 或 `git status --porcelain` 执行失败（**fail-closed**，不静默放行） |
| T2 | `malformed-entry` | 状态条目无法解析（不足两个状态字符 / 第 3 字符非空格 / 路径为空）——防「解析失败 ⇒ 读不到问题 ⇒ 静默通过」 |
| T3 | `partial-stage` | **同一文件既有暂存又有未暂存改动**：`X ∉ {空格, ?, !}` 且 `Y ∉ {空格, ?, !}`，覆盖 `AM` / `MM` / `RM` / `MD` / `AD` / `TD` 等全部组合 |
| T4 | `scope-narrowed` | 已暂存范围非空，但解析出的状态条目数低于下界 `SCOPE_FLOOR.entries = 1`（防受检面被静默收窄） |
| T5 | `staged-surface-incomplete` | 某个**已暂存文件**未出现在解析出的状态条目中（比 T4 的下界更精确的读面断言） |
| T6 | `unmerged` | 状态位组合属未合并族（`DD` / `AU` / `UD` / `UA` / `DU` / `AA` / `UU`）——与 T3 的风险不同源（是「提交被拒」而非「读旧快照」），故单列一码而不并入 T3 的文案；按**组合**判定以覆盖不含 `U` 位的 `AA` / `DD` |

- **受检面**：`git status --porcelain=v1 -z` 的**全量条目**（`-z` 形态不做引号转义，路径可原样比对；索引位为 `R` / `C` 时其后紧跟的原路径 token 会一并跳过）。
- **「暂存范围是否为空」的判定**：`git diff --cached --name-only -z`（**不加 `--diff-filter`**）——即「索引相对 `HEAD` 有差异」；加过滤器会把「仅类型变更」（`T`）这类少见形态误判为空而跳过（本批 R1 的 A-S1）。
- **跳过条件**：索引与 `HEAD` 无差异（如 `git commit --allow-empty`）——无暂存内容即无卫生面，打印原因后 `exit 0`。
- **有意不在面内**：`??`（未跟踪，无索引版本可比）与「仅工作区未暂存改动」（`X` 为空格，索引未被触碰）；已暂存**删除**（索引位 `D`）不判失败（索引与工作区一致地不含该文件）。

## 3. 真实仓库负向对照（可复算）

| 步骤 | 命令 | 结果 |
|:---|:---|:---|
| 正例 | `node scripts/governance/check-staging-hygiene.mjs` | `OK：受检 6 个状态条目` / **exit 0**（**快照口径**：守卫开发期，当时暂存集为 6 文件；交付态为 **9** 文件） |
| 制造违规 | 对已暂存文件追加一行（工作区改动） | `git status --porcelain <file>` → **`AM <file>`** |
| 反例 | 同一条命令 | `[error] partial-stage: AM scripts/governance/check-staging-hygiene.mjs（索引与工作区同时有改动：请 \`git add\` 后再提交）` / **exit 1** |
| 还原 | 从备份 `cp` 还原后再跑 | `git status --porcelain <file>` → **`A  <file>`**；守卫 **exit 0** |

## 4. 接线与规范登记

- **提交路径**：`.husky/pre-commit` 在 `check-review-gate-artifacts.mjs` 之后、`lint-staged` 之前插入本守卫（`lint-staged` 会 `git add` 整文件，故卫生判定必须先行，才能拦下作者留下的 `AM` / `MM`）。
- **脚本入口**：`package.json` 新增 `check:staging-hygiene`。**不接入** `governance:check` / `verify`——该守卫只在提交路径有意义（CI 为干净检出，必然跳过），与 `check-review-gate-artifacts` 同口径。
- **规范登记**：[AI 协作规范 §9](../../standards/ai-collaboration.md) 「复审 / 提交前的暂存区卫生」补**机检面**（规则单点定义在该节）；[开发规范 §12](../../standards/development.md) 新增「暂存区卫生」条，只保留硬性要求 + 指回 §9 的单点定义（不重复整句）。
- **既有条款回扫**：[Git 规范 §3](../../standards/git.md) 的 `lint-staged` 括注原写「未匹配的文件如 `package.json` **可安全部分暂存**」——在新守卫下该建议不再成立（部分暂存一律 `partial-stage`），已同批改写为「不会被 `lint-staged` 整文件 stage，但**部分暂存本身被 `check:staging-hygiene` 阻断**，分提交一律走『临时还原 → 提交 → 恢复』」（本批 R1 的分区 A-W1 / 分区 B-B1）。

## 5. 单测（27 例）

- `parseStatusZ`（3 例）：普通条目 / 未跟踪、重命名条目跳过原路径 token、不可解析条目计入 `malformed` 而非静默丢弃。
- `inspectStatus`（11 例，纯判定层，不触碰文件系统）：仅索引改动不判失败；`AM` / `MM` 判 `partial-stage`；`RM` / `MD` / `AD` 同族组合一并判；未跟踪与仅工作区改动不在面内；下界触发 `scope-narrowed`；缺条目触发 `staged-surface-incomplete`；未合并冲突单出 `unmerged`；已暂存删除（索引位 `D`）不判失败；`enforceScope=false` 时不下受检面断言；`malformed` 独立出码。
- `readStagedPaths`（1 例）：取索引相对 `HEAD` 的**全部**变更路径（含删除）。
- `checkStagingHygiene`（7 例，真实 git 夹具）：全部已 `add` 时通过；`AM` 判失败；`MM` 判失败；未跟踪文件与工作区未暂存改动**不误报**；无暂存内容时跳过；**非 git 目录判 `git-error` 而非静默通过**；暂存删除（索引位 `D`）不误报且不再触发「范围为空」跳过。
- CLI（5 例）：`AM` 夹具 `exit 1`、`MM` 夹具 `exit 1`、干净夹具 `exit 0`、空暂存夹具跳过并 `exit 0`、**非 git 目录 `exit 1`**。
- **负向对照覆盖**：`AM` / `MM` 各有「判定层 + 真实 git 夹具 + CLI」三条独立路径；**fail-closed（T1）另有「判定入口 + CLI」两条回归**（R1 的 A-W2）。
- 分组对账：3 + 11 + 1 + 7 + 5 = **27**（`grep -cE '^\s*it\(' scripts/governance/check-staging-hygiene.test.mjs` = 27）。

## 6. 边界与有意不覆盖

1. **部分暂存（`git add -p`）会被判失败**——这是**有意**的：部分暂存时索引版本 ≠ 工作区版本，正是「复审读旧快照」的同一形态。需同文件分提交时按 [Git 规范 §3](../../standards/git.md) 的「临时还原 → 提交 → 恢复」流程处理；该规范原有的 `package.json` 部分暂存许可已同批改写（见 §4 末条），本批已回扫该载体，不留「允许 / 阻断」并存。
2. **不覆盖提交后状态**：守卫只在 `pre-commit` 运行；提交后若继续编辑工作区，属正常开发态，不在本守卫语义内。
3. **`-z` 解析依赖 porcelain v1 形态**：形态漂移由 T2（`malformed-entry`）与 T4 / T5 读出，不会静默通过。
4. **不阻断 `--no-verify`**：与既有关卡同层，`--no-verify` 仍可整体跳过（规范禁止，非本守卫职责）。
5. **未合并冲突（T6）在提交路径实际不可达**：`git commit` 会在运行钩子前因未合并文件报错退出；保留该码是为了让冲突态不被误报为 `partial-stage`（语义正确性优于可达性）。判定按**状态位组合**（`DD` / `AU` / `UD` / `UA` / `DU` / `AA` / `UU`），故不含 `U` 位的 `AA` / `DD` 也被覆盖。

## 7. 载体同步

- `docs/plan/todo.md`：M3-1 状态回填（与本记录 §9 Review Gate 结论**同批**落地，不早于结论）。
- `docs/design/governance/index.md`：本记录登记。
- `.session`：本 session 收尾时按 todo-manager Step 3 同步（本批**不命中**阶段登记 / 归档 / 范围变更三类触发点）。

## 8. 质量门

- `pnpm verify` **exit 0**（119 文件 / **2347 例**；本批 +1 文件 / +27 例）。
- `pnpm lint:check` / `pnpm lint:md:check` / `pnpm typecheck` / `pnpm typecheck:docs` 全绿。
- `pnpm governance:check` **exit 0**（`check-governance-records` **170 记录 / 361 指针**、`check-governance-counts` 72 条、`check-planning-numbers` **0 命中**（814 受检文件 + 1 规划载体）、`check-final-newline` **1225** 文件、`check-docs-git-revision` **323 md / 187 条**）。
- `docs:check` 12 段全绿（integrity **362** / links **364** / structure **323** 页 + 侧栏 7 组 48 条目 / interpolation **323** / example-refs **323** md · 382 引用 · 363 文件 / line-count ok）。以上计数均按**全部产物 staged 后**复算（本记录自身已计入 integrity / structure / governance-records 受检面）。
- **过程修复（D 阶段，本批内）**：① 守卫文件头注释含规划编号 → `check-planning-numbers` 判 4 处命中 → 改为带文档路径的导航指针；② `readStagedPaths` 初版带的 `--diff-filter=ACMR` 会把「仅类型变更」误判为空、并让「排除删除」语义与「暂存范围为空」的声明不等价 → 去掉过滤器（R1 A-S1）；③ 单测夹具期望值随语义变化同步（删除现计入暂存路径）。
- **过程修复（R1 后同批）**：① **跨载体冲突**（分区 A-W1 / 分区 B-B1）——`git.md §3` 的「`package.json` 可安全部分暂存」与新守卫互斥 → 改写该括注（§4 末条）；② 记录 §5 单测分组计数「8 例」与实现不符（实为 9，分组和 21 ≠ 22）→ 全量重算为 **3 / 11 / 1 / 7 / 5 = 27**（分区 B-B2）；③ 补 **T1 fail-closed 回归单测 2 例**（分区 A-W2）；④ `unmerged` 单列一码，不再误报为 `partial-stage`（分区 A-S2）；⑤ 记录 §3 正例补快照口径说明、§5 分组补对账式（分区 B-W1）；⑥ `ai-collaboration §9` ↔ `development §12` 去重并显式互链（分区 B-W2）。
- **过程修复（R2 后同批）**：① 记录 §1 / 索引的脚本行数 `264` → **`279`**（R2 新 finding 1，**与 RG-B2 同根因**：修复点落地后未重算规模口径——本批为「计数漂移」族在本条目内第二次出现，已按 [AI 协作规范 §3.5](../../standards/ai-collaboration.md) 记入 §10 已知观察并请求用户裁定是否落机检）；② §3 快照口径的「交付态为 8 文件」→ **9**（R2 新 finding 2）；③ §8 `check-docs-git-revision` `186 条` → **`187` 条**（R2 新 finding 3）；④ `unmerged` 判定由「含 `U` 位」扩为**组合族**（补 `AA` / `DD`，覆盖不含 `U` 位的真未合并态）并扩该族单测（R2 新 finding 4；单测数不变——原 1 例扩为 3 个组合断言）。
- **环境观察（本机容器）**：一次 `governance:check` 整链因 `git` 报 `fatal: could not open '/dev/null' for reading and writing: No such file or directory` 而中断（`check-interpolation` 段），随后 `/dev/null` 随即恢复（`crw-rw-rw-`，重建时点 `18:51`），原样复跑 **exit 0**——属容器 `/dev/null` 瞬时缺失，**非本批产物问题**（同批 `docs:check` 各段单独复跑均通过）。凡「整链单段报 `fatal` 且命令语义与产物无关」时，先复核设备 / 环境再判产物。

## 9. Review Gate

- audit-depth：`standard`（新增守卫脚本 + 提交路径接线 + 规范登记，属配置 / 工具链改动；未涉发布流程、安全 / 鉴权、数据写入、依赖版本与 agent-skill 定义，不取 `deep`）。时间盒：≤ 10 分钟。
- **并发分区（§3.2）**：本批新增行数 > 400 且跨「装置 / 接线」与「规范 / 治理载体」两个模块 → 按模块划分 2 个分区并行；**总时间盒 = 各分区时间盒最大值 = ≤ 10 分钟**（并行不累加）。
- **R1（分区 A：装置与接线，`standard`）**：**`Pass`**（**0 blocker / 2 warning / 2 suggest**）——A-W1 跨载体冲突（`git.md §3` 允许部分暂存，与本批阻断互斥）；A-W2 `git-error`（fail-closed）缺回归单测；A-S1 `--diff-filter=ACMR` 与「暂存范围为空」声明不等价；A-S2 未合并状态被归入 `partial-stage` 码。审计方独立复算了重命名路径口径（`git mv` + 含空格文件名 → T5 不误报）、`RM` 真夹具、fail-closed（非 git 目录 → `git-error` / exit 1）与混合形态，结论与实现一致。
- **R1（分区 B：规范与治理载体，`standard`）**：**`Reject`**（**2 blocker / 2 warning / 2 suggest**）——B1 同 A-W1（`git.md §3` 与本批规则互斥，判「规范自身允许 / 阻断并存」）；B2 记录 §5 单测分组计数 8 与实现不符、分组和 21 ≠ 标题 22；B-W1 §3 正例计数未钉快照口径；B-W2 两处规范载体整句重复且无互链；B-S1 §12 归口位置；B-S2 §9「见下方」悬空。
- **汇总（取最严）**：**`Reject`**（分区 B 存 blocker）。R1 的 7 条 findings 已按上表同批修复。
- **R1 实测用时**：发起前取戳 `18:37:13 +08:00`；**未在返回时点取戳**——按「返回后首次可溯源取戳」计，上界 ≤ 7 分 53 秒（至 `18:45:06` 的定向测试），该上界含返回后的编辑与测试操作，**已按 [AI 协作规范 §3.3](../../standards/ai-collaboration.md) 如实登记为分级校准信号**（未超 10 分钟时间盒）。
- **R2（delta，单一分区，`standard`）**：**`Pass`**（**0 blocker / 0 warning**）——R1 的 9 条 finding（2 blocker + 4 warning + 3 suggest 口径按分区合并后）**全部关闭**；新增 4 条 finding **均属新范围**，按 §3.4 记 follow-up、不阻断本轮，并已同批采纳修复（见 §8 末条）。审计方独立复跑：守卫自检 `OK` / `exit 0`、定向单测 **27 passed**、`check-docs-git-revision` = 323 md / 187 条、`rg` 规范两处口径核对、`git status` 9 文件全 staged。
- **R2 实测用时**：发起前取戳 `18:55:57 +08:00`；**未在返回时点取戳**，上界 ≤ 5 分 42 秒（至 `19:01:39` 的定向测试，含返回后的修复操作），未超 10 分钟时间盒。
- 审计工件：本轮两分区 R1 + R2 的证据以各子代理回复为准，按仓库惯例转录落盘 `artifacts/review-gate/`（**本地态、git-ignored**）。

## 10. 已知观察

1. **「计数 / 规模口径在修复点落地后未重算」在本条目内连续两次出现**（R1 分区 B-B2 = 单测分组计数与实现不符；R2 新 finding 1 = 脚本行数与实现不符，属**同根因复发**）。本批的处置是「人工逐处重算 + 载体同步」，**未**落机检约束（本条目仍在默认 3 轮预算内、R2 已 `Pass`，不触发 [AI 协作规范 §3.5](../../standards/ai-collaboration.md) 的改进协议）。**候选**：为治理记录中「声明的文件行数 / 测试计数」与实现加对账守卫（与 `check-governance-counts` 同族）。该候选**未登记**进 `docs/plan/backlog.md`（按 [规划规范 §3](../../standards/planning.md) 交用户决策后登记），此处仅留痕。
2. **`artifacts/` 的落盘口径**：两轮审计方均按调用方指令未写入文件，证据由调用方转录（与既有条目 `artifacts/review-gate/*.md` 的做法一致）。
