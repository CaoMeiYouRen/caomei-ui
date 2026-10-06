# Phase 19 M1-3a：M1-2 浮层视觉契约固化（capture 采样面扩展）

> 创建时间：2026-10-05
> 关联条目：[待办归档](../../plan/todo-archive.md) Phase 19 **M1-3**（设计一致性口径裁定与守卫落地；本记录为子批 **3a**）
> 依据：[Phase 18 M3-1 评估 §5](./2026-10-01-phase18-m3-1-design-consistency-evaluation.md) / [Phase 19 M1-2 视觉对齐](./2026-10-05-phase19-m1-2-visual-alignment.md)
> 边界：只扩**计算样式采集装置**（`test/capture/**`）与其冻结基线；零 `src/**` 改动、零色值变更。

---

## 1. 结论

- M1-2 的浮层视觉契约（**11 面面板背景** `bg-elevated`、**Popover 面板圆角** `radius-lg`、**AutoComplete / DatePicker 面板阴影** `shadow-md`）已从「一次性 V 阶段」升级为**常驻计算样式断言**。
- 采样面 **262 → 270**（+8：7 个锚定面板键 + `confirm-dialog.content`）；另为 `dialog.*.content` / `drawer.*.content` 补 `background-color` 属性。
- `capture:styles` **270 项 0 差异**；三类契约的**负向对照**均报差异（还原后 0 差异）。
- 装置经周级回归 `.github/workflows/regression-weekly.yml`（`pnpm capture:styles`）常驻执行；**不接入 `governance:check` / `pnpm verify` 链**（需真实浏览器，与既有落位一致，显式声明）。

## 2. 采样面扩展（262 → 270）

新增 `PANEL_SAMPLES`（7 键，点击触发器逐个开合、读面板后 Escape 关闭）：

| 键 | 面板选择器 | 属性 | 实测值（亮，1280×800） |
| --- | --- | --- | --- |
| `panel.select` | `.caomei-select__content` | `background-color` | `rgb(247, 247, 248)` |
| `panel.multi-select` | `.caomei-multi-select__content` | `background-color` | `rgb(247, 247, 248)` |
| `panel.auto-complete` | `.caomei-auto-complete__content` | `background-color`, `box-shadow` | `rgb(247, 247, 248)` / `rgba(0, 0, 0, 0.12) 0px 8px 24px 0px` |
| `panel.date-picker` | `.caomei-date-picker__content` | `background-color`, `box-shadow` | 同上 |
| `panel.color-picker` | `.caomei-color-picker__panel:not(--inline)` | `background-color` | `rgb(247, 247, 248)` |
| `panel.popover` | `.caomei-popover__content` | `background-color`, `border-top-left-radius` | `rgb(247, 247, 248)` / `12px` |
| `panel.dropdown-menu` | `.caomei-dropdown-menu__content` | `background-color` | `rgb(247, 247, 248)` |

其它 4 面（既有采样面内补/已含）：

| 面 | 键 | 处理 |
| --- | --- | --- |
| Dialog | `dialog.{sm,md,lg}.content` | `DIALOG_PROPS` 补 `background-color` |
| Drawer | `drawer.{sm,md,lg}.content` | `DRAWER_PROPS` 补 `background-color` |
| ConfirmDialog | `confirm-dialog.content`（新增 1 键） | 经夹具 `window.__ui.confirm()` 命令式打开 |
| Toast | `toast.{tone}.root` | `TOAST_ROOT_PROPS` 原含 `background-color`（M2-2 已纳入），本批不改 |

契约与夹具固有值边界：不采样面板尺寸 / 位置（由内容与视口决定，非本批契约）。

## 3. 负向对照（判别力）

同批回注三类实现错误，`capture:styles` 逐类命中（还原后 0 差异）：

| 回注 | 差异键 | 基线 → 当前 |
| --- | --- | --- |
| `select.vue` 面板背景回退 `--caomei-color-bg` | `panel.select \| background-color` | `rgb(247,247,248)` → `rgb(255,255,255)` |
| `popover-content.vue` 圆角回退 `--caomei-radius-md` | `panel.popover \| border-top-left-radius` | `12px` → `8px` |
| `auto-complete.vue` 阴影改字面量 | `panel.auto-complete \| box-shadow` | `rgba(0,0,0,0.12) 0px 8px 24px 0px` → `color(srgb … / 0.12) …` |

## 4. 实现要点

- `test/capture/fixture/app.vue`：新增锚定面板触发段（`data-cap="panel:*"`）与 `<CaomeiConfirmDialog>`。
- 无渲染驱动组件（Toast / Confirm）与共享 `window.__ui` 拆到独立模块 `test/capture/fixture/drivers.ts` / `ui.ts`——同 SFC 内定义多个组件会触发 `vue/one-component-per-file`，拆分后各文件单组件（`ui` 占位实现 fail-closed）。
- `test/capture/capture.mjs`：新增 `panel.<name>` 采样段（排在 Toast 之前，点击类交互不遮挡 Toast；模态类 `confirm-dialog` 排在最后）、`declaredKeys()` 同步、`DIALOG_PROPS` / `DRAWER_PROPS` 补 `background-color`。
- `test/capture/capture.test.mjs`：`DECLARED_KEY_BUDGET` 262 → **270**，前缀覆盖断言纳入 `panel.` / `confirm-dialog.`。
- `test/capture/baseline.json`：重冻结（生成物，随装置同提交）。

## 5. 质量门

| 门禁 | 结果 |
| --- | --- |
| `pnpm capture:styles` | **270 项 0 差异**（重冻结后复跑） |
| `pnpm vitest run test/capture/capture.test.mjs` | 17 passed |
| `pnpm lint:check` | exit 0 |
| `pnpm typecheck` | exit 0 |
| 负向对照 | 3 类契约各命中差异；还原后 0 差异 |

## 6. Review Gate 结论

- 待本记录所在批次审计后回填。

## 7. 未纳入面与边界

- 浮层面板 `z-index` / 小屏媒体查询档位仍不在本夹具内（既有登记，非本批范围）。
- 采样面绑定单一视口（1280×800）与 Chromium 版本（153.0.8010.12）；暗色不采样（token 权威在 `src/styles`，暗色由 V 阶段覆盖）。
- 采样面计数 **262 → 270** 属预期扩容，非受检面收窄。

## 8. 规模

- 装置侧：`capture.mjs` / `capture.test.mjs` / `fixture/app.vue` / 新增 `fixture/ui.ts` / `fixture/drivers.ts` / `baseline.json`（生成物）。
- 规划侧：本记录 + 治理索引登记 + `todo.md` 状态回填。
