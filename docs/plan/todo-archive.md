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

## 跨阶段预落地条目

### Switch（Phase 2 预落地，用户授权；随 Phase 2 归档）

- 时间：2026-09-12
- 交付：封装 Reka UI `Switch`，补 `defineOptions` 与表单属性 `name` / `id` / `required` / `value`、可访问名 `label`、CSS 变量覆盖钩子与焦点态；文档、示例与单元测试同步
- 提交：`8a23d1e`
- 质量门：`pnpm verify` 通过；单元测试 16 例
- 审计：`@code-reviewer` Review Gate Pass（RG-SW-01 ~ 06）；浏览器验证 59/59 通过
- 遗留：真实 `<form>` 提交链路与 SSR 水合未纳入浏览器验证覆盖
