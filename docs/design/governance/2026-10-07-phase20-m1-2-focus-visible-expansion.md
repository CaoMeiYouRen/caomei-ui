# Phase 20 M1-2：焦点可见扩面补全

> 创建时间：2026-10-07
> 关联条目：[待办归档](../../plan/todo-archive.md) Phase 20 **M1-2**（测试装置与覆盖扩面）
> 依据：Phase 19 M1-4 的「未纳入面」——焦点可见扩面仅覆盖 5 个非字段 / 非按钮组件，其余约 30 个含 `:focus-visible` 的文件未纳入（[2026-10-05 P3 几何 / 交互层装置](./2026-10-05-phase19-m1-4-geometry-interaction-devices.md) §5）
> 快照：本仓工作区（`test:e2e` 276 passed、`pnpm verify` exit 0）；**未推送**

---

## 1. 结论

- 焦点可见受检面由 **5 项扩到 31 项**（新增 **26 项**），覆盖非字段 / 非按钮组件与带清除 / 关闭按钮的字段族子元素。
- 扩面只纳入**静态可驱动**者（无需交互开合即可渲染出焦点目标）；需交互开合 / box-shadow 焦点环的形态**显式登记边界**（§4）。
- 新增「受检面下界守卫」（`MIN_FOCUS_TARGETS = 31`），防止受检范围被静默收窄。
- 负向对照：回退 3 个代表组件的焦点环（`outline: none`）→ **9 处失败**（3 组件 × 3 视口）；还原后全绿。
- 本批**零 `src/**` 改动**（负向对照的临时改动已还原）；常驻 E2E 由 **195 增至 276 passed**（+26×3 目标 + 3 下界守卫）。

---

## 2. 受检面变更（逐项有据）

### 2.1 新增目标（26 项，均取自 `src/**` 的 `:focus-visible` 规则选择器）

| 分类 | 目标（夹具 `data` / id → 选择器） |
|:---|:---|
| 组件内部控件（非字段输入本体） | ToggleButton（`.caomei-toggle-button`）/ RadioButton（`.caomei-radio-button`）/ Slider 滑块（`.caomei-slider__thumb`）/ Stepper 触发器（`.caomei-stepper__trigger`）/ Paginator 控件（`.caomei-paginator__control`）/ ToolbarButton（`.caomei-toolbar__button`）/ ToolbarLink（`.caomei-toolbar__link`）/ Popover 触发器（`.caomei-popover__trigger`）/ DropdownMenu 触发器（`.caomei-dropdown-menu__trigger`）/ ColorPicker 触发器（`.caomei-color-picker__trigger`）/ FileUpload 拖放区（`.caomei-file-upload__dropzone`）/ FileUpload 按钮（`.caomei-file-upload__button`）/ Password 切换（`.caomei-password__toggle`）/ Tag 关闭（`.caomei-tag__close`）/ Tag 可选中（`.caomei-tag--selectable`）/ Message 关闭（`.caomei-message__close`）/ Tabs 面板（`.caomei-tabs__content`） |
| 字段族子元素 | MultiSelect 标签移除 / 清空（`__tag-remove` / `__clear`）/ AutoComplete 清空 / 下拉触发器（`__clear` / `__trigger`）/ TagsInput 清空（`__clear`）/ Select 清空（`__clear`） |
| 既有夹具复用 | Calendar 导航 / 日期（`#calendar-inline`）/ DataTable 排序（`#data-table-sort-width`） |

### 2.2 判别力前置守卫

- 强制 `:focus-visible` **前**断言 `outline-style === 'none'`（沿用既有口径）：若组件改为常驻描边、或选择器拼写失效，前置守卫即失败。
- 强制**后**断言 `outline-style ≠ 'none'`、`outline-width === '2px'`、`outline-color` 可辨。
- 全部 26 项由运行器首轮实测通过（选择器均命中、前置守卫均成立）。
- **下界守卫语义边界**：`MIN_FOCUS_TARGETS` 只防「删除项导致受检面收窄」（数量下界），不感知「删 1 加 1」的等量替换；逐项冻结需改用名称集合快照式断言（当前不采用）。

---

## 3. 夹具与规格改动

| 文件 | 改动 |
|:---|:---|
| `test/e2e/fixtures/app.vue` | 新增 `#focus-visible-expansion` 段（26 个焦点目标的可静态渲染形态）+ 预置状态（Radio / Slider / Stepper / ColorPicker / Password / MultiSelect / AutoComplete / TagsInput / Select 的值）+ 容器样式 |
| `test/e2e/focus-visible-expansion.e2e.ts` | `FOCUS_TARGETS` 由 5 扩到 31；新增「受检面下界守卫」用例（`MIN_FOCUS_TARGETS = 31`）；更新规格头部说明与边界 |

- 夹具**追加在末尾**（不打断既有 DOM 顺序约定）；新组件均为短内容 + 容器 `width: min(20rem, 100%)`，窄视口不产生页级横向溢出。

---

## 4. 未纳入面与边界（显式）

- **需交互开合**：Dialog / Drawer / Toast / ColorPicker 面板内元素 / 图片预览层 / FileUpload 移除按钮 / DataTable 行分组与展开触发器 —— 焦点目标仅在打开模态、浮层或预置结构后出现，纳入会引入交互时序依赖。
- **box-shadow 焦点环**：DatePicker 触发器、Select 触发器（`outline: none` + `box-shadow`），既有 `outline` 口径断言不适用；Select 触发器的聚焦态已由采集装置 `state.select:focus` 承载。
- **导航 / 键盘滚动类**：ButtonGroup 成员（焦点环由 Button 自身规则提供，已由采集装置 `button-focus.*` 承载）不在本批重复纳入。
- 上述边界对应 `src/**` 中其余含 `:focus-visible` 的文件；如后续需要，按同一扩面手法分批纳入。

---

## 5. 判别力（负向对照）

对 3 个代表组件（形态各异：非字段开关类 ToggleButton、工具条链接 ToolbarLink、文件上传拖放区）把焦点环规则回退为 `outline: none`：

| 对照 | 回退内容 | `playwright test focus-visible-expansion` 结果 |
|:---|:---|:---|
| ToggleButton / ToolbarLink / FileUpload 拖放区 | 三者 `:focus-visible` 的 `outline: 2px solid …` → `outline: none` | **9 failed**（3 组件 × mobile / tablet / desktop），失败点为「强制后应呈现描边」 |

- 还原后 `git diff -- src/` 为空、规格复跑 **全绿**（31 目标 × 3 视口 + 3 下界守卫 = 96 passed）。

---

## 6. 规模、质量门与 Review Gate

- **规模**：2 文件（`test/e2e/fixtures/app.vue` +188 / `test/e2e/focus-visible-expansion.e2e.ts` +43 −2）+ 文档载体（本记录 + 治理索引 + `todo.md` 状态回填）。**零 `src/**` 改动**。
- **质量门（本批实测）**：
  - `pnpm test:e2e --workers=2` → **276 passed**（既有 195 + 本批 81 = 26×3 + 3），零回归。
  - `pnpm verify` **exit 0**（`lint:check` / `lint:css:check` / `lint:md:check` / `typecheck` / `typecheck:docs` / `test` **110 文件 / 2203 例** / `build` / `check:build` / `check:resolver` / `check:nuxt` / `docs:build` / `docs:check:i18n-routing` / `governance:check` 全绿）。
  - 负向对照 **9 处失败**、还原后全绿（§5）。
  - `check:planning-numbers` **0 命中**（新增注释 / 用例名无规划编号）。
- **V 阶段**：本批为**测试装置扩面**，浏览器侧证据由新增常驻 E2E 在真实 Chromium（三视口）中承载；未改 `src/**`、无可见 UI 行为变更，故不另走 `@ui-validator`。
- **Review Gate**：见 §7；本地留痕 `artifacts/review-gate/2026-10-07-phase20-m1-2-focus-visible-expansion.md`。

## 7. Review Gate 结论

- **R1（第 1 轮，`standard`）`Pass`**：0 blocker / 0 warning / 4 suggest。审计方独立复核 26/26 选择器与 `src/**` 的 `:focus-visible` 规则逐一对应、26/26 规则均为 `outline: 2px solid …`、`FOCUS_TARGETS` 计数 31 = `MIN_FOCUS_TARGETS`、夹具渲染前置条件（`showClear` / `clearable` / `dropdown` / `closable` / `selectable` / FileUpload 两形态）均满足、`check:planning-numbers` 0 命中、`check:governance-records` / `check-docs-integrity` exit 0、`src/**` diff 为空。
- **实测用时**：派发 `2026-10-07T21:28:26+08:00` → 返回 `2026-10-07T21:31:14+08:00`，**≈ 2 分 48 秒**（≤ 10 分钟时间盒，未超）。
- **同批收口（记「已修复未复审」）**：
  - **RG-S1**（`describe` 标题滞后于受检面）：改为「静态可驱动组件（非字段 / 非按钮 + 字段族子元素）」。
  - **RG-S2**（§2.1 分类标签精度）：首行标签改为「组件内部控件（非字段输入本体）」。
  - **RG-S3**（下界守卫对等量替换盲区）：§2.2 补守卫语义边界说明（仅防数量下界，逐项冻结需快照式断言）。
  - **RG-S4**（§6 预引用 artifact）：本批收口时同步写入 `artifacts/review-gate/2026-10-07-phase20-m1-2-focus-visible-expansion.md`。
- **未覆盖边界**（采信调用方证据）：审计方未重跑 `pnpm test:e2e` / `pnpm verify`、未复现负向对照、未逐项浏览器实测 `before` 守卫；以选择器映射、渲染前置条件静态核验与调用方 276 passed 证据交叉佐证。
