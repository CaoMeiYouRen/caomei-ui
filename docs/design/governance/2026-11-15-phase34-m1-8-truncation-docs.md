# Phase 34 M1-8：四组件页长文本截断说明与 F4 迁移措辞收口

> 创建时间：2026-11-15
> 触发：用户「继续推进剩余待办」。M1-8 范围与验收口径见 [Phase 34 登记批次](./2026-11-14-phase34-registration.md) §2；F4 / F2 / F6 均来自 [M1-1 记录](./2026-11-15-phase34-m1-1-tooltip-base.md) **§6 遗留**，F4 另经 [M1-7 记录](./2026-11-15-phase34-m1-7-docs-provider.md) §5 指到本批。

## 1. 交付面（三个原子交付，各自独立提交）

### 1.1 M1-8：四组件页（8 文件）

| 面 | 文件 |
|:---|:---|
| 组件页（4 组件 × 中英） | `docs/components/{data-table,tag,breadcrumb,menu}.md` 与 `docs/i18n/en-US/components/{data-table,tag,breadcrumb,menu}.md`：各补一节「长文本截断与提示」，位置统一在「无障碍」之前；Breadcrumb / Menu 的「样式定制」表各补 1 行既有变量 |

### 1.2 F4 收口：Provider 措辞统一（4 文件）

| 面 | 文件 |
|:---|:---|
| 迁移指南（2 × 中英） | `docs/guide/upgrade-to-1.0.md` 与英文版、`docs/guide/primevue-migration.md` 与英文版：把「使用 Tooltip 时在应用根部放置 Provider」「Provider 已在应用根部放置」改为「建议放置 + 未放置时内建兜底（代价是不共享跨触发器免延迟）」；迁移对照表的 Provider 单元格同口径 |

### 1.3 F2 / F6 收口：Tooltip 页补充可测量盒声明与 `auto` 示例（2 文件）

| 面 | 文件 |
|:---|:---|
| 组件页（中英） | `docs/components/tooltip.md` 与英文版「文本溢出提示 / Overflow tooltips」段：补可复制片段（`mode="auto"` + 截断配方，含使用方需用 `:deep()` 的原因）与「覆盖 `display` 时须保留可测量盒」的显式声明（含 `:where()` 字段范围说明） |

治理索引、记录本体与规划状态位属登记 / 留痕，不计入上表。三个原子交付分别 8 / 4 / 2 文件，均未越过 10 文件阈值。**无 API 变更**：本批只写既有能力（三个 CSS 变量在 M1-6 已引入、`CaomeiTooltipText` 为既有公开组件），不宣称新增 prop / 事件 / 插槽。

## 2. 决策

1. **四组页面同批同节**：新增章节统一放在「无障碍」之前（Tag / Breadcrumb / Menu / DataTable 的位置一致），中英同节同名，避免只改单侧。
2. **只写可核对的行为**：截断触发条件、提示内容来源、静默条件（无 `aria-describedby`）、指针路径边界、关闭方式（根部 Provider `:disabled`），每一项都能在实现里找到对应（`scrollWidth > clientWidth + 1`、`mode="auto"`、`active` 计算）。
3. **F15 收口**：DataTable 页按 F15 原定义的三条写——① 列宽白名单单位（`px` / `rem` / `em` / `ch` / `ex` / `cm` / `mm` / `in` / `pt` / `pc`，小写）才截断；② 百分比 / `auto` / `min-content` / 视口单位（`vh` / `vw` / `vmin` / `vmax`）不截断、保持换行；③ 可排序表头的上限未扣排序指示器预留宽（图标 14px + 间距，多列排序另含序号 `1ch`），可排序列会略宽于声明值。补充两条已实现口径：上限 = 列宽 − 单元格横向内边距；自定义 `cell` / `#cell-*` / `#header-*` 不包裹提示。
4. **F16 的组件页约束在 Menu 页落地**：项插槽被整体包进文本盒 → `--caomei-menu-item-gap` 不再作用于「图标 + 文本」、多节点内容按盒裁切；子菜单指示器是 `aria-hidden` 装饰图标、不挂提示，展开语义由 `aria-expanded` 表达。
5. **Breadcrumb 页写明命中区与提示的关系**：文本盒绘制在不可见命中区之上，长链接中段悬停也能出提示，命中区点击语义不变（这是 M1-6 的实测修正，写进页面避免后续被「优化」掉）。
6. **F4 选择在本批收口**：它是 M1-7 指到 M1-8 的遗留，且四个 guide 文件并入 M1-8 会到 12 文件；故按[规划规范 §5](../../standards/planning.md) 拆成独立原子交付（4 文件），与 M1-8 分开提交，口径同批一致。
7. **F2 / F6 同批收口**：两者同在 M1-1 §6 指定给 M1-8（`docs/components/tooltip.md` 中英），与四组件页无交集，故作为第三个原子交付（2 文件）。F2 补「覆盖 `display` 须保留可测量盒」及其 `:where()` 字段范围；F6 补 `mode="auto"` 的可复制片段（含使用方 scope id 到不了内层 span、截断样式须用 `:deep()` 的实测原因）。

## 3. 验证

| 面 | 结果 |
|:---|:---|
| `docs:check` | 全链通过（integrity / links / structure / config-links / i18n-parity / version / interpolation / example-refs / showcase / demo-external-images / line-count / i18n）；新增章节中英同名同位置 |
| `docs:check:i18n-parity` | 通过（受检页面全部对账，2 对为登记的结构差异） |
| `docs:check:links` | 通过（提交前工作区口径：记录 `git add` 后受检面与本记录同步） |
| `check:design-catalog` | 通过（27 行 / 56 成员，本批未动清单） |
| `docs:build` | 通过（73s，无死链） |
| `pnpm verify` | 最终 revision 复跑 exit 0（新记录与新增示例 `git add` 后，integrity / links 的受检面覆盖到位） |

## 4. Review Gate

- **R1（`standard`，A 文档内容 / B 记录与索引两分区并发）**：A `Pass`（0 blocker；1 warning：Menu 的 `--caomei-menu-item-gap` 变量说明与新增节冲突；5 suggest：可排序表头预留宽只按单列排序折算、指针路径边界只在 Tag 页写明、列宽 API 行与本节缺少互指、命中区写成固定 24px、Tag 变量未给默认值）。B `Reject`（3 blocker：§3 与索引摘要复述门禁读数（`docs:check:links` 实测 557 与所写 556 不符，且违反索引「摘要不复述门禁读数」条）；F4 来源章节指针写 §5 实为 §6；F2 / F6 被 M1-1 §6 指定给本批却未交付、落点写成无载体的「后续批次」；2 warning：记录未 `git add` 时 integrity 不覆盖它、§2 决策 3 的「三条口径」与 F15 原定义不是同一组）。
- **R1 修复**：① 索引摘要删除 `i18n 70 对` / `links 556` 等读数，记录 §3 改为「命令 + 结果」并标注「提交前工作区口径」；② F4 来源指针改为 M1-1 §6；③ F2 / F6 作为第三个原子交付（`docs/components/tooltip.md` 中英，2 文件）实做并关闭，F1 落点改 M4-1；④ §2 决策 3 按 F15 原定义重写三条并把「上限 = 列宽 − 内边距」列为补充口径；⑤ Menu 的 gap 变量行改写为中英一致的现行口径；⑥ 四页补「指针路径」边界、DataTable 的预留宽改结构描述、命中区标注 `--caomei-hit-target-min`、Tag 补默认值、列宽 API 行互指；⑦ `git add -A docs` 后在最终 revision 复跑 `pnpm verify`（W1 的修复动作）。
- **R2（`quick`，两分区修复点）**：A `Pass`（W1 / S2 ~ S5 / Tag 默认值 / F2 / F6 关闭；3 条 follow-up：预留宽数值两处维护、上限未提 `1ch` 兜底、`:where()` 覆盖字段枚举偏窄——均已在本轮收口）。B `Pass`（B1 ~ B3 / W1 / W2 关闭；3 条 follow-up：§3 的 verify 行悬空、索引摘要把补充口径编成「三条」之一、F16 部分落地未在摘要体现——均已在本轮收口）。

## 5. 遗留

| 编号 | 内容 | 落点 |
|:---|:---|:---|
| F1 | 承接 M1-1：可测量盒的真实布局级持久守卫 | M4-1（DataTable 数据面批次新增真实浏览器断言） |
| F2 | 承接 M1-1：Tooltip 页声明「覆盖 `display` 须保留可测量盒」并复核 `:where()` 字段范围 | **本批关闭**：`docs/components/tooltip.md`「文本溢出提示」段（英文 `Overflow tooltips`）新增引用块 |
| F6 | 承接 M1-1：补 `mode="auto"` 的可复制片段 | **本批关闭**：同段新增示例（含使用方须用 `:deep()` 的说明） |
| F4 | Provider 措辞统一（四个 guide 文件） | **本批关闭**：`docs/guide/upgrade-to-1.0.md`、`docs/i18n/en-US/guide/upgrade-to-1.0.md`、`docs/guide/primevue-migration.md`、`docs/i18n/en-US/guide/primevue-migration.md` 四处改为「建议放置 + 兜底」 |
| F7 ~ F9 | 承接 M1-2 | 见 M1-2 记录遗留节 |
| F10 / F11 | 承接 M1-3（F12 已收敛） | 见 M1-3 记录遗留节 |
| F14 | 承接 M1-5：验证表计数须与逐点清单求和一致 | 见 M1-5 记录遗留节 |
| F15 | 承接 M1-6：DataTable 仅绝对长度列宽截断 | **本批关闭**：`docs/components/data-table.md` §长文本截断与提示（中英同名节）已写全三条口径 |
| F16 / F17 | 承接 M1-6：Menu 槽包裹约束 / 大表逐格接线开销 | F16 的组件页约束已落 Menu 页；`icon` 出口与 F17 仍待评估 |

## 6. 复查基线

本记录 §1 ~ §5；四个组件页的中英新增章节与两处变量表行；四个 guide 文件中「建议放置 + 兜底」的四处；`docs/plan/todo.md` 的 M1-8 状态位与索引摘要。
