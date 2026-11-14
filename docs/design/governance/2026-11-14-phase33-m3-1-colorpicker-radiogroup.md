# Phase 33 M3-1：ColorPicker 色板 `radiogroup` 导航增强

> 创建时间：2026-11-14
> 触发：用户「继续推进剩余条目」。范围与验收口径见 [Phase 33 登记批次](./2026-11-13-phase33-registration.md) §2 的 M3-1 行。

## 1. 变更

| 项 | 内容 |
|:---|:---|
| `src/components/color-picker/color-picker-panel.vue` | 色板容器 `role="group"` → `role="radiogroup"`；每个色块 `<button>` 增 `role="radio"` + `aria-checked`；新增 roving tabindex（选中项 0，其余 -1）与 `keydown` 处理（方向键循环 / Home / End，移动即选中并转移焦点）；选中态 CSS 选择器 `[aria-pressed='true']` → `[aria-checked='true']` |
| 单测 | `color-picker.test.ts`：色板单选组语义 / roving tabindex 断言，新增「方向键 / Home / End 移动并选中、焦点随目标项」「反向 / 上下方向键与未命中回落」「归一后重复色板去重」用例；既有 `aria-pressed` 断言改为 `aria-checked` |
| E2E | 新增 `test/e2e/color-picker-swatches.e2e.ts`（真实 Chromium）：Tab 单停靠点、方向键 / Home / End 焦点与选中、首尾循环、选中态 `outline` 计算样式 |
| 文档 | 组件页中英（`swatches` 说明、无障碍、键盘操作、已知限制）、`design-spec.md` 两处、`design/components.md` 色板行 |
| 公共 API | **无变更**（仅 DOM 语义与键盘行为） |

## 2. 键盘模型

- 方向键（右 / 下前进、左 / 上后退，首尾循环）与 Home / End 在组内移动，**移动即选中**（ARIA radiogroup 单选语义），焦点同步到目标色块。
- roving tabindex：组内只有一个可 Tab 进入的色块（当前选中项；未命中任何色块时为首项），Tab 不会逐块遍历。
- `disabled` 时不处理键盘事件。

## 3. 验证

| 项 | 命令 | 结果 |
|:---|:---|:---|
| 组件单测 | `pnpm exec vitest run src/components/color-picker` | **35 passed** |
| 真实浏览器 E2E | `pnpm exec playwright test test/e2e/color-picker-swatches.e2e.ts` | **3 passed**（三视口）：Tab 落在选中项且组内唯一 `tabindex=0`；方向键 / Home / End 焦点与选中同步；首项 ArrowLeft 回绕末项；选中项 `outline: 2px solid`、未选中 `outline-style: none` |
| 可访问性 | `pnpm test:a11y` | 68 passed（**注**：a11y 夹具未展开带色板的面板，不构成本条色板语义证据；色板语义由单测 + E2E 覆盖） |
| 计算样式 | `pnpm capture:styles` | 0 差异（399 项；**色块不在采样面内**，不能作为选中态视觉等价证据；选中态改挂 `aria-checked` 的可见样式由 E2E 计算样式断言覆盖） |
| 类型检查 | `pnpm typecheck` | exit 0 |
| 静态检查 | `pnpm exec eslint`（改动源文件） | 零 error |

## 4. 文档回扫面

- `docs/components/color-picker.md`：`swatches` 说明、无障碍（`aria-pressed` → `radiogroup` + `aria-checked` + roving）、键盘操作、已删除「色板不支持方向键」限制。
- `docs/i18n/en-US/components/color-picker.md`：同四点。
- `docs/design/design-spec.md:287`（ColorPicker 行：选中态 `aria-pressed` → `aria-checked` + `radiogroup` + roving）与 `:326`（迁移映射：自建 `role="group"` + `aria-pressed` → `radiogroup` + `aria-checked`）。
- `docs/design/components.md` ColorPicker 行：「色板自建按钮组」→「色板自建单选组」。
- `docs/components/color-picker.md:3` 首段、`docs/i18n/en-US/components/color-picker.md:3` 首段、`docs/components/index.md:42` 总览行：同步为「自建单选组（`radiogroup` + `aria-checked`）」。
- 源码文档复核：`rg "aria-pressed" docs/components docs/i18n docs/design` 仅剩 Password / SelectButton / ToggleButton 等其它组件（与本条无关）。

## 5. 边界

1. 方向键**改变选中值**（单选语义）；如果使用方希望「只移焦点不改值」，需改用其它模式，本批不提供开关。
2. 不改变色板尺寸 / 颜色；`aria-checked` 取代 `aria-pressed` 属可访问性语义修正，可见选中环仍由同一条规则提供（E2E 断言 `outline`）。
3. 归一后重复的色板（如 `#0f0` 与 `#00ff00`）做去重，避免 radiogroup 出现多个 `aria-checked="true"`；`aria-checked` 按选中索引比较而非色值相等。
4. 不新增公共 prop / slot / 事件；`ColorPicker` 类型导出不变。
5. `disabled` 键盘守卫属**不可达防御分支**（原生 disabled 按钮不派发 keydown），未写用例。
6. 键盘模型与 DOM 语义变化需在 `1.3.0` release note 记录（由 M5-1 统一落盘 `docs/release-notes/1.3.0.md`，`todo.md` 的 M5-1 行已加锚点）：色板由 `role="group"` + `aria-pressed` 改为 `radiogroup` + `role="radio"` + `aria-checked`，Tab 由逐块遍历改为单停靠点。

## 6. Review Gate

- **审计声明**：R1 `standard` / R2 `standard`（修复含代码与新增 E2E）；单分区；R1 时间盒 ≤10 分钟。
- **R1：`Reject`**（1 blocker / 3 warning / 3 suggest）
  - blocker：交互类改动缺真实浏览器验证；`capture:styles` 的色板采样面**不含色块**、a11y 夹具**不展开带色板面板**，两项替代证据均不覆盖被改面 → 新增 `color-picker-swatches.e2e.ts`（Tab / 方向键 / Home / End / 首尾循环 / 选中态计算样式），三视口通过。
  - warning：组件页首段与总览页仍写「按钮组」→ 已统一；单测未覆盖反向 / 上下方向键 / 未命中回落 → 已补；记录与索引的 `capture:styles` 结论超出证据能力 → 已改写并改用 E2E 断言。
  - suggest：归一后重复色值会产生多个 checked → 已去重并改按索引判定；冗余断言与不可达 disabled 分支 → 已删除冗余步骤并保留防御性注释；release note 需写明 DOM 属性改名 → 已写入 §5.4。
- **R2：`Pass`**（0 blocker / 0 warning / 6 suggest）
  - B1 / W2 / W3 / W4 / S5 / S6 / S7 复核结论：B1 由 E2E 真实浏览器断言关闭（旧实现必失败）；W2 组件页 / 总览 / 英译关闭，设计规范句尾残留「按钮组」已改「色块按钮集合」；W3 三条分支补测，`disabled` 降级为不可达防御分支并注明；W4 `capture` 口径已与基线事实对齐（399 项、0 个 swatch 键）。
  - 新增 suggest 处置：E2E 增加「停靠点归属项」与「边框色随 `aria-checked` 变化」断言（避免焦点环兜底）；`activeSwatchIndex` 限定在组内；重复色板去重；记录 §5 编号与 release note 锚点（`todo.md` M5-1 行）已补。
- **复查基线**：本记录 §1 ~ §5；`color-picker-panel.vue`（色板段）；`color-picker.test.ts`（色板用例）；`test/e2e/color-picker-swatches.e2e.ts`；组件页中英与总览页；`design-spec.md` 两处。
- **复查基线**：本记录 §1 ~ §5；`color-picker-panel.vue`（色板段）；`color-picker.test.ts`（色板用例）；`test/e2e/color-picker-swatches.e2e.ts`；组件页中英与总览页；`design-spec.md` 两处。
