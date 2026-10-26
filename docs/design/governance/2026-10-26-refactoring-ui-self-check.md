# 《Refactoring UI》20 条规则对照自检（初步评估）

> 状态：**只评估，未修改 `src/**`、未变更任何组件行为**；提交记录见 git 历史。本文是首轮 UI 自检记录，不是全量组件验收，也不是发布门禁。
>
> 参考材料：用户附件《〈Refactoring UI〉20 条规则：对你的项目有没有用》（2026-10-24）。该文已说明材料为二次转述、书出版于 2018 年、不含暗色系统 / 动效 / 响应式 / 设计系统治理与 WCAG 算法，这些边界同样适用于本文。
>
> **规划处置（2026-10-26）**：第 1 档进入 Phase 26 M5 插队批次，第 2 档进入 [Backlog §1.6](../../plan/backlog.md)，1.0 发布延后并设 G0 ~ G4 门禁；唯一口径见[Phase 26 执行期追加与 1.0 发布门禁](./2026-10-26-phase26-ui-gate-planning.md)。

## 1. 结论摘要

1. **材料仍然有用，但价值在「检查清单」而非「设计体系」。** caomei-ui 已经具备 token 冻结、六套预设、文本对比度台账与视觉回归门禁，处在书所覆盖的「从 0 到不丑」之后；书能补的是几个容易漏掉的产品化检查项。
2. **本轮最重要的发现不是排版，而是颜色角色。** `--caomei-color-<tone>` 同时承担「填充色」与「浅底上的文字色」，在 `caomei` / `momei` 预设的浅色模式下，后者大面积不达标：Tag soft 实测 success **2.12:1**、warning **2.58:1**、danger **3.34–3.39:1**，与附件所引 momei 的 2.12 / 2.59 / 3.39 几乎逐值重合。Message 页在 `caomei` 预设下实测 34 个对比度节点，最低 **2.2:1**。其中 **success / warning 不在现有已接受缺口台账内**；`caomei` danger soft 3.39 已在 Phase 18 M4-2 终局登记（维持不修色），本轮 axe 3.34 为合成取整差异；此外默认预设 soft warning axe 报 **4.49**（贴线；历史记录 4.50 为取整），也需在 G1 一并裁定。
3. **非文本对比度（WCAG 1.4.11 的 3:1）未纳入门禁。** `--caomei-color-border` 对 `bg` 在六套预设的亮 / 暗 12 个组合中为 **1.09–1.83:1**；输入框、未选中 Checkbox、关闭态 Switch 的边界几乎只依赖这条描边。真实渲染中未选中 Switch / Checkbox 接近不可见，暗色输入框看起来像无边框。
4. **文档站示例存在系统性可访问名缺失。** `/components/select` 的 17 个 Select 触发器（覆盖该页全部示例）均只有 placeholder、没有 `label`，axe 报 17 处 `button-name`（critical）；画廊 Select 同样命中。此前 M3-6 只补了 Input 基础示例。
5. **几个低成本、可直接排期的问题**：Button 无 hover / active 视觉反馈（悬停前后计算样式完全一致）；DataTable 横向滚动容器不可键盘聚焦（axe `scrollable-region-focusable`）；空态 / 加载态基本只有一行文字；文档站品牌色仍是 VitePress 默认蓝，与库默认 primary `#2563eb` 不一致，首屏 CTA 白字对比度 4.48:1。
6. **本轮不建议按书照抄**：Tailwind 时代的间距 / 字阶 / 阴影示例不能直接搬进 token 系统；也不建议为「提升体系」购买完整书包。真正该补的是颜色角色分层、非文本对比度、空态模式与示例可访问名。

## 2. 范围与方法

| 维度 | 取值 |
| --- | --- |
| 被测 revision | `b8a2086db5c39e3acf0811693ca0fabe22ec403f`（工作区干净） |
| 入口 / 产物 | VitePress dev `http://127.0.0.1:5199`（源码直读，非构建产物） |
| 页面（中文） | `/`、`/components/`、`/components/button`、`/components/data-table`、`/components/data-view`、`/components/showcase`、`/components/select`、`/components/input`、`/components/tag`、`/components/message`、`/design/components` |
| 视口 | 桌面 1440×900；移动 375×812；暗色抽检 button / data-table / input / showcase / home |
| 浏览器 | Playwright 1.63.0 + Firefox（Chromium 在本容器加载文档站时 `Target crashed`，故未采用） |
| 自动化 | axe-core 4.13，WCAG 2.0/2.1/2.2 A/AA 标签；对比度另按 WCAG 相对亮度公式复算 |
| 视觉 | 截图已人工查看（可读文本、层级、边界、空态、移动端布局） |
| 原始证据 | `test-results/refactoring-ui-self-check-2026-10-26/`（gitignored）：截图、`report.json`、复跑脚本 |
| 未覆盖 | 全量 56 个组件、全部预设的真实浏览器逐页巡检、键盘全链路、读屏、真机、构建产物 / preview、完整视觉回归 |

### 2.1 判定口径

- **已具备**：有对应 token / 实现，且本轮有代码或渲染证据。
- **部分**：能力存在，但 token、示例或默认值不完整。
- **缺口**：未实现，或本轮实测不达标。
- **不适用**：组件库不承担该场景（应由下游或文档站承担）。

## 3. 20 条逐条判定

| # | 规则 | 判定 | 证据 / 落点 |
| --- | --- | --- | --- |
| 1 | 为设计选一种个性 | 部分 | 六套预设用色温、圆角、投影表达差异（`src/styles/presets/*.css`），库层已具备；但文档站仍用 VitePress 默认品牌蓝（`--vp-c-brand-1: #3451b2`），首屏没有组件视觉，品牌没有延伸到「产品门面」。 |
| 2 | 别着急上色 | 已具备 | 组件只消费 `--caomei-*`；`check:design` 的原始色值预算为 0。 |
| 3 | 字号并非万能 | 部分 | 实际用了 12/14/16px + 400/500/600 + `text-muted`，不是只靠字号；但只有两级文字色（text / text-muted），没有 `text-subtle` 或独立 disabled 文字色，密集团队 / 管理端场景的第三级弱化只能靠 opacity。 |
| 4 | 弱化来凸显重点 | 部分 | Card subtitle、DataTable 表头 / 辅助文本都用 muted，方向正确；仍缺第三级弱化 token，且 `text-muted` 在 caomei 预设为 4.02:1（见 §4.1）。 |
| 5 | 非必要不用标签 | 缺口（示例层） | `FloatLabel` 的 over / in 两态存在且实现完整；但 `/components/select` 的 17 个 Select 触发器（覆盖该页全部示例）均以 placeholder 代替可访问名，axe 报 17 处 `button-name`，画廊 Select 同样命中。组件支持 `label`，示例没有用。 |
| 6 | 按钮看主次不看含义 | 部分 | `primary` / `secondary` / `ghost` + `tone` 已分层；但 DataView「加载与空态」示例并排三个 primary 按钮，文档没有「一屏一个 primary」的用法规则；Button 本身无 hover / active，主次在交互上也缺少反馈。 |
| 7 | 从过度留白开始 | 部分 | 组件内部 16px 卡片内边距、36px 控件高度是合理密度；但间距 token 只有 4/8/12/16 四档，页面级组合没有 24/32/48，Card `padding="lg"` 只能用 `calc(16 + 8)` 拼出 24px。 |
| 8 | 不必填满屏幕 | 已具备（页面层） | 文档正文 670px、中文约 42 字/行，未铺满 1440px；但库不提供 `Container` / `Stack`，页面宽度完全交给下游。 |
| 9 | 间距有亲疏 | 部分 | 组件内用 `gap` / padding 表达分组，方向正确；文档 demo 容器、Card、DataTable 三层边框叠加，视觉分组更多依赖线而不是留白（与 #19 同源）。 |
| 10 | 缩放不总是等比 | 已具备 | 控件高度 28/36/44、字号 12/14/16、圆角固定档位，没有按比例整体放大；图标默认 `1em`，Avatar 字号 12/14/16。 |
| 11 | 行长与行高联动 | 部分 | 组件 line-height 全部为无单位 1 / 1.4 / 1.5 / 1.6，比例正确；但没有 line-height token（设计规范已登记为规划项）。文档英文正文实测 670px / 平均 7.52px ≈ **89 字符/行**，高于 45–75 的建议；中文约 42 字/行，正常。 |
| 12 | 基线对齐，不居中 | 已具备 | `CaomeiIcon` 用 `vertical-align: -0.125em`；Message 图标以 2px 光学偏移贴首行；Button / Tag 这类单行控件用 `center` 是合理例外。 |
| 13 | 颜色比想象的多 | 部分 | 只有 5 个 tone × 1 个强调色 + `-solid`，没有 hover / active / text-safe 等角色档；这正是 §4.1 颜色角色问题的根因。 |
| 14 | 无障碍也能好看 | 部分（关键缺口） | 文本对比度治理强（台账、终局裁定、E2E 装置），但品牌预设 soft / outline 状态文本大面积不达标；非文本 3:1 未纳入门禁（§4.1 / §4.2）。 |
| 15 | 别只靠颜色 | 部分 | Message / Alert / Toast 按 tone 自动配图标，做得好；`invalid` 字段只有红色描边 + `aria-invalid`，没有可见的非颜色提示；Tag / Badge 主要靠文字承载语义，但文字本身可能只是分类名。 |
| 16 | 强调色边框 | 已具备 | Tabs 用 2px primary 下边框、Toast 用左侧强调描边、ToggleButton / SelectButton 选中用 primary 实底；选中态不只看颜色。 |
| 17 | 图上文字先处理背景 | 不适用 | 库内没有「图片上叠文字」组件；Image 只做预览遮罩，不承载文案。 |
| 18 | 每样东西有适用尺寸 | 已具备 | 图标 `1em`、Avatar 字号档位、Image 的 `ratio` 占位防抖动；没有把大尺寸元素等比缩放的实现。 |
| 19 | 慎用边框 | 部分 | Card 提供 outlined / elevated / filled 三态，是在减少边框；但文档 demo 容器（1px `#ddd`、4px 圆角）与组件边框叠加，且输入 / 开关 / 复选框的关键边界又过淡，形成「该淡的浓、该浓的淡」。 |
| 20 | 别忽视空状态 | 缺口 | DataTable / DataView 默认只有一行 muted 文案；MultiSelect / AutoComplete 同样只有一行；Select 没有空态提示；加载态也只有「加载中」文字，没有 Skeleton / Spinner / 插槽。空态插槽存在，但默认体验与示例都不算「设计过」。 |

## 4. 关键发现

### 4.1 P0：品牌预设的 soft / outline 状态文本不达标

**现象（真实渲染 + axe）**

| 预设 | 页面 | axe `color-contrast` 节点 | 实测最低值 |
| --- | --- | --- | --- |
| 默认 `minimal` | `/components/tag` | 7 | neutral 4.39、warning 4.49（贴线；历史 4.50 为取整，未入终局台账）、danger 4.27（neutral / danger 已在册） |
| `caomei` | `/components/tag` | 21 | neutral 3.68、primary 3.72、success **2.12**、warning **2.58**、danger 3.34（Phase 18 M4-2 复算 3.39，已终局登记） |
| `momei` | `/components/tag` | 19 | neutral 4.25、primary 4.32、success **2.12**、warning **2.58**、danger **3.39** |
| `caomei` | `/components/message` | 34 | 最低 2.2；另有 2.68 / 3.23 / 3.58 / 3.76 / 3.84 / 3.94 / 4.16 / 4.23 |

> **取整 / 合成口径**：axe 报值取两位小数，且背景为逐层合成后的实际颜色；按 `color-mix 8%` 于纯白复算，warning ≈ **2.59**（axe 2.58，向下截断）、momei neutral ≈ **4.26**、caomei primary ≈ **3.73**、caomei danger ≈ **3.39**，与 axe 有 ±0.01 量级差异，结论不变。默认预设 warning axe 报 **4.49**（历史记录 4.50 为取整），正好压在阈值上，需在 G1 按实际页面底复核后再决定是否列入 known limitations。

`momei` 的 2.12 / 2.58 / 3.39 与附件所引「momei soft 8% 下 success 2.12 / warning 2.59 / danger 3.39」几乎逐值一致——**附件指出的下游问题，在 caomei-ui 的预设里被原样复现了**。

**根因**

- `Tag` / `Badge` 的 soft 底是 `color-mix(in srgb, <tone> 8%, transparent)`，文字直接用 `<tone>`；`Message` 的 soft 底是 4%，文字同样直接用 `<tone>`。
- `caomei` / `momei` 预设的 `success` / `warning` / `danger` 取 PrimeVue / Lara 的 500 档（`#22c55e` / `#f97316` / `#ef4444`），这些颜色作为**填充色**成立，作为**浅底文字**不成立。
- 默认预设之所以基本可用，是因为它把 `success` / `warning` / `danger` 直接取成了深阶（`#15803d` / `#b45309` / `#dc2626`）；其中 warning 仍是贴线项（axe 4.49），neutral / danger 也已在 Phase 18 台账。换句话说，不是 soft 公式突然坏了，而是**同一个 token 在默认预设刚好「文字安全」，在品牌预设只「填充安全」**。
- 设计规范 §2.2 把 `--caomei-color-<tone>` 定义为「文字 / 边框 / soft 底」的强调色，§5.1 / §5.2 给出预设取值；没有区分 text 与 fill 两种角色，`-solid` 只解决了实底，没有解决浅底文字。

**相邻发现：`caomei` 预设 `text-muted` 4.02:1。** `#718096` on `#fff` = **4.02:1**，on `bg-elevated` `#f8fafc` = **3.84:1**；该值不在 Phase 18 M4-2 的已知缺口清单内（清单只收了默认预设的 `#6b7280` 与 caomei 的 primary / danger）。`text-muted` 在 `src/components` 有 77 处引用，覆盖 subtitle、helper text、placeholder、表格辅助信息，属正文级文字，不应按「装饰」豁免。需与 tone text 变体同批裁定：是给 caomei 换成 AA 安全的 muted，还是登记为品牌保真例外。

**建议（未实施）**

1. 增加 **tone text 变体**，例如 `--caomei-color-success-text` / `warning-text` / `danger-text` / `primary-text`：亮色取同色相深阶（约 -700；如 `#15803d` / `#b45309` / `#b91c1c`），暗色取 -300 / -400。soft / outline 的文字改用 text 变体，`<tone>` 继续承担填充 / 边框。
2. 或在构建期用 OKLCH 按 L 等间隔派生 text-safe 档位（保留 hue / chroma），把「取档」从手工色值变成可复算规则。附件第四节说的「算法缺口」指的就是这里。
3. 补一组**全预设矩阵**断言：6 预设 × 亮/暗 × 5 tone × soft/outline/solid，soft 需分别在 `bg` 与 `bg-elevated` 上合成后断言 ≥ 4.5:1。现有台账只覆盖默认预设的部分 tone，且没有覆盖 `caomei` 的 success / warning。
4. 在修复前，文档站至少不要把失败组合作为「正常示例」展示；`caomei` / `momei` 预设的 soft 状态需要标注为已知边界，或默认改用 outline / solid。

**验收建议**：60 个「6 预设 × 明暗 × 5 tone」soft 组合全部 ≥ 4.5:1，outline 同口径；solid 与 `-solid` 白字不回退；`capture:styles` 重冻结前逐项有据。

### 4.2 P0：非文本对比度（3:1）未纳入门禁

**实测 `--caomei-color-border` 对 `--caomei-color-bg`**

| 预设 | 亮色 | 暗色 |
| --- | --- | --- |
| minimal | 1.24 | 1.38 |
| caomei | 1.23 | 1.70 |
| momei | 1.19 | 1.09 |
| sakura | 1.33 | 1.36 |
| forest | 1.28 | 1.83 |
| ink | 1.40 | 1.59 |

**影响面**

- `.caomei-field` 的边框取 `--caomei-field-border-color: var(--caomei-color-border)`，字段背景 = `bg`；白底上 1.24:1 的边框是输入框唯一的边界。
- 未选中 Checkbox 的 1px 边框同为 `--caomei-color-border`；18px 盒在白底上几乎不可见。
- 关闭态 Switch 的轨道 `background` 与 `border` 都取 `--caomei-color-border`，滑块取 `bg`；视觉上只剩一个非常淡的灰块。
- 暗色输入框（`#0b0b0d` 底 + `#2a2a2e` 边）看起来接近无边框；截图 `input-dark.png` 可直接复核。

WCAG 2.2 SC 1.4.11 要求「识别控件及其状态所必需的视觉信息」对相邻颜色 ≥ 3:1。上述控件都由库自定义样式，不属于「用户代理默认外观」豁免。设计规范 §3.2 已写「图形 ≥ 3:1」，但现有对比度台账是文本中心，未对控件边界逐项断言；`2026-09-28-m7-1-switch-thumb-foreground-judgment.md` 也明确把「`border` token 的全局淡描边口径」列为未处置。

**建议（未实施）**

1. 拆出 `--caomei-color-control-border`（或 `--caomei-field-border-color` 默认值）专供交互控件，目标 ≥ 3:1；`--caomei-color-border` 继续承担装饰性分隔线，避免一刀切加重所有表格 / 卡片。
2. 或者让字段 / 开关在浅色模式改用 `bg-elevated` 作为可识别面，边框只做辅助；但暗色下 `bg-elevated` 与 `bg` 的差异也需实测。
3. 增加非文本对比度守卫：Input / Textarea / Select / Checkbox / Radio / Switch / Slider track 的边界 vs 相邻面；亮暗 × 6 预设。
4. 这条会改变视觉重量，需用户裁定「1.0 前修」还是「1.0 登记为已知边界」。

### 4.3 P1：文档示例的可访问名系统性缺失（Select 17 处）

- `/components/select` 的 17 个示例触发器均只有 `placeholder`，没有 `label` / `aria-label`；`CaomeiSelect` 的触发器是 `button` 语义，axe 判 `button-name`（critical）。
- `/components/showcase` 的 Select 卡片同样命中；`aria-input-field-name` 另命中 RichTextEditor 内核（上游 CodeMirror），属观察项，非本库触发器。
- `Input` 基础示例已在 M3-6 补了 `label`；Select 示例没有同步，说明「示例可访问名」是点状修复，没有面状守卫。
- 组件 API 是支持 `label` 的（`FieldProps` / `FieldIdentityProps`），这不是组件缺陷，而是**文档把错误用法示范给了下游**。

**建议**：给 `docs/examples/select/*.vue` 与画廊 `select/basic.vue` 补 `label`（映射 `aria-label`），或在示例里用可见 `<label for>`；在 docs 侧加一条 axe 抽检（组件页 + 画廊），至少拦住 `button-name` / `aria-input-field-name`。

### 4.4 P1：Button 没有 hover / active 反馈

- 代码：`.caomei-button` 声明了 `transition: opacity / background-color / border-color`，但样式块内没有 `:hover` / `:active` 规则；只有 `:disabled` 与 `:focus-visible`。
- 实测：首个 primary 按钮 hover 前后 `background-color`、`color`、`border-color`、`box-shadow`、`transform`、`opacity` 全部一致。
- 影响：桌面端最主要的交互控件点击前无预告、按下无反馈；与「按钮看主次」配套的交互层缺失。其它 29/79 个带样式的组件有 hover，Button 是明显例外。

**建议**：用 `color-mix(in srgb, currentcolor 8%, transparent)` 或新增 `--caomei-color-<tone>-hover` / `-active` 派生 hover / active；保持 disabled / focus 不变；reduced-motion 下关闭 transition。需要重冻结 Button 的计算样式基线。

### 4.5 P1：DataTable 横向滚动容器不可键盘聚焦

- `.caomei-data-table` 根元素 `overflow-x: auto`，无 `tabindex`；内部 `<table>` 在文档站也被 VitePress 的 `overflow` 影响，同样不可聚焦。
- axe 在 `/components/data-table` 亮 / 暗均报 `scrollable-region-focusable`（serious）：键盘用户无法进入横向滚动区域。
- 这不是新功能，而是 WCAG 2.1.1 的既有缺口；窄屏 / 冻结列场景影响更明显。

**建议**：给滚动容器加 `tabindex="0"`，并提供可访问名（`role="region"` + `aria-label`，名称可取 `caption` / `label` / 内建「表格」）；仅当实际溢出时增加 tab 停靠点更好，但实现成本更高。补一条 E2E：键盘 Tab 能进入容器、方向键 / Shift+滚轮可横向滚动。

### 4.6 P2：空态 / 加载态只有文字

- DataTable：`loading` / 空态都是 `td` 内一行 muted 文本；没有 Skeleton、Spinner 或 loading 插槽。
- DataView：`loading` / 空态同样一行文本；有 `#empty` 插槽，但默认与示例都只是文字。
- MultiSelect / AutoComplete：空态一行 muted 文本；Select 没有空态提示。
- 文档示例「暂无成员，点击右上角新增」是把 CTA 写成蓝色文本，没有图标、标题层级或按钮；读者需要自己猜「右上角」在哪。
- 附件第 20 条只讲空状态；对组件库更完整的是「空 / 加载 / 错误」三态。库已有 Skeleton / ProgressSpinner，但 DataTable / DataView 没有接。

**建议（候选，不排期）**：评估一个纯展示的 `Empty` 组合件（icon + title + description + `#action`），或至少提供一份「空态 / 加载态」文档配方；DataTable / DataView 增加 `#loading` 插槽，默认可用 Skeleton 行。验收：不改变现有布局尺寸、文案 10 语可覆盖、窄屏不溢出。

### 4.7 P2：间距 / 字体 / 状态 token 的覆盖面

| 项 | 现状 | 影响 |
| --- | --- | --- |
| 间距 | `space-1 ~ 4` = 4/8/12/16 | 页面级 24/32/48 缺失；Card / DataTable / DataView 的 `lg` 用 `calc(space-4 + space-2)` 拼 24px |
| 字号 | 12/14/16 三档 | 组件内够用；文档站标题靠 VitePress，不归库管 |
| 字重 | 23 处字面量（600 × 17、500 × 5、400 × 1） | 预设无法通过字重表达个性；与 #1 的「个性」目标脱节 |
| 行高 | 21 处字面量（1 / 1.4 / 1.5 / 1.6） | 规范已登记 `--caomei-line-height-*` 为规划项，未实现 |
| 焦点环 | 49 处 `outline: 2px solid` 字面量 | `--caomei-color-focus-ring` 仍是规划项；预设无法统一改焦点色 |
| 状态色 | 只有 tone + solid | 缺 hover / active / text-safe 档，直接导致 §4.1 |

这些不是 1.0 的阻断项（冻结面刚终审），但应在 1.x 决定「扩 token」还是「明确不支持」。建议先补 `space-5/6/7`（24/32/48）与 tone text 变体，再评估字重 / 行高 token；不要为了对齐书里的 8–10 档色阶而一次性扩大量 token。

### 4.8 P2：文档站作为「产品门面」的偏差

- **品牌色不一致**：文档站 `--vp-c-brand-1: #3451b2`、首屏 CTA 背景 `#5672cd`，库默认 primary 是 `#2563eb`；首屏白字在 `#5672cd` 上实测 **4.48:1**（差 0.02 到 AA）。预设切换器只改组件 token，不改文档站 chrome。
- **首屏没有产品证据**：1440px 下 hero 右侧约一半空白，只有文字与四个功能卡；真正的组件预览在 `/components/showcase`，但入口在侧栏「组件画廊」，首屏看不到。对组件库来说，「看一眼就知道长什么样」比再写一段 tagline 更有效。
- **demo 容器像代码沙箱**：1px `#ddd` 边框、4px 圆角、无内边距，和库的 8/12px 圆角、surface 层级不是一套语言；单个按钮的 demo 会出现大片空白，Card / DataTable demo 又出现「demo 边框 + 组件边框」双层框。
- **英文行长**：英文正文 670px / 平均 7.52px ≈ 89 字符/行，高于 45–75；中文 42 字/行正常。可只在英文侧收窄到 ~72ch，或把 `.vp-doc` 内容列改为 `min(688px, 72ch)`。
- **建议**：把 `--vp-c-brand-*` 映射到 `--caomei-color-primary` 及派生色；首屏放 3–4 个真实组件预览或一张组合场景；给 demo 容器换 surface / 圆角 / 内边距，去掉与组件重复的边框；英文内容列限宽。均为文档站改动，不动库。

## 5. 与附件结论的差异

| 附件判断 | 本轮复核 |
| --- | --- |
| 「你已经越过不知道哪里丑的阶段」 | 方向成立：token、预设、对比度台账、视觉门禁都在；但「颜色角色」与「非文本对比度」说明**覆盖面仍有盲区**，不能等同于「所有该量的都量了」。 |
| 「书的价值在清单，不在体系」 | 成立。真正命中的是 #5 / #6 / #14 / #19 / #20 这几条检查项，而不是书里的具体配色 / 间距示例。 |
| 「颜色问题要接 OKLCH + APCA/WCAG」 | 成立，而且比附件写得更紧迫：不是「补齐 success/warning」，而是 **caomei / momei 预设的 soft/outline 整族失败**，根因是 text / fill 未分离。 |
| 「长文排版是 momei 的高价值项」 | 对 momei 成立；对 caomei-ui 只落在文档站英文正文（89 字符/行），不是组件库的核心。 |
| 「不建议买 $99 完整包」 | 同意。若要体系化，优先看设计系统治理与 WCAG 非文本对比度 / OKLCH，而不是这本书。 |

## 6. 建议的下一轮（待用户裁定，本轮不实施）

1. **先裁定颜色角色**：1.0 前修 `caomei` / `momei` 的 soft/outline 文本色，还是登记为已知边界？这会影响预设视觉与 `capture:styles` 基线，不能由实现方自行决定。
2. **非文本对比度**：是否新增 `--caomei-color-control-border` 并把 Input / Checkbox / Switch / Radio / Slider 的 3:1 纳入门禁。建议至少在 1.0 前完成测量与决策，避免把「看不见的控件」带进 1.0。
3. **低成本修复批次**：Select 示例补 `label`；Button 补 hover / active；DataTable 滚动容器补 `tabindex`。三项都可独立提交、可回归。
4. **空态 / 加载态**：先写 `docs/design` 配方与 2–3 个示例，再决定是否需要 `Empty` 组件；不要先造组件再找场景。
5. **文档站门面**：品牌色映射、首屏预览、demo 容器、英文行长；不改 `src/**`。
6. **可选沉淀**：把 20 条改写成 `docs/design/review-checklist.md`，每条附「token 落点 + 可判定验收条件」，作为 visual parity gate 的补充检查项。本轮只建议，不创建。

## 7. 未覆盖边界

- 只抽检了 11 个页面 / 组件页，未覆盖全部 56 个组件与全部 10 语页面。
- 浏览器只有 Firefox；Chromium 在本容器崩溃，未复现。不同浏览器的 `color-mix()` 合成与 axe 结果可能有差异。
- 预设对比度用计算样式 / 公式复算；除 `tag` / `message` / `input` / `showcase` 外，未逐页跑全部预设。
- 未做真实键盘全链路、读屏、触摸 / 真机、缩放 200%、高对比度模式。
- 未跑构建产物 / `docs:preview` / 全量 E2E；本轮结论只对 dev 源码渲染负责。
- 未做完整视觉回归 diff；截图只用于人工核对层级、边界与空态，不作为像素级基线。
- axe 不检测 WCAG 1.4.11 非文本对比度；§4.2 为手工测量，不是 axe 结论。
- 未评估 `sakura` / `forest` / `ink` 的真实页面状态色（只算了 border / text / primary 配对）。

## 8. 证据清单

原始目录：`test-results/refactoring-ui-self-check-2026-10-26/`（gitignored）。

| 文件 | 说明 |
| --- | --- |
| `report.json` | 页面级字体 / 颜色 / 字号统计、axe 违规、Button hover 前后计算样式 |
| `ui-audit.mjs` | 页面 audit + axe + 截图脚本 |
| `contrast.mjs` | 六预设 × 亮暗的 border / text / muted / primary 对比度复算 |
| `axe-more.mjs` | Select / Input / 画廊暗色 / 首页暗色的 axe 补充抽检 |
| `switch-shot.mjs` | 开关 / 复选框元素截图与计算样式 |
| `home-1440.png` / `home-375.png` | 首页桌面与移动端 |
| `button-1440.png` | Button 页与 demo 容器 |
| `data-table-1440.png` | DataTable 页与表格边界 |
| `showcase.png` | 组件画廊（全页） |
| `input-dark.png` | 暗色输入框边界 |
| `switch-off.png` / `checkbox-unchecked.png` | 未选中控件的边界可见性 |
| `tag-caomei-preset.png` | `caomei` 预设 Tag soft 的浅色文字 |

## 9. Review Gate

- **audit-depth**：`standard`（本记录 + 同批规划载体；零 `src/**` / 零测试，时间盒 ≤ 6 分钟）。
- **R1（`standard`）：`Reject`**（1 blocker / 5 warning / 6 suggest）。blocker = 执行期追加的 §3.9 回扫面遗漏（`index.md` 的第十轮评估摘要与评估记录本体仍只写 4 / 13）；warning 涉及对比度台账覆盖表述、G1 关闭条件、G0 axe 证据可复现性、发布指南门禁死锁、索引「Review Gate 不适用」。修复记录见[规划记录](./2026-10-26-phase26-ui-gate-planning.md) §7。
- **R2（`delta`，`quick`）：`Pass`**（0 blocker）。R1 的 B1 与 W1 ~ W5 全部关闭；残留 6 条非阻塞项已在同批修正，属非新范围。
- **R3（最终 `quick` delta）：`Pass`**（0 blocker）。6 条残留逐项关闭；未发现修复引入的新 blocker。结论见[规划记录](./2026-10-26-phase26-ui-gate-planning.md) §7。
- **未覆盖边界**：本记录为初步自检，未复跑全量组件 / 全预设页面；G0 的 docs axe 证据在 M5 落地时由 `scripts/docs/check-docs-axe.mjs` 固化。
