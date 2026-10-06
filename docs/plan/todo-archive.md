# 待办归档

本文档归档已完成阶段的原子条目与验收结论。当前阶段完成后，从 [todo.md](./todo.md) 迁入此处。

> **主窗口口径（2026-09-30 起）**：主窗口只保留**近线阶段窗口**（当前为 Phase 13 ~ Phase 19 的完整归档块）与其后的**归档索引**；更早阶段的完整归档块迁入**深度归档**目录 [`archive/`](./archive/)（Phase 0 ~ 6 见 [phase-00-06.md](./archive/phase-00-06.md)、Phase 7 第一阶段 ~ Phase 12 见 [phase-07-12.md](./archive/phase-07-12.md)），主窗口仅保留一行索引。该形态由 `docs:check:line-count` 的口径（主窗口只保留近线窗口与索引；warn > 400 / error > 600）驱动——归档载体只增不减，2026-09-29 已达 594 行（warn 累积），本批压缩后回落。**深度归档不改变权威**：阶段交付的权威记录仍是各阶段治理记录（见[治理索引](../design/governance/index.md)），深度归档只保存主窗口迁出的原始正文。

## 归档格式

每个阶段归档块应包含：

- 阶段名称与时间；
- 交付内容与提交记录；
- 质量门结果（lint / typecheck / test / build）；
- 审计结论（Pass / Reject 及修复情况）；
- 遗留问题与后续候选。

深度归档文件沿用同一格式（只做链接深度 `../` → `../../` 的机械调整）。

---

## 归档索引（Phase 0 ~ Phase 12）

> 完整归档块见「深度归档」列；阶段交付摘要如下（每行一行，细节以深度归档与治理记录为准）。

| 阶段 | 时间 | 交付摘要 | 深度归档 |
|:---|:---|:---|:---|
| Phase 0 | 2026-09-11 ~ 09-12 | 立项与 POC：命名 / 关键决策冻结、tsdown 构建与子路径导出、`--caomei-*` token 草案与暗色方案、AI / 文档基建、`src/` 骨架 | [phase-00-06](./archive/phase-00-06.md) |
| Phase 1 | 2026-09-12 | Tier 0 组件：Button / Input 家族 / Tag·Badge / Select / Dialog / Toast / Card / Checkbox / DataTable（列定义） | [phase-00-06](./archive/phase-00-06.md) |
| Phase 2 | 2026-09-13 | Tier 1 组件：Avatar / Paginator / Message / ProgressSpinner / ConfirmDialog（`useConfirm`）/ Password / MultiSelect | [phase-00-06](./archive/phase-00-06.md) |
| Phase 3 | 2026-09-13 | Tier 2 组件：Tabs / Accordion / DropdownMenu（10 件）/ SelectButton / Image / FileUpload | [phase-00-06](./archive/phase-00-06.md) |
| Phase 4 | 2026-09-13 | Tier 3 稳定批：RadioGroup / Slider / ToggleButton / Toolbar / Skeleton / ProgressBar / Popover | [phase-00-06](./archive/phase-00-06.md) |
| Phase 5 第一阶段 | 2026-09-13 ~ 09-14 | 文档站增强：docs `vue-tsc` 类型检查、站内搜索（中文分词）、站点 i18n 骨架 | [phase-00-06](./archive/phase-00-06.md) |
| Phase 6 | 2026-09-14 | 组件库补全与规范化：momei 使用复核台账、设计规范与主题预设、Divider / InputGroup / FloatLabel / ButtonGroup / AutoComplete / Stepper 补全 | [phase-00-06](./archive/phase-00-06.md) |
| Phase 7 第一阶段 | 2026-09-14 ~ 09-16 | 迁移就绪：消费路径与 Nuxt 接入（本地 link 先行）、组件 i18n 注入机制、DataTable 能力增强、DatePicker / Calendar / Drawer / SplitButton / ColorPicker / DataView | [phase-07-12](./archive/phase-07-12.md) |
| Phase 9 | 2026-09-16 | 发布前收口：文档站信息架构（6 分组 + 组内字母序）、代码质量门与守卫、发布清单 | [phase-07-12](./archive/phase-07-12.md) |
| Phase 10 | 2026-09-16 ~ 09-17 | 国际化与移动端适配：内建 5 语种、locale 键集合守卫、移动端与响应式适配 | [phase-07-12](./archive/phase-07-12.md) |
| Phase 7 第二阶段 | 2026-09-17 ~ 09-19 | 库侧迁移就绪与交接计划：迁移计划与验收标准、B0a 交接资产、6 主线 / 33 条原子条目 | [phase-07-12](./archive/phase-07-12.md) |
| Phase 5 第二阶段 | 2026-09-19 | 首版发布：本地手动 0.x 首发（0.1.0）、发布指南 runbook、annotated 基线 tag | [phase-07-12](./archive/phase-07-12.md) |
| Phase 11 | 2026-09-20 | 组件样式按需化与能力增强：`unbundle + css.inject`、`theme.css` 入口、4 主线 / 15 条原子条目 | [phase-07-12](./archive/phase-07-12.md) |
| Phase 12 | 2026-09-21 ~ 09-23 | 发布就绪、文档对外与一致性收官：0.2.0 发布、文档对外可用性、样式一致性收官、a11y 基线、治理守卫精选 | [phase-07-12](./archive/phase-07-12.md) |

---

## Phase 13：组件能力补齐与 dependfix 迁移解阻

- 时间：2026-09-23 用户裁定 D1~D9 后登记 ~ 2026-09-24 完成并归档（4 条主线 / 11 条原子条目全部交付）
- 授权与范围（用户决策 2026-09-23，评估记录 D1~D9）：主线取 **M1 + M2 + M3 + M4**（全取）；`DataTable` 新能力 **API 命名对齐 PrimeVue**；分组 / 展开的受控模型**受控与自持两者都支持**（受控优先、缺省自持）；提供 **`sortDescFirst`**；`TagsInput` **封装 Reka primitive**；**不补**独立 `Sidebar`（维持 `CaomeiDrawer` 承接）；**发布 0.3.0**（本地手动发布，依赖 npm 凭据）；Phase 8 **维持未启动**；M4 **纳入 1 项**（文档站双花括号插值守卫）。范围依据见[下一阶段范围评估](../design/governance/2026-09-23-next-stage-scope-evaluation.md) §6 / §11。
- 非目标：不做 dependfix / momei 侧迁移实施（他仓执行）；**不做** `ScrollPanel` / `Sidebar` / `Select filter` / `MultiSelect filter` / `Paginator` 模板 / DataTable `size`·`empty-message` 的库侧补齐（下游有页面侧改写路径或既有口径承接）；不启动 Phase 8；不做 T5 的 31 项长期候选；**不改任何 token 色值**；不做多版本托管；不修改 `AGENTS.md`（受保护文件）。

### M1 `DataTable` 能力补齐（dependfix 迁移关键路径，4 条）

- **M1-1 行分组（subheader）**：`rowGroupMode="subheader"` + `groupRowsBy`（支持点号路径）+ `#groupheader` 槽；按**连续同值**切分、只在当前渲染行序（排序 + 分页切片）上计算；分组标题行跨全部数据列、不参与冻结列吸边。**有意差异**：分组字段同名列在数据行渲染**空白占位单元格**（PrimeVue 直接不渲染 → 数据行左移一列与表头错位，primefaces/primevue#6496）；`#groupfooter` / `rowspan` 不实现。**V 阶段两遍**（首遍暴露 O1 列错位 → 当轮修复 → 复验 8 项全通过）。提交 `24eaa16` / `4258301`。Review Gate R1 **Pass**（0 blocker / 3 warning / 4 suggest，7 条修复点已同批修正）。规模 12 文件 / +768 −42。记录见 [M1-1](../design/governance/2026-09-23-m1-1-row-grouping.md)。
- **M1-2 可折叠分组**：`expandableRowGroups` + `v-model:expandedRowGroups`（`string[]`）+ 内建原生 `<button>` toggle（chevron + `aria-expanded` + 随状态切换的 `aria-label`）；**缺省时分组全部收起**（对齐 PrimeVue），收起分组的数据行不进入渲染条目、不影响分页器总条数。**有意差异**：上游切换按钮仅 chevron、无 `aria-expanded` 与可访问名，本库补齐并在无障碍段声明取名取舍。提交 `b18fe85` / `c67fe17` / `5a9603b`。Review Gate R1 **Reject**（1 blocker：内置文案台账未同步新键，无门禁覆盖）→ 修正 → R2 **Pass**。规模 22 文件 / +664 −16。记录见 [M1-2](../design/governance/2026-09-23-m1-2-expandable-row-groups.md)。
- **M1-3 行展开**：`columns` 项 `{ key, expander: true }` + `v-model:expandedRows`（`string[]` 行 key）+ `#expansion` 槽 + `@row-expand` / `@row-collapse`；展开列单元格渲染内建原生 `<button>`，表头**始终留空**（模板层单点守卫），展开行跨全部数据列、不参与冻结列吸边。**有意差异（6 条）**：`expandedRows` 仅支持行 key 数组；展开按钮**按动作取名**（上游 `expandButtonAriaLabel` 与动作相反）；`#expansion.index` 为显示序号；`aria-controls` 仅在展开行实际渲染时输出（上游始终输出、收起态悬空）。**V 阶段两轮全通过**。提交 `d3749e0` / `78e07c3` / `751ad19`。Review Gate R1 **Pass**（0 blocker / 1 warning / 5 suggest）。记录见 [M1-3](../design/governance/2026-09-23-m1-3-row-expansion.md)（规模见 §6）。
- **M1-4 多列排序与降序优先**：`sortMode="multiple"` + 受控 `v-model:multiSortMeta`（`DataTableSortMeta[]` = `{ field: 列 key, order: 1 | 0 | -1 }`）+ `update:multiSortMeta`，以及 `sortDescFirst`（表格级，决定首次点击方向）；Cmd / Ctrl 追加排序键、无修饰键收敛为单列，已排序表头渲染优先级序号。**有意差异（4 条）**：`field` 只接受列 key、`order` 只接受 `1 | 0 | -1`、只提供表格级 `defaultSortOrder`、不提供 `removableSort`。提交 `22fc0aa` / `5344f57`。Review Gate R1 **Pass**（0 blocker / 1 warning / 3 suggest）。规模 12 文件 / +711 −12。记录见 [M1-4](../design/governance/2026-09-23-m1-4-multi-sort.md)。
- **硬门禁**：新能力默认关闭 / 未使用时既有行为与计算样式零漂移（`pnpm capture:styles` **239 项 0 差异**，四条同批复跑）。
- 关键记录：[M1-1](../design/governance/2026-09-23-m1-1-row-grouping.md) / [M1-2](../design/governance/2026-09-23-m1-2-expandable-row-groups.md) / [M1-3](../design/governance/2026-09-23-m1-3-row-expansion.md) / [M1-4](../design/governance/2026-09-23-m1-4-multi-sort.md)

### M2 缺失组件补齐（`TagsInput`，3 条）

- **M2-1 组件实现与内部接线**：新增 `CaomeiTagsInput`（封装 Reka `TagsInput` primitive）——多值 `v-model`（`string[]`）、回车 / 分隔符提交、粘贴按分隔符拆分（`addOnPaste` **默认 `true`**）、点击删除 + Backspace 两段式键盘删除、`max` / `allowDuplicate`（**默认 `false`，与 PrimeVue 默认相反**）/ `delimiter` / `invalid` / `disabled` / `size` / `showClear` / `label` 等，事件 `addTag` / `removeTag` / `invalidInput`。**包装层 a11y 修复**：标签项显式 `role="group"`（Reka 在 `role=generic` 上输出 `aria-labelledby`，ARIA 1.2 禁止）→ axe `V=0 / I=0`，**未新增例外清单条目**；有标签时字段根输出 `data-filled` 接入 FloatLabel。提交 `fdbfa1f`。Review Gate **R1 Reject（1 blocker：UI 组件缺浏览器证据）→ 建立验证载体并完成真机验证 → R2 Pass**。规模 17 文件 / +719 −6。
- **M2-2 组件页与示例**：中英组件页 + 6 个示例 + 设计规范 §7 迁移映射；迁移口径「`Chips`（v4 起 `InputChips`）迁移**首选本组件**，`AutoComplete + multiple` 降为**备选**」三处一致。提交 `02a7b31` / `657c02c`（后者为 M2-1 / M2-2 的治理记录 + 索引 + todo 登记）。Review Gate R1 **Pass**（0 blocker / 2 warning / 3 suggest，W1/W2/S1/S2/S3 已同批修正）。规模 9 文件 / +414 −0。
- **M2-3 登记面接入**：接入四处登记面——文档与演示站 §11 分组登记表（表单输入组）/ `config.ts` 中英组件侧栏 / 中英组件总览页 / 画廊登记表（第 13 张卡），并修正组件清单 `docs/design/components.md` §5 陈旧项。提交 `8a8226e` / `5da4e7d`。**V 阶段（@ui-validator，真实 Chromium / dev）11 项全通过**；**T 阶段**构建产物 SSG 静态断言 18/18（容器内 preview 面 crash，已声明边界）。Review Gate R1 **Pass**（0 blocker / 1 warning / 3 suggest）。规模 6 文件 / +17 −2。
- 关键记录：[M2 `TagsInput` 交付与验证](../design/governance/2026-09-23-m2-tags-input.md)

### M3 迁移交付面（文档映射 + 版本 + 冻结窗口，3 条）

- **M3-1 迁移映射与不支持清单收口**：只补**指南层**（逐组件映射权威仍是设计规范 §7）——`guide/primevue-migration.md`（中英）「常见陷阱」表新增 3 行（标签录入 / 表格排序模型 / 表格分组与行展开），入口表补 `TagsInput`；3 行均以「见 §7 与组件页」收口，不构成第二事实源。**回扫**：入口表组件 zh 47 / en 47 与 §11 登记表 47 集合一致、47 个组件名均在 §7。**V 阶段显式跳过**（纯 markdown）。提交 `5f8aee4` / `976a0f5`。Review Gate R1 **Pass**（0 blocker / 1 warning / 3 suggest）。规模 2 文件 / +4 −1。记录见 [M3 迁移交付面](../design/governance/2026-09-23-m3-migration-delivery.md)。
- **M3-2 0.3.0 版本交付**：版本基线 `92264fc` / CHANGELOG `75c5610` / annotated tag `v0.3.0` → `92264fc` / 用户本地 `npm publish`；**发布后校验**——registry tarball shasum 与发布日志逐字符一致（350 文件 / packed 180.7 kB）、含 `dist/styles/index.css`（5,880 B）不含旧单体、`exports` 5 键、产物含本阶段全部能力、四项子路径冒烟（根 **89** 导出含 `CaomeiTagsInput` / resolver / nuxt / theme.css）+ Vite 消费方构建（CSS 19.29 kB）、`npm view` = 0.3.0、`pnpm verify` 复跑 exit 0（首跑 2 例并发时序 flaky，隔离重跑 61 passed，已登记 Backlog 出现记录 ④）。**偏差登记**：tag 视图不含 0.3.0 CHANGELOG 段 / 版本提交信息为裸版本号（`npm version` 生成，非 Conventional 形态）/ 发布前 `pnpm verify` 无留痕（发布后补跑）。**发布前门槛复核**：长期任务第 12 轮（`62ec030`）已留痕。提交 `294957e` / `e56ea2f`（本仓侧）。
- **M3-3 0.x API 冻结窗口声明**：中英《版本与兼容策略》新增「0.x API 冻结窗口」节——**冻结面** = 既有组件公开 props / events / slots 的名称与语义、子路径导出（含 `./package.json` 共 5 键）、包根公开导出名、语义化 `--caomei-*` token 名称与用途；**非冻结面** = 新增组件 / 可选 props / events / slots / token / locale 键、实现与样式细节、未从包根导出的内部模块。与 dependfix `docs/design/governance/caomei-ui-migration.md` §12 上收条件 3 对齐。提交 `ec3e957`。
- **M3 批次 Review Gate**：R1 **Reject**（2 blocker / 3 warning / 3 suggest；§6 计数为记录入库前快照、§2 复算命令缺 pathspec）→ 8 条 finding 修正 → R2 复审 **Pass**（0 blocker）。规模 6 文件 / +52 −6。
- 关键记录：[M3-2 / M3-3 收口](../design/governance/2026-09-24-phase13-m3-2-m3-3-release-and-freeze.md)

### M4 治理守卫精选（1 条）

- **M4-1 双花括号插值机检守卫**：新增 `pnpm docs:check:interpolation`（`scripts/docs/check-interpolation.mjs` + 26 tests），把 `docs/**/*.md` 中**围栏外**（含行内代码）的字面双花括号判 `literal-interpolation` 失败；围栏代码块由 VitePress `v-pre` 豁免（仅 `-vue` 后缀语言保留插值，本仓未使用，已声明为已知边界）；允许插值四页登记并做**反向校验**（`allowlist-stale`），与 `check-site-version` 的版本展示面机检同集合；受检文件数下界 + 中英前缀覆盖断言（`scan-scope-narrowed`）。**仓库级负向对照灵敏**（注入围栏外 / 行内 / 围栏内三形态 → 前两行精确命中、围栏内不报），**全库零误报**。`docs:check` 由 9 段扩为 **10 段**。提交 `3fd2f36` / `ab27e35`。Review Gate R1 **Pass** → R2 复审 **Reject**（1 blocker：§2 计数为修复前快照、不可复算）→ 计数刷新 → R3 复审 **Pass**（0 blocker）。规模 4 文件 / +540 −1。记录见 [M4-1](../design/governance/2026-09-24-m4-1-interpolation-guard.md)。

### 阶段总结

- **提交对账**：`git log --oneline 64a45d8~1..e56ea2f | wc -l` → **27**（阶段边界 `e56ea2f`；**不得写 `HEAD` 相对范围**，归档提交会推进 `HEAD`），其中 **25** 个为 M1~M4 的交付 / 记录提交（归档块逐条引用），另 2 个（`64a45d8` 范围评估 / `6dcbc10` Phase 13 登记）为候选登记与阶段登记类、非交付物。
- **质量门**：`pnpm verify` exit 0（lint / lint:css / lint:md / typecheck / typecheck:docs / test **88 文件 1793 tests** / build / check:build / check:resolver / check:nuxt / docs:build / docs:check:i18n-routing / governance:check）；`docs:check` **10 段链**全绿（integrity 251 md / links 250 md / structure 212 页 + 侧栏 47 条目 / config-links 160 条 / i18n-parity 59 对 / version / interpolation 212 md / showcase 13 项）；`test:a11y` 55（预算 47 → 48）；`capture:styles` 239 项 0 差异；`docs:build` exit 0（0 TypeError）。
- **长期任务**：阶段收口前触发一轮门槛复核（[长期任务](./recurring.md) §3 第 13 轮，2026-09-24，零代码改动域；待执行批次 1 项、条件触发 1 项维持）；0.3.0 发布前触发第 12 轮（`62ec030`）。
- **回扫口径（三段式，避免把回扫面等同于机检面）**：① **机检面 0 处**——`pnpm check:governance-records` exit 0（本阶段记录无「链接文字含阶段 / 条目编号 → `docs/plan/todo.md`」的失效指针；清理后首跑即 0 命中）。② **人工面 11 处**——「链接文字为载体名（`待办事项`）而其后紧跟条目编号」的指针（机检不覆盖该形态），本批一并改指 `todo-archive.md`，逐条枚举：`2026-09-23-m1-1-row-grouping.md:4`、`2026-09-23-m1-2-expandable-row-groups.md:4`、`2026-09-23-m1-3-row-expansion.md:4`、`2026-09-23-m1-4-multi-sort.md:4`、`2026-09-23-m2-tags-input.md:4`、`2026-09-23-m3-migration-delivery.md:4` 与 `:8`、`2026-09-24-m4-1-interpolation-guard.md:4` 与 `:8`、`2026-09-24-phase13-m3-2-m3-3-release-and-freeze.md:4` 与 `:8`（共 8 文件 / 11 处）。③ **未处理面**——Phase 7 第二阶段 / Phase 11 的 11 个历史记录（`2026-09-18-m5-*` / `m6-*`、`2026-09-20-m2-2-m2-3-style-governance-landing.md`）中同类「载体名 + 条目编号」指针，沿用 Phase 12 归档批次的既有边界（属「出证时点登记动作」的陈述，时效由各记录头部的快照 / 让渡声明界定），本批**不回改、亦未登记为待办**。
- **归档批次审计**（2026-09-24，本阶段归档与规划清理批次）：经 `@code-reviewer` Review Gate **三分区并行审计**（各 `standard`，总时间盒取最大值 ≤ 10 分钟）——**R1**：分区 A（规划载体）**Reject**（1 blocker：归档块「**25** 个为 M1~M4 的交付 / 记录提交（逐条引用）」与事实不符——`657c02c`（M2 记录登记）全文 0 引用，属 Phase 12 R3 同类缺陷复发）/ 分区 B（规范与设计文档）**Reject**（1 blocker：`planning §7` 新增括注「三段式口径见 `ai-collaboration §8`」为**循环 / 不实引用**——该口径在两个规范载体内均无定义）/ 分区 C（治理记录与经验归档）**Pass**（0 blocker / 1 warning / 2 suggest）→ 合并取最严 **Reject**；修复：补引 `657c02c`、`planning §7` **就地定义**三段式并去除循环括注、`experience-archive` 落点清单补 `planning §7` 且「3 条落点已存在」→「**2 条**（余 22 条为新增 / 扩写）」、`testing §8` 新条与既有条款去重（交叉引用）、`release §3` 补 `npm version` 安全变体、`backlog` 的 `M4-1` 消歧为 `Phase 12 M4-1` → **R2**：分区 A **Pass**（0 blocker，逐 hash 复算 25/25 已引用）/ 分区 B **Pass**（0 blocker / 1 warning：`--no-commit` 非真实 npm 开关，已改为仅 `--no-git-tag-version`）。R2 后另补 2 处非阻塞收口（`release §3` 开关表述、`experience-archive` 条目箭头补 `planning §7`），记为「已修复未复审」。
- **已知观察（非缺陷，登记以免后续重复排查）**：① M4-1 记录 §3 / §4 与治理索引条目的「受检 211 md」为 **M4-1 交付时点**的快照，与当前 212（M3-2 / M3-3 记录入库后 +1）不同源，属时点差异而非「唯一口径」漂移（该记录 §2 的「唯一口径」仅指规模 4 文件 / +540 −1）；② `todo-archive.md` 行数超 `docs:check:line-count` 的 warn 阈值（warn>400 / error>600，**非阻断**）——归档载体只增不减，本批接受。
- **遗留与后续候选**：dependfix `apps/platform` 迁移实施（B0~B4）与 momei 侧迁移由对应仓库执行、本仓等待反馈；Phase 8 未启动（等待下游完成接入）；对比度遗留项与实底前景 token 配对复核；文档站多版本托管；组件总览页成员对账守卫；内置文案台账机检对账；测试并发时序 flaky（出现记录 ④）；其余候选见 [Backlog](./backlog.md)。

---

## Phase 14：质量与一致性收口

- 时间：2026-09-25 用户裁定 D1~D10 后登记 ~ 2026-09-27 完成并归档（5 条主线 / 14 条原子条目全部交付）
- 授权与范围（用户决策 2026-09-25，评估记录 D1~D10）：取向为「质量与治理收口 + 组件能力与长尾」；**不发布新版本**（D10）；**不改 token 色值**（D5 / D6 仅审计出清单）；不为凑数纳入零下游用量的组件能力（D9 只出判定表）；不改 Reka primitive；不启动 Phase 8；不做 dependfix / momei 侧迁移实施；不修改 `AGENTS.md`（受保护文件）。范围依据见[下一阶段范围评估](../design/governance/2026-09-25-next-stage-scope-evaluation.md) §10。

### M1 a11y 例外处置与受检面扩面（4 条）

- **M1-1 `CaomeiCalendar` 根容器 `aria-label` 落点修复**：补显式 `role="group"` 使可访问名合法。提交 `7a77bd5`。Review Gate Pass。
- **M1-2 `CaomeiMultiSelect` 关闭态空 `aria-controls`**：关闭态不输出空引用，开启态指向正确面板 id。提交 `f6f5341`。Review Gate Pass。
- **M1-3 `CaomeiStepper` 悬空 `aria-describedby`**：无 `CaomeiStepperDescription` 的步骤条件输出该属性。提交 `f95b715`。Review Gate Pass。
- **M1-4 受检面扩面（只纳入可稳定驱动者）**：逐项判定 12 个面板内导出与 DataTable 折叠分组 toggle 的可驱动性；全部纳入 axe 受检面。例外清单 3 → 1（仅剩 Toast 焦点哨兵，按 D2③ 维持现状）。提交 `2e75e53` / `eaff97c`。Review Gate Pass。
- **同批登记**：2 项同类悬空引用待后续处置（`CaomeiDropdownMenuGroup`/`RadioGroup` `aria-labelledby` 悬空、`CaomeiAccordion` 关闭态 `aria-controls=""`），见 [Backlog §1.6](./backlog.md)。
- 质量门：`pnpm test:a11y` 例外外零违规（54 passed，预算 48）；Chromium AX 树复验通过。
- 关键记录：[M1 交付与验证记录](../design/governance/2026-09-26-m1-a11y-exception-disposal-and-surface.md)

### M2 样式与 token 一致性收口（4 条）

- **M2-1 实底前景 token 配对复核（仅出清单）**：枚举 `-solid` 实底与自适应底的配对消费点，输出可复算清单（五档 `-solid` × `on-solid` 全一致、禁令零违反）。发现 2 项待裁定（switch 滑块前景配对、toast 强调色回退口径不一致），登记 [Backlog §1.1](./backlog.md)。**不改任何 token 色值**（D6②）。提交 `f64a63b`。Review Gate Pass。
- **M2-2 对比度遗留项盘点（仅登记）**：复核 6 项（既有 4 项 + `caomei` 预设 `primary-solid` 例外 + 站点侧 `text-muted` 观察），逐条复算并登记。在册缺口 5 项，流程缺口 1 项（capture 未随引用型属性改动复跑），均登记 [Backlog §1.6](./backlog.md)。**不改色**（D5①）。提交 `b4d0d0d`。Review Gate Pass。
- **M2-3 触发器 `disabled` 透传与包装层归一化**：date-picker / color-picker 向触发器透传 `disabled`；两个薄包装对 `false` / `undefined` 归一化对齐。`capture:styles` 239 项 0 差异。提交 `b4d0d0d` / `f0280a3`。Review Gate Pass。
- **M2-4 一致性机检（样式侧旧命名裸类 + `check-design` 解析健壮性）**：旧尺寸命名检测扩到样式选择器；`declarationsOf` 只把匹配属性名形态计为声明 + 非自定义属性名 `toLowerCase()` 比较。正反例语料 + 抗静默收窄 + 接入 `check:design`。提交 `f8598d7` / `144cfcf`。Review Gate Pass。
- 质量门：`pnpm verify` 全绿；`capture:styles` 239 项 0 差异。
- 关键记录：[M2 交付与验证记录](../design/governance/2026-09-26-m2-style-token-consistency.md)

### M3 测试稳定性与质量装置（2 条）

- **M3-1 flaky 根因定位与修复**：auto-complete / color-picker 并发隔离冲突根因定位并修复（`optionElements()`/`panel()` 改为基于 wrapper 定位、fake timers 加 try/finally、消除 `document.body` 全局查找）。连续 10 次全量测试零失败。提交 `37ef1aa`。Review Gate Pass（artifacts/review-gate/2026-09-27-phase14-m3-test-stability-quality.md）。
- **M3-2 Review Gate 证据留存装置**：`artifacts/review-gate/` 归档形态与索引（`scripts/governance/gen-review-gate-index.mjs` + `artifacts/review-gate/README.md`），可从记录 / 门禁引用。不引入浏览器依赖到 `verify`。提交 `37ef1aa`。Review Gate Pass。
- 质量门：`pnpm test` 连续多轮稳定；装置入库索引齐备。
- 关键记录：M3 交付与验证记录（`artifacts/review-gate/2026-09-27-phase14-m3-test-stability-quality.md`）

### M4 治理守卫精选（3 条）

- **M4-1 内置文案台账机检对账**：新增 `check-locale-ledger.mjs`，`docs/components/locale.md`（中英）索引表与 `src/locale/*` 实际键集合对账。正反例 + 抗静默收窄；接入 `governance:check`。同批修复台账存量与实现对齐。提交 `5f52ee4`。Review Gate Pass。
- **M4-2 组件总览页成员对账**：新增 `check-components-overview.mjs`，中文总览页分组顺序 + 成员 ↔ 侧栏/§11 对账；英文总览页「已翻译组件条目 ↔ 翻译文件集合 + 顺序」对账（不校分组结构，属 `STRUCTURE_EXEMPTIONS` 有意差异）。同批修复两侧缺 `CheckboxGroup`。提交 `5f52ee4`。Review Gate Pass。
- **M4-3 迁移口径一致性守卫**：新增 `check-migration-consistency.mjs`，迁移指南入口表 / 组件页迁移节 ↔ 设计规范 §7 对账。正反例 + 抗静默收窄；接入 `docs:check`。9 个组件页补充已知差异（有意）声明。提交 `5f52ee4`。Review Gate Pass。
- 质量门：`pnpm governance:check` / `pnpm docs:check` 全绿。
- 关键记录：M4 交付与验证记录（`artifacts/review-gate/2026-09-27-phase14-m4-governance-guards.md`）

### M5 组件能力与长尾判定（1 条）

- **M5-1 条件候选判定表**：T5 条件候选 6 项（DatePicker 范围选择、ColorPicker 色板导航、DataTable 滚动高度、Paginator 页码报表、Sidebar、ScrollPanel）+ `@iconify/vue` 逐条复核触发条件与依据。结论：5 项维持条件触发、2 项不补；零下游用量、均有替代方案、0.x 冻结窗口下不纳入实现。输出 `docs/design/governance/2026-09-27-m5-component-capability-longtail-judgment.md`。提交 `9da2fc5`。Review Gate Pass。
- 关键记录：[M5 判定表](../design/governance/2026-09-27-m5-component-capability-longtail-judgment.md)

### 阶段总结

- **提交对账**：`git log --oneline 85ca972~1..9da2fc5 | wc -l` → **15** 个提交（阶段边界 `9da2fc5`；**不得写 `HEAD` 相对范围**），其中 **14** 个为 M1~M5 的交付 / 记录提交（归档块逐条引用），另 1 个 `85ca972`（Phase 14 登记）为候选登记与阶段登记类、非交付物。
- **质量门**：`pnpm verify` exit 0（lint / lint:css / lint:md / typecheck / typecheck:docs / test **92 文件 1854 tests** / build / check:build / check:resolver / check:nuxt / docs:build / docs:check:i18n-routing / governance:check）；`test:a11y` 54 passed（预算 48）；`capture:styles` 239 项 0 差异；`docs:build` exit 0（0 TypeError）。
- **长期任务**：阶段收口前触发一轮门槛复核（[长期任务](./recurring.md) §3 第 14 轮，2026-09-27，零代码改动域；待执行批次 1 项、条件触发 1 项维持）。
- **回扫口径（三段式）**：① **机检面 0 处**——`pnpm check:governance-records` exit 0（本阶段记录无「链接文字含阶段 / 条目编号 → `docs/plan/todo.md`」的失效指针）。② **人工面 0 处**——无「载体名 + 条目编号」形态指针。③ **未处理面**——Phase 13 / Phase 12 历史记录同类指针沿用既有边界，本批不回改。**2026-09-28 更新（Phase 16 M3-3）**：同类指针已由 `check-governance-records` 扩展覆盖并按用户裁定「修历史指针、守卫零豁免」改指 `todo-archive.md`（共 18 处）；该边界关闭，见 [M3 治理装置与守卫记录](../design/governance/2026-09-28-m3-governance-guards.md)。
- **归档批次审计**：经 `@code-reviewer` Review Gate 审计（本批次）。
- **遗留与后续候选**：dependfix `apps/platform` 迁移实施（B0~B4）与 momei 侧迁移由对应仓库执行、本仓等待反馈；Phase 8 未启动（等待下游完成接入）；对比度遗留项与实底前景 token 配对复核（已登记 [Backlog §1.1/§1.6](./backlog.md)）；文档站多版本托管；a11y 同类悬空引用后续处置（已登记 [Backlog §1.6](./backlog.md)）；Toast 焦点哨兵与 `aria-hidden-focus` 规则冲突（上游有意模式，维持现状）；测试并发时序 flaky（出现记录 ④，已根治）；switch 滑块前景配对 / toast 强调色回退口径待裁定（已登记 [Backlog §1.1](./backlog.md)）；其余候选见 [Backlog](./backlog.md).

---

## Phase 15：治理收口深化 + 组件能力补齐 + 下游迁移护航文档

- 时间：2026-09-27 用户授权启动 ~ 2026-09-28 完成并归档（5 条主线 / 8 条原子条目全部交付）
- 授权与范围（用户决策 2026-09-27，评估记录 D1~D7）：取向为**「治理收口深化 + 组件能力补齐 + 下游迁移护航文档」**（Phase 8 维持未启动）；同步执行长期任务待执行批次「字段 shell 样式层共享」（D1：语义 token 契约按既定）；M2-2 CI 守卫取**阻断模式**并进入 `verify` 常驻链（D2）；Button 取**显式 `iconOnly` prop**（D3）；Select `#value` 插槽取**最小作用域** `{ option, label, selected }`（D4）；M5 对比度**仅记录不改色**（D5，延续 Phase 14 D5①）；M6 陷阱表**单一源头** + 组件页 `see` 引用（D6）；**不发布新版本**（D7，延续 Phase 14 D10）。范围依据见[下一阶段范围评估](../design/governance/2026-09-27-next-stage-scope-evaluation.md) §3 / §5。
- 非目标：新组件开发；启动 Phase 8；破坏性 API 变更；发布新版本；做 dependfix / momei 侧迁移实施（他仓执行）。

### M1 字段 shell 样式层共享（1 条）

- **M1-1**：抽离 `src/styles/field-shell.css`（`--caomei-field-*` 语义 token + `.caomei-field` 基类，覆盖边框 / 圆角 / 背景 / 色值 / 聚焦 / 非法 / 禁用 / 只读 / 尺寸档位），Input / Textarea / InputNumber / Select 4 个字段组件迁移至共享 shell、删约 190 行逐字重复声明（Password 经 Input 复用）；Select invalid 态聚焦改用 `:deep([role="combobox"])` + `:focus-within`；单测类名断言同步（`caomei-xxx--*` → `caomei-field--*`）。提交 `0dc4116` / `51ecae1`（状态同步）。**冻结新基线**：`capture:styles` 239 项 0 差异、`check:design` 预算归零。**token 计数口径**（归档实测）：`:root` 直接声明 **14** 个 `--caomei-field-*`，另有 **5** 个尺寸档位变量（`height` / `padding-inline` / `padding-block` / `padding-end` / `font-size`）由 `:where(.caomei-field--sm/md/lg)` 声明（`:root` 内为注释占位），去重共 **19**。
- 长期任务出处：「字段 shell 样式层共享」原为 [长期任务](./recurring.md) §2.2 待执行批次，本条目为其交付轮（形态 = 语义 token 契约、不改公共类名）。

### M2 引用型属性回归规则（2 条）

- **M2-1**：规则文档化——[开发规范 §13](../standards/development.md)（定义 / 核心规则 / 实现模式 / 回归守卫 / SSR 取舍）+ [AI 协作规范 §8](../standards/ai-collaboration.md)（同步摘要 + Review Gate 必查项 + 对审计方影响），两处交叉引用避免双源漂移。提交 `8ac8219`。
- **M2-2**：CI 守卫 `scripts/governance/guard-ref-attrs.mjs`——检测引用型 ARIA 属性 / 渲染契约类改动并**强制同批复跑 `capture:styles` 核对基线 diff**（阻断模式），接入 `governance:check`（随 `verify` 与 CI 生效）；无相关文件变更时跳过并打印口径。提交 `3a30b43`。

### M3 Button `iconOnly` 形态（1 条）

- **M3-1**：新增 `iconOnly` boolean prop（方形 `width = height`、`padding` / `gap` 归零、图标居中、`label` 自动绑定为 `aria-label`），`iconPosition` 在 `iconOnly` 时忽略并在 JSDoc 声明；单测新增 8 条（class 应用 / 尺寸方形 / `iconPosition` 忽略 / 无 `label` 不输出 `aria-label` / `label` 优先级 / 不渲染内容插槽）；中英组件页 + `icon-only.vue` 示例。提交 `d182da0`。

### M4 Select `#value` 插槽（1 条）

- **M4-1**：触发器补 `#value` 插槽（最小作用域 `{ option, label, selected }`，兼容既有 `#option` 并明确优先级），新增 `selectedOption` 计算属性复用选中项查找；单测新增 4 条（有值 / 无值 / 与 `#option` 组合 / 优先级）；中英组件页 + 示例。提交 `f3b6de1`；同批修复英文示例镜像缺失与示例类型错误 `f777d43`（并据此登记 Backlog 候选「文档站示例引用存在性守卫」，提交 `35abc4d`）。

### M5 对比度盘点（1 条）

- **M5-1**：5 项在册缺口逐条复算（WCAG 亮度公式 + soft 底 `color-mix` 合成），**无新增缺口、无修复消除**、**零 token 色值变更**，维持 [Backlog](./backlog.md)「对比度遗留项盘点」跟踪；复算输入与公式内联可复现。记录 [M5-1 对比度盘点](../design/governance/2026-09-28-m5-1-contrast-audit.md)。提交 `3c6f190`。

### M6 迁移陷阱文档补强（1 条）

- **M6-1**：`guide/primevue-migration.md`（中英）「常见陷阱」表新增 3 行（Button `iconOnly` 形态 / Select `#value` 插槽 / `iconOnly` 时 `iconPosition` 失效），对应组件页（Button / Select，中英）补迁移指引 `see` 引用；**单一源头**（陷阱表在指南、组件页只引用）不构成第二事实源。提交 `489a3e2`。

### M7 条件候选判定表（1 条）

- **M7-1**：switch 滑块前景配对**仅出判定表、不纳入实现**（参考 Phase 14 M5 口径）——**契约偏离成立**（自适应 `primary` 底族内 10 个消费点中 9 个以 `--caomei-color-primary-foreground` 承载底上内容，`switch.vue:100` 唯一取 `--caomei-color-bg`）；**库内无后果**（3 套主题 × 2 态 = 6 个快照中 5 个两值相同，仅 momei 预设暗色分离但 7.87:1 / 8.19:1 均达标）；**触发三要件经下游只读取证交集为空**（dependfix `5789b279` 有渲染无 token 覆盖、momei `be702836` 有分离但 0 处 `CaomeiSwitch`），故维持条件触发。记录 [M7-1 判定表](../design/governance/2026-09-28-m7-1-switch-thumb-foreground-judgment.md)。Review Gate R1 `quick` **Pass**（2 warning：`7/8` 应为 `6/8`、§3.1 枚举漏 `button` / `calendar`）→ 修复 → R2 `quick` **Pass**（0 blocker）。提交 `30ec7a0`。

### 附带交付（非阶段条目）

- GitHub Projects 看板约定：新增 [docs/standards/github-projects.md](../standards/github-projects.md)（看板结构 / 字段 / 视图 / 自动化 / Agent 读写边界）并引用至 `AGENTS.md` §11；提交 `04428ab`。
- Backlog 登记：文档站示例引用存在性守卫候选（来源 `f777d43`）；提交 `35abc4d`。

### 阶段总结

- **提交对账**：`git log --oneline 25c5de8..30ec7a0 | wc -l` → **13**（阶段下界 = 上一阶段归档提交 `25c5de8`；**不得写 `HEAD` 相对范围**，归档提交会推进 `HEAD`），其中 **11** 个为条目交付 / 记录提交（含 `35abc4d` Backlog 候选登记），另 2 个为 `c878aa6`（阶段授权与载体同步登记）与 `04428ab`（附带规范交付，非阶段条目）。
- **质量门**（归档批次实测，2026-09-28 终态口径）：`pnpm verify` exit 0（lint / lint:css / lint:md / typecheck / typecheck:docs / test **88 文件 1837 tests** / build / check:build / check:resolver / check:nuxt / docs:build / docs:check:i18n-routing / governance:check）；`test:a11y` **58**（受检面 51 单元 / 例外清单 1 条）；`capture:styles` **239 项 0 差异**；`docs:check` 10 段链全绿（integrity **262** md / links **261** md / structure 223 页 + 侧栏 6 组 47 条目 / config-links 160 条 / i18n-parity 59 对 / version / interpolation **223** md / showcase 13 项）；`governance:check` 含 `check-governance-records`（76 记录与索引一致 / 261 md 指针无失效）与 `guard-ref-attrs`（无相关变更时跳过）；`docs:build` exit 0。
- **长期任务**：阶段收口前触发一轮门槛复核（[长期任务](./recurring.md) §3 第 15 轮，2026-09-28，零代码改动域）——**待执行批次 0 项**（「字段 shell 样式层共享」经本阶段 M1-1 交付，已从 §2.2 待执行批次迁出）；条件触发 1 项与已判定不纳入 5 项维持。
- **回扫口径（三段式）**：① **机检面 0 处**——`pnpm check:governance-records` exit 0。② **人工面 4 处**——本阶段记录中「链接文字为载体名（`待办事项`）而编号写在链接之外」的指针 2 处，改指 `todo-archive.md`：`2026-09-28-m5-1-contrast-audit.md:120`（`待办事项` M5-1）、`2026-09-28-m7-1-switch-thumb-foreground-judgment.md:4`（`待办事项` M7-1）；**并一并处置 Phase 14 归档批次漏扫的同形态 2 处**（`2026-09-26-m1-a11y-exception-disposal-and-surface.md:4` / `2026-09-26-m2-style-token-consistency.md:4`，均改指 Phase 14 块）——Phase 14 归档块的「回扫口径」段声明「人工面 0 处」与该批复核实况不符，属**本批复核发现的「断言 ↔ 载体」不一致**（[规划规范 §9](../standards/planning.md) 要求复核旧记录时登记该类不一致），本批改指后该偏差关闭。③ **未处理面**——Phase 13 / 12 及更早记录的同类指针（`2026-09-18-m5-*` / `m6-*`、`2026-09-20-m2-2-m2-3-style-governance-landing.md`、`2026-09-20-css-on-demand-evaluation.md`、`2026-09-22-docs-versioning-reevaluation.md` 等）沿用既有边界（属「出证时点登记动作」的陈述，时效由各记录头部快照 / 让渡声明界定），**不回改、亦未登记为待办**；该形态的机检盲区已登记 [Backlog §1.6](./backlog.md)。**2026-09-28 更新（Phase 16 M3-3）**：该机检盲区已关闭——`check-governance-records` 扩展覆盖「载体名 + 闭合符后紧邻编号」形态，Phase 13 / 12 及更早的同类指针（共 18 处）已按用户 2026-09-28 裁定「修历史指针、守卫零豁免」一并改指 `todo-archive.md`，本段「未处理面」边界随之关闭；见 [M3 治理装置与守卫记录](../design/governance/2026-09-28-m3-governance-guards.md)。
- **wisdom 蒸馏**：活跃 **3 条全部迁移**（migrate 3 / compress 0 / remove 0 / keep 0），落点 [测试规范 §6](../standards/testing.md)（全量首跑 flaky 归属判定）与 [AI 协作规范 §3.1 / §9](../standards/ai-collaboration.md)（判定表类审计档位校准 / 跨载体计数同步后 `grep` 核对）；归档摘要 3 行见[经验归档](../design/governance/experience-archive.md)；`pnpm check:distill-archive` 对账通过。
- **归档批次审计**（2026-09-28，本阶段归档与规划清理批次）：经 `@code-reviewer` Review Gate **三分区并发审计**（§3.2；分区 A 规划载体 `standard` ≤10 分钟 / 分区 B 规范与 AI 资产 `deep` ≤20 分钟（§3.1 协议本体变更取严）/ 分区 C 治理记录与经验归档 `standard` ≤10 分钟；总时间盒取最大值）——**R1**：分区 A **Reject**（1 blocker：归档块质量门计数混源不自洽——`integrity` / `interpolation` 取 M7-1 入库前时点值而 `links` / `structure` 取终态值，且 `integrity == links` 违背历史恒定的 1 差；2 warning：`todo.md` 条件候选条目残留里程碑编号、`recurring.md` §2.2 内联枚举已交付批次名；1 suggest：M1-1 token 计数口径需注明）/ 分区 B **Pass**（0 blocker / 0 warning / 3 suggest；**独立裁定 §3.1 新增条目属协议本体变更、`deep` 申报正确**）/ 分区 C **Pass**（0 blocker / 0 warning / 2 suggest）→ 合并取最严 **Reject**；修复：计数改终态（`integrity 262` / `interpolation 223 md`）并加「终态口径」限定、`todo.md` 去里程碑编号、`recurring.md` §2.2 精简、M1-1 token 口径改为「`:root` 14 + 档位 5 = 去重 19」（该改法由复审建议给出，纠正了调用方把 `:root` 注释占位计入的误数）、**并入 Phase 14 漏扫的 2 处同类指针**（人工面 2 → 4 处）、B/C 的 4 条 suggest 同批采纳（词边界 / §6.1 子标题 / 界定语 / 机检盲区登记 Backlog）→ **R2**（`deep`，修复点复审）**Pass**（blocker 关闭、8 个修复点全部落地、0 新增阻断；2 条非阻塞 suggest 已同批采纳，记为「已修复未复审」）。
- **已知观察（非缺陷，登记以免后续重复排查）**：① `todo-archive.md` 行数超 `docs:check:line-count` 的 warn 阈值（warn > 400 / error > 600，**非阻断**）——归档载体只增不减，本批接受。② 全量测试首跑出现 **1 例 flaky**：`scripts/release/generate-changelog.test.mjs > readPackageField`（git fixture 子进程在 88 文件并行负载下 5s 超时），隔离重跑 816ms 通过、二次全量 1837 例全通过——属 Phase 14 已根治的并发隔离族之外的**独立面**，按「多次出现再处理」登记为**该文件首次出现**（后续复现再升级为条目）。③ M1-1 ~ M6-1 的 Review Gate 记录未见于 `artifacts/review-gate/`（该目录为 gitignored 的本地留存，本批之前无 Phase 15 条目）；归档按**提交与验收声明**登记，**不宣称其审查结论**。④ `docs:check:integrity` 对 `todo.md` 产生 1 条「H1/H2 结构标题由 4 降为 3」告警——脚本自带说明「阶段 / 条目标题在 H3/H4，属归档正常移除面」，属归档预期（非阻断）。
- **遗留与后续候选**：dependfix `apps/platform` 迁移实施（B0~B4）与 momei 侧迁移由对应仓库执行、本仓等待反馈；Phase 8 未启动（等待下游完成接入）；对比度在册缺口 5 项（已登记 [Backlog §1.6](./backlog.md)）；条件触发候选（M5 判定表 5 项 + M7-1 switch 滑块前景配对）；a11y 同类悬空引用后续处置；文档站多版本托管；其余候选见 [Backlog](./backlog.md)。

---

## Phase 16：质量收口与治理装置落地

- 时间：2026-09-28 用户裁定 D1~D13 后登记 ~ 2026-09-29 完成并归档（5 条主线 / 17 条原子条目全部交付，含 **0.4.0** 发布）
- 授权与范围（用户决策 2026-09-28，见[评估记录 §8](../design/governance/2026-09-28-next-stage-scope-evaluation.md)）：取向为**质量收口优先**（用户取组合 B）；逐条裁定 D1~D13——只修**非预设** 2 项对比度缺口（D2）、toast 与 switch **统一**（D3）、`Avatar` **维持 token 口径**（D4）、分页对齐 token **补**（D5）、`artifacts` **维持本地 + 修 README**（D6）、Review Gate 落盘取**阻断**（D7）、发布 0.4.0 **视情况决定**（D8，2026-09-29 落定为发布）、国际化 / RTL **不上收**（D9）、`.session` **维持现状**（D10）、flaky **只处理重复出现**（D11）、**授权**改 `AGENTS.md` §11（D12）、Phase 8 **暂不启动**（D13）。
- 执行期变更：M3-7 为用户 2026-09-28 追加授权（14 → 15 条）；M5 为用户 2026-09-29 决策追加（15 → 17 条）。
- 非目标：不启动 Phase 8；不上收国际化 / RTL；不为**首次出现**的 flaky 立专项；不加 `.session` 新守卫；不做 M1 其余候选（`Select` 字段层 `class` 文档、`Select` `null` 开发期告警）与 a11y 同类悬空引用；不做破坏性 API 变更；不修 Button `iconOnly` 示例形态（登记 Backlog 后再决策）。

### M1 下游反馈处置（2 条）

- **M1-1**：`DataTable` 分页对齐 token——`.caomei-data-table__pagination` 由字面量 `flex-end` 改为 `var(--caomei-data-table-pagination-justify, flex-end)`（缺省零漂移），中英组件页登记该 token 与分页节说明。提交 `b19f077`。
- **M1-2**：`Avatar` 档位口径文档补强——**维持** `sm` / `md` / `lg`、**不补** `xl`（源码未改），中英组件页补 PrimeVue 档位差异映射（`normal` 32px ↔ `md`；`large` 48px / `xlarge` 64px 走 token 覆盖）+ `--caomei-avatar-size` 覆盖口径。提交 `5d9e409`。
- 验证：`capture:styles` 239 项 0 差异；真实浏览器 20/20；记录提交 `b43bbe5`（[M1 交付记录](../design/governance/2026-09-28-m1-downstream-feedback-disposal.md)，并修复遗留死链）。

### M2 对比度与配色口径收口（4 条）

- **M2-1**：soft primary 亮色变体修复——`tag` / `message` / `badge` 的 `--soft` 底公式 `color-mix(tone 12%, transparent)` → **8%**，primary 亮色 **4.37 → 4.65:1**（≥4.5），其余 tone / 预设只升不降。提交 `661b67d`。
- **M2-2**：toast 中性强调描边（暗色）修复——`border-left` 回退 `neutral-solid` → `--caomei-color-text-muted`，暗色 **2.31 → 6.98:1**（≥3）。提交 `728a03d`。
- **M2-3**：回退口径与配对统一——toast 图标补同一回退（描边 / 图标同色）；switch 滑块回退改 `--caomei-color-primary-foreground`（默认 / caomei 零漂移，momei 暗 7.87 → 8.19:1），中英组件页 token 表同步。提交 `8fc5cda`。
- **M2-4**：4 项库内缺口逐条裁定（2 修 2 维持）+ 恢复 `backlog.md` §1.6 载体行 + 设计规范 §3.2 改写 + M7-1 记录更新注记。提交 `146286a`。
- 验证：`capture:styles` 15 处差异**逐项有据**（全为 soft 底 alpha 0.12→0.08，无其它项）→ 重冻结基线 → 复跑 0 差异；记录 [M2 交付记录](../design/governance/2026-09-28-m2-contrast-and-pairing.md)。

### M3 治理装置留痕与守卫补口（7 条）

- **M3-1**：`artifacts/review-gate/README.md` 口径修正（**本地态、不入库**）——删除「不受 `.gitignore` 排除」不实表述，显式声明本地留存 + 跨机器获取方式。
- **M3-2**：Review Gate 落盘**阻断**守卫——新增 `check-review-gate-artifacts.mjs`（受检范围取暂存文件，要求存在 mtime 不早于范围最新文件的工件；CI / 缺目录 / 空范围跳过），接入 `pre-commit`、**不接入** `verify`；正反例 + 仓库级负向对照。提交 `ca7acea`。
- **M3-3**：治理记录指针机检盲区扩展——`check-governance-records` 覆盖「载体名 + 闭合符后紧邻编号」形态；按用户裁定「修历史指针、守卫零豁免」把 Phase 9~14 的 **18 处**同类指针改指 `todo-archive.md`，并同步三个归档块口径。提交 `d60a867`。
- **M3-4**：文档站示例引用存在性守卫——新增 `check-example-refs.mjs`（`<demo vue>` 目标存在性；围栏 / 行内代码豁免；含受检面收窄断言），接入 `docs:check`（10 → 11 段）。提交 `cf19133`。
- **M3-5**：`AGENTS.md` §11 补长期任务台账 `recurring.md` 指针（D12 授权）。提交 `dd3ebea`。
- **M3-6**：`docs/examples/input/basic.vue`（中英）补 `label` / `aria-label`。提交 `6e47ec0`。
- **M3-7**：`docs:check:links` 补**站点范围外链接**检查（用户追加授权）——`docs/` 下相对链接解析到站点 `srcDir` 之外即失败并提示改用行内代码；含负向对照与受检面下界。提交 `8b24074`。
- 记录：[M3 交付记录](../design/governance/2026-09-28-m3-governance-guards.md)（提交 `1af9571`）与 [M3-7 记录](../design/governance/2026-09-28-m3-7-cross-root-link-guard.md)。

### M4 测试稳定性与常驻回归补齐（2 条）

- **M4-1**：常驻 E2E 规格 follow-up——新增 `test/e2e/focus-and-motion.e2e.ts`（5 用例 × 3 视口 = **15 tests**）：日历日格焦点环包络、动画非零与 `reduce` 压平双向覆盖；口径澄清「滚动容器 / 键盘聚焦」已在 `responsive.e2e.ts` 覆盖。提交 `b9ee379`。
- **M4-2**：组件画廊浏览器回归——新增 `playwright.gallery.config.ts`（`docs:build` + preview）+ `test/e2e/gallery.e2e.ts`（4 用例 × 中英 = **8 tests**）：登记项真实渲染 + 根类名、四档溢出 0、卡片链接 locale 前缀 + HTTP 200、Dialog Portal 落位；主配置 `testIgnore` 排除。提交 `090c488`。
- 验证：`pnpm test:e2e` × 3 = 每次 69 passed；`test:e2e:gallery` × 3 = 每次 8 passed；记录提交 `b1da270`（[M4 交付记录](../design/governance/2026-09-28-m4-test-regression.md)）。

### M5 发布交付（2 条）

- **M5-1**：`caumei` 选择器拼写缺陷修复——`button.vue` 2 处 + `select.vue` 2 处（均由 `v0.3.0..b1da270` 窗口引入），三档实测 28 / 36 / 44px 方形、`padding` / `gap` 归零、非法态聚焦改回危险色；`capture:styles` 采样面 239 → **245**，负向对照 A（按钮）12 处 / B（Select）2 处。提交 `dbfb7ca`；记录见[治理索引条目](../design/governance/index.md)（`2026-09-29-caumei-selector-typo-fix-and-release-registration.md`）。
- **M5-2**：0.4.0 版本交付——`package.json` bump（`701d4c0`）、`pnpm changelog`（`c8a6eca`）、annotated tag `v0.4.0` → `c8a6eca`、`npm publish`（用户本地执行）；发布条目登记 + 0.4.0 发布前门槛复核（第 16 轮）提交 `a06cbfa`。发布后校验与文档同步见[发布记录](../design/governance/2026-09-29-phase16-m5-2-release.md)。

### 附带交付（非阶段条目）

- 用户报告的 Textarea 字段高度回归修复（`658bca2`）+ 字段外壳高度契约守卫与字段族溢出扫描（`67f79c5`：新增 `field-overflow.e2e.ts` 24 项与 `field-shell.test.ts` 9 项）——非阶段条目，未进 `todo.md` / `backlog.md`。
- 文档站图标按钮示例 SFC 结构修复 + 示例形态守卫（`f31ee34`，`check-example-refs` 扩「根 template 成对且不含 style/script」形态校验，14 → 23 tests）。
- 规划登记（用户 2026-09-29 口径与三项候选）：`f502137` / `ae38b28`（回归目标分层入测试规范 §2.1；富文本 / 图表拆行外购建议；「极简可用样式未落为具名预设」与「组件设计一致性回归扩展」两项裁定登记 Backlog）。
- Review Gate 落盘守卫发布元数据豁免（发布执行期暴露的误拦截修复）：`e128aa6`（版本号清单文件豁免）与 `d07fd8c`（`CHANGELOG.md` 生成制品豁免）——豁免判定取「范围 == 全量暂存集且状态全 `M`」；清单文件 diff 须全为 `version` 字段行，生成制品只受范围纯净性约束；两批各 2 轮 Review Gate Pass（R1 的判定不变量缺口已在 R2 关闭）。

### 阶段总结

- **提交对账**：`git log --oneline 6ce5f92..c8a6eca | wc -l` → **30**（下界 = 上一阶段归档提交 `6ce5f92`，上界 = 0.4.0 CHANGELOG 提交 `c8a6eca`；**不得写 `HEAD` 相对范围**，归档提交会推进 `HEAD`）。构成：阶段登记与范围评估 **2**（`f8b3a78` / `444f4fa`）、M1 **3**、M2 **4**、M3 **7**、M4 **3**、M5 **2**（`dbfb7ca` / `a06cbfa`）、用户报告的非阶段修复与规划登记 **5**（`658bca2` / `67f79c5` / `f31ee34` / `f502137` / `ae38b28`）、守卫豁免修复 **2**（`e128aa6` / `d07fd8c`）、0.4.0 发布 **2**（`701d4c0` / `c8a6eca`）。
- **质量门**（归档批次实测，2026-09-29 终态口径）：`pnpm verify` **exit 0**（lint / lint:css / lint:md / typecheck / typecheck:docs / test **92 文件 1921 tests** / build / check:build（8 exports 产物齐全）/ check:resolver / check:nuxt / docs:build / docs:check:i18n-routing / governance:check 全绿）；`test:a11y` **58**（受检面 51 单元 / 例外清单 1 条）；`capture:styles` **245 项 0 差异**；`docs:check` **11 段**链全绿（integrity **270** md / links **270** md（提交前工作区口径，计数说明见[发布记录](../design/governance/2026-09-29-phase16-m5-2-release.md) §5） / structure 232 页 + 侧栏 6 组 47 条目 / config-links 160 条（nav 12 / sidebar 148）/ i18n-parity 59 对 / version 0.4.0（5 个展示面均派生自 `package.json`）/ interpolation **231** md / example-refs 232 md·378 引用·359 示例 / showcase 13 项 / line-count（`todo-archive.md` 594 行仅 warn）/ i18n）；`check:governance-records` **85 记录与索引一致 / 270 md 指针无失效**；`check:design` 通过（规则 795 / 下界 600、声明 2669 / 下界 2500）；`docs:build` exit 0。
- **长期任务**：阶段收口前触发一轮门槛复核（[长期任务](./recurring.md) §3 **第 17 轮**，2026-09-29，零代码改动域）——待执行批次 **0 项**（两组任务均无）；条件触发 1 项与已判定不纳入 5 项维持。
- **回扫口径（三段式）**：① **机检面 0 处**——`pnpm check:governance-records` exit 0（85 记录与索引一致 / 270 md 指针无失效）；归档清空 `todo.md` 后新暴露的 1 处失效指针（`2026-09-20-m2-2-m2-3-style-governance-landing.md:5`：链接文字含 `M2-2` 而目标 `docs/plan/todo.md` 已无该标识）已**同批改指** `todo-archive.md`。② **人工面 0 处**——本阶段新增的 2 份记录（M5-2 发布记录与[治理索引](../design/governance/index.md)）及本归档块均无「载体名 + 链接外编号」形态指针；对既有散文指针（`2026-09-20-m1-1-build-path-poc.md` / `2026-09-21-next-stage-scope-evaluation.md` 等）的复核结论归入未处理面。③ **未处理面**——更早历史记录中指向 `docs/plan/todo.md` 的散文指针（链接文字为「待办事项」、编号写在链接之外）沿用既有边界，属登记动作的时点陈述（时效由各记录头部快照 / 让渡声明界定），**本批不回改、亦未登记为待办**；其机检盲区形态已于 Phase 16 M3-3 关闭（`check-governance-records` 现覆盖「载体名 + 闭合符后紧邻编号」形态），本段保留的仅为跨分隔符的散文形态。
- **wisdom 蒸馏**：活跃 **16** 条，**未达阈值（>= 20）**，本轮**不执行蒸馏**（[规划规范 §7](../standards/planning.md)）；条目留存 `.session/wisdom.md` 供后续蒸馏（`pnpm check:distill-archive` 归档段对账 10 段维持通过）。
- **归档批次审计**（本阶段归档与规划清理批次）：经 `@code-reviewer` **第 1 轮两分区并发审计**（§3.2；分区 A 规划载体 `standard` ≤10 分钟 / 分区 B 治理记录·索引·对外文档 `standard` ≤10 分钟；总时间盒取最大值）——**R1**：分区 A **Reject**（1 blocker：`todo.md` 归档后仍保留 Phase 16 交付摘要与具体归档指针，违 [规划规范 §7](../standards/planning.md)；2 warning：条件候选重新写入里程碑编号（Phase 15 归档批次同型 warning 复发）、`roadmap.md` Phase 16 行「非目标」仍写「不执行 CHANGELOG 生成与 `pnpm release`（执行待用户指令）」与同行「已发布」矛盾；1 suggest：`integrity == links` 未说明历史 1 差不变式）/ 分区 B **Pass**（0 blocker / 0 warning / 3 suggest：快照句自指矛盾、「与发布日志逐字符一致」以未入库日志为证据源、未声明推送状态）→ 合并取最严 **Reject** → 修复：`todo.md` 重写为 Phase 15 归档模板口径（仅「当前无进行中阶段」+ 通用衔接句）、条件候选去编号并**在 [规划规范 §7](../standards/planning.md) 补「归档后 `todo.md` 不得残留里程碑编号与交付摘要」为 Review Gate 必查项（约束载体，覆盖 `M\d+-\d+` 形态）**、`roadmap.md` 非目标改写为「0.4.0 系用户决策授权后本地手动发布」、发布记录采纳 3 条 suggest（快照措辞 / registry 为权威来源 / 补推送状态）→ **R2**（`standard`，只审修复点）**Pass**（0 blocker / 0 warning / 2 suggest；R2 新提的 2 条——索引摘要同缺陷表述、`integrity/links` 为提交前工作区口径——**已同批采纳，记为「已修复未复审」**）。
- **实测用时（调用方回填）**：R1 发起 `2026-09-29T21:55:09+08:00`，未在返回时点单独取戳（口径偏差），以修复完成 / R2 发起 `22:03:17` 为上界 → **≤ 8 分 08 秒**（含调用方阅读 / 决策与修复），未超 10 分钟；R2 发起 `22:03:17` → 处理完成取戳 `22:10:03`（上界，含 2 条 suggest 采纳与门禁复跑）→ **≤ 6 分 46 秒**，未超 10 分钟。
- **已知观察（非缺陷，登记以免后续重复排查）**：① `todo-archive.md` 达 **594** 行，触发 `docs:check:line-count` 的 warn（>400）但未达 error（>600）——归档载体只增不减，本批接受。② `docs:check:integrity` 对 `todo.md` 产生 1 条「H1/H2 结构标题由 4 降为 3」告警，脚本自带说明「阶段 / 条目标题在 H3/H4，属归档正常移除面」，属归档预期（非阻断）。③ 本阶段用户报告的 Textarea 高度回归、示例 SFC 形态、Review Gate 守卫豁免三批均为**非阶段条目**，未进 `todo.md` / `backlog.md`，留痕在 `.session/current-task.yaml` 与提交历史。
- **遗留与后续候选**：Phase 8 未启动（用户 2026-09-28 裁定 D13，等下游迁移完成后再评估）；dependfix `apps/platform` 迁移实施（M31）与 momei 侧迁移由对应仓库执行、本仓等待反馈；对比度在册缺口；Backlog 在册含「极简可用样式未落为具名预设」「组件设计一致性回归扩展」（均为 2026-09-29 已裁定、实施时机待阶段纳入）、`caumei` 类名前缀拼写机检守卫、文档内取证命令 revision 钉定守卫、Button `iconOnly` 示例形态待决策等；其余候选见 [Backlog](./backlog.md)。

---

## Phase 17：极简主题预设与富文本封装 + 治理补口

- 时间：2026-09-30（用户授权启动；同日交付 3 条主线 / 8 条原子条目，同日完成阶段归档）
- 范围与授权（用户决策 2026-09-30）：方向「处理极简模式、富文本封装 + 一些治理」，其余决策项按**保守默认自决**；范围依据 [下一阶段范围评估](../design/governance/2026-09-30-next-stage-scope-evaluation.md) §8。**执行期插入例外**：同日用户缺陷报告（模态内浮层被遮挡）按[规划规范 §3.5](../standards/planning.md) 插队例外第 3 类登记为 M3 主线，阶段内条目由 6 增至 8。
- 非目标：不引入 Tailwind / UnoCSS；不做破坏性 API 变更；不做组件设计一致性回归扩展、对比度修色、Phase 8、国际化 / RTL、`iconOnly` 示例形态、下游 0.4.0 升级护航、计算样式采样面扩展；不预登记发布条目。

### M1 极简主题预设与富文本封装（3 条）

- **M1-1 极简具名预设 `minimal`**：`theme.css` 首规则改为 `:root, [data-preset='minimal']`（**同一规则**、token 只声明一次），未指定 `data-preset` 时即极简；预设切换器与全部 claim 载体同步。`capture:styles` 245 项 0 差异。提交 `50c1f0e`（状态同步 `c37876a`）。
- **M1-2 富文本封装形态与依赖选型评估**（纯评估、不改 `src/**`）：多源核对后取 `md-editor-v3@7.1.0`（MIT / peer `vue ^3.5.3` / SSR / `theme` / 内置 `zh-CN`·`en-US`）；联动方案 = 宿主暗色 → `theme`、本库 locale → `language`（`ja-JP → jp-JP`）；识别出前置缺口——本库无「读取 locale 代码」入口。提交 `7a7a1ff`（状态同步 `e2f2793`）。
- **M1-3 富文本轻量封装实现与文档**：前置补 `useLocaleCode()` / `caomeiLocaleCodeKey`（零破坏性）；新增 `CaomeiRichTextEditor`（`md-editor-v3` **可选 peer** + `@vavt/cm-extension` 常规依赖），暗色经 DOM 观察驱动内核 `theme`、语言经 locale 映射并运行期联动（含请求序号守卫）；交付面齐备（根导出 / Nuxt / locale `richTextEditor`（27 命名空间 78 条 × 5）/ 中英组件页与示例 / 画廊 / 侧栏 / 总览 / 迁移映射 / 许可声明）。**V 阶段（真实 Chromium）**：站点暗色开关驱动编辑器 `data-theme` 与计算色值（亮 `rgb(255,255,255)` ↔ 暗 `rgb(0,0,0)`）、5 语种文案两两可区分、`ja-JP` 走 `jp-JP`、运行期切换不重挂载；发现并闭合**窄屏页级横向溢出**（根类补 `min-width: 0` + 声明级契约守卫，390 视口页宽 1034 → 390）。**Review Gate**：R1 `standard` `Reject`（blocker：`roadmap` 计数漂移；warning：扩展包作为可选 peer 时在消费方构建期不可解析）→ 修复 → R2 `standard` `Pass`。提交 `0d5eb2f` / `46b8f12` / `023e30c` / `29c4076` / `4701498` / `fd2ff40`（提交号回填 `9bc7909`）。

### M2 治理装置补口与消缺（3 条）

- **M2-1 `check:class-prefix`**：`src/**` 样式区类名令牌前缀拼写守卫（T1 违规 / T2 允许名单反向校验 / T3 受检面下界 / T4 **哨兵文件身份断言**）；误报边界逐条论证（`:deep()` / 第三方类名须登记豁免；「样式令牌须在模板出现」的反向校验**实测 303 处误报**故不实施；注释 / 字符串 / `url(//…)` / SCSS `//` 已剥离）；接入 `governance:check` 阻断（零例外）。实测 90 文件 / 81 样式区 / 914 次令牌、非 `caomei-` 前缀 0。
- **M2-2 `check-docs-git-revision`**：`docs/**` 代码区**逐行**（围栏 + 行内、不跨行）的取证命令 revision 钉定守卫——只约束 revision 位置（须持久 ref、禁 `HEAD`，覆盖引号内 / reflog / 半开区间隐含 HEAD）；index/worktree 作用域与取值型 flag 的引号参数不计；命令替换 fail-closed；豁免 2 条受反向校验；顺带把 2026-09-16 记录 2 处以 `HEAD` 作 revision 的取证命令改钉其自述基点 `d4e4725`（语义等价）。
- **M2-3 版本策略页正文口径同步与弱守卫**：中英 version-policy 冻结窗口起点句由「即 0.3.x 系列」改为**版本无关表述**（消除手写系列号）；`check-site-version` 扩规则 6（版本策略页系列字面量）与规则 7（「当前版本」句 = `package.json`，README 中 2 / 英 1 + `roadmap §1` 三面统一窄锚策略，不设规划载体特例）。
- **Review Gate**：R1 M2-1 `Pass`（0/4/4）、M2-2 `Pass`（0/6/5）、**M2-3 `Reject`**（blocker：roadmap 弱守卫结论无载体且论证与 README 双标）→ 修复 → R2 三题 `Pass`（并判出 3 条**修复自身引入的回归**）→ R3 `quick`（10 分 51 秒）`Pass`（3 条回归全闭合）。提交 `0378fd4` / `1c26cd3` / `bca8db8` / `2400db4`（提交号回填 `2b2b129`）。

### M3 浮层档位契约修复与门禁（用户缺陷报告插入批次，2 条）

- **M3-1 模态内浮层被遮挡修复与常驻 E2E 装置**：四类面板（Select / MultiSelect / AutoComplete / ColorPicker）档位统一取 `--caomei-z-dropdown` 并补齐 `--caomei-<comp>-z-index` 覆盖钩子（`ColorPicker` 的 `inline` 形态以 `:not()` 排除）；新增 `test/e2e/overlay-stacking.e2e.ts`（2 用例 × 三档视口，覆盖 7 个 portal 浮层组件）。提交 `79e4ef9`。
- **M3-2 同类排查与声明层门禁**：新增 `check:overlay-z-index`（T1~T9，含未识别形态 fail-closed 与允许名单反向校验）接入 `governance:check`，五处 CLI 负向验证均 exit 1。提交 `17ff31f`。规范落点 `design-spec §2.5` / `development.md §7` 同步（`4fffecc`）；登记与条目回扫约束（`bb57703` / `2f8dc00`）。

### 附带交付（非阶段条目）

- **wisdom 蒸馏补做**（Phase 16 遗留）：`d4fce78`——活跃 20 条全部迁移至规范载体 + 经验归档（migrate 20 / compress 0 / remove 0 / keep 0）。
- **阶段登记与范围评估**：`f3f3a71`（[下一阶段范围评估](../design/governance/2026-09-30-next-stage-scope-evaluation.md)）/ `d95f290`（Phase 17 登记，2 主线 / 6 条目；其后执行期追加 M3 至 3 主线 / 8 条目）。

### 阶段总结

- **提交对账**：`git log --oneline e23b70e..2b2b129 | wc -l` → **24**（下界 = 上一阶段归档提交 `e23b70e`，上界 = 本阶段末条实现 / 记录提交 `2b2b129`；**不得写 `HEAD` 相对范围**，归档提交会推进 `HEAD`）。构成：阶段登记与范围评估 **2**（`f3f3a71` / `d95f290`）、wisdom 蒸馏补做 **1**（`d4fce78`）、M1 **11**（`50c1f0e` / `c37876a` / `7a7a1ff` / `e2f2793` / `0d5eb2f` / `46b8f12` / `023e30c` / `29c4076` / `4701498` / `fd2ff40` / `9bc7909`）、M2 **5**（`0378fd4` / `1c26cd3` / `bca8db8` / `2400db4` / `2b2b129`）、M3 **5**（`79e4ef9` / `17ff31f` / `4fffecc` / `bb57703` / `2f8dc00`）。**归档批次自身提交不计入上式**。
- **质量门**（归档批次实测，2026-09-30 终态口径）：`pnpm verify` **exit 0**（lint / lint:css / lint:md / typecheck / typecheck:docs / test **102 文件 2124 tests** / build / check:build（8 exports 产物齐全）/ check:resolver / check:nuxt / docs:build / docs:check:i18n-routing / governance:check 全绿）；`test:a11y` **59**（受检面 52 单元）；`capture:styles` **245 项 0 差异**；`docs:check` **11 段**链全绿（integrity / links / structure / config-links / i18n-parity / version（规则 1~7）/ interpolation / example-refs / showcase 14 项 / line-count（主窗口压缩后回落至 warn 下界以下——本批终态数值与复算命令见[归档批次记录](../design/governance/2026-09-30-phase17-archive.md) §8）/ i18n）；`check:governance-records`（**91** 记录与索引一致——时点口径，随记录增删变化）；`check:design` 通过；两新增装置零违规（复算命令见 `scripts/governance/` 同名脚本；本批终态数值见批次记录 §8）。
- **长期任务**：阶段收口前触发一轮门槛复核（[长期任务](./recurring.md) §3 **第 18 轮**，2026-09-30，零代码改动域）——待执行批次 **0 项**；条件触发 **1 项维持**；已判定不纳入 5 项维持；**计数漂移归因**：`labelAttrs` 9→10、含内联同名字段 31→32（均由 M1-3 的 `rich-text-editor` 引入，该组件为独立包装组件、不继承共享字段契约，条件触发候选结论不变）。
- **回扫口径（三段式）**：① **机检面**——归档清空 `todo.md` 后 `pnpm check:governance-records` 先报 **6 处** `stale-planning-pointer`（4 处 `M6-8` 记录 → 改指深度归档 `../../plan/archive/phase-07-12.md`；2 处 Phase 17 条目记录 → 改指 `../../plan/todo-archive.md`），**已同批改指**；改指后复跑 **exit 0**（**91** 记录与索引一致 / **281** md 指针无失效）。② **人工面**——枚举指向 `docs/plan/todo.md` 的链接（含「链接文字为载体名、编号写在链接之外」的散文形态与 `todo.md` 直称形态）：`rg -o "\[[^]]*\]\((\.\./)*plan/todo\.md\)" docs -g '*.md' | wc -l` → **62 处** / `rg -l` → **24 文件**（早期草稿按更宽口径记为 26 文件 / 60 处，已按此命令订正）；逐条判定为**登记动作的时点陈述**，本批不改。本阶段新增载体（4 份治理记录 + 深度归档 3 文件 + 本归档块）逐条核对「载体名 + 链接外编号」形态，无失效指针。③ **未处理面**——更早历史记录中指向 `docs/plan/todo.md` 的散文指针（链接文字为载体名、编号写在链接之外）沿用既有边界，属登记动作的时点陈述，**本批不回改、亦未登记为待办**；深度归档文件内的同类指针随迁入一并保留（内容不改写，仅链接深度调整）。
- **wisdom 蒸馏**：活跃 **2** 条（`pnpm distill:wisdom --check` → `WISDOM_OK: 2 active entries (threshold 20)`），**未达阈值（>= 20）**，本轮**不执行蒸馏**（[规划规范 §7](../standards/planning.md)）；条目留存 `.session/wisdom.md` 供后续蒸馏（`pnpm check:distill-archive` 归档段对账维持通过）。
- **归档批次审计**：经 `@code-reviewer` Review Gate **单分区 `standard`**（归档批次以规划载体为主、无运行时面，故不分区）——结论见本块末「归档批次 Review Gate」段。
- **已知观察**：① 归档载体**首次压缩**（Phase 0 ~ Phase 12 → 深度归档），主窗口由 594 行回落，解除 warn 的持续累积——压缩为**机械迁移**（链接深度 `../` → `../../`），正文不改写；② `docs:check:integrity` 对 `todo.md` 产生「H1/H2 结构标题减少」告警，脚本自带说明「阶段 / 条目标题在 H3/H4，属归档正常移除面」，属预期非阻断；③ 本阶段的两条非阶段交付（wisdom 蒸馏补做、范围评估与登记）未进 `todo.md` / `backlog.md`，留痕于本归档块与提交历史。
- **遗留与后续候选**：**0.4.0（`latest`）仍含模态内浮层被遮挡的缺陷（本阶段已修复、尚未发布）**，下游需 **0.4.1 及以后**版本才获得修复（发布条目按阶段非目标未预登记，触发时机由用户决定）；Phase 8 未启动（用户 2026-09-28 裁定 D13）；dependfix `apps/platform` 与 momei 侧迁移由对应仓库执行、本仓等待反馈；Backlog 在册含 `iconOnly` 示例形态（待调研）、计算样式采样面扩展、下游 0.4.0 升级护航、组件设计一致性回归扩展（已裁定、待阶段纳入）、富文本编辑器窄屏真实几何回归候选、两例并行负载 flaky（`data-table.test.ts:229` / `dropdown-menu.test.ts:429`）、治理索引与记录计数对账守卫（评估高误报、未实施）、浮层档位装置判别力补强、M2 两守卫的已知边界等；其余见 [Backlog](./backlog.md)。

### 归档批次 Review Gate

经 `@code-reviewer` Review Gate **单分区 `standard`**（归档批次以规划载体为主、无运行时面，故不分区）：R1 `Reject`（归档块质量门把非终态计数标为「终态口径」）→ 修复 → R2 `Reject`（新增审计段后行数未同步，**同类复发**）→ 修复（改为不在归档块复写易变计数）→ R3 `Reject`（该「单点来源」自身未承接数值）→ 修复（计数单点下沉至[归档批次记录](../design/governance/2026-09-30-phase17-archive.md) §8 并附复算命令与时点口径）→ R4 `quick`（机械面复核）结论见该记录 §10。逐轮 findings 与逐条处置亦见该记录 §10。

---

## Phase 18：发布收口、测试稳定性与一致性治理

- 时间：2026-09-30 用户逐条裁定 D1 ~ D13 后登记；2026-10-01 交付 5 条主线 / 12 条原子条目并完成阶段归档（用户指令「开始归档」）。
- 范围与授权（用户决策 2026-09-30，D1~D13）：**D1** 取 **M1 + M2 + M3 + M4 + M6**（**M5 下游升级护航与 Phase 8 不纳入**）；**D2** 先做文档同步、**推送继续等待**；**D3** flaky 类取「断言等待稳定 + `maxWorkers` 兜底」；**D4** 质量装置四条**全取**；**D5** 设计一致性**只出评估**；**D6** `iconOnly` 示例形态**继续登记待调研**；**D7** 对比度 6 项**收口为终局结论**（不改色值）；**D8** 下游升级护航**不纳入**（口径随 M6 修正）；**D9** Phase 8 **继续等待不启动**；**D10** 台账漂移**修 3 项 + 回扫**；**D11** 组件增强与长尾**全部维持条件触发**；**D12** 国际化 / RTL **均不纳入**并追加「国际化语言覆盖与文案分包体积调研」候选；**D13** 阶段末**按需发版、不预登记**；N5 `v0.5.0` 指向**维持现状**、只修发布指南 §3 文本口径。范围依据见[下一阶段范围评估（第二轮）](../design/governance/2026-09-30-next-stage-scope-evaluation-2.md) §8。
- 非目标：不执行远端推送（推送继续等待）；不重指 `v0.5.0` tag；不重新发布 0.5.0；不做 `iconOnly` 示例形态；不落地设计一致性断言（M3 只评估）；不做下游升级护航；不启动 Phase 8；不做国际化 / RTL 实现；不做组件增强与长尾；不预登记发布条目；不做破坏性 API 变更；不引入 Tailwind / UnoCSS。

### M1 发布收口与版本一致性（3 条）

- **M1-1 0.5.0 发布后校验与版本句同步**：registry `version` / `dist-tags` = 0.5.0；registry tarball shasum `266f7686…` 与本地 `npm pack` 产物交叉核对一致（**358 文件 / 858390 B**）；解包冒烟 `ok`（resolver / nuxt / styles 全 true、根导出 **92**）；README（中英）/ `roadmap §1` / `todo.md` 缺陷状态行同步 → `docs:check:version` **exit 0**（4 处漂移清零）。提交 `f0df2b0`。
- **M1-2 发布指南 §3 tag 指向口径修正**：§3 第 4 步改为「tag 落点两种形态均属正常」；`npm version` 注由「不要用其替代本流程」改写为「本地发布的正常流程」并去掉「偏差」定性；**`v0.5.0` 不回改**、历史记录不回写。提交 `3fcc78f`。
- **M1-3 0.5.0 发布执行治理记录**：产出 [`2026-10-01-phase18-m1-3-release-0.5.0.md`](../design/governance/2026-10-01-phase18-m1-3-release-0.5.0.md) 并登记索引；registry 实测值与 tarball 证据链逐项回链；「与发布日志逐条一致」不可证 → **替代取证边界**显式登记。提交 `1e05b5e`。

### M2 测试稳定性与质量装置消缺（5 条）

- **M2-1 并行负载 flaky 类根因修复与并发上限兜底**：根因 = Reka 浮层挂载 / roving focus / 双向 emit 由微任务与定时器混合驱动，高负载下「交互后立即断言」读到更新前状态；观测到的 **11 个用例**改条件轮询（helper `test/helpers/settle.ts`，规则落[测试规范 §6.2](../standards/testing.md)）；`vitest.config.ts` 增 `maxWorkers: 4` + `testTimeout: 15000`；**连续 7 轮零失败**、worker 进程恒为 4、负向对照证明判别力保持；**附带修复** `guard-ref-attrs` 在 `stdio: 'inherit'` 下 `.trim()` 崩溃。提交 `1b39f37` / `a3591a0` / `1e65760`。
- **M2-2 计算样式采样面扩展（Toast / Switch）**：采样面 **245 → 262 项（+17）**——`switch.*` 6（开 / 关 / 禁用三态轨道与滑块几何 + 前景回退色 + 选中态位移）与 `toast.*` 11（视口层级 / 停靠几何 + 五档语气强调色与图标色）；契约与夹具固有值逐项区分；负向对照 **7 处命中**（Switch 宽度 / Toast 强调条）、还原后 0 差异；`capture:styles` **262 项 0 差异**。提交 `6ba6d0c` / `5036199`。
- **M2-3 富文本编辑器窄屏真实几何回归**：新增常驻 E2E（三档视口断言页级 / `body` / 编辑器根相对视口与宿主容器的宽度 + 宿主 `display: grid` **前置守卫**）+ 独立夹具入口 `/rich-text-editor.html`；负向对照（回退 `min-width: 0`）mobile 失败（`scrollWidth` **1013** vs 390、溢出 **623**）、还原后三档全绿；`test:e2e` **117 passed**（既有 114 + 3，零回归）。提交 `8c7292d` / `2b2fe92`。
- **M2-4 组件设计 §5 组件清单对账守卫**：新增 `check:design-catalog`（接入 `governance:check`）——以 §11 登记成员（48）对账 §5 清单（21 行）的行成员与「（已实现）」标记，五条判定（`phantom-implemented` / `stale-marker` / `scope-narrowed` / `allowlist-stale` / `member-drift`）；**存量漂移修复**：§5 **7 行**已实现但漏标；负向对照 T1 / T2 均 exit 1；单测 **18 例**；§11 解析下沉共享模块。提交 `27c9700` / `5150e21`。
- **M2-5 浮层档位装置判别力补强**：① 内联 ColorPicker 由「只断言计算 `z-index`」升级为「声明层 + 真实绘制顺序命中」；② 命中测试判别力自证扩展到模态内容**后代**；③ 受检清单下沉单一事实源 `test/e2e/fixtures/overlay-panels.json`，`check:overlay-z-index` 新增 **T10 双向对账**（`src` 锚定面板组件 ↔ 清单条目 + 非面板例外名单反向校验）——新增 portal 浮层组件而未补清单即 `governance:check` 失败；三组负向对照均实测失败后还原；守卫单测 **41 例**（34 → +7）。提交 `37552ec` / `d02177c`。

### M3 组件设计一致性回归评估（1 条）

- **M3-1 设计规范 §6 组件约定「可机检性」分级评估**（**纯评估、零 `src/**` 零 `test/**`**）：产出 [`2026-10-01-phase18-m3-1-design-consistency-evaluation.md`](../design/governance/2026-10-01-phase18-m3-1-design-consistency-evaluation.md)——§6 **16 行**约定**无一行属「仅人工」**（主层级 计算样式层 13 / 声明层 2 / 几何层 1；出现次数 算 15 / 声 6 / 几 9 / 交 7）；装置盘点（`check:design` 9 类 + `check:overlay-z-index` T1~T10 + 3 份 contracts + `capture:styles` 262 + e2e 117 + a11y 59 + 组件单测）；覆盖 9 行较完整 / 7 行缺口明显；取证发现 **7 项 §6 ↔ 实现口径漂移**（禁用态计数 37 vs 实测 35 处声明；`:invalid` vs `.caomei-field--invalid`+`aria-invalid`；浮层背景 `bg-elevated` vs 8 面取 `bg`；Popover 圆角；Tag 字号；AutoComplete 阴影字面量；Card 三变体）——**须先裁定再落守卫**；落地建议 P0~P3（待裁定后登记）。提交 `b0567c0`。

### M4 组件文档与口径收口（2 条）

- **M4-1 `Select` 字段层 `class` 落点文档补强**：中英 `select.md` 新增「`class` / `style` 落点」说明——`inheritAttrs: false` 下 `$attrs` 整绑**触发器**、不落字段外层；`--caomei-select-max-width` 宿主为字段外层，覆盖须作用于本元素或其祖先（CSS 变量只向下继承）；与 `select.vue` 注释口径及 `theming §4.1` 一致。提交 `898fbf4`。
- **M4-2 对比度 6 项在册缺口终局结论收口**：产出 [`2026-10-01-phase18-m4-2-contrast-terminal-conclusions.md`](../design/governance/2026-10-01-phase18-m4-2-contrast-terminal-conclusions.md)——6 项**全部维持、不修色**（3.76 / 3.39 / 4.17 / 4.28 / 4.39 / 3.73·4.32:1，阈值 4.5:1）；本批复算 **7/7** 与 M2 记录 8% 口径表一致；`design-spec §3.2` 跟踪指针由 Backlog 改指该记录（**唯一载体**）；**零色值变更**（`git diff -- src/styles/` 为空）、`capture:styles` 262 项 0 差异。提交 `37aa19b`。

### M6 治理台账漂移消缺（1 条）

- **M6-1 治理台账漂移消缺（3 项处置 + 同类回扫）**：**C49** 预备检查记录 §4 的 `Backlog §1.2` → **§1.8**；**C50** `todo.md` 陈旧轮次指针**复核确认无残留**（`rg "第 18 轮"` = 0、仅引第 19 轮）；**C51** `backlog.md` §1.8 行重写为「下游 0.5.0 升级护航」（本仓 0.5.0 已发布、隔两个 minor，差异清单改为触发时按 CHANGELOG 重取）；同类回扫（章节引用 / 轮次 / 版本口径）无其它漂移；回扫新增发现第 4 处（`todo.md` 阶段头「实施未启动」滞后）；**承接 M1-2 延期回扫面**（活载体 `experience-archive.md` 的 `npm version` gotcha 修、点时记录 3 处不回改）；**指针判据沉淀至 [规划规范 §9](../standards/planning.md)**；旧口径逐载体 `rg` 复核零残留。提交 `5921787` / `d3de4e0`。

### 附带交付（非阶段条目）

- **组件画廊侧栏接入与对齐修复**（`25f79fa` / `8667117` / `b89d720`）：画廊进组件侧栏、RichTextEditor 独立「高级组件」分组、卡片安全居中修复（超高演示顶部可达）+ 常驻 E2E。
- **文档口径与设计区侧栏简化**（`8c696d2` / `29dbb86` / `29a7693`）：富文本内核安装前置说明、可选 peer（`md-editor-v3` / `@nuxt/kit`）说明、`/design/` 侧栏只留 7 篇面向使用者的设计文档。
- **发布前预备检查与第 19 轮门槛复核**（`1c9f9b0`）：发布面取证 + 14 项就绪检查 + 发布执行清单 + 长期任务第 19 轮。
- **并行负载 flaky 类登记**（`eea4746`）：根因与累计实例登记（其后由 M2-1 修复）。

### 阶段总结

- **提交对账**：`git log --oneline ed99c7b..d3de4e0 | wc -l` → **41**（下界 = Phase 17 归档批次末条提交 `ed99c7b`，上界 = 本阶段末条状态提交 `d3de4e0`；**不得写 `HEAD` 相对范围**，归档提交会推进 `HEAD`）。构成（逐项相加 = 41）：Phase 18 本体 **19** + 阶段登记与范围评估 **2** + 发布执行 **2** + 附带交付 **8** + 依赖维护 **10**；逐条清单见[归档批次记录](../design/governance/2026-10-01-phase18-archive.md) §2。**归档批次自身提交不计入上式**。
- **质量门**：`pnpm verify` **exit 0**、`test` / `test:a11y` / `test:e2e` / `capture:styles` / `docs:check` / `check:governance-records` / `check:distill-archive` / `docs:build` 的**终态数值与复算命令见[归档批次记录](../design/governance/2026-10-01-phase18-archive.md) §8**（单点来源，本块不复写易变计数）。
- **长期任务**：阶段收口前触发**第 20 轮**门槛复核（零代码改动域）——待执行批次 **0 项**；条件触发 **1 项维持**；已判定不纳入 5 项维持；**计数与第 19 轮逐项一致（无漂移）**；证据见[长期任务](./recurring.md) §3 第 20 轮。
- **回扫口径（三段式）**：见[归档批次记录](../design/governance/2026-10-01-phase18-archive.md) §4（机检面 / 人工面 / 未处理面）。
- **wisdom 蒸馏**：`pnpm distill:wisdom --check` → **`WISDOM_OK: 15 active entries (threshold 20)`**——**未达阈值、本轮不执行蒸馏**（[规划规范 §7](../standards/planning.md)）；`pnpm check:distill-archive` → **11 段 reconciled**（未新增段）。本阶段 3 条发现已即时落入规范载体（`planning.md §9` 等），未在活跃段累积。
- **归档批次审计**：经 `@code-reviewer` Review Gate **单分区 `standard`**（归档批次以规划载体为主、无运行时面，故不分区）——结论见本块末「归档批次 Review Gate」段。
- **已知观察**：① **M3-1 的 7 项 §6 ↔ 实现口径漂移未处置**——属评估交付的发现，须用户裁定后再落守卫（已登记为该记录 §4 的前置阻塞）；② **0.5.0 已发布、git 侧未推送**（本地领先 `origin/master`、远端 0 tag），推送与阶段末发版时机由用户决定（D2 / D13）；③ 本阶段**零 `src/**` 行为改动**（仅临时负向对照改动、均已还原），候选计数与第 19 轮一致；④ 本仓期间被另一会话并行写入一次（`pull --tags --autostash` 前移 HEAD），开工前已确认工作区洁净；⑤ `docs:check:integrity` 对 `todo.md` 报「H1/H2 结构标题由 HEAD 的 4 个降为 3 个」告警——脚本自带说明「阶段 / 条目标题在 H3/H4，属**归档正常移除面**」，**属预期、非阻断**（Phase 17 归档批次同类观察）；⑥ 归档清理的 `Mx-y` 残留形态**已补机检兜底**——`check-planning-numbers` 受检面扩至规划载体（`docs/plan/todo.md`），负向对照（注入编号 → exit 1）与单测（43 例）齐备，该形态此前在近三次归档复发、原为「Review Gate 必查项」。
- **遗留与后续候选**：Phase 8 未启动（用户 2026-09-28 裁定 D13、2026-09-30 D9 维持）；dependfix `apps/platform` 与 momei 侧迁移由对应仓库执行、本仓等待反馈；Backlog 在册含「下游 0.5.0 升级护航」、`iconOnly` 示例形态（待调研）、组件增强与长尾（条件触发）、a11y 同类悬空引用与 Toast 焦点哨兵、国际化语言覆盖与文案分包体积调研、设计一致性可机检项落地（待 M3-1 口径裁定）等；其余见 [Backlog](./backlog.md)。

### 归档批次 Review Gate

经 `@code-reviewer` Review Gate **单分区 `standard`**（归档批次以规划载体为主，故不分区）：R1 **`Reject`**（1 blocker / 1 warning / 1 suggest）——blocker = 归档后 `todo.md` 残留条目编号 `M3-1`（规划规范 §7 明令禁止、**近三次归档复发**）→ 修复：清除编号**并补机检兜底**（`check-planning-numbers` 受检面扩至 `docs/plan/todo.md`，把「Review Gate 必查」升级为可复算门禁，负向对照 + 单测 43 例齐备），另收口 warning（回扫人工面数字留痕）与 suggest（轮次口径限定）→ **R2 `Pass`（0 blocker / 0 warning / 0 suggest）**。逐轮 findings、逐条处置与实测用时见[归档批次记录](../design/governance/2026-10-01-phase18-archive.md) §10。**单点来源界定**（易变计数只在[归档批次记录](../design/governance/2026-10-01-phase18-archive.md) §8 声明）使 Phase 17 的「同一计数跨载体漂移」根因未复发。

---

## Phase 19：设计一致性口径落地、组件文档去重与观感缺陷处置

- 时间：2026-10-02 用户裁定 D1 ~ D13 后登记；2026-10-07 交付 6 条主线 / 14 条原子条目并完成阶段归档（用户指令「开始归档」）。
- 范围与授权（用户决策 2026-10-02）：用户取**组合 A + 组合 B + 组合 C（= M1 + M2 + M3 + M4 + M6）**，并经 **D10 上收 M7**，共 **6 条主线 / 14 条原子条目**（M1 4 / M2 3 / M3 3 / M4 2 / M6 1 / M7 1）；逐条裁定——**D2** 设计规范 §6 七项口径漂移「措辞 + 实现一起改」（含 D3 浮层背景 `bg-elevated`、D4 Popover 圆角、D6 AutoComplete 阴影 token 化三项视觉变更）；**D3** Tab 指示条**修复**；**D4** 富文本下拉取**文档站作用域隔离**；**D5** 迁移映射**3 批全量整改**；**D6** `iconOnly` **改示例**；**D7** 下游升级口径**重写并纳入 M6**；**D8** Phase 8 **继续等待**；**D9** 两条流程约束**纳入 M4**；**D10** 上收国际化调研；**D11** 远端 tag **已授权并推送**；**D12** 组件增强**维持条件触发**；**D13** **按需不预登记发布**。范围依据见[下一阶段范围评估（第三轮）](../design/governance/2026-10-02-next-stage-scope-evaluation.md) §8。
- 非目标：不重指 tag / 不重新发布；不启动 Phase 8；不做组件增强与长尾；不做国际化实现 / RTL；不改品牌色值；不做破坏性 API 变更；不重写下游仓库；不预登记发布条目；不引入 Tailwind / UnoCSS。

### M1 设计一致性口径裁定与守卫落地（4 条）

- **M1-1**：依据 [Phase 18 M3-1 记录](../design/governance/2026-10-01-phase18-m3-1-design-consistency-evaluation.md) §4 逐条修正[设计规范 §6](../design/design-spec.md) 的措辞与计数（D1 禁用态计数 35 / D2 `invalid` 语义 / D5 Tag 字号按档位 / D7 Card 三变体）。提交 `db342c3`。
- **M1-2**：§6 涉及的**实现对齐**（视觉变更）——D3 浮层背景 `bg` → `bg-elevated`、D4 Popover 默认圆角 `md` → `lg`、D6 AutoComplete 阴影走 `--caomei-shadow-md`；同批随 §6 扩写覆盖 **11 处**（D3 原定 8 面 + ConfirmDialog / Drawer / DatePicker）。**V 阶段**真实 Chromium **44 / 44 通过**、负向对照 **11 / 11 失败**；`capture:styles` 262 项 0 差异、`check:design` 全绿。提交 `89c4d82`（实现）/ `1728a0f`（状态）/ `8288638`（验证留痕）；记录见 [M1-2 视觉对齐](../design/governance/2026-10-05-phase19-m1-2-visual-alignment.md)。
- **M1-3**：按 §5 落地 **P1 + P2 装置**（三子批）——**3a** 浮层面板视觉契约固化（采样面 262 → 270）；**3b** §5 P1 五项 + 登记点名项（270 → 297）；**3c** 声明层契约 3 项 + checkbox 采样（297 → 302）。负向对照逐组命中、`capture:styles` **302 项 0 差异**；提交 `222cee7` / `86f1cad` / `ecf019e`；记录见 [3a](../design/governance/2026-10-05-phase19-m1-3a-panel-visual-contract.md) / [3b](../design/governance/2026-10-05-phase19-m1-3b-capture-p1-extension.md) / [3c](../design/governance/2026-10-05-phase19-m1-3c-declaration-contracts.md)。
- **M1-4**：落地 **P3 几何 / 交互层装置**——禁用态尺寸不变（7 组件对）+ Button 角标外扩 + Drawer `90vw`·`90vh` 收敛 + Drawer reduced-motion + 焦点可见扩面（5 组件）；新增 **54 例常驻 E2E**、全量 **186 passed**、`capture:styles` 302 项 0 差异；**发现并修复 Drawer reduced-motion 特异性缺陷**。提交 `522befe`；记录见 [M1-4](../design/governance/2026-10-05-phase19-m1-4-geometry-interaction-devices.md)。

### M2 组件文档一致性整改（迁移映射去重，3 条）

- **M2-1 批 1（ColorPicker / DatePicker）**：删除中英 4 页中段 `> 迁移映射` 正文块并折入迁移节；ColorPicker 纯冗余、DatePicker 折入 `selectionMode` 零用量语义。复算整改前中英各 **6** / 消除 **2** / 当前 **4**。提交 `7139efe`；记录见 [M2-1](../design/governance/2026-10-05-phase19-m2-1-migration-dedup-batch1.md)。
- **M2-2 批 2（Drawer / Message）**：删除中英 4 页正文块；Drawer 折入 `#footer` 映射与零下游用量判据、Message 折入有损近似。复算批前 **4** / 消除 **2** / 当前 **2**。提交 `5d36c3a`；记录见 [M2-2](../design/governance/2026-10-05-phase19-m2-2-migration-dedup-batch2.md)。
- **M2-3 批 3（SplitButton / Tag）**：删除中英 4 页正文块；SplitButton 折入未实现括注、Tag 折入 `info → primary` / `error` 零用量 / `outlined` prop / §9 未决项指针。复算批前 **2** / 消除 **2** / 当前 **0**，**M2 终态中英各 0 页**；**N2 关闭**（该候选行已随登记批次迁出候选池，无残留行）。提交 `cf38ca8`；记录见 [M2-3](../design/governance/2026-10-05-phase19-m2-3-migration-dedup-batch3.md)。

### M3 组件观感缺陷处置（3 条）

- **M3-1 Tab 激活指示条被容器裁剪修复**（视觉变更）：取「`padding-bottom: 1px` + 内阴影」方案，恢复设计意图「2px 主色、分隔线被盖住」；**V 阶段**逐行像素 白/主色/分隔线/白 → 白/主色/主色/白、`triggerClippedPx` 1 → 0；新增声明层契约 + 几何/像素 E2E；顺带结构性消除 1px 纵向溢出（`tabs-list-overflow.e2e.ts` 前置条件同步）；`capture:styles` 302 项 0 差异（采样面不含 Tabs，显式声明非证据）。提交 `7b71b2e`；记录见 [M3-1](../design/governance/2026-10-06-phase19-m3-1-tabs-indicator-clipping.md)。
- **M3-2 RichTextEditor 工具栏下拉留白**：按 D4 取**文档站作用域隔离**（`caomei-demo.css` 新增内核菜单隔离规则），不改组件库 `src/**`；**V 阶段**菜单 20px → 0、菜单项 8px → 0、首项偏移 31 → 11px，正文列表 20px 无回归；新增声明层契约；`docs:build` / `pnpm verify` exit 0；零 `src/**`。提交 `35c6731`；记录见 [M3-2](../design/governance/2026-10-06-phase19-m3-2-rich-text-editor-dropdown-indent-fix.md)。
- **M3-3 Button `iconOnly` 示例形态**：按 D6 改示例（22 个纯图标按钮改走 `#icon` 插槽），组件契约不变；**V 阶段** 22/22 有可见内容、空白 0；新增声明层契约；中英共用示例源；零 `src/**`。提交 `7a70134`；记录见 [M3-3](../design/governance/2026-10-06-phase19-m3-3-button-icon-only-example.md)。

### M4 治理约束载体落地（2 条）

- **M4-1 `.session` 阶段态同步触发点**：`todo-manager` skill Session 收尾协议把「阶段登记 / 归档 / 范围变更批次」显式列为 `.session` 阶段态**必同步触发点**（Step 3.5，含「常见检查 / 交付前检查」引用行）；**不为 git-ignored 载体新增机检守卫**。
- **M4-2 `todo.md` 完成态回填次序**：把「完成态不得早于该条目 Review Gate 结论、两者同批落地后方可提交」固化到 skill Step 1.7（此前仅在 `.session/wisdom.md`，属**首次固化非重述**）。M4-1 / M4-2 同提交 `70a7eb7`；记录见 [M4](../design/governance/2026-10-06-phase19-m4-governance-constraint-carriers.md)。

### M6 下游协同口径消缺（1 条）

- **M6-1**：按 dependfix 实测重写 [Backlog](./backlog.md) §1.8「下游 0.5.0 升级护航」行（**就地重写、不迁出候选池**：dependfix 侧已消费 / momei 侧仍锁 `0.3.0` 待升级），并回扫同类版本口径表述；逐载体 `rg` 复核旧口径零残留；补两仓实测时点。提交 `46cfe17`；记录见 [M6-1](../design/governance/2026-10-06-phase19-m6-1-downstream-version-alignment.md)。

### M7 国际化调研（1 条）

- **M7-1**：调研主流组件库（Vue / React 生态）国际化语言覆盖（L1 取证 6 库语言条目 43 ~ 72，本库 5）与国际化文案**分包 / 体积**工程方案；盘点本库现状（854 行 / 32 KB、单对象根导出、无子路径）并给出 A/B 两条工程路线与 RTL 独立立项判据。**只调研、未改代码**。提交 `1ff2757`；记录见 [M7-1](../design/governance/2026-10-06-phase19-m7-1-i18n-research.md)。

### 附带交付（非阶段条目）

- **Phase 19 登记与范围评估**：`7cf0747`（规划编号守卫豁免进行中阶段条目表）/ `9613eb5`（Phase 19 登记 + 第三轮下一阶段范围评估）。
- **2026-10-02 用户多事项批次**（登记前交付）：`135d632`（文档开发命令自动打开浏览器）/ `dae0b62` + `dad3e91`（RichTextEditor 下拉留白归因与收窄）/ `568b042` + `53976ac`（TabList 多余纵向滚动条修复与回填）/ `f41a2e2`（Accordion 自定义触发器示例修复）/ `449068e` + `c88e6d3`（DataTable 排序指示条列宽稳定与回填）/ `4a2d910`（DataView 迁移映射合并 + 跨组件专项评估 + Backlog 登记）。

### 阶段总结

- **提交对账**：`git log --oneline c69b3e3..1ff2757 | wc -l` → **28**（下界 = Phase 18 归档批次末条提交 `c69b3e3`，上界 = 本阶段末条实现 / 记录提交 `1ff2757`；**不得写 `HEAD` 相对范围**，归档提交会推进 `HEAD`）。构成（逐项相加 = 28）：Phase 19 本体 **17**（M1 8 = `db342c3` / `89c4d82` / `1728a0f` / `8288638` / `222cee7` / `86f1cad` / `ecf019e` / `522befe`；M2 3 = `7139efe` / `5d36c3a` / `cf38ca8`；M3 3 = `7b71b2e` / `35c6731` / `7a70134`；M4 1 = `70a7eb7`〔M4-1 / M4-2 同提交〕；M6 1 = `46cfe17`；M7 1 = `1ff2757`）+ 阶段登记与范围评估 **2**（`7cf0747` / `9613eb5`）+ 附带交付 **9**（`135d632` / `dae0b62` / `dad3e91` / `568b042` / `53976ac` / `f41a2e2` / `449068e` / `c88e6d3` / `4a2d910`）。**归档批次自身提交不计入上式**。
- **质量门**：`pnpm verify` **exit 0**、`test` / `test:a11y` / `test:e2e` / `capture:styles` / `docs:check` / `check:governance-records` / `check:distill-archive` / `docs:build` 的**终态数值与复算命令见[归档批次记录](../design/governance/2026-10-07-phase19-archive.md) §8**（单点来源，本块不复写易变计数）。
- **长期任务**：阶段收口前触发**第 21 轮**门槛复核（规划清理域）——待执行批次 **0 项**；条件触发 **1 项维持**；已判定不纳入 5 项维持；**计数与第 20 轮逐项一致（无漂移）**；证据见[长期任务](./recurring.md) §3 第 21 轮。
- **回扫口径（三段式）**：见[归档批次记录](../design/governance/2026-10-07-phase19-archive.md) §4（机检面 / 人工面 / 未处理面）。
- **wisdom 蒸馏**：活跃条目数、阈值判定与归档段对账见[归档批次记录](../design/governance/2026-10-07-phase19-archive.md) §6。
- **归档批次审计**：经 `@code-reviewer` Review Gate **单分区 `standard`**（归档批次以规划载体为主、无运行时面，故不分区）——结论见本块末「归档批次 Review Gate」段。
- **已知观察**：① Phase 19 **含 `src/**` 行为改动**（M1-2 组件背景 / 阴影、M3-1 Tabs 几何、M1-4 Drawer reduced-motion），与 Phase 18 的「零 `src/**` 行为改动」不同；② `capture:styles` 采样面由 **262 扩至 302**（M1-3 三子批），属预期变更（同族变更见 [M1-3a](../design/governance/2026-10-05-phase19-m1-3a-panel-visual-contract.md)）；③ 本批顺带修正 `todo-archive.md` 主窗口阶段块顺序（原 Phase 18 块误置于 Phase 17 之前），现按时间序 13 → 14 → 15 → 16 → 17 → 18 → 19 排列；④ `docs:check:integrity` 对 `todo.md` 报「H1/H2 结构标题减少」告警——脚本自带说明「阶段 / 条目标题在 H3/H4，属归档正常移除面」，属预期、非阻断；⑤ 归档载体行数超 `docs:check:line-count` 的 warn 阈值（warn > 400 / error > 600，**非阻断**）——归档载体只增不减，本批接受；⑥ 归档后 `check:governance-records` 报 **9 处** `stale-planning-pointer`（Phase 18 记录表头「关联条目」指向 `todo.md`）；同批改指 **9 份 Phase 18 + 主动改指 14 份 Phase 19** 记录表头至 `todo-archive.md`，复跑 exit 0。
- **遗留与后续候选**：Phase 8 未启动（用户 2026-09-28 裁定 D13、2026-10-02 D8 维持）；dependfix `apps/platform`（已升级 `0.5.0`、M34 归档）与 momei 侧迁移由对应仓库执行、本仓等待反馈；Backlog 在册含「下游 0.5.0 升级护航」、组件增强与长尾（条件触发）、a11y 同类悬空引用与 Toast 焦点哨兵、文档站浮层泄漏常驻浏览器断言、国际化语言覆盖与文案分包体积（调研结论已出、实现待规模触发）、RTL 独立立项等；其余见 [Backlog](./backlog.md)。

### 归档批次 Review Gate

经 `@code-reviewer` Review Gate **单分区 `standard`**（归档批次以规划载体为主，故不分区）：R1 **`Reject`**（1 blocker：归档记录 §4① 的**描述性样例**（`todo.md` 链接后紧邻 `Phase 18`）自触发 `stale-planning-pointer`，使 `governance:check` / `verify` 必失败；1 warning：§8 易变计数未取终态；3 suggest）→ 修复（§4① 去链接化 + 主动改指 14 份 Phase 19 记录表头 + §8 重取终态）→ **R2 `Pass`**（0 blocker；RG-B1 / RG-S1 / RG-S2 / RG-S3 关闭；RG-W1 回填记「已修复未复审」）。逐轮 findings 见[归档批次记录](../design/governance/2026-10-07-phase19-archive.md) §10。
