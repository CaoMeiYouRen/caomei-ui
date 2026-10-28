# Phase 26 G1 裁定与 G1-F 颜色角色修复交付记录

> 创建时间：2026-10-28
> 依据：[Phase 26 执行期追加与 1.0 发布门禁](./2026-10-26-phase26-ui-gate-planning.md) §4.1 / §4.2；[Refactoring UI 自检](./2026-10-26-refactoring-ui-self-check.md) §4.1 / §4.2。
> 定位：1.0 门禁 **G1 裁定**与条件门禁 **G1-F** 的交付记录；不占 Phase 26 原子条目计数。

## 1. G1 裁定

- 用户 2026-10-28 在评估第 2 档「颜色角色分层与非文本对比度」的现状与优先级后，**裁定「修复」**。
- 范围按 §4.2 的三项：**tone 文本角色**、**控件边界角色**、**全预设矩阵断言**；相邻的 `caomei` / `momei` `text-muted` 缺口同批收口。
- G1 于裁定完成时关闭，转入 **G1-F**；G1-F 关闭前不得发 `1.0.0`。Backlog 候选行与 `todo.md` 的条件候选指针同批移除。

## 2. 实现

### 2.1 新增 token（6 个公开角色 token；另新增 3 个组件级默认声明，属向后兼容增量）

| token | 语义 |
| --- | --- |
| `--caomei-color-primary-text` | primary 的文字安全前景（soft / outline / 文本型消费点） |
| `--caomei-color-success-text` | success 同上 |
| `--caomei-color-warning-text` | warning 同上 |
| `--caomei-color-danger-text` | danger 同上 |
| `--caomei-color-neutral-text` | neutral 同上（替代原先直接消费 `text-muted` 的路径） |
| `--caomei-color-control-border` | 交互控件边界（≥ 3:1），与装饰性 `border` 分离 |

- 取值矩阵（6 预设 × 明暗）见 [设计规范 §2.2](../design-spec.md)；有效冻结面由 **371 → 380**（155 默认声明 ∪ 290 披露钩子，交集 65），同步更新 `version-policy` 中英与 M1-1 记录的时点注记。
- `caomei` / `momei` 的 `text-muted` 亮色提升到 `#5b6675` / `#565d6b`（`bg` 与 `bg-elevated` 均 AA）。

### 2.2 消费点切换

- **文本**：Tag / Badge / Message（含 Alert）的 soft / outline / simple 文本与描边；Button 的文字型变体与 focus 环；toast action、分页当前页、菜单 / 选择器激活项、Tabs 激活项、Breadcrumb hover、Stepper 激活 / 完成态、FloatLabel 聚焦与校验标签、确认框危险文本、上传错误文本等 `color:` 消费点。
- **控件边界**：`field-shell`（Input / Textarea / Select 家族 / DatePicker / TagsInput / AutoComplete）、Checkbox、Radio、Switch（描边与未选中轨道）、Slider 轨道、SelectButton、DropdownMenu / Popover 触发器、ColorPicker 触发器、FileUpload 选择区、Paginator、Stepper 指示器。
- **不改**：装饰性分隔线（表格 / 卡片 / 面板 / Divider / Tabs / Toast 面板描边等）继续用 `--caomei-color-border`；`-solid` 实底与 `on-solid` 配对不变。

### 2.3 矩阵断言

- 新增 `test/e2e/preset-contrast.e2e.ts`（常驻）：6 预设 × 明暗 × **2 种背景**（`bg` / `bg-elevated`）× 21 条文本（5 语气 × soft / outline × Tag / Message + 1 条 `text-muted`）+ 4 条控件边界（Input / Checkbox / Switch / Slider）；文本 ≥ 4.5:1（裕度 0.04）、边界 ≥ 3:1（裕度 0.05）；带键集合下界与「12 档 primary 互不相同」正向对照。另含 axe `color-contrast` 复核（Tag / Message，6 预设 × 明暗 × 2 背景）。

## 3. 验收核对

| 登记验收项 | 结果 | 证据 |
| --- | --- | --- |
| tone 文本 6 预设 × 明暗 × 5 语气 × soft / outline ≥ 4.5:1 | 达成 | `preset-contrast.e2e.ts` 通过（21 条/档 × 24 档，含 `bg` / `bg-elevated`）；同 spec 内 axe `color-contrast` 对 Tag / Message 6 预设 × 明暗 × 2 背景**零违规**（可复现） |
| 控件边界 6 预设 × 明暗 ≥ 3:1 | 达成 | 同套矩阵 4 条边界逐档通过（裕度 0.05） |
| solid 与 `-solid` 不回退 | 达成 | `-solid` 配对未改动；`caomei` `primary-solid` 的 4.17 例外按既有品牌裁定保留并登记 |
| `capture:styles` 仅预期差异 | 达成 | 首轮 226 + 修复轮 10，共 236 处差异全部为颜色属性（color / outline-color / border-color / background-color），无几何属性；冻结后 349 项 0 差异 |
| 视觉基线按实际差异重冻结 | 达成 | 受影响面重冻结后 `test:visual` 33 passed；Tag / Checkbox / Radio 受 `maxDiffPixels` 容差约束，颜色类回归的主责证据为 `capture:styles` |
| 文档 / 规划同步 | 达成 | design-spec §2.2 / §3.2 / §5 / §6、theming、version-policy 中英、受影响组件页的中英「样式定制」默认值、M1-1 时点注记 |

## 4. 验证证据

- `pnpm test` → **142 文件 / 2750 passed**。
- `playwright test --project=desktop` → **133 passed**（含新增矩阵 2 例：对比度矩阵 + axe 复核）。
- `pnpm test:a11y` → **67 passed**；`pnpm test:visual` → **33 passed**（Tag / Checkbox / Radio 的 6 张小组件基线已显式删除后重建，避免容差吞掉颜色变化）。
- `pnpm capture:styles` → **349 项 0 差异**（首轮冻结前 226 处、修复轮后再 10 处，全部为颜色属性，无几何；逐项见 diff 输出）。
- `pnpm build` / `check:build` / `typecheck` / `typecheck:docs` / `stylelint` / `eslint` / `lint:md` / `docs:build` / `docs:check` / `governance:check` → 全 exit 0。
- axe 复核已常驻在 `preset-contrast.e2e.ts`（`axe-core` 注入，Tag / Message × 6 预设 × 明暗 × 2 背景）→ `color-contrast` **零违规**。

## 5. Review Gate

- **R1（`standard`，5 分区并行，75 文件 > 8）**：A（token + 设计文档）**Reject** / B（tone 文本运行时）Pass（附 2 个跨分区 blocker）/ C（控件边界运行时）**Reject** / D（测试与证据）Pass / E（规划与治理）**Reject** → 合并 **Reject**（4 blocker / 6 warning）：
  - A-B1 `momei` 亮色 `text-muted` 未落地但文档声称已修复；
  - A-B2 / E-B1 token 冻结面计数错误（实为 155 / 290 / 380 / 交集 65，文档写 152 / 288 / 交集 64 / 并集 377）；
  - B-B1 tone 文本漏改 6 类消费点（Tabs / Menu / Breadcrumb / Stepper / FloatLabel）；
  - C-B1 3 处 `border-color` 误换 `-text` 角色（AutoComplete / MultiSelect / Paginator）；
  - E-B2 G1-F-2 的 `bg-elevated` 断言与「视觉重量变化披露」未落实但已标完成。
  - warning：Button `secondary` 描边角色变更未披露、同族聚焦描边两套颜色、axe 证据不可复现、视觉基线 3 个小组件面未重冻结、`bg-elevated` / 选中态覆盖不足、`button.md` 与 `.session` 指针陈旧。
- **修复（R1 → R2）**：`momei` `text-muted` 落地 `#565d6b`；token 计数按复算更新为 **380 / 155 / 290 / 交集 65**（6 个公开角色 token + 3 个组件级默认声明；`tag-text` / `badge-text` 在组件页正文披露用法、`message-text` 为内部默认声明）；6 类漏改消费点全部切 `-text`；3 处误换 `border-color` 回退 `primary`；FileUpload 内部按钮边界补 `control-border`；矩阵扩展为 **2 种背景 × 21 条文本 + 4 条边界**（含 `text-muted`）、增加键集合与 12 档 primary 正向对照、axe 复核常驻同 spec；Tag / Checkbox / Radio 的 6 张小组件基线删除后重建；`design-spec` 补 Button 边界与「可见外观变化」披露；`button.md` 陈旧 Backlog 指针改为 G1-F 完成表述。
- **R2（`quick` delta）：Reject**（1 blocker / 2 warning / 1 suggest）：披露钩子实际为 **290 / 交集 65**（载体写 289 / 64）；Message 页未披露 `--caomei-message-text`（已改为「内部默认声明」叙述）；M1-1 注记算术不完整；axe 仅跑 `bg`；§3 capture 措辞。已同批修复。
- **R3（`quick` delta）：Pass**（0 blocker；2 warning / 3 suggest）。剩余 warning 收口：R2 / R3 轮次回填（本节）、M1-1 的披露口径改为「样式定制章节（含说明文字）」并在增量注记解释 `290 = 288 + control-border + neutral-text`；suggest 采纳：spec 标题补「2 背景」、M1-1 复算命令补交集命令与当前值注释、旧错误值补交集 64。
- **复查基线**：`1086d35` + 当前工作区（token / 组件 / 测试 / 文档 / 规划）。

## 6. 未覆盖边界

- 品牌预设的 `-solid` 配对只做「不回退」核对：`caomei` `primary-solid` 4.17 为既有品牌例外（用户裁定保留），未在本批提升。
- 禁用态按 WCAG「非活动控件」豁免，未纳入 4.5:1 断言；视觉上沿用 `--caomei-disabled-opacity`。
- 非文本 3:1 只覆盖登记的交互控件边界；装饰性分隔线、图标与插画不在此断言面内。Calendar 上 / 下月导航按钮与 RichTextEditor 容器描边仍属可交互边界、对比度未达标，未纳入本批（记录为后续候选）。
- 未验证 Firefox / WebKit 的 `color-mix()` 与自定义属性解析（与既有装置同内核口径）。
- 消费方自定义 `--caomei-*` 覆盖后的对比度由使用方负责。

## 7. 教训

- **角色拆分的迁移面必须按「消费语义」而不是按 token 名清点**：`color:` 与 `border-color:` 同用 `<tone>`，只改其中一类会留下半数失败；先按“文本 / 边界 / 填充”分类，再逐消费点替换。
- **软底对比度不能只按 8% 公式推算**：抬升面（`bg-elevated`）会再降一档，矩阵必须同时对 `bg` 与 `bg-elevated` 合成后再判定。
- **环状派生要有上界校验**：`-text` 取色相深阶后仍需在白底 / 彩底 / 透明底三类合成面上复算，单看纯白底会漏掉抬升面与 soft 底的组合。
