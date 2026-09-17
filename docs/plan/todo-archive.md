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
  - momei 迁移的执行范围与 5 项决策 → 待启动的 Phase 7 第二阶段（见 [路线图](./roadmap.md) 与[可行性评估](../design/governance/2026-09-17-momei-migration-feasibility.md)）

## 跨阶段预落地条目

### Switch（Phase 2 预落地，用户授权；随 Phase 2 归档）

- 时间：2026-09-12
- 交付：封装 Reka UI `Switch`，补 `defineOptions` 与表单属性 `name` / `id` / `required` / `value`、可访问名 `label`、CSS 变量覆盖钩子与焦点态；文档、示例与单元测试同步
- 提交：`8a23d1e`
- 质量门：`pnpm verify` 通过；单元测试 16 例
- 审计：`@code-reviewer` Review Gate Pass（RG-SW-01 ~ 06）；浏览器验证 59/59 通过
- 遗留：真实 `<form>` 提交链路与 SSR 水合未纳入浏览器验证覆盖
