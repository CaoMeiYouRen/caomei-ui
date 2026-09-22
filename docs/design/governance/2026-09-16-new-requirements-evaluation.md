# 2026-09-16 新需求评估记录（文档站 IA / 默认主色 / 站点观感 / Drawer 动画 / 复用 / 类型与 lint）

> 状态：评估记录（2026-09-16）。记录当日用户提出的 6 项需求的现状取证、插队例外判定、候选范围与决策请求；**执行状态以 [待办事项](../../plan/todo.md) 与 [Backlog](../../plan/backlog.md) 为准**，本文件不构成阶段登记。
>
> 关联：[规划规范 §3](../../standards/planning.md) ｜ [路线图](../../plan/roadmap.md) ｜ [Backlog](../../plan/backlog.md) ｜ [设计规范](../design-spec.md) ｜ [文档与演示站设计](../documentation-site.md) ｜ [开发规范](../../standards/development.md)

## 1. 结论速览

| # | 需求 | 命中插队例外 | 判定 | 载体 |
| :-: | --- | :-: | --- | --- |
| 1 | 组件文档分组 / 排序 / 能力说明归位 | 否 | 候选（文档易用性） | Backlog §1.6 |
| 2 | 默认主题主色（品牌红）与语义色冲突 | 否 | 候选（设计 / 主题） | Backlog §1.1（并入既有「品牌主色」项） |
| 3 | 文档站观感与展示力 | 否 | 候选（文档站体验） | Backlog §1.6 |
| 4 | Drawer 无动画 | 否 | **只读诊断已完成：组件无缺陷**，根因为文档站 reduced-motion 覆盖；修复选项登记候选 | Backlog §1.6 |
| 5 | 组件间公共函数抽取 | 否 | 候选（代码治理） | Backlog §1.6 |
| 6 | 导出类型声明与 ESLint 严格化 | 否 | 候选（代码治理） | Backlog §1.6 |

> 6 项均为功能、体验或治理增强，**无一命中插队例外清单**（已确认的安全漏洞 / 破坏下游构建或发布 / blocker 级缺陷）。按 [规划规范 §3](../../standards/planning.md) 默认路径先登记候选，等待用户明确决策后再进入当前阶段。第 4 项为用户明确要求的「检查原因」，属只读诊断，已完成。

## 2. 组件文档信息架构（分组 / 排序 / 能力说明归位）

**现状（证据）**

- `/components/` 侧栏只有单一分组「基础组件」，45 个页面按历史登记顺序排列，仅局部形成族聚类（输入族、选择族、浮层族、数据族、导航族连续），无稳定规则可循（`docs/.vitepress/config.ts` 的 `'/components/'` 块）；节选：Button、ButtonGroup、Avatar、Input、Textarea、……、DataTable、DataView、Paginator、……、Tag、Badge。
- 「能力说明」是 `/guide/` 侧栏下的一个分组（组合式 API / 图标 / 内建文案与语言），与工程类指南（快速上手 / 本地联调 / 开发指南 / 发布指南 / AI 协同开发）并列，未与组件同区。
- zh 组件区**缺少总览页**：`docs/components/index.md` 不存在（en-US 侧有 `docs/i18n/en-US/components/index.md` 作为 Overview），导航「组件」直接落到 Button。

**候选方案（待决策）**

- **分组**：按关联性分 6 组（组间按使用频率排序；现行口径以 [文档与演示站设计](../documentation-site.md) §11 的固定组序为准），45 个页面全覆盖，映射见 [附录 A](#附录-a-组件分组映射-45-页)。
- **排序**：组内按英文名**字母序**——规则可预测、易维护、与 en-US 侧栏同名同序；备选「依赖 / 使用顺序」（教学性好，但规则主观、新增组件时需判断插入位置）。建议取字母序，同族微调只允许写入文档的固定规则。
- **能力说明归位**（三选一）：
  - 方案 A（只改侧栏）：`/components/` 侧栏拆为「组件（6 组）／组合式 API／图标／国际化」四个分组，页面 URL 不变（仍在 `/guide/*`），外链与 i18n routing 零影响。
  - 方案 B（改 URL）：三个页面迁至 `/components/composables`、`/components/icons`、`/components/locale`，语义最一致；需处理 `routingPages`、`themeConfig` 链接与既有外链。
  - 方案 C（独立顶层）：新增顶层导航「能力」，与组件平级承载三类文档。
- **国际化单独成段**：`/guide/locale` 内容已具备（机制 / 22 命名空间 × 23 消费组件 / 合并回退 / momei 注入示例）；候选拆为「API 用法」与「命名空间对照表」两节，或按上述方案归位后补「国际化」专节。
- 建议同时补 zh 组件总览页（`/components/index.md`）承载分组导航与画廊——可与第 3 项合并实施。

优先级：中（文档易用性）；依赖：无。

## 3. 默认主题主色（品牌红）与语义色冲突

**现状（证据）**

- `src/styles/theme.css` 的 `:root`：`--caomei-color-primary: #e63946`（红）、`--caomei-color-danger: #dc2626`（红）。
- `src/styles/presets/caomei.css`：primary `#e63946`、danger `#ef4444`——两者几乎同色。
- 既有 Backlog 项「默认主色（品牌红）」：`#e63946` 配白字约 4.17:1，低于 AA 4.5:1；另实测 `caomei` 预设 danger `#ef4444` 配白字约 3.76:1（同低于 AA）。

**候选**：① 默认主色改蓝（如 `#2563eb` / `#3b82f6`，对齐主流组件库），`caomei` 预设保留品牌红以服务品牌需求；② 仅加深默认主色以满足 AA 并拉开与 `danger` 的色相距离（预设侧 danger 的对比度需一并纳入，否则只修了 primary）；③ 维持现状，仅在文档说明主色与语义色的区分。

优先级：中（涉及默认外观，属破坏性视觉变更，需用户决策）；依赖：无。

## 4. 文档站观感与展示力

**现状（证据）**：首页为 VitePress 默认 `layout: home`（hero + 4 条 features + 快速链接）；组件区无总览页与画廊；样式层仅有 `.demo-row` 级别的轻量 demo 外壳，`docs/.vitepress/theme/` 的样式修正只有表格 `display` 还原（`caomei-demo.css`）与 reduced-motion 恢复（`motion.css`）——已具备自定义 `layout.vue`（顶栏挂载主题预设切换器）、`component-api.vue` 与 `langs.ts`，缺的是**总览页、组件画廊与 demo 外壳升级**，而非主题演示能力本身。

**候选**：① zh 组件总览页（分组卡片 + 一句话说明 + 链接，可与第 2 项合并）；② 首页组件画廊（缩略图 / 分类入口）；③ demo 外壳升级（标题 / 说明 / 代码折叠与复制）；④ 全局视觉细节（hero、侧栏、代码块）。约束：服务于「更好展示组件」，不引入 Tailwind。

优先级：中（展示力，影响组件库对外印象）；依赖：与第 2 项（信息架构分组）合并实施更划算。

## 5. Drawer 动画缺失（已定位：组件无缺陷）

用户报告「Drawer 抽屉组件目前没有动画效果」。只读诊断（Playwright；dev 服务与 `docs:build` 产物双向复现）：

| 场景 | `matchMedia('(prefers-reduced-motion: reduce)').matches` | panel `animation-duration` | 实测位移时间线（left 抽屉，宽 420px） |
| --- | :-: | --- | --- |
| no-preference | false | `0.2s` | x: -420 → -390(40ms) → -32(120ms) → 0(260ms) |
| reduce | true | **`0.001s`** | 全程 x = 0（动画被压成 1ms） |

- **组件侧实现正确**：`data-state="open" / "closed"`、scoped keyframes（`caomei-drawer-in-left-<hash>`）均命中，根修饰类与 `data-v-*` 属性就位；关闭路径同样播放（x: 0 → -93(40ms) → -403(120ms) → 300ms 后卸载）。
- **根因**：VitePress 默认主题 `base.css` 在 reduced-motion 下对 `*` 注入 `animation-duration: 1ms !important`、`animation-iteration-count: 1 !important`、`transition-duration: 0s !important`（`node_modules/vitepress/dist/client/theme-default/styles/base.css:1-14`；构建产物 `docs/.vitepress/dist/assets/style.C5Xs85I3.css` 同样包含该规则）。
- **影响面（仅文档站）**：除 `docs/.vitepress/theme/motion.css` 已恢复的 ProgressSpinner / ProgressBar / Skeleton 外，其余动画与**全部 transition** 在 reduced-motion 下都会失效——Accordion 展开、DatePicker 面板、DropdownMenu / Popover 入场、Toast 入场与滑出、AutoComplete 与 Button 的加载指示、Image 占位脉冲，以及所有 hover / focus 过渡。组件库自身在 reduced-motion 下主动关闭动画（`@media (prefers-reduced-motion: reduce) { animation: none }`），属正确的无障碍行为，**不受影响**。
- **结论**：不是组件缺陷。若本地环境未开启「减少动态效果」，实测动画正常（可在控制台执行 `matchMedia('(prefers-reduced-motion: reduce)').matches` 自检）。
- **候选（需决策，含 a11y 取舍）**：① 维持现状（尊重系统偏好，reduced-motion 下演示静态化）；② 文档站对 demo 区域 opt-in 恢复入场 / 过渡（与 `motion.css` 同思路，需在文档写明取舍）；③ 提供「演示动画」显式开关（默认尊重系统偏好，用户主动开启才恢复）。

优先级：低 ~ 中；依赖：与第 2、3 项同属文档站改造工作面，建议合并决策与实施。

## 6. 组件间公共函数抽取（复用率）

**现状（证据）**

- locale 回退取值 `props.x ?? locale.value.<ns>.<key>`：**39 处**，集中在 Password(7) / Paginator(6) / DataTable(4) / MultiSelect(3) / AutoComplete(3)。
- attrs 透传：**58** 个组件写 `inheritAttrs: false`、**37** 处 `v-bind="$attrs"`，而 `_shared/use-attr-forwarding` 实际仅被 **9** 个组件复用（auto-complete / checkbox / file-upload / input / input-number / multi-select / password / switch / textarea）。
- 浮层外观：`--caomei-color-bg-elevated` 出现在 **24** 个组件文件；入场动画 `0.12s ease-out` **3** 处；阴影 / 遮罩原始字面量为 **13 处 / 10 个文件**（`check-design` 口径，即既有 Backlog 项「阴影与遮罩 token 迁移」）。
- 其他重复候选：Select / MultiSelect / AutoComplete 的选项列表渲染与键盘接线各自实现（3 份）；数值钳位 / 取整 2 份（`input-number` 内联 `Math.max` / `Math.min`，`date-picker` 时间输入本地 `clamp`）；焦点相关重复模式——`defineExpose({ focus })` 4 处（textarea / input / input-number / password）、清空后回焦 2 处（input / select）、面板空白点击聚焦内部输入 2 处（auto-complete / multi-select）。**浮层关闭后的焦点回归由 Reka primitive 承担，库内无重复实现**，不作为抽取目标。
- `src/components/_shared/` 现有 5 个模块：`color` / `date` / `date-format` / `option` / `use-attr-forwarding`。

> 取证口径（2026-09-16 快照，均排除 `*.test.*`）：`rg -o '\?\? locale\.value\.' src/components | wc -l` → 39；`rg -l 'inheritAttrs: false' -g '*.vue' src/components | wc -l` → 58；`rg -l 'v-bind="\$attrs"' src/components | wc -l` → 37；`rg -l 'caomei-color-bg-elevated' src/components | wc -l` → 24；`rg -l 'useAttrForwarding' src/components/*/*.vue | wc -l` → 9；`rg 'animation: caomei-.*in 0\.12s'` → 3；`node scripts/governance/check-design.mjs` → rgb 13 处 / 10 文件；`.focus()` 8 处逐条人工核对语义（4 处 `defineExpose` 方法、2 处清空回焦、2 处面板锚点聚焦，另 1 处为注释）。

**候选**：以「同一模式在 ≥3 处且语义一致」为抽取门槛，优先 locale 文本解析（39 处）、attrs 透传统一（58 / 37 / 9 的落差）、浮层样式与 token、选项列表渲染（3 份）；数值钳位（2 份）与焦点模式（4 + 2 + 2）未达门槛，暂不单列；在下一次相关模块改造时顺带抽取，避免为抽取而全库重构。

优先级：中（代码治理，影响后续组件开发成本）；依赖：浮层样式抽取与既有「阴影与遮罩 token 迁移」同工作面，宜合并评估。

## 7. 导出类型声明与 ESLint 严格化

**现状（证据）**

- 类型产出：tsdown 生成 `dist/index.d.ts`；组件 props / slots 与 composables 均有显式类型（抽查 `src/composables/*.ts` 导出函数全部带返回类型）。
- lint 宽松：根 `eslint.config.js` 使用 `eslint-config-cmyr/vue`，其中 `explicit-function-return-type`、`explicit-module-boundary-types`、`no-explicit-any`、`no-unsafe-*` 均为 **off**（`node_modules/eslint-config-cmyr/index.js:137-156`）。
- **严格预设探针**（`eslint-config-cmyr/vue/strict`，只读试跑，未改动仓库配置）：**67 error / 229 warning，命中 63 个文件**；`src/components` 占 252 项且**绝大多数在 `.test.ts`**（progress-bar 22 / slider 21 / paginator 17 / confirm-dialog 17 / checkbox 17 / switch 15 ……），组件实现文件少量（`data-table.vue` 7 等）；另涉 `docs/.vitepress`(15)、配置与 playground(各 1~6)。规则分布以 `no-unsafe-argument`(146)、`no-unnecessary-condition`(35)、`no-unsafe-call`(22)、`no-unsafe-member-access`(20) 为主。

**候选**：① 分两步——先启用非 type-aware 的「显式类型」子集（`explicit-module-boundary-types`、`no-explicit-any` 等）为 error；再按目录分批收敛 type-aware 的 unsafe 族（优先 `src/**` 实现文件、测试文件次之），最后切换 `vue/strict`；② 直接切严格预设并一次性收敛（工作量大、易混入行为改动）；③ 仅对 `src/**` 启用严格规则，`playground` / 配置脚本等豁免。

优先级：中；风险：type-aware 规则会同时暴露测试代码的类型弱点（属收益而非负担）；依赖：无，可与组件开发并行，但需一次性收敛测试文件类型，避免门禁长期红。

## 8. 用户决策请求

1. **文档站 IA**：采用「6 组 + 组内字母序」？能力说明归位选 A（只改侧栏）/ B（改 URL）/ C（独立顶层）？是否补 zh 组件总览页？
2. **默认主色**：改蓝（保 `caomei` 预设红）/ 仅加深至 AA / 维持现状？
3. **站点观感范围**：总览页 / 首页画廊 / demo 外壳 / 全局视觉细节——取哪几项？
4. **文档站动画**：维持现状 / demo opt-in 恢复 / 显式开关？
5. **复用抽取与 lint 严格化**：何时立项、按哪条路径（分批 / 一次性 / 仅 src）？

## 附录 A：组件分组映射（45 页）

> 本表为 2026-09-16 的决策快照。组件分组与排序的**现行规则与权威映射**见 [文档与演示站设计 §11](../documentation-site.md)；两处不一致时以 §11 为准。

| 分组 | 组件（组内按字母序） | 数量 |
| --- | --- | :-: |
| 基础与布局 | Avatar、Badge、Button、ButtonGroup、Card、Divider、Image、SplitButton、Tag | 9 |
| 表单输入 | Checkbox、FileUpload、FloatLabel、Input、InputGroup、InputNumber、Password、RadioGroup、Slider、Switch、Textarea | 11 |
| 选择器 | AutoComplete、Calendar、ColorPicker、DatePicker、MultiSelect、Select、SelectButton、ToggleButton | 8 |
| 反馈与浮层 | ConfirmDialog、Dialog、Drawer、Message、Popover、Toast | 6 |
| 数据展示 | DataTable、DataView、Paginator、ProgressBar、ProgressSpinner、Skeleton | 6 |
| 导航与操作 | Accordion、DropdownMenu、Stepper、Tabs、Toolbar | 5 |
