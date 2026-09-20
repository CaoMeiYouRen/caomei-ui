# momei 迁移可行性评估记录

- 日期：2026-09-17
- 触发：Phase 10 的**阶段尾部再评估点**（用户决策 2026-09-16：本轮结束后正式进入「momei 迁移可行性评估」，先出可行性结论再定迁移范围；属 Phase 7 第二阶段的前置评估）
- 输入：既有台账 [momei 组件使用复核台账](./2026-09-14-momei-usage-audit.md)（2026-09-14）、[Phase 7 第一阶段评估记录](./2026-09-14-phase7-first-stage-evaluation.md)、两仓当前源码
- 方法：**只读**静态比对——momei 侧重新统计组件 / 属性 / 图标 / 样式耦合 / 测试耦合；caomei-ui 侧逐项核对台账 §4.1 / §4.2 在当前源码的覆盖状态。**未运行**任一仓库的构建或测试，未改动任何代码。
- 取数快照：两仓均取 2026-09-17 本地工作区（caomei-ui `b9036c6`；momei `cb663aee`，工作区含一处未提交 `AGENTS.md`，与本次统计无关）
- 口径说明：momei 组件用量统一按「`.vue` 内开标签计数」，带 TS 泛型守卫（`(?<![\w$])<([A-Z]…)` + `\b` 尾断言）；属性计数用 quote-aware 解析并**合并** `attr` 与 `:attr`；样式耦合按 `--p-*`（token）与 `p-*`（组件 class）分开计数（负向后顾排除 `--p-`）

## 1. 结论摘要

**结论：可行（有条件）**——momei 迁移到 caomei-ui **不存在不可逾越的能力阻塞**；剩余缺口全部是「库侧可补的增强」或「一次性机械改写」，无「PrimeVue 有、caomei-ui 结构上做不到」的能力。三个先决条件：

1. **DataTable 列级插槽先行**（**组件能力面**唯一结构性差距；样式与主题耦合另见先决条件 2）：momei 用 `<Column>` 153 次、其中 `#body` 123 次、`slotProps` 163 处（11 文件）；caomei-ui 的列定义是 `columns` prop + `cell` 函数，没有列 `#body` / `#header` 插槽。要么库侧补列插槽，要么在 20 个列表页把模板逻辑改写成 render 函数（成本与可维护性都更差）。**后续进展（2026-09-17）**：该先决条件已满足——库侧交付 `#cell-{key}` / `#header-{key}` 列插槽（见[设计规范 §7](../../design/design-spec.md)）；迁移时请以该节的现行映射为准。
2. **主题映射表与视觉基线先行**：momei 对 PrimeVue 的样式耦合是迁移面里最大且最不可机械化的部分（`--p-*` token 引用 1312 处、含 PrimeVue 选择器的 SCSS 20 个文件、组件 class 190 处、`:deep(` 119 / `:global(` 47）。需先产出 `--p-*` → `--caomei-*` 对照表，并在迁移前采集视觉基线（计算样式 / 截图）。
3. **分批 + 关键路径先行 + 并存白名单**：不要一次性切库；按「库侧补齐 → 数据类页面 → 表单与设置页 → 展示与浮层 → 收尾」五批推进，双库并存期按路由 / 页面白名单隔离，避免全局并存。

**用户决策（2026-09-17）**：按 **C3 分批全量**执行；**先做 B1 库侧补齐**；B 级 **14 项全部纳入执行**（**范围登记，非「已交付」**）；**接受** 16 条有意差异；回归强度由**每周回归任务跑 momei 的测试**承载（不要求每批跑 momei 全量 E2E）。详见 §7。

**工作量画像**（不是工期，是可复现的规模口径）：迁移面 **1515 个组件开标签 / 148 个 `.vue`**（占 momei 应用页面 179 个的 83%）；图标 **598 处 / 134 文件 / 128 个唯一图标**；样式耦合 **token 1394 处 + SCSS 20 文件 + class 190 处**；命令式 API **43 个 `.vue`（useToast 33 / useConfirm 10）**；测试耦合 **21 个文件**。

**关键正面事实**：① caomei-ui 侧台账 §4.1「需新组件 11 项」**已 11/11 交付**（其中 Panel 按阶段决策由 `CaomeiCard` 承载）；② §4.2「需增强」条目**受检 24 项：完全交付 8 / 部分交付 16 / 完全未交付 0**（口径见 §3.2）；③ momei 自 2026-09-12 起无提交，**用量与 2026-09-14 台账逐项一致**（59 组件 / 1515 用法，Δ 全为 0）——评估结论不会因样本漂移而失效；④ caomei-ui 已具备迁移所需基础设施：`caomei-ui/nuxt` 模块、`caomei-ui/resolver`、`caomei-ui/styles.css`（**后续更新：2026-09-20 Phase 11 M1-3 起基础层入口改为 `caomei-ui/theme.css`，组件样式随模块自带**）、主题预设（含 `momei` 预设）、`CaomeiConfigProvider` i18n 注入、`check:nuxt` 消费冒烟；⑤ 运行时依赖仅 4 个（`reka-ui@2.10.4` 精确锁定 / `@tanstack/vue-table` / `@internationalized/date` / `@lucide/vue`）。

## 2. momei 侧现状快照（2026-09-17）

### 2.1 集成方式

| 项 | 事实 |
| --- | --- |
| PrimeVue | `primevue@4.5.5`（`^4.5.5`）、`@primevue/nuxt-module@4.5.5`、`@primeuix/themes@2.0.3`、`primeicons@8.0.0` |
| 接入 | Nuxt 模块（`nuxt.config.ts:76`）；主题 `definePreset(Aura, …)`（`nuxt.config.ts:1-67`）、`darkModeSelector: '.dark'`、CSS layer `primevue, momei-base, momei-overrides`；locale `zh_CN` |
| 显式导入 | 以 Nuxt 自动导入为主；显式 `from 'primevue/*'`：`usetoast` 18、`useconfirm` 14、其余零散 |
| unstyled / `pt` | 无全局 unstyled；`pt` 仅 2 个文件（`components/app-search.vue`、`components/admin/posts/post-audit-badge.vue`） |
| Tailwind | **未使用**（也未装）——迁移不涉及 utility 框架迁移 |
| `@primevue/forms` | 依赖存在但**零使用** |

### 2.2 用量（与 2026-09-14 台账同口径）

| 指标 | 2026-09-14 | 2026-09-17 | Δ |
| --- | ---: | ---: | ---: |
| PrimeVue 组件数 | 59 | 59 | 0 |
| 开标签用法 | 1515 | 1515 | 0 |
| 涉及 `.vue`（并集） | 100+ | 148（应用 `.vue` 共 179） | — |

> 唯一口径差异：台账 §3.2 记 `Tag 127 / 51 文件`，本次为 `127 / **50**`——旧口径把 `components/admin/marketing-campaign-form.vue` 的 TS 泛型 `ref<Tag[]>` 误计为组件标签（该文件无 `<Tag>` 标签），本次泛型守卫已排除；**用法计数不受影响**。

Top 10 热点：Button 356、InputText 178、Column 153、Tag 127、Select 73、Message 51、ToggleSwitch 47、InputNumber 39、Dialog 37、Divider 37。

### 2.3 迁移面驱动项（决定工作量的量）

| 类别 | 计数 | 口径 / 说明 |
| --- | ---: | --- |
| 图标字符串 `pi pi-*` | **598 处 / 134 文件 / 128 唯一** | lucide / iconify / heroicons / tabler 导入均为 0；`@mdi/font` 仅 2 处——图标体系**整体改写** |
| PrimeVue 主题 token `--p-*` | **1394 处**（其中 `var(--p-*)` 实际引用 1312） | Top 前缀 `--p-surface` 492、`--p-text` 381、`--p-primary` 252、`--p-content` 126 |
| PrimeVue 组件 class `p-*` | **190 处 / 47 文件** | Top：`p-button` 39、`p-error` 19、`p-datatable` 18、`p-dialog` 17、`p-invalid` 13 |
| 含 PrimeVue 选择器的 SCSS/CSS | **20 文件**（最大 623 行；`.p-*` 选择器 61 处） | `:deep(` 119、`:global(` 47——打穿组件内部结构 |
| 命令式 API | `useToast` 33 个 `.vue`、`useConfirm` 10 个 `.vue`（含 composables/.ts 共 45 / 15 文件） | `useDialog` / `$primevue` 均为 0 |
| 锚点式浮层调用 `.toggle(event)` | **6 处 / 5 文件** | `app-notifications` / `app-header` / `language-switcher` / 两个 voice overlay |
| 列模板体系 | `<Column>` 153（20 文件）、`#body` 123、`slotProps` 163（11 文件） | 迁移的最大结构性改写面 |
| 测试耦合 | vitest 中 `vi.mock('primevue/*')` **18 文件**（usetoast 15 / useconfirm 5 / config 1）；E2E `p-*` class 断言 **23 处 / 3 文件** | 迁移需同步改写 |
| i18n 集成 | `plugins/primevue-i18n.ts`（用 `usePrimeVue()` 同步 `primelocale`）+ `nuxt.config.ts` 模块 locale 配置 | 替换为 `CaomeiConfigProvider` / `caomei-ui/nuxt` |

### 2.4 逐属性的机制差异（需改写的调用点）

| PrimeVue 用法 | 处数 | caomei-ui 对应 | 性质 |
| --- | ---: | --- | --- |
| Button `severity` / `text` / `outlined` / `rounded` / `icon` | 192 / 164 / 35 / 103 / 253 | `tone` + `variant` / `variant="ghost"` / `variant="outline"` / `rounded` / `#icon` 插槽 | 机械改写（`severity` 语义映射需确认） |
| Tag `severity` | 125 | `tone`（`secondary` / `contrast` / `info` 为有损近似） | 机械改写 + 语义确认 |
| Message `severity` / `variant` | 51 / 14 | `tone` / `variant`（`simple` 已交付；`text` 一方取证不存在） | 机械改写 |
| Select `fluid` / `filter` / `option-label` / `option-value` / `showClear` | 37 / **2** / 66 / 66 / 0 | `fluid` 需**删除**（本库默认 `width: 100%`）；`filter` 映射到 `CaomeiAutoComplete`（用户已决策方案 A）；对象选项映射已交付。同类计数：`DatePicker` `fluid` 2 处 / 2 文件（见 §4 #9） | 2 处需改组件（其余机械） |
| Dialog `v-model:visible` / `header` / `breakpoints` / `modal` | 28 / 35 / 2 / 36 | `v-model:open` / `title`（必填）/ 未实现 / `modal` | 机械 + 2 处需方案 |
| DataTable `lazy` / `selection-mode` / Column `selection-mode` / `frozen` | 13 / 0 / 2 / 1 | 已交付（`lazy` / `selectionMode` / `frozen`）；列级 `selection-mode` 与 `align-frozen` 经用户决策（2026-09-17）**收敛为迁移映射、不新增 API**（`align-frozen` → `frozen: 'left' \| 'right'`；列级 `selection-mode` → 表格级 `selectionMode`，选择列固定首列） | 全部已覆盖 |
| Paginator `v-model:first` / `template` / 每页条数 | 3 / 1 / 0 | `v-model:page`（模型不同）/ 未实现 | 3 处需改写 |
| DatePicker `show-time` / `hour-format` / `show-seconds` / `date-format` / `show-icon` | 4 / 4 / 2 / 2 / 3 | 全部已交付；**不支持手工键入**（触发按钮 + 面板）、无范围选择 | 机械（momei 无 `manual-input` / `selection-mode` 用法） |

## 3. caomei-ui 侧覆盖状态（2026-09-17）

### 3.1 台账 §4.1 需新组件（11 项）：**11/11 已交付**

Divider（37）、Drawer（3）、Stepper 系列（1 处 / 6 个 StepPanel）、DatePicker + Calendar（6）、InputGroup + FloatLabel（6）、Panel（3，按决策由 `CaomeiCard` 的 `title` / `#header` / `#extra` / `#footer` 承接）、SplitButton（2）、AutoComplete（2）、ColorPicker（2）、ButtonGroup（1）、DataView（1）。全部可在当前 `src/components/**` 找到对应目录与导出（逐项 Props / 插槽证据见 §3.2 同源核对；导出面见 `src/index.ts` 与 `src/components/<name>/index.ts`）。

### 3.2 台账 §4.2 需增强：**受检 24 项 = 完全交付 8 / 部分交付 16 / 完全未交付 0**

**受检口径**：台账 §4.2 的 20 条明细按组件展开——`DataTable + Column` 由 1 条拆为 2 项（+1）、`Select / Dropdown / MultiSelect / SelectButton` 由 1 条拆为 3 项（+2，`Dropdown` 为 Select 旧名不另计）⇒ **23 项**；加台账 §4.1 注中降级为 Input 插槽的便利项 `IconField` / `InputIcon` 1 项 ⇒ **受检 24 项**（完全交付 8 + 部分交付 16）。下表 16 个数据行为其中**部分交付（16）**的明细，末行 C 级为 5 个 §4.1 组件的**有意差异**汇总（**不属于上述 24 项**）。

**已完全交付（8）**：Select（含 `optionLabel` / `optionValue` 支持 number / `showClear` / `#option`）、SelectButton、Message、Tag、InputNumber（`useGrouping` / 小数位）、Textarea（`autoResize`）、Password（`feedback`）、IconField + InputIcon（由 `Input` 的 `#prefix` / `#suffix` 承载，无独立组件）。

**部分交付（16）——剩余缺口清单（按是否阻塞迁移分级）**：

| 级别 | 组件 | 缺失能力 | momei 用量 |
| --- | --- | --- | --- |
| **A 结构性（关键路径）** | DataTable / Column | 列 `#body` / `#header` 插槽（现仅 `cell` 函数）、列级 `selection-mode`、`align-frozen`。**后续进展（2026-09-17）**：列插槽已交付为 `#cell-{key}` / `#header-{key}`（见[设计规范 §7](../../design/design-spec.md)）；列级 `selection-mode` 与 `align-frozen` 经用户决策收敛为迁移映射、不新增 API | `<Column>` 153 / 20 文件、`#body` 123、列 `selection-mode` 2、`frozen` 1 |
| B 需增强（**共 14 项**，可绕行但留债） | MultiSelect | `#option` 插槽、`showClear` | 8 / 4 文件 |
| B | Paginator | 每页条数选择、`template` | 用量 3；缺 `rowsPerPageOptions`（momei 用量 0）与 `template`（momei 用量 1）的能力支持 |
| B | Image | `preview` 点击放大 / 遮罩、`#indicatoricon` | 11 / 10 文件 |
| B | ProgressSpinner | `strokeWidth` / `animationDuration` prop（现仅 CSS 钩子）、任意 px 尺寸 | 14 / 13 文件 |
| B | Dialog | `showHeader`、`breakpoints`、`@hide`、`title` 可选化 | 37 / 32 文件；`breakpoints` 2、`header` 35 |
| B | Toolbar | `#start` / `#center` / `#end` 分区插槽 | 1 |
| B | ConfirmDialog | `useConfirm` 的 `icon` | 6 |
| B | Checkbox | 分组值数组（CheckboxGroup） | 20 / 13 文件 |
| B | Switch | `change` 事件（现仅 `update:modelValue`） | 47 / 16 文件 |
| B | DropdownMenu | `:model` 数据驱动、`:popup`、`toggle(event)` 锚点、`command` / `separator` 项模型 | 3（Menu） |
| B | Popover | 命令式 `toggle(event)` / `show(event)` 锚点定位 | 5 / 4 文件；`.toggle(` 6 处 / 5 文件 |
| B | FileUpload | `mode` / `maxFileSize` / `auto` / `chooseLabel`、上传事件 | 1 |
| B | ToggleButton | `onLabel` / `offLabel` | 1 |
| B | Button | `:badge` 角标 | 2 |
| C 可接受差异 | Drawer / ColorPicker / SplitButton / DataView / DatePicker | 见 §4 有意差异清单（多为下游零用量项）与 [设计规范 §7](../../design/design-spec.md) 的已知差异登记 | — |

### 3.3 迁移支撑能力（均已交付）

| 能力 | 落点 |
| --- | --- |
| Nuxt 模块（组件 + composables 自动导入、样式注入、theme token 覆盖、darkMode 策略） | `src/nuxt/module.ts`（组件清单 77 项） |
| 自动导入 resolver | `src/resolver/index.ts`（子路径 `caomei-ui/resolver`） |
| 样式与主题 | `src/styles/index.css`（`styles.css` 154 KB）；预设 `caomei` / `momei`（含暗色与 `auto`）；`theme.css` 支持 `.dark` / `[data-theme=dark]` / `prefers-color-scheme`。**后续更新（2026-09-20 Phase 11 M1-3）**：产物改 `unbundle + css.inject`，单体 `styles.css` 不再产出，基础层入口为 `caomei-ui/theme.css`，组件样式随模块自带 |
| i18n 注入 | `CaomeiConfigProvider` + `provideLocale` / `useLocale`；内建 5 语种（zh-CN / en-US / zh-TW / ja-JP / ko-KR） |
| 消费冒烟 | `pnpm test:nuxt-smoke`（构建 + `check:nuxt`：软链 fixture → `nuxt generate` → SSR / CSS 断言），已纳入 `verify` |

## 4. 有意差异清单（迁移时须逐条确认）

自 `docs/design/design-spec.md` §7 与 `docs/plan/todo-archive.md`（Phase 7 第一阶段偏差）抽出与 momei 迁移直接相关的条目：

| # | 差异 | 对 momei 的影响 |
| --- | --- | --- |
| 1 | Select `filter` 不实现，映射到 `AutoComplete` | **2 处** `Select` 带 `filter`（`settings-profile.vue`、`admin-taxonomy-page.vue`）需改组件；其余 71 处不受影响 |
| 2 | DatePicker 不支持手工键入 | momei 无 `manual-input` 用法 → 无影响 |
| 3 | DatePicker 无 `selection-mode`（范围选择） | momei 无用法 → 无影响 |
| 4 | Drawer 缺 `position="full"` / 生命周期事件 / `#closebutton` 等 | momei 3 处均为 `position="right"` → 需逐处核对是否有事件依赖 |
| 5 | Drawer `modal=true` 即锁滚动（PrimeVue `blockScroll` 默认 false） | 迁移后行为更严格，需 UI 复核 |
| 6 | Dialog `title` 必填、窄屏不转全屏 | 35 处 `header` → `title`；窄屏形态**已由用户决策**（Phase 10 M2：「Dialog 转全屏不作为默认行为」，见 [待办归档](../../plan/todo-archive.md) 的 Phase 10 段与[响应式设计](../responsive.md)），迁移按现决策执行 |
| 7 | Message 无 `text` 变体（PrimeVue 亦无，属台账误记） | 无影响 |
| 8 | Tag 不提供 `outlined` / `severity` / `value` 别名 | 125 处 `severity` → `tone`（语义映射需确认 `secondary` / `contrast` / `info`） |
| 9 | Select / MultiSelect `fluid` 需删除 | 37 + 5 处；**同类 `DatePicker` `fluid` 2 处 / 2 文件**（快照 `cb663aee` 只读统计，命令见表下注），`DatePicker` 默认带 `20rem` 宽度上限，需要真正全宽时覆盖 `--caomei-date-picker-max-width: none` |
| 10 | Password `feedback` 默认 `false` | 32 处；8 处显式传 `feedback` → 建议迁移时显式声明 |
| 11 | InputNumber `useGrouping` 默认 `true` | 39 处；需确认展示形态变化（千分位） |
| 12 | ColorPicker `format` 语义差异（hex 带 `#`、rgb/hsb 为字符串、无 alpha） | 2 处，需逐处核对 |
| 13 | DataView 无分页 / 排序，`loading` 为本库新增 | 1 处，影响小 |
| 14 | DataTable 首次点击排序为升序（`sortDescFirst: false`） | 20 文件，需确认与 PrimeVue 默认一致 |
| 15 | Panel 由 Card 承接 | 3 处需改写 |
| 16 | 触摸目标维持现状（< 44px） | 管理端为主，影响有限 |

> 第 9 行的 `DatePicker` 计数复现命令（在 momei 仓库根、快照 `cb663aee`、只读执行）：处数 `rg -U -o '<DatePicker\b' --glob '*.vue' | wc -l` = 6；文件数 `rg -U -l '<DatePicker\b' --glob '*.vue' | wc -l` = 4；带 `fluid` 的文件 `rg -U -l '<DatePicker[^>]*\bfluid\b' --glob '*.vue'` = 2，且这两个文件各含 1 个 `DatePicker` 标签，故「2 处 / 2 文件」。

## 5. 风险与反面验证

**主要风险（按影响排序）**：

1. **DataTable 是关键路径且存在结构性差距**：20 个列表页是 momei 管理端主路径（`/admin/posts`、`/admin/users`、`/admin/friend-links`、`/admin/ai/*`）。列 `#body` 插槽缺失意味着要么先补库能力，要么在 20 个文件里把声明式模板改写成 render 函数（20 个文件 × 最多 21 个 `<Column>`，含 `slotProps` 的 scoped slot 结构）——后者把声明式模板变成命令式渲染，**建议优先做库侧补齐**。**该风险已于 2026-09-17 消解**：库侧列插槽已交付，且库侧补齐路径被采纳。
2. **样式与主题耦合是最大盲区**：1312 处 `var(--p-*)` + 20 个 SCSS 文件 + 119 处 `:deep()` 说明 momei 大量依赖 PrimeVue 内部结构；caomei-ui 的「极简样式 + token 覆盖」需要逐项建立映射并做视觉回归。这是唯一「无法靠计数判断完成度」的部分，必须用计算样式 / 截图基线闭环。
3. **双库并存期**：两套主题 token（`--p-*` 与 `--caomei-*`）+ 两套组件样式会同时进入产物，PrimeVue 使用 CSS `@layer`；并存期需按路由 / 页面白名单隔离，并监控包体。
4. **命令式 API 与锚点定位**：`useToast`（33 个 `.vue`）/ `useConfirm`（10 个 `.vue`）是机械映射，但 `.toggle(event)`（6 处 / 5 文件）依赖「以事件坐标为锚点」的浮层定位，caomei-ui 现为声明式 trigger——这 5 个文件需要结构改写（或库侧补命令式入口，属 Backlog §1.1 的 `useDialog` 同类候选）。
5. **SSR / hydration 与测试**：momei 为 Nuxt 4 SSR，两侧组件都用 portal / teleport，迁移后需 hydration 与稳定性复核；测试侧 18 个 mock 文件 + 3 个 E2E 文件需同步改写。
6. **momei 视觉期望高**：`--p-*` 用量与 SCSS 覆盖深度说明 momei 已把 Aura 调成自己的设计语言；caomei-ui 需在 `momei` 预设与 token 覆盖面上证明能达到同等观感（预设已存在，但覆盖点完备性未验证）。

**反面验证（替代方案对照）**：

| 方案 | 优点 | 代价 / 风险 | 评估 |
| --- | --- | --- | --- |
| C1 不迁移（维持 PrimeVue） | 零成本、零风险 | 组件库统一目标落空；Phase 6 / 7 第一阶段的投入仅服务其他下游；PrimeVue 与 caomei-ui 长期双轨 | 与既定方向冲突，**不建议** |
| C2 部分迁移（新页面 / 新组件用 caomei-ui，存量不动） | 增量风险最小、随时可停 | 双库**长期**并存（包体、两套主题、两套心智）；且 momei 是「验证其他下游可行性」的样本，部分迁移**无法验证闭环** | 可作为过渡策略，不宜作为终态 |
| C3 全量迁移（分批） | 一次闭环，形成可复用的下游迁移范式 | 需先决条件（§1 三条）与持续投入；迁移期回归风险集中 | **推荐方向**（已被用户采纳，见 §7） |

**结论**：能力面已无阻塞，风险集中在「DataTable 列插槽」与「样式 / 主题映射」两处；两者都可以用「先补库、后迁移」的顺序化解——这正是 Phase 7 第一阶段确立的「先改好再迁移」原则的延续。

## 6. 分期（B0~B4，已被用户采纳）

| 批次 | 内容 | 出口条件 |
| --- | --- | --- |
| B0 准备（库侧 + momei 侧） | `--p-*` → `--caomei-*` token 对照表；128 个 `pi pi-*` → lucide 图标映射表；双库并存隔离策略（路由白名单）；视觉基线采集（列表 / 表单 / 浮层各 1 页） | 两张映射表评审通过；基线可复现 |
| B1 库侧补齐（**先决，先行**） | A 级：DataTable 列插槽 `#cell-{key}` / `#header-{key}`（**2026-09-17 已交付**）；`align-frozen` 与列级 `selection-mode` 经用户决策（2026-09-17）**收敛为迁移映射、不新增 API**；B 级 **14 项全部纳入 B1 执行**（**范围登记，非「已交付」**；含评估曾建议延后与并入 B4 的 4 项）：Image `preview`、ProgressSpinner `strokeWidth`、Toolbar `#start/#center/#end`、Dialog `showHeader` / `breakpoints` / `@hide`、ConfirmDialog `icon`、CheckboxGroup、Switch `change`、Paginator 每页条数、MultiSelect `#option` / `showClear`、Button `badge`、Popover 命令式（或迁移写法指引）、DropdownMenu `:model` / `:popup` / `toggle(event)`、FileUpload `mode`/`maxFileSize`/`auto`/`chooseLabel`、ToggleButton `onLabel`/`offLabel` | 每个补齐项带单测 + 文档；DataTable 列插槽有迁移示例（中英） |
| B2 数据类页面迁移 | 20 个 `<Column>` 文件（`/admin/posts`、`/admin/users`、`/admin/friend-links`、`/admin/ai/*`、`/admin/migrations/*`） | 列表功能（排序 / 分页 / 选择 / 列插槽）逐页回归；视觉基线与 B0 一致 |
| B3 表单与设置页面迁移 | `components/admin/settings/*`、`components/installation/*`、auth / submit / register 等表单页 | 表单交互（校验 / 提交 / 提示）回归；`useToast` / `useConfirm` 映射完成 |
| B4 展示、浮层与收尾 | 展示类组件、浮层（Dialog / Drawer / Popover / DropdownMenu）、`.toggle()` 结构改写、图标全量替换、i18n 插件替换、测试与 E2E 改写、卸载 PrimeVue | 全量测试与 E2E 通过；`pnpm test:nuxt-smoke` 等价冒烟通过；包体对比记录 |

**回归强度（用户决策）**：由**每周回归任务跑 momei 的测试**承载，不要求每批都跑 momei 全量 E2E。现成承载者为 momei 的 [`Weekly Regression`](https://github.com/CaoMeiYouRen/momei/blob/master/.github/workflows/regression-weekly.yml)（cron 每周五 12:00，跑 `pnpm run regression:weekly` + typecheck + build + lint:css / lint:md + 包体预算 + 覆盖率）。若还需「caomei-ui 变更即验证 momei」的**跨仓**触发，属 [Phase 8 下游兼容性回归机制](../../plan/roadmap.md)（历史预留编号，未启动）范围，需另行授权。

## 7. 用户决策（2026-09-17）

| # | 决策项 | 结论 |
| --- | --- | --- |
| 1 | 迁移方案（C1 / C2 / C3） | **C3 分批全量推进**（按 §6 的 B0~B4 五批） |
| 2 | 是否先做 B1 库侧补齐 | **先做 B1**（含 A 级 DataTable 列插槽与 B 级增强） |
| 3 | B 级增强取舍 | **14 项全部纳入执行**（**范围登记，非「已交付」**；全部纳入 B1 执行，不再分批取舍，含评估曾建议延后的 4 项） |
| 4 | 16 条有意差异的接受度 | **接受**（含 `Select filter → AutoComplete`、`Tag severity → tone`、`Dialog title` 必填等影响面最大的三条） |
| 5 | 双库并存期的回归强度 | **在每周的回归任务中跑 momei 的测试**（不要求每批跑 momei 全量 E2E；跨仓触发另属 Phase 8 范围） |

**登记去向**（本次记录同步更新）：

| 载体 | 变更 |
| --- | --- |
| [待办事项](../../plan/todo.md) | **2026-09-17 阶段启动登记**：Phase 7 第二阶段登记为本仓当前阶段（定位 / 目标 / 非目标 / 用户决策 + M1 ~ M6 六条主线），M1 ~ M5 拆分为原子条目（M1-1 先行交付），M6 为等待期滚动主线。**口径**：登记以 `todo.md`「当前阶段」段为准，「完成情况概览」仅为状态指针 |
| [迁移计划与验收标准](./2026-09-17-momei-migration-handover-plan.md) | 新增交接文档（M1-1 先行交付）：批次划分与执行主体、前置条件、开工顺序、每批出口条件、16 条有意差异逐条核对清单、视觉基线方法与判定口径、回归口径、包体对比要求、逐批「文件 → 改动点」清单产出要求 |
| [Backlog §1.8](../../plan/backlog.md) | 三行同步新口径：「momei 迁移执行」标注「执行主体为 momei 项目、本仓等待反馈」；「库侧增强清单（B1）」标注「已登记 Phase 7 第二阶段 M3 / M4 / M5，本仓执行」；「下游兼容性回归机制」标注「本阶段不启用跨仓触发」。M6 的去向以 §1.8 表后引用块标注（§1.1 / §1.2 / §1.6 各行保持原状） |
| [路线图](../../plan/roadmap.md) | Phase 7 第二阶段行与说明块的范围口径改为「库侧就绪 + 迁移计划 / 验收标准；momei 侧执行由 momei 项目负责」；状态行同步；§5 归档索引补列 Phase 10（原漏列缺陷） |
| [治理索引](./index.md) | 本记录条目范围指针随本表更新；新增交接文档条目 |

> **后续**：Phase 7 第二阶段已于 2026-09-17 授权启动、2026-09-19 完成并归档；上表为启动时登记去向的快照，现行状态以[路线图](../../plan/roadmap.md)与[待办归档](../../plan/todo-archive.md) 为准。

**未决 / 待办（执行前）**：

- **原子条目拆分已完成（2026-09-17）**：M1 ~ M5 已按[规划规范 §4](../../standards/planning.md) 拆为原子条目；M3（DataTable 列插槽）优先于 M4 / M5，主线内按该表自上而下；开工顺序见[交接计划 §4](./2026-09-17-momei-migration-handover-plan.md)。**Phase 7 第二阶段已于 2026-09-19 全部交付并归档**，登记、交付与遗留偏差清单见[待办归档](../../plan/todo-archive.md)。
- **视觉基线采集归 momei 侧**：本仓只提供采集方法与判定口径（[交接计划 §7](./2026-09-17-momei-migration-handover-plan.md)），不代为执行、不代为产出基线。
- **B2 ~ B4 由 momei 项目执行**（在其仓库）：本仓等待其反馈后再决定下一轮动作；本阶段不启用「caomei-ui 变更即验证 momei」的跨仓触发（属 Phase 8）。
- ~~Phase 10 收口~~（**已完成 2026-09-17**）：M1 三语文案复核已完成（三语无明显错误、2 处 zh-TW 措辞修正、标注已移除，结论见[语言矩阵评估记录 §9.1](./2026-09-16-language-matrix-midterm-evaluation.md)）；阶段已归档（见[待办归档](../../plan/todo-archive.md)），长期任务触发义务已按[长期任务](../../plan/recurring.md)第 3 轮执行并留痕。
- 迁移执行前确认 momei 工作区干净（本次快照含一处未提交 `AGENTS.md`）。

## 8. 未覆盖与后续

- 本评估为**静态比对**：未运行 momei 构建 / 测试，未实测迁移后的视觉与性能；包体影响（PrimeVue 卸载前后的产物对比）需在执行阶段实测。
- 未评估**其他下游**（caomei-auth / rss-impact-next / afdian-linker / dependfix/apps/platform）的迁移面——按既定顺序在 momei 闭环后评估。
- 未细化到「逐文件替换清单」：B2 / B3 的执行期应产出「文件 → 改动点」清单并逐批留痕（可复用本次的统计脚本口径）。
- 记录文件曾在提交 `681d42e` 中因脚本缺陷被截断为空文件，本版为重建内容（含第 1 轮 Review Gate 的全部修复项与 2026-09-17 用户决策），修复提交见提交信息。
