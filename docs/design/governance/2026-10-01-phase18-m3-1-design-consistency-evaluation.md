# Phase 18 M3-1：设计规范 §6 组件约定「可机检性」分级评估

> 创建时间：2026-10-01
> 关联条目：[待办事项](../../plan/todo.md) Phase 18 **M3-1**（组件设计一致性回归评估）
> 事实源：[设计规范 §6](../design-spec.md)（**16 行**组件约定，表头另计；实测 `awk '/^## 6\./,/^## 7\./' docs/design/design-spec.md | grep -c '^| '` = 18 = 表头 + 分隔 + 16 行）
> 决策依据：用户 2026-09-30 裁定 **D5「先出评估」**——本阶段只产出分级评估，**不落地断言**
> 快照：本仓工作区（`pnpm verify` exit 0、`test` 103 文件 / 2151 例、`test:e2e` 117、`capture:styles` 262 项 0 差异）
> **边界**：本评估**不改 `src/**` 与 `test/**`**；所有「实现现状」结论均带取证命令或文件行号。

---

## 1. 结论

- **16 行约定无一行属「仅人工」**：每行至少存在一个可机检层（声明层 / 计算样式层 / 几何层 / 交互层之一）。
- **主层级分布**（取 §3 表「可达层级」首列）：计算样式层 **13 行**、声明层 **2 行**（DataView / 所有组件）、几何层 **1 行**（Textarea）。
- **次级层级出现次数**（一行可命中多层，故合计 > 16）：计算样式层 **15 行**、几何层 **9 行**、交互层 **7 行**、声明层 **6 行**。
- **覆盖划分判据（显式）**：「较完整」= §6 该行的**主要条款**已有装置直接采样或断言（缺口仅限次级条款）；「缺口明显」= 该行主要条款无装置覆盖，或仅部分条款被覆盖。据此：**9 行较完整**（Button / Input 家族 / Calendar·DatePicker / Tag·Badge / Message·Alert / Dialog·Popover / Drawer / Textarea / 所有组件）；**7 行缺口明显**（SplitButton / ColorPicker / Card / DataTable / DataView / Checkbox·CheckboxGroup / Password）。
- **前置阻塞（必须先裁定，否则守卫会固化错误契约）**：取证中发现 **7 项 §6 ↔ 实现口径漂移**（§4），涉及浮层背景、Popover 圆角、Tag 字号、校验态选择器、禁用态计数等；**这些行的守卫落地须排在口径裁定之后**。
- **落地建议分三档**（§5）：P0 口径裁定 7 项 / P1 低成本高收益 5 项（capture 扩采样面）/ P2 声明层契约 3 项 + capture 2 项 / P3 几何与交互层 4 项。

---

## 2. 现有装置盘点（本评估的「已覆盖」判定依据）

| 装置 / 门禁 | 层级 | 受检面（实测） |
|:---|:---|:---|
| `check:design` | 声明层 | 9 类检查：token 引用存在性 / 组件原始色值（`#hex` 预算 0、`rgb()` 预算 0）/ 档位常量与 `src/types.ts` 一致 / 旧命名（`--small`·`--large`）/ 档位块属性（G1）/ scoped 变量声明（G2）/ 禁用态字面量（G3，预算 0）/ 层级字面量（G4，预算 0）/ 尺寸档位选择器归一（G5）+ 受检面下界（规则 ≥ 600 / 声明 ≥ 2500） |
| `check:overlay-z-index` | 声明层 | T1~T10：档位表顺序 / 遮罩专用 / 模态内容在册 / 浮层高于模态 / 覆盖钩子 / 静态变体继承 / 受检面下界 / fail-closed 解析 / 允许名单反向校验 / **锚定面板 ↔ E2E 清单双向对账**（41 例单测） |
| `check:class-prefix` · `check:components-overview` · `check:design-catalog` | 声明层 | 类名前缀拼写 / 总览页 ↔ §11 / §5 清单 ↔ §11（各含下界与反向校验） |
| `test/contracts/`（3 文件） | 声明层 | `field-shell`（字段外壳单行契约）/ `preset-minimal`（预设声明）/ `rich-text-editor-layout`（根类 `width`+`min-width`） |
| `capture:styles` | 计算样式层 | **262 项**（求和可复算：`size.*` 21 + `tier.*` 26 + `variant.*` 50 + `button.*` 54 + `button-focus.*` 54 + `button-icon-only*` 6 + `state.*` 8 + `z.*` 5 + `trigger.*` 12 + `drawer.*` 4 + `dialog.*` 4 + `switch.*` 6 + `toast.*` 11 + `radio-group-invalid.*` 1 = 262） |
| `test/e2e/`（7 规格） | 几何层 + 交互层 | **117 例**：responsive（换行 / 滚动 / 断点）/ field-overflow（字段族越界）/ textarea-layout（rows 与滚动）/ overlay-stacking（模态内浮层绘制顺序）/ focus-and-motion（焦点环与动效，含 reduced-motion）/ rich-text-editor-overflow（窄屏页级溢出）/ gallery（独立配置） |
| `test/a11y/` | 可访问性层 | **59 例**（axe + 例外清单两向断言） |
| 组件单测（`src/components/**/*.test.ts`） | 交互层 | v-model / 事件 / 键盘 / 受控自持 / 排序与分组等行为契约 |

---

## 3. 逐行分级（16 行）

> 层级图例：**声**=声明层 / **算**=计算样式层 / **几**=几何层 / **交**=交互层（含可访问性）。

| # | §6 行 | 约定要点 | 可达层级 | 现有覆盖（实测） | 缺口 | 落地建议 | 误报边界 |
|:-:|:---|:---|:---|:---|:---|:---|:---|
| 1 | Button | 高度 / 圆角 / 变体 / tone / 实底前景 `on-solid` / 默认 `primary` / `#icon` + `iconPosition` / 角标外扩不参与布局 | 算 · 声 · 几 | `capture` `button.*` 54 + `button-focus.*` 54 + `button-icon-only*` 6；`check:design` 全链 | `rounded` → `radius-full`（`button.vue:147`，无采样）；`tone` 实底前景 = `on-solid`（`button.vue:183~215`，无配对断言）；角标外扩（`button.vue:255` 绝对定位 + `pointer-events: none`，无断言） | ① capture 增 `button--rounded` 1 项；② `on-solid` 配对落 contracts 或 capture（5 tone × solid）；③ 角标落**声明层**断言「绝对定位 + 不参与布局」 | 角标偏移受图标/文字宽度影响 → 只断言「不改变按钮盒尺寸」，不冻结具体偏移 |
| 2 | SplitButton | 共用 Button 变体 / tone / 档位 / 圆角；拼接内侧边框归零、仅外侧圆角；下拉按钮仅图标 + `aria-label` | 算 · 几 · 交 | `capture` `trigger.split-button.*` 4 项（仅菜单触发器）；拼接规则在 `button-group.vue`（`:deep` 首/末子规则） | 拼接处内侧 `border` 宽度与外侧圆角（无采样）；下拉按钮可访问名（无 a11y 夹具项） | capture 增 `split-button.*`（主 / 菜单 / 拼接处 3 项，读 `border-top-width` / `border-top-left-radius`）；a11y 夹具纳入 SplitButton | 拼接规则作用于 **ButtonGroup 组合**而非 SplitButton 自身 → 选择器须限定组合容器；`rounded` 时外侧为 `radius-full` |
| 3 | Input 家族 | 高度 `control-height-*`；圆角 `radius-md`；默认全宽；校验态**语义**（非色值类） | 算 · 声 · 几 | `capture` `tier.*` 26 + `state.*` 8 + `size.*`；`contracts/field-shell`；`check:design` | **口径漂移 D2**（§6 写 `:invalid`，实现为 `.caomei-field--invalid` + `aria-invalid`）；「默认全宽」无断言 | 先裁定 D2 措辞；再落**声明层**断言「invalid 态不得以色值类 / 内联色表达」 | 「全宽」在 flex / grid 宿主下不成立 → 断言须限定 block 容器或直接断 `.caomei-field { width: 100% }` |
| 4 | Calendar / DatePicker | 触发器高度 / 圆角 / 全宽 + 可覆盖宽度上限；面板 `radius-md`；选中日 `primary` + `primary-foreground`；今日 `border` 描边；对外用原生 `Date` | 算 · 几 · 交 | `capture` `tier.date-picker.*` + `trigger.date-picker.*` + `z.*`；`overlay-stacking`（面板层级）；单测（`Date` 类型） | 面板圆角（`date-picker.vue:210/294` 已实现，无采样）；选中日 / 今日配色（`calendar-view.vue:172~178`，无采样）；`max-width` 回退链（无断言） | capture 增 `calendar.*`（选中 / 今日 / 面板圆角 3~4 项） | 今日与选中**组合态**须排除（实现已用 `:not([data-selected])`）→ 采样须含组合，否则假阴性 |
| 5 | ColorPicker | 触发器 `control-height-md` 方形 + `radius-md`；面板 `radius-lg` / 260px / `shadow-lg`；色块 `radius-sm`；色板 22px；滑条 `radius-full` | 算 · 几 | `capture` `trigger.color-picker.*`；`overlay-stacking`；`check:overlay-z-index` T6 | 面板宽度（`color-picker.vue:202`）/ 圆角（`:205`）/ 阴影（`:209`）已实现但无采样；触发器方形几何；色板 22px；滑条 `radius-full` | capture 增 `color-picker.*`（面板 `width` / `border-radius` / `box-shadow` + 触发器 `width == height`） | 面板宽度为 `min(260px, 可用宽)` → 断言须绑定单一视口（capture 已绑定 1280×800） |
| 6 | Card | `radius-lg`；`bg-elevated` 或 `bg` + `border`；内边距 `space-4` | 算 | **无样式层装置覆盖**（`card.test.ts` 存在但为行为契约，不涉样式约定；`gallery` e2e 只含溢出预览断言） | 全部；**口径漂移 D7**（实测三变体：`--outlined` = `bg` + `border`、`--elevated` = `bg` + `shadow-sm`、`--filled` = `bg-elevated`） | 先裁定 D7；capture 增 `card.*`（三变体 × `border-radius` / `padding` / `background-color`） | `--padding-*` 档位取值不同 → 须按档位分别采样 |
| 7 | Tag / Badge | `radius-sm`（Tag `rounded` → `radius-full`）；`tone` 语义；字号 | 算 | `capture` `tier.tag` 3 + `tier.badge` 3 + `variant.tag` 15 + `variant.badge` 15 = **36 项**（含 `border-radius` / `font-size` / 配色） | Tag `rounded` → `radius-full`（`tag.vue:172`，无采样）；**口径漂移 D5**（§6 写 `font-size-sm`，实测按档位 sm/md/lg，默认 md） | 先裁定 D5；capture 增 `tag--rounded` 1 项 | Tag 与 Badge 默认字号不同（Tag md / Badge sm，`badge.vue:115`）→ 断言须分行 |
| 8 | Message / Alert | `radius-md`；变体 `soft/solid/outline/simple`；`size` 影响字号 / 内边距 / 图标；`simple` 不消费内边距 | 算 | `capture` `size.message.*` 3 + `variant.message.*` 20 = **23 项**（含 `padding-*` / `font-size`） | `simple` 的 `padding: 0`（`message.vue:168`，无采样）；图标尺寸随 size（无采样） | capture 增 `variant.message.*.simple` 的 `padding-*` 采样 | 图标盒尺寸属夹具固有值（既有 capture 口径）→ 不采样 |
| 9 | Dialog / Popover | 圆角 `radius-lg`；浮层背景 `bg-elevated`；Dialog `shadow-lg`、Popover / DropdownMenu / Select / MultiSelect / Toast `shadow-md` | 算 | `capture` `dialog.*`（`width` / `z-index`）、`toast.*.root`（`box-shadow`）、`trigger.*` 部分 | 圆角 / 背景 / 阴影（除 toast）；**口径漂移 D3**（实测 8 个浮层面均取 `--caomei-color-bg`）、**D4**（Popover 默认 `radius-md`，`popover-content.vue:52`）、**D6**（AutoComplete 面板 shadow 为字面量，未走 `--caomei-shadow-md`） | 先裁定 D3 / D4 / D6；再落 capture 断言（`border-radius` / `background-color` / `box-shadow`） | `box-shadow` 计算值含 `color-mix` / `rgb()`，跨 Chromium 版本可能漂移 → 沿用 capture 的版本绑定口径 |
| 10 | Drawer | 面板贴边、不设圆角；尺寸 `sm/md/lg` = 320/420/560 按 `90vw` / `90vh` 收敛；滑入滑出 200ms；reduced-motion 关闭动画 | 算 · 几 · 交 | `capture` `drawer.*` 4（`width` / `height` / `animation-duration` / `transition-duration` / `z-index`）+ `drawer.overlay`；`focus-and-motion`（reduced-motion 覆盖 SelectButton / DatePicker） | 「不设圆角」（`drawer.vue` 内容面无 `border-radius`，无断言）；`90vw` / `90vh` 收敛（无几何断言）；**Drawer 自身的 reduced-motion**（无） | ① capture 增圆角采样；② `focus-and-motion` 增 Drawer 一项；③ 收敛几何落 e2e（换视口） | `90vw` / `90vh` 随视口变化 → 断言须逐视口计算期望值 |
| 11 | DataTable | 表头 / 单元格底部边框取 `border`；排序按钮图标 `text-muted`；排序态经 `aria-sort`；列样式优先 `headerClass` / `bodyClass` | 算 · 交 | `capture` `z.data-table.*` 2；单测（`aria-sort` / 排序 / 多列 / 分组 / 展开）；`gallery` e2e（仅溢出预览断言，`gallery.e2e.ts:179`）；a11y | 底部边框色（`data-table.vue:1020~1022` / `1115` / `1163`，无采样）；排序按钮图标色（`data-table.vue:1053~1055`，无采样）；`headerClass` / `bodyClass` 优先级（`data-table.vue:795` / `923`，单测面，现有覆盖未点名） | capture 增 `data-table.*`（`th` / `td` 的 `border-bottom-color` + 排序按钮 `color`） | 冻结列 / 展开行有独立规则 → 采样须限定非冻结、非展开路径 |
| 12 | DataView | 内容区不设内边距与背景；`layout` 只切根修饰类与 `list` / `grid` 插槽；空态 / 加载态文案居中、`text-muted`（加载 `primary`） | 声 · 算 | **无样式层装置覆盖**（`data-view.test.ts` 存在但为行为契约，不涉样式约定） | 全部；实现核对：根规则无 `padding` / `background`，仅 `header/footer/empty/loading` 有内边距（`data-view.vue:95/100`） | ① `contracts` 增「根规则不得声明 `padding` / `background`」；② capture 增空态 / 加载态配色 | §6 只限「内容区」→ 断言须限定选择器，header / footer 的内边距属合法 |
| 13 | Checkbox / CheckboxGroup | 指示器 `radius-sm` 方形（sm/md/lg = 16/18/20）；数组 `v-model` 为分组语义；分组 `role="group"` + `gap` `space-2`；禁用态不在分组层叠加透明度 | 算 · 声 · 交 | 单测（分组语义）；a11y（`role="group"`，`checkbox-group.vue:93`）；`check:design`（仅覆盖「字面量」预算） | 指示器尺寸档位（`checkbox.vue:133~144`，无采样）；`gap`（无采样）；「分组层禁用态不得声明 `opacity`」（`checkbox-group.vue:137` 有注释、无断言） | ① capture 增 `checkbox.*`（三档尺寸 + 分组 `gap`）；② `contracts` 增「分组层禁用态不声明 `opacity`」 | `--caomei-checkbox-size` 可被消费方覆盖 → 断言以默认档位为准 |
| 14 | Textarea | 自动增高由内容决定、默认无滚动条；`rows` 为初始最小高度；`resize` 固定 `none` | 几 · 声 · 交 | `textarea-layout` e2e 8 例；`field-overflow` e2e；`contracts/field-shell`；`capture` `tier.textarea.*` | `resize: none`（`textarea.vue:44` 为 prop 派生，无断言）；「默认无滚动条」部分覆盖 | `contracts` 增「默认 `resize: none`」；沿用 e2e 的框内滚动断言 | `resize` 为 prop 且 `autoResize` 时强制 `none` → 断言须区分档位 |
| 15 | Password | 单根包裹层、`class` / `style` 留根；强度条 4px + `radius-full`；弱 / 中 / 强 = `danger` / `warning` / `success`；未聚焦且无值不占布局 | 算 · 几 · 交 | 单测（强度分级 / 反馈文案 / 默认不渲染）；`check:design` | 强度条几何与配色（`password.vue:243~273`，无采样）；「不占布局」（`v-if="feedback && (focused \|\| model)"`，无几何断言）；「单根」（无断言） | ① capture 增 `password.*`（`meter` `height` / `border-radius` + 三档 `background-color`）；② 单测补「未聚焦无值时不渲染 `meter` 节点」 | 强度条宽度按等级 33 / 66 / 100% → 采样须含三档 |
| 16 | 所有组件 | 焦点态可见；禁用态不改变布局尺寸；禁用态不透明度统一 `--caomei-disabled-opacity`（§6 记 **37 处**）；`cursor` / 背景按需逐组件 | 声 · 算 · 几 | `check:design` G3（`opacity` 字面量预算 0）；`capture` `button-focus.*` 54 + `state.*` 8 + `switch.disabled.*` 2；`check:overlay-z-index` | 焦点可见（仅 button / field 面）；禁用态**不改布局尺寸**（无）；`cursor: not-allowed`（无）；**口径漂移 D1**（计数） | ① 先修正 D1 计数；② 落「同组件同档位：禁用态尺寸 == 默认态尺寸」的几何断言；③ 焦点可见扩面 | 「焦点态可见」须用 `CSS.forcePseudoState` 口径（capture 既有做法）；禁用态几何对比须同档位同内容 |

---

## 4. 口径漂移（§6 ↔ 实现，实测）

> 这些漂移**不是本评估要修的缺陷**，但会决定守卫的正确契约——**必须先裁定（改 §6 措辞或改实现），再落该行的守卫**，否则守卫会把错误契约冻结为基线。

| 编号 | §6 表述 | 实现实测（取证） | 建议去向 |
|:---|:---|:---|:---|
| **D1** | 禁用态不透明度「37 处，含根控件 / 子部件 / 条目，无字面量残留」 | `rg -o "var\(--caomei-disabled-opacity\)" src/components \| wc -l` = **35**（含注释共 36 次出现，31 个文件） | 修正 §6 计数（或说明统计口径），再落「计数下界」守卫 |
| **D2** | Input 家族「校验态用 `:invalid` 而非色值类」 | 实测为 `.caomei-field--invalid`（`src/styles/field-shell.css:79~85`）+ `aria-invalid`（14 个组件）；`:invalid` 仅 3 处 **prop 绑定**（password / checkbox-group） | 改 §6 措辞为「类 / 属性驱动的 invalid 语义」，再落声明层守卫 |
| **D3** | Dialog / Popover「浮层背景 `bg-elevated`」 | 8 个浮层面默认取 `--caomei-color-bg`：dialog:180 / popover:53 / select:472 / multi-select:432 / auto-complete:594 / dropdown-menu:192 / toast:214 / color-picker:206 | 二选一：改 §6 为 `bg`，或把实现改 `bg-elevated`（涉 8 处 + 视觉变更，须单独裁定） |
| **D4** | Dialog / Popover「圆角 `radius-lg`」 | Dialog ✓ `radius-lg`（dialog:179）；Popover 默认 `radius-md`（`popover-content.vue:52` `var(--caomei-popover-radius, var(--caomei-radius-md))`） | 改 §6 或改 Popover 默认值（视觉变更） |
| **D5** | Tag / Badge「字号 `font-size-sm`」 | Badge 默认 `sm` ✓（badge:115）；Tag 按档位 sm/md/lg（tag:150~166），**默认 md** | 改 §6 为「Tag 按档位（默认 md）/ Badge 默认 sm」 |
| **D6** | 浮层阴影行未列 AutoComplete | AutoComplete 面板 shadow 为**字面量** `0 8px 24px color-mix(in srgb, var(--caomei-color-text) 12%, transparent)`（auto-complete:596），未走 `--caomei-shadow-md` | 二选一：补 §6 行 + 改走 token，或登记为有意差异 |
| **D7** | Card「`bg-elevated` 或 `bg` + `border`」 | 三变体：`--outlined` = `bg` + `border`（card:84~87）、`--elevated` = `bg` + `shadow-sm`（card:89~92）、`--filled` = `bg-elevated`（card:94~96） | 改 §6 为「按变体：outlined = `bg`+`border`；elevated = `bg`+`shadow-sm`；filled = `bg-elevated`」 |

---

## 5. 落地建议（按成本 / 收益分档）

> 本评估**只给建议**；落地项须经用户裁定后登记（[规划规范 §3](../../standards/planning.md)：评估不改候选池）。

### P0（前置，必须先做）
- 裁定 §4 的 7 项口径漂移（改 §6 措辞为主，涉实现的 D3 / D4 / D6 需单独决策）。

### P1（低成本高收益：capture 扩采样面，均为计算样式层）
1. `card.*`（三变体 × 圆角 / 内边距 / 背景）
2. `data-table.*`（`th` / `td` 底部边框色 + 排序按钮图标色）
3. `password.*`（强度条高度 / 圆角 + 三档背景色）
4. `variant.message.*.simple` 的 `padding-*`
5. `tag--rounded`（`radius-full`）

### P2（声明层契约 + 少量采样）
1. `contracts` 增：DataView 根规则不声明 `padding` / `background`
2. `contracts` 增：CheckboxGroup 分组层禁用态不声明 `opacity`
3. `contracts` 增：Textarea 默认 `resize: none`
4. capture 增：`checkbox.*`（三档尺寸 + 分组 `gap`）、`split-button.*`（拼接处边框 / 圆角）

### P3（几何层 / 交互层，成本较高）
1. 禁用态「尺寸不变」的同档位几何对比（覆盖 16 行）
2. Button 角标「不参与布局」的几何断言
3. Drawer `90vw` / `90vh` 收敛 + Drawer 自身的 reduced-motion
4. 焦点可见扩面（现仅 button / field 面）

---

## 6. 通用误报边界

- **几何层断言必须限定视口**：`90vw` / `90vh`、`min(260px, 可用宽)`、`width: 100%` 类约定在不同视口 / 宿主布局下期望值不同；capture 的「单一视口 1280×800」口径应作为几何采样的默认前提。
- **计算样式层不得采「夹具固有值」**：图标盒尺寸、文本长度、`.case` 包装层布局不属组件契约（既有 capture 口径）。
- **组合态必须成对覆盖**：`[data-today]` × `[data-selected]`、`disabled` × `hover/focus`、`rounded` × `size` —— 只采单态会把「组合态回退」漏掉。
- **token 旁路要显式拦**：字面量 shadow / 色值即使与 token 同值，也应报「未走 token」（D6 即此类）；但需先确认实现是否有意为之。
- **可覆盖钩子不等于默认值**：`var(--caomei-<comp>-x, fallback)` 的断言应同时覆盖「未覆盖 → fallback」与「覆盖 → 生效」两条路径（既有 `preset-minimal` / `field-shell` 契约的做法）。

---

## 7. 规模与质量门

- **规模**：1 文件（本记录）+ 治理索引登记 + `todo.md` 状态回填；**零 `src/**` / 零 `test/**` 改动**（D5「只出评估」）。
- **质量门（本批实测）**：`lint:md:check` / `docs:check` 11 段 / `governance:check` 全绿；`pnpm verify` exit 0；取证命令全部为只读（`rg` / `awk` / `sed` / `grep -c`）。
- **V 阶段（显式跳过）**：纯文档评估，无 UI 面。

## 8. Review Gate 结论

- **R1（第 1 轮，`standard`）`Reject`**：1 blocker / 6 warning / 2 suggest。本地留痕 `artifacts/review-gate/2026-10-01-phase18-m3-1-design-consistency-evaluation.md`。
- **审计方独立复核**（摘）：`lint-md` / `check-governance-records` / `check-planning-numbers` / `docs:check:links` 全绿；**D1~D7 的实测值逐条可复算且正确**（仅 1 处行号错位）；§2 的 262 构成求和 = 262；`check-overlay-z-index.test.mjs` 41 passed；`git status` 仅 2 个文档文件（零 `src/**` / 零 `test/**`）；`todo.md` 有意未回填**符合**仓内约定（完成态回填不得早于 RG 结论）。
- **R1 修复点（同批收口）**：
  - **RG-B1（blocker，复发：同组统计跨载体漂移）**：`index.md` 索引摘要仍为修复前旧值（主层级 12 / 3 / 1、次级 声 6 / 算 14 / 几 5 / 交 5）→ 已同步为记录本体口径（**13 / 2 / 1**；**算 15 / 声 6 / 几 9 / 交 7**）。
  - **RG-W1**（第 11 行 DataTable 误记 `responsive` e2e）：改为 `gallery` e2e（仅溢出预览断言，`gallery.e2e.ts:179`）。
  - **RG-W2**（第 7 行 Tag/Badge 计数 `50` 错）：改为 `tier.tag` 3 + `tier.badge` 3 + `variant.tag` 15 + `variant.badge` 15 = **36 项**。
  - **RG-W3**（行号错位）：D3 `auto-complete` 593 → **594**；第 5 行 ColorPicker 面板引用改为 `:202`（width）/ `:205`（radius）/ `:209`（shadow）。
  - **RG-W4**（「最廉价可判定层」标签与表不符）：改为「取 §3 表『可达层级』首列」。
  - **RG-W5**（覆盖 9 / 缺口 7 判据未显式）：§1 补显式判据（主要条款是否有装置直接覆盖）。
  - **RG-W6**（第 6/12 行「无」与 §2 组件单测口径冲突）：改为「**无样式层装置覆盖**（单测存在但为行为契约，不涉样式约定）」。
  - **RG-S1**（第 8 行计数口径）：拆为 `size.message.*` 3 + `variant.message.*` 20 = **23 项**。
  - **RG-S2**（262 未附复算命令）：§2 补求和式。
- **实测用时（R1）**：派发 `2026-10-01T21:01:01+08:00` → 留痕写入 `2026-10-01T21:11:47+08:00`，**≈ 10 分 46 秒**（**略超** ≤ 10 分钟时间盒，按 §3.3 作分级校准信号登记）。

## 9. Review Gate 复审（R2）

- **R2（第 2 轮，`standard`）`Reject`**：**2 blocker / 1 warning**（新增 RG-B2、复发 RG-W3、新增 RG-W7）；R1 的 9 条修复点中 **8 条已关闭**（RG-B1 / W1 / W2 / W4 / W5 / W6 / S1 / S2）。
- **R2 新增 / 未关闭项与处置（同批收口）**：
  - **RG-B2（blocker，本批引入）**：§8 的 `声6/算14/几5/交5` 触发 `lint:md:check` 的 `space-around-number`（4 error）→ 改为 `声 6 / 算 14 / 几 5 / 交 5`，复跑 exit 0。
  - **RG-W3（复发，未关闭）**：ColorPicker 面板阴影行号 `:210` 实为 `:209`（`210` 是 `}`）→ 第 5 行与 §8 两处改为 `:209`。
  - **RG-W7（warning，本批引入）**：新增 §8 / §9 后出现两个 `## 9.` 标题 → 尾部「边界与未取证面」重编号（R3 占位节插入后为 **§11**）。
- **实测用时（R2）**：派发 `2026-10-01T21:14:21+08:00` → 留痕写入 `2026-10-01T21:17:31+08:00`，**≈ 3 分 10 秒**（≤ 10 分钟时间盒）。

## 10. Review Gate 复审（R3）

- **R3（第 3 轮，`standard`）`Pass`**：0 blocker / 1 warning（RG-W8）。R2 的 3 条修复点**全部关闭**（RG-B2 / RG-W3 / RG-W7）。
- **R3 复核**（摘）：`pnpm lint:md:check` **exit 0**；`## N.` 标题编号 1~11 连续无重复；两处 `:209` 与 `color-picker.vue` 实际声明行一致（`202 width` / `205 border-radius` / `209 box-shadow`）。
- **R3 修复点（同批收口）**：**RG-W8**（warning）——§9 的 RG-W7 记录残留旧编号引用（写「重编号为 §10」，R3 占位节插入后应为 **§11**）→ 已改为 §11。
- **实测用时（R3）**：派发 `2026-10-01T21:19:26+08:00` → 留痕写入 `2026-10-01T21:21:28+08:00`，**≈ 2 分 02 秒**（≤ 10 分钟时间盒）。
- **轮次小结**：R1 `Reject`（1 blocker / 6 warning / 2 suggest）→ R2 `Reject`（2 blocker / 1 warning）→ **R3 `Pass`**。三轮合计新增问题：RG-B1~B2、W1~W8、S1~S2；**均在轮内关闭**，无残留 blocker。**R1 实测用时略超时间盒（10 分 46 秒）已按 §3.3 登记为分级校准信号**（评估类交付的复算面大于预估）。

---

## 11. 边界与未取证面

- 本评估**不落地任何断言**（D5）；§5 的落地项须另行裁定与登记。
- 「现有覆盖」以装置**当前受检面**为准：`capture:styles` 262 项与 e2e 117 例的构成见 §2；未逐项枚举单测文件名。
- 本评估**未**对以下面取证，故不给出判定：`src/components/**` 单测的逐文件覆盖矩阵、`test/a11y` 的逐夹具清单、文档站主题 CSS（不在 stylelint 面内，既有 Backlog 在册）。
- §4 的 D3 / D4 / D6 涉及视觉变更（浮层背景 / Popover 圆角 / AutoComplete 阴影 token 化），本评估只陈述实测与两个去向，**不做取舍**。
