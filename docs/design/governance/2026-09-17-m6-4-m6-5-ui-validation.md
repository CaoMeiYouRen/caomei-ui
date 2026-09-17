# M6-4 图标一览卡片排版修复 + M6-5 `DatePicker` 宽度上限浏览器验证

- 日期：2026-09-17
- 范围：工作区未提交 diff 的 M6 批次第二批——M6-4「图标一览」网格卡片排版（`li + li` 外边距重置），M6-5 `DatePicker` 触发按钮默认宽度上限（token 补齐 + 中英组件页 / 主题 / 设计规范口径同步）
- 类型：纯 CSS 级联修复 + 文档同步；本文件为 Phase 7 第二阶段 M6 批次第二批的 V 阶段验证记录
- 依据：[测试规范 §2.1 / §5.1](../../standards/testing.md)、[响应式设计 §3 / §4](../../design/responsive.md)、[主题与样式设计 §4.1](../../design/theming.md)、UI 验证 skill（`.github/skills/ui-validator/SKILL.md`）
- 被测对象：`src/components/date-picker/date-picker.vue`、`docs/examples/icons/gallery.vue`、`docs/i18n/en-US/examples/icons/gallery.vue`、`docs/components/date-picker.md`、`docs/i18n/en-US/components/date-picker.md`、`docs/components/input-group.md`、`docs/i18n/en-US/components/input-group.md`、`docs/design/theming.md`、`docs/design/design-spec.md`、`docs/plan/todo.md`、`docs/design/governance/2026-09-17-momei-migration-feasibility.md`、`docs/design/governance/2026-09-17-momei-migration-handover-plan.md`

## 范围（scope）

| 维度 | 取值 |
| --- | --- |
| 被测 revision | HEAD `5201b49`（已提交）+ 工作区未提交 diff（12 文件，见上「被测对象」）；验证窗口内 `src/` 与示例文件未再改动 |
| 入口 / 产物 | VitePress dev `http://127.0.0.1:5173`（`pnpm docs:dev`，监听 PID 1718824）；dev 直读工作区 `src/` 与 `docs/`，HMR 已含本批改动 |
| 页面 | `/components/icons`、`/en-US/components/icons`、`/components/date-picker`、`/en-US/components/date-picker`、`/components/input-group`、`/components/auto-complete`（仅取夹具素材） |
| 视口 | 桌面 1440×900、平板 1024×768、移动 375×812 |
| 主题 | 亮色 / 暗色，`emulateMedia` 的 `colorScheme` 参数 + `html.dark` + localStorage `vitepress-theme-appearance` 三处对齐 |
| 浏览器 | Chromium 153.0.8010.12（Playwright 1.63 内置），容器内 `--no-sandbox --disable-dev-shm-usage`；`ignoreDefaultArgs: ['--hide-scrollbars']` 暴露真实滚动条（1440 下实测 15px） |
| 取证脚本 | `test-results/m64-m65-validate.mjs`（已 gitignore）；原始 JSON 与截图落 `test-results/m64-m65/`；本记录承载结论与关键实测值 |

- 结论：**通过**——**125 / 125 核对项通过，失败 0**（A1 31 / A2 18 / A3 2 / A4 12 / B1 6 / B2 4 / B3 9 / B4 19 / B5 6 / C 9 / D 9）；console error / pageerror / HTTP ≥ 400 均为 **0**；观察项 5（均不计为问题）。
- 说明：本批为 CSS 级联修复与文档口径同步，happy-dom / jsdom 不计算 scoped CSS，验收由本记录的计算样式实测承担（[测试规范 §2.1](../../standards/testing.md)）。既有 `DatePicker` 单元用例另跑 `pnpm exec vitest run src/components/date-picker`：**29 / 29 通过，零回归**。

## 1. M6-4 图标一览卡片排版（A）

### 1.1 根因与修复取证

| 核对项 | 期望 | 实测 | 判定 |
| --- | --- | --- | --- |
| 文档站正文规则存在于 CSSOM | `.vp-doc li + li` 带 `margin-top: 8px` | `.vp-doc li + li` → `margin-top=8px` | 通过（根因成立） |
| 卡片计算外面距 | `0px` | `0px`（24 / 24 项，中英 × 三档视口） | 通过（修复生效） |
| 根因规则与修复规则的级联结果 | 卡片不再被压低 | 卡片 `margin: 0px`，规则来自示例 scoped `.demo-grid__item`（带 scope 属性，特异性高于 `.vp-doc li + li`） | 通过 |

> 改动前快照不可复现：工作区已含修复，无法在同一 revision 下回放「除首个外被下压 8px 且高度少 8px」的旧态；本记录以「同行卡片高度与顶边是否一致」作为回归判定，与上一批记录对不可复现快照的处理口径一致。

### 1.2 三档视口几何（中英各一组，实测值一致）

| 视口 | 列数 | 单列宽 | 卡片高 | 行数 | `grid-template-rows` | 网格 scrollW / clientW | 页面 scrollW / clientW |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 桌面 1440 | 5 | 122.8px | 102px | 5 | `102px` × 5 | 646 / 646 | 1425 / 1425 |
| 平板 1024 | 4 | 135.75px | 102px | 6 | `102px` × 6 | 567 / 567 | 1009 / 1009 |
| 移动 375 | 2 | 131px | 102px | 12 | `102px` × 12 | 270 / 270 | 360 / 360 |

- 每行内卡片的高与顶边**逐项一致**（行内去重后各自仅一个取值）：桌面行顶边 `1438 / 1548 / 1658 / 1768 / 1878`（步长 110 = 卡片 102 + 间隙 8），移动 `2061` 起同样步长 110；全局仅一种卡片高度 `102px`，**不再出现 8px 参差**。
- `grid-template-rows` 声明行数 = 实际行数（5 / 6 / 12），无隐式行残留。
- 中英页面 6 组测量数值完全相同（示例为同一份网格定义）。

### 1.3 横向溢出

| 核对项 | 期望 | 实测 | 判定 |
| --- | --- | --- | --- |
| 网格无横向溢出（中英 × 三档） | `scrollWidth <= clientWidth + 1` | 646/646、567/567、270/270 | 通过 6/6 |
| 页面无横向溢出（中英 × 三档） | 同上 | 1425/1425、1009/1009、360/360 | 通过 6/6 |
| 卡片全部落在网格容器内（中英 × 三档） | true | true | 通过 6/6 |

### 1.4 刀刃项：移动 375 下最长图标名是否溢出卡片（A3）

| 核对项 | 期望 | 实测 | 判定 |
| --- | --- | --- | --- |
| 卡片内盒宽 | — | `131px` 卡片 − 左右内边距 `16px` − 左右边框 `2px` = **113px** | 记录 |
| 最长图标名 `TriangleAlert`（13 字符） | 不溢出 | 文本宽 `93.63px`、`scrollWidth 94` / `clientWidth 94` | 通过 |
| `LoaderCircle`（12 字符） | 不溢出 | 文本宽 `86.42px`、`scrollWidth 86` / `clientWidth 86` | 通过 |
| 全部 24 项图标名 | 0 项溢出 | 0 / 24 溢出 | 通过 |

- 名称最长者仍留约 `19px` 余量（113 − 94），当前未见截断；因名称不换行（flex 子项按内容收缩到内容宽，未触发收缩），属单行内联文本宽度判定。
- 相邻风险已在记录内留痕：若后续新增更长的图标名（约 15 字符以上）或提高字号，需重跑本项（见「未覆盖边界」）。

### 1.5 亮 / 暗主题可辨性（中英，桌面 1440）

| 语言 / 状态 | 卡片边框 `border-top-color` | 图标名色 | 标签色 | 页面底色 | 卡片高度去重 |
| --- | --- | --- | --- | --- | --- |
| 中文 亮色 | `rgb(226, 226, 227)` | `rgb(60, 60, 67)` | `rgb(103, 103, 108)` | `rgb(255, 255, 255)` | `[102]` |
| 中文 暗色 | `rgb(46, 46, 50)` | `rgb(223, 223, 214)` | `rgb(152, 152, 159)` | `rgb(27, 27, 31)` | `[102]` |
| 英文 亮色 | `rgb(226, 226, 227)` | `rgb(60, 60, 67)` | `rgb(103, 103, 108)` | `rgb(255, 255, 255)` | `[102]` |
| 英文 暗色 | `rgb(46, 46, 50)` | `rgb(223, 223, 214)` | `rgb(152, 152, 159)` | `rgb(27, 27, 31)` | `[102]` |

- 边框色 / 文本色与页面底色三者在两套主题下均不相等（卡片自身背景为 `rgba(0, 0, 0, 0)`，透明，可辨性由边框与文本承担）；主题切换后卡片高度仍为单一值 `102px`，修复与主题无关。

## 2. M6-5 `DatePicker` 触发按钮宽度上限（B）

### 2.1 默认态（桌面 1440，中英一致性由 B4 覆盖）

| 核对项 | 期望 | 实测 | 判定 |
| --- | --- | --- | --- |
| `--caomei-select-max-width` 原始值 | `20rem` | `20rem`（根字号 `16px` → `320px`） | 通过 |
| `--caomei-date-picker-max-width` 是否在元素上声明 | 未声明（走回退） | `''`（空） | 通过 |
| 触发器计算 `width` | `320px` | `320px` | 通过 |
| 触发器计算 `max-width` | `320px` | `320px` | 通过 |
| 父容器 `.demo-column` 宽度 | `646px` | `646px`（`right = 1043.5`，真实滚动条口径） | 通过 |
| 页面 5 个触发器（3 个 demo） | 全部 `320px / 320px` | 全部 `320px / 320px`（`x = 397.5`、`right = 717.5`） | 通过 |

### 2.2 覆盖三态（同一触发器内联覆盖，逐个取值）

| 覆盖值 | 期望 | 计算 `width` | 计算 `max-width` | 实测盒宽 | 判定 |
| --- | --- | --- | --- | --- | --- |
| 无（默认） | `320px` | `320px` | `320px` | `320px` | 通过 |
| `--caomei-date-picker-max-width: none` | 撑满父容器 `646px` | `646px` | `none` | `646px` | 通过 |
| `--caomei-date-picker-max-width: 240px` | `240px` | `240px` | `240px` | `240px` | 通过 |
| 移除覆盖后 | 回到 `320px` | `320px` | `320px` | `320px` | 通过 |

### 2.3 面板与宿主页面稳定性（[测试规范 §5.1](../../standards/testing.md)）

VitePress 页面底色为白，1440×900 下真实滚动条 15px（`innerWidth 1440` / `documentElement.clientWidth 1425`）。打开前 → 打开 → Esc 关闭后三阶段测量：

| 阶段 | `innerWidth` | `clientWidth` | 滚动条 | `body.padding-right` | 触发器 rect | `.demo-column` rect | 面板数 | CLS 累计 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 打开前 | 1440 | 1425 | 15 | `0px` | `397.5 / 416 / 320×36` | `397.5 / 416 / 646×72` | 0 | 0 |
| 打开后 | 1440 | 1425 | 15 | `0px` | 同上 | 同上 | 1 | 0 |
| 关闭后 | 1440 | 1425 | 15 | `0px` | 同上 | 同上 | 0 | 0 |

| 核对项 | 期望 | 实测 | 判定 |
| --- | --- | --- | --- |
| 面板打开且可见 | true | true | 通过 |
| 面板为 portal（不在 demo 容器内、挂在 `body` 下） | true / true | `insideDemo=false`、`inBody=true`（`role="dialog"`，父节点为 `body` 下的 `DIV`） | 通过 |
| 面板无内部横向溢出（宽度满足内容所需） | `scrollWidth <= clientWidth + 1` | `220 / 220`（面板 rect `222×244`，含 1px 边框） | 通过 |
| 面板落在视口内 | true | `x=398, y=458, w=222, h=244, right=620, bottom=702`（视口 1440×900） | 通过 |
| `in-flow` 容器与触发器不位移（dx + dy） | 0 | `0.00` | 通过 |
| 滚动条占位变化在容差内 | ≤ 15px | `clientWidth 1425 → 1425`（无变化） | 通过 |
| 无非预期 CLS（`layout-shift` 总位移） | < 0.01 | `0.00000`（无 `layout-shift` 条目） | 通过 |
| Esc 关闭面板 | 0 | 0 | 通过 |
| 关闭后 `clientWidth` 恢复 | 1425 | 1425 | 通过 |

- **遮罩**：`DatePicker` 面板为 Reka `Popover` portal，无独立全视口遮罩元素，故「遮罩完整覆盖」判据对本组件 N/A；稳定性以「`in-flow` 不位移 + 滚动条容差 + CLS」三项判定，三项均通过。
- **面板宽度 222px < 触发器 320px**：面板为 `width: max-content` 且 `align="start"`，按日历内容定宽；内容无内部溢出，属设计取向（观察项）。

### 2.4 三档视口与亮 / 暗

| 视口 | 父容器宽 | 期望触发宽 = `min(20rem, 可用宽)` | 实测触发宽 | 触发器 scrollW / clientW | 页面 scrollW / clientW | 判定 |
| --- | --- | --- | --- | --- | --- | --- |
| 桌面 1440 | 646px | 320px | 320px（5 / 5） | 318 / 318 | 1425 / 1425 | 通过 |
| 平板 1024 | 567px | 320px | 320px（5 / 5） | 318 / 318 | 1009 / 1009 | 通过 |
| 移动 375 | 270px | 270px | 270px（5 / 5） | 268 / 268 | 360 / 360 | 通过 |

- 移动 375 额外验证：面板打开后 rect `x=45, y=284, w=222, h=244, right=267`，落在 375×812 视口内且无内部横向溢出（窄屏降级正常）；`Esc` 关闭面板，面板数归 0。
- 亮 / 暗（中英各两态）：触发器宽度均 `320px / max-width 320px`，`html.dark` 与 localStorage 与 `emulateMedia` 三处对齐。亮色边框 `rgb(229, 231, 235)`、文字 `rgb(26, 26, 26)`、页面底色 `rgb(255, 255, 255)`；暗色边框 `rgb(42, 42, 46)`、文字 `rgb(245, 245, 245)`、页面底色 `rgb(27, 27, 31)`。边框 / 文本与底色均可辨。

### 2.5 中英「样式定制 / Style customization」token 表

| 核对项 | 中文页实测 | 英文页实测 | 判定 |
| --- | --- | --- | --- |
| 含 `--caomei-date-picker-max-width` 的 token 表 | `变量 / 默认 / 说明` + `--caomei-date-picker-max-width` + `--caomei-select-max-width` + `触发器最大宽度` | `Variable Default Description` + 同名 token | 通过 |
| 默认列写出回退变量 | `--caomei-select-max-width` | 同上 | 通过 |
| 章节标题 | `样式定制` | `Style customization` | 通过 |
| token 名与实际生效变量一致 | 覆盖该变量即改变 `max-width`（§2.2 三态），且元素上未声明同名变量时值为空（走回退） | 同左 | 通过 |

## 3. InputGroup × `DatePicker` 口径核对（C）

### 3.1 夹具方法与保真度

- 夹具构造：取 `/components/input-group` 的既有 `Select + Button` 横向组做 `cloneNode(true)`（保留容器 scope 属性），清空后用 `DatePicker` / `AutoComplete` / `Button` 的克隆节点重新填充，追加到 `width: 646px` 的 `body` 级宿主后读计算样式。
- 关键前提：文档站按页加载 SFC 样式，`input-group` 页并不 import `DatePicker` / `AutoComplete`。为让夹具反映「真实下游同时引入两者的页面」，先把两个组件页的 dev 注入样式（按 `data-vite-dev-id` 精确匹配 `src/components/date-picker/date-picker.vue` 与 `src/components/auto-complete/auto-complete.vue`）原样注入当前页再测量。
- 保真度自检：注入样式后，单独放置（不组合）的 `DatePicker` 复现实页实测值 `320px / max-width 320px`，注入样式含 `max-width: var(--caomei-date-picker-max-width, ...)` 规则。夹具结果可用。

### 3.2 文档新增条目逐句对照（`docs/components/input-group.md` 与英文版）

| 文档表述 | 实测 | 判定 |
| --- | --- | --- |
| 「`DatePicker` 不在上述输入类成员清单内」 | 组内宽度规则 CSSOM selectorText = `.caomei-input-group--horizontal[data-v-03d73ef8] > :is(.caomei-input, .caomei-input-number, .caomei-select__field, .caomei-multi-select, .caomei-textarea)`，**不含** `.caomei-date-picker` | 一致 |
| 「它保留自身的宽度上限（默认 `20rem`）」 | 组内 `DatePicker` 计算 `max-width: 320px`（= `20rem`），与独立态一致；未被 `max-width: none` 规则命中 | 一致 |
| 「在组合中不占满剩余宽度」 | 组宽 `646px`，`DatePicker` 宽 `320px`（`flex: 0 0 auto`，`width: 100%` 被自身 `max-width` 收敛）；`[DatePicker, Button]` 组合中两者合计占用 `373px`，右侧余 `273px` 空白 | 一致 |

**结论：条目所述行为与实测逐句一致。**（本批 W2 复审修复把 `DatePicker` 与 `AutoComplete` 合并为「其余成员不参与铺满」一条，实测值不变；表中引用的分句来自改写前文本，语义等价。）

### 3.3 位次圆角与边框重叠（`DatePicker` 作为成员）

| 夹具 | 位次 | 计算圆角（TL / TR / BR / BL） | 盒宽 | 判定 |
| --- | --- | --- | --- | --- |
| `[DatePicker, Button]` | 首成员 | `8px 0px 0px 8px` | 320px | 通过（起始侧保留、连接侧归零） |
| `[Button, DatePicker, Button]` | 中间成员 | `0px 0px 0px 0px` | 320px | 通过 |
| `[AutoComplete, DatePicker]` | 末成员 | `0px 8px 8px 0px` | 320px | 通过（连接侧归零、结束侧保留） |

- `-1px` 边框重叠生效：`[DatePicker, AutoComplete]` 中首成员 `right=320` − 次成员 `left=319` = **1.00px**，次成员 `margin-inline-start: -1px`。
- `DatePicker` 的可见边框 / 圆角直接在触发器 `<button>` 上（组件无字段包装层），位次规则与 `Select` 的内层触发器继承路径不同，但两者结果一致。

### 3.4 同一夹具暴露的相邻事实（观察项，非本批引入）

| 组件 | 在宽度规则 `:is()` 清单内 | 组内实测宽 | 计算 `max-width` | 位次圆角 |
| --- | --- | --- | --- | --- |
| `DatePicker` | 否 | 320px | 320px | 按位次正确 |
| `AutoComplete` | 否 | 320px | 320px | 按位次正确 |

- `AutoComplete` 同样不在清单内，作为成员时保留 `width: 100%` + `320px` 上限（既非「铺满剩余宽度」，也非「内容宽度」）。本记录初稿引用的「其余成员（如 `Button`）保持内容宽度」为本批 diff 之前的既有表述，**该句已在本批 W2 复审修复中改写为「其余成员不参与铺满：`Button` 等按内容宽度；`AutoComplete` 与 `DatePicker` 保留自身宽度上限」**，新表述与本节实测一致；是否把 `AutoComplete` 纳入铺满清单，建议单独评估（见观察项 4）。

## 4. 回归：既有 `/components/input-group` demo（D）

真实滚动条口径（`innerWidth 1440` / `clientWidth 1425` / 滚动条 15px），与上一批 V 记录[《M6-1 / M6-3 拼接修复验证》](./2026-09-17-m6-report-defects-ui-validation.md) §2 同口径：

| 核对项 | 期望 | 实测 | 判定 |
| --- | --- | --- | --- |
| 横向组宽 | `646px` | `646px`（`right = 1043.5`） | 一致 |
| `Select` 成员根元素圆角 | `8px 0px 0px 8px` | `8px 0px 0px 8px` | 一致 |
| 内层 `.caomei-select` 圆角 | 与根元素逐角一致 | `8px 0px 0px 8px` | 一致 |
| `Select` 成员宽 / `flex` / `max-width` | `593px / 1 1 auto / none` | `593px / 1 1 auto / none` | 一致 |
| 触发器铺满包装层 | `innerRight = fieldRight` | `990.5 = 990.5` | 一致 |
| 组合右边界贴齐 | `lastRight = groupRight` | `1043.5 = 1043.5` | 一致 |
| 末成员 `Button` 圆角 | `0px 8px 8px 0px` | `0px 8px 8px 0px` | 一致 |
| `Input + Button`（demo 1） | `605px / 1 1 auto / none` | `605px / 1 1 auto / none` | 一致 |
| 纵向组合（demo 3） | `646 / 646`；`8px 8px 0px 0px` / `0px 0px 8px 8px` | 同左 | 一致 |

- 结论：与上一批 V 记录数值逐项一致，**本批未造成回退**。M6-5 的 `max-width` 声明只作用于 `.caomei-date-picker`，M6-4 只作用于示例网格项，均不触及 InputGroup 成员规则。

## 5. 控制台 / 网络（E）

| 指标 | 期望 | 实测 |
| --- | --- | --- |
| `console.error` | 0 | 0 |
| `pageerror` | 0 | 0 |
| HTTP 状态码 ≥ 400 | 0 | 0 |

统计覆盖本轮全部导航：`/components/icons`（中英）、`/components/date-picker`（中英）、`/components/auto-complete`、`/components/input-group`，含三档视口与亮 / 暗重复访问。

## 观察项（OBSERVE，不计为问题）

1. **移动 375 下图标一览为 2 列而非 1 列**：预览区可用宽 270px，`minmax(112px, 1fr)` 恰好容纳 2 列（131px / 列），单项文本可读、无溢出。属网格声明的预期行为，非 M6-4 缺陷。
2. **`DatePicker` 面板无独立遮罩**：Reka `Popover` 设计上不渲染全屏遮罩（区别于 Dialog / Drawer），稳定性改以 `in-flow` 不位移 + 滚动条容差 + CLS 判定，三项均通过。
3. **面板宽度 222px 小于触发器 320px**：面板为 `width: max-content` + `align="start"`，按日历内容（220px）定宽；内容无内部溢出。若后续要求「面板不窄于触发器」，需另立条目评估。
4. **`AutoComplete` 同样不在 InputGroup 输入类成员清单内**：组内宽度 `320px`（自身上限），既非铺满也非「内容宽度」。文档该处概括已在本批 W2 复审修复中改写（`AutoComplete` 与 `DatePicker` 均写明「保留自身宽度上限」），**本条已由该措辞修订消解**；是否进一步把 `AutoComplete` 纳入铺满清单，建议后续单独评估。
5. **移动 375 的卡片内盒宽实测 113px**（131 − 16 内边距 − 2 边框），最长图标名文本 94px（`TriangleAlert`），余量约 19px；与任务描述给出的「约 94–110px」区间略有差异，以本记录实测为准，不影响「不溢出」判定。

## 未覆盖边界

- **未做逐像素视觉比对**：本轮以计算样式、几何、ARIA 与文本宽度断言为准；截图已落盘供人工复核（均在被忽略的 `test-results/m64-m65/`）：`icons-grid-zh-desktop-light.png`、`icons-grid-zh-desktop-dark.png`、`icons-grid-zh-mobile-light.png`、`icons-grid-en-desktop-light.png`、`date-picker-zh-desktop-light.png`、`date-picker-zh-desktop-dark.png`、`date-picker-zh-mobile-trigger.png`、`date-picker-zh-panel-open.png`、`date-picker-zh-override-none.png`、`input-group-select-zh-desktop-light.png`。
- **未验证构建产物 / SSG 静态 HTML**：本轮为 dev（SPA 外壳 + 浏览器内渲染）；`pnpm docs:build` 作为质量门单独运行（见「复现方式」），产物 DOM 级核对不在本 V 记录范围内。
- **InputGroup × `DatePicker` 为合成夹具**：文档站无该组合的 live demo，夹具通过注入 dev 注入样式构造（已做独立态保真度自检）；未覆盖该组合的纵向 `orientation="vertical"`、`--caomei-input-group-radius` 覆盖、聚焦抬升与键盘路径。
- **`DatePicker` 未覆盖 `size="sm" / "lg"`、`invalid` / `disabled` / `readonly` 及其余宽度 token 组合**：与本批改动（单一 `max-width` 声明）无关，未扩面。
- **未覆盖 RTL / 高对比模式 / 浏览器缩放 / 超窄视口（< 320px）**：与本批改动无关，未扩面。
- **图标名长度边界未穷举**：仅核对现有 24 项；新增更长名称时需重跑 §1.4。

## 复现方式

```bash
# 前置：pnpm docs:dev（127.0.0.1:5173）
node test-results/m64-m65-validate.mjs   # 125 项：A/B/C/D/E 全量断言，输出 test-results/m64-m65/summary.json
node test-results/m64-m65-capture.mjs    # 截图取证，输出 test-results/m64-m65/*.png
pnpm exec vitest run src/components/date-picker   # 既有用例零回归：29 / 29 通过
```

- 脚本与原始 JSON / 截图位于 `test-results/`（已 gitignore，为任务态产物）；**关键实测值以本记录为准**。
- 判定：结论 **通过**（125 / 125，失败 0；console error / pageerror / HTTP ≥ 400 均为 0）。
