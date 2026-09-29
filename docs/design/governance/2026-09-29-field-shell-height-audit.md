# 字段外壳高度契约审计与回归装置（Textarea 修复扩面）

> 状态：已完成（2026-09-29）。触发：Textarea 多行输入「内容与滚动条溢出边框」修复（提交 `658bca2`）后，对同类问题做扩面排查，并补齐防复发装置。本记录只登记**审计结论与装置落点**，不改组件行为。

## 1. 口径与受检面

**待验命题**：是否还有其他组件把「内容高度可超过单行」的内容放进固定单行高度的容器，导致内容 / 滚动条画到边框之外。

**同类根因回顾**：共享字段外壳 `src/styles/field-shell.css` 的 `.caomei-field` 基类以 `height: var(--caomei-field-height)` 表达**单行控件**契约；Textarea 未覆盖该高度，内部 `<textarea>` 按 `rows` 撑出的多行高度即越出边框。

**受检面**（19 个用例，覆盖全部字段类组件与两种尺寸档）：

| 类别 | 组件 |
| --- | --- |
| 共享外壳消费 | Textarea（md rows=2 折行 / sm rows=1 / lg rows=4）、Input、InputNumber、Select |
| 自持外壳的多值字段 | MultiSelect（8 个标签）、AutoComplete `multiple`（8 个值）、TagsInput（10 个标签） |
| 组合容器 | InputGroup（横向 Input + Select + Textarea；纵向 Input + Textarea；横向 Input + Button） |
| 其余字段 | Password、DatePicker、ColorPicker、SelectButton |
| 截断路径 | Select 超长选中项、MultiSelect / TagsInput 超长标签 |

**方法**：真实 Chromium（153）加载临时 Vite 夹具（`test/e2e/fixtures/vite.config.ts` 同源配置），以压力内容渲染后在 1024 / 390 两档视口扫描——判定「组件根边框盒之外的**在流**后代」；`position: absolute / fixed` 后代（浮层、装饰、清除按钮）与**祖先 `overflow` 非 `visible`** 的子树（省略号截断、滚动容器）不计为越界；容差 1px。

## 2. 审计结果

**结论：除已修复的 Textarea 外，无同类缺陷。** 19 个用例在两档视口均无越界（console / pageerror 均为 0）。

**多行内容确实随内容增长**（实测高度，单行档 md = 36px）：

| 用例 | 实测高度 | 高度来源 |
| --- | ---: | --- |
| MultiSelect（8 标签） | 75.7px | `min-height: var(--caomei-multi-select-min-height, …)` |
| AutoComplete `multiple`（8 值） | 72.4px | `min-height: var(--caomei-auto-complete-min-height, …)` |
| TagsInput（10 标签） | 75.6px | `min-height: var(--caomei-tags-input-min-height, …)` |
| Textarea（md rows=2 折行） | 50px | 根规则 `height: auto`（本次修复） |
| Textarea（lg rows=4） | 102px | 根规则 `height: auto` |
| InputGroup 横向（含 Textarea） | 50px | 由最高的 Textarea 成员决定 |
| InputGroup 纵向（含 Textarea） | 85px | 同上 |

**单行档保持 36px**：Input / InputNumber / Password / Select / DatePicker / ColorPicker 实测均为 36px（固定高度正确，无内容撑高需求）。

**截断路径**：Select 超长选中项由 `.caomei-select__value` 的 `overflow: hidden` + `text-overflow: ellipsis` 裁切——子树虽被测得超出字段宽度，但被祖先裁切，**不属越界**（该判定即装置中「裁切感知」的引入原因；未加该条时会产出假阳性）。

**观察项 O1（非本类缺陷，不改）**：SelectButton 在桌面视口 + 220px 窄容器下根宽 573px > 容器宽（`inline-flex` 按内容宽排布）；仅在 **≤768px 视口** 的 md 档换行（[响应式设计 §3 矩阵 #8](../responsive.md)，`select-button.vue` 的 `@media (width <= 768px)` 块）。属既定断点口径（视口驱动而非容器驱动），本批不改；若后续需要容器级收敛，另立条目。

## 3. 防复发装置

### 3.1 真实几何：字段族溢出扫描（常驻 E2E）

`test/e2e/field-overflow.e2e.ts`（8 用例 × mobile / tablet / desktop = **24 项**）：

- 受检清单 `FIELD_CASES` 为唯一事实源（含 `multiline` 标记），覆盖 Textarea 折行 / MultiSelect / AutoComplete `multiple` / TagsInput / InputGroup 横向混合 / Select 超长截断 / Input 超长文本；附**受检面下界**断言，防止清单被静默收窄后「0 越界」变成空真。
- 判定：组件根边框盒内无越界的在流内容（与上表审计同一口径，裁切感知 + 1px 容差）。
- 多行档额外断言 `height > 36px`（证明随内容增长，而非沿用单行固定高度）；单行档断言 `height ≈ 36px`。
- 夹具：`test/e2e/fixtures/app.vue` 的 `#field-overflow` 段（定宽 20rem，压力内容必然折行）。

**负向对照**：仅把 `textarea.vue` 回退到修复前版本 → `textarea 折行溢出` 与 `input-group 横向混合` 两用例失败（`底部越出容器`）；恢复后 24/24 通过。

### 3.2 声明层：共享外壳高度契约守卫（单测）

`test/contracts/field-shell.test.ts`（**9 项**）：

- 规则：模板中应用 `.caomei-field` 基类、且渲染原生 `<textarea>` 的组件，其**根类规则**必须声明 `height: auto`。
- 精细化：以「与 `caomei-field` 同处一个 class 属性的自有根类」定位根规则，**修饰类上的同名声明不算覆盖**——该边界由负向对照暴露（修复前的死规则 `.caomei-textarea--auto-resize { height: auto }` 曾让宽口径判定误通过）。
- 含 7 条正反例语料（覆盖：根规则覆盖 / 无覆盖 / 仅修饰类覆盖 / 单行控件不要求 / `__control` 与 `--size` 不算外壳消费 / 注释中的类名不算消费 / 动态 `:class` 绑定不在受检面）+ 2 条仓库现状断言（外壳消费清单恰为 Input / InputNumber / Select / Textarea 四个；零违约）。
- 契约前提锚点：断言 `field-shell.css` 基类仍以 `var(--caomei-field-height)` 表达单行高度，避免契约被静默改写。

**负向对照**：回退 `textarea.vue` → 仓库现状断言失败并给出 `根规则 \`.caomei-textarea\` 缺少 \`height: auto\` 覆盖`；恢复后 9/9 通过。

### 3.3 契约落点

- `src/styles/field-shell.css` 头部约束新增第 5 条（单行控件契约 + 多行控件须覆盖 + 守卫位置）。
- `docs/standards/development.md` §7 新增同名条目（样式规范层可见）。

## 4. 边界与未覆盖

- 未覆盖非字段族组件（DataTable / 浮层 / 布局容器）：其内容裁切与滚动由各自 `overflow` 策略承担，不属外壳高度契约面。
- **判定面边界**：E2E 装置只判「内容越出组件边框」，**不判「内容被组件自身 `overflow` 裁掉而丢失」**（后者属内容完整性，如 DataTable / 表格类另有策略）。
- **声明守卫边界**：`rootClassOf` 只识别模板中的**静态 `class` 属性**；`:class` 动态绑定 `caomei-field` 的写法不在受检面（当前无此用法，边界由语料用例固化）。
- **自持外壳字段边界**：MultiSelect / AutoComplete / TagsInput 不使用共享外壳，其「随内容增长」由 `test/e2e/field-overflow.e2e.ts` 的真实几何扫描覆盖；新增同类组件需显式加入该清单（`FIELD_CASES`），声明守卫不会自动纳入。
- 未做像素级视觉比对（几何 + 计算样式 + 声明三层已覆盖本类问题）。
- 观察项 O1（SelectButton 桌面窄容器横向溢出）未改动，属既定视口断点口径。
- 未验证「宿主页面以 `align-items: stretch` 拉高字段外壳」的泛化场景（InputGroup 已实测无越界；其他宿主属容器侧语义）。

## 5. 规模与质量门（2026-09-29 终态）

- 规模：7 文件（`test/e2e/field-overflow.e2e.ts` 新增、`test/contracts/field-shell.test.ts` 新增、`test/e2e/fixtures/app.vue`、`src/styles/field-shell.css`、`docs/standards/development.md`、本记录、`docs/design/governance/index.md` 登记）。
- 质量门：`lint:check` / `lint:css:check` / `lint:md:check` / `typecheck` / `pnpm test`（**92 文件 / 1895 例**，含契约守卫 9 例）/ `pnpm test:e2e --workers=2`（**108 项** = 既有 84 + 字段族 24）/ `capture:styles`（**245 项 0 差异**）/ `governance:check`（exit 0）全绿；`pnpm build` + `check:build` 通过。
- 装置自身断言：两处负向对照各失败一次并恢复（见 §3.1 / §3.2）。
