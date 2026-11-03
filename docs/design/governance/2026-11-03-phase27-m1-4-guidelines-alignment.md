# Phase 27 M1-4 指南与设计口径同步交付记录

> 创建时间：2026-11-03
> 依据：[Phase 27 登记批次记录](./2026-11-03-phase27-registration.md) §2 M1-4；[响应式设计](../responsive.md) §3 / §4 / §5；[移动端与响应式](../../guide/mobile.md)（中英）。
> 定位：移动端与响应式二期的文档收口——把 P0 命中区与触摸密度轴的现状写进指南 / 设计口径，关闭三处旧心智表述，并回扫 token 冻结面计数。

## 1. 交付范围

- **响应式设计**：§1 非目标的「触摸目标尺寸」改为「P1 / P2 提升」，明确 P0 已由 1.1.0 提供；§5「不纳入」清单把「触摸目标」改为「P1 / P2 触摸目标提升」；决策 ① 改为「不整体提升到 ≥44px，P0 已按 WCAG 2.5.8 交付」，保留 P1 / P2 的 Backlog 触发条件。
- **移动端指南（中英）**：P0 命中区改为已完成事实；P1 / P2 明确「不在 1.1.0 范围、按 Backlog §1.5 的触发条件登记」，删除「以后续裁定为准 / stay candidates / later decision」的悬置表述；相关链接统一为「P1 / P2 触摸目标」。
- **组件页密度节（中英 17 对）**：按组件**实际受影响项**分三档表述——`控件高度 + 字号 + 内容型宽度上限`（InputNumber / Select / MultiSelect / AutoComplete / DatePicker）、`控件高度 + 字号`（Button / SelectButton / ToggleButton / TagsInput / Tag / Input / Password / Textarea）、`仅字号`（Checkbox / CheckboxGroup / RadioGroup / Message）；每页链接移动端指南的对应锚点，密度轴与 `size` 档位正交。
- **组件总览（中英）**：补跨组件能力入口——响应式断点 / 触摸密度轴 / P0 命中区统一见移动端指南，总览页不重复条款。**画廊登记表不改**：本批无新增组件，15 项 / 7 分组维持。
- **token 冻结面**：`version-policy` 中英由 **380 → 381**（156 默认声明 ∪ 290 已披露钩子，交集 65）；[冻结面终审记录](./2026-10-24-phase26-m1-1-freeze-final-review.md) §2.4 追加 2026-11-03 增量注记（`--caomei-hit-target-min` 只进默认声明集合）。

## 2. 计数与冻结面回扫

复算命令与读数（2026-11-03，`rg` / `awk` / `comm`）：

| 项 | 读数 | 核对结论 |
| :--- | :--- | :--- |
| token 默认声明 | **156** | 较 1.0 的 155 + `--caomei-hit-target-min` |
| 已披露覆盖钩子（中英「样式定制」章节） | **290 / 290** | 与 1.0 一致，本批未新增披露面 |
| 有效冻结面（去重） | **381** | 156 ∪ 290（交集 65） |
| token 消费面 | **396** | `rg` 全 `src` 去重 |
| 消费但未披露 | **106**（含默认声明 91 / 仅内部 15） | 15 个内部变量维持不冻结 |
| `--caomei-hit-target-min` 归属 | 仅默认声明集合 | 未进入组件页「样式定制」披露面，故有效冻结面 +1 |

- 逐项 `rg` 核对：`--caomei-hit-target-min` 仅出现在 `tokens-defined.txt`，不在 `tokens-documented.txt`；`docs/guide/version-policy.md` 与英文版的「381 / 156 / 290」一致。
- 历史记录中的 380 / 371 为写录时点快照，**不回改**；当前口径只以 `version-policy` 与冻结面终审记录的增量注记为准。

### 2.1 组件页受影响项取证

| 页面（中英各一份） | 密度轴实际影响 | 取证位置 |
| :--- | :--- | :--- |
| InputNumber / Select / MultiSelect / AutoComplete / DatePicker | 控件高度 + 字号 + 内容型宽度上限 | token 声明在 `src/styles/theme.css`；InputNumber / Select 经 `.caomei-field`（`field-shell.css`），MultiSelect / AutoComplete / DatePicker 在自身文件直读；宽度上限为 `--caomei-{input-number,multi-select,auto-complete,date-picker}-max-width` / `--caomei-select-max-width` |
| Button / SelectButton / ToggleButton / TagsInput / Tag | 控件高度 + 字号 | `src/components/<name>` 内的 `--caomei-control-height-*` / `--caomei-font-size-*` |
| Input / Password / Textarea | 控件高度 + 字号 | `.caomei-field` 基类（`field-shell.css`） |
| Checkbox / CheckboxGroup / RadioGroup / Message | 仅字号 | `src/components/<name>` 内的 `--caomei-font-size-*`（不读 `control-height` / 宽度上限） |

**未纳入的尺寸节**：Avatar / Dialog / Drawer / ProgressBar / ProgressSpinner 的「尺寸」描述自身边长 / 宽高 / 粗细，密度轴不改变该契约；Icons 的「尺寸」是图标字形大小，FileUpload 中英页的「大小上限 / Size limit」是文件大小上限，均与控件密度无关。

## 3. 旧心智表述关闭

| 旧表述 | 位置 | 处置 | 回扫 |
| :--- | :--- | :--- | :--- |
| 「不纳入触摸目标」 | `responsive.md` §1 非目标 / §5 不纳入表 | 改为「P1 / P2 提升」并注明 P0 已交付 | 0 |
| 「以后续裁定为准」 | `mobile.md`（中） | 改为「P0 已交付；P1 / P2 不在 1.1.0，按 Backlog 触发条件登记」 | 0 |
| 「stay candidates / later decision」 | `mobile.md`（英） | 同中文口径改写 | 0 |

回扫命令：`rg -n "不纳入触摸目标|后续如需提升|以后续裁定为准|later decision|stay candidates in Backlog" docs/design/responsive.md docs/guide/mobile.md docs/i18n/en-US/guide/mobile.md` → **0 处**。

## 4. 验证证据

- `pnpm docs:check` → **exit 0**（integrity / links / structure / config-links / i18n-parity / version / interpolation / example-refs / showcase / demo-external-images / line-count / i18n-old-dirs）。
- `pnpm docs:check:structure` → OK（全部页面锚点与 VitePress slug 一致；新增英文锚点已按 `/en-US/guide/mobile#...` 校正）。
- `pnpm check:components-overview` / `pnpm docs:check:showcase` → 通过（15 项登记 / 7 分组未变）。
- `pnpm lint:md:check` → exit 0。
- `pnpm governance:check` → exit 0（含 `check:governance-counts` 常量引述对账）。
- `pnpm docs:build`（随 `pnpm verify`）→ exit 0。

## 5. Review Gate

- **audit-depth**：`standard`（指南 / 设计口径 / 组件页 / 版本承诺计数；时间盒 ≤ 10 分钟）。
- **R1（`standard`）：`Reject`**（1 blocker / 2 warning / 2 suggest）。
  - **RG-B1 4 对组件页的密度说明与源码不一致**（Checkbox / CheckboxGroup / RadioGroup / Message 只受字号影响，原句却承诺控件高度与宽度上限）→ 按实际受影响项分三档：`控件高度 + 字号 + 内容型宽度上限`（5 对）/ `控件高度 + 字号`（8 对）/ `仅字号`（4 对）；记录 §2.1 增列逐页取证位置。
  - **RG-W1 覆盖集合不穷尽** → 补 MultiSelect / TagsInput / Tag / DatePicker / AutoComplete 5 对（共 17 对）；排除项与理由写入 §2.1 / §6。
  - **RG-W2 `todo.md` 状态仍「待执行」** → 改为「已完成」。
  - **suggest 已采纳**：`theming.md` §5.2 的「P1 / P2 仍待后续批次」改为与移动端指南一致的登记条件表述；索引摘要去旧短语原文；记录 §4 不再写死页面数。
- **R2（`quick` delta）：`Pass`**（0 blocker / 0 warning / 3 suggest）。
  - **suggest 已采纳**：§2.1 取证表补「token 声明在 `theme.css`、MultiSelect / AutoComplete / DatePicker 在自身文件直读、宽度上限 token 名」；FileUpload 排除项改为「中英页的大小上限 / Size limit」；4 对页面新增句后的双空行压缩为单空行。
- **复查基线**：HEAD `3529475` + 当前工作区。

## 6. 未覆盖边界

- 组件页密度节覆盖 **17 对控件页**（见 §2.1 的分档与取证）；Avatar / Dialog / Drawer / ProgressBar / ProgressSpinner / Icons / FileUpload 的尺寸节描述自身边长 / 宽高 / 粗细 / 文件大小，密度轴不改变该契约，故不加注。
- 未新增密度轴示例；演示仍以移动端指南的 `docs/examples/mobile/density.vue` 为唯一入口。
- 未改画廊登记表（无新增组件）；也未新增 Storybook / 多版本托管。
- 英文指南的 P1 / P2 说明沿用中文源的事实口径，措辞级差异不在 `check-i18n-parity` 门禁面内。
- `1.1.0` 尚未发布（`package.json` 仍 `1.0.0`）；指南中「1.1.0 起提供 / 已交付」为随发布兑现的前瞻口径，发布后由 M5-1 统一兑现。
