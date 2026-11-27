# 待办归档

本文档归档已完成阶段的原子条目与验收结论。当前阶段完成后，从 [todo.md](./todo.md) 迁入此处。

> **主窗口口径（2026-11-27 更新）**：主窗口只保留**归档索引**（Phase 0 ~ Phase 40，逐阶段一行摘要 + 深度归档链接）与**近线阶段窗口**（**当前为 Phase 41 ~ Phase 45 共 5 块**，目标窗口 5 个；`docs:check:line-count` 读数 **389 行**，未越 warn 400）；更早阶段的完整归档块迁入**深度归档**目录 [`archive/`](./archive/)，收录范围分别为 [phase-00-06.md](./archive/todo-archive-phases-00-06.md)（Phase 0 ~ 6）、[phase-07-12.md](./archive/todo-archive-phases-07-12.md)（Phase 7 第一阶段 ~ Phase 12）、[phase-13-17.md](./archive/todo-archive-phases-13-17.md)（Phase 13 ~ 17）、[phase-18.md](./archive/todo-archive-phases-18.md)（Phase 18）、[phase-19.md](./archive/todo-archive-phases-19.md)（Phase 19）、[phase-20.md](./archive/todo-archive-phases-20.md)（Phase 20）、[phase-21.md](./archive/todo-archive-phases-21.md)（Phase 21）、[phase-22.md](./archive/todo-archive-phases-22.md)（Phase 22）、[phase-23.md](./archive/todo-archive-phases-23.md)（Phase 23）、[phase-24.md](./archive/todo-archive-phases-24.md)（Phase 24）、[phase-25.md](./archive/todo-archive-phases-25.md)（Phase 25）、[phase-26.md](./archive/todo-archive-phases-26.md)（Phase 26）、[phase-27.md](./archive/todo-archive-phases-27.md)（Phase 27）、[phase-28.md](./archive/todo-archive-phases-28.md)（Phase 28）、[phase-29.md](./archive/todo-archive-phases-29.md)（Phase 29）、[phase-30.md](./archive/todo-archive-phases-30.md)（Phase 30）、[phase-31.md](./archive/todo-archive-phases-31.md)（Phase 31）、[phase-32.md](./archive/todo-archive-phases-32.md)（Phase 32）、[phase-33.md](./archive/todo-archive-phases-33.md)（Phase 33）、[phase-34.md](./archive/todo-archive-phases-34.md)（Phase 34）、[phase-35.md](./archive/todo-archive-phases-35.md)（Phase 35）、[phase-36-37.md](./archive/todo-archive-phases-36-37.md)（Phase 36 ~ 37）、[phase-38.md](./archive/todo-archive-phases-38.md)（Phase 38）、[phase-39.md](./archive/todo-archive-phases-39.md)（Phase 39）、[phase-40.md](./archive/todo-archive-phases-40.md)（Phase 40）。**主窗口累计超过 `docs:check:line-count` 的 warn 阈值（400 行）时，把最早的阶段块迁入深度归档（链接深度机械调整，另含同目录 `./` → `../` 修正，正文不改写）**；该阈值由 `docs:check:line-count` 驱动——2026-11-15 Phase 34 入窗后 **397 行**；2026-11-16 Phase 35 入窗并迁出 Phase 28 ~ Phase 30 后 **311 行**；2026-11-19 Phase 37 入窗并迁出 Phase 31 后 **363 行**；2026-11-20 Phase 38 入窗并迁出 Phase 32 后 **374 行**（同日规则段 +3 行后检查器读数 **377 行**）；2026-11-21 Phase 39 入窗并迁出 Phase 33 后 **384 行**；2026-11-21 Phase 40 入窗并迁出 Phase 34 后 **378 行**；**2026-11-23 Phase 41 入窗并迁出 Phase 35 后 400 行**（`docs:check:line-count` 值，恰在 warn 400 边界内）；**2026-11-24 Phase 42 入窗并迁出 Phase 36 / Phase 37 后 371 行**（`docs:check:line-count` 值，迁出前 419 行，越过 warn 400）；**2026-11-25 Phase 43 入窗并迁出 Phase 38 后 379 行**；**2026-11-26 Phase 44 入窗并迁出 Phase 39 后 375 行**（`docs:check:line-count` 值；主窗口回到 Phase 40 ~ Phase 44 五块）；**2026-11-27 Phase 45 入窗并迁出 Phase 40 后 389 行**（`docs:check:line-count` 值；主窗口回到 Phase 41 ~ Phase 45 五块）。**深度归档不改变权威**：阶段交付的权威记录仍是各阶段治理记录（见[治理索引](../design/governance/index.md)），深度归档只保存主窗口迁出的原始正文。

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

## 归档索引（Phase 0 ~ Phase 40）

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
| Phase 35 | 2026-11-15 ~ 11-16 | 质量与无障碍收口、DataTable 列可见性 / 列宽、长尾 Rating（不发布） | [phase-35](./archive/todo-archive-phases-35.md) |
| Phase 36 | 2026-11-17 ~ 11-18 | 浮层隔离扩面、DataTable 列宽拖拽与虚拟滚动评估、质量治理、选择器空值诊断（不发布） | [phase-36-37](./archive/todo-archive-phases-36-37.md) |
| Phase 37 | 2026-11-18 ~ 11-19 | 质量收口与回归补齐、选择器空值 opt-in、迁移口径、Rating 表单集成（不发布） | [phase-36-37](./archive/todo-archive-phases-36-37.md) |
| Phase 38 | 2026-11-20 | 移动端体验：安全区 token、移动壳（Cell / Tabbar）、操作与空态（ActionSheet / Empty）、适配指南与验收视口扩面（不发布） | [phase-38](./archive/todo-archive-phases-38.md) |
| Phase 39 | 2026-11-21 | P0 组件缺口（InputOtp / Popconfirm / Result / Descriptions）、治理收口、文档站设备预览与 E2E 质量收口（不发布） | [phase-39](./archive/todo-archive-phases-39.md) |
| Phase 40 | 2026-11-21 | 国际化收口、P1 组件广度与 `1.4.0` 发布、规划载体收口 | [phase-40](./archive/todo-archive-phases-40.md) |

---

## Phase 41：表单校验、日期形态扩展、移动端能力补齐与治理收尾（**2026-11-23 完成并归档；本阶段不发布**）

- 时间：2026-11-22 用户就[第二十五轮范围评估](../design/governance/2026-11-22-next-stage-scope-evaluation-25.md)裁定 D0 ③ / D1 ① / D2 ① / D3 ③，并就[第二十六轮移动端补充评估](../design/governance/2026-11-22-mobile-support-scope-evaluation.md)裁定 D0' ① / D1' ① / D2' ① 后登记；2026-11-22 交付、2026-11-23 完成阶段归档（用户指令「开始归档」）。
- 范围与授权：表单校验 **4** / 日期形态 **2** / 治理与可达性 **2** / 移动组件 **3** / 移动文档 **4**，构成对账 **4 + 2 + 2 + 3 + 4 = 15**；本阶段**不发布**（`latest` 维持 `1.4.0`）。范围与验收口径的唯一载体见 [Phase 41 登记批次](../design/governance/2026-11-22-phase41-registration.md) §1 / §2；归档批次见 [Phase 41 归档批次](../design/governance/2026-11-23-phase41-archive.md)。
- 非目标：P2 组件（Statistic / Countdown，延后）、发布、国际化二期 7 语、Tree / TreeSelect、RTL、DataTable 虚拟滚动、宽屏 / `xl`、单 Demo 抽屉、通用 Picker 实现、手势件、NumberKeyboard / NoticeBar / List / Grid、依赖与工具链升级、破坏性 API、新增运行时依赖、2.0。

### M1 表单校验能力（4 条）

- **M1-1 接线探针与契约**（`5a5eaeca`；记录见 [接线契约](../design/governance/2026-11-22-form-validation-wiring-contract.md)）：Reka `FormRoot` / `FieldRoot` / `FieldControl` 对 13 个字段的一次性探针——值读取 0 / 13、`aria-invalid` 落可访问控件 4 / 13、字段名落点 10 / 13、提交聚焦天然可聚焦 4 / 13；写定 `errors` / `validate` / `validation-mode` 作用面与 `invalid` / `error` 优先级；登记 §2 的 fallback 已按「直连不可用」触发。RG R1 `Reject` → R2 `Reject` → R3 `Pass`。
- **M1 机制裁定（取 A）**（`33692f08`）：用户裁定取 A 路径——`FormItem` 可选且只读的 `modelValue` 值通道 + 内部注册汇总 `values` + 自持校验态，`FieldError` 渲染改为等价自有渲染；阶段条目维持 15。
- **M1-2 最小实现**（`43e30959` / `ad9b3617`）：`CaomeiForm` 承接 `errors`、提交校验通过才 emit `submit`、失败聚焦文档顺序首个无效字段；`FormItem` 透传 `validate` / `validation-mode`；优先级 受控 `error` > 本地校验 > 服务端 `errors` > 仅 `invalid`；值变更即清除服务端错误（版本令牌 + 同步清除）；异步提交序号与在飞结果作废；包入口类型导出。RG R1–R3 `Reject` → §3.5 缩面复核 `Pass`（批次 1）；批次 2 `quick` 收敛 `Pass`。
- **M1-3 文档 / 示例 / 迁移表**（`5557e490`）：中英组件页新增内建校验节与三条路径示例（必填 / 跨字段 / 服务端回填）；迁移表改写 rules DSL 边界。RG `quick` `Pass`。
- **M1-4 双通道回归与 a11y**（`8c98c847`）：内建校验 E2E（提交拦截、聚焦、服务端让位、`aria-describedby`）、a11y 打开态夹具（含渲染守卫）、受控优先级用例强化为真双值共存。RG `standard` `Reject`（夹具位移扰动视觉基线）→ 修复复验 `Pass`。

### M2 日期选择器形态扩展（2 条）

- **M2-1 `month` / `year` 模式与测试**（`9ed50ad3`）：`selectionMode` 扩为 4 值，值仍为 `Date` 并按粒度归一化；新增月 / 年面板（min/max 禁用、方向键与 Home/End 跳过禁用项、`listbox` + `aria-readonly`）；`showTime` 告警并忽略；13rem 宽度档位；8 例单测 + 4 例 E2E（320 几何、axe 亮暗、对比度、禁用态）。RG R1 / R2 `Reject` → R3 收束 `Pass`。
- **M2-2 文档与登记面**（`6b7d8bb2`）：中英组件页「月 / 年选择」节与示例；迁移表补 `view` 映射并从「未实现」清单移除；`theming.md` / `design-spec.md` 补 13rem 档位；几何门禁补档位下界。RG `quick` `Reject`（表格行被吞）→ 修复复验 `Pass`。

### M3 治理与可达性收尾（2 条）

- **M3-1 issue #71 失效指引收口与关闭**（`2ee7f8f2`）：`todo-archive.md` 改为纯前向命名口径、`planning.md` §7 去掉存量豁免；回写结论并关闭 issue #71（completed）。RG `quick` `Pass`。
- **M3-2 可访问名残留收口**（`cb900dfd`）：`time-picker/wheel-column.vue` 模板级 `:aria-label="label"` 改走 `labelAttrs`；补空标签 / 非空标签断言与源码守卫；组件模板级残留复测 0。RG `quick` `Pass`。

### M4 移动组件（3 条）

- **M4-3 SearchBar 配方与示例**（`905c38f6`）：移动端指南补搜索栏配方（清除 / 取消 / 提交 / 空态）与中英示例；明确库内不提供 SearchBar 组件。RG `quick` `Reject`（`variant="text"` 不存在）→ 修复 `Pass`。
- **locale：`navBar` 与月年翻页文案**（`b5cac5a3`）：新增 `navBar`（`label` / `back`）命名空间与 `datePicker.prevYear` / `nextYear`，10 语 + 台账 + 版本策略计数同批。RG `quick` `Reject`（台账未同步）→ 修复 `Pass`。
- **M4-1 NavBar 实现与测试（例外项）**（`3dcebe5a`）：路由级页头（返回 / 标题 / 尾部操作、吸顶、视口级安全区），不接 vue-router、`back` 事件交使用方；Nuxt 与 a11y 登记；5 例单测 + 4 例 E2E。RG `standard` `Pass`（W1 / W2 同批修）。**例外标注**：不满足 `caomei-todo` §11.5 三条标准第 1 条、第 2 条存疑，按用户 D1' ① 例外立项。
- **M4-2 NavBar 文档与登记面（例外项）**（`afd5778a`）：中英组件页 + 示例 + 侧栏 / 总览 / 画廊 / §5 登记；Toolbar 与 NavBar 单点边界；例外声明写入页面。RG `quick` `Pass`（W 项同批修）。

### M5 移动文档（4 条）

- **M5-1 移动端就绪矩阵**（`9e20cab6`）：72 行逐组件页矩阵（320 / 390 / 768、降级策略、已知边界），分类为 §3 模式 49 行 + 源码有规则但 §3 未登记 7 行 + 随容器收敛 16 行；中英同步。RG `quick` `Reject`（映射失真 / 漏映射）→ 修复 `Pass`。
- **M5-2 高流量页移动说明 A**（`04efb791`）：DataTable / Dialog / Form / Tabs 中英移动节。RG `quick` `Reject`（Tabs 把浏览器滚动写成组件保证等）→ 修复 `Pass`。
- **M5-3 高流量页移动说明 B**（`68a532b1`）：FileUpload / Switch / Drawer / Popover 中英移动节。RG `quick` `Pass`（2W 同批修）。
- **M5-4 壳层示例与英文同步（含真机清单）**（`7c2fe5d2`）：NavBar（吸顶）+ 搜索栏 + 列表 + 底部操作条 + Tabbar 的可运行壳层；壳层吸顶 E2E 断言；真机清单（iOS `dvh` / 触摸滚动 / OTP 自动填充）显式「未执行（无真机）」并给替代证据。RG `quick` `Reject`（sticky 未生效）→ 修复 `Pass`。

### 阶段总结

- **5 条主线 / 15 条原子条目全部交付**；本阶段不发布，`latest` 维持 `1.4.0`。
- **提交对账**：窗口 `git log --oneline --no-merges eaaf261b..3be624ab` → **19**（含 locale 批次与 locale 键基线同步各 1；归档提交另计 1 个）。
- **质量门**：`pnpm test` **196 文件 / 3725 例**通过；`pnpm build` + `check:build`（24 个 exports）通过；`pnpm governance:check` exit 0；`test:visual` **50 / 50**；E2E 定向（form / date-picker-granular / nav-bar / mobile-shell / geometry / responsive）全绿；`pnpm docs:build` 成功。
- **Review Gate**：15 条逐项 Pass（含 5 次 Reject 后修复）；M1-2 批次 1 按 §3.5 缩面收束；归档批次见 [Phase 41 归档批次](../design/governance/2026-11-23-phase41-archive.md) §5。
- **长期任务**：第 **46** 轮门槛复核（2026-11-23，Phase 41 收口轮）——见 [长期任务](./recurring.md)。
- **wisdom 蒸馏**：`pnpm distill:wisdom --check` → 活跃 2 条（< 阈值 20，不蒸馏）。

### 回扫口径（三段式）

- **机检面**：`check:governance-records` / `check:planning-numbers` / `check:stage-counts`（无进行中阶段分支）/ `check:stage-progress`（跳过）/ `check:archive-index` / `check:archive-rg-counts` / `check:governance-counts` / `check:design` / `docs:check` / `governance:check` 全绿。
- **人工面**：`todo.md`（清空阶段状态句 / 条目表 / 进度表）/ `roadmap.md`（§1 当前态与 Phase 41 行）/ `todo-archive.md`（本块入窗、Phase 35 迁出、口径句与行数）/ `archive/index.md`（phase-35 行、文件表与迁出时点）/ `recurring.md`（第 46 轮与触发义务句）/ `governance/index.md`（归档记录行）逐处核过；`.session` 两份文件同批切到「无进行中阶段」。
- **未处理面**：历史治理记录中指向 `docs/plan/todo.md` 的时点陈述按既有边界不回改；本批无新增失效指针。

### 未覆盖边界

- **真实设备与示例类型检查**：iOS `dvh`、触摸滚动、OTP 自动填充仍无真机执行（M5-4 清单显式记录「未执行（无真机）」）；`docs/examples/**` 在 `typecheck:docs`（`vue-tsc -p docs/tsconfig.json`）受检面内，但本轮验证集未含该命令，示例 props 拼写实际依赖 Review Gate 拦截（已拦下 `variant="text"`；补跑 `pnpm typecheck:docs` 通过）。
- **NavBar 例外**：不满足 §11.5 三条标准第 1 条、第 2 条存疑；文档与组件页已标注，撤回时需重算阶段条目。
- **`month` / `year` 导航可访问名**：已补动作语义（`prevYear` / `nextYear`）；月 / 年模式不支持取消选择，`preventDeselect` 仅 `single` 生效。

### 遗留与后续候选

- **表单校验的后续面**：`errors` 的「新对象 = 重新下发」语义、`aria-invalid` 在 9 个字段被显式绑定覆盖的逐字段清单（仅机制选 B 时需补）、真实浏览器聚焦断言已由 M1-4 覆盖。
- **移动端候选**：导航按钮可访问名的 10 语扩展已交付；真机验收、通用 Picker、手势件等维持 [Backlog](./backlog.md) 候选。
- **issue #71 已关闭**；issue #73（破坏性提交人工审查）已在 Phase 40 收口；其余条件触发候选见 [Backlog](./backlog.md)，启动需用户明确授权。

## Phase 42：发布收口、浏览器模拟移动验收、治理收尾与 P2 / 宽屏基线（**2026-11-24 完成并归档；`1.5.0` 发布收口移出至 Backlog，本阶段不发布**）

- 时间：2026-11-23 用户就[第二十七轮范围评估](../design/governance/2026-11-23-next-stage-scope-evaluation-27.md) D0 ~ D4 裁定 **① / ② / ② / ③ / ①** 后登记；执行期 2026-11-23 追加 M6、2026-11-24 追加 M7（含用户缺陷报告追加 M7-2 / M7-3）；2026-11-24 完成阶段归档（用户指令「开始归档」）。
- **归档前范围变更（2026-11-24 用户裁定）**：M1 发布收口 3 条（门槛复核 / `1.5.0` 发布 / 下游复验）因「本阶段不执行发布、初步计划 2026-11-29 前后」移出本阶段，转入 [Backlog](./backlog.md) §1.6 待发布窗口；归档口径 = **6 条主线 / 17 条原子条目**（构成对账 2 + 3 + 5 + 2 + 2 + 3 = 17，原登记 5 条主线 / 15 条条目，执行期追加 M6 2 条、M7 3 条）。范围与验收口径的唯一载体见 [Phase 42 登记批次](../design/governance/2026-11-23-phase42-registration.md) §1 / §2，归档动作见 [Phase 42 归档批次](../design/governance/2026-11-24-phase42-archive.md)。
- 范围与授权：浏览器模拟移动验收 **2** / 治理与文档收尾 **3** / P2 组件 **5** / 宽屏视觉基线 **2** / 下游升级兼容修复 **2** / 文档站窄屏修复 **3**；本阶段**不发布**，`latest` 维持 `1.4.0`。
- 非目标：国际化二期 7 语、RTL、Tree / TreeSelect、通用 Picker、手势件、单 Demo 抽屉、`xl` 断点、依赖与工具链升级、破坏性 API、新增运行时依赖、2.0。

### M2 模拟移动验收（2 条）

- **M2-1 设备视口模拟执行与记录**（`e54205f0`）：Playwright 设备预设（iPhone 12 / iPhone SE，含移动 UA / DPR / `hasTouch`）执行 Phase 41 M5-4 清单——`dvh` 下吸顶与底部条、`overflow` 容器滚动、OTP `autocomplete` 与焦点行为；逐条记「模拟结果 + 未覆盖原因」，全部标注「模拟（非真机）」。RG R1 `Reject` → R2 `Pass`。
- **M2-2 依结果的修复或文档化**（`f0ec0c55`）：真机清单改写为「模拟已执行（非真机）+ 真机未执行」，中英同步；`docs:check:i18n-parity` 绿。RG R1 `Reject` → R2 `Pass`。

### M3 治理与文档收尾（3 条）

- **M3-1 `typecheck:docs` 纳入阶段收口验证集**（`ed89d4ca`）：开发规范 §11 质量门与 AI 协作规范 §1 D 阶段自检句写入「阶段收口必须执行 `pnpm typecheck:docs`」；本阶段实测执行。RG R1 `Pass`。
- **M3-2 移动就绪矩阵 §3 回填 7 行**（`2c796f50`）：`transfer` / `popover` / `popconfirm` / `tooltip` / `cascader` / `time-picker` / `descriptions` 补进 `responsive.md` §3，矩阵「依据」列由「未登记」改为 `§3 #N`，中英同步。RG R1 `Reject` → R2 `Pass`。
- **M3-3 NavBar / Tabbar 同页 landmark 提示**（`43adb5e4`）：中英组件页补「默认可访问名不同名；显式设为同名 `label` 时会出现两个同名 `nav` landmark」；执行期事实修正登记原文「`label` 默认同名」，未改组件默认值。RG R1 `Pass`。

### M4 P2 组件（5 条）

- **M4-1 Statistic 实现与测试**（`fabbc898`）：数值展示（精度 / 千分位 / 前后缀 / 加载态）、空值与非法输入降级、边界单测。RG `Pass`。
- **M4-2 Statistic 文档面**（`9f82c8bc`）：中英组件页 + 示例 + 侧栏 / 总览 / 画廊 / 设计清单 §5 登记。RG `Pass`。
- **M4-3 Countdown 实现与测试**（`211cad3b`）：秒级刷新、`finish`、自定义格式、卸载清定时器；假时钟覆盖跨秒 / 到点 / 回拨，SSR 无 `window` 依赖。RG `Pass`。
- **M4-4 Countdown 文档面**（`b710cf51`）：中英组件页 + 示例 + 登记面。RG `Pass`。
- **M4-5 P2 组件共用登记面**（`acf0f387`）：根导出 / Nuxt 注册 / a11y 夹具同批；**事实修正**：两组件无语言兜底文案，新增命名空间将触及 13 文件超阈值，故不新增、台账维持。RG `Pass`。

### M5 宽屏视觉基线（2 条）

- **M5-1 宽屏视口参数化与 `DataTable` 基线**（`08230bf1`）：独立宽屏夹具段（不改 `SAMPLE_SECTIONS` 的 1280 循环），`DataTable` 1536 / 1920 亮暗 4 张基线，`threshold 0.1` + `maxDiffPixels 100`。RG R1 `Pass`。
- **M5-2 `Form` 宽屏用例与口径同步**（`4107ea4a`）：追加 `Form` 4 张基线；测试规范与 `playwright.visual.config.ts` 注释补宽屏说明；`pnpm test:visual` 54 例。RG R1 `Reject` → R2 `Pass`。

### M6 下游升级兼容修复（2 条）

- **M6-1 `DataTable` 表头行高回归修复与守卫**（`abcb42cb`）：`CaomeiTooltipText` 包装下恢复 1.3.0 表头行高（momei 实测 32.59px 回归面），不改 `cellTooltips` 默认值与 `mode="auto"`；新增修复前后判别守卫。RG R1 `Reject` → R2 `Pass`。
- **M6-2 1.4.0 消费方可见变化升级注意补录**（`a68b217e`）：新增 `docs/release-notes/1.4.0.md`，覆盖 Button 根节点 / 内容 `nowrap`、DataTable `TooltipText`、浮层 `inert`、Paginator / Select 几何与下游适配写法；三家下游各至少一条可复现证据。RG R1 `Reject` → R2 `Pass`。

### M7 文档站窄屏修复（3 条）

- **M7-1 320 / 360 / 390 档横向溢出修复与复验**（`3c8fead5`）：站点 chrome ≤959px 隐藏设备预览、≤359px 隐藏主题预设切换（选择器升 0-3-0 不依赖注入顺序）；演示区 ≤640px 栅格演示容器内滚动、行式布局折行、横向步骤条列表内滚动；Button 示例改 `.demo-row :deep(.demo-truncate)` 恢复 1.4.0 多根后的 220px 截断；断点登记于 [文档与演示站 §10.1](../design/documentation-site.md)。验收：构建产物 164 页 × 320 / 360 / 390 / 768 四档 `scrollWidth === innerWidth`。RG R1 `Reject` → R2 `Pass`（3 warning 同批修）。
- **M7-2 设备预览选中态前景色修复**（`0ab62654`）：`.device-preview__option[aria-pressed='true']` 前景 `primary-text` → `primary-foreground`；缺省预设亮 1.30:1 → 5.17:1、暗 1.00:1 → 7.73:1；回扫 `src/` + `docs/` 同类配对 0 处残留。RG R1 `Reject` → R2 `Reject` → R3 收束（`§3.5`）。
- **M7-3 示例实底前景回扫修复**（`0ab62654`）：`select/value-slot` 中英 `.selected-tag` 由自适应 `success` + 字面量白改为 `success-solid` + `on-solid`（暗 1.74:1 → 两态 5.02:1）。RG 同 M7-2 批次。

### 阶段总结

- **6 条主线 / 17 条原子条目全部交付**；M1 发布收口 3 条移出至 Backlog；本阶段不发布，`latest` 维持 `1.4.0`。
- **提交对账**：窗口 `git log --oneline --no-merges 8038ab40..ec0fcb2f` → **29**（含范围评估、登记、执行期追加、逐条交付与规划状态回填；归档提交另计 1 个）。
- **质量门**：`pnpm verify` exit 0（lint / stylelint / lint-md / typecheck / `typecheck:docs` / `pnpm test` **198 文件 / 3767 例** / `build` / `check:build` / `check:resolver` / `check:nuxt` / `docs:build` / `docs:check:i18n-routing` / `governance:check`）；`pnpm capture:styles` **399 项 0 差异**；master CI（Test / Deploy VitePress / CodeQL / Security Alerts）在 `ec0fcb2f` 全绿。
- **Review Gate**：17 条逐项 Pass；其中 **9 条条目**经历 Reject（合计 **9 轮**：M2-1 / M2-2 / M3-2 / M5-2 / M6-1 / M6-2 / M7-1 各 1 轮，M7-2 2 轮，M7-3 与 M7-2 同批）；M7-2 / M7-3 达 3 轮预算后按 `§3.5` 收束、残留项已修；归档批次见 [Phase 42 归档批次](../design/governance/2026-11-24-phase42-archive.md) §5。
- **长期任务**：第 **47** 轮门槛复核（2026-11-24，Phase 42 收口轮）——见 [长期任务](./recurring.md)。
- **wisdom 蒸馏**：`pnpm distill:wisdom --check` → **2 条活跃**（< 阈值 20，不蒸馏）。

### 回扫口径（三段式）

- **机检面**：`check:governance-records` / `check:planning-numbers` / `check:stage-counts`（无进行中阶段分支）/ `check:stage-progress`（跳过）/ `check:archive-index` / `check:archive-rg-counts` / `check:governance-counts` / `check:design` / `docs:check` / `governance:check` 全绿。
- **人工面**：`todo.md`（清空阶段状态句 / 进度表 / 条目表）/ `roadmap.md`（§1 当前态、Phase 42 行与 §5）/ `todo-archive.md`（本块入窗、Phase 36 / 37 迁出、口径句与行数、索引表）/ `archive/index.md`（phase-36-37 行与迁出时点）/ `archive/todo-archive-phases-36-37.md`（迁出保真）/ `recurring.md`（第 47 轮与触发义务句）/ `backlog.md`（发布收口候选）/ `2026-11-23-phase42-registration.md`（归档前范围变更）/ `2026-11-24-phase42-archive.md`（本记录自身）/ `design/governance/index.md`（归档记录行）逐处核过；`.session` 两份文件同批切到「无进行中阶段」。
- **未处理面**：历史治理记录中指向 `docs/plan/todo.md` 的时点陈述按既有边界不回改；本批无新增失效指针。

### 未覆盖边界

- **发布与下游复验未执行**：M1 移出后本阶段不含发布；`1.5.0` 的周回归门槛、发布执行与三仓复验待发布授权（Backlog 待发布窗口）。
- **真机验收**：M2 为浏览器设备视口模拟，iOS `dvh` 真实收缩、触摸滚动惯性、OTP 自动填充仍无真机执行。
- **文档站窄屏**：M7 只覆盖 Chromium 与文档站 `basic` 示例的窄屏形态；非 Chromium 引擎与暗色 × 窄屏组合态未测。
- **下游反馈**：momei 页面级反馈仍未提供，维持等待外部反馈指针。

### 遗留与后续候选

- **`1.5.0` 发布收口**：门槛复核、发布、下游复验三条待发布授权（Backlog §1.6）。
- **Stepper 横向窄屏退化**：极窄容器下标题单字一行，用户裁定暂不修复、以组件文档指引替代（[Backlog §1.5](./backlog.md)，记录 `ec0fcb2f`）。
- **1.4.0 下游适配回收**：待 Button 单元素根 / 换行开关修复后复核 caomei-auth 的 `!important` 与 momei 的 `vertical-align`（Backlog §1.8）。
- 其余条件触发候选见 [Backlog](./backlog.md)；启动需用户明确授权。

## Phase 43：下游覆盖兼容、语义收口与 Tree / TreeSelect（**2026-11-25 完成并归档；`1.5.0` 发布收口按用户裁定移出至 Backlog，本阶段不发布**）

- 时间：2026-11-24 用户就[第二十八轮范围评估](../design/governance/2026-11-24-next-stage-scope-evaluation-28.md)裁定 D0 ④ / D1 ① 后登记；2026-11-25 用户指令「M1-1 / M1-2 / M1-3 直接移除，11-29 之前不列入规划」并「开始归档」，同日交付 **3 条主线 / 10 条原子条目**并完成阶段归档。
- 范围与授权：**下游覆盖兼容 4 / 语义收口 1 / Tree · TreeSelect 5**，构成对账 **4 + 1 + 5 = 10**（登记时点为 4 条主线 / 13 条，含发布收口 3 条；归档前按用户裁定移出发布收口，见 [Phase 43 登记批次](../design/governance/2026-11-24-phase43-registration.md) §1 的范围变更）；本阶段**不发布**，`latest` 维持 `1.4.0`。
- 非目标：国际化二期 7 语与 RTL、`xl` 断点与宽屏布局规则、其余 P2 组件、通用 Picker、单 Demo 抽屉、依赖与工具链升级、破坏性 API、新增运行时依赖；Tree 虚拟滚动（`TreeVirtualizer` 仅说明不启用）、Tree 拖拽排序、懒加载之外的异步数据源抽象。

### M2 下游覆盖兼容（4 条）

- **M2-1 `CaomeiButton` 未启用提示时恢复单元素根**（`45b9a762` + `78e7cb95`；记录见[根形态修复](../design/governance/2026-11-24-phase43-m2-1-single-root.md)）：修共享 `Passthrough`（过滤注释后仅剩一个可见子节点时直接交出该 vnode），父级 scoped 属性与 `v-show` 恢复命中；连带恢复 `CaomeiTooltipText` 根形态、使 `as-child` 复用按钮的 Popover / Popconfirm 触发器成为隔离保留根；新增 axe 待复核例外（带 `aria-haspopup` 的 `aria-controls` 无条件 needsReview，源码级不可消除）。RG R1 `standard` `Pass`。
- **M2-2 内容换行开关**（`9a5dcec4`）：`wrap` 可选 prop（默认单行截断不变），折行时 `height: auto` + `min-height` 保底、`overflow-wrap: anywhere` 兜长英文 / URL；`iconOnly` 经 `:not()` 排除；中英页面与示例、真实 Chromium 几何用例（默认截断 / 折行增高 / 宽容器不折行 / 方形图标 / `block` 与 `loading`）。RG R1 `standard` `Reject`（stylelint）→ R2 `quick` `Pass`。
- **M2-3 `@layer` 策略评估**（`bc668b95`；记录见[评估记录](../design/governance/2026-11-24-phase43-m2-3-layer-strategy.md)）：**结论不落地**——收益只覆盖「下游覆盖库样式」单一路径，代价是下游全局 reset 反压与层顺序跨来源配置，opt-in 变体需两套产物或下游构建期包裹；给出按档特异性矩阵（(0,2,0) ~ (0,5,0)）与复评条件。RG R1 `quick` `Reject`（resolver `sideEffects` 事实、状态档特异性）→ R2 `quick` `Pass`。
- **M2-4 下游覆盖指引**（`489e1800`）：中英指南（覆盖顺序 / token 两级作用域 / 特异性矩阵 / 可执行示例 / 内部类边界 / 反例），并在指南侧栏登记、与 `1.5.0` 升级注意互链。RG R1 `quick` `Reject`（类名契约与版本策略冲突、token 作用域、单根限定）→ R2 `quick` `Pass`。

### M3 语义收口（1 条）

- **M3-1 `label` 语义收口（登记例外）**（`b2325d4a`；记录见[例外记录](../design/governance/2026-11-24-phase43-m3-1-label-semantics.md)）：`Statistic` / `DescriptionsItem` 的 `label` 是可见标签，与「`label` 即不可见可访问名」相反；两者均为展示型组件、改名无下游收益，按开发规范 §6 第二分支登记例外（含撤回条件与「新增同类用法须逐条复核」闸口），设计规范 §7 绝对表述改为链 §6。RG R1 `quick` `Pass`。

### M4 Tree · TreeSelect（5 条）

- **M4-1 `CaomeiTree`**（`6c9d23e8`）：封装 `reka-ui@2.11.0` 的 `TreeRoot` / `TreeItem`（Alpha）；扁平渲染 + 按层注入 `aria-level` / `setsize` / `posinset`；单选向 primitive 传单节点（数组会让 `aria-selected` 恒 false）；`itemKey` / `labelKey` / `childrenKey` 改名、缺键开发期告警、空 `children` 归一；单测 16 例 + 真实 Chromium E2E（角色 / 层级 / 点击展开选中 / 方向键 / `Home` / `End`）。RG R1 `standard` `Pass`（4 warning 同批修）。
- **M4-2 `CaomeiTreeSelect`**（`1b07a672`）：Popover + Tree 组合；字段为原生 `button`、面板 portal；单选 / 多选、回显、清空、禁用、打开态隔离复用 `useOpenStateIsolation`、320 / 390 窄屏碰撞收敛；面板规则落非 scoped 块（portal 面板的 `data-v` 落在 popper 包裹层）。RG R1 `standard` `Reject`（面板 scoped 死规则、非受控清空）→ R2 `standard` `Pass`（残留文本让位同批修）。
- **M4-3 Tree 文档与示例**（`2e5993a6`）：中英组件页（键位语义、多选与 `propagateSelect` / `bubbleSelect`、不输出半选态、数据量与虚拟滚动边界、无障碍、主题变量）+ 中英示例各 2 个。RG R1 `quick` `Reject`（示例 lint、半选虚构）→ R2 `quick` `Pass`（同批修复后复审）。
- **M4-4 TreeSelect 文档与示例**（`26b7828c`）：中英组件页（打开与键盘、单选 / 多选、清空、窄屏、浮层与层级、无障碍）+ 中英示例各 2 个。RG R1 `quick` `Reject`（层级口径与 `--caomei-z-*` 表相反）→ R2 `quick` `Pass`。
- **M4-5 两组件共用登记面**（`4980d843`）：侧栏（中英）/ 总览 / 画廊登记 / 设计清单 §5 / 文档与演示站 §11 同批；`check:components-overview` / `check:design-catalog`（§5 41 行 ↔ §11 76 成员）/ `governance:check` 复绿。RG R1 `quick` `Pass`。

### 阶段总结

- **3 条主线 / 10 条原子条目全部交付**；发布收口 3 条按用户裁定移出至 [Backlog](./backlog.md)（已决策待窗口，2026-11-29 之前不列入规划）；本阶段不发布，`latest` 维持 `1.4.0`。
- **提交对账**：窗口 `git log --oneline --no-merges 206329e5..4980d843` → **11**（10 条交付 + M2-1 状态同步 `78e7cb95`）；`d5fca0d5`（十项交付同步）在窗口右端之外，故 `..d5fca0d5` 为 **12**；收口期的 `b0234fc9`（规划载体去掉条目编号）与 `ee8516a9`（1.4.0 反馈指针更新）同属窗口外提交。
- **质量门**：`pnpm verify` exit 0（全量单测 **3810 例**、`build`、`check:build` / `check:resolver` / `check:nuxt`、`docs:build`、`docs:check` 全链与 `governance:check`）；`pnpm test:visual` **59 项 0 基线差异**；定向 E2E（tree / tree-select / button-wrap / popconfirm）**12 项**；推送后 master CI（Test / Deploy VitePress / Security Alerts / CodeQL / Run TODO to Issue）全部 **success**（head `ee8516a9`）。
- **Review Gate**：10 条逐项过闸；其中 **6 条**经历 Reject（M2-2 / M2-3 / M2-4 / M4-2 / M4-3 / M4-4 各 1 轮，后者 3 条为本轮同批修复或 R2 复审判定），其余 4 条 R1 `Pass`；无条目触及 3 轮上限。
- **长期任务**：本阶段未执行发布，周级门槛复核留给发布窗口（归档前一次 `pnpm verify` 全量已覆盖阶段质量门）。
- **wisdom 蒸馏**：`pnpm distill:wisdom --check` → **4 条活跃**（< 阈值 20，不蒸馏）。

### 回扫口径（三段式）

- **机检面**：`check:governance-records` / `check:planning-numbers` / `check:stage-counts`（无进行中阶段分支）/ `check:archive-rg-counts` / `check:governance-counts` / `check:design` / `docs:check` / `governance:check` 全绿。
- **人工面**：`todo.md`（清空阶段状态句与条目表）/ `roadmap.md`（§1 当前态、Phase 43 行与 §5）/ `todo-archive.md`（本块入窗与主窗口口径句）/ `archive/index.md`（phase-38 行与迁出时点）/ `backlog.md`（发布收口回流行）/ `governance/index.md`（归档记录行与登记摘要的范围变更注记）逐处核过；`.session` 两份文件同批切到「无进行中阶段」。
- **未处理面**：历史记录中指向 `docs/plan/todo.md` 的时点陈述按既有边界不回改；本批无新增失效指针。

### 未覆盖边界

- **发布与下游复验**：本阶段不发布；`1.5.0` 的门槛复核、升级注意补写（Button 根形态 / `CaomeiTooltipText` 根形态 / Popover·Popconfirm 打开态 `inert` 面收窄）、发布执行与三仓复验均未执行，整体待发布窗口与用户授权。
- **真机验收**：真机仍未执行（iOS `dvh` 真实收缩、触摸惯性滚动、系统 OTP 填充与安全区让位），既有记录为浏览器设备视口模拟。
- **Tree / TreeSelect 能力边界**：`TreeVirtualizer` 未启用（大数据仅文档说明 + 懒加载建议）；`propagateSelect` / `bubbleSelect` 只透传 primitive 能力、无专项断言；`ArrowDown` 未用于打开树选择器面板（已在组件页写明键位）。
- **存量缺陷（本批外）**：`cascader.vue` 的面板样式与 TreeSelect R1 同因（写在 scoped 块中，portal 下为死规则），未在本批修复。
- **文档面存量**：英文总览「Chinese documentation」镜像列表与已翻译列表有 12 项不一致（本批补 Tree / TreeSelect 两项）；Phase 39 归档块缺 `未覆盖边界` 小节（6 项必填生效期内的存量）。

### 遗留与后续候选

- **`1.5.0` 发布收口**：门槛复核与升级注意、发布与发布后校验、下游兼容复验与适配回收；已回流 [Backlog §1.6](./backlog.md)（**已决策待窗口，2026-11-29 之前不列入规划**，触发条件 = 到达发布窗口且用户明确授权发布）。
- **`cascader` 面板样式死规则**：建议评估后入 Backlog（与 TreeSelect R1 同因，属可比照修复的存量项）。
- **英文总览镜像列表对齐**：建议单列清理（存量 12 项）。
- **momei 页面级反馈**：等待外部反馈。

## Phase 44：新组件批次（引导、二维码与布局交互）（**2026-11-26 完成并归档；本阶段不发布**）

- 时间：2026-11-25 用户就[第二十九轮范围评估](../design/governance/2026-11-25-next-stage-scope-evaluation-29.md)后裁定「开始规划下阶段待办、本阶段不发布、时间估算不可靠」并登记；2026-11-25 ~ 11-26 交付 **5 条主线 / 10 条原子条目**并完成阶段归档（用户指令「完成所有条目后归档并推送，然后检查 CI 状态，修复问题」）。
- 范围与授权：**Tour 2 / QRCode 2 / ContextMenu 2 / Splitter 2 / Anchor 2**，构成对账 **2 + 2 + 2 + 2 + 2 = 10**；本阶段**不发布**（`latest` 维持 `1.4.0`，`1.5.0` 发布收口留在 [Backlog](./backlog.md) §1.6「已决策待窗口」，2026-11-29 之前不列入规划）。范围与验收口径的唯一载体见 [Phase 44 登记批次](../design/governance/2026-11-25-phase44-registration.md) §1 / §2；归档对账见 [Phase 44 归档批次](../design/governance/2026-11-26-phase44-archive.md)。
- 非目标：不发布、不做 Carousel / Watermark / Menubar / NavigationMenu / HoverCard、不做国际化二期 / RTL / `xl` 断点与宽屏基线 / 真机验收、不处理质量与治理存量（只登记 Backlog）、不做破坏性 API 与自动发布、除 `qrcode` 可选 peer 外不新增运行时依赖。

### M1 Tour 引导（2 条）

- **M1-1 核心与定位**（`e1ab4a65`，经 PR #74 合入）：自研全视口遮罩挖空 + 贴目标卡片；`steps` 驱动、`v-model:current` 受控、上一步 / 下一步 / 跳过 / 完成事件；滚动 / resize 重算、Escape 关闭并按「关闭瞬间焦点归属」归还；新增共享滚动锁（先测宽后隐藏滚动条 + `body` padding 补偿）。RG R1 `deep` Reject → R2 `standard` Reject → R3 `quick` Pass。
- **M1-2 文档 / locale 与回归**（`65057520`）：中英组件页 + 4 组双语示例、§11 / 侧栏 / 总览 / 组件设计 §5 登记面、`tour.e2e.ts`（遮罩覆盖、经典 15px 滚动条补偿、挖空对齐、滚动跟随、Esc 归焦、缺失降级）。RG R1 `standard` Reject → R2 `quick` Pass → R3 `quick` Pass。

### M2 QRCode 二维码（2 条）

- **M2-1 实现与可选 peer**（`22e49857`）：`CaomeiQRCode`（尺寸 / 容错 / 静区 / 前后景色 / 图标 / 插槽）；`qrcode` 可选 peer（peer + optional + devDependency + external + 许可）；异步编码请求序号防乱序、失败清空旧图并 `role="alert"`；新增消费方 fixture 实测四路径并据此改写可选 peer 口径。RG R1 `deep` Reject → R2 `standard` Reject → R3 `quick` Pass。
- **M2-2 文档 / peer 说明**（`f3655364`）：中英组件页 + 3 组双语示例、peer 安装说明，并统一 README / Chart / RichTextEditor / 架构文档的既有错误口径；`9636f7fa` 修正示例外链守卫漏检。RG R1 `standard` Reject → R2 `quick` Pass。

### M3 ContextMenu 右键菜单（2 条）

- **M3-1 实现与浮层接线**（`e5ecb6bb`）：封装 Reka ContextMenu（右键 / 触屏长按），数据条目支持图标 / 快捷键 / 危险 / 禁用 / command，另提供 Group / Label / Item / Separator；复用浮层隔离与受控开合；面板档位登记 E2E 清单（10 → 11）。RG R1 `standard` Pass。
- **M3-2 文档 / 回归**（`e90e232e`）：中英组件页 + 3 组双语示例；焦点归还改为组件自持（pointerdown 捕获 + 中性判定重试，消费方已接管则不抢回）；E2E 覆盖左键不打开、禁用项、触屏长按、Esc 归焦与背景隔离。RG R1 `standard` Reject → R2 `quick` Pass → R3 `quick` Pass。

### M4 Splitter 分栏（2 条）

- **M4-1 实现**（`9e525e0d`）：封装 Reka SplitterGroup / Panel / ResizeHandle；水平 / 垂直、min / max、collapsible、键盘 10% 调整；`v-model:layout` 受控（初值应用、外部写入应用、钳制回写），对 Reka 不发布局事件的 Enter 折叠按 `data-panel-size` 回读兜底。RG R1 `standard` Reject → R2 `standard` Reject → R3 `standard` Pass。
- **M4-2 文档 / 回归**（`caefa7db`）：中英组件页 + 4 组双语示例；E2E 覆盖 3px 分隔线与 13px 命中区、拖拽总和不变、键盘 10%、Enter 折叠回写、禁用无效与无横向溢出。RG R1 `standard` Pass → R2 `quick` Pass。

### M5 Anchor 锚点导航（2 条）

- **M5-1 实现**（`6287b52d`）：自研 scroll-spy；容器 / 窗口两种滚动源、`v-model:active` 受控、层级缩进、点击对齐判定线（容器只滚容器）、`pushState` 与 `hashchange` 同步、异常与畸形 hash 兜底、目标缺失保留原生锚点。RG R1 `standard` Reject → R2 `quick` Pass。
- **M5-2 文档 / 回归**（`0365c0a8`）：中英组件页 + 3 组双语示例；E2E 覆盖容器判定线与边界、点击只滚容器、落点双侧对齐（10–14px）与后退回上一节；补「外部写入不滚动」「修饰键放行」单测。RG R1 `standard` Reject → R2 `quick` Pass。

### 阶段总结

- **5 条主线 / 10 条原子条目全部交付**；本阶段不发布，`latest` 维持 `1.4.0`。
- **提交对账**：执行窗口 `git log --oneline --no-merges d7cddd66..0365c0a8` → **20**（10 条交付 + 9 条 `docs(plan)` 状态同步 + 1 条示例外链修复）；归档提交另计。
- **质量门**：`pnpm test` **209 文件 / 3901 例**；`typecheck` / `typecheck:docs` / `lint:css:check` / `lint:md:check` / `docs:check` / `docs:build` / `governance:check` / `build` / `check:build` / `check:resolver` / `check:nuxt` / `check:optional-peer` 全绿；定向 E2E：tour 9/9、overlay-stacking 2/2、context-menu 8 passed / 1 skipped、splitter 9/9、anchor 6/6。
- **长期任务**：本阶段不发布，周级门槛复核留给发布窗口。
- **wisdom 蒸馏**：`.session/wisdom.md` 活跃 10 条（< 阈值 20，不蒸馏）。

### 回扫口径（三段式）

- **机检面**：`check:governance-records` / `check:planning-numbers` / `check:stage-counts`（无进行中阶段分支）/ `check:stage-progress`（跳过）/ `check:archive-rg-counts` / `check:governance-counts` / `check:archive-index` / `check:design` / `docs:check` / `governance:check` 全绿。
- **人工面**：`todo.md`（清空阶段状态句 / 条目表 / 进度表）/ `roadmap.md`（§1 当前态、Phase 44 行与 §5）/ `todo-archive.md`（本块入窗、Phase 39 迁出、主窗口口径句与行数）/ `archive/index.md`（phase-39 行、文件表与迁出时点）/ `governance/index.md`（归档记录行）逐处核过；`.session` 两份文件同批切到「无进行中阶段」。
- **未处理面**：历史治理记录中指向 `docs/plan/todo.md` 的时点陈述按既有边界不回改；本批无新增失效指针。

### 未覆盖边界

- **发布**：本阶段不发布，`1.5.0` 发布收口（门槛复核 / 发布 / 发布后校验 / 下游回收）未执行。
- **可选 peer 结构边界**：未安装 peer 时无论是否使用都会构建期失败（chart / editor / qrcode 同构），组件内降级只覆盖运行期加载失败。
- **真机验收**：触摸长按 / 拖拽 / OTP 自动填充仅浏览器设备视口模拟，无真机执行。
- **测试密度**：Splitter 指针拖拽仅有 E2E 像素断言；Tour 多实例并存、Anchor 多实例 hashchange 互扰未单列用例。

### 遗留与后续候选

- **`1.5.0` 发布收口**：留在 Backlog「已决策待窗口」，2026-11-29 之前不列入规划，等待窗口与用户授权。
- **可选 peer 改进**：让「未安装且未使用」也能构建（拆子路径 / 运行期说明符 / 提依赖三选一）已登记 Backlog 排期象限，需用户裁定。
- 其余条件触发候选见 [Backlog](./backlog.md)；启动需用户明确授权。

## Phase 45：新组件第二批（轮播、水印与菜单交互）（**2026-11-27 完成并归档；本阶段不发布**）

- 时间：2026-11-26 用户就[第三十轮范围评估](../design/governance/2026-11-26-next-stage-scope-evaluation-30.md) D1–D5 裁定后登记；2026-11-26 ~ 11-27 交付 **6 条主线 / 15 条原子条目**并完成阶段归档（用户指令「开始归档」）。
- 范围与授权：**Carousel 3 / Watermark 2 / Menubar 3 / NavigationMenu 3 / HoverCard 3 / 导出与 a11y 1**，构成对账 **3 + 2 + 3 + 3 + 3 + 1 = 15**；本阶段**不发布**（`latest` 维持 `1.4.0`，`1.5.0` 发布收口留在 [Backlog](./backlog.md) §1.6「已决策待窗口」，2026-11-29 之前不列入规划）。范围与验收口径的唯一载体见 [Phase 45 登记批次](../design/governance/2026-11-26-phase45-registration.md) §1 / §2；归档对账见 [Phase 45 归档批次](../design/governance/2026-11-27-phase45-archive.md)。
- 非目标：不发布、可选 peer 结构改进、`glob` 跨 major、真机验收、国际化二期 / RTL、`xl` 断点、质量与治理存量、破坏性 API、除 `embla-carousel-vue` 外的新增运行时依赖、自动发布。

### M1 Carousel 轮播（3 条）

- **M1-1 依赖与 locale 基础**（`5d42b9ad`）：`embla-carousel-vue@8.6.0` 进运行时依赖（5 → 6）、tsdown external、lockfile、第三方许可三包（上游不随包提供 LICENSE，正文取自固定 commit）；新增 `carousel.prev` / `next` / `slide` 三键（10 语 + 中英台账），命名空间 41 → 42、键 120 → 123，台账「键覆盖」列接入机检。RG R1 `deep` Reject（1 blocker / 3 warning / 5 suggest）→ R2 `quick` Pass。
- **M1-2 组件实现与测试**（`20abf94a`，经 PR #76 合入）：水平 / 垂直、`loop`、`slidesPerView` / `gap`、`v-model:index`（按页）、上一页 / 下一页 / 指示点、键盘与拖拽；受控索引在挂载与 `reInit` 先按外部模型定位、越界钳位 / 取模并回写，退化测量（容器未布局）不覆盖外部值；`role="region"` / `aria-roledescription` 与每页「第 n 张 / 共 m 张」。RG R1 `standard` Reject（1 blocker / 8 warning / 3 suggest）→ R2 `quick` Reject（1 blocker / 1 warning）→ R3 `quick` Pass。
- **M1-3 文档、示例与回归**（`9bd3ff99`）：中英组件页 + 基础 / 多图双语示例、侧栏 / 总览 / §11 / §5 登记面、`carousel.e2e.ts` 5 例（等宽分页、按钮与指示点、键盘 Home·End、拖拽、循环回绕、纵向整页吸附）。RG R1 `standard` Reject（1 blocker / 4 warning / 3 suggest）→ R2 `quick` Pass。

### M2 Watermark 水印（2 条）

- **M2-1 实现与测试**（`60c22ce7`）：离屏 canvas 平铺水印（文本 / 图片、旋转、透明度、间距、偏移、层级）；平铺尺寸按旋转包围盒、字号在画布尺寸重置后重设；`MutationObserver` / `ResizeObserver` 变更合并到下一任务重建、卸载断开；遮罩 `aria-hidden`，根与插槽保持可访问。RG R1 `standard` Reject（2 blocker / 3 warning / 3 suggest）→ R2 `quick` Pass。
- **M2-2 文档与回归**（`327513b9` / `cb5e16b9`；`ad7c5dee` 修正示例资源）：中英组件页 + 文本 / 图片双语示例、侧栏 / 总览 / §11 / §5 登记面、`watermark.e2e.ts` 4 例（遮罩语义与正文可读、删除后重建、卸载离开 DOM、主题切换重绘）；组件补主题观察（含 `prefers-color-scheme`）与遮罩删除恢复。RG R1 `standard` Reject（1 blocker / 3 warning（+1 附随）/ 5 suggest）→ R2 `quick` Pass。

### M3 Menubar 菜单栏（3 条）

- **M3-1 组件实现与测试**（`d87ed8d9`）：封装 Reka Menubar 五层（菜单栏 / 菜单 / 触发器 / 内容 / 条目）、受控 `modelValue` 与 `loop`；面板经 portal 渲染（命名空间化非 scoped 样式），条目支持禁用与快捷键提示；键盘方向键 / Home / End / Esc 与焦点归还。RG R1 `standard` Reject（2 blocker / 4 warning / 2 suggest）→ R2 `quick` Pass。
- **M3-2 浮层档位与 E2E 清单**（`75b82755`）：`--caomei-menubar-z-index`（默认 dropdown）落 viewport、`overlay-panels` 清单 11 → 12 / 守卫计数 15 → 16；明确非模态语义（不接入整页隔离）并补契约用例。RG R1 `standard` Reject（1 blocker / 3 warning / 1 suggest）→ 非模态澄清 → R2 `quick` Pass。
- **M3-3 文档、示例与回归**（`5d15fee1`）：中英组件页（含非模态语义与 16 个样式变量）+ 基础 / 分组双语示例、侧栏 / 总览 / §11 / §5 登记面、`menubar.e2e.ts` 4 例（点击开 / 外部关、打开态切换、键盘与 Esc 回焦、禁用条目）。RG R1 `standard` Reject（1 blocker / 3 warning / 5 suggest）→ R2 `quick` Pass。

### M4 NavigationMenu 导航菜单（3 条）

- **M4-1 组件实现与测试**（`0bc9f921`）：封装 Reka NavigationMenu（根 / 触发器 / 内容 / 链接）、共享内容视口、受控 `modelValue`；触发器以 `#content` 插槽承载面板、面板默认 `role="group"` 并可覆盖；视口消费 Reka 尺寸变量，键盘 `ArrowDown` / `Esc` 与悬停展开。RG R1 `standard` Reject（1 blocker / 5 warning / 5 suggest）→ R2 `quick` Reject（1 blocker / 1 warning）→ R3 `quick` Pass。
- **M4-2 浮层档位与 E2E 清单**（`41b7f9e3`）：视口补 `--caomei-navigation-menu-z-index`（默认 dropdown）、清单 12 → 13 / 守卫计数 16 → 17，模态内夹具两个触发器；panel 选择器按容器限定。RG R1 `standard` Pass（1 warning / 3 suggest）。
- **M4-3 文档、示例与回归**（`4f96af64`）：中英组件页（`#content` 契约、非模态、16 个样式变量）+ 基础 / 内容面板双语示例、侧栏 / 总览 / §11 / §5 登记面、`navigation-menu.e2e.ts` 5 例（点击 / 悬停开合、切换、ArrowDown 与 Esc、面板落在视口内含阴影与描边）。RG R1 `standard` Pass（4 warning / 3 suggest）。

### M5 HoverCard 悬停卡片（3 条）

- **M5-1 组件实现与测试**（`8e9fef8a`）：封装 Reka HoverCard（触发器 / 内容 / 箭头）、`openDelay` / `closeDelay`、方位与偏移；禁用触发器渲染纯按钮（原生 disabled 不拦指针事件，故不接 Reka 触发器），悬停不展开；单测覆盖延迟、聚焦 / Esc、portal 位置与受控 `open`。RG R1 `standard` Reject（1 blocker / 3 warning / 5 suggest）→ R2 `quick` Pass（1 warning / 2 suggest）。
- **M5-2 浮层档位与 E2E 清单**（`1c7a4fdd`）：内容补 `--caomei-hover-card-z-index`（默认 dropdown）、`overlay-panels` 支持 `hover` 打开方式，清单 13 → 14 / 守卫计数 17 → 18；面板断言加唯一性守卫。RG R1 `standard` Pass（1 warning / 3 suggest）。
- **M5-3 文档、示例与回归**（`ed20357a`）：中英组件页（延迟、非模态、禁用语义、`as` 固定为按钮）+ 基础 / 延迟双语示例、侧栏 / 总览 / §11 / §5 登记面、`hover-card.e2e.ts` 5 例（悬停开合、聚焦与 Esc、延迟、禁用不展开、层级 1050）；`check-design-catalog` 新增「已实现组件不得出现在未纳入句」不变式。RG R1 `standard` Pass（2 warning / 4 suggest）。

### M6 导出与 a11y 登记（1 条）

- **M6-1 包根导出与 a11y 受检面**（`8028c513`）：五个组件的包根导出 / Nuxt 清单 / a11y 夹具（预算 92）随各自条目落地；本条补 Nuxt 冒烟（`playground/nuxt` 渲染五组件 + HTML / CSS 标记锚定 `class` 属性形态）并复核 `test` / `check:resolver` / `check:nuxt`。RG R1 `standard` Pass（2 warning / 3 suggest）。

### 阶段总结

- **6 条主线 / 15 条原子条目全部交付**；本阶段不发布，`latest` 维持 `1.4.0`。
- **提交对账**：执行窗口 `git log --oneline --no-merges 4eaa10bc..44acd006` → **21**（16 条条目交付 + 1 条示例资源修复 + 3 条 `docs(plan)` 状态同步 + 1 条前序遗留文档提交）；归档提交另计。推送：M1-1 / M1-2 经 PR #76（`84c83105`，3 提交）、M1-3 与状态同步直推 master（`9bd3ff99` / `0a6851a2`，2 个提交）、M2 ~ M6 经 PR #77（`44acd006`，15 提交含 1 条状态同步），CI 全绿。
- **质量门**：`pnpm test` **214 文件 / 3976 例**；`typecheck` / `typecheck:docs` / `lint:check` / `lint:css` / `lint:md` / `docs:check` / `docs:build` / `governance:check` / `build` / `check:build` / `check:resolver` / `check:nuxt` 全绿；定向 E2E：carousel 5、watermark 4、menubar 4、navigation-menu 5、hover-card 5。
- **长期任务**：第 49 轮（Phase 45 收口门槛复核）已于 2026-11-27 执行（见 [`recurring.md`](./recurring.md) §3），并修复 1 处 Carousel 绕过共享 label 契约的回归；本阶段不发布，发布前复核仍留给发布窗口。
- **wisdom 蒸馏**：`.session/wisdom.md` 活跃 14 条（< 阈值 20，不蒸馏）。

### 回扫口径（三段式）

- **机检面**：`check:governance-records` / `check:planning-numbers` / `check:stage-counts`（无进行中阶段分支）/ `check:stage-progress`（跳过）/ `check:archive-rg-counts` / `check:governance-counts` / `check:archive-index` / `docs:check` / `governance:check` 全绿。
- **人工面**：`todo.md`（清空阶段状态句 / 条目表 / 进度表）/ `roadmap.md`（§1 当前态、Phase 45 行与 §5）/ `todo-archive.md`（本块入窗、Phase 40 迁出、主窗口口径句与行数）/ `archive/index.md`（phase-40 行、文件表与迁出时点）/ `governance/index.md`（归档记录行）逐处核过；`.session` 两份文件同批切到「无进行中阶段」。
- **未处理面**：历史治理记录中指向 `docs/plan/todo.md` 的时点陈述按既有边界不回改；本批无新增失效指针。

### 未覆盖边界

- **发布**：本阶段不发布，`1.5.0` 发布收口（门槛复核 / 发布 / 发布后校验 / 下游回收）未执行。
- **视觉基线**：五个新组件尚未进入 `capture:styles` 采样面，暗色与响应式的像素级回归由 E2E 与后续冻结批次承接。
- **真机验收**：轮播拖拽、水印真实设备像素表现、菜单触屏长按仅浏览器设备视口模拟，无真机执行。
- **E2E 环境**：本机全量 `pnpm test:e2e` 存在 320 视口溢出等既有环境差异（已在 `84c83105` 基线复现，非本阶段引入），以 CI 视觉与质量门为准。

### 遗留与后续候选

- **`1.5.0` 发布收口**：留在 Backlog「已决策待窗口」，2026-11-29 之前不列入规划，等待窗口与用户授权。
- **可选 peer 结构改进**：让「未安装且未使用」也能构建，已登记 Backlog 排期象限，需用户裁定。
- 其余条件触发候选见 [Backlog](./backlog.md)；启动需用户明确授权。
