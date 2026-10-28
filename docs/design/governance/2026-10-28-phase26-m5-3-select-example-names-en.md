# Phase 26 M5-3 Select 示例可访问名（英文）交付记录

> 创建时间：2026-10-28
> 依据：[2026-10-26 执行期追加与 1.0 发布门禁](./2026-10-26-phase26-ui-gate-planning.md) §2.3 / §2.4；[M5-2 记录](./2026-10-27-phase26-m5-2-select-example-names-docs-axe.md) §3 / §7。
> 定位：Phase 26 M5 插队批次第 3 条的交付记录；本记录只覆盖本条，M5 收口自检（G0）由批次记录汇总。

## 1. 交付范围

- **英文 Select 示例（`docs/i18n/en-US/examples/select/`，7 文件 / 17 个触发器）**：与 M5-2 中文示例同口径，为每个 `CaomeiSelect` 补 `label`（经 `labelAttrs()` 映射为 `aria-label`），名称表达字段用途而非复述 placeholder，并与中文示例逐项语义对齐：

| 文件 | 中文示例（M5-2） | 英文示例（本条） |
| :--- | :--- | :--- |
| `basic.vue` | 水果 | Fruit |
| `clear.vue` | 水果（可清除） | Fruit (clearable) |
| `object-options.vue` | 分类 | Category |
| `option-slot.vue` | 发布状态 | Publish status |
| `sizes.vue` | `水果（小尺寸）` / `水果（中尺寸）` / `水果（大尺寸）` | Fruit (small / medium / large) |
| `states.vue` | `水果（禁用）` / `水果（校验失败）` / `水果（含禁用选项）` | Fruit (disabled / invalid / with disabled option) |
| `value-slot.vue` | `水果（value 插槽）`、`水果（value 插槽·图标）`、`水果（value 插槽·占位）`、`水果（value 插槽·小尺寸）`、`水果（value 插槽·中尺寸）`、`水果（value 插槽·大尺寸）`、`水果（value + option 插槽）` | Fruit (value slot / · icon / · placeholder / · small / · medium / · large)、Fruit (value + option slot) |

- **画廊复用**：`/en-US/components/showcase` 的 Select 卡复用 `select/basic.vue`，不额外计数；补名后该卡同时获得可访问名（M5-2 负向验证中该页的 1 处违规即此卡片）。
- **无脚本 / 结构变更**：`check-docs-axe` 的页面矩阵与下界沿用 M5-2 口径（`select-en` 17 / `showcase-en` 15），本条不新增守卫代码。

## 2. 验收核对

| 登记验收项 | 结果 | 证据 |
| --- | --- | --- |
| `/en-US/components/select` axe `button-name` 为 0 | 达成 | `check-docs-axe --pages=select-en`：受检 17，`button-name` 通过 21 / 违规 0；`scrollable-region-focusable` 通过 1 / 违规 0 |
| `/en-US/components/showcase` axe `button-name` 为 0 | 达成 | 同次全矩阵运行：受检 15，`button-name` 通过 15 / 违规 0（M5-2 负向验证时为通过 14 / 违规 1）；`scrollable-region-focusable` 通过 5 / 违规 0 |
| 中英可访问名语义对齐 | 达成 | 17 对逐项对照见 §1 表；两文件各 2 处 `option-label="name"` 为选项字段映射、非可访问名，不参与对齐 |
| 不以 placeholder 代替可访问名 | 达成 | 17 个 `label` 均不复述 placeholder；`label` 经 `labelAttrs()` 只输出 `aria-label`，不渲染可见文本 |
| 无可见布局变化 | 达成 | 仅新增 `label` 属性（`git diff --stat` = 7 文件 / 17 行新增、0 删除），无文本节点与布局参与；`label` 不渲染可见文本的落点见 `src/components/_shared/use-label-attrs.ts` 的 `labelAttrs()`（`label` 存在时只输出 `aria-label`） |

**全矩阵归零**：`node scripts/docs/check-docs-axe.mjs` 五页（data-table、select 中英、showcase 中英）× 两条 WCAG 规则 **全部 0 违规**，退出码 0——M5-2 §3 的负向验证面（英文两页 `button-name`）已收口。

## 3. 验证证据

- `pnpm docs:build`：exit 0（构建耗时 80.37s，产物 `docs/.vitepress/dist`）。
- `node scripts/docs/check-docs-axe.mjs --report=test-results/docs-axe/m5-3-full.json`：exit 0；报告 `head` = `013b647`（提交前工作区）、`distIndexMtime` = 2026-10-28T10:40:27Z。分页读数：

| 页面 | 受检元素 | `button-name`（通过 / 违规） | `scrollable-region-focusable`（通过 / 违规） |
| :--- | ---: | :--- | :--- |
| `/components/data-table` | 14 | 32 / 0 | 3 / 0 |
| `/components/select` | 17 | 21 / 0 | 1 / 0 |
| `/en-US/components/select` | 17 | 21 / 0 | 1 / 0 |
| `/components/showcase` | 15 | 15 / 0 | 5 / 0 |
| `/en-US/components/showcase` | 15 | 15 / 0 | 5 / 0 |

- `pnpm exec eslint docs/i18n/en-US/examples/select/`：exit 0。
- `pnpm typecheck:docs`：exit 0。
- 本地产物（gitignored）：`test-results/docs-axe/m5-3-full.json`。

## 4. Review Gate

- **R1（`quick`，5 分钟时间盒）：Pass**（0 blocker / 1 warning / 3 suggest）。warning：提交前索引与 todo 已指向 §4 而本节为空 → 本次回填后消解。suggest 三条同批修正：§5 的 Backlog 括注归因（改为「Backlog §1.6」）、§1 对照表中文列按示例原文抄录、§2 布局结论补 `labelAttrs()` 源码指针。
- **用时实测**：发起 `18:42:25` / 返回 `18:43:52`（宿主时间戳），实测约 1 分 27 秒，未超 `quick` 时间盒（≤ 5 分钟）。
- **复查基线**：`013b647` + 当前工作区（9 改 + 1 新增）。

## 5. 未覆盖边界

- 未验证 Firefox / WebKit 下的可访问名枚举与面板焦点行为（与 M5-2 §5 同口径）。
- 矩阵外页面（如 `/components/input-group` 的 `with-select.vue`）的示例可访问名仍不在脚本面内，已登记 [Backlog](../../plan/backlog.md) §1.6。
- 中英可访问名的「语义对齐」为逐项人工对照（§1 表），无机检；若后续新增英文示例，需同步补行对照。
- 全矩阵的最终取证由 **G0** 在 M5-4（Button hover）完成后复跑（M5-4 会改动组件样式与中英组件页，可能影响受检页）。

## 6. 教训

- **示例复用会把同一缺陷放大到两页**：`/en-US/components/showcase` 的唯一违规来自复用的 `select/basic.vue`；修示例文件同时收口两页，登记验收时应把「复用页面」一并列入核对，不能按「7 个示例文件」估算影响面。
- **对齐类交付先把对照表落成记录再改代码**：中英 17 对名称先在表中定稿再逐文件落地，使「语义对齐」的验收标准可复算（本次对齐差为 0）。
