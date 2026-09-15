# 长期规划与 Backlog

本文档记录已评估的候选与长期主线；候选准入、优先级与插队例外规则见 [规划规范 §3](../standards/planning.md#3-新需求处理原则hard-requirement)，本文档不重述。

> **文档结构**
>
> - §1 候选池：**仍待用户决策**的候选（含外购建议等不纳入自研的记录）。
> - §2 维护约定。
>
> Phase 6（组件库补全与规范化）与 Phase 7 第一阶段（迁移就绪）已完成的条目及其评估证据已随阶段迁入 [待办归档](./todo-archive.md)；本表仅保留仍待决策的候选。

## 1. 候选池（待用户决策）

> 2026-09-14 用户新需求（组件补全 / 使用复核 / 许可声明 / 主题预设 / 国际化 / 移动端 / 设计规范）评估结论：全部属于功能与体验增强，**无一命中插队例外清单**（安全漏洞 / 破坏下游构建 / blocker 缺陷）。经用户决策，组件补全 / 使用复核 / 主题预设 / 设计规范 / 许可声明已在 [Phase 6](./todo-archive.md) 完成并归档；**组件国际化（需求 5）与移动端 / 响应式（需求 6）延后**，与其余候选一并保留在本节。
>
> 2026-09-16 用户新需求（文档站组件信息架构 / 默认主题主色 / 站点观感 / Drawer 动画 / 公共逻辑抽取 / ESLint 严格化）评估结论：全部属于功能、体验或治理增强，**无一命中插队例外清单**；按 [规划规范 §3](../standards/planning.md) 默认路径登记为候选，待用户明确决策后进入当前阶段。其中「Drawer 动画」经只读诊断确认为 **VitePress reduced-motion 覆盖**（组件实现无缺陷），可作为文档站决策项。评估记录见 [2026-09-16 新需求评估记录](../design/governance/2026-09-16-new-requirements-evaluation.md)。

### 1.1 组件增强候选

> 2026-09-14 Phase 6 M1 复核（[momei 使用复核台账](../design/governance/2026-09-14-momei-usage-audit.md)）产出 23 项「需增强」结论，按组件归并如下。其中 Button 形态增强与 DataTable 能力增强已在 Phase 6 交付并归档；迁移映射规范（`severity→tone` 等）已由 M2 [设计规范 §7](../design/design-spec.md) 承接。
>
> **2026-09-14 复核与迁出**：经 [Phase 7 第一阶段评估记录 §4](../design/governance/2026-09-14-phase7-first-stage-evaluation.md) 按 momei 真实用量调研，**P0 高频硬缺口**（Select 家族对象选项映射 / Tag / Message / InputNumber / Textarea / Password）已在 Phase 7 第一阶段交付；其中 **Message 语义与形态增强已全部交付、无剩余候选**（`text` 变体经一方源码取证确认不存在于 PrimeVue Message，不实现），不再作为候选登记；**P1**（Image / ProgressSpinner / Dialog / DataTable 剩余）经用户决策**移入 Phase 7 第二阶段**，由迁移实际暴露驱动；本表保留 **P2 低频项**（Button 角标、Badge 叠加、浮动层命令式 API、Menu 数据驱动、Paginator、FileUpload、ToggleButton、Toolbar、Checkbox 分组值、Switch change）以及跨组件 token 治理项，待迁移实际暴露后决策。

| 候选 | 来源 | 说明 | 优先级 |
|------|------|------|--------|
| Button 角标增强 | 组件实现评估 + M1 复核 | **保留（P2）**：Button 的 `:badge` 角标（M1 台账 momei 2 处）未纳入 Phase 6 M3（标记待评估）；需评估角标内容 / 位置 / 与图标共存。 | 低 |
| Tag/Badge 增强 | 组件实现评估 + M1 复核 | **部分迁出**：Tag `severity` → `tone` 规范化、`rounded` / `outlined`、`#icon` 插槽（P0）已在 Phase 7 第一阶段交付；**保留（P2）** Tag 可选中筛选 / 可编辑（Reka TagsInput）、Badge 叠加位置偏移与宽度过渡动画。 | 中 |
| Select 增强 | 组件实现评估 + M1 复核 | **已在 Phase 7 第一阶段交付（P0）**：`option-label` / `option-value` 字段映射、非 string value、`show-clear`、`#option` 插槽（`option-label` 计数 88：Select 66 / Dropdown 5 / MultiSelect 8 / SelectButton 9；Dropdown 为旧名归入 Select）。`option-label` / `option-value`、`show-clear`、`#option` 均已交付；**`filter` 经用户决策（2026-09-15）按方案 A 迁移映射到 `AutoComplete`**，不在 Select 上实现——Reka Select 把 `role="listbox"` 固定在面板元素上（`SelectContentImpl` 在 `$attrs` 之后写入，无法覆盖），面板内放搜索框会使 textbox 成为 listbox 的 owned child（违反 WAI-ARIA `aria-required-children`），可搜索单选的 primitive 是 Reka `Listbox` / `Combobox`。**保留（P2）** 分组（SelectGroup）与可编辑组合。 | 中 |
| ColorPicker 色板导航增强 | M4 条目 5 follow-up（2026-09-15） | 色板当前为 `role="group"` + `aria-pressed` 按钮组（Tab 遍历，无方向键 roving）；候选改为 `radiogroup` + `aria-checked` 并补 roving tabindex。触发条件：下游启用 `swatches` 且出现键盘密集使用场景 | 低 |
| AutoComplete 严格选项模式 | M3 条目 2 迁移评估（2026-09-15） | `Select filter` 按方案 A 迁往 `AutoComplete`，但当前 AutoComplete 在回车 / 失焦时会提交自由文本（`commitFreeText`），与 PrimeVue `Select filter`「值必须来自选项列表」的语义有差；候选补 `strict` / 限制自由文本的开关，或按 Reka `Listbox` 另立可搜索单选形态。触发条件：下游迁移实测出现「取值必须受限于选项列表」的受控字段用例。 | 低 |
| DatePicker 范围选择 | M4 条目 2 范围收敛（2026-09-15，用户决策延后） | **延后（低）**：momei 快照（2026-09-15，`rg "<DatePicker"` 排除 node_modules/dist/.nuxt/.output）`<DatePicker>` 6 处 / 4 文件、`show-time` 4 处、`selection-mode` **0 处**，零用量。候选补 `selectionMode="range"`（Reka `RangeCalendar`）或独立 RangePicker：起止值模型（`Date[]` / `{ start, end }`）、区间展示与校验、与现有 `dateFormat` / `showTime` / `minValue` / `maxValue` 的组合。触发条件：下游出现日期区间筛选 / 区间录入真实用例。 | 低 |
| 表单输入增强 | M1 复核 | **部分迁出**：InputNumber `use-grouping` / `min-max-fraction-digits`、Textarea `auto-resize`、Password `feedback`（P0）已在 Phase 7 第一阶段交付；**保留（P2）** Checkbox 分组值数组、Switch `change` 事件、FileUpload 上传能力、ToggleButton 状态文案。 | 中 |
| 展示类组件增强 | M1 复核 | **部分迁出**：Image `preview` + `#indicatoricon`、ProgressSpinner `stroke-width` / `animation-duration` / 任意尺寸（P1）已移入 Phase 7 第二阶段；**保留（P2）** Toolbar `#start` / `#center` / `#end` 分区插槽。 | 低 |
| 浮层与导航增强 | M1 复核 | **部分迁出**：Dialog `show-header` / `breakpoints` / `@hide`（P1）已移入 Phase 7 第二阶段；**保留（P2）** Popover 命令式 `toggle(event)` 锚点、DropdownMenu `:model` + `:popup`、Paginator 每页条数选择、ConfirmDialog `icon`。 | 低 |
| 实底前景 token 统一 | M3 复核 | Button 的 `tone` 实底已改用 `--caomei-color-on-solid`；Tag / Badge / Message / SelectButton 等实底仍用 `-foreground`，评估统一（含 momei 暗色 `#000` 前景的对比问题） | 中 |
| 默认主色（品牌红） | M3 复核 + 用户需求（2026-09-16） | 两个问题合看：① **对比度**——`#e63946` 配白字约 4.17:1，低于 AA 4.5:1；② **语义冲突**——默认 `--caomei-color-primary: #e63946` 与 `--caomei-color-danger: #dc2626` 同为红色系（`caomei` 预设 primary `#e63946` / danger `#ef4444` 几乎同色），主操作易被误读为危险操作。候选：默认主色改蓝（`caomei` 预设保留品牌红）/ 仅加深至 AA 并拉开与 `danger` 的色相距离 / 维持现状并在文档说明。取证与决策点见 [2026-09-16 新需求评估记录 §3](../design/governance/2026-09-16-new-requirements-evaluation.md) | 中 |

### 1.2 长尾组件候选（Tier 3）

> 依据调研文档于 2026-09-13 重新评估，实现方式与 Reka 成熟度见 [组件设计 §5](../design/components.md)，本表只登记候选与优先级。优先级为「中」的 7 个候选（RadioGroup / RadioButton、ProgressBar、Popover、Slider、Skeleton、Toolbar、ToggleButton；其中 Skeleton 为自建纯样式）已于 Phase 4 交付并归档（见 [待办归档](./todo-archive.md)）。
>
> 由 momei 使用面驱动的组件已在 Phase 6 交付或决策：Divider / InputGroup / FloatLabel / ButtonGroup / AutoComplete / Stepper 已实现并归档，Panel 由 `Card` 承载不新建；`SplitButton` / `DataView` / `DatePicker / Calendar` / `Drawer` / `ColorPicker` 已在 [Phase 7 第一阶段](./todo-archive.md) M4 交付并归档（按用量与依赖排序 DatePicker → Drawer → SplitButton → ColorPicker → DataView）。其中 `DatePicker / Calendar`、`ColorPicker` 涉及 Reka Alpha primitive，已锁 `reka-ui@2.10.4` 并补 API 回归；`Drawer` 未采用 Reka `Drawer`（Alpha / Vaul 形态、不负责面板定位），改封装 Reka **稳定**的 Dialog primitive + 四向定位 CSS（见 [组件设计 §5](../design/components.md) 与 [设计规范 §7](../design/design-spec.md)）。本表仅保留当前无下游使用证据的长尾。

| 候选 | 来源 | 优先级 |
|------|------|:-:|
| Sidebar | momei 使用面（标签级统计未命中，待复核） | 低 |

### 1.3 不纳入自研的能力（外购建议）

| 能力 | 来源 | 说明 | 优先级 |
|------|------|------|--------|
| 富文本与图表封装 | momei 使用面 | Editor / Chart 建议外购（Tiptap / ECharts），不自研 | 低 |

### 1.4 国际化候选（需求 5，延后）

> 承接原「国际文字内置文案补全」候选并按用户需求（2026-09-14）扩展为完整机制。**现状（2026-09-15 更新）**：「组件 i18n 注入机制」已随 Phase 7 第一阶段 M2 落地（`CaomeiConfigProvider` / `provideLocale` + `useLocale`，16 个内建文案组件已消费注入 locale），文档站也已按页面语言注入（英文页展示英文内建文案），16 个内建文案组件范围内的英文文档页中文问题已解决；非内建文案组件（如 file-upload）的用户可见中文另见本表候选。本表余项收敛为语言矩阵与 locale 注册治理等中期 / 长期候选，以及 file-upload 类非内建文案补缺。**用户决策（2026-09-13）：当前接受现状**；机制已落地，其余语种的本地化由下游注入承担。
>
> **2026-09-14 用户决策：本组含短期 zh-CN / en-US 一并延后**，不纳入 Phase 6。
>
> **2026-09-14 迁移评估更新**：因 momei 支持 5 种语言且动态切换，组件内建文案缺口会在迁移后造成多语言回归（详见 [Phase 7 第一阶段评估记录 §5](../design/governance/2026-09-14-phase7-first-stage-evaluation.md)）。**「组件 i18n 注入机制」（含短期 zh-CN / en-US）已在 Phase 7 第一阶段 M2 落地**（2026-09-15；翻译语种由下游注入）；中期 / 长期语言矩阵、RTL 与 locale 注册治理仍保留在本表待决策。

| 候选 | 来源 | 说明 | 优先级 |
|------|------|------|--------|
| ~~组件 i18n 注入机制~~ | 用户需求（2026-09-14） | 已落地 Phase 7 第一阶段 M2：locale provider（`CaomeiConfigProvider` / `provideLocale` + `useLocale`）与逐组件覆盖，支持下游注入 | — |
| ~~语言矩阵 - 短期~~ | 用户需求（2026-09-14） | 已落地 Phase 7 第一阶段 M2：zh-CN / en-US 承载现有两份文案；zh-TW / ja-JP / ko-KR 由下游注入 | — |
| 语言矩阵 - 中期 | 用户需求（2026-09-14） | 追加繁体中文（zh-TW）、日语（ja-JP）、韩语（ko-KR） | 低 |
| 语言矩阵 - 长期 | 用户需求（2026-09-14） | 追加俄语、法语、德语、西班牙语、葡萄牙语；视情况追加希腊语、意大利语、印地语、孟加拉语、印度尼西亚语等 | 低 |
| RTL（阿拉伯语）支持 | 用户需求（2026-09-14） | 从右往左排版涉及逻辑属性、图标镜像、浮层定位与滑动手势镜像，风险高，单独立项谨慎评估，不与其他语言捆绑 | 低 |
| locale 组织与注册治理 | 用户需求（2026-09-14） | 语言数量增长后的目录组织、注册表、按需加载与类型约束；可参考 momei `i18n/config` registry 机制 | 低 |
| file-upload 用户可见文案本地化 | 迁移评估发现（2026-09-15） | file-upload 的默认插槽与 `file` 插槽已可由下游自定义，但库内建文案（默认提示与移除 `aria-label`）仍为中文，不在 16 个内建文案组件范围内；需评估补 `fileUpload` locale 命名空间 | 低 |

### 1.5 移动端与响应式候选（需求 6，延后）

> **2026-09-14 用户决策：本组延后处理**，不纳入 Phase 6。
>
> 缺口依据：2026-09-14 统计（Phase 6 补全后 39 个组件）**仅 Dialog 与 ConfirmDialog 具备响应式断点**（`@media (width <= 640px)`）；其余含 `@media` 的组件文件均为 `prefers-reduced-motion`（可访问性，非响应式）。缺口含 DataTable（设计承诺「窄屏转卡片列表」但无响应式断点）、Input 家族（Input / Textarea / InputNumber / Password）、Select / MultiSelect、Message、Avatar、Tag、Accordion、Slider、Toast 及 Phase 6 新增组件等，须逐组件补齐并核对触摸目标尺寸。

| 候选 | 来源 | 说明 | 优先级 |
|------|------|------|--------|
| 小屏适配补齐 | 用户需求（2026-09-14） | 现状：39 个组件（Phase 6 补全后）中仅 Dialog / ConfirmDialog 有响应式断点（约 2/39），其余基本缺失；缺口含 DataTable（设计承诺「窄屏转卡片列表」但无响应式断点）、Input 家族（Input / Textarea / InputNumber / Password）、Select / MultiSelect、Message、Avatar、Tag、Accordion、Slider、Toast 及 Phase 6 新增组件等，须逐组件补齐并核对触摸目标尺寸 | 中 |
| 移动端测试用例 | 用户需求（2026-09-14） | 为小屏适配补单元断言与 Playwright 多视口（mobile / tablet）回归；沿用现有测试规范与后续 E2E 规划 | 中 |
| 响应式规范补充 | 用户需求（2026-09-14） | 在 [主题与样式设计 §5](../design/theming.md) 基础上细化断点语义、窄屏行为矩阵（堆叠 / 全屏 / 卡片化 / 抽屉化）与验收标准 | 低 |

### 1.6 基建与治理候选

| 候选 | 说明 | 优先级 |
|------|------|--------|
| 组件覆盖率门禁 | 待启用 `coverage.thresholds` 门禁；阈值与启用时机待定 | 中 |
| Review Gate 证据留存 | 评审结论与浏览器验证截图归档到 `artifacts/review-gate/` 并纳入 `.gitignore` 策略 | 低 |
| 层级与阴影 token | Dialog / Select 等浮层组件 z-index 与 box-shadow 目前为字面量，后续抽 `--caomei-z-*` 与阴影 token 统一管理 | 低 |
| scoped 变量声明治理 | `development.md §7` 要求「基类不预声明 CSS 变量默认值、档位类用 `:where()`」，但仍有偏差：`button` 基类直接声明 `--caomei-button-*` 默认值（基类预声明），`message` / `badge` / `tag` / `toast` 的变体类用普通类声明变量（档位类未用 `:where()`）；建议补 `check-design.mjs` 规则（现规则只查引用存在性）并逐组件收敛 | 低 |
| 文档站版本化 | 首版发布前无版本基线可切，选型与落地后置（依赖首版发布）；VitePress 版本化方案需先做 Search-First 选型核实 | 低 |
| 阴影与遮罩 token 迁移 | `--caomei-shadow-lg` / `--caomei-color-mask` 已实现（Drawer 已消费）；Dialog / ConfirmDialog / DropdownMenu / Select / Popover / MultiSelect / Toast / Card / Skeleton / Slider 等仍用原始 rgb 字面量（`check-design` 预算 13/13），待逐组件迁移 | 低 |
| DropdownMenuTrigger 样式豁免 | `CaomeiDropdownMenuTrigger` 把 `caomei-dropdown-menu__trigger` 默认外观固定在根上，`as-child` 组合自定义按钮（如 SplitButton 的下拉按钮）时会连带合并 padding / border / background；候选补 `unstyled` / 样式豁免入口，使复合层可复用其 a11y 接线而不继承默认外观（当前 SplitButton 直接用 Reka `DropdownMenuTrigger` 绕过） | 低 |
| 分组按钮可访问语义 | ButtonGroup / SplitButton 的根目前仅作布局容器，无障碍树中是多个独立按钮；候选为根补 `role="group"` 与可选的分组可访问名 | 低 |
| 文档翻译旧目录守卫 | 治理发现：设计文档已声明「不保留 `docs/<locale>/`」但无自动校验；对齐 momei 增加 `docs:check:i18n`，检测旧目录回流与重复翻译页 | 中 |
| nav/sidebar 链接校验 | 治理发现：`themeConfig.nav/sidebar` 链接不在 `check-links` 与 VitePress dead-link 覆盖内，多 locale 下风险放大；评估纳入校验 | 中 |
| ~~i18n 对应路由回切~~ | 已落地（2026-09-15）：语言菜单按 `routingPages` 覆盖感知回切——已翻译页回切对应路由，未翻译页回退 locale 首页；桌面与移动端一致 | — |
| 文档站首页 hydration mismatch | 验证发现：生产构建首页出现 SSR/CSR 属性不一致告警，中文首页同样复现，与 i18n 无关；待定位是否上游行为 | 低 |
| 英文文档同步治理 | 用户方向：英文版与中文版同步（仅指南与组件介绍）；截至 Phase 7 第一阶段收口已完成组件页 45/45 与指南 8/8 英文覆盖；剩余为 parity / freshness 校验与未翻译页回链策略，参考 momei translation-governance | 中 |
| @iconify/vue 可选接入 | 当前图标仅支持 `@lucide/vue` 组件；按需引入 `@iconify/vue` 支持字符串图标名（escape hatch） | 低 |
| Input 家族样式层共享 | attrs 透传已抽取 `useAttrForwarding`；Password 已由 Input 派生并复用其样式（未分叉），其余文本输入类组件仍各自维护 scoped 样式，出现样式分叉时再评估共享样式层 | 低 |
| a11y 自动化回归 | 引入 axe-core 对关键组件做可访问性断言 | 中 |
| 视觉回归基线 | Playwright 截图比对主题/暗色/响应式，并对浮层断言页面稳定性（遮罩完整、`in-flow` 不位移；fixed 元素按滚动条宽容差） | 低 |
| 浮层交互 E2E 规格 | ConfirmDialog / Dialog 的焦点落位、滚动锁复位、遮罩拦截等浏览器态行为目前仅由一次性脚本验证；待补 `test/e2e/` 规格与 playwright 配置，使验证可在 CI 复现 | 低 |
| Tailwind preset（可选） | 为 Tailwind 用户提供 token 映射，不内置依赖 | 低 |
| Storybook 组件工坊 | 暂不启用；组件演示优先使用文档站（见 [文档与演示站](../design/documentation-site.md)） | 低 |
| ~~Nuxt 模块真实集成~~ | 已在 [Phase 7 第一阶段](./todo-archive.md) M1 交付并归档：`caomei-ui/nuxt` 接入 `@nuxt/kit`，实现组件 / composables 自动导入、样式注入、主题与 SSR | — |
| 执行层规则重述与失效引用收敛 | 治理发现：code-reviewer `SKILL.md` §5.6 仍重述 planning §4 的编号禁令（宜改为一行引用）；`code-quality-checklist.md` 的「不可简化清单」引用了不存在的 `security.md §8`（该清单本体缺失，应补入安全规范或改指权威位置），「事实源层次」引用 `documentation.md §4`（实际为「维护职责」，事实源原则在 §2，且 `L0 > L1 > L2 > L3` 表述全仓未定义） | 低 |
| 样式档位死声明回归守护 | 组件中 `:where()` 档位块直接声明属性（padding / font-size 等）会被更高特异性规则覆盖而静默失效，ToggleButton / Checkbox / RadioGroup 已各出现一次；建议对构建产物 CSS 加断言或补计算样式 E2E，并统一「档位只声明 CSS 变量」约定 | 低 |
| 测试隔离与偶发失败 | 全量并发下多个组件测试偶发失败（曾观测到 dropdown-menu / accordion / dialog / confirm-dialog / multi-select / select / tabs），隔离或复跑即通过；疑似 Reka + happy-dom 并发资源/时序问题。建议排查共享 DOM 与计时依赖，必要时降并发或加隔离重置，消除 flaky 以保 `verify` 门禁可信 | 中 |
| wisdom 蒸馏原文留痕 | 审计发现：`.session/wisdom.md` 为 gitignored，蒸馏清空活跃段后无法复核「迁移 N 条 + 删除 M 条」的完备性（`current-task.yaml` 的 `tried_approaches` 口径不同、不可替代）；候选在清空前把活跃段原文快照落盘（归档文件或脚本产物），或在蒸馏机制 §4 增加快照步骤 | 低 |
| 文档站组件信息架构 | 用户需求（2026-09-16）：`/components/` 当前为单一「基础组件」分组、按历史登记顺序排列；「能力说明」（组合式 API / 图标 / 内建文案与语言）挂在 `/guide/` 下；zh 组件区缺总览页（en-US 有）。候选：按关联性分 6 组 + 组内字母序；能力说明归位（只改侧栏 / 改 URL / 独立顶层，三选一）；补 zh 总览页。取证与分组映射见 [评估记录 §2](../design/governance/2026-09-16-new-requirements-evaluation.md) | 中 |
| 文档站观感与展示力 | 用户需求（2026-09-16）：站点观感偏单调，作为组件库展示站缺乏吸引力。候选：zh 组件总览页（分组卡片 + 画廊）/ 首页组件画廊 / demo 外壳升级（标题、代码折叠与复制）/ 全局视觉细节；约束为服务「更好展示组件」且不引入 Tailwind。见 [评估记录 §4](../design/governance/2026-09-16-new-requirements-evaluation.md) | 中 |
| 文档站演示动画与 reduced-motion | 诊断发现（2026-09-16）：VitePress 默认主题在 reduced-motion 下对 `*` 注入 `animation-duration: 1ms !important` 与 `transition-duration: 0s !important`，使 demo 入场动画与全部过渡失效（`motion.css` 仅恢复 ProgressSpinner / ProgressBar / Skeleton）；Drawer 等组件实现本身无缺陷。候选：维持现状 / demo 区域 opt-in 恢复 / 提供「演示动画」显式开关（含 a11y 取舍）。见 [评估记录 §5](../design/governance/2026-09-16-new-requirements-evaluation.md) | 低 |
| 组件公共逻辑抽取 | 用户需求（2026-09-16）+ 治理发现：locale 回退取值 39 处；`inheritAttrs: false` 58 文件而 `useAttrForwarding` 仅 9 个组件复用；浮层外观散落（`bg-elevated` 24 文件；阴影 / 遮罩字面量另见本表「阴影与遮罩 token 迁移」13 处 / 10 文件）；选项列表渲染 3 份；数值钳位 2 份；焦点相关重复模式（`defineExpose({ focus })` 4 处、清空回焦 2 处、面板空白聚焦 2 处——**浮层关闭回焦由 Reka 承担，无重复实现**）。候选：以「同一模式 ≥3 处且语义一致」为门槛按需抽取。见 [评估记录 §6](../design/governance/2026-09-16-new-requirements-evaluation.md) | 中 |
| ESLint 严格化与导出类型 | 用户需求（2026-09-16）：期望对导出函数 / 组件做更严格的类型声明 lint。现状：根配置使用 `eslint-config-cmyr/vue`，显式类型与 unsafe 族规则均为 off；只读试跑 `eslint-config-cmyr/vue/strict` 得 67 error / 229 warning（命中 63 / 594 文件，绝大多数在 `.test.ts`）。候选：分批切严格预设（先显式类型子集、再 type-aware unsafe 族）/ 一次性收敛 / 仅 `src/**` 启用。见 [评估记录 §7](../design/governance/2026-09-16-new-requirements-evaluation.md) | 中 |

### 1.7 服务层候选（composables）

| 候选 | 来源 | 说明 | 优先级 |
|------|------|------|--------|
| 通用对话框服务 `useDialog` | 用户需求（2026-09-14） | **评估结论：暂不实现（2026-09-14）**。5 个下游仓库（momei / caomei-auth / afdian-linker / rss-impact-next / dependfix）检索 `useDialog`、`DynamicDialog`、`DialogService` 零命中；momei 的 37 处 Dialog 全为声明式（`v-model:visible`，必要时 `defineExpose({ open, close })`），PrimeVue `DynamicDialog` 亦未使用；确认场景由 `useConfirm`、轻提示由 `useToast`、自定义内容由 `CaomeiDialog` 覆盖。**触发条件**：出现非组件上下文（store / 路由守卫 / 请求拦截器 / 工具函数）的命令式弹窗用例，或迁移试点确认声明式不可覆盖，或第二个下游提出同一诉求。若实现，范围收敛为基于 `CaomeiDialog` 的 `useDialog()` + 宿主组件，先支持「标题 + 文本 + 确认 / 取消」与「自定义组件 + props」。 | 低 |

> `docs/design/components.md` 曾将该服务列为服务层目标，2026-09-14 已按实现移除（截至移除时无导出、亦无规划登记）。

### 1.8 下游协同候选

| 候选 | 说明 | 优先级 |
|------|------|--------|
| 下游兼容性回归机制 | 见 [路线图 Phase 8](./roadmap.md)，稳定使用后启用 | 延迟 |

## 2. 维护约定

- 新增候选时注明来源（用户需求 / 治理发现 / 使用面统计）与初步优先级。
- 被否决的候选记录结论与理由。
- 候选状态流转：§1 候选池 → 用户决策后登记到 [待办事项](./todo.md) 当前阶段 → 阶段完成后随 [待办归档](./todo-archive.md) 迁移。
