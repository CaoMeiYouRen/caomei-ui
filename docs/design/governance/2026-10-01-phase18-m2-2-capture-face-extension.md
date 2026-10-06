# Phase 18 M2-2：计算样式采样面扩展（Toast / Switch）

> 创建时间：2026-10-01
> 关联条目：[待办归档](../../plan/todo-archive.md) Phase 18 **M2-2**（测试稳定性与质量装置消缺）
> 装置本体：`test/capture/`（夹具 / 运行器 / 冻结基线）；装置落地记录见 [2026-09-22 采集装置迁移](./2026-09-22-m3-5-computed-style-capture-landing.md)
> 决策依据：用户 2026-09-30 裁定 **D4「全取」**——C17 把 toast / switch 纳入采样 fixture 并重冻结基线
> 快照：本仓工作区（`pnpm capture:styles` 0 差异、`pnpm test test/capture` 全绿）；**未推送**

---

## 1. 结论

- 计算样式采集装置的采样面由 **245 项扩展到 262 项（+17）**：新增 `switch.*` **6 项**与 `toast.*` **11 项**。
- 冻结基线重取后，`pnpm capture:styles` 复跑 **0 差异（262 项逐属性与基线一致）**；单测 `capture.test.mjs` **17 例全绿**（含受检面预算 245 → 262）。
- **判别力自证**：两组负向对照（回退组件契约）分别命中预期差异，共 **7 处**（§5）。
- 本批**零 `src/**` 改动**、零 token 色值变更、零既有采样项改动；基线变更仅为**新增键**与 `capturedAt`。
- 采集装置落地记录 §3 的「纳入条件（触发点）」由本批触发并收口（§6）。

---

## 2. 采样面变更（逐项有据）

采样键与运行器声明一一对应；新增项按「**组件契约承载**」选取属性，凡由夹具输入决定的固有值一律不采样（口径见 §2.3）。

### 2.1 Switch（`src/components/switch/switch.vue`，6 项）

| 采样键 | 选择器 | 采样属性 | 依据（契约） |
|:---|:---|:---|:---|
| `switch.off.track` / `switch.on.track` | `.caomei-switch` | `width` / `height` / `padding-top` / `padding-bottom` / `border-top-width` / `border-top-left-radius` / `background-color` / `border-top-color` | 轨道档位几何（`--caomei-switch-width` / `-height` / `-radius` / `-border` / `-bg` / `-active-bg` 回退值）与开 / 关两态底色 |
| `switch.off.thumb` / `switch.on.thumb` | `.caomei-switch__thumb` | `width` / `height` / `border-top-left-radius` / `background-color` / `transform` | 滑块档位几何 + **前景回退色**（`--caomei-switch-thumb-bg` → `--caomei-color-primary-foreground`）+ 选中态位移（`--caomei-switch-thumb-travel`） |
| `switch.disabled.track` | `.caomei-switch` | `background-color` / `opacity` / `cursor` | 禁用态由 `--caomei-disabled-opacity` 与 `cursor: not-allowed` 承载 |
| `switch.disabled.thumb` | `.caomei-switch__thumb` | `background-color` | **禁用态回归守卫**：断言禁用不改变前景回退色（与开 / 关态同源，不提供超出 `switch.off.thumb` 的新判别力） |

- **`--caomei-switch-*` 只作覆盖钩子**（基类不预声明默认值），故「回退到 `--caomei-color-*` / 尺寸默认值」只能由**计算样式**证明——这正是本项纳入装置的理由。
- 开 / 关两态覆盖 `data-state` 分支；`transform` 锁定选中态位移（基线实测 `matrix(1, 0, 0, 1, 18, 0)`）。

### 2.2 Toast（`src/components/toast/toast.vue`，11 项）

| 采样键 | 选择器 | 采样属性 | 依据（契约） |
|:---|:---|:---|:---|
| `toast.viewport` | `.caomei-toast-viewport` | `position` / `z-index` / `gap` / `flex-direction` / `width` / `max-height` | 视口停靠层级（`--caomei-toast-z-index` → `--caomei-z-toast`）、停靠几何与顶右位序（`column-reverse`） |
| `toast.<tone>.root`（5 项） | `.caomei-toast--<tone>` | `background-color` / `color` / `border-top-color` / `border-left-color` / `border-left-width` / `border-top-left-radius` / `box-shadow` | 提示项底色 / 文字 / 描边 / 强调条（`--caomei-toast-accent`）+ 阴影 token |
| `toast.<tone>.icon`（5 项） | `.caomei-toast--<tone> .caomei-toast__icon` | `color` | 图标复用同一强调色（`--caomei-toast-accent` 回退 `--caomei-color-text-muted`） |

- 五档语气全覆盖：`neutral`（无语气类，验证**基类回退** `--caomei-color-text-muted`）与 `primary` / `success` / `warning` / `danger`（`:where()` 语气块只声明变量）。
- 采集前按语气各入队一条 `duration: 0` 的常驻提示；提示由 `CaomeiToastProvider` 经 Teleport 注入视口，故以 `[data-cap="toast:viewport"]` 包裹 Provider 定位。

### 2.3 契约承载 vs 夹具固有值（显式区分）

- **纳入**：组件 CSS 自持的属性——档位几何、回退 token 解析值、`z-index` / `position`、语气强调色、阴影 token。这些值不随夹具输入变化，是组件对外契约。
- **排除**：由夹具输入决定的固有值——Toast **图标盒尺寸**（`@lucide/vue` 的 svg 固有属性；与 `button-icon-only-icon` **同一原则**：不采 `width` / `height`，前者采 `margin-*`、Toast 图标采 `color`）、提示文案长度、`.case` 包装层布局。将其冻结会把夹具输入当成契约。
- **未采样（有意）**：Toast 进入动画的 `opacity` / `transform`（`caomei-toast-in` 0.18s，属瞬态中间值，采样纪律要求状态稳定后读取）；Toast 内容排版（`font-size` / `gap`）与关闭 / 操作按钮悬停态（与语气强调色无耦合，属长尾）。

---

## 3. 夹具与运行器改动

| 文件 | 改动 |
|:---|:---|
| `test/capture/fixture/app.vue` | 新增 Switch 三态用例（`switch:off` / `switch:on` / `switch:disabled`）；新增 Toast Provider 用例（`data-cap="toast:viewport"`）与 `ToastDriver` 局部组件；`window.__ui` 改为 setup 顶层同步挂载（新增 `showToasts`，占位实现 fail-closed） |
| `test/capture/capture.mjs` | 新增 `SWITCH_*` / `TOAST_*` 属性集与采样声明；`TOAST_SAMPLES` 导出并纳入 `declaredKeys()`；`collect()` 在**触发器开合之后、浮层开合之前**入队常驻提示并采样 |
| `test/capture/capture.test.mjs` | 受检面预算 `DECLARED_KEY_BUDGET` 245 → **262**；前缀覆盖断言新增 `switch.` / `toast.` |
| `test/capture/baseline.json` | 重冻结：新增 17 键 + `capturedAt` 更新（chromium 153.0.8010.12、视口 1280×800） |

- **采样顺序**：提示视口固定在右上角且逐条 `pointer-events: auto`，故必须排在**点击类交互之后**（否则遮挡触发器开合采样）；本段之后无点击类交互（浮层经 `window.__ui` 程序化开合），故置于触发器开合之后、浮层开合之前。
- `ToastDriver` 在 Provider 后代中调用 `useToast()`，`duration: 0` 表示不自动关闭，保证末段采样时提示仍在。

---

## 4. 冻结基线与复跑

| 项 | 实测 |
|:---|:---|
| 采样面 | **262 项**（原 245 + 新增 17），键唯一性由单测锁定 |
| 重冻结 | `pnpm capture:styles:freeze` → `冻结基线写入 test/capture/baseline.json（262 项，chromium 153.0.8010.12）` |
| 复跑 | `pnpm capture:styles` → `0 差异：262 项逐属性与冻结基线一致` |
| 单测 | `pnpm test test/capture/capture.test.mjs` → **17 passed**（1 文件） |

新增键基线实测值（摘）：`switch.off.track` `width 40px` / `background rgb(229,231,235)`；`switch.on.track` `background rgb(37,99,235)`；`switch.on.thumb` `transform matrix(1, 0, 0, 1, 18, 0)`；`switch.disabled.track` `opacity 0.6` / `cursor not-allowed`；`toast.viewport` `z-index 1100` / `position fixed`；`toast.neutral.root` `border-left-color rgb(107,114,128)`（基类回退）；`toast.danger.root` `border-left-color rgb(220,38,38)`。

---

## 5. 判别力（负向对照）

「基线纳入某形态」不等于「该形态的规则生效」——拼写错误的选择器与不存在的规则同样表现为稳定值，只有**故意回退契约**才会暴露。两组对照（改动后即还原）：

| 对照 | 回退内容 | `pnpm capture:styles` 结果 |
|:---|:---|:---|
| Switch | `.caomei-switch` 宽度回退值 `40px` → `44px` | `switch.off.track` / `switch.on.track` `width 基线=40px 当前=44px` |
| Toast | `.caomei-toast` 强调条宽度 `3px` → `4px` | `toast.{neutral,primary,success,warning,danger}.root` `border-left-width 基线=3px 当前=4px` |

- 合计 **7 处差异**、进程 exit 1（`ELIFECYCLE`）；还原后 `git diff -- src/` 为空、复跑 **0 差异**。
- 对照点落在**新增采样项**上，证明新选择器与属性确实被采集且具备判别力。

---

## 6. 未纳入面登记收口

- 采集装置落地记录 [§3「未纳入面」](./2026-09-22-m3-5-computed-style-capture-landing.md) 明列「toast 视口 z-index + 各 tone 颜色（6 项）」并给出**纳入条件（触发点）**：若后续样式治理改动触及该面，按同一装置扩入并 `--freeze`，扩入面在提交信息中说明。
- 本批即该触发点的执行：Toast 视口 `z-index` 与五档语气强调色全部纳入（超出原 6 项，另含描边 / 圆角 / 阴影 / 图标色），Switch 一并纳入（原记录未列，属本批扩面）。
- 历史记录**不回改**：装置落地记录的 §3 表与 2026-09-28 对比度记录中的「不含 toast / switch」follow-up 均为产出时点口径；装置侧「当前采样面」以本记录为唯一载体。

---

## 7. 规模、质量门与 Review Gate

- **规模**：装置侧 4 文件（`baseline.json` +111 −1 / `capture.mjs` +49 −1 / `fixture/app.vue` +77 −12 / `capture.test.mjs` +2 −2），文档载体 4 文件（本记录 + 装置落地记录扩入登记 + 治理索引 + `todo.md` 状态回填）；**零 `src/**` 改动**、零 token 色值变更。基线为生成物（17 个新增键 + `capturedAt`）。
- **质量门（本批实测）**：
  - `pnpm verify` **exit 0**（含 `lint:check` / `lint:css:check` / `lint:md:check` / `typecheck` / `typecheck:docs` / `test` **102 文件 / 2126 例** / `build` / `check:build` / `check:resolver` / `check:nuxt` / `docs:build` / `docs:check:i18n-routing` / `governance:check`）。
  - `pnpm capture:styles` **262 项 0 差异**（chromium 153.0.8010.12 / 视口 1280×800）。
  - `pnpm test test/capture/capture.test.mjs` **17 passed**。
  - `governance:check`：`check:governance-records` **97 记录 / 287 md 指针**一致、`check:planning-numbers` 0 命中、`check:docs-git-revision` 通过、`ref-attr-guard` 判定本批未涉及引用型 ARIA 属性并跳过 `capture:styles`。
- **V 阶段（显式跳过）**：本批零 `src/**` 改动、无可见 UI 面，按 PDTFC+ 显式跳过 `@ui-validator`；**浏览器侧证据由采集装置承载**（`capture:styles` 在真实 Chromium 中采集并比对 262 项）。
- **Review Gate**：见 §8；本地留痕 `artifacts/review-gate/2026-10-01-phase18-m2-2-capture-face.md`。

## 8. Review Gate 结论

- **R1（第 1 轮，`standard`）`Pass`**：0 blocker / 1 warning / 4 suggest。本地留痕 `artifacts/review-gate/2026-10-01-phase18-m2-2-capture-face.md`（含审计方独立复算表）。
- **审计方独立复算**（摘）：`declaredKeys()` = 262、唯一键 262、`switch.*` 6 / `toast.*` 11；`baseline.entries` = 262 / chromium 153.0.8010.12 / 1280×800；`capture.test.mjs` 17 passed；`check:governance-records` 97 记录 / 287 指针一致；`check:planning-numbers` 0 命中；`baseline.json` diff 仅 `capturedAt` + 17 新键（无既有键值漂移）；零 `src/**` 改动；并核对 Reka `ToastRootImpl.startTimer` 的 `duration <= 0` 分支确认「常驻提示」假设成立。
- **修复点（同批收口，记「已修复未复审」）**：
  - **RG-W1**（warning，预写未落地状态）：`todo.md` / 治理索引的「已完成」早于本结论回填 → **本 §8 回填即为生效前提**（提交前完成）。
  - **RG-S1**（图标口径表述不精确）：§2.3 改为「同一原则（不采 `width` / `height`）：`button-icon-only-icon` 采 `margin-*`，Toast 图标采 `color`」。
  - **RG-S2**（采样顺序因果表述夸大）：§3 收紧为「点击类交互必须排在 Toast 之前」，不再声称模态焦点陷阱会阻断程序化入队。
  - **RG-S3**（禁用态滑块判别力边界）：§2.1 显式标注 `switch.disabled.thumb` 为「禁用态回归守卫」。
  - **RG-S4**（`262 项` 同名歧义）：装置落地记录扩入登记补「本装置口径」限定词。
- **实测用时**：派发 `2026-10-01T13:58:52+08:00` → 留痕写入 `2026-10-01T14:03:35+08:00`，**≈ 4 分 43 秒**（≤ 10 分钟时间盒，未超）。
- **未覆盖边界**（采信调用方证据）：`pnpm capture:styles` 真实 Chromium 复跑与 `pnpm verify` 全链未由审计方独立复跑；负向对照 7 处差异未独立复现（受「只审查、不改文件」约束）。

---

## 9. 已知观察与边界

- **视口绑定**：基线绑定单一视口（1280×800）与 Chromium 版本；`toast.viewport` 的 `width` / `max-height` 依赖视口，跨视口不适用（与既有装置同口径）。
- **过渡属性**：Switch 的 `background-color` / `border-color` 参与 `transition`，本批采的是**静态初始态**（无状态变更，无插值中间态）；开 / 关两态分别由独立用例承载，不通过运行时切换取值。
- **瞬态面未纳入**：Toast 进入 / 滑出动画的 `opacity` / `transform` 不在采样面内（瞬态中间值）；如需保护动画契约，应另立「状态稳定后 + 显式等待」的采样面。
