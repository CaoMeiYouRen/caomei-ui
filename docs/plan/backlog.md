# 长期规划与 Backlog

本文档记录已评估的候选与长期主线；候选准入、优先级与插队例外规则见 [规划规范 §3](../standards/planning.md#3-新需求处理原则hard-requirement)，本文档不重述。

> **文档结构**
>
> - §1 候选池：**仍待用户决策**的候选（含外购建议等不纳入自研的记录）。
> - §2 已纳入当前阶段：2026-09-14 用户授权启动 [Phase 6](./todo.md) 后，已登记为待办条目的候选及其评估证据（阶段完成后随 [待办归档](./todo-archive.md) 迁移）。
> - §3 维护约定。

## 1. 候选池（待用户决策）

> 2026-09-14 用户新需求（组件补全 / 使用复核 / 许可声明 / 主题预设 / 国际化 / 移动端 / 设计规范）评估结论：全部属于功能与体验增强，**无一命中插队例外清单**（安全漏洞 / 破坏下游构建 / blocker 缺陷）。经用户决策，组件补全 / 使用复核 / 主题预设 / 设计规范 / 许可声明已登记为 [Phase 6](./todo.md)（见 §2）；**组件国际化（需求 5）与移动端 / 响应式（需求 6）延后**，与其余候选一并保留在本节。

### 1.1 组件增强候选

> 2026-09-14 Phase 6 M1 复核（[momei 使用复核台账](../design/governance/2026-09-14-momei-usage-audit.md)）产出 23 项「需增强」结论，按组件归并如下。

| 候选 | 来源 | 说明 | 优先级 |
|------|------|------|--------|
| Tag/Badge 增强 | 组件实现评估 + M1 复核 | Tag 可选中筛选标签 / 可编辑（可编辑标签可由 Reka UI TagsInput 封装）；Badge 叠加位置与偏移自定义（placement / offset）、数值变化时的宽度过渡动画（`interpolate-size` 目前主要 Chromium 支持，跨浏览器需 JS 回退）。M1 补充：`severity` → `tone` 映射规范化（含 `error` 别名、`secondary` / `contrast` 归属）、Tag `rounded` / `outlined`、`icon` 字符串改 `#icon` 插槽（momei Tag 127 次） | 中 |
| Select 增强 | 组件实现评估 + M1 复核 | 分组（SelectGroup）、自定义选项渲染、搜索过滤；多选已由 Tier 1 MultiSelect 承接（Phase 2 交付）。M1 补充：`option-label` / `option-value` 字段映射、非 string value、`show-clear`、`filter`、`#option` 插槽（momei Select 73 / Dropdown 5 / MultiSelect 8 / SelectButton 9） | 中 |
| Button 形态增强 | M1 复核 | 补语义档（`severity` / `tone`）、`text` / `outlined` 形态、`rounded`、`badge` 角标、`icon` 位置；图标改 `#icon` 插槽。momei 用量：`severity`×185、`text`×163、`rounded`×102、`outlined`×32，属迁移关键路径 | 中 |
| DataTable 与列能力增强 | M1 复核 | 启用排序 / Lazy 分页 / 行选择 / `data-key` / loading；列补 `#body` / `#header`、`body-class` / `header-class` / `header-style`、`frozen` / `align-frozen`、点号嵌套字段；列声明模型差异需迁移方案。momei 用量：DataTable 22 + Column 153，属迁移关键路径 | 中 |
| 表单输入增强 | M1 复核 | InputNumber `use-grouping` / `min-max-fraction-digits`；Textarea `auto-resize`；Password `feedback`；Checkbox 分组值数组；Switch `change` 事件；FileUpload `mode` / `max-file-size` / `auto` / `choose-label`；ToggleButton `on-label` / `off-label` | 中 |
| Message 语义与形态增强 | M1 复核 | `variant` 补 `simple` / `text`、补 `size`（momei 各 14 处）；`severity` 的 `error` / `secondary` / `contrast` 需映射规范 | 中 |
| 展示类组件增强 | M1 复核 | Image `preview` 点击放大 + `#indicatoricon`；ProgressSpinner `stroke-width` / `animation-duration` / 任意尺寸；Toolbar `#start` / `#center` / `#end` 分区插槽 | 低 |
| 浮层与导航增强 | M1 复核 | Dialog `show-header` / `breakpoints` / `@hide`；Popover 命令式 `toggle(event)` 锚点；DropdownMenu `:model` + `:popup`；Paginator 偏移 → 页码模型与每页条数选择；ConfirmDialog `icon` | 低 |
| 映射与迁移规范 | M1 复核 | `severity→tone`、`small/large→sm/lg`、`icon→#icon`、`v-model:visible→open`、`p-invalid→:invalid`、`fluid` 删除；详见台账 §4.3，归口 M2 设计规范 | 中 |

### 1.2 长尾组件候选（Tier 3）

> 依据调研文档于 2026-09-13 重新评估，实现方式与 Reka 成熟度见 [组件设计 §5](../design/components.md)，本表只登记候选与优先级。优先级为「中」的 7 个候选（RadioGroup / RadioButton、ProgressBar、Popover、Slider、Skeleton、Toolbar、ToggleButton；其中 Skeleton 为自建纯样式）已于 Phase 4 交付并归档（见 [待办归档](./todo-archive.md)）。
>
> 原列的 Alpha primitive、自建复杂件与优先级「低」的 Stepper 等条目（Stepper / Drawer / DatePicker / ColorPicker / InputGroup / FloatLabel / SplitButton）均由 momei 使用面驱动；在「以 momei 迁移为优先」的策略下，该批条目已移入 §2.4 组件补全，本表仅保留当前无下游使用证据的长尾。
>
> 2026-09-14 Phase 6 M1 复核新识别 3 个 momei 使用面组件（AutoComplete / ButtonGroup / DataView），登记于此待决策。

| 候选 | 来源 | 优先级 |
|------|------|:-:|
| Sidebar | momei 使用面（标签级统计未命中，待复核） | 低 |
| AutoComplete | momei 使用面（M1 复核，2 处） | 低 |
| ButtonGroup | momei 使用面（M1 复核，1 处） | 低 |
| DataView | momei 使用面（M1 复核，1 处） | 低 |

### 1.3 不纳入自研的能力（外购建议）

| 能力 | 来源 | 说明 | 优先级 |
|------|------|------|--------|
| 富文本与图表封装 | momei 使用面 | Editor / Chart 建议外购（Tiptap / ECharts），不自研 | 低 |

### 1.4 国际化候选（需求 5，延后）

> 承接原「国际文字内置文案补全」候选并按用户需求（2026-09-14）扩展为完整机制。现状：组件内建文案已备 zh-CN / en-US（`src/locale`），但组件固定消费 `defaultLocaleMessages`（zh-CN），缺语言选择 / 注入机制；英文文档页因此仍有组件内部中文（如 DataTable 空态「暂无数据」、Dialog 关闭按钮 `aria-label="关闭"`）。2026-09-14 复核：组件页 33/33 与指南 4/4 英文已覆盖，剩余缺口即为本项内建文案本身。**用户决策（2026-09-13）：当前接受现状**，待注入机制落地后统一本地化。
>
> **2026-09-14 用户决策：本组含短期 zh-CN / en-US 一并延后**，不纳入 Phase 6；下表按原分层计划保留。

| 候选 | 来源 | 说明 | 优先级 |
|------|------|------|--------|
| 组件 i18n 注入机制 | 用户需求（2026-09-14） | 提供 locale provider（如 `CaomeiConfigProvider` / `provideLocale` + `useLocale`）与逐组件覆盖；文档站切换语言后组件内建文案随之切换 | 中 |
| 语言矩阵 - 短期 | 用户需求（2026-09-14） | 简体中文（zh-CN）、英语（en-US），承载现有两份文案 | 中 |
| 语言矩阵 - 中期 | 用户需求（2026-09-14） | 追加繁体中文（zh-TW）、日语（ja-JP）、韩语（ko-KR） | 低 |
| 语言矩阵 - 长期 | 用户需求（2026-09-14） | 追加俄语、法语、德语、西班牙语、葡萄牙语；视情况追加希腊语、意大利语、印地语、孟加拉语、印度尼西亚语等 | 低 |
| RTL（阿拉伯语）支持 | 用户需求（2026-09-14） | 从右往左排版涉及逻辑属性、图标镜像、浮层定位与滑动手势镜像，风险高，单独立项谨慎评估，不与其他语言捆绑 | 低 |
| locale 组织与注册治理 | 用户需求（2026-09-14） | 语言数量增长后的目录组织、注册表、按需加载与类型约束；可参考 momei `i18n/config` registry 机制 | 低 |

### 1.5 移动端与响应式候选（需求 6，延后）

> **2026-09-14 用户决策：本组延后处理**，不纳入 Phase 6。
>
> 缺口依据：2026-09-14 统计 33 个组件中**仅 Dialog 与 ConfirmDialog 具备响应式断点**（`@media (width <= 640px)`）；另有 22 个组件文件存在 `@media`，但均为 `prefers-reduced-motion`（可访问性，非响应式）。缺口含 DataTable（设计承诺「窄屏转卡片列表」但无响应式断点）、Input 家族（Input / Textarea / InputNumber / Password）、Select / MultiSelect、Message、Avatar、Tag、Accordion、Slider、Toast 等，须逐组件补齐并核对触摸目标尺寸。

| 候选 | 来源 | 说明 | 优先级 |
|------|------|------|--------|
| 小屏适配补齐 | 用户需求（2026-09-14） | 现状：33 个组件中仅 Dialog / ConfirmDialog 有响应式断点（约 2/33），其余基本缺失；缺口含 DataTable（设计承诺「窄屏转卡片列表」但无响应式断点）、Input 家族（Input / Textarea / InputNumber / Password）、Select / MultiSelect、Message、Avatar、Tag、Accordion、Slider、Toast 等，须逐组件补齐并核对触摸目标尺寸 | 中 |
| 移动端测试用例 | 用户需求（2026-09-14） | 为小屏适配补单元断言与 Playwright 多视口（mobile / tablet）回归；沿用现有测试规范与后续 E2E 规划 | 中 |
| 响应式规范补充 | 用户需求（2026-09-14） | 在 [主题与样式设计 §5](../design/theming.md) 基础上细化断点语义、窄屏行为矩阵（堆叠 / 全屏 / 卡片化 / 抽屉化）与验收标准 | 低 |

### 1.6 基建与治理候选

| 候选 | 说明 | 优先级 |
|------|------|--------|
| 组件覆盖率门禁 | 待启用 `coverage.thresholds` 门禁；阈值与启用时机待定 | 中 |
| Review Gate 证据留存 | 评审结论与浏览器验证截图归档到 `artifacts/review-gate/` 并纳入 `.gitignore` 策略 | 低 |
| 层级与阴影 token | Dialog / Select 等浮层组件 z-index 与 box-shadow 目前为字面量，后续抽 `--caomei-z-*` 与阴影 token 统一管理 | 低 |
| 文档站版本化 | 首版发布前无版本基线可切，选型与落地后置（依赖首版发布）；VitePress 版本化方案需先做 Search-First 选型核实 | 低 |
| 文档翻译旧目录守卫 | 治理发现：设计文档已声明「不保留 `docs/<locale>/`」但无自动校验；对齐 momei 增加 `docs:check:i18n`，检测旧目录回流与重复翻译页 | 中 |
| nav/sidebar 链接校验 | 治理发现：`themeConfig.nav/sidebar` 链接不在 `check-links` 与 VitePress dead-link 覆盖内，多 locale 下风险放大；评估纳入校验 | 中 |
| i18n 对应路由回切 | 实现决策：当前 `i18nRouting: false`（切换跳 locale 首页）；2026-09-14 复核：一级 nav 页已有 en-US 版本，但 `standards` / `design` / `plan` 子页仍为中文，直接回切会在子页 404，故暂不切换 | 低 |
| 文档站首页 hydration mismatch | 验证发现：生产构建首页出现 SSR/CSR 属性不一致告警，中文首页同样复现，与 i18n 无关；待定位是否上游行为 | 低 |
| 英文文档同步治理 | 用户方向：英文版与中文版同步（仅指南与组件介绍）；2026-09-14 已完成组件页 33/33 与指南 4/4 英文覆盖；剩余为 parity / freshness 校验与未翻译页回链策略，参考 momei translation-governance | 中 |
| @iconify/vue 可选接入 | 当前图标仅支持 `@lucide/vue` 组件；按需引入 `@iconify/vue` 支持字符串图标名（escape hatch） | 低 |
| Input 家族样式层共享 | attrs 透传已抽取 `useAttrForwarding`；Password 已由 Input 派生并复用其样式（未分叉），其余文本输入类组件仍各自维护 scoped 样式，出现样式分叉时再评估共享样式层 | 低 |
| a11y 自动化回归 | 引入 axe-core 对关键组件做可访问性断言 | 中 |
| 视觉回归基线 | Playwright 截图比对主题/暗色/响应式，并对浮层断言页面稳定性（遮罩完整、`in-flow` 不位移；fixed 元素按滚动条宽容差） | 低 |
| 浮层交互 E2E 规格 | ConfirmDialog / Dialog 的焦点落位、滚动锁复位、遮罩拦截等浏览器态行为目前仅由一次性脚本验证；待补 `test/e2e/` 规格与 playwright 配置，使验证可在 CI 复现 | 低 |
| Tailwind preset（可选） | 为 Tailwind 用户提供 token 映射，不内置依赖 | 低 |
| Storybook 组件工坊 | 暂不启用；组件演示优先使用文档站（见 [文档与演示站](../design/documentation-site.md)） | 低 |
| Nuxt 模块真实集成 | 用户决策延后（Phase 2 范围外）：`caomei-ui/nuxt` 接入 `@nuxt/kit`，实现组件 / composables 自动导入、样式注入、主题与 SSR | 中 |
| 执行层规则重述与失效引用收敛 | 治理发现：code-reviewer `SKILL.md` §5.6 仍重述 planning §4 的编号禁令（宜改为一行引用）；`code-quality-checklist.md` 的「不可简化清单」引用了不存在的 `security.md §8`（该清单本体缺失，应补入安全规范或改指权威位置），「事实源层次」引用 `documentation.md §4`（实际为「维护职责」，事实源原则在 §2，且 `L0 > L1 > L2 > L3` 表述全仓未定义） | 低 |
| 样式档位死声明回归守护 | 组件中 `:where()` 档位块直接声明属性（padding / font-size 等）会被更高特异性规则覆盖而静默失效，ToggleButton / Checkbox / RadioGroup 已各出现一次；建议对构建产物 CSS 加断言或补计算样式 E2E，并统一「档位只声明 CSS 变量」约定 | 低 |

### 1.7 下游协同候选

| 候选 | 说明 | 优先级 |
|------|------|--------|
| 下游兼容性回归机制 | 见 [路线图 Phase 8](./roadmap.md)，稳定使用后启用 | 延迟 |

## 2. 已纳入当前阶段（Phase 6）

> 2026-09-14 用户授权启动 [Phase 6：组件库补全与规范化（momei 迁移就绪）](./todo.md)，经用户决策收敛为 **4 条主线**：M1 下游使用复核 / M2 设计规范与主题预设 / M3 组件补全 / M4 依赖许可合规。以下候选已登记为待办条目，本节保留其**评估证据与去向**；阶段完成后随 [待办归档](./todo-archive.md) 迁移。

### 2.1 下游使用复核（需求 2 → Phase 6 M1）

以 momei 实际调用为样本，逐组件核对 props / slots / variants / 事件 / 尺寸语义是否满足真实需求。

| 条目 | 说明 | 原优先级 |
|------|------|:-:|
| momei 逐组件使用复核 | 产出「满足 / 需增强 / 需新组件」三类结论。重点样本：Switch（`<ToggleSwitch>` 47 处）、Tag（127 处，severity / 可关闭 / 可选中）、Input 家族（含 IconField 组合）、DataTable（22 处 + Column 153 处，列插槽 / 排序 / 选择 / 空态）、Select（73 处）、Message（51 处）、Dialog（37 处） | 中 |
| 复核结论回流机制 | 复核须产出结构化结论并回写 Backlog（缺口逐条登记），避免只做人工浏览；增强走 §1.1、新增走 §2.4 | 中 |

### 2.2 设计规范与校验（需求 7 → Phase 6 M2）

| 条目 | 说明 | 原优先级 |
|------|------|:-:|
| 设计规范文档 | 系统化定义尺寸（控件高度 / 间距档位）、颜色（语义 token / 状态色 / 对比度）、主题（预设 / 暗色）、风格（圆角 / 阴影 / 图标尺寸 / 排版）等细则 | 中 |
| 规范可验证脚本 | 对已有与新增组件均可执行的校验：硬编码颜色 / 尺寸、token 非法值、尺寸档位一致性、variant / size 命名规范等；纳入 `pnpm verify` 或独立 `pnpm check:design` | 中 |
| 新组件规范模板 | 新组件脚手架 / 自检清单，使规范在新增组件时自动落实，而非仅靠人工审查 | 低 |

> 与 §1.6 的「样式档位死声明回归守护」「层级与阴影 token」互补，实施时统一归口到规范文档与校验脚本。

### 2.3 主题预设（需求 4 → Phase 6 M2）

| 条目 | 说明 | 原优先级 |
|------|------|:-:|
| 双默认主题预设 | 当前默认主色 `--caomei-color-primary: #e63946`（红）来自 caomei-auth；拟提供两套预设：`caomei`（源于 caomei-auth 设计）与 `momei`（源于 momei 设计），各自含亮 / 暗两套 token | 中 |
| 预设设计源提取 | 从 caomei-auth 与 momei 现有主题（PrimeVue preset / SCSS 变量）提取语义 token 映射表，作为预设实现依据 | 中 |
| 暗色模式配套 | 预设须支持暗色切换；沿用现有 `.dark` 实现，`[data-theme]` 与 `prefers-color-scheme` 需随本项补齐（现仅 `.dark` 落地）；同时补齐品牌强调色在暗色下的对比度（含跨主题稳定的 `-solid`） | 中 |
| 预设选择与按需引入 | 确定预设承载形式（独立 CSS 入口 / `data-theme` 属性 / Nuxt 模块配置）与文档站演示切换；不引入 Tailwind | 中 |

### 2.4 组件补全（需求 1 → Phase 6 M3；迁移试点 → Phase 7）

> **策略调整（用户需求，2026-09-14；已授权落地）**：以 momei 为最复杂下游，先闭环 momei 的组件替换，再推及其他下游；**仅 momei 使用的组件也应实现**，不再默认「下游自留」。路线图已据此调整（[Phase 7 下游迁移改为 momei 优先](./roadmap.md)）。
>
> **使用面证据**：2026-09-14 对本地 momei 仓库标签级统计（`<Button>` 356、`<InputText>` 178、`<Column>` 153、`<Tag>` 127、`<Select>` 73、`<Message>` 51、`<ToggleSwitch>` 47、`<InputNumber>` 39、`<Divider>` 37、`<Dialog>` 37、`<Card>` 33、`<Password>` 32、`<Textarea>` 31、`<Skeleton>` 26、`<TabPanel>` 23、`<DataTable>` 22、`<Checkbox>` 20 等；已排除 TS 泛型假阳性），其余细节与判定见 [M1 复核台账](../design/governance/2026-09-14-momei-usage-audit.md)。
>
> 本组由原 §1.2「Tier 3 长尾候选」移入条目（Stepper / Drawer / DatePicker / ColorPicker / InputGroup / FloatLabel / SplitButton）与本次新识别条目（Divider / IconField / InputIcon / Panel）及「momei 迁移试点闭环」合并而成。
>
> **M1 复核结论（2026-09-14）**：详见 [momei 使用复核台账](../design/governance/2026-09-14-momei-usage-audit.md)。23 项「需增强」已登记 §1.1；新识别 `AutoComplete` / `ButtonGroup` / `DataView` 已登记 §1.2；`IconField` / `InputIcon` 经复核可由 `Input` 的 `prefix` / `suffix` 插槽承载，建议降级为可选便利封装。**M3 最终范围以用户决策为准。**

| 条目 | 来源 | 说明 | 原优先级 |
|------|------|------|:-:|
| momei 迁移试点闭环 | 用户需求（2026-09-14） | 在 momei 中实际执行 PrimeVue → caomei-ui 替换，记录阻塞点与缺口；其闭环是其他下游迁移的前提（属 [Phase 7](./roadmap.md)） | 中 |
| Divider | momei 使用面（37） | 分隔线，当前组件集与 Backlog 均缺失；低复杂度，可自建或封装 Reka `Separator` | 中 |
| IconField / InputIcon | momei 使用面（各约 10） | 输入框前后置图标容器，与 Input 家族配套；建议作为 Input 家族扩展而非独立组件（M1 复核：可由 `Input` 的 `prefix` / `suffix` 插槽承载，建议降级为可选便利封装） | 中 |
| Panel | momei 使用面（3） | 可折叠面板容器；与 Accordion 能力重叠，先评估能否由 Accordion 承接，再决定是否独立编排 | 低 |
| InputGroup / FloatLabel | momei 使用面（InputGroup 6） | 原低优先候选，因 momei 迁移提升；建议与 IconField 合并规划 | 中 |
| DatePicker / Calendar | momei 使用面（6） | 原低优先候选；Reka Alpha，需锁版本并补回归 | 中 |
| Drawer | momei 使用面（3） | 原低优先候选；Reka Alpha，或由 Dialog 派生 | 中 |
| SplitButton | momei 使用面（2） | 原低优先候选；Button + DropdownMenu 组合 | 低 |
| ColorPicker | momei 使用面（2） | 原低优先候选；Reka Alpha color 系列组合 | 低 |
| Stepper | momei 使用面（1） | 原低优先候选 | 低 |

> Select 增强（分组 / 搜索）与富文本 Editor / Chart 的既有结论见 §1.1 与 §1.3，不在此重复。

### 2.5 依赖许可合规（需求 3 → Phase 6 M4）

| 条目 | 说明 | 原优先级 |
|------|------|:-:|
| 第三方许可声明 | 核心依赖许可：`reka-ui`（MIT）、`@tanstack/vue-table`（MIT）、`@lucide/vue`（ISC）、`vue`（peer，MIT）。现状仅项目自身 MIT `LICENSE`，无第三方声明。注意 `@lucide/vue` 未列入 `tsdown.config.ts` 的 `deps.neverBundle`，会被打包进 `dist`，其 ISC 许可随分发需保留声明 | 中 |
| 许可声明承载形式 | 落地位置选择：`THIRD-PARTY-LICENSES` / `NOTICE` 文件、`package.json` 字段、`dist` 内附带或文档站说明；并纳入发布前检查（`files` / semantic-release assets） | 中 |

## 3. 维护约定

- 新增候选时注明来源（用户需求 / 治理发现 / 使用面统计）与初步优先级。
- 被否决的候选记录结论与理由。
- 候选状态流转：§1 候选池 → 用户决策后登记到 [待办事项](./todo.md) 当前阶段并移入 §2 → 阶段完成后随 [待办归档](./todo-archive.md) 迁移。
