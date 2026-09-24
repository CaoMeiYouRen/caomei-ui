# M4-1 文档站双花括号插值机检守卫交付与验证记录

> 阶段：Phase 13（组件能力补齐与 dependfix 迁移解阻）→ M4 治理守卫精选。
> 范围依据：[下一阶段范围评估 §6 / §11](./2026-09-23-next-stage-scope-evaluation.md)（D9 纳入 1 项）；条目登记：[待办归档](../../plan/todo-archive.md) Phase 13 M4；同批上游记录：M3 见 [M3 迁移交付面](./2026-09-23-m3-migration-delivery.md)。

## 1. 范围与目标

按 [待办归档](../../plan/todo-archive.md) M4-1 与用户裁定 D9：为文档站补**双花括号插值机检守卫**——`docs/**/*.md` 中**围栏外**出现的字面双花括号纳入守卫，并登记允许插值的页面。

**背景（真实缺陷面）**：VitePress 把 `.md` 当 Vue 模板编译，页面里出现的字面双花括号会被求值；2026-09-22 M2-1 落地时**两次踩中**（`design/documentation-site.md` 与 `guide/release.md` 的行内代码里写字面量 → 目标页抛 `TypeError: Cannot read properties of undefined (reading 'version')`）。该失败**只在渲染日志可见**，`pnpm docs:build` 仍 exit 0，无任何机检拦截。

**非目标**：不做与 dependfix 迁移无关的守卫扩面（T3 其余 3 项留 [Backlog](../../plan/backlog.md)）；不修改受保护的 `AGENTS.md`。

## 2. 交付面与规模

| 文件 | +/− | 内容 |
| :--- | :--- | :--- |
| `scripts/docs/check-interpolation.mjs` | +261 −0 | 守卫脚本：围栏外字面双花括号检测 + 允许插值页登记表（含反向校验）+ 受检范围抗静默收窄断言 + CLI |
| `scripts/docs/check-interpolation.test.mjs` | +276 −0 | 26 条正反例语料（识别 / 登记表反向校验 / 受检范围 / 注入式运行 / CLI 退出码 / 仓库不变量） |
| `package.json` | +2 −1 | 新增 `docs:check:interpolation` 并接入 `docs:check` 链（`docs:check:version` 之后） |
| `docs/design/documentation-site.md` | +1 −0 | §13 补守卫说明（规则 / 登记表 / 反向校验 / 抗静默收窄） |

**规模**：代码与文档载体 **4 文件 / +540 −1**（唯一口径；含 Review Gate 修复点）。复算命令 `git diff 62ec030 --numstat -- package.json scripts/docs/check-interpolation.mjs scripts/docs/check-interpolation.test.mjs docs/design/documentation-site.md`（base = Phase 13 M3 收口提交 `62ec030`（持久 ref），快照 2026-09-24；4 行输出 = `+1` / `+2 −1` / `+261` / `+276`，合计 `+540 −1`）；另有本记录与治理索引 / `todo.md` 进度行等治理载体，不计入该口径。

## 3. 守卫规则与正反例

**规则（error，命中即 exit 1）**：

1. `literal-interpolation`——`docs/**/*.md` 中**围栏外**（含行内代码）出现的字面双花括号。围栏代码块由 VitePress 的 `v-pre` 豁免（`vue` / `css` / `ts` 等普通语言围栏均命中 `v-pre`）；行内代码**不豁免**（仍参与模板求值，正是 M2-1 踩中形态）。
2. `allowlist-*`——允许插值页面登记表（`INTERPOLATION_ALLOWLIST`，当前为中英《快速上手》与《版本与兼容策略》四页）须非空、覆盖中英两侧（`allowlist-scope-narrowed`）、文件存在（`allowlist-missing`）、且仍含登记的插值形态（`allowlist-stale`，**反向校验**：登记失效即失败，防清单腐烂）。
3. `scan-scope-narrowed`——受检 `.md` 文件数须达下界（`MIN_SCANNED_FILES = 150`，当前实测 211）且覆盖 `docs/guide/` 与 `docs/i18n/en-US/`（防 glob / 过滤被静默收窄）。

**登记表与 `check-site-version` 的关系**：本守卫的登记表只放行「消费 `theme.version`」的插值形态，与 `check-site-version.mjs` 的 `VERSION_SURFACES` 页面面保持同集合——新增插值页面时两处需同步（守卫对未登记页面的插值直接失败，构成强制登记点）；该不变式由单测**机检断言**（`INTERPOLATION_ALLOWLIST` 文件集合 == `VERSION_SURFACES` 的 `kind: 'page'` 集合），不再仅靠散文约定。

**正反例语料**（26 tests）：

| 用例 | 期望 |
| :--- | :--- |
| 围栏外字面双花括号 | 命中并报 `file:line` 与片段 |
| 行内代码中的字面双花括号 | 命中（不豁免） |
| ```` ``` ```` 与 `~~~` 围栏内的字面双花括号 | 不命中 |
| 单个花括号（对象字面量 / CSS） | 不误报 |
| 未闭合围栏后的内容 | 按围栏内处理（与完整性守卫同一围栏口径） |
| 登记页的已声明形态 / 额外插值 | 前者放行、后者命中 |
| CRLF 行尾与多行同现 | 逐行报出 |
| 登记形态剥离的 flag 处理 | 保留原 flag（`i` 等）仅追加 `g` |
| 登记表空 / 缺前缀 / 缺文件 / 形态失效 | 分别报 `allowlist-scope-narrowed` / `allowlist-missing` / `allowlist-stale` |
| 受检文件数低于下界 / 缺前缀 | `scan-scope-narrowed` |
| 非 git 目标根 | 受控错误（`不是 git 仓库`）而非堆栈 |
| 仓库不变量 | 登记表结构未收窄、与版本展示面同集合、当前仓库零问题 |

## 4. 验证与证据

- **仓库级负向对照（实测灵敏）**：向受版本控制的 `docs/plan/backlog.md` 临时追加「围栏外字面插值 + 行内代码插值 + 围栏内插值」三种形态 → 守卫 **exit 1**，精确报出前两行（`115:literal-interpolation` / `117:literal-interpolation`）且**围栏内那行不报**；`git checkout` 还原后 **exit 0**。
- **正向**：`node scripts/docs/check-interpolation.mjs` → `OK：受检 211 个 .md 围栏外无字面双花括号，登记允许插值 4 页`（全库零误报）。
- **门禁接线**：`pnpm docs:check` 由 9 段扩为 **10 段**（`docs:check:interpolation` 位于 `docs:check:version` 之后），并随 `governance:check` 进入 `pnpm verify` 与 CI 合并门禁。
- **质量门**（快照 2026-09-24，Review Gate 修复点落地后复跑）：`pnpm verify` **exit 0**（全链路：lint:check / lint:css:check / lint:md:check / typecheck / typecheck:docs / test / build / check:build / check:resolver / check:nuxt / docs:build / docs:check:i18n-routing / governance:check）；其中 `pnpm test` 88 文件 / 1793 tests（新增 26）；`pnpm docs:check` 10 段链全绿（integrity 250 md / links 249 md / structure 211 页 + 侧栏 47 条目 / config-links 160 条 / i18n-parity 59 对 / version / **interpolation** / showcase 13 项 / line-count / i18n）；`pnpm docs:build` exit 0（无 dead link、无渲染 `TypeError`）。
- **V 阶段显式跳过**：本条目为 Node 守卫脚本 + 静态文档，无组件 / 样式 / 交互面；文档渲染由 `docs:check` + `docs:build` 覆盖，符合 M4-1 最小验收标准（「守卫带正反例语料、接入 `docs:check` 链、受检范围未被静默收窄可断言」）。

## 5. Review Gate

**第 1 轮（`audit-depth: standard`；时间盒 ≤ 10 分钟；理由：新增门禁脚本与语料，需定向核验规则边界与正反例灵敏性；含 `package.json` 配置接线，配置类至少 `standard`）：`Pass`（0 blocker / 2 warning / 4 suggest）**，实测约 **5 分钟**（宿主时钟 `2026-09-24T00:57:06+08:00` 起，未超时间盒）。审计方独立复跑守卫本体（受检 211 / 登记 4 页）、`check-governance-records` / `check-planning-numbers`、ESLint 定向，并逐条核验 7 个检查点（围栏口径同源、反向校验、抗静默收窄、语料判别力、正则状态泄漏、第二事实源取舍、规划编号）。

| 编号 | 级别 | 内容 | 处置 |
| :---: | :--- | :--- | :--- |
| RG-W01 | warning | 治理记录规模口径「5 文件」与 §2 表格 4 行 / 复算命令 4 路径矛盾（同错复制到索引与 `todo.md`） | **已同批修正**：三处统一为 **4 文件 / +507 −1**（复算命令输出 4 行）；后经 RG-B01 刷新为 **+540 −1** |
| RG-W02 | warning | 记录受检文件数 210 与实测 / 索引 211 不一致（快照时记录自身未 `git add`） | **已同批修正**：§3 / §4 统一为 **211** |
| RG-S01 | suggest | `stripAllowedInterpolations` 硬编码克隆 flag（`'gu'`），与 `probe` 的保留 flag 口径不一致 | **已同批修正**：改为保留原 flag 仅追加 `g`，并补 flag 用例 |
| RG-S02 | suggest | `INTERPOLATION_ALLOWLIST` 与 `VERSION_SURFACES` 页面面为第二事实源（当前一致、仅散文约定同步） | **已同批修正**：新增集合相等断言，升级为强制不变量 |
| RG-S03 | suggest | `<script setup>` / `<template>` 块未纳入围栏口径且未声明（潜在误报，当前零命中） | **已同批修正**：脚本文档「已知边界」补声明（保守方向，不改口径） |
| RG-S04 | suggest | 非 git 目标目录下 CLI 抛未捕获堆栈而非受控错误 | **已同批修正**：`collectDocsMarkdownFiles` 捕获后给受控错误 + CLI 兜底，并补用例 |

审计方另记 1 条**残余盲区**（非本批回归）：登记表反向校验的 `probe` 为**全文非围栏感知**，若把登记形态移入围栏，`allowlist-stale` 与 `check-site-version` 均不报——两守卫共有盲区，未在本批扩面，见 §6。

**第 2 轮（复审，只审修复点；`audit-depth: standard`；时间盒 ≤ 10 分钟）：`Reject`（1 blocker）**，实测约 **4 分钟**（宿主时钟 `2026-09-24T01:06:40+08:00` 起，未超时间盒）。5 条 finding 判定闭合，RG-W01 判**未闭合**并升级为 blocker。

| 编号 | 级别 | 内容 | 处置 |
| :---: | :--- | :--- | :--- |
| RG-B01 | blocker | §2「唯一口径」行数仍为修复前快照（`+248` / `+256` / `+507`），与修复点落地后的实测 `+261` / `+276` / `+540` 不符；§2 测试描述「23 条」与 §3 / 索引 / `todo` 的 26 条矛盾——计数不可复算且记录内部不自洽（[AI 协作规范 §3.3](../../standards/ai-collaboration.md) 计数须给可复算口径） | **已同批修正**：§2 表格与规模行刷新为 `+261` / `+276` / **4 文件 / +540 −1**、测试 **26 条**；索引与 `todo.md` 同步为 `+540 −1` |

**第 3 轮（复审，只审 RG-B01 修复点；`audit-depth: standard`；时间盒 ≤ 10 分钟）：`Pass`（0 blocker）**，实测约 **3 分钟**（宿主时钟 `2026-09-24T01:11:00+08:00` 起，未超时间盒）。审计方独立复跑复算命令（4 行 `+1` / `+2 −1` / `+261` / `+276`，合计 `+540 −1`，与 §2 逐行 + 合计一致）、三处规模数与测试条数一致性、`check-governance-records`（exit 0），并确认 §5 / §6 未把「修正」误述为「已复审通过」。RG-B01 **已闭合，可进入提交**；另附 1 条非阻塞 suggest（RG-W01 处置列补刷新链路），已同批采纳并记为「已修复未复审」。R3 后另补两处非阻塞收口（§4 补 `pnpm verify` 全链路 exit 0 证据、RG-W01 处置列刷新链路），同为「已修复未复审」。

## 6. 结论与残留项

M4-1 已交付：新增 `docs:check:interpolation` 守卫，覆盖围栏外字面双花括号（含行内代码），登记允许插值四页并做反向校验（登记集合与版本展示面机检同集合），对受检文件数下界与中英前缀覆盖设断言；接入 `docs:check` 链（10 段）并随 `governance:check` 进入 `verify` 与 CI。仓库级负向对照灵敏、全库零误报。Review Gate：第 1 轮 `Pass`（0 blocker / 2 warning / 4 suggest）→ 6 条 finding 修正 → 第 2 轮复审 `Reject`（1 blocker：§2 计数为修复前快照、不可复算）→ 计数刷新 → 第 3 轮复审 **`Pass`（0 blocker）**，RG-B01 闭合。

**残留项**：

- **M3-2** 0.3.0 版本交付（依赖 npm 凭据）**未启动**；**M3-3** 0.x 冻结窗口声明依赖 M3-2、**未启动**。
- T3 其余 3 项守卫（直连 Reka 触发器 / 组件总览页成员对账 / 迁移口径一致性）维持 [Backlog](../../plan/backlog.md)。
- `-vue` 后缀语言的围栏会保留插值，本仓未使用，属本守卫**已知不覆盖**（已在脚本文档与 §13 声明）；`<script setup>` / `<template>` 块按普通文本扫描（潜在误报，当前零命中）。
- 登记表反向校验的 `probe` 为全文非围栏感知（与 `check-site-version` 共有盲区），未在本批扩面。
