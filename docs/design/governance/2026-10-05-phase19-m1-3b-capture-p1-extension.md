# Phase 19 M1-3b：capture 扩采样（§6 P1 约定 + 登记点名项）

> 创建时间：2026-10-05
> 关联条目：[待办事项](../../plan/todo.md) Phase 19 **M1-3**（设计一致性口径裁定与守卫落地；本记录为子批 **3b**）
> 依据：[Phase 18 M3-1 评估 §5](./2026-10-01-phase18-m3-1-design-consistency-evaluation.md) P1 / [设计规范 §6](../design-spec.md)
> 边界：只扩**计算样式采集装置**（`test/capture/**`）与其冻结基线；零 `src/**` 改动、零色值变更。

---

## 1. 结论

- 按用户裁定「完整并集」落地 capture 扩采样：**§5 P1 五项**（card / data-table / password / message.simple / tag--rounded）+ **登记点名项**（button--rounded / calendar / color-picker / split-button）。
- 采样面 **270 → 297（+27）**；另扩 `panel.date-picker`（补面板圆角）与 `panel.color-picker`（补圆角 / 阴影 / 宽度）属性。
- `capture:styles` **297 项 0 差异**；**负向对照**分两组回注（3b-1 五组 18 处 / 3b-2 四组 4 处，共 **9 组**），还原后 0 差异。

## 2. 新增采样项（+27）

| 分组 | 键 | 属性 | 实测值（亮，1280×800） |
| --- | --- | --- | --- |
| Card | `card.{outlined,elevated,filled}` | 背景 / 圆角 / 描边 / 阴影 | outlined `bg` + `1px border`；elevated `bg` + `shadow-sm`；filled `bg-elevated`；圆角 `12px` |
| Card 内边距 | `card.{...}.body` | `padding-top` / `padding-left` | `0px` / `16px`（有 header 时 `padding-top: 0` 邻接规则） |
| Tag | `tag.rounded` | 圆角 | `999px`（`radius-full`） |
| Message | `variant.message.{5 tone}.simple.padding` | `padding-top` / `padding-left` | `0px` / `0px`（`simple` 不消费内边距） |
| Password | `password.{weak,medium,strong}.meter` | 高度 / 圆角 | `4px` / `999px` |
| Password | `password.{weak,medium,strong}.fill` | 背景 | `danger`·`warning`·`success`（`rgb(220,38,38)` / `rgb(180,83,9)` / `rgb(21,128,61)`；**宽度有意不采样**，见下） |
| DataTable | `data-table.th` / `data-table.td` | `border-bottom-color` | `rgb(229,231,235)`（`border`） |
| DataTable | `data-table.sort-icon` | `color` | `rgb(107,114,128)`（`text-muted`） |
| Button | `button.rounded` | 圆角 | `999px`（`radius-full`） |
| Calendar | `calendar.selected` | 背景 / 前景 | `rgb(37,99,235)` / `rgb(255,255,255)`（`primary` / `primary-foreground`） |
| Calendar | `calendar.today` | 描边宽 / 色 | `1px` / `rgb(229,231,235)`（`border`；选择器排除 `[data-selected]` 组合态） |
| ColorPicker | `color-picker.trigger` | 宽 / 高 / 圆角 | `36px` / `36px` / `8px`（方形 + `radius-md`） |
| SplitButton | `split-button.main` | 左 / 右上圆角、右边框宽 | `8px` / `0px` / `0px`（拼接外侧圆角保留、内侧边框归零） |
| SplitButton | `split-button.menu` | 左圆角、左边框宽 | `0px` / `1px`（内侧圆角归零、外侧边框保留） |

另扩既有键属性（不新增键）：`panel.date-picker` 补 `border-top-left-radius`（`8px`，`radius-md`）；`panel.color-picker` 补 `border-top-left-radius`（`12px`）、`box-shadow`（`shadow-lg`）、`width`（`260px`）。

**契约 vs 夹具固有值**：强度条填充只采信三档语义色（`danger` / `warning` / `success`）；**有意不采样 `width`**——其解析值为百分比（33.333% / 66.666% / 100%）派生的亚像素（`79.9844px` 等），冻结基线按精确字符串比较，跨 Chromium 版本渲染差异会引入 flaky，非组件契约的可靠载体（同 `button-icon-only-icon` 的「有意不采样」口径）。其余键不采样图标盒 / 文本长度等夹具固有值。

## 3. 负向对照（判别力）

**3b-1（§5 P1 五项，共 18 处差异）**：

| 回注 | 命中键 |
| --- | --- |
| `card.vue` 圆角 `radius-lg` → `radius-md` | `card.{outlined,elevated,filled}` `.border-top-left-radius` |
| `tag.vue` `.caomei-tag--rounded` `radius-full` → `radius-sm` | `tag.rounded` |
| `message.vue` `.caomei-message--simple` `padding: 0` → `space-2` | `variant.message.{5 tone}.simple.padding`（各 2 属性） |
| `password.vue` 强度条 `height: 4px` → `6px` | `password.{weak,medium,strong}.meter.height` |
| `data-table.vue` 排序图标 `text-muted` → `text` | `data-table.sort-icon.color` |

**3b-2（登记点名项，共 4 处差异；其中 `split-button.*` 在 §5 原属 **P2**，本记录并入「登记点名项」以求装置分组自洽，分类口径以此注为准）**：

| 回注 | 命中键 |
| --- | --- |
| `button.vue` `.caomei-button--rounded` `radius-full` → `radius-md` | `button.rounded` |
| `calendar-view.vue` `[data-selected]` `background: primary` → `bg-elevated` | `calendar.selected.background-color` |
| `color-picker.vue` 触发器 `width` `control-height-md` → `lg` | `color-picker.trigger.width` |
| `button-group.vue` 内侧 `border-inline-end-width: 0` → `2px` | `split-button.main.border-right-width` |

两组均还原源码后 `capture:styles` **297 项 0 差异**、`git diff -- src/` 为空。

## 4. 实现要点

- `test/capture/fixture/app.vue`：新增 Card 三变体 / Tag rounded / Password 三档（定宽 240px）/ 可排序 DataTable / Button rounded / Calendar（选中取当月 1 / 2 日、避开今日）/ 等挂载段。
- `test/capture/capture.mjs`：新增上述采样段 + `panel.date-picker` / `panel.color-picker` 属性扩展。
- `test/capture/capture.test.mjs`：`DECLARED_KEY_BUDGET` 270 → **297**，前缀覆盖纳入 `card.` / `password.` / `data-table.` / `calendar.` / `color-picker.` / `split-button.`。
- `test/capture/baseline.json`：重冻结（生成物，随装置同提交）。

## 5. 质量门

| 门禁 | 结果 |
| --- | --- |
| `pnpm capture:styles` | **297 项 0 差异** |
| `pnpm vitest run test/capture/capture.test.mjs` | 17 passed |
| `pnpm lint:check` | exit 0 |
| `pnpm typecheck` | exit 0 |
| `pnpm docs:check:links` | exit 0（305 md） |
| `pnpm check:governance-records` | OK（112 记录 / 302 指针） |
| 负向对照 | 3b-1 五组 18 处 / 3b-2 四组 4 处，**共 9 组**；还原后 0 差异 |

## 6. Review Gate 结论

- **R1（`standard`）`Pass`**：0 blocker / 2 warning / 2 suggest。审计方独立复跑 `capture:styles`（297 项 0 差异）、capture 单测（17 passed）、`declaredKeys()`（297 / 无重复）、基线键集（added 27 / removed 0），并复现负向对照子集（tag + message → 11 处差异 → 还原 0 差异）；选择器逐项对照 `src/` 均正确；接线核实周级回归常驻、`governance:check` / `verify` 不含。
- **同批收口**：warning ① 「覆盖全部 11 组」口径错 → 更正为 **9 组**（记录 + `todo.md`）；warning ② Password 宽度亚像素派生值易 flaky → 采「更稳妥」方向**改为不采样 `width`**（记录 §2 已声明）；suggest ① 补 `docs:check:links` / `check:governance-records` 门禁行；suggest ② 注明 `split-button.*` 分类来源。
- 留痕：`artifacts/review-gate/2026-10-05-phase19-m1-3b-capture-p1-extension.md`（本地态）。

## 7. 未纳入面与边界

- 采样面 270 → 297 属预期扩容，非受检面收窄。
- Password 强度条 `width`（33/66/100% 派生亚像素）**有意不采样**（见 §2），避免跨 Chromium 版本 flaky。
- 采样面绑定单一视口（1280×800）与 Chromium 版本；暗色不采样（既有边界）。
- Calendar 的 `[data-today]` 依赖当月视图（夹具以当前月视图保证命中），值恒为 token 派生色、与具体日期无关。

## 8. 规模

- 装置侧：`capture.mjs` / `capture.test.mjs` / `fixture/app.vue` / `baseline.json`（生成物）。
- 规划侧：本记录 + 治理索引登记 + `todo.md` 状态回填。
