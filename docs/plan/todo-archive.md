# 待办归档

本文档归档已完成阶段的原子条目与验收结论。当前阶段完成后，从 [todo.md](./todo.md) 迁入此处。

## 归档格式

每个阶段归档块应包含：

- 阶段名称与时间；
- 交付内容与提交记录；
- 质量门结果（lint / typecheck / test / build）；
- 审计结论（Pass / Reject 及修复情况）；
- 遗留问题与后续候选。

---

## Phase 0：立项与 POC

- 时间：2026-09-11 ~ 2026-09-12
- 交付：
  - 命名与关键决策冻结（`caomei-ui`、组件前缀 `Caomei`、单仓库单包、semantic-release、禁用 Tailwind）
  - tsdown 组件库构建 + 子路径导出（POC 验证通过，结论见 [架构设计 §4.1](../design/architecture.md)）
  - 设计 token 草案：`src/styles/theme.css` 产出 `--caomei-*` CSS variables 与 `.dark` 暗色方案
  - AI 基建与文档基建落地（agents / skills / 镜像 / standards / plan / design / 文档站），`pnpm governance:check` 通过
  - `src/` 骨架：`components/`、`composables/`、`styles/`、`locale/`、`icons/`、`resolver/`、`nuxt/`、`types.ts`、`index.ts`
  - 开发环境收敛为 `playground/`，移除旧 Vite 应用脚手架
- 提交：`87703e5`（tsdown 构建）、`6b64969`（骨架与开发环境）、`4cc921a`（构建选型与文档）
- 质量门：`pnpm verify` 通过（lint / lint:css / lint:md / typecheck / test / build / docs:build / governance）
- 审计：`@code-reviewer` Review Gate 对 `87703e5` / `6b64969` / `4cc921a` 均已执行并放行（本仓库未保留独立审查工件文件）
- 遗留与后续候选：`@iconify/vue` 字符串图标名接入（Backlog）；按组件独立 chunk 暂缓

---

## Phase 1：Tier 0 组件

- 时间：2026-09-12
- 交付：
  - Tier 0 组件：Button、Input 家族（Input / Textarea / InputNumber）、Tag / Badge、Select、Dialog、Toast、Card、Checkbox、DataTable（含列定义类型 `DataTableColumn`，非独立组件）
  - InputNumber 迁移为封装 Reka UI `NumberField`；Select 修正为非模态（不锁页面滚动）
  - `label` 语义统一为可访问名（映射 `aria-label`），Checkbox 可见文本改用 `text`
  - 文档站样板（Button）：demo 渲染 + API 自动生成链路打通，其余组件页按同一模板推广
  - 确立「优先封装 Reka UI」的组件实现方式决策（InputNumber 迁移为其落地）
- 提交：组件实现与文档 `8b7c1d1` ~ `7077853`；文档站样板收口 `65f7bba`（Switch 见下）
- 质量门：`pnpm verify` 通过（lint / lint:css / lint:md / typecheck / test / build / docs:build / governance）
- 审计：`@code-reviewer` Review Gate 对各组件条目均已执行并放行（本仓库未保留独立审查工件文件）
- 遗留与后续候选：`@iconify/vue` 字符串图标名、`docs/**` 纳入 typecheck、a11y 自动化回归、视觉回归基线等见 [Backlog](./backlog.md)

---

## Phase 2：Tier 1 组件

- 时间：2026-09-13（Switch 预落地为 2026-09-12，见下）
- 交付：
  - 主线 A 展示与导航：Avatar（封装 `Avatar`）、Paginator（封装 `Pagination`）
  - 主线 B 反馈与浮层：Message / Alert（单一组件 `CaomeiMessage`，`role` 支持 status / alert）、ProgressSpinner（封装 `Progress` 派生）
  - 主线 C 确认对话框：`useConfirm` 服务（Promise 语义 + provide/inject store）与 ConfirmDialog（封装 `AlertDialog`，含焦点落位与滚动锁）
  - 主线 D 表单增强：Password（Input 衍生，可见性切换 + `autocomplete` 语义）、MultiSelect（封装 `Combobox`，多选 + 已选项标签 + 本地过滤）
  - 文档：7 个组件页与示例全部落地并纳入侧边栏；组件 API 元数据开发期热更新（复用 checker + `updateFile` 增量刷新）
  - 规范：派生组件 attrs 契约（`inheritAttrs: false` + 剔除内部受控属性）写入 [开发规范 §5](../standards/development.md)
  - 多语言：locale 扩展 `pagination` / `progress` / `confirm` / `password` / `multiSelect`
- 关键提交：`7857ace`（阶段启动）；主线 A `9480c54` / `803390f`（含修正 `98d16bc`）、主线 B `adb6d76` / `4121ee4`、主线 C `bcbd326` ~ `26bcee8`、主线 D `07a6de8` ~ `68adacf`；文档站工具 `d4da879`（`9ec3b41` 为 Phase 2 收尾期的文档站 reduced-motion 修复）
- 质量门：`pnpm verify` 通过（lint / lint:css / lint:md / typecheck / test / build / docs:build / governance）；全量单元测试 422 例通过
- 浏览器验证：各组件均经 `@ui-validator` 实机验证，证据报告落盘 `test-results/<component>/`（该目录 gitignored）；本阶段复核：ConfirmDialog 18/18（焦点与滚动锁）、Password 15/15、MultiSelect 21/21（含 `bodyLock` 滚动锁）
- 审计：各条目均经 `@code-reviewer` Review Gate 放行；ConfirmDialog（批次拆分）、Password（`type` 透传覆盖）、MultiSelect（`required` 表单语义）经历「首轮发现 → 修复 → 二轮 Pass」；未保留独立审查工件文件
- 遗留与后续候选：Nuxt 模块真实集成、覆盖率门禁启用、`docs/**` 纳入 typecheck、a11y 自动化回归、视觉回归基线、浮层交互 E2E 规格、Review Gate 证据留存、层级 / 阴影 token、国际化文案注入机制、执行层失效引用收敛等，见 [Backlog](./backlog.md)

---

## Phase 3：Tier 2 组件

- 时间：2026-09-13
- 交付：
  - 主线 A 内容切换：Tabs（复合 `CaomeiTabs` / `CaomeiTabList` / `CaomeiTabTrigger` / `CaomeiTabContent`，封装 `Tabs`）、Accordion（`CaomeiAccordion` + `CaomeiAccordionItem`，封装 `Accordion`）
  - 主线 B 浮层菜单：DropdownMenu 复合 10 件（Root / Trigger / Content + Item / CheckboxItem / RadioGroup / RadioItem / Group / Label / Separator，封装 `DropdownMenu`），默认非模态、面板层级 1050
  - 主线 C 分段选择：SelectButton（选项驱动，封装 `ToggleGroup`），单选必有一值、支持 `#option` 图标插槽与表单 `name`
  - 主线 D 媒体与文件：Image（自建 `img` + `IntersectionObserver` 懒加载 + `ratio` 比例占位 + 加载 / 失败占位 + SSR 水合兜底）、FileUpload（自建点击 / 拖拽选择、`v-model` 列表、`accept` / `multiple` / 去重 / 移除）
  - 文档：6 个组件页与示例全部落地并纳入侧边栏
- 关键提交：主线 A `a7d24e4` / `a60b11c` / `d2f28bf` / `c0c1c65`；主线 B `9317f81` / `26199b3` / `e9039be`；主线 C `5ef3cac` / `dd1d913`；主线 D `ab706d4` / `305082f` / `9d3b176`；规划勾选 `3c55210` / `e28244d` / `7885136` / `77bbaaa`
- 质量门：`pnpm verify` 通过（lint / lint:css / lint:md / typecheck / test / build / docs:build / governance）；全量单元测试 506 例通过
- 浏览器验证：各组件均经 `@ui-validator` 实机验证（Tabs / Accordion 键盘与方向；DropdownMenu 焦点、层级与非模态 / `modal` 滚动锁；SelectButton 选中态 / 键盘 / 禁用；Image 比例 / 懒加载 / 失败占位与 SSG 水合；FileUpload 选择 / 拖拽 / `accept` / 移除）；SSG 构建产物水合实测通过
- 审计：各条目均经 `@code-reviewer` Review Gate 放行；DropdownMenu（骨架缺浏览器证据、滚动锁前提）、SelectButton（表单字段泄漏）、Image / FileUpload（attrs 透传、SSR 水合）经历「首轮 Reject → 修复 → 复审 Pass」
- 阶段归档蒸馏：`.session/wisdom.md` 活跃条目达 35 条（≥ 阈值 20），已执行蒸馏并迁入 `docs/standards/*`、`docs/design/*`、`docs/guide/*`
- 遗留与后续候选：见 [Backlog](./backlog.md)；文档站增强、首版发布与下游接入顺延至 Phase 5

---

## Phase 4：Tier 3 稳定批组件

- 时间：2026-09-13
- 交付：
  - 主线 A 表单控件：RadioGroup（复合 `CaomeiRadioGroup` / `CaomeiRadioButton`，封装 `RadioGroup`，`v-model` / `disabled` / `required` / `name`）、Slider（封装 `Slider`，单值与范围、`min` / `max` / `step` / 垂直方向 / `change`）
  - 主线 B 开关与工具：ToggleButton（封装 `Toggle`，布尔按下态与尺寸档位）、Toolbar（复合 Toolbar / Button / Link / Separator / ToggleGroup / ToggleItem，roving focus 与分隔线）
  - 主线 C 反馈与占位：Skeleton（自建纯样式，`text` / `circular` / `rectangular`、多行末行收窄、`pulse` / `wave` / `none`）、ProgressBar（封装 `Progress`，确定 / 不确定进度与 `max` / `value`）
  - 主线 D 浮层：Popover（复合 Popover / Trigger / Content / Arrow / Close，Portal 挂载、默认非模态、碰撞检测开关）
  - 文档：7 个组件页与示例全部落地并纳入侧边栏；文档站 `motion.css` 统一恢复加载类动画（ProgressSpinner / ProgressBar / Skeleton）
- 关键提交：规划登记 `ca43c0e`；主线 A `ce25973` / `b6e0b21` / `e22f817` / `ba5c31f`；主线 B `c006414` / `157433b` / `81e6ccc` / `7d8a7d4`；主线 C `fbd9a97` / `caca1bb` / `f44b938` / `781be6c`；主线 D `efad9e6` / `206046c`；样式档位修复 `31d626f` / `f260d32`；backlog 登记 `e96eae8`；规划勾选 `14c78d6` / `b74619f` / `7f2dc27` / `f3a43c0`
- 质量门：`pnpm verify` 通过（lint / lint:css / lint:md / typecheck / test / build / docs:build / governance）；全量单元测试 621 例通过
- 浏览器验证：各组件均经 Playwright 实机验证（RadioGroup 键盘与表单语义；Slider 键盘与点击轨道；ToggleButton 点击 / 空格 / 回车；Toolbar 方向键漫游与 Tab 停靠点；Skeleton 形状 / 多行 / reduced-motion；ProgressBar 比例 / 不确定进度；Popover 四方向、Portal、Escape / 外部关闭与焦点回位）；另修复共享样式档位问题（ToggleButton 内边距、Checkbox / RadioGroup 字号）
- 审计：各条目均经 `@code-reviewer` Review Gate 放行；Toolbar（独立 ToggleButton 未纳入 roving）、Skeleton（`circular` 默认尺寸被覆盖）、Popover（根容器 attrs 无落点）经历「首轮 Reject → 修复 → 复审 Pass」；ToggleButton / Checkbox / RadioGroup 的样式档位修复亦经 Review Gate
- 阶段归档蒸馏：`.session/wisdom.md` 活跃条目为 0（低于阈值 20），无需蒸馏
- 遗留与后续候选：见 [Backlog](./backlog.md)；文档站增强、首版发布与下游接入顺延 Phase 5

---

## Phase 5 第一阶段：文档站增强

- 时间：2026-09-13 ~ 2026-09-14
- 交付：
  - 主线 A：文档站纳入 `vue-tsc` 类型检查（docs 专用 tsconfig + `docs:gen` 前置，接入 `verify` 与 CI）
  - 主线 B：启用 VitePress 内置站内搜索（local provider），以 `Intl.Segmenter` 补中文分词并记录内置分词局限
  - 主线 C：站点 i18n 与英文内容
    - 基建：`docs/i18n/en-US/` 物理路径 + `rewrites` + locale 分栏 nav / sidebar；`@en` JSDoc → `descriptionEn` 的 API 描述双语
    - 组件英文页 33/33 全覆盖（英文 demo、API 英文描述、按中文 sidebar 顺序登记；语言中性 demo 复用中文源）
    - 指南英文 4/4（getting-started / development / release / ai-development）
    - 定序规则：英文导航 / 概览按中文 sidebar 组件顺序，写入 [文档与演示站 §10](../design/documentation-site.md)
- 关键提交：`41dc46d`（登记）；主线 A `26ab586` / `5d53583`；主线 B `5db5e2c` / `31d0145`；主线 C 基建 `4a293fc` / `c3bf6be` / `2673a68`；组件页与指南英文按批次提交 `d48742e` ~ `70a84ad`；锚点修正 `188d41d`
- 质量门：`pnpm verify` 通过（lint / lint:css / lint:md / typecheck / typecheck:docs / test / build / docs:build / governance）；最终全量单元测试 626 例通过；docs 链接校验 135 md 全有效
- 浏览器验证：各批次英文页经 `@ui-validator` 实机验证（渲染、交互、sidebar 定序、明暗与桌面 / 移动、API 英文、console error 均为 0）
- 审计：各批次经 `@code-reviewer` Review Gate 放行；组件页第 4 批经历「首轮 Pass → 排序漂移修复 → 复审关闭」，收尾 17 个组件逐组件审计，指南英文逐页审计
- 阶段归档蒸馏：`.session/wisdom.md` 活跃 8 条（< 阈值 20），无需蒸馏
- 遗留与后续候选：组件内建文案 locale 注入、文档站版本化、覆盖率门禁、a11y / 视觉回归等见 [Backlog](./backlog.md)；Phase 5 第二阶段（首版发布 / 首个下游接入）依赖外部前置

---

## Phase 6：组件库补全与规范化（momei 迁移就绪）

- 时间：2026-09-14
- 交付：
  - 主线 M1 下游使用复核：产出 [momei 组件使用复核台账](../design/governance/2026-09-14-momei-usage-audit.md)（59 个 PrimeVue 组件 / 1515 次用法；满足 21 / 需增强 23 / 需新组件 15），缺口逐条回写 Backlog。
  - 主线 M2 设计规范与主题预设：[设计规范](../design/design-spec.md)（token 体系、尺寸 / 颜色 / 主题 / 风格规范、迁移映射、新组件自检清单）；`src/styles/theme.css` 暗色机制（`.dark` / `[data-theme]` / `data-scheme="auto"`）与 `src/styles/presets/caomei.css`、`presets/momei.css`（根元素 `data-preset`，文档站顶栏演示切换）；`scripts/governance/check-design.mjs` + 单测，纳入 `pnpm verify`。
  - 主线 M3 组件补全与关键增强：
    - Button 形态增强：`tone` 语义色、`rounded`、`iconPosition`，以及 `severity→tone`、`text→ghost`、`outlined→secondary` 映射。
    - DataTable：列能力 + 排序 + 加载态、行选择、Lazy 分页与分页集成、冻结列。
    - 新增组件：Divider、InputGroup、FloatLabel、ButtonGroup、AutoComplete、Stepper（含中英双语文档与示例）。
    - 变更：Input / Textarea / Select / MultiSelect / InputNumber 增加 `data-filled`（Select 另加 `data-has-placeholder`）作为浮动态契约。
    - 已决策不新建：`Panel` 由 `CaomeiCard` 的 `title` / `header` / `footer` 承载（映射见设计规范 §7）；`IconField` / `InputIcon` 由 `Input` 的 `prefix` / `suffix` 插槽降级承接。
  - 主线 M4 依赖许可合规：仓库根 `THIRD-PARTY-LICENSES`（reka-ui MIT / @tanstack/vue-table MIT / @lucide/vue ISC / vue peer MIT，含许可证全文）；`scripts/governance/check-licenses.mjs` + 单测；`files` 随包分发 + `prepublishOnly` 发布前校验；`reka-ui` 由 `^2.10.4` 收紧为精确 `2.10.4`。
- 关键提交：规划登记 `24fb92b` / `47b70eb`；M1 `6f8f2dd`；M2 `ba10f97` / `59fcee5` / `f547ada` / `cf50ae9`；M3 Button `5f01b79`、DataTable `5c9d2ed` / `a520c5a` / `644a7a5` / `46e20b5` / `b4bcf65`、Divider `8496d4a`、InputGroup / FloatLabel `4b4f91c`、Button 修复与 ButtonGroup `329a342` / `440e152`、AutoComplete / Stepper / 决策登记 `b71c1d5` / `3be1edf` / `61a2d80`；M4 依赖锁定与许可合规 `0f253af` / `b1743fd`
- 质量门：`pnpm verify` 通过（lint / lint:css / lint:md / typecheck / typecheck:docs / test / build / docs:build / governance）；最终全量单元测试 764 例通过；docs 链接校验 149 md 全有效
- 浏览器验证：各可见改动均经 `@ui-validator` 实机验证（Button 形态、DataTable 各子项、Divider、InputGroup / FloatLabel（三轮）、ButtonGroup（两轮）、AutoComplete / Stepper（两轮））；证据报告落盘 `test-results/`（该目录 gitignored）
- 审计：各条目均经 `@code-reviewer` Review Gate 放行；Button 形态、DataTable 子项（排序 / 行选择 / 分页 / 冻结列）、Divider、InputGroup / FloatLabel（三轮，含 `over` 标签压值与占位重叠、MultiSelect Reka 包裹层、Reka `data-placeholder` 同名冲突）、ButtonGroup（两轮，含纯图标居中修复）、AutoComplete / Stepper（两轮，含单选失焦覆盖已选值 blocker、多选显示）、M4 均经历「首轮 Reject / 补证 → 修复 → 复审 Pass」
- 阶段归档蒸馏：`.session/wisdom.md` 活跃 15 条（< 阈值 20），无需蒸馏；归档时修正 1 条关于 `@lucide/vue` 打包的错误发现
- 遗留与后续候选：
  - 未完成：Button 角标（`:badge`）增强未纳入本批，回写 [Backlog §1.1](./backlog.md)。
  - 延后至 Phase 7：`SplitButton`、`DataView`、`DatePicker / Calendar`、`Drawer`、`ColorPicker`（其中 Reka Alpha 组件需锁定 `reka-ui` 精确版本并补 API 回归测试）；`momei` 迁移试点闭环。
  - 其余候选见 [Backlog](./backlog.md)。

---

## Phase 7 第一阶段：迁移就绪（momei 优先）

- 时间：2026-09-14 ~ 2026-09-16
- 范围来源与授权：[Phase 7 第一阶段评估记录](../design/governance/2026-09-14-phase7-first-stage-evaluation.md)（2026-09-14 经用户授权启动）；阶段目标为「在 momei 实际迁移之前，打通消费与接入通道、补齐迁移高频硬缺口、前置组件 i18n 注入机制」。
- 交付：
  - 主线 M1 消费路径与 Nuxt 接入（**本地 link 先行**）：
    - 本地 link 调试通道：构建产物冒烟校验（`scripts/release` + CI 步骤）与中英《本地联调》指南
    - `caomei-ui/nuxt` 真实集成：`@nuxt/kit` 组件 / composables 自动导入、样式注入、theme token 覆盖、darkMode 策略；`@nuxt/kit` 为可选 peer（无 Nuxt 消费者零成本）；漂移测试 + 模块接线单测
    - 最小 Nuxt 消费冒烟：`playground/nuxt` fixture + `check:nuxt`（`nuxt generate` + SSR / CSS 断言），接入 `verify` 与 CI；浏览器级 hydration 实测通过
    - 消费使用文档补全：组合式 API / 图标 / 内建文案三篇指南（中英）与「能力说明」导航分组；校正既有文档中未实现的 `useDialog` 描述
    - 首版发布链路协调：按规划归属 Phase 5 第二阶段（待外部 npm 凭据），本阶段未承载
  - 主线 M2 组件 i18n 注入机制：`CaomeiConfigProvider` / `provideLocale` / `useLocale` / `caomeiLocaleKey` / `mergeLocaleMessages` / `resolveLocaleMessages` 与 `CaomeiLocaleMessageOverrides`（按命名空间浅合并 + 默认语言回退）；16 个内建文案组件分三批（表单类 / 反馈浮层类 / 数据展示类）改为 `props.x ?? locale.value.<ns>.<key>`；中英文档与 momei 五语种注入示例；文档站按页面语言注入内建文案
  - 主线 M3 P0 高频增强：Select 家族对象选项映射（`optionLabel` / `optionValue` + 非 `string` value，Select / MultiSelect / SelectButton）、Select `showClear` / `#option`、Tag `rounded` 与 `severity → tone` 映射、Message `simple` / `size`、InputNumber `useGrouping` / `minFractionDigits` / `maxFractionDigits`、Textarea `autoResize`、Password `feedback`
  - 主线 M4 组件补全：`DatePicker` / `Calendar`（含面板内时间选择）、`Drawer`（四向侧滑）、`SplitButton`、`ColorPicker`、`DataView`
  - 治理与流程：审查调用协议（`audit-depth` 声明、并发分区、轮次上限、复审范围冻结）、markdown lint 覆盖扩展至审查记录、Phase 6 M1 台账与 Phase 7 评估记录迁入 [design/governance](../design/governance/index.md)
- 关键提交：规划登记 `5c98aaf` / `1565f04`；M1 `db87328` / `f920830` / `1a00524` / `f5cb168` / `f9201b8` / `5e4cb4c` / `53f3b88` / `1e84ae5` / `ce4a557`；M2 `afcd8f4` / `e70bb77` / `f11312e` / `0a6bc61` / `8dfd580` / `5111ae6` / `b865ec5` / `425219a` / `d525155`（文档站语言切换按 i18n 路由回切）；M3 `dbd6418` / `03c8d62` / `df6fdcc` / `2e03aa5` / `d2d01ce` / `fedaff3` / `cacbeb8` / `e8aa2d8` / `94ffae7` / `2d6daca` / `04a3a66` / `3ba2e76` / `5e4e05e` / `06b31db` / `0ef6178` / `7d9a9f3` / `f9a7336` / `2179d4e`；M4 `040ef87` / `0fc539f` / `a514ce6` / `e0876e4` / `dc6f790` / `08f47f4` / `4e3922f` / `ee08ea8` / `9bc70f4` / `26ad101` / `07c71fa` / `96e727a` / `1982d6c` / `4af9168` / `6df980e`；治理 `3fd108f` / `481b868` / `64e7faf` / `5af12ff`
- 质量门：`pnpm verify` 全链路通过（lint / lint:css / lint:md / typecheck / typecheck:docs / test / build / check:build / check:nuxt / docs:build / docs:check:i18n-routing / governance:check）；阶段收口时全量单元测试 64 文件 / 1078 例通过；docs 链接校验 171 个 md 全有效；`check:design` 原始 rgb 预算维持 13/13（本阶段新增组件无新增原始色值）
- 浏览器验证：各可见改动均经 `@ui-validator` 实机验证并落盘 `test-results/`（gitignored）——DatePicker 基础三轮（含 hover 覆盖选中态修复与触发结构改自持 button 后复验）、时间选择自建后复验、Drawer 四向几何 / 宿主稳定性、SplitButton 拼接几何与菜单、ColorPicker follow-up（取值同源与色板选中态）、DataView 65 条断言全过
- 审计：各条目经 `@code-reviewer` Review Gate；多数经历「首轮 Reject → 修复 → 复审 Pass」（DatePicker 基础四轮、时间选择两轮、Drawer 两轮、SplitButton 两轮、ColorPicker 五轮后经用户决策收束审查时间盒、DataView 两轮）；治理侧据此补「轮次上限 + 范围冻结 + 单模块拆分并行」并新增审查调用协议
- 阶段归档蒸馏：归档检查发现 `.session/wisdom.md` 活跃 39 条（≥ 阈值 20），执行蒸馏——迁移 28 条至 `docs/standards` / `docs/design` / `docs/guide`，删除 11 条（判定已被现有文档覆盖），保留 0 条；摘要见 [Session 经验归档](../design/governance/experience-archive.md)
- 交付与遗留偏差清单：
  - **未承载（按规划归属）**：首版发布链路协调 → Phase 5 第二阶段（待 npm 凭据），本阶段仅作并行依赖协调
  - **范围降级（用户决策）**：`DatePicker` 范围选择（momei 零用量，快照 2026-09-15）→ [Backlog §1.1](./backlog.md)；Select `filter` 不在 Select 上实现，改为迁移映射到 `CaomeiAutoComplete`（`role="listbox"` 语义约束），自由文本差异与「严格选项模式」候选登记 Backlog §1.1
  - **有意行为差异（登记 [设计规范 §7](../design/design-spec.md)）**：Drawer `modal="true"` 即锁滚动（PrimeVue `blockScroll` 默认 `false`）；Password `feedback` 默认关闭（PrimeVue 默认开启）；InputNumber `useGrouping` 默认 `true`（原实现硬编码 `false`）；ColorPicker `format="hex"` 统一带 `#`、`rgb` / `hsb` 模型为字符串（PrimeVue 为对象）、不支持 alpha；DatePicker 为「触发按钮 + 面板」、不支持手工键入；DataView 新增 `loading` / `loadingText`（PrimeVue v4 无 `loading` prop，下游 `:loading` 原先静默无效）
  - **未实现（下游零用量，登记 [设计规范 §7](../design/design-spec.md)）**：SplitButton 子菜单 / `url` / `menuButtonIcon` / `fluid` 等；Drawer 生命周期事件与 `#closebutton` / `#closeicon` / `#container` / `baseZIndex` 等；DatePicker 手键输入与其余 PrimeVue 形态；DataView 分页 / 排序 / `lazy` / `dataKey` 与分页相关插槽
  - **规模偏差**：单一验收条目含「组件 + locale 命名空间 + 中英文档 + 示例 + 测试」导致多次超规划规范粒度约束，均按先例在 todo 条目登记（DatePicker 基础约 42 文件 / src 新增约 1.2k 行；时间选择 18 / 0.73k；Drawer 27 / 1.4k；SplitButton 23 / 0.88k；ColorPicker 23 / 1.0k；DataView 24 文件含本条规划登记、其中 src 为 9 文件 / 364 行）
  - **已登记 Backlog 的后续候选**：ColorPicker 色板导航（radiogroup + roving tabindex）、AutoComplete 严格选项模式、DatePicker 范围选择、阴影与遮罩 token 迁移、DropdownMenuTrigger 样式豁免、分组按钮可访问语义、测试隔离与偶发失败、`file-upload` 用户可见文案本地化等，见 [Backlog](./backlog.md)
  - **已知可接受项**：`dist/index.d.ts` 保留裸副作用导入 `import "@internationalized/date"`（该依赖已列 `dependencies`）

---

## Phase 9：发布前收口（文档站与代码质量）

- 时间：2026-09-16（单日完成）
- 授权与范围：2026-09-16 用户授权启动，范围取 M1 ~ M5；范围依据 [下一阶段评估记录](../design/governance/2026-09-16-pre-release-stage-evaluation.md)
- 交付（5 条主线 / 14 条目全部完成）：
  - **M1 文档站信息架构**（3 条）：`/components/` 侧栏改 6 分组 + 组内字母序（中英同分组同序）；能力说明三页归位 `/components/composables`、`/components/icons`、`/components/locale` 并同步 en 镜像；新增 zh 组件总览页（与 en `Overview` 对称）
  - **M2 默认主题主色改蓝**（2 条）：默认主色由 `#e63946` 改为亮 `#2563eb` / 暗 `#60a5fa`（实测 5.17:1 / 7.73:1）；配套实底前景配对整改与 `primary-foreground` 语义别名；规范、README、示例与架构文档同步
  - **M3 演示动画 opt-in**（2 条）：加载指示全站恢复 + 演示区 opt-in 恢复入场 / 退出动画（仅 `animation`，不恢复 transition）；取舍与 reduced-motion 对照证据落盘
  - **M4 公共逻辑抽取**（4 条）：落地长期任务机制；首轮三项抽取——标签属性转发 `useLabelAttrs`（12 处）、表单控件公共 props 契约 `_shared/field`（首批 7 文件）、聚焦控制 `useFocusControl`（4 处）
  - **M5 ESLint 严格化与导出类型**（3 条）：启用显式类型族并收紧 `--max-warnings` 至 0；收敛 unsafe 族（189 → 0）并统一 `.vue` 模块类型解析；切换 `vue/strict` 并固化门禁（strict 违规 69 error / 34 warning → 0 / 0）
- 阶段内附加产出：
  - 长期任务机制（[规划规范 §8](../standards/planning.md) + [长期任务台账](./recurring.md) + 开发规范「公共逻辑抽取与复用」）
  - 表单控件公共 props 契约第二批（`checkbox` / `radio-group` / `switch`，阶段收口前触发）
  - session wisdom 蒸馏（活跃 24 条全部迁移，剩余 0 条）
- 质量门：`pnpm verify` 全链路通过（lint / lint:css / lint:md / typecheck / typecheck:docs / 全量 test 66 文件 1089 例 / build / check:build / check:nuxt / docs:build / i18n-routing / governance）；`dist/index.d.ts` 冒烟通过（151.3 KB、无悬空相对导入）
- 审计结论：各批次均经 `@code-reviewer` Review Gate；M4 优化点 2+3 与 M5-3 各拦下真实缺陷（含 2 处对外行为回归与 1 处骨架依赖风险），修复后放行；M5-3 与 M1 条目 2+3 按模块分区并行审计
- 遗留与后续：见 [Phase 9 收口与遗留清单](../design/governance/2026-09-16-phase9-closure.md)

## Phase 10：国际化与移动端适配

- 时间：2026-09-16 ~ 2026-09-17（2026-09-16 用户授权启动；2026-09-17 收口归档）
- 授权范围（用户决策 2026-09-16）：语言矩阵取**方案 A**（库内建 5 语）；译文由 **AI 基于 zh-CN 生成 + 用户复核**（复核前标注、复核后移除）；三语文案**按语种拆三个提交**；补**键集合一致性守卫**（以 zh-CN 为基准）；包体影响评估为可接受。范围依据见[语言矩阵 - 中期评估记录](../design/governance/2026-09-16-language-matrix-midterm-evaluation.md)。
- 交付（两条主线）：
  - **M1 语言矩阵 - 中期**（5 条目）：新增 zh-TW / ja-JP / ko-KR 三份内建文案（各 59 条，语言约定见下）；`caomeiLocales` 注册表与 `CaomeiLocale` 类型扩展；新增 `scripts/governance/check-locale-keys.mjs`（命名空间 / 键集合 / 占位符 / 非空白值 / 注册 id 与文件名同源 / 导入路径校验，含 21 例单测）并接入 `governance:check`；`use-locale.test.ts` 补三语解析断言与未注册语种回退用例；locale 指南（中英）/ README / 开发规范目录树同步。**译文复核（2026-09-17）**：三语逐条对照 zh-CN 复核，**无明显错误**；复核修正 zh-TW `autoComplete.empty` / `multiSelect.empty` 两处措辞（「無符合的」→「沒有符合的」）；移除三份文件首行的「AI 生成、待人工复核」标注并关闭条目；结论落[评估记录 §9.1](../design/governance/2026-09-16-language-matrix-midterm-evaluation.md)
  - **M2 移动端与响应式**（3 条目）：新增 `docs/design/responsive.md`（断点语义 sm 640 / md 768 / lg 1024、16 行窄屏行为矩阵含源码取证、6 条验收标准、3 个适配批次与三项决策落定）；**三个适配批次**——① 浮层面板宽度收敛（Select / MultiSelect / AutoComplete / DropdownMenu：`max-width` 取 Reka 可用宽 + `min-width: min(触发器宽, 可用宽)` + 长选项省略号）；② 横向布局与定宽面板（Toolbar 换行、ButtonGroup / SplitButton 组内横向滚动含焦点环内缩、SelectButton 按内容宽换行并释放固定高度、ColorPicker `min(260px, 可用宽)`、Dialog / ConfirmDialog 页脚换行）；③ 含日历面板（DatePicker portal 面板补两轴可用空间上限 + 滚动降级，含极窄 / 极矮探针）；**常驻 Playwright 多视口用例**（根 `playwright.config.ts` + `test/e2e/fixtures/` 源码夹具 + `helpers/layout.ts` + 16 用例 × 3 视口 = 48/48，覆盖面板 / 换行 / 滚动 / 键盘聚焦 / 含日历面板五类口径，0 console error 自动 fixture）；**改动前基线归档**落 `docs/design/governance/2026-09-17-m2-batch3-calendar-baseline.md`
  - **阶段尾部再评估点**：momei 迁移可行性评估（[记录](../design/governance/2026-09-17-momei-migration-feasibility.md)）——结论「可行（有条件）」，用户决策 5 项（C3 分批全量 / B1 库侧补齐先行 / B 级 14 项全做 / 接受 16 条有意差异 / 回归由每周回归任务跑 momei 测试承载）
- 阶段内附加产出：常驻 E2E 基建（Playwright 三档 project、webServer 拉起源码夹具、reduced-motion 保证几何确定性）；「键盘聚焦」验收口径经用户裁定为**分档判定**（选项 A）并落规范与用例；`theming.md §5` / `design-spec.md §2.3` / `development.md §7` 补响应式指针
- 提交（未推送）：`610aefa`（授权启动）、`5346f9f`（复核流程细化）、`bd34117` / `8f230e7` / `e2bd99b`（三语各一枚）、`e2ef930`（注册表 + 守卫）、`055704d`（文档同步）、`2de5539`（M1 收口）、`622e7fc`（响应式规范）、`de1c317`（决策落定）、`bc0d167`（批次 1）、`9b2de72`（批次 2）、`e493855` / `c37b17f`（常驻 E2E 基建与用例）、`38c317c` / `19b0eab`（条目 3 收口与键盘聚焦口径）、`b9036c6`（批次 3）、`681d42e` / `a22d742`（可行性评估与记录修复）、`9bbde96`（空文件守卫候选）；收口提交：译文复核与阶段归档（2026-09-17）
- 质量门：阶段内各批次 `pnpm verify` 全链路通过；收口时 `pnpm check:locale-keys`（五语 59 条对齐）/ 全量 `pnpm test`（67 文件 1114 例）/ `pnpm test:e2e`（48/48）/ `docs:check`（184 md）/ `lint:check` / `lint:css:check` / `typecheck` / `build` + `check:build` 全绿
- 审计结论：各条目均经 `@code-reviewer` Review Gate——M1 各条目 Pass（含 2 项提交前必改）；M2 批次 2 首轮 **Reject**（SelectButton 换行后固定高度致纵向裁切，横向口径漏检）→ 二轮 Pass；条目 3 首轮两分区（用例 Pass / 文档 Reject：验收口径放宽须用户裁定）→ 回滚口径放宽并修复 → 二轮 Pass，随后键盘聚焦裁定与批次 3 增量均一轮 Pass；可行性评估两轮 Pass（第 2 轮另修复记录被截断事故）
- 遗留与后续（候选均登记于 [Backlog](./backlog.md)，不在本条重复）：
  - 语言矩阵的后续语种（俄 / 法 / 德 / 西 / 葡）、RTL、locale 注册治理、file-upload 内建文案本地化 → Backlog §1.4
  - M2 未纳入项（DataTable 卡片化 / Dialog 转全屏 / 页面级栅格 / Stepper 方向转换 / 触摸目标）与已知边界（内联日历内容宽 198px 等）→ [响应式设计](../design/responsive.md) §1 / §3 / §5
  - 常驻 E2E 尚未接入 `pnpm verify` / CI、浮层交互规格、reduced-motion 的默认动效路径无覆盖 → Backlog §1.6
  - momei 迁移的执行范围与 5 项决策 → 已由 Phase 7 第二阶段承接并归档（见本文件 Phase 7 第二阶段块与[可行性评估](../design/governance/2026-09-17-momei-migration-feasibility.md)）

## Phase 7 第二阶段：库侧迁移就绪与交接计划（momei 优先）

- 时间：2026-09-17 ~ 2026-09-19（2026-09-17 用户授权启动；2026-09-19 收口归档）
- 范围来源与授权：[momei 迁移可行性评估](../design/governance/2026-09-17-momei-migration-feasibility.md) §6（B0~B4）与 §7 的 5 项用户决策（C3 分批全量执行 / B1 库侧补齐先行 / B 级 14 项全部纳入执行 / 接受 16 条有意差异 / 回归强度由每周回归任务承载）。**momei 侧实际迁移由 momei 项目在自己的仓库执行、本仓不触碰 momei 文件**；本仓只承担库侧能力面补齐、B0a 交接资产与迁移计划 / 验收标准。
- 交付（6 条主线 / 33 条原子条目全部完成）：
  - **M1 迁移计划与验收标准**（1 条）：[迁移计划与验收标准](../design/governance/2026-09-17-momei-migration-handover-plan.md)——批次划分（逐行标注执行主体）、前置条件、开工顺序、每批出口条件、16 条有意差异逐条核对清单、视觉基线采集方法与判定口径、回归口径、包体对比要求、逐批「文件 → 改动点」清单产出要求。
  - **M2 B0a 交接资产**（3 条）：[momei 迁移 B0a 库侧资产](../design/governance/2026-09-17-momei-migration-assets.md)——`--p-*` → `--caomei-*` token 对照表（114 个唯一 token / 1403 处）、`pi pi-*` → `@lucide/vue` 映射表（128 个唯一图标 / 629 处 / 145 文件）、双库并存隔离策略与包体监控口径。**口径裁定（2026-09-17 用户决策）**：本主线验收以本仓扫描口径与实际结果为准。
  - **M3 DataTable 列插槽**（3 条，A 级唯一结构性差距）：按列 `key` 命名的 `#cell-{key}` / `#header-{key}` 作用域插槽 + 单测 + 中英迁移示例；`align-frozen` 与列级 `selection-mode` 经 PrimeVue 一方源码取证后**收敛为迁移映射、不新增 API**。
  - **M4 B1 增强·数据与表单类**（8 条）：MultiSelect `#option` / `showClear`、Paginator 每页条数（保留首行偏移）、Button `badge` / `badgeTone`、Checkbox 数组模型 + `CaomeiCheckboxGroup`、Switch `change`、ToggleButton `onLabel` / `offLabel`、DataTable `rowsPerPageOptions` + `update:rows`（2026-09-18 用户追加）。
  - **M5 B1 增强·浮层与展示类**（10 条）：Dialog `showHeader` / `title` 可选化 / `@hide` / `breakpoints`、ConfirmDialog `icon`、Popover 命令式收敛为声明式迁移写法 + `CaomeiPopoverTrigger` 的 `unstyled`、DropdownMenu `model` 项模型 + 声明式锚点、Toolbar `#start` / `#center` / `#end`、Image `preview`、ProgressSpinner `strokeWidth`、FileUpload `mode` / `maxFileSize` / `auto` / `chooseLabel` + `customUpload` / `uploader`。分 B1~B5 交付。
  - **M6 等待期组件缺口复盘与优化**（8 条）：InputGroup × Select 拼接圆角与成员宽度修复、图标页 live demo、图标一览卡片排版、`DatePicker` 触发按钮默认宽度上限、组件页迁移节后置与文档约定、中英《从 PrimeVue 迁移》专题页、组件页迁移节按侧栏分组滚动补齐（5 组，收口时**全部 45 个组件页具备中英迁移节**）。本主线由用户缺陷报告与用户指令授权驱动（不要求 Backlog 出处）。
- 关键提交（98 枚，`8924924` ~ `0e58c65`）：
  - 规划与资产：`8924924`（阶段登记 + 交接计划）/ `5a43d53`（B0a 资产）
  - M3：`ef6dd48` / `521d52f` / `f10aa8b` / `7a62e10`
  - 治理：`b8170c4` / `43b7b53`（审查改进协议与协议守卫）/ `caa2338`
  - M6 第一批：`b681a4a` / `b85ec7a` / `4fe7433` / `a5588c8` / `5201b49`；第二批：`d34385a` / `45765eb` / `07394a5` / `cbf5787`
  - M4：`29044c1` / `45fa047` / `f14d49b` / `b13a465` / `ee989c3` / `d3ddf84` / `b0776fb` / `446695a` / `38860b8` / `32639cf` / `55e6897` / `d6826a9` / `f15dacc` / `37da558`
  - M5 B1：`13cd91e` / `daf09ce` / `0dd7e4e` / `a08d493` / `14278f6` / `16cbbd0`
  - M6-6 / M6-7：`281df66` / `485b5c5` / `42c43e2` / `2c732df`
  - M6-8 第一批：`1d6cf39` / `c818adc` / `1e3d90f` / `0ecf829` / `43faf00` / `11c1f13`；第二批：`0998d55` / `0f7b62e` / `f075f58` / `5713775` / `8dd05a3` / `89f7545` / `43d02aa`；第三批：`8d4557d` / `f31f406` / `c4fd236` / `d42496e` / `8d46390` / `85de760` / `928ca30` / `1c9f202`；第四批：`44e7b0a` / `a22140c` / `109b519` / `d4bede0` / `a86f24b` / `c2ecfd8`
  - M5 B2：`58cf0d7` / `f334d86` / `71ff417` / `c66e398` / `cbb1219` / `1623c20` / `a94e6c3` / `34ecf0f`；B3：`b3b9b1a` / `4d56445` / `77fbf66` / `ec03b48`；B4：`ba1de50` / `3389133` / `89e9f3e`；M5-9：`2b6cab0` / `17bc18e` / `9f73d88`
  - M5-8：`62672dd` / `ad2080e` / `c9de3ef`；M5-10：`9714107` / `89cf207` / `6ed15fa`
  - M6-8 剩余页收口：`6662e30` / `8af830f` / `cb4a58f`；阶段归档蒸馏：`eb52186` / `0e58c65`
- 质量门：阶段内各批次 `pnpm verify` 全链路通过，最后一次全量为 M5-10 的 71 文件 / 1368 例；M6-8 文档滚动批次为零 `src/**` 改动，按最小充分口径跑 `lint:md:check` / `docs:check`（收口 integrity 213 / links 214 / line-count）/ `docs:build`。新增 `.github/workflows/regression-weekly.yml`（周级深度健康检查，`a94e6c3`）。
- 浏览器验证：各可见改动均经 `@ui-validator` 实机验证并落 `docs/design/governance/` 记录——列插槽（48 + 复验 25）、M4 两批（119 / 130）、M5 B1 常驻 E2E 54 / 54 + 一次性 45 + 基线 54 项零差异、M5 B2~B5 逐批、M5-8（33 / 33）、M5-10（23 / 23）、M6-1~M6-3（68 / 68）、M6-4 / M6-5（125 / 125）、M6-6 / M6-7（75 / 75）、M6-8 五批（305 / 493 / 769 / 953 / 13 / 13 / 18）。统一观察项为 en-US 文档页 @768 既有 79px 横向溢出（未改动同类页同样命中，登记 [Backlog §1.6](./backlog.md)）。
- 审计：各条目均经 `@code-reviewer` Review Gate；治理侧新增审查调用协议（`audit-depth` 声明、并发分区、轮次上限、复审范围冻结）与「3 轮未过的审查改进协议」，并新增 `check:audit-protocol` 单点声明守卫接入 `governance:check`。
- 阶段归档蒸馏：`eb52186` 处置活跃 82 条（migrate 82 / compress 0 / remove 0 / keep 0），摘要落 [经验归档](../design/governance/experience-archive.md) 的「2026-09-19 阶段归档蒸馏（Phase 7 第二阶段 M5 / M6）」；阶段收口再迁移 1 条 `[process]`（standards 目录关键词守卫）至 [文档规范 §4](../standards/documentation.md)。
- 交付与遗留偏差清单：
  - **未承载（按规划归属）**：首版发布链路 → Phase 5 第二阶段（待外部 npm 凭据）；下游兼容性回归机制（跨仓 CI）→ Phase 8（未启动）。
  - **外部依赖（等待反馈）**：momei 侧迁移（B0b 视觉基线 / B2 / B3 / B4）由 momei 项目在其仓库执行，本仓等待其反馈后再决定下一轮动作。
  - **范围收敛（用户决策）**：`align-frozen` / 列级 `selection-mode` 收敛为迁移映射不新增 API；Popover / DropdownMenu 命令式收敛为声明式迁移写法、不新增命令式入口；`template` / `CurrentPageReport`、菜单嵌套 / 逐条目类名、FileUpload 默认 XHR 传输等未实现项均登记 [设计规范 §7](../design/design-spec.md)。
  - **有意行为差异与未实现项**：逐条登记 [设计规范 §7](../design/design-spec.md) 与各组件页迁移节，本阶段不重复抄写。
  - **规模偏差**：单一验收条目含「组件 + locale + 中英文档 + 示例 + 测试」导致多次超粒度约束，均按既有先例在条目与提交信息登记（M5 B1 合计 30 文件 / 新增 897 行、最大单提交 12 文件 / 400 行）。
  - **已登记 Backlog 的后续候选**：迁移口径一致性守卫、en-US 文档页 768 档横向溢出、常驻 E2E 规格 follow-up、组件覆盖率门禁、a11y 自动化回归、测试隔离与偶发失败等，见 [Backlog](./backlog.md)。

## Phase 5 第二阶段：首版发布（本地手动发布，0.x）

- 时间：2026-09-19（用户授权启动；同日完成首发并收口归档）
- 授权与范围（用户决策 2026-09-19）：首版版本号取 **0.x**；发布方式为**本地手动发布**、暂不启动 CI 自动发布；下游接入验证**后置**为发布后由下游实际迁移反馈驱动；测试偶发失败按「多次出现再处理」跟踪。范围与就绪度评估见 [Phase 5 第二阶段发版评估记录](../design/governance/2026-09-19-phase5-second-stage-release-evaluation.md)。
- 交付（4 条原子条目全部完成）：
  - **F5-1 首版发布指南（本地手动 0.x）**：改写 [发布指南](../guide/release.md) 为本地手动发布 runbook（0.x 首发步骤与命令、annotated 基线 tag、凭据要求、CI 自动发布暂缓、版本推断、许可、回滚 / deprecate、包形态与兼容性、下游回归后置）；`release.yml` 发布步骤保持关闭并澄清。提交 `9513505`。
  - **F5-2 0.1.0 版本基线与发布说明**：`package.json` 版本置 `0.1.0`；`CHANGELOG.md` 由 `pnpm changelog`（`scripts/release/generate-changelog.mjs`，基于 `conventional-changelog@7.2.0` + `conventional-changelog-cmyr-config@3.0.0` 预设）生成并含 BREAKING CHANGES；建 annotated 基线 tag `v0.1.0`。提交 `f26388e`（登记 `757789d`）。F5-2 复审 follow-up（生成器健壮性）已转 [Backlog](./backlog.md)。
  - **F5-3 首发执行与发布后校验**：本地手动 `npm publish` 首发成功——npm `latest` 指向 `0.1.0`；tarball 11 文件与 `files` 一致；干净目录安装与子路径导入（`caomei-ui` / `caomei-ui/resolver` / `styles.css` / `THIRD-PARTY-LICENSES`）冒烟通过。发布结论见 [0.1.0 首发执行与发布后校验记录](../design/governance/2026-09-19-phase5-first-release-execution.md)。提交 `5ebc789`。
  - **F5-4 发布后状态同步与占位处置**：README（项目状态精简 + 外链、安装栏更新为已发布事实、License 补 `THIRD-PARTY-LICENSES` 链接）、中英（含 en-US 镜像）getting-started / local-linking、roadmap 与发版评估记录状态同步，无「未发布」残留；npm `0.0.0` 占位经用户决策 **不 deprecate**（已发布版本不再改动，作为同作者历史占位保留在线）。提交 `5ebc789` + 归口提交。
- 质量门：`pnpm lint:md:check` / `pnpm docs:check`（integrity / links / line-count）/ `pnpm docs:check:i18n-routing` / `pnpm governance:check` 通过；[0.1.0 首发执行与发布后校验记录](../design/governance/2026-09-19-phase5-first-release-execution.md) 载 registry 取证与安装冒烟结果。
- 审计：F5-1 / F5-2 各自经 `@code-reviewer` Review Gate 放行（F5-2 三轮：R1 / R2 Reject → R3 Pass）；发布后状态同步与首发执行记录经 Review Gate 放行；阶段归档与规划状态同步批次 R1 Reject（2 blocker）→ R2 Pass（范围冻结复审）。
- 阶段归档蒸馏：`.session/wisdom.md` 活跃 0 条（< 阈值 20），无需蒸馏。
- 长期任务：阶段收口前触发一轮门槛复核（[长期任务](./recurring.md) §3 第 9 轮，2026-09-19，零代码改动域；两组任务待执行批次 0 项、条件触发 2 项维持）。
- 遗留与后续候选：下游接入验证后置（Phase 8 / 下游反馈驱动）；npm `0.0.0` 占位保留不 deprecate；[发布后阶段规划落地复核](../design/governance/2026-09-19-post-release-phase-implementation-audit.md) 未发现静默遗漏；其余候选见 [Backlog](./backlog.md)。

## 跨阶段预落地条目

### Switch（Phase 2 预落地，用户授权；随 Phase 2 归档）

- 时间：2026-09-12
- 交付：封装 Reka UI `Switch`，补 `defineOptions` 与表单属性 `name` / `id` / `required` / `value`、可访问名 `label`、CSS 变量覆盖钩子与焦点态；文档、示例与单元测试同步
- 提交：`8a23d1e`
- 质量门：`pnpm verify` 通过；单元测试 16 例
- 审计：`@code-reviewer` Review Gate Pass（RG-SW-01 ~ 06）；浏览器验证 59/59 通过
- 遗留：真实 `<form>` 提交链路与 SSR 水合未纳入浏览器验证覆盖

---

## Phase 11：组件样式按需化与能力增强

- 时间：2026-09-20（用户授权启动；同日完成全部 4 主线 / 15 条原子条目）
- 授权与范围（用户决策 2026-09-20）：取向取候选组合 **X + Y 混合**（不取 Z）；**覆盖率不进入日常门禁**——现状约 90%，改为仅在周期性回归任务或 release 门禁中校验；**功能开发优先**，样式分层拆分与相应组件优化先行；M3 用量**按现有取证直接做**（不等 momei 反馈）；样式拆分**兼容性不作要求**，下游自行修复。范围依据见[下一阶段范围评估](../design/governance/2026-09-20-next-stage-scope-evaluation.md) §6；样式拆分方案与批次见[CSS 按需引入评估](../design/governance/2026-09-20-css-on-demand-evaluation.md) §7。

### M1 样式按需化（4 条，1 条取消）

- **M1-1 构建路径 POC**：三条路径全部实测——A `unbundle`（337 文件 / 714,154 B）；B `unbundle + css.inject`（**推荐**：JS 保留逐模块 CSS import；消费侧 Vite 实测仅单组件 1.48 KB gzip、三组件 6.22 KB gzip，对照全量 25.60 KB gzip）；C 多入口 + `css.splitting`（18 文件 / 655,640 B，不推荐）。**关键发现：推翻已登记的「逐组件样式入口」假设**——模块图 + `sideEffects: ["**/*.css"]` 即可让消费方 tree-shaking 达成按需。结论定为**条件性可行**。提交 `21c1df7` / `2f08e46` / `6ca869c`。Review Gate 两轮（R1 Reject → R2 Pass）。
- **M1-2 待验项消除 + 入口语义落定**：① `dts` 消费方解析通过（`bundler` / `node16` 双模式，含负向对照）；② 入口语义方案成形（D1~D5）；③ Nuxt 双注入结论落档（**Nuxt 侧不得依赖 JS 图携带 tokens**）。提交 `a4c6b0e`。Review Gate Pass。
- **M1-3 `unbundle + css.inject` 落地与适配**：落地构建配置；四处适配——`exports` 重写（`./theme.css`）、resolver `sideEffects` 目标改写、Nuxt 模块注入目标、`check-build` 断言目标；文档口径同步。`pnpm verify` exit 0；`npm pack` 341 文件 / 750.5 kB。提交 `a869b8f` / `13c45d1`。Review Gate Pass。
- **M1-4（依赖闭包批次）已取消**：POC 实测 `unbundle` 保留完整模块图，依赖组件样式随图带入，闭包问题不存在。
- 关键记录：[M1-1 构建路径 POC](../design/governance/2026-09-20-m1-1-build-path-poc.md)、[M1-2 入口语义与 dts 验证](../design/governance/2026-09-20-m1-2-entry-semantics-and-dts-verification.md)、[M1-3 样式按需形态落地与适配](../design/governance/2026-09-20-m1-3-style-on-demand-landing.md)

### M2 重量级组件优化与样式治理（3 条）

- **M2-1 重量级组件质量盘点**：7 组件下游用量取证完成；ColorPicker 色板导航不达标（留 Backlog）；AutoComplete 严格选项模式经用户裁定纳入 → 登记为 M3-5。提交 `bd954c5`。Review Gate 四轮（R1~R3 Reject → R4 Pass）。
- **M2-2 / M2-3 样式治理落地**：G2（`button` / `drawer` / `dialog` / `confirm-dialog` 基类预声明改消费处 fallback；`message` / `badge` / `tag` / `toast` / `radio-group` 变体类改 `:where()`）；G1（`auto-complete` / `multi-select` / `message` / `select` / `select-button` 档位块改「只声明 CSS 变量」）；D1 死声明 4 处清理；G4 新增 9 个 `--caomei-z-*` 并收敛 21 处；`check:design` 新增 G1~G4 四类机检。**等价证据**：226 项真实浏览器计算样式逐属性比对 **0 差异**。提交 `ad0eae7` / `fd0f0f3`。Review Gate Pass。
- 关键记录：[M2-1 重量级组件质量盘点](../design/governance/2026-09-20-m2-1-component-quality-audit.md)、[M2-2 / M2-3 样式治理落地](../design/governance/2026-09-20-m2-2-m2-3-style-governance-landing.md)

### M3 组件能力增强（5 条）

- **M3-1 Select 分组**：新增 `SelectOptionGroup` 类型与 `CaomeiSelectGroup` 组件，支持分组渲染与键盘遍历。
- **M3-2 Tag / Badge 增强**：Tag 新增 `selectable` + `selected` v-model（可选中筛选）；Badge 新增 `offset` prop（叠加位置偏移）+ 宽度过渡。
- **M3-3 DropdownMenu `model` 扩展**：支持 `items` 嵌套子菜单（递归渲染，3 层限制）+ 逐条目 `class`。
- **M3-4 分组按钮可访问语义**：ButtonGroup / SplitButton 根补 `role="group"` + `groupLabel` prop。
- **M3-5 AutoComplete 严格选项模式**：新增 `strict` prop，严格模式下自由文本不写入模型。
- 提交 `38398b3`。Review Gate 两轮（R1 含 1 warning / 3 suggest → R2 Pass）。

### M4 质量门与文档守卫（3 条）

- **M4-1 覆盖率门禁落位**：新增 `check-coverage.mjs`（阈值 statements 90% / branches 80% / functions 90% / lines 90%），在 `regression-weekly.yml` 与 `release.yml` 中调用。
- **M4-2 文档守卫补强**：新增 `check-i18n-old-dirs.mjs` 翻译旧目录守卫，纳入 `docs:check`。
- **M4-3 文档对外可用**：新增 `README.en-US.md`（仓库内文档定位）；修复 en-US 文档页 768 档横向溢出（`caomei-demo.css` 添加 `@media (max-width: 768px)` 规则）。
- 提交 `0591cad`。Review Gate Pass。

### 阶段总结

- **质量门**：`pnpm verify` exit 0（lint / lint:css / lint:md / typecheck / typecheck:docs / test 1415 passed / build / check:build / check:resolver / check:nuxt / docs:build / i18n-routing / governance:check）；`pnpm test:e2e` exit 0（54 passed）。
- **长期任务**：阶段收口前触发一轮门槛复核（[长期任务](./recurring.md) §3 第 10 轮，2026-09-20，零代码改动域；两组任务待执行批次 0 项、条件触发 2 项维持）。
- **遗留与后续候选**：28 条非 `:where()` 尺寸档位块（8 组件）待用户裁定；对比度遗留项盘点；a11y 自动化回归；测试隔离与偶发失败；文档站观感与版本化；其余候选见 [Backlog](./backlog.md)。

---

## Phase 12：发布就绪、文档对外与一致性收官

- 时间：2026-09-21 用户授权启动 ~ 2026-09-23 完成并归档（5 条主线 / 20 条原子条目全部交付）
- 授权与范围（用户决策 2026-09-21，评估记录 D1~D8）：取向取组合 **P / Q / R 混合**；主线收敛为 3~6 条；**不启用 CI 自动发布**（保持手动发布）；执行一次发布、版本号 **0.2.0**；**28 条尺寸档位块收敛**；文档站观感与展示力「如有空间可以纳入」（登记为条件条目 M2-5）；Phase 8 **等待下游完成接入**。范围依据见[下一阶段范围评估](../design/governance/2026-09-21-next-stage-scope-evaluation.md) §6 / §9。
- 非目标：不启用 CI 自动发布；不启动 Phase 8；不执行 momei 侧迁移（外部执行）；不做 E2E 常驻 / 浮层入门禁、视觉回归基线与 flaky 治理；**不改任何 token 色值**（对比度遗留项与实底前景配对复核留 Backlog）；不新增组件能力（条件触发项留 Backlog）；不修改 `AGENTS.md`（受保护文件）。

### M1 手动发布与版本基线（3 条）

- **M1-1 0.2.0 版本基线与发布说明**：`package.json` 置 0.2.0；`CHANGELOG.md` 含 `# [0.2.0]` 段并在 `💥 BREAKING CHANGES` 明示包形态变更（`styles.css` → `theme.css`）；**annotated** tag `v0.2.0` 指向发布提交。提交 `80df3b4` / `3ef4182`。Review Gate Pass（2 warning / 1 suggest 同批修正）。
- **M1-2 手动发布执行**：用户本地手动 `npm publish`（**未启用 CI 自动发布**）；发布指南 §4 补失败路径（401 / 403 版本已存在 / prepublishOnly 中止）。**该条目为发布执行动作、无代码改动，Review Gate 不适用**。
- **M1-3 发布后校验与状态同步**：registry `latest = 0.2.0`（发布时间 2026-09-22T12:21:29Z）；从 registry 下载的 tarball 含 `dist/styles/index.css`、不含旧单体 `dist/styles.css`（345 文件 / unpacked 779,993 B / shasum `d29c75bd…`）；干净目录安装 + 四项子路径冒烟（根 88 导出 / resolver / nuxt（需可选 peer `@nuxt/kit`）/ theme.css 5,880 B）+ Vite 消费方构建冒烟均通过；`exports` 键无 `./styles.css`。**破坏性变更披露**：CHANGELOG 破坏性段 + 发布指南 §9（下游修复指引：`styles.css` → `theme.css`、注入点唯一、裸 Node ESM 须经打包器）。**状态同步**：README（中英）/ 快速上手（中英）/ 路线图 / 发布指南 §4·§9（英文侧新增等价小节）/ Backlog。提交 `fb0ac04` / `70c8e1f` / `d4c2753`。**偏差登记**：tag 视图不含 0.2.0 的 CHANGELOG 段（tag 指向版本提交、CHANGELOG 提交在其后；指南 §3 已规定正确次序，已发布 tag 不重写）。
- **M1 批次 Review Gate**：R1 Pass（0 blocker / 2 warning / 1 suggest），修复点（状态行错位、章节引用 §3→§4）已同批修正，记为「已修复未复审」；M1-3 的 3 个文档提交同批受审。结论来源见[发布执行记录](../design/governance/2026-09-22-phase12-m1-release-execution.md)。
- 关键记录：[0.2.0 发布执行与发布后校验](../design/governance/2026-09-22-phase12-m1-release-execution.md)

### M2 文档对外可用性（5 条）

- **M2-1 版本信息与兼容策略（轻量形态，2026-09-22 改写自「文档站版本化」）**：新增中英「版本与兼容策略」页（当前版本 / 获取渠道 / 0.x 兼容策略与下游 pin 建议）；**版本单一来源 = 仓库根 `package.json`**（`config.ts` 读取并经 `themeConfig.version` 暴露，顶层与两个 locale 均显式声明；`defineConfigWithTheme` 声明自定义字段），中英导航新增 `v0.2.0` 条目、指南侧栏加入口，`getting-started`（中英）顶部提示改派生值（**发版不再需要手改站点文档**）。新增 `docs:check:version`：已解析版本 = `package.json`、**逐 locale 断言**、展示面禁三段式版本字面量、展示面须按类型接线、抗静默收窄；正反例语料 13 tests，仓库级负向对照 exit 1。**V 阶段 9 项核对 8 项通过**；未通过项为 768px 下 `/en-US/**` 横向溢出 146px（既有 79px + 本条目放大 67px）→ **用户裁定方案 b 修复并复验通过**（仅 <960px 收敛切换器标签与导航项内边距，两处展示保留，768px 溢出 **146px → 0**，其余三档与 959/960 断点无回归）。**多版本托管经再评估后不做**，退回 Backlog（依据：文档站与工作区源码强绑定，同一构建内托管旧版文档会让其 demo / API 绑到当前源码）。提交 `df6070c` / `5643447` / `d486747` / `3213a01`。Review Gate R1 Pass（0 blocker / 2 warning / 3 suggest）→ R2 Pass。
- **M2-2 锚点校验与侧栏不变式**：新增 `docs:check:structure`（`scripts/docs/check-docs-structure.mjs` + 共享解析器 `scripts/docs/vitepress-site.mjs`）——① 锚点按 VitePress `createMarkdownRenderer` **实算 slug** 校验（不复刻算法以免版本漂移）；② 组件区侧栏分区不变式（以[文档与演示站 §11](../design/documentation-site.md) 登记表为单一事实源对账中英 sidebar 分组顺序 / 组内字母序 / 「总览 · 能力说明」首尾位次）。**首跑命中并全部修复 11 处真实断锚**（原登记「全库 7 处」只计数字开头类，本次重新取证为 11 处并披露差异）+ §11 表漏登 `CheckboxGroup`。正反例语料 26 tests；仓库不变量断言（页面数 ≥150 / 锚点链接 ≥20 / 分组数 = 6 / 组件条目 ≥45）。提交 `9167eaf` / `158a1ea`。Review Gate R1 Pass → R2 Pass。
- **M2-3 英文文档同步治理**：新增 `docs:check:i18n-parity`，以[文档与演示站 §10](../design/documentation-site.md)「同步范围」（指南 / 组件介绍）为单一事实源，三类规则**全部两向断言**（`missing-translation` ↔ `stale-exemption`；`orphan-translation` ↔ `stale-en-only`；`structure-drift` ↔ `stale-structure-exemption`），另设范围页数下界与逐前缀下限、空扫描拒绝。**新鲜度口径**：内容级（git 时间戳）不入门禁（浅克隆 CI 下静默失效），门禁面取「章节数」代理。受检面 56 页全部有英文版、56 对已对账（中文 134 / 英文 60）。正反例语料 24 tests；仓库级负向对照三向。提交 `7051006`。Review Gate R1 Pass → R2 Pass。
- **M2-4 nav / sidebar 链接校验**：新增 `docs:check:config-links`——用 VitePress **已解析**配置取 nav / sidebar 链接（不静态解析 `config.ts`，避免计算式配置被静默排除），校验站点绝对路径存在性与锚点实算 slug；逐类报出纯锚点 / 非站点绝对路径 / `..` 穿越 / 目标缺失 / 锚点失效，外链跳过；分面空扫描与 `slug-source-diverged` 按失败退出。共享解析器同步收敛（统一越界收敛、`normalizeSidebar`、`EXTERNAL_LINK_RE` 单点）。受检面 152 条（nav 10 / sidebar 142）零问题；正反例语料 14 tests。提交 `193d01d`。Review Gate R1 Pass → R2 Pass。
- **M2-5 文档站观感与展示力（条件条目，用户确认启动）**：新增中英「组件画廊」页（`/components/showcase` + en），以登记表 `docs/.vitepress/showcase-registry.json`（12 项，覆盖 §11 全部 6 分组）驱动真实组件预览卡片；`ShowcaseGrid` 用 `import.meta.glob` 取中英示例、`defineAsyncComponent` 渲染，卡片链接按组件名 kebab 推导并过 `withBase`（兼容非根 base）。入口走中英总览页与指南侧栏；**不进组件侧栏**（§11 侧栏不变式为机器校验面）。新增 `docs:check:showcase`：对账结构 / `example` 形态 / 分组归属 / 中英组件页与示例存在性 / 登记顺序 / 挂载点，并设项数与分组数下界、空扫描拒绝；20 tests + 两次仓库级负向对照。**V 阶段 7 项全通过**（四档溢出 0px、列数 2/2/2/1、亮暗一致、12×2 链接 200 且 locale 正确、console / pageerror 0）。提交 `e801d64` / `899eaf4`。Review Gate **两分区并行 R1 双 Pass**（0 blocker）；修复点（`withBase` 链接、挂载点边界正则、`isNonEmptyString`、描述与文档措辞）已同批修正并复验（含 `VITEPRESS_BASE=/caomei-ui/` 实机构建），记为「已修复未复审」。证据见 [M2-5 记录](../design/governance/2026-09-22-m2-5-component-gallery.md)。
- 关键记录：[文档站版本化形态再评估](../design/governance/2026-09-22-docs-versioning-reevaluation.md)（M2-1）、[导航栏 768–959px 横向溢出修复](../design/governance/2026-09-22-m2-1-nav-overflow-fix.md)（M2-1 后续）、[M2-5 组件画廊交付与验证](../design/governance/2026-09-22-m2-5-component-gallery.md)

### M3 样式一致性收官（5 条）

- **M3-1 尺寸档位 `:where()` 归一化**：8 个组件的 28 条非 `:where()` 尺寸档位块归一（基类 `var(…, fallback)` 消费 + 档位块只声明变量）；真实浏览器计算样式 **242 项逐属性 0 差异**（新增 26 项 + 既有主矩阵 216 项）、`rg` 归零核验 0 命中。提交 `046c53e`。Review Gate R1 Reject（覆盖构成错述）→ R2 Pass。
- **M3-2 `check:design` 规则面扩围**：新增尺寸档位选择器守卫 `[tier-where]`（拦「档位类直接作为选择器主体」——G1 / G2 均无法覆盖的 28 条收敛面形态）；正反例语料 14 条、全库零误报、负向对照（注入裸档位块 → exit 1）确认可阻断；同步开发规范 §7 与设计规范 §8 检查项清单。提交 `e96903e`。Review Gate 三轮（R1 Reject → R2 Reject → R3 Pass）。
- **M3-3 重复声明（死声明）守卫 + 同类残留清理**：重新取证为 **8 处 / 4 组件**（input / input-number / select / textarea 各 2）并全部清理，落地 `[dup-decl]` 守卫（预算 0，含自定义属性）；正反例语料 6 条、全库零误报；真实浏览器 A/B（8 个聚焦态用例）**250 项逐属性 0 差异**，负向对照确认探针灵敏。**技术结论（已写入开发规范 §7）**：后写声明含 `var()` 时不构成渐进增强回退（级联选中后计算值期非法 → `unset`），故本清理为零行为变化。提交 `6b2ac42`。Review Gate R1 Pass。
- **M3-4 触发器 `unstyled` 遗留收敛**：date-picker / color-picker / split-button 三处「直连 Reka primitive 触发器 + `as-child`」收敛为本库 `CaomeiPopoverTrigger` / `CaomeiDropdownMenuTrigger`（`as-child` + `unstyled`）；真实 Chromium 触发结构 A/B **262 项逐属性 0 差异**（含闭合 / 开合两态），负向对照（去掉 `unstyled`）报 5 处差异；新增 6 条回归断言。提交 `72fa5aa`。Review Gate R1 Pass → R2 Pass。
- **M3-5 计算样式取证装置入库（自 M3-2 拆出）**：一次性采集装置迁入 `test/capture/`（聚焦夹具 + `capture.mjs` / `diff.mjs` + 冻结基线 `baseline.json`），命令 `pnpm capture:styles` / `capture:styles:freeze`，接入周级回归。采样面 **239 项**（相对一次性装置 262 项未纳入 23 项并逐条登记依据与触发点）；**等价证据**：交集 239 项逐属性 0 差异、负向对照报 1 处差异、冻结基线自一致复跑 0 差异；迁移期由交叉复算捕获两处真实缺陷。提交 `7575375`。Review Gate R1 并发分区（A Pass / B Reject）→ R2 Pass。规模：计入阈值 1323 行 / 13 文件（`baseline.json` 为生成物不计入）。
- 关键记录：[尺寸档位归一化](../design/governance/2026-09-21-m3-1-size-tier-normalization.md)、[触发器 unstyled 收敛](../design/governance/2026-09-21-m3-4-trigger-unstyled-convergence.md)、[计算样式取证装置入库](../design/governance/2026-09-22-m3-5-computed-style-capture-landing.md)

### M4 可访问性自动化回归（2 条）

- **M4-1 既有例外清单建立**：以 `axe-core`（devDependency）× Vitest `happy-dom` 建立组件级审计装置（`test/a11y/`，命令 `pnpm test:a11y`，53 tests）。受检面 = 组件族根组件（47 夹具），对外导出（`caomeiComponents`，79 个）按四组穷尽登记并由单测机检；规则面 16 条禁用规则逐条带理由，其余默认规则生效；**既有例外清单 3 条全部已裁定、无静默豁免**（ToastProvider `aria-hidden-focus` ×2 / MultiSelect 关闭态空 `aria-controls` / Calendar `aria-label` 落 `role=generic`，后两条经真实 Chromium 复核）。提交 `901297f`。Review Gate 并发分区 R1 双 Reject → R2 Pass。
- **M4-2 a11y 断言接入门禁**：把例外清单搬进机检数据（`test/a11y/exceptions.ts`，含判定依据指针与命中节点数指纹），落**两向断言**（例外外零违规 / 已登记例外必须仍命中且节点数不变）+ 清单自身守卫；断言位于 `pnpm test` → 随 `pnpm verify` 与 CI 合并门禁生效，**门禁强度只增不减**。负向对照三向实测灵敏；连续零失败（`pnpm test:a11y` 5 次 54 passed）。提交 `83ca018`。Review Gate R1 Pass。
- 关键记录：[a11y 既有例外清单](../design/governance/2026-09-22-m4-1-a11y-baseline-inventory.md)、[a11y 断言接入门禁](../design/governance/2026-09-22-m4-2-a11y-gate-wiring.md)

### M5 治理守卫精选（5 条）

- **M5-1 规划编号守卫**：新增 `check:planning-numbers`（代码注释与测试名的规划编号拦截，四段形态矩阵；测试名只在代码位置识别、未闭合引号按非字符串放弃；空扫描 / 非法目标目录 / 未知参数均 exit 1）；正反例语料 39 tests；首跑即修复 `tsdown.config.ts` 注释内既有编号。提交 `e95b547`。Review Gate R1 Pass → R2 Pass。
- **M5-2 治理记录索引与历史规划指针守卫**：新增 `check:governance-records`——① 治理索引**双向对账**（`missing-from-index` / `dangling-index-entry`，三类拒绝空扫描通过）；② 历史规划指针失效（链接文字含阶段 / 条目编号而目标已无该标识）；首跑命中并修复 4 处失效指针。正反例语料 24 tests；仓库级负向对照双类型 exit 1。提交 `3173e2e`。Review Gate R1 Pass → R2 Pass。
- **M5-3 文档完整性守卫的归档误报**：`check-docs-integrity` 的豁免口径由「全标题数不得减少」改为「**H1/H2 骨架标题数不得减少**」（层级由单点常量派生）；**双向仓库级对照**：模拟归档形态零告警、其上去掉一个 H2 则告警 1 条；单测 24 tests。提交 `b88d6e3`。Review Gate R1 Pass → R2 Pass。
- **M5-4 wisdom 蒸馏机检完备性**：`distill-wisdom` 新增 `--reconcile` 与 `check:distill-archive`（接入 `governance:check`）——归档批次段前言声明的「活跃 N 条」须与该段内顶层 bullet 数一致，声明缺失 / 数值不符 / 归档缺失均 exit 1，并拒绝空扫描通过；仓库级负向对照两向；单测 17 tests。提交 `02b29fd`。Review Gate R1 Pass → R2 Pass。
- **M5-5 载体一致性缺口**：复核判定为措辞错误并拆分修正（「D1 同类残留 8 处」确以重新取证口径登记于 Backlog 且后续已交付；「`scanRules` 漏检路径」实为本阶段内修复、非 Backlog 载体），历史评估记录 §2 补复核结论并标注快照口径。提交 `58f814d`。Review Gate R1 Pass → R2 Pass。
- 关键记录：[M4-2 / M5 各项记录见治理索引](../design/governance/index.md)

### 阶段总结

- **提交对账**：`git log --oneline f1b0b22..899eaf4 | wc -l` → **28** 个提交（阶段边界为 `899eaf4`；**不得写 `HEAD` 相对范围**，归档提交会推进 `HEAD`），其中 **27** 个为本阶段 M1~M5 的交付 / 记录提交（归档块逐条引用），另 1 个 `f7d8194`（`docs(plan): 登记 dependfix 迁移反馈的 DataTable 与组件缺口候选`）为候选登记类提交、非交付物，故未逐条引用。
- **回扫口径（三段式，避免把回扫面等同于机检面）**：① **机检面 8 处**——链接文字含阶段 / 条目编号的历史规划指针，由 `pnpm check:governance-records` 覆盖（接入 `governance:check`）：`2026-09-16-m2-primary-browser-validation.md:7`、`2026-09-16-m3-demo-motion-validation.md:11`、`2026-09-20-m1-1-build-path-poc.md:5`、`2026-09-20-m1-2-entry-semantics-and-dts-verification.md:5`、`2026-09-20-m1-3-style-on-demand-landing.md:6`、`2026-09-20-m2-1-component-quality-audit.md:5` 与 `:122`、`2026-09-20-m2-2-m2-3-style-governance-landing.md:6`；可复算（**钉提交边界**，不用 `HEAD` / 工作区相对范围）：`git show da74641 -- 'docs/**' | grep -E '^\+.*todo-archive\.md' | grep -cE '\[待办事项归档 [A-Z]{1,3}[0-9]{1,3}\]|\[待办事项归档 M[0-9]'` → 8。② **人工面 8 处**——链接文字为**载体名**（`待办事项` / `待办归档` / `todo-archive.md` 等形态）而目标内容已迁出的指针，本批一并改指 `todo-archive.md`：`2026-09-16-m2-primary-browser-validation.md:5`、`2026-09-20-m2-1-component-quality-audit.md:91` 与 `:122`（该行第二个链接）、`2026-09-20-m2-2-m2-3-style-governance-landing.md:27` 与 `:75`、`2026-09-21-next-stage-scope-evaluation.md:193`、`2026-09-22-phase12-m1-release-execution.md:70`、`roadmap.md:32`；口径为**逐条枚举求和**（改指分属 `da74641` / `e58ad96` 与本次归档提交，无单命令可覆盖，故不写命令）。合计 **16 处**。③ **未处理面**——其余历史记录中以载体名出现的链接多属「出证时点登记动作」的陈述（如「已同步 `待办事项`」），其时效由各记录头部的快照 / 让渡声明界定；本批**不回改**、亦未登记为待办——若需统一口径，须另立条目并经用户裁定（[规划规范 §7](../standards/planning.md) 的机检义务止于第 ① 段）。
- **质量门**：`pnpm verify` exit 0（lint / lint:css / lint:md / typecheck / typecheck:docs / test **83 文件 1681 tests** / build / check:build / check:resolver / check:nuxt / docs:build / docs:check:i18n-routing / governance:check）；`docs:build` exit 0（0 dead link / 0 TypeError）；`governance:check` 新增守卫 5 项（planning-numbers / governance-records / distill-archive / docs:check 三段扩链 / showcase）。
- **长期任务**：阶段收口前触发一轮门槛复核（[长期任务](./recurring.md) §3 第 11 轮，2026-09-23，零代码改动域；两组任务待执行批次 0 项、条件触发 2 项维持）。
- **归档批次审计**（2026-09-23，本阶段归档与规划清理批次）：经 `@code-reviewer` Review Gate **三分区并行审计**——R1 分区 A（规划载体）**Reject**（`todo.md` 仍保留 Phase 12 归档摘要与归档指针）/ 分区 B（规范新增）、分区 C（治理记录回扫）Pass；R2 **Reject**（回扫口径声明与事实不一致）；R3 **Reject**（同一声明的处数与标签不自洽，属复发）；按 [AI 协作规范 §3.5](../standards/ai-collaboration.md) 执行改进协议（① 先提交已 Pass 子范围 `da74641` / `e58ad96`；② 复发 finding 落为规范约束「引用命令须钉持久边界」）；R4 **Reject**（引用的 `git diff` / `HEAD` 相对命令在提交后不可复算——`HEAD` 相对范围与工作区相对范围都不可作为持久证据）；修复后 **R5 Pass（0 blocker）**。R5 的 1 条 warning（§8 规则的 ref 钉定要求应按命令维度区分 revision 维度命令与内容扫描类）已同批修正，记为「已修复未复审」。
- **遗留与后续候选**：中英组件总览页缺 `CheckboxGroup`（§11 要求总览页与侧栏一致）；画廊浏览器回归断言；对比度遗留项（含 M2-5 实测 `--caomei-color-text-muted` × 站点 soft 底 4.48:1）；Input 示例可访问名；文档站双花括号插值机检守卫；多版本托管（触发条件：同时维护 ≥2 个对外版本）；Phase 8 未启动（等待下游完成接入）；momei 侧迁移由 momei 项目执行；其余候选见 [Backlog](./backlog.md)。

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
