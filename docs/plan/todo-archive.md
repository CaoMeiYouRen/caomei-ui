# 待办归档

本文档归档已完成阶段的原子条目与验收结论。当前阶段完成后，从 [todo.md](./todo.md) 迁入此处。

> **主窗口口径（2026-11-21 更新）**：主窗口只保留**归档索引**（Phase 0 ~ Phase 34，逐阶段一行摘要 + 深度归档链接）与**近线阶段窗口**（**当前为 Phase 35 ~ Phase 40 共 6 块**，目标窗口 5 个；`docs:check:line-count` 读数 378 行，未越 warn 400，按「迁移触发 = 越过阈值」暂不迁出）；更早阶段的完整归档块迁入**深度归档**目录 [`archive/`](./archive/)，收录范围分别为 [phase-00-06.md](./archive/todo-archive-phases-00-06.md)（Phase 0 ~ 6）、[phase-07-12.md](./archive/todo-archive-phases-07-12.md)（Phase 7 第一阶段 ~ Phase 12）、[phase-13-17.md](./archive/todo-archive-phases-13-17.md)（Phase 13 ~ 17）、[phase-18.md](./archive/todo-archive-phases-18.md)（Phase 18）、[phase-19.md](./archive/todo-archive-phases-19.md)（Phase 19）、[phase-20.md](./archive/todo-archive-phases-20.md)（Phase 20）、[phase-21.md](./archive/todo-archive-phases-21.md)（Phase 21）、[phase-22.md](./archive/todo-archive-phases-22.md)（Phase 22）、[phase-23.md](./archive/todo-archive-phases-23.md)（Phase 23）、[phase-24.md](./archive/todo-archive-phases-24.md)（Phase 24）、[phase-25.md](./archive/todo-archive-phases-25.md)（Phase 25）、[phase-26.md](./archive/todo-archive-phases-26.md)（Phase 26）、[phase-27.md](./archive/todo-archive-phases-27.md)（Phase 27）、[phase-28.md](./archive/todo-archive-phases-28.md)（Phase 28）、[phase-29.md](./archive/todo-archive-phases-29.md)（Phase 29）、[phase-30.md](./archive/todo-archive-phases-30.md)（Phase 30）、[phase-31.md](./archive/todo-archive-phases-31.md)（Phase 31）、[phase-32.md](./archive/todo-archive-phases-32.md)（Phase 32）、[phase-33.md](./archive/todo-archive-phases-33.md)（Phase 33）、[phase-34.md](./archive/todo-archive-phases-34.md)（Phase 34）。**主窗口累计超过 `docs:check:line-count` 的 warn 阈值（400 行）时，把最早的阶段块迁入深度归档（链接深度机械调整，另含同目录 `./` → `../` 修正，正文不改写）**；该阈值由 `docs:check:line-count` 驱动——2026-11-15 Phase 34 入窗后 **397 行**；2026-11-16 Phase 35 入窗并迁出 Phase 28 ~ Phase 30 后 **311 行**；2026-11-19 Phase 37 入窗并迁出 Phase 31 后 **363 行**；2026-11-20 Phase 38 入窗并迁出 Phase 32 后 **374 行**（同日规则段 +3 行后检查器读数 **377 行**）；2026-11-21 Phase 39 入窗并迁出 Phase 33 后 **384 行**；2026-11-21 Phase 40 入窗并迁出 Phase 34 后 **378 行**（`docs:check:line-count` 值，仍低于 warn 400）。**深度归档不改变权威**：阶段交付的权威记录仍是各阶段治理记录（见[治理索引](../design/governance/index.md)），深度归档只保存主窗口迁出的原始正文。

## 归档格式

**2026-11-20 起新归档块按 6 项必填；既有归档块不追溯**（前向统一，避免重写点时记录与破坏 `check:archive-rg-counts` 的计数基线）：

- 阶段名称与时间；
- 交付内容与提交记录（含主线 / 原子条目清单与状态）；
- 质量门结果（lint / typecheck / test / build）；
- Review Gate 结论与轮次（Pass / Reject、轮次、问题计数与修复情况）；
- 未覆盖边界；
- 遗留问题与后续候选。

深度归档文件沿用同一格式（只做链接深度 `../` → `../../` 与同目录 `./` → `../` 的机械调整，正文不改写）。

**归档索引**：索引表固定 4 列（本仓为 `阶段 / 时间 / 交付摘要 / 深度归档`），须覆盖 `archive/` 的全部分片、无重复、不承载正文；**覆盖 / 无重复仅约束索引表行**，不约束「迁出时点」段对同一分片的二次引用。本仓维持阶段号正序（与近线主窗口 Phase 34 起的阅读顺序一致，不采用上游模板的倒序，理由见[规划文档模型 v1 研判](../design/governance/2026-11-20-planning-doc-model-v1-evaluation.md) §3.5）。新分片一律按 `todo-archive-phases-<起>[-<止>].md` 命名；`phase-*.md` 旧命名已于 `0f07c91a` 整批改完，不再保留存量豁免。

---

## 归档索引（Phase 0 ~ Phase 34）

> 完整归档块见「深度归档」列；阶段交付摘要如下（每行一行，细节以深度归档与治理记录为准）。

| 阶段 | 时间 | 交付摘要 | 深度归档 |
|:---|:---|:---|:---|
| Phase 0 | 2026-09-11 ~ 09-12 | 立项与 POC：命名 / 关键决策冻结、tsdown 构建与子路径导出、`--caomei-*` token 草案与暗色方案、AI / 文档基建、`src/` 骨架 | [phase-00-06](./archive/todo-archive-phases-00-06.md) |
| Phase 1 | 2026-09-12 | Tier 0 组件：Button / Input 家族 / Tag·Badge / Select / Dialog / Toast / Card / Checkbox / DataTable（列定义） | [phase-00-06](./archive/todo-archive-phases-00-06.md) |
| Phase 2 | 2026-09-13 | Tier 1 组件：Avatar / Paginator / Message / ProgressSpinner / ConfirmDialog（`useConfirm`）/ Password / MultiSelect | [phase-00-06](./archive/todo-archive-phases-00-06.md) |
| Phase 3 | 2026-09-13 | Tier 2 组件：Tabs / Accordion / DropdownMenu（10 件）/ SelectButton / Image / FileUpload | [phase-00-06](./archive/todo-archive-phases-00-06.md) |
| Phase 4 | 2026-09-13 | Tier 3 稳定批：RadioGroup / Slider / ToggleButton / Toolbar / Skeleton / ProgressBar / Popover | [phase-00-06](./archive/todo-archive-phases-00-06.md) |
| Phase 5 第一阶段 | 2026-09-13 ~ 09-14 | 文档站增强：docs `vue-tsc` 类型检查、站内搜索（中文分词）、站点 i18n 骨架 | [phase-00-06](./archive/todo-archive-phases-00-06.md) |
| Phase 6 | 2026-09-14 | 组件库补全与规范化：momei 使用复核台账、设计规范与主题预设、Divider / InputGroup / FloatLabel / ButtonGroup / AutoComplete / Stepper 补全 | [phase-00-06](./archive/todo-archive-phases-00-06.md) |
| Phase 7 第一阶段 | 2026-09-14 ~ 09-16 | 迁移就绪：消费路径与 Nuxt 接入（本地 link 先行）、组件 i18n 注入机制、DataTable 能力增强、DatePicker / Calendar / Drawer / SplitButton / ColorPicker / DataView | [phase-07-12](./archive/todo-archive-phases-07-12.md) |
| Phase 9 | 2026-09-16 | 发布前收口：文档站信息架构（6 分组 + 组内字母序）、代码质量门与守卫、发布清单 | [phase-07-12](./archive/todo-archive-phases-07-12.md) |
| Phase 10 | 2026-09-16 ~ 09-17 | 国际化与移动端适配：内建 5 语种、locale 键集合守卫、移动端与响应式适配 | [phase-07-12](./archive/todo-archive-phases-07-12.md) |
| Phase 7 第二阶段 | 2026-09-17 ~ 09-19 | 库侧迁移就绪与交接计划：迁移计划与验收标准、B0a 交接资产、6 主线 / 33 条原子条目 | [phase-07-12](./archive/todo-archive-phases-07-12.md) |
| Phase 5 第二阶段 | 2026-09-19 | 首版发布：本地手动 0.x 首发（0.1.0）、发布指南 runbook、annotated 基线 tag | [phase-07-12](./archive/todo-archive-phases-07-12.md) |
| Phase 11 | 2026-09-20 | 组件样式按需化与能力增强：`unbundle + css.inject`、`theme.css` 入口、4 主线 / 15 条原子条目 | [phase-07-12](./archive/todo-archive-phases-07-12.md) |
| Phase 12 | 2026-09-21 ~ 09-23 | 发布就绪、文档对外与一致性收官：0.2.0 发布、文档对外可用性、样式一致性收官、a11y 基线、治理守卫精选 | [phase-07-12](./archive/todo-archive-phases-07-12.md) |
| Phase 13 | 2026-09-23 ~ 09-24 | 组件能力补齐与 dependfix 迁移解阻：DataTable 行分组 / 可折叠分组 / 行展开 / 多列排序与降序优先、TagsInput 补齐、0.3.0 发布、文档站双花括号插值守卫 | [phase-13-17](./archive/todo-archive-phases-13-17.md) |
| Phase 14 | 2026-09-25 ~ 09-27 | 质量与一致性收口：a11y 例外处置与受检面扩面、样式 token 一致性、对比度与配对、跨根链接守卫、测试回归、switch 滑块前景判定、组件能力长尾判定 | [phase-13-17](./archive/todo-archive-phases-13-17.md) |
| Phase 15 | 2026-09-27 ~ 09-28 | 治理收口深化 + 组件能力补齐 + 下游迁移护航：字段 shell 样式层共享、引用型属性回归规则、Button `iconOnly`、Select `#value`、对比度盘点、迁移陷阱文档、条件候选判定表 | [phase-13-17](./archive/todo-archive-phases-13-17.md) |
| Phase 16 | 2026-09-28 ~ 09-29 | 质量收口与治理装置落地：治理守卫精选落地、0.4.0 发布收口 | [phase-13-17](./archive/todo-archive-phases-13-17.md) |
| Phase 17 | 2026-09-30 | 极简主题预设与富文本封装 + 治理补口：极简具名预设 `minimal` 成为缺省、`CaomeiRichTextEditor` 轻量封装、类名前缀守卫、取证命令 revision 钉定守卫、模态内浮层档位修复与门禁 | [phase-13-17](./archive/todo-archive-phases-13-17.md) |
| Phase 18 | 2026-09-30 ~ 10-01 | 发布收口、测试稳定性与一致性治理：0.5.0 发布后校验与版本句同步、并行负载 flaky 类根因修复与并发上限兜底、计算样式采样面扩至 Toast / Switch、设计规范 §6 可机检性分级评估、治理台账漂移消缺 | [phase-18](./archive/todo-archive-phases-18.md) |
| Phase 19 | 2026-10-02 ~ 10-07 | 设计一致性口径落地、组件文档去重与观感缺陷处置：设计规范 §6 七项口径裁定与 P1 ~ P3 装置、迁移映射去重 3 批、Tab 指示条 / 富文本下拉 / `iconOnly` 示例修复、`.session` 与 `todo` 约束 | [phase-19](./archive/todo-archive-phases-19.md) |
| Phase 20 | 2026-10-07 ~ 10-09 | 测试装置扩面、治理守卫补口与发布收口：Tabs 采样 / 焦点与禁用态扩面、文档站主题 CSS lint、直连 Reka 守卫、浮层交互 E2E、0.6.0 发布、视觉基线立项评估 | [phase-20](./archive/todo-archive-phases-20.md) |
| Phase 21 | 2026-10-10 | 下游回归机制启动、发布流统一与视觉基线落地：上游触发的下游兼容检查、`release:manual` 脚本编排、Playwright 视觉基线装置与 CI 非阻断接入 | [phase-21](./archive/todo-archive-phases-21.md) |
| Phase 22 | 2026-10-10 ~ 10-12 | 机制真实贯通、依赖安全与升级治理、治理与测试收口：下游兼容检查首次真实触发、视觉基线首跑转阻断、`source-map-js` 修复、`simple-git` 4 升级、治理守卫与文档站遗留项 | [phase-22](./archive/todo-archive-phases-22.md) |
| Phase 23 | 2026-10-12 ~ 10-13 | 机制收口与回归判别力、依赖与 CI 环境治理、治理与测试收口：视觉基线受检面扩至 30 张、下游兼容检查判别力、CI 运行器镜像检测点、归档载体二次压缩、示例外链守卫 | [phase-23](./archive/todo-archive-phases-23.md) |
| Phase 24 | 2026-10-13 ~ 11-03 | 机制远端生效与判别力收口、CI 环境治理、治理装置与规划载体补口、组件缺口补齐、图表能力：视觉基线阻断远端复核、下游兼容检查负向判别力、暂存区卫生 / 归档 RG 计数 / 取证命令守卫扩面、Row · Col / Tooltip / Menu · Breadcrumb / Alert、图表封装与主题联动 | [phase-24](./archive/todo-archive-phases-24.md) |
| Phase 25 | 2026-10-16 ~ 10-21 | 归档载体收口、移动端与响应式优化、国际化一期（5 语）、0.7.0 发布收口 | [phase-25](./archive/todo-archive-phases-25.md) |
| Phase 26 | 2026-10-22 ~ 11-03 | 1.0 发布前收尾：冻结面终审与 1.x 承诺、行为收口与准破坏性变更、发布链路就绪与 `1.0.0` 交付、下游复验、UI 可用性与示例可访问名 | [phase-26](./archive/todo-archive-phases-26.md) |
| Phase 27 | 2026-11-03 ~ 11-06 | 移动端密度轴、`Form` 组合层、迁移护航、机制收口与 CI 发布：0.7 → 1.1.0 的发布链路统一与下游复验 | [phase-27](./archive/todo-archive-phases-27.md) |
| Phase 28 | 2026-11-07 ~ 11-08 | caomei-auth 迁移反馈收口与图标体系调研：DatePicker `range`、Toast 逐语气 token、DataTable 密度 / 选择列宽度 token、图标体系调研（零实现）、`1.2.0` 发布 | [phase-28](./archive/todo-archive-phases-28.md) |
| Phase 29 | 2026-11-08 ~ 11-09 | 动效体系与图标体系落地：motion tokens 与 `data-motion`、反馈 / 浮层 / 导航动效、`CaomeiIcon` 三态与映射、Paginator 尺寸（不发布） | [phase-29](./archive/todo-archive-phases-29.md) |
| Phase 30 | 2026-11-10 ~ 11-11 | 表单 / 布局 / 选择器动效、触摸目标 P1（17 个控件 ≥24×24 命中区）、`check-stage-counts` 无阶段交叉校验（不发布） | [phase-30](./archive/todo-archive-phases-30.md) |
| Phase 31 | 2026-11-12 | 下游兼容扩容、实际安装版本断言、数据展示动效 A7、触摸目标 P2、依赖 PR 卫生（不发布） | [phase-31](./archive/todo-archive-phases-31.md) |
| Phase 32 | 2026-11-12 ~ 11-13 | 质量收口与文档站回归：`reka-ui` 2.11 适配、`with-select` 可访问名、首页 hydration 定性、demo 过渡（不发布） | [phase-32](./archive/todo-archive-phases-32.md) |
| Phase 33 | 2026-11-13 ~ 11-14 | 依赖与工具链升级、下游适配、组件增强与质量守卫；ColorPicker 色板 radiogroup、Paginator `#report`、协作测试 P0；发布 `1.3.0` | [phase-33](./archive/todo-archive-phases-33.md) |
| Phase 34 | 2026-11-14 ~ 11-15 | Tooltip 方案 C、协作测试 T3、质量门禁、DataTable `scrollable` / 全选范围、BackTop / TimePicker / Rating 等长尾组件（不发布） | [phase-34](./archive/todo-archive-phases-34.md) |

---

## Phase 35：质量与无障碍收口、DataTable 进阶、长尾 Rating（**2026-11-16 完成并归档；本阶段不发布**）

- 时间：2026-11-15 用户就[第十九轮范围评估](../design/governance/2026-11-15-next-stage-scope-evaluation-19.md) §3 裁定 D1 质量收口 + DataTable 进阶 / D2 五项质量债全取 / D3 不发布 / D4 长尾 Rating 后登记；2026-11-16 交付 **3 条主线 / 10 条原子条目**并完成阶段归档（用户指令「开始归档」）。
- 范围与授权：**质量与无障碍 5 / DataTable 进阶 2 / 长尾 3**，构成对账 **5 + 2 + 3 = 10**；本阶段**不发布**（`latest` 维持 `1.3.0`）。范围与验收口径的唯一载体见 [Phase 35 登记批次](../design/governance/2026-11-15-phase35-registration.md) §1 / §2。
- 非目标：DataTable 虚拟滚动（需新增运行时依赖）、i18n 二期 / RTL、Form 规则引擎、`useDialog`、Sidebar / ScrollPanel、破坏性 API、新增运行时依赖、自动发布、Storybook / Tailwind preset / 文档站多版本。

### M1 质量与无障碍收口（5 条）

- **M1-1 Select 展开态补 `inert`**（`7ac7e22`；记录见 [M1-1](../design/governance/2026-11-16-phase35-m1-1-select-open-inert.md)）：新增 `suppressOutside`，面板落位后给背景补 `inert`、关闭先于焦点归还回退；`select-open-zh` 恢复 `aria-hidden-focus`，三视口 E2E 与负向对照；RG R1 `Pass`（4 warning）/ R2 `Pass` / R3 `Pass`。
- **M1-2 截断配方 × 提示布局守卫**（`974d7b8`；记录见 [M1-2](../design/governance/2026-11-16-phase35-m1-2-tooltip-truncation-guard.md)）：成对夹具 + 三视口 E2E（真截断出提示 / 装得下静默）；采样差异实测后取「等价 E2E 守卫」而非扩展 `capture:styles`；RG R1 `Pass` / R2 `Pass`。
- **M1-3 记录计数一致性机检**（`501bb09`；记录见 [M1-3](../design/governance/2026-11-16-phase35-m1-3-record-count-guard.md)）：`check-governance-counts` 新增算式恒等式、新记录文件面模板与用例数归因，含负向语料；RG R1 `Reject`（4 blocker）/ R2 `Pass`。
- **M1-4 逐格提示退出开关**（`ae28ad4` / PR #62；记录见 [M1-4](../design/governance/2026-11-16-phase35-m1-4-cell-tooltip-optout.md)）：实测 60 × 8 默认单元格约 0.6–0.7 s、+480 提示实例；新增 `cellTooltips`（默认开启，关闭保留截断配方）；RG R1 / R2 `Reject` / R3 `Pass`。
- **M1-5 Menu `#icon`**（`26bbb97` / PR #63；记录见 [M1-5](../design/governance/2026-11-16-phase35-m1-5-menu-icon-slot.md)）：普通项与子菜单触发器新增前置图标插槽，`--caomei-menu-item-gap` 恢复作用于「图标 + 文本」；RG R1 `Reject` / R2 `Pass`。

### M2 DataTable 进阶（2 条）

- **M2-1 列可见性与列顺序**（`28ba5b6` / PR #64；记录见 [M2-1](../design/governance/2026-11-16-phase35-m2-1-column-visibility-order.md)）：受控 `columnVisibility` / `columnOrder`，隐藏列在表头 / 表体 / 空态 `colspan` / 冻结偏移同步，展开列禁止隐藏；RG R1 / R2 `Reject` / R3 `Pass`。
- **M2-2 受控列宽**（`0aa3c66` / PR #65；记录见 [M2-2](../design/governance/2026-11-16-phase35-m2-2-column-sizing.md)）：`columnSizing` 优先于列定义 `width`，冻结偏移、`min-width` 与截断上限同源；拖拽与持久化归使用方；RG R1 / R2 `Reject` / R3 `Pass`。

### M3 长尾 Rating（3 条）

- **M3-1 实现与导出**（`ad2ffbf` / PR #66；记录见 [M3-1](../design/governance/2026-11-16-phase35-m3-1-rating.md)）：封装 Reka `RatingRoot` / `RatingItem`；整星 / 半星、只读 / 禁用、`max` / `size` / `label` / `clearable`；半星按 primitive 步进裁切、着色只取「最右一格」；RG R1 `Reject`（3 blocker）/ R2 `Pass`。
- **M3-2 10 语 locale 与台账**（`042cf1a` / PR #67；记录见 [M3-2](../design/governance/2026-11-16-phase35-m3-2-rating-locale.md)）：新增 `rating` 命名空间（区域名 / 只读名 / step 数值模板），10 语同批；台账 31 命名空间 / 32 消费组件；RG R1 `Pass`。
- **M3-3 文档、示例、E2E 与视觉基线**（`ffe3f08` / PR #68；记录见 [M3-3](../design/governance/2026-11-16-phase35-m3-3-rating-docs-e2e.md)）：中英组件页与示例、侧栏 / 总览 / §5 / §11 登记、三视口 E2E（点击 / 键盘 / 只读 / 半星）、亮暗视觉基线；RG R1 `Reject`（1 blocker）/ R2 `Pass`。

### 阶段总结

- **3 条主线 / 10 条原子条目全部交付**；本阶段不发布，`latest` 维持 `1.3.0`。
- **提交对账**：窗口 `git log --oneline --no-merges bf67d19..8e5dc0d` → **12**（登记 / 评估、十条条目交付与 PR 合并、规划状态回填）。
- **质量门**：`pnpm verify` `exit 0`；`master` 在 `8e5dc0d` 上 CI（Test / Visual / CodeQL / Security Alerts / Deploy Pages）全绿；三视口 E2E（Select inert、DataTable 列能力与整格提示、Rating）与视觉全量（含新增 rating 亮暗基线）通过；`governance:check` / `docs:check` 全绿。
- **长期任务**：第 **39** 轮门槛复核（2026-11-16，Phase 35 收口轮）——待执行批次 **0 项**；条件触发 **1 项维持**（表单控件公共 props 契约）；已判定不纳入 5 项维持；`capture:styles` 399 项 0 差异。
- **wisdom 蒸馏**：`pnpm distill:wisdom --check` → **16 条活跃**（< 阈值 20，不蒸馏）。

### 回扫口径（三段式）

- **机检面**：`check:governance-records` / `check:planning-numbers` / `check:stage-counts`（无进行中阶段分支）/ `check:archive-rg-counts` / `check:governance-counts` / `check:design` / `docs:check` 全绿（`docs:check:line-count` 主窗口值见文首口径）。
- **人工面**：`todo.md`（清空阶段状态句与条目表）/ `roadmap.md`（§1 当前态、Phase 35 行与 §5 深度归档范围）/ `todo-archive.md`（本块入窗、Phase 28 ~ 30 迁出、索引行与口径句）/ `archive/index.md`（三份新文件与压缩记录）/ `recurring.md`（第 39 轮）逐处核过；`.session/current-task.yaml`、`.session/runtime-state.json` 同批切到「无进行中阶段」。
- **未处理面**：历史记录中指向 `docs/plan/todo.md` 的时点陈述按既有边界不回改；本批无新增失效指针（机检 0 命中，人工面未发现需改指者）。

### 遗留与后续候选

- **浮层隔离扩面（观察项，非条目）**：MultiSelect / AutoComplete / DatePicker 等经 Reka 打开浮层的组件仍只有 `aria-hidden`；是否扩为全库隔离属范围决策（见 [M1-1 记录](../design/governance/2026-11-16-phase35-m1-1-select-open-inert.md) §5）。
- **DataTable 列宽拖拽手柄 / 虚拟滚动**：本阶段取受控契约，拖拽交互与虚拟滚动（需新增依赖）维持候选。
- 其余条件触发候选见 [Backlog](./backlog.md)；启动需用户明确授权。

## Phase 36：浮层隔离扩面、DataTable 列宽拖拽与虚拟滚动评估、质量治理、选择器空值诊断（**2026-11-18 完成并归档；本阶段不发布**）

- 时间：2026-11-17 用户就[第二十轮范围评估](../design/governance/2026-11-16-next-stage-scope-evaluation-20.md) §4 裁定 D0 A / D1 全部浮层 / D2 拖拽 + 评估 / D3 不发布 / D4 `deepmerge` 维持接受登记后登记；同日追加 M1-5 / M2-3，再经插队追加 M4-1 / M4-2；2026-11-18 交付 **4 条主线 / 12 条原子条目**并完成阶段归档（用户指令「开始归档」）。
- 范围与授权：**无障碍扩面 5 / DataTable 交互 3 / 质量治理 2 / 选择器空值诊断 2**，构成对账 **5 + 3 + 2 + 2 = 12**；本阶段**不发布**（`latest` 维持 `1.3.0`）。范围与验收口径的唯一载体见 [Phase 36 登记批次](../design/governance/2026-11-17-phase36-registration.md) §1 / §2。
- 非目标：不新增运行时依赖（虚拟滚动只评估）、不改变 `''` 作为「未选中」的模型语义、i18n 二期 / RTL、Form 规则引擎、`useDialog`、Sidebar / ScrollPanel、破坏性 API、自动发布。

### M1 无障碍扩面（5 条）

- **M1-1 隔离工具多浮层边界**（`9146fe4`；记录见 [M1-1](../design/governance/2026-11-17-phase36-m1-1-multi-overlay-isolation.md)）：`suppressOutside` 改为活动层登记 + 每次重算，活动层与写入记录按 `body` 分组，先关者不提前解除、跨文档互不影响；RG R1 `Reject`（跨文档误清）/ R2 `Reject`（释放分支整片隔离）/ R3 `Pass`。
- **M1-2 MultiSelect / AutoComplete 打开态补 `inert`**（`5c720fc` / `a77b7d9`；记录见 [M1-2](../design/governance/2026-11-17-phase36-m1-2-combobox-open-inert.md)）：多根隔离（面板 + 字段），关闭同步回退，Tab / Shift+Tab 交接焦点、Escape 交还输入框；隔离工具同时配对 `aria-hidden`；RG R1 `Reject`（字段被隔离致输入失效）/ R2 `Reject`（Tab 焦点落 body）/ R3 `Pass`。
- **M1-3 DatePicker / ColorPicker 打开态补 `inert`**（`bf55466`；记录见 [M1-3](../design/governance/2026-11-17-phase36-m1-3-date-color-picker-inert.md)）：面板 + 触发器双根，`inline` 形态不隔离，模态内打开保留触发器祖先链；RG R1 `Pass`（5 warning / 4 suggest 同批修）。
- **M1-4 全库浮层回归与边界记录**（`eb2c5fd`；记录见 [M1-4](../design/governance/2026-11-18-phase36-m1-4-overlay-regression.md)）：逐组件判定「已隔离 / 本批补 / 不采用」并给出理由，枚举锚点对齐 `check-overlay-z-index` 受检集合；RG R1 `Reject`（漏 `ConfirmDialog` / `Image` 预览）/ R2 `Pass`。
- **M1-5 DropdownMenu / Popover 打开态补 `inert`**（`e2fab21`；记录见 [M1-5](../design/governance/2026-11-17-phase36-m1-5-dropdown-popover-inert.md)）：抽出 `useOpenStateIsolation`（`data-state` 驱动）+ 触发器根 provide/inject，`forceMount` 可隔离；RG R1 `Reject`（2 blocker：触发器被隔离打红 `overlay-motion`、`forceMount` 不隔离）/ R2 `Pass`。

### M2 DataTable 交互（3 条）

- **M2-1 列宽拖拽手柄**（`ae61ba2`；记录见 [M2-1](../design/governance/2026-11-18-phase36-m2-1-column-resize-handle.md)）：新增 `resizableColumns`（默认关闭），指针拖拽 / 方向键 ±8px / 双击复位，受控经 `update:columnSizing`；选择列与展开列无手柄；RG R1 `Reject`（3 blocker：基准宽度、冻结列表述、无指针证据）/ R2 `Pass`。
- **M2-2 虚拟滚动可行性评估**（`1e2664a`；记录见 [M2-2](../design/governance/2026-11-17-phase36-m2-2-virtual-scroll-evaluation.md)）：候选体积与许可证、SSR 回退、动态行高、六类兼容风险与触发条件；结论「可行（有条件）」，本阶段不实现、不加依赖；RG R1 `Pass`（4 warning / 2 suggest 同批修）。
- **M2-3 列宽持久化示例与契约说明**（`3d1418b`；记录见 [M2-3](../design/governance/2026-11-17-phase36-m2-3-column-sizing-persist-example.md)）：中英 `column-sizing-persist.vue`（读取 / 保存 / 清除 / 越界回退）+ 组件页说明；RG R1 `Reject`（`.demo-stack` 无样式）/ R2 `Pass`。

### M3 质量治理（2 条）

- **M3-1 Rating 文档站 a11y 抽检**（`aa36cf8`；记录见 [M3-1](../design/governance/2026-11-17-phase36-m3-1-rating-docs-axe.md)）：中英 Rating 页入矩阵（就绪选择器 + 实测下界）；RG R1 `Reject`（批次夹带、§17 计数漂移）/ R2 `Pass`。
- **M3-2 依赖告警复核**（`b9d4bf5`；记录见 [M3-2](../design/governance/2026-11-17-phase36-m3-2-dependency-alert-review.md)）：按分页口径实测 open 0 / fixed 70 / auto_dismissed 1，`deepmerge` 四态无记录（成因未取证）、dev-only 链路；RG R1 `Reject`（分页截断）/ R2 `Reject`（回链与索引）/ R3 `Pass`。

### M4 选择器空值诊断（2 条）

- **M4-1 空串选项值不再透传**（`e9b88b9`；记录见[调研与处置](../design/governance/2026-11-17-select-empty-option-value-evaluation.md)）：Select / MultiSelect 归一化丢弃、AutoComplete 新增边界，开发期告警带组件标识与序号，模型侧 `''` 仍为未选中，`SelectButton` 补反例；RG 以[调研与处置](../design/governance/2026-11-17-select-empty-option-value-evaluation.md) §7 的 R1 `Pass`（3 warning / 6 suggest，同批关闭）为准，实施侧另经 R1 / R2 两轮复审。
- **M4-2 空串契约声明**（`b710597`；同上）：中英 Select / MultiSelect 组件页与设计规范 §7 补契约、`SelectButton` 例外；RG 以调研记录 §7 的 R1 `Pass`（3 warning / 6 suggest，同批关闭）为准，实施侧另经 R1 → R2 → R3 三轮复审。

### 阶段总结

- **4 条主线 / 12 条原子条目全部交付**；本阶段不发布，`latest` 维持 `1.3.0`。
- **提交对账**：窗口 `git log --oneline --no-merges 4f57ce6^..ae61ba2` → **16**（登记 / 追加 / 插队、十二条条目交付与规划状态回填）。
- **质量门**：`pnpm verify` exit 0（见[归档批次记录](../design/governance/2026-11-18-phase36-archive.md) §3.1）；`master` 在 `ae61ba2` 上 CI（Test / CodeQL / Security Alerts / Deploy Pages）全绿；浮层三视口 E2E 57 条、列宽拖拽 E2E 3 条、`overlay-motion` 39 条通过；文档站 axe 打开态矩阵 23 条目 / 22 路径全绿。
- **长期任务**：第 **40** 轮门槛复核（2026-11-18，Phase 36 收口轮）——见 [长期任务](./recurring.md)。
- **wisdom 蒸馏**：`pnpm distill:wisdom --check` → **16 条活跃**（< 阈值 20，不蒸馏）。

### 回扫口径（三段式）

- **机检面**：`check:governance-records` / `check:planning-numbers` / `check:stage-counts`（无进行中阶段分支）/ `check:archive-rg-counts` / `check:governance-counts` / `check:design` / `docs:check` 全绿。
- **人工面**：`todo.md`（清空阶段状态句与条目表）/ `roadmap.md`（§1 当前态与 Phase 36 行）/ `todo-archive.md`（本块入窗）/ `recurring.md`（第 40 轮）/ `docs/design/governance/index.md`（归档记录行）逐处核过；`.session/current-task.yaml`、`.session/runtime-state.json` 同批切到「无进行中阶段」。
- **未处理面**：历史记录中指向 `docs/plan/todo.md` 的时点陈述按既有边界不回改；本批无新增失效指针。

### 遗留与后续候选

- **虚拟滚动**：评估结论「可行（有条件）」，触发条件 = 单页 > 200 行（经验值，立项前须实测校准）或用户裁定；在此之前不新增运行时依赖。
- **列宽拖拽的残余**：冻结列手柄吸边的像素级几何未单独断言；最小宽 48px / 步进 8px 不可配置，无 resize 结束事件。
- **浮层隔离的残余**：DropdownMenu 无独立 E2E 夹具锚点；页面级（非模态）Popover 的三视口 Tab 用例待补；`pointerdown` 解除隔离在 `disableOutsidePointerEvents` 下的窗口已记录。
- 其余条件触发候选见 [Backlog](./backlog.md)；启动需用户明确授权。

## Phase 37：质量收口、选择器空值 opt-in、迁移口径与 Rating 表单集成（**2026-11-19 完成并归档；本阶段不发布**）

- 时间：2026-11-18 用户就[第二十一轮范围评估](../design/governance/2026-11-18-next-stage-scope-evaluation-21.md) §4 裁定 D0 ① / D1 ① / D2 ① / D3 ① / D4 ③ 后登记；2026-11-19 交付 **4 条主线 / 9 条原子条目**并完成阶段归档（用户指令「开始归档」）。
- 范围与授权：**质量收口 3 / 选择器空值 opt-in 3 / 迁移口径 1 / Rating 表单集成 2**，构成对账 **3 + 3 + 1 + 2 = 9**；本阶段**不发布**（`latest` 维持 `1.3.0`）。范围与验收口径的唯一载体见 [Phase 37 登记批次](../design/governance/2026-11-18-phase37-registration.md) §1 / §2。
- 非目标：不新增运行时依赖（虚拟滚动维持「条件触发」）；不做 `emptyValues` 多值形态、i18n 二期 / RTL、`useDialog`、Sidebar / ScrollPanel、Form rules 引擎、破坏性 API、自动发布。

### M1 质量收口（3 条）

- **M1-1 列宽拖拽残余补齐**（`f827773`；记录见 [M1-1](../design/governance/2026-11-18-phase37-m1-1-column-resize-residual.md)）：新增 `columnResizeEnd`（`{ key, width }`，键盘 / 拖拽结束 / 复位三触发点）与 `columnResizeMinWidth` / `columnResizeStep`（默认 48 / 8），冻结列手柄吸边补像素级断言；RG R1 分区 B `Reject`（1B/2W/4S，分区 A Pass）→ R2 `standard` `Pass`。
- **M1-2 浮层隔离残余补齐**（`555a023`；记录见 [M1-2](../design/governance/2026-11-18-phase37-m1-2-overlay-isolation-residual.md)）：实测「锁定背景」Popover 在 `disableOutsidePointerEvents` 下仍被外部点击关闭，组件补外部关闭拦截；新增页面级 DropdownMenu / Popover 三视口用例；RG R1 两分区 `Reject`（分区 A 1B/4W/5S、分区 B 1B/5W/3S）→ R2 `standard` `Pass`。
- **M1-3 隔离接线下沉**（`4e95bd7`；记录见 [M1-3](../design/governance/2026-11-19-phase37-m1-3-isolation-wiring.md)）：五组件统一 `useOpenStateIsolation`，新增可选 `open` 触发源（关闭同步回退、打开 portal 落位后补隔离），删除逐份接线；RG R1 `standard` `Pass`（W1 修复后 R2 `quick` 复核 `Pass`）。

### M2 选择器空值 opt-in（3 条）

- **M2-1 `allowEmptyValue` 契约设计**（`1e1cdbc`；记录见 [M2-1](../design/governance/2026-11-19-phase37-m2-1-allow-empty-value-design.md)）：默认 `false`；开启后空串为真实选项值、经内部私有 token 承载；「未选择」三态（`null` / `[]` / `undefined`）与 `hasValue` / `data-filled` / `showClear` 口径；RG R1 ~ R3 `Reject`（同一守卫落点连续复发）→ R4 `quick` `Pass`（调用方显式追加预算，复发项转为三条必查负向单测）。
- **M2-2 实现**（`54e0d86`，PR #69；记录见 [M2-2](../design/governance/2026-11-19-phase37-m2-2-allow-empty-value-impl.md)）：三组件开关、token 双向映射、`name` 自持隐藏输入、`AutoComplete` 写回路径逐条收敛；RG R1 `Reject`（3 blocker / 7 warning / 4 suggest）→ R2 `standard` `Pass`。
- **M2-3 测试与文档**（`6caee64`；记录见 [M2-3](../design/governance/2026-11-19-phase37-m2-3-allow-empty-value-tests-docs.md)）：三组件 opt-in 正向与负向单测；中英六页把「空串不渲染」改写为「默认拒绝 + opt-in 放行」；`design-spec.md` §7 同步；RG R1 `Reject`（1 blocker / 2 warning / 4 suggest）→ R2 `quick` `Pass`。

### M3 迁移口径（1 条）

- **M3-1 哨兵与 PrimeVue 陷阱统一**（`41d2372`；记录见 [M3-1](../design/governance/2026-11-19-phase37-m3-1-sentinel-migration-traps.md)）：迁移指南「常见陷阱」补「选项空串值」一行并只回链设计规范 §7；复算 `value: 'all'` 六处无漂移、无其它写法；RG R1 `quick` `Pass`（0 blocker / 0 warning / 2 suggest）。

### M4 Rating 表单集成（2 条）

- **M4-1 字段契约接入**（`f46d8ae`，PR #70；记录见 [M4-1](../design/governance/2026-11-19-phase37-m4-1-rating-field-contract.md)）：`RatingProps` 继承 `FieldStateProps` + `FieldIdentityProps`，`id` / `name` / `aria-invalid` 落 `role="radiogroup"` 根，可访问名三级取值，`name` 经 RadioGroup 提交分值；RG R1 `standard` `Pass`（0 blocker / 2 warning / 3 suggest）。
- **M4-2 文档与示例**（`1ddceec`，PR #70；记录见 [M4-2](../design/governance/2026-11-19-phase37-m4-2-rating-form-docs.md)）：中英 Rating 页补「表单集成」节与页面内示例；Form 页字段绑定表 12 → 13 并纳入 Rating；RG R1 `Reject`（2 blocker / 3 warning / 1 suggest）→ R2 `quick` `Pass`。

### 阶段总结

- **4 条主线 / 9 条原子条目全部交付**；本阶段不发布，`latest` 维持 `1.3.0`。
- **提交对账**：窗口 `git log --oneline --no-merges 011cd95^..b6bf1b4` → **13**（登记、九条条目交付与规划状态回填）。
- **质量门**：`pnpm verify` 全绿（2026-11-19，见[归档批次记录](../design/governance/2026-11-19-phase37-archive.md) §3.1）；`pnpm capture:styles` **399 项 0 差异**；`master` 在 PR #69 / #70 合并与直推后 CI（Quality / Test & Build / Visual / CodeQL / Security Alerts / Deploy Pages）全绿。
- **长期任务**：第 **41** 轮门槛复核（2026-11-19，Phase 37 收口轮）——见 [长期任务](./recurring.md)。
- **wisdom 蒸馏**：`pnpm distill:wisdom --check` → **16 条活跃**（< 阈值 20，不蒸馏）。

### 回扫口径（三段式）

- **机检面**：`check:governance-records` / `check:planning-numbers` / `check:stage-counts`（无进行中阶段分支）/ `check:archive-rg-counts` / `check:governance-counts` / `check:design` / `docs:check` 全绿。
- **人工面**：`todo.md`（清空阶段状态句与条目表）/ `roadmap.md`（§1 当前态与 Phase 37 行）/ `todo-archive.md`（本块入窗）/ `recurring.md`（第 41 轮）/ `docs/design/governance/index.md`（归档记录行）逐处核过；`.session/current-task.yaml`、`.session/runtime-state.json` 同批切到「无进行中阶段」。
- **未处理面**：历史记录中指向 `docs/plan/todo.md` 的时点陈述按既有边界不回改；本批无新增失效指针。

### 遗留与后续候选

- **空值 opt-in 的下游落地**：`allowEmptyValue` 已交付，但 `MultiSelect` 在 opt-in 下原生 `required` 校验不生效（已文档化），需要时另立条目设计提交前校验方案。
- **虚拟滚动**：维持「可行（有条件）」，触发条件 = 单页 > 200 行（需实测校准）或用户裁定。
- **隔离接线**：`PopoverContent` / `DropdownMenuContent` 仍以 `data-state` 驱动，未纳入 `open` 触发源；`ColorPicker` inline 形态不隔离的口径见 M1-3 记录。
- 其余条件触发候选见 [Backlog](./backlog.md)；启动需用户明确授权。

## Phase 38：移动端体验（基础层、移动壳与操作 / 空态）（**2026-11-20 完成并归档；本阶段不发布**）

- 时间：2026-11-20 用户就[第二十二轮范围评估](../design/governance/2026-11-20-mobile-experience-evaluation.md) §6 裁定 D0 ① / D1 ① / D2 ① / D3 ① / D4 ② 后登记；同日交付 **4 条主线 / 11 条原子条目**并完成阶段归档（用户指令「开始归档」）。
- 范围与授权：**基础层 2 / 移动壳 3 / 操作与空态 3 / 口径与验收 3**，构成对账 **2 + 3 + 3 + 3 = 11**（原登记 10 条，执行期追加 M4-3）；本阶段**不发布**（`latest` 维持 `1.3.0`）。范围与验收口径的唯一载体见 [Phase 38 登记批次](../design/governance/2026-11-20-phase38-registration.md) §1 / §2。
- 非目标：移动端独立包、手势、JS 视口分支、`DataTable` 卡片化、视觉尺寸放大、vue-router 耦合、Picker / NavBar / Search 组件化、全量矩阵宽屏化、宽屏视觉基线、`xl` 断点、i18n 二期 / RTL、新增运行时依赖、自动发布。

### M1 基础层（2 条）

- **M1-1 安全区 token 与工具类**（`89f0fc6`；记录见 [M1-1](../design/governance/2026-11-20-phase38-m1-1-safe-area.md)）：四个 `--caomei-safe-area-*` 默认 `env()`，六个工具类写同侧 `padding`；中英指南补「安全区」节；RG R1 `standard` `Pass` → R2 `quick` `Pass`。
- **M1-2 固定定位件接入与 `dvh` 回退**（`d1f0e4d`；记录见 [M1-2](../design/governance/2026-11-20-phase38-m1-2-fixed-overlays.md)）：Drawer / Dialog / ConfirmDialog / Toast / BackTop / Image preview 接入安全区与 `dvh`；RG R1 `standard` `Pass` → R2 `quick` `Pass`。

### M2 移动壳（3 条）

- **M2-1 Cell / CellGroup**（`a7e3159` + `2097a24`）：行语义、`div` / `button` / `a` 宿主、前后插槽、分组标题与分隔线；中英页面与示例同批。
- **M2-2 Tabbar / TabbarItem**（`6f91402` + `50dbcc7`）：`v-model`、`aria-current` 单值、图标 / 角标 / 禁用、安全区与可选吸底；不接 vue-router。
- **M2-3 M2 的 10 语、台账与文档**（`0710963` + `cb8d03b` + `6052436`）：`tabbar.label` 纳入 10 语；台账、侧栏、总览与 Tier 2 清单同步。

### M3 操作与空态（3 条）

- **M3-1 ActionSheet**（`0ecd371` + `9f7dd1d`）：以 Drawer 底部抽屉组合，支持分组 / 危险项 / 取消项 / 选择后关闭 / 焦点回退 / 内容滚动；Drawer 增加可选 `label` 可访问名回退。
- **M3-2 Empty**（`e203b70` + `ef6d7c4`）：图标 / 图片、标题、说明、操作区、尺寸档与 `as` 语义标签；与 DataView 空态分工单点声明。
- **M3-3 M3 的 10 语、台账与文档**（`0710963` + `cb8d03b` + `6052436`）：`actionSheet.label` / `cancel` 纳入 10 语；台账、DataView 关系与计数回扫同批。

### M4 口径与验收（3 条）

- **M4-1 移动端适配指南**（`0115a33`）：中英指南新增 bottom sheet、吸顶、固定底部操作条、软键盘、五条下限与 44px 达成路径。
- **M4-2 44px 政策与回归扩面**（`47ff782` + `d582e26` + `b71b655`）：维持 24 下限，44 由 `size="lg"` / `data-density="touch"` 达成；移动壳常驻 E2E 与相邻目标间距负向对照；四组新组件进入矩阵受检面。
- **M4-3 验收视口扩面**（`b71b655` + `7218e98`）：定向档 2 → 6（360 / 414 / 1536 / 1920），矩阵守卫改为单点清单；极窄探针修复夹具最小内容宽导致的布局视口失真。

### 阶段总结

- **4 条主线 / 11 条原子条目全部交付**；本阶段不发布，`latest` 维持 `1.3.0`。
- **提交对账**：窗口 `git log --oneline --no-merges d1f0e4d..291499e` → **18**（9 条实现 / 测试 / 文档与规划状态回填）；另含归档提交 1 个。
- **质量门**：`pnpm verify` 全绿；全量单测 **182 文件 / 3553 例**；E2E `mobile-shell` **27/27**、`responsive` 9 档 **186 passed / 12 skipped**；`capture:styles` **399 项 0 差异**；`test:visual` **48/48**。
- **Review Gate**：三区分审 R1 `standard`（运行时 Pass / 文档 Reject / 测试 Reject）→ R2 delta（文档 Reject）→ R3 `quick` `Pass`；5 个 blocker 与全部可收口 warning 同批关闭，详见[交付记录](../design/governance/2026-11-20-phase38-m2-m4-mobile-shell-and-acceptance.md) §3。
- **长期任务**：第 **42** 轮门槛复核（2026-11-20，Phase 38 收口轮）——见 [长期任务](./recurring.md)。
- **wisdom 蒸馏**：`pnpm distill:wisdom --check` → **17 条活跃**（< 阈值 20，不蒸馏）。

### 回扫口径（三段式）

- **机检面**：`check:governance-records` / `check:planning-numbers` / `check:stage-counts`（无进行中阶段分支）/ `check:archive-rg-counts` / `check:governance-counts` / `check:design` / `docs:check` / `governance:check` 全绿。
- **人工面**：`todo.md`（清空阶段状态句与条目表）/ `roadmap.md`（§1 当前态、Phase 38 行与 §5）/ `todo-archive.md`（本块入窗与主窗口口径句）/ `archive/index.md`（phase-32 行与迁出时点）/ `recurring.md`（第 42 轮与触发义务句）/ `governance/index.md`（归档记录行）逐处核过；`.session` 两份文件同批切到「无进行中阶段」。
- **未处理面**：历史记录中指向 `docs/plan/todo.md` 的时点陈述按既有边界不回改；本批无新增失效指针。

### 遗留与后续候选

- **真实设备验收**：iOS safe-area / 软键盘与 `dvh` 动态差异无自动化条目，随真机验收执行。
- **既有 E2E 装置失败**：back-top、overlay-stacking、navigation-motion、selector-motion、data-table-scroll 已在干净 HEAD 复现，登记 [Backlog §1.6](./backlog.md)，待用户裁定是否排期。
- **宽屏视觉基线 / `xl` 断点**：维持 [Backlog §1.6](./backlog.md) 候选，按触发条件启动。

## Phase 39：P0 组件缺口、文档站设备预览与质量收口（**2026-11-21 完成并归档；本阶段不发布**）

- 时间：2026-11-21 用户就[第二十三轮范围评估](../design/governance/2026-11-20-next-stage-scope-evaluation-23.md) §4 裁定 D0 ③ / D1 四件全取 / D2 仅 P1 / D3 仅 5 例 / D4 不发布后登记；同日交付 **7 条主线 / 14 条原子条目**并完成阶段归档（用户指令「开始归档」）。
- 范围与授权：**InputOtp 2 / Popconfirm 2 / Result 2 / Descriptions 3 / 治理收口 1 / 文档站设备预览 2 / E2E 质量收口 2**，构成对账 **2 + 2 + 2 + 3 + 1 + 2 + 2 = 14**；本阶段**不发布**（`latest` 维持 `1.3.0`）。范围与验收口径的唯一载体见 [Phase 39 登记批次](../design/governance/2026-11-21-phase39-registration.md) §1 / §2；逐条交付对账见 [Phase 39 交付记录](../design/governance/2026-11-21-phase39-delivery.md)。
- 非目标：不发布、不进入 `1.4.0`、不做 P2 单 Demo 抽屉、不做宽屏视觉基线 / `xl` 断点、不做 Form rules / 虚拟滚动 / i18n 二期 / 移动端第二波 / P1 高级组件、不新增运行时依赖、不做破坏性 API、不自动发布。

### M1 InputOtp（2 条）

- **M1-1 实现与测试**（`c2c6139`）：Reka `PinInputRoot` 封装；字符串 `v-model`、`length`、数字 / 字母数字、粘贴分发、`autocomplete="one-time-code"`、`inputmode`、`complete`、状态与尺寸；单测 + 浏览器 E2E（含 axe）。RG `quick` `Pass`。
- **M1-2 文档 / 示例 / 10 语台账**（`1e8a45af`）：中英组件页、basic / states 示例、§11 / 侧栏 / 总览 / 设计清单 / 画廊与 `inputOtp.cellLabel` 10 语台账；示例不打印验证码。RG `quick` `Pass`。

### M2 Popconfirm（2 条）

- **M2-1 实现与测试**（`38941fe5`）：Popover + Button 组合；标题 / 描述、危险语气、加载 / 禁用、受控 `open`、`placement`、Enter / Esc / 外部点击与焦点归还；`PopoverContent` 增加 `openAutoFocus` 事件供复合层接管焦点。RG `quick` `Pass`。
- **M2-2 文档 / 示例 / 迁移差异**（`04315968`）：中英组件页、basic / async 示例、与 `ConfirmDialog` 的分工单点声明、PrimeVue `ConfirmPopup` 迁移差异。RG `quick` `Pass`。

### M3 Result（2 条）

- **M3-1 实现与测试**（`3a003cc2`）：`success` / `info` / `warning` / `danger` / `403` / `404` / `500`；图标 / 标题 / 描述 / `#extra`；尺寸档与 `role="status"` 可关闭 live region；单测 + 桌面 / 移动 E2E。RG `quick` `Pass`。
- **M3-2 文档 / 示例 / 状态语义**（`eb0de886`）：中英组件页、basic / statuses 示例；与 `Empty` / `Message` / `Alert` 的边界单点声明。RG `quick` `Pass`。

### M4 Descriptions（3 条）

- **M4-1 实现与测试**（`fb94a90c`）：`CaomeiDescriptions` + `CaomeiDescriptionsItem`；`columns` / `bordered` / `labelWidth` / `span` / `size` / 水平垂直布局；`dl` / `dt` / `dd` 语义与 span 夹取。RG `quick` `Pass`。
- **M4-2 响应式列数与长内容**（`d4f13f7e`）：320 / 768 / 1280 列数、长内容折行、跨列边界、bordered / vertical 与暗色；`capture:styles` 0 差异。RG `quick` `Pass`。
- **M4-3 文档 / 示例 / 台账**（`fe607752`）：中英组件页、basic / layout 示例、与 `DataTable` 的边界、§11 / 侧栏 / 总览 / 设计清单 / 画廊同步。RG `quick` `Pass`。

### M5 治理收口（1 条）

- **M5-1 阶段进度表机检**（`0116ab4b`）：新增 `check-stage-progress`，校验 6 列进度表的行数、逐主线计数、状态映射、提交 / 审计 / 容量可定位与归档前置；10 类失败码、14 条单测与 CLI 负向验证，接入 `governance:check`。RG `standard` `Pass`。

### M6 文档站设备预览（2 条）

- **M6-1 iframe 整页预览**（`13284b5b`）：抽屉内同源 iframe、390 / 768 / 1024 / 1280、亮暗只写 iframe、递归抑制；一次性探针验证同源 / 媒体查询 / 暗色 / 主站不跳转。RG `standard` `Pass`。
- **M6-2 路由 / 入口 / 文档**（`a0f79fc4`）：导航栏入口、中英《移动端与响应式》新增「设备预览」节，说明 `device-preview=1`、同源主题同步与适用面。RG `quick` `Pass`。

### M7 E2E 质量收口（2 条）

- **M7-1 5 例逐例修复与负向对照**（`6f08437d`）：BackTop 夹具遮挡（视觉基线按钮位移）、SplitButton chevron scoped 选择器改为 `:deep`、DatePicker / 浮层清理、移动端冻结展开列；`overlay-stacking` 后代自证复跑；5 spec × 3 project **81 passed**。RG `standard` `Pass`。
- **M7-2 周回归稳定性与记录**（`35e81957`）：全量 E2E 首跑 **1119 passed / 12 skipped / 1 failed**（`safe-area-fixed` BackTop 偏移），改视觉基线为 `transform` 后复跑 **30 passed**；记录根因、修复点与并行 worker 采样观察项。RG `standard` `Pass`。
- **集成收口**（`630faa92`）：Nuxt 组件清单与 a11y 受检面登记 4 个新组件、locale 基准计数与设计守卫 token / `:where()` 修正。RG `standard` `Pass`。

### 阶段总结

- **7 条主线 / 14 条原子条目全部交付**；本阶段不发布，`latest` 维持 `1.3.0`。
- **提交对账**：执行窗口 `git log --oneline --no-merges 6e11fb1..630faa92` → **15**（14 条交付与集成收口；归档提交另计 1 个）。
- **质量门**：`pnpm verify` 全绿；全量单测 **189 文件 / 3619 例**；目标 E2E **81 passed**；全量 E2E 首跑 **1119 passed / 12 skipped**（唯一失败修复后复跑 **30 passed**）；`capture:styles` **399 项 0 差异**；`docs:check` / `governance:check` 全绿。
- **长期任务**：第 **43** 轮门槛复核（2026-11-21，Phase 39 收口轮）——见 [长期任务](./recurring.md)。
- **wisdom 蒸馏**：`pnpm distill:wisdom --check` → **19 条活跃**（< 阈值 20，不蒸馏）；`check:distill-archive` 通过。

### 回扫口径（三段式）

- **机检面**：`check:governance-records` / `check:planning-numbers` / `check:stage-counts`（无进行中阶段分支）/ `check:stage-progress`（跳过）/ `check:archive-rg-counts` / `check:governance-counts` / `check:design` / `docs:check` / `governance:check` 全绿。
- **人工面**：`todo.md`（清空阶段状态句 / 条目表 / 进度表）/ `roadmap.md`（§1 当前态、Phase 39 行与 §5）/ `todo-archive.md`（本块入窗、Phase 33 迁出、主窗口口径句与行数）/ `archive/index.md`（phase-33 行、文件表与迁出时点）/ `recurring.md`（第 43 轮与触发义务句）/ `governance/index.md`（交付记录与归档记录两行）逐处核过；`.session` 两份文件同批切到「无进行中阶段」。
- **未处理面**：历史治理记录中指向 `docs/plan/todo.md` 的时点陈述按既有边界不回改；本批无新增失效指针。

### 遗留与后续候选

- **真实设备验收**：OTP 短信自动填充 / 输入法、设备预览的 iOS 地址栏 `dvh` 与触摸滚动无自动化条目，随真机验收执行。
- **Popconfirm 可访问名**：dialog 名称来自触发器（Reka 内部绑定），标题名未接管；如需改为标题名须调整 `PopoverContent` 的 ARIA 接线。
- **并行 worker 动效采样**：`navigation-motion` / `selector-motion` 在并行 worker 下存在采样竞争；CI 固定 `workers=1`，不以并行结果作门禁结论。
- 其余条件触发候选见 [Backlog](./backlog.md)；启动需用户明确授权。

## Phase 40：国际化收口、P1 组件广度与 `1.4.0` 发布（**2026-11-21 完成并归档；已发布 `1.4.0`**）

- 时间：2026-11-21 用户就[第二十四轮范围评估](../design/governance/2026-11-21-next-stage-scope-evaluation-24.md) §4 裁定 D0 ③ / D1 ④ / D2 ① / D3 ① 后登记；同日交付 **4 条主线 / 15 条原子条目**并完成阶段归档（用户指令「开始归档」）。
- 范围与授权：国际化收口 **4** / P1 组件广度 **6** / 发布收口 **3** / 规划载体收口 **2**，构成对账 **4 + 6 + 3 + 2 = 15**；阶段末发布 `1.4.0`。范围与验收口径的唯一载体见 [Phase 40 登记批次](../design/governance/2026-11-21-phase40-registration.md) §1 / §2；发布与下游复验见 [M3-2 / M3-3 记录](../design/governance/2026-11-21-phase40-m3-2-m3-3-release-and-downstream.md)。
- 非目标：Form 校验能力、国际化二期 7 语、Tree / TreeSelect、RTL、DataTable 虚拟滚动、移动端第二波、宽屏视觉基线 / `xl` 断点、P2 高级组件、P2 单 Demo 抽屉、依赖与工具链升级、新增运行时依赖、破坏性 API、自动发布、2.0。

### M1 国际化收口（4 条）

- **M1-1 日期 / 时间 locale 跟随**（`11a43b15`）：`DatePicker` / `Calendar` 的 `locale` 缺省消费 `useLocaleCode()`，`weekdayFormat` / `hourFormat` 按语言惯例推导；显式 prop 优先。
- **M1-2 数字 / 体积本地化**（`dd3afe54`）：`InputNumber` 透传 locale；`Paginator` 数字与 `FileUpload` 体积改用 `Intl`；`de-DE` 小数逗号与 `kB` 单位。
- **M1-3 可访问名补口与 10 语台账**（`bd30a2fa`）：`table.columnResize` / `fileUpload.remove` 两键纳入 10 语；默认 zh-CN 文案不变。
- **M1-4 支持语言与翻译状态表**（`e0e44efa`）：中英 locale 页新增 10 语分发 / 键覆盖 / 复核状态总表，README 各补一行回链；订正命名空间为 34。

### M2 P1 组件广度（6 条）

- **M2-1 / M2-2 Transfer**（`e0d2af6a` / `fec985c9`）：双栏候选 / 已选、搜索、禁用与受控值集合；`transfer` locale 6 键 ×10 语；中英页 / 示例 / 登记面。
- **M2-3 / M2-4 Cascader**（`649dfcdf` / `6bd6aa48`）：组合封装多级列、`changeOnSelect`、清除、禁用；`cascader` locale 2 键 ×10 语；中英页 / 示例 / 登记面。
- **M2-5 / M2-6 Timeline**（`679c7e5b` / `80275581`）：`ol` / `li` 语义、单侧 / 交替、反转与语气色；中英页 / 示例 / 登记面。

### M3 发布收口（3 条）

- **M3-1 发布前门槛复核**（`d1dee7f2` / `50e23e09` / `7ee8f7ce`）：`pnpm verify` 全链通过；首跑周回归因覆盖率 `89.97%` 与 E2E 30 分钟超时失败，补 Cascader 边界测试与放宽 E2E 超时后 `44909361461` success。
- **M3-2 `1.4.0` 发布**（发布提交 `2de2f8d9`）：Release run `44913800718` success；npm `latest` = `1.4.0`，tag `v1.4.0`，GitHub Release 已建；`docs:check:version` 通过。
- **M3-3 下游兼容复验**（`017cf9b5`）：Downstream run `44914670234` success，dependfix / caomei-auth / momei 三仓均通过。

### M4 规划载体收口（2 条）

- **M4-1 存量分片改名**（`0f07c91a`）：19 个 `phase-*.md` → `todo-archive-phases-*.md`，链接目标同批重指；剥离链接目标后正文零改写。
- **M4-2 归档索引守卫**（`a2e24f12`）：新增 `check:archive-index`（命名 / 覆盖 / 悬空 / 重复 / 下界）与 9 例单测，接入 `governance:check`。

### 阶段总结

- **4 条主线 / 15 条原子条目全部交付**；`1.4.0` 已发布，`latest` 由 `1.3.0` 升至 `1.4.0`。
- **质量门**：`pnpm verify` 全绿（194 文件 / 3655 例）；VitePress 构建成功；`capture:styles` **399 项 0 差异**；Weekly Regression `44909361461` success；Release `44913800718` success；Downstream `44914670234` 三仓 success。
- **Review Gate**：登记 R1 Pass；15 条逐项 Pass；M3-1 复核批次 R1 Pass；发布与下游记录 R1 Pass；归档批次结论见 [Phase 40 归档批次](../design/governance/2026-11-21-phase40-archive.md) §5。
- **长期任务**：第 **44** 轮（1.4.0 发布后）与第 **45** 轮（Phase 40 收口）——见 [长期任务](./recurring.md)。
- **wisdom 蒸馏**：活跃 **20 条**达到阈值，已全部压缩进[经验归档](../design/governance/experience-archive.md)；`check:distill-archive` 15 段对账通过。

### 未覆盖边界

- **`1.4.0` 产物不含发布后修正**：新组件 `labelAttrs` 修正（`90c4c67f`）在 tag 之后，进入下一 patch；不回改 tag。
- **真实设备**：OTP 短信自动填充 / 输入法、设备预览的 iOS `dvh` 与触摸滚动未做真机验证。
- **Cascader 能力边界**：不内置搜索、远程加载与虚拟滚动；方向键列间移动未实现（Tab + Enter/Space 可用）。
- **E2E 时长**：周回归 E2E 作业 30 分钟会超时，已放宽到 60 分钟；若后续接近 60，再评估拆分。

### 遗留与后续候选

- **issue #71（规划文档模型 v1）**：进度表、分片改名、机检已落地，`roadmap-phases-*.md` 未采纳；需回写结论并关闭。
- **issue #73（破坏性提交人工审查）**：新提案，待研判；不属 Phase 40 范围。
- **下一 patch**：包含 `labelAttrs` 修正；是否发 `1.4.1` 待用户裁定。
- **momei 页面级反馈**：仍等待外部反馈；不阻塞阶段归档。
- 其余条件触发候选见 [Backlog](./backlog.md)；启动需用户明确授权。
