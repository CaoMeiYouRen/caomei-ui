# 待办事项

本文档记录当前阶段的原子条目与验收状态；准入、命名与阶段衔接规则见 [规划规范](../standards/planning.md)，本文档不重述。

## 当前阶段

> **Phase 7 第一阶段：迁移就绪（momei 优先）** — 2026-09-14 经用户授权启动；范围来自 [Phase 7 第一阶段评估记录](../design/governance/2026-09-14-phase7-first-stage-evaluation.md)。
>
> **阶段目标**：在 momei 实际迁移之前，打通消费与接入通道，补齐迁移高频硬缺口，并前置组件 i18n 注入机制，使组件库达到「可直接迁移」状态。
>
> **阶段非目标（明确不做）**：momei 实际页面替换与其他下游接入（第二阶段）；P1 增强（[Phase 7 第一阶段评估记录 §8](../design/governance/2026-09-14-phase7-first-stage-evaluation.md) M5，延至第二阶段）；P2 低频增强（保留 [Backlog](./backlog.md)）；RTL 与多语种翻译、移动端 / 响应式（Backlog §1.4 / §1.5）；Phase 8 下游兼容性回归机制。
>
> **排序原则**：先改好再迁移；按「优先级 + 依赖关系」排序。i18n 机制（M2）先于组件改造（M3 / M4）；接入通道（M1）可并行，且**本地 link 先行**（首版发布待外部凭据到位后补）。

### 主线 M1：消费路径与 Nuxt 接入

- 执行范围：打通 momei 消费 caomei-ui 的通道（**本地 link 先行**，首版发布待外部凭据到位后补），落地 `caomei-ui/nuxt` 真实集成。
- 非目标：momei 实际页面替换；其他下游接入。
- 最小验收标准：本地 link 冒烟通过（后续发布产物可安装）；`caomei-ui/nuxt` 在最小 Nuxt 4 应用中自动导入组件、注入样式、主题与 SSR 无报错。
- 条目：
  - [x] 本地 link 调试通道（先行：`link:` / `file:` 指引 + 构建产物联调）
  - [ ] 首版发布链路协调（归属 [Phase 5 第二阶段](./roadmap.md)，待 npm 凭据；作为 M1 并行依赖，不在本阶段重复承载）
  - [x] `caomei-ui/nuxt` 真实集成（`@nuxt/kit` 自动导入 + 样式 + 主题 + SSR）
  - [x] 最小 Nuxt 消费冒烟（preset / 暗色 / SSR hydrate）
  - [x] 消费使用文档补全（组合式 API / 图标 / 内建文案，中英），并校正既有文档中的 composables 描述

### 主线 M2：组件 i18n 注入机制

- 执行范围：提供 locale provider 与 `useLocale`；16 个内建文案组件改为消费注入 locale；支持下游注入。
- 非目标：RTL；多语种翻译；移动端。
- 最小验收标准：组件不再硬编码 `defaultLocaleMessages`；下游可注入自定义 locale 且运行时切换生效；中英文档与示例齐备。
- 条目：
  - [x] locale provider 机制（`CaomeiConfigProvider` / `provideLocale` + `useLocale`；合并覆盖与回退）
  - [x] 组件接入批次一（表单类：Input / InputNumber / Password / MultiSelect / AutoComplete / Slider）
  - [x] 组件接入批次二（反馈浮层类：Message / Toast / ConfirmDialog / Dialog / ProgressBar / ProgressSpinner）
  - [x] 组件接入批次三（数据展示类：DataTable / Paginator / Tag / Stepper）
  - [x] 文档与 momei 注入示例（中英）

### 主线 M3：P0 高频增强（迁移硬缺口）

- 执行范围：补齐对象选项映射、Tag / Message 语义形态、InputNumber 分组、Textarea 自动增高、Password 强度反馈。
- 非目标：P1 / P2 项；破坏现有 API 的改动。
- 最小验收标准：API 文档、单元测试与英文文档页齐备；符合设计规范；`pnpm verify` 通过。
- 条目：
  - [x] Select 家族对象选项映射（`optionLabel` / `optionValue` + 非 `string` value）
  - [x] Select 补充 `showClear` / `#option`（清空与自定义选项渲染）
  - [x] Select `filter` 迁移决策（方案 A → `AutoComplete`）：经用户决策（2026-09-15）不在 Select 上实现，改为迁移映射；理由与自由文本差异见 [Backlog](./backlog.md)
  - [x] Tag 语义与形态（severity 映射规范化、`rounded` / `outlined`、`#icon`）——说明：`#icon` 插槽与 `tone` 五档在既有实现中已具备；`outlined` 由 `variant="outline"` 承载、不新增布尔别名（迁移映射见 design-spec §7）
  - [x] Message 形态与尺寸（`variant` `simple`、`size`、severity 映射）——说明：PrimeVue Message 仅 `outlined` / `simple` 两种变体、无 `text`（下游实装的一方源码与类型取证），故不实现 `text`
  - [x] InputNumber 分组与小数位（`useGrouping` / `minFractionDigits` / `maxFractionDigits`）——说明：`useGrouping` 默认 `true` 对齐 PrimeVue（原实现硬编码 `false`，属行为变更）；`precision` 取值域由 0–100 收窄为 0–20（与 `Intl` 小数位选项同域，>20 依赖 ES2023 Intl v3），并修复极大值取整溢出为 `Infinity` 的问题
  - [x] Textarea 自动增高（`autoResize`）——说明：高度由包装层写入内联 `height`，`rows` 保留为初始最小高度；开启时 `resize` 固定 `none`；不设上限，封顶由使用层叠加 `max-height`（迁移映射见 design-spec §7）
  - [x] Password 强度反馈（`feedback`）——说明：默认关闭（PrimeVue 默认开启，本库改为显式开启）；强度规则对齐 PrimeVue 默认正则；文案走内建 locale `password.prompt` / `weak` / `medium` / `strong`，可由同名 label props 覆盖；`mediumRegex` / `strongRegex` 未实现（下游无用量）（迁移映射见 design-spec §7）

### 主线 M4：组件补全（按用量与依赖排序）

- 执行范围：实现 Phase 6 延后的 5 个组件（`DatePicker / Calendar`、`Drawer`、`SplitButton`、`ColorPicker`、`DataView`）。
- 非目标：与该组件无关的长尾候选。
- 最小验收标准：API 文档、单元测试与英文文档页齐备；Alpha 组件补 primitive API 回归测试；`pnpm verify` 通过。
- 条目：
  - [x] DatePicker / Calendar 基础（日期选择 + 格式化；锁 `reka-ui@2.10.4` + 回归）——说明：已交付 `CaomeiCalendar` + `CaomeiDatePicker`（内含 `CalendarPanel` 复用与共享日期转换层，并新增运行时依赖 `@internationalized/date`）；基础形态为「触发按钮 + 日历面板」，不支持手工键入（PrimeVue 为可键入 input，行为差异见 design-spec §7）；`locale` 仅控制日期 / 日历语言，与内建文案语言相互独立。规模超条目估算（原估 8–10 文件 / ~500 行，实际约 42 文件 / src 新增约 1.2k 行），偏差因单一验收条目含组件对 + 共享层 + 新依赖 + 文档/测试/locale 同步
  - [x] DatePicker 时间 / 范围（`showTime` / `hourFormat` / `RangeCalendar`）——说明：时间部分已交付（`showTime` / `hourFormat` / `showSeconds`，面板内为自建时间输入——Reka `TimeField`（2.10.4）的日序判定只识别英文，非英文 12 小时制显示与写回均错）；**范围部分经用户决策（2026-09-15）延后并移入 [Backlog](./backlog.md) §1.1**——momei 快照（2026-09-15）`<DatePicker>` 6 处 / 4 文件、`show-time` 4 处、`selection-mode` 0 处，按真实用量收敛。本批规模 18 文件 / 新增约 727 行（超 10 文件阈值，未超 800 行阈值）
  - [x] Drawer 四向侧滑抽屉（`position`）——说明：封装 Reka 稳定的 Dialog primitive + 四向定位 CSS（**未采用 Reka `Drawer`**：其为 Vaul 形态，`DrawerContentImpl` 不负责面板定位、仅输出 `data-swipe-direction` 与滑动 CSS 变量，封装不减工作量却引入 Alpha 与滑动 / 吸附 / 嵌套状态；momei 3 处用量全为 `position="right"`、零滑动手势）。`position` 默认对齐 PrimeVue 的 `left`；`blockScroll`（本库 `modal` 已含滚动锁，更严格）、`position="full"`、`baseZIndex` / `closeButtonProps` 未实现或未暴露（下游零用量）；新增 `--caomei-color-mask` / `--caomei-shadow-lg` token（Drawer 消费，Dialog 等遗留字面量待迁移）。规模超条目估算（原估 5–7 文件 / ~350 行，实际 27 文件 / 新增约 1.4k 行，其中 src 组件约 0.75k），偏差因单一验收条目含组件 + locale 命名空间 + 中英文档与 8 个示例（中英各 4）。Review Gate 两轮（首轮 Reject：locale 指南命名空间计数未同步 → 修复后 Pass）
  - [x] SplitButton 分裂按钮——说明：自建（`CaomeiButton` + `CaomeiDropdownMenu` 组合，两按钮拼接复用 `CaomeiButtonGroup`；Reka `Splitter` 为分栏布局、不适用）。主按钮触发 `click`，可见文本走默认插槽，`label` 为**不可见可访问名**（遵循 `development.md` 的全局 `label` 约定，图标按钮场景使用）；下拉按钮展开 `model`（`label` / `icon` / `command` / `disabled` / `separator`），两按钮共用 `variant` / `tone` / `size` / `rounded`，`disabled` 双禁、`loading` 仅主按钮。`icon` 迁移改传 `@lucide/vue` 组件（非字符串类名）；`MenuItem.items` 子菜单 / `url` / `menuButtonIcon` / `menuButtonProps` / `appendTo` / `fluid` 等未实现（下游零用量）。规模超条目估算（原估 4–6 文件 / ~250 行，实际 23 文件 / 新增约 0.88k 行），偏差因单一验收条目含组件 + locale 命名空间 + 中英文档与 4 个示例，且验收标准（API 文档 + 单测 + 英文文档页）本身要求这些交付物同批完成，故不拆分条目。Review Gate 两轮（首轮 Reject：`label` 与全局约定冲突、规模偏差未登记 → 修复后复）
  - [x] ColorPicker 颜色选择器——说明：封装组合 Reka ColorArea / ColorSlider / ColorField（Alpha，锁 `reka-ui@2.10.4`）；预设色板为自建 `role="group"` + `aria-pressed` 按钮组（未采用 Reka `ColorSwatchPicker`，理由见 design-spec §7）。`v-model` 为标准 CSS 颜色字符串，`format`（`hex` / `rgb` / `hsb`）决定序列化形式；支持 `inline` / `showInput` / `swatches` / `disabled` / `invalid`，空值或非法值回退 `defaultColor` 且不写回模型；触发按钮与面板内可聚焦控件（区域 / 色相 thumb、输入框、色板按钮）的可访问名与 `aria-roledescription` 均走内建 locale 文案（色板以 `aria-pressed` 表达选中态）。**已知行为差异**：PrimeVue `format="hex"` 为不带 `#` 的 6 位十六进制（本库统一带 `#`，迁移时可移除下游 `replace('#','')` 适配）；`format="hsb"` 序列化为 `hsb(h, s%, b%)`；透明度不支持（带 alpha 输入按 6 位十六进制归一）、`appendTo` / `overlayClass` / `panelClass` 未实现（下游零用量）。规模超条目估算（原估 6–9 文件 / ~400 行，实际 23 文件 / 新增约 1.0k 行），偏差因单一验收条目含组件 + 内嵌面板组件 + locale 命名空间 + 中英文档与 4 个示例，且验收标准（API 文档 + 单测 + 英文文档页）要求同批完成，故不拆分条目。Review Gate 经五轮收敛并关闭全部 blocker（面板可访问名未落到可交互控件；区域取值空间 HSL/HSB 不一致致 thumb 与播报值错位；输入框聚焦时点击被 blur 旧值覆盖；色相轨道因 `display:inline` 为 0×0、渐变不可见；区域 thumb 未嵌套于 area 致方向键与抓拽失效）；修复后定向单测 28 通过、浏览器验证 0 失败、`pnpm verify` 通过。经**用户决策（2026-09-15）收束审查时间盒并提交**，未再取得新一轮 Pass；残余项已全部修复（2026-09-15 follow-up）：`aria-roledescription` 本地化（`Color picker`/`Color thumb` → locale）、区域 `aria-valuenow`/`aria-valuetext` 改用 `update:color` 的未量化值实现与 thumb 三者同源、色板改自建 `role="group"` + `aria-pressed` 按钮组使按下态随当前颜色实时同步（并消除 Reka `ColorSwatchPicker` 的英文色名与抢焦点问题）
  - [ ] DataView（`layout` grid / list + 插槽）

> **M5（P1 增强）已延至第二阶段**（2026-09-14 用户决策）：Image 预览、ProgressSpinner 线宽、Dialog 形态断点、DataTable 剩余迁移项，由 momei 迁移实际暴露驱动；详见 [Phase 7 第一阶段评估记录 §8](../design/governance/2026-09-14-phase7-first-stage-evaluation.md) 与 [路线图 Phase 7](./roadmap.md)。

## 阶段验收通则

完成条件见 [路线图 §4](./roadmap.md)；每个原子条目收尾必须经 `@code-reviewer` Review Gate，涉及界面或样式时另经 `@ui-validator` 验证。

## 完成情况概览

> 本节仅汇总未完成项以供跨阶段可见，**不构成阶段待办登记**（登记需用户明确决策）。

- 已归档：Phase 0 ~ Phase 4、Phase 5 第一阶段、Phase 6。
- 进行中：Phase 7 第一阶段（迁移就绪，momei 优先）。
- 未启动 / 未完成：Phase 5 第二阶段（首版发布 / 首个下游接入，待外部前置）、Phase 7 第二阶段（momei 迁移闭环 + P1 增强）、Phase 8（下游兼容性回归，稳定后启用）；范围见 [路线图](./roadmap.md)。
- 未纳入本阶段的候选：P1 增强（延至 Phase 7 第二阶段）、Phase 6 遗留 Button 角标（`:badge`）、P2 低频增强、组件国际化多语种翻译与 RTL、移动端与响应式，详见 [Backlog](./backlog.md) 与 [Phase 7 第一阶段评估记录](../design/governance/2026-09-14-phase7-first-stage-evaluation.md)。
