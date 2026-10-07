# Phase 20 M2-4：浮层交互 E2E 规格（Dialog / ConfirmDialog）

> 创建时间：2026-10-07
> 关联条目：[待办事项](../../plan/todo.md) Phase 20 **M2-4**（基建与治理守卫补口）
> 依据：浮层交互（焦点落位 / 滚动锁复位）此前无常驻 E2E 覆盖；候选 B26
> 快照：本仓工作区（`pnpm verify` exit 0、`test:e2e` 318 passed）；**未推送**

---

## 1. 结论

- 新增常驻 E2E 规格 `test/e2e/overlay-interaction.e2e.ts`（2 用例 × 三视口 = 6 例），覆盖 **Dialog** 与 **ConfirmDialog** 的：
  - **焦点落位**：打开后 `document.activeElement` 落在面板内容内；关闭后焦点回到触发元素；
  - **滚动锁复位**：打开后 `document.body.style.overflow === 'hidden'`；关闭后复位为打开前取值。
- **确定性优先**：只断言**样式开关**（`overflow` 字符串），不触碰滚动位置 / `paddingRight` 补偿（与滚动条宽度、视口无关）；焦点断言用 `expect.poll` 跨微任务等待。
- **与既有 E2E 去重**：`overlay-stacking.e2e.ts`（模态内浮层层级 / 命中测试）、`drawer-convergence.e2e.ts`（Drawer 档位收敛）各司其职，本规格不重复。
- 负向对照：临时把 Dialog 置为非模态（`:modal="false"`）→ 滚动锁断言失败；还原后全绿。

---

## 2. 判定口径

| 观测量 | 断言 | 依据 |
|:---|:---|:---|
| 焦点落位（打开） | `document.activeElement` ⊆ 面板内容 | Reka `DialogContentModal` 的 `FocusScope`（`trapFocus` 默认 true） |
| 焦点归还（关闭） | `document.activeElement === 触发元素` | Reka `DialogContentModal` 在 `present→false` 时归还焦点给**打开瞬间捕获的 `activeElement`**（内容挂载时 `getActiveElement()` 记录；故要求触发器在打开瞬间持有焦点） |
| 滚动锁（打开） | `body.style.overflow === 'hidden'` | Reka `DialogOverlayImpl` 的 `useBodyScrollLock(present)` |
| 滚动锁（关闭） | `body.style.overflow` 回到打开前值 | `useBodyScrollLock` 释放时 `resetBodyStyle` |

- **前置守卫（fail-closed）**：打开前断言 `body.style.overflow !== 'hidden'`，避免夹具 / 环境默认即锁定时「断言恒真」。
- **关闭方式**：Dialog 用 `Escape`；ConfirmDialog 固定点「取消」按钮（`AlertDialog` 点遮罩不关闭；`Esc` 亦会以「取消」语义结算 `false`，本规格不依赖该路径）。
- **有意不纳入**：滚动位置 / `paddingRight` / `--scrollbar-width` 补偿（依赖滚动条宽度，属不稳定面）。

---

## 3. 夹具与规格改动

| 文件 | 改动 |
|:---|:---|
| `test/e2e/fixtures/app.vue` | 新增 `#overlay-interaction` 段：`#dialog-open` + `CaomeiDialog`（含 `#dialog-input`）、`CaomeiConfirmDialog` + 内联 `ConfirmDriver`（渲染 `#confirm-open`，经 `useConfirm()` 命令式打开）；新增 `interactionDialogOpen` / `interactionDialogInput` 状态与 `defineComponent/h` 导入 |
| `test/e2e/overlay-interaction.e2e.ts` | 新增规格（2 用例），复用 `focusInside` / `bodyOverflow` 辅助与统一流程函数 |

- 确认框经命令式 `useConfirm()` 打开：驱动按钮渲染在 `<CaomeiConfirmDialog>` **后代**内（store 提供者要求），与本库既有 `ConfirmDriver` 形态一致。

---

## 4. 未纳入面与边界（显式）

- **仅 Dialog / ConfirmDialog**：Drawer / Toast 的焦点与滚动行为不在本批（Drawer 已有 `drawer-convergence.e2e.ts`，Toast 的焦点哨兵属有意例外）。
- **不覆盖焦点陷阱的循环边界**（Tab 首尾循环）：属 Reka `FocusScope` 内部行为，且有既有组件单测承载；如需可另立。
- **不覆盖多浮层叠加时的滚动锁计数**：Reka `useBodyScrollLock` 用引用计数（`createSharedComposable`），本规格只覆盖单浮层开关。

---

## 5. 规模、质量门与 Review Gate

- **规模**：`test/e2e/fixtures/app.vue`（+53 −1）、`test/e2e/overlay-interaction.e2e.ts`（新增 111 行）；文档载体（本记录 + 治理索引 + `todo.md` 状态回填）。**零组件库 `src/**` 改动**。
- **质量门（本批实测）**：
  - `pnpm test:e2e --workers=2` **318 passed**（既有 312 + 本批 6），零回归。
  - `pnpm verify` **exit 0**（`lint:check` / `lint:css:check` / `lint:md:check` / `typecheck` / `typecheck:docs` / `test` **112 文件 / 2226 例** / `build` / `check:build` / `check:resolver` / `check:nuxt` / `docs:build` / `docs:check:i18n-routing` / `governance:check` 全绿）。
  - 负向对照（`:modal="false"`）→ 滚动锁断言 **1 failed**；还原后全绿。
- **V 阶段**：浏览器侧证据由本常驻 E2E 在真实 Chromium（三视口）中承载；未改 `src/**`、无可见 UI 行为变更。
- **Review Gate**：见 §6；本地留痕 `artifacts/review-gate/2026-10-07-phase20-m2-4-overlay-interaction.md`。

## 6. Review Gate 结论

- **R1（第 1 轮，`standard`）`Pass`**：0 blocker / 1 warning / 3 suggest。审计方独立复跑 ESLint、核验 `vitest` 不纳入 `*.e2e.ts`（计数 112 文件 / 2226 例自洽）、`#dialog-open`/`#confirm-open` 唯一、去重与 fail-closed 判别力；并读 Reka 源码确认滚动锁（`useBodyScrollLock`）与焦点落位（`DialogContentModal` `onOpenAutoFocus` 聚焦取消元素）依据准确。
- **实测用时**：派发 `2026-10-08T00:57:38+08:00`；返回未单独取戳，以本批收尾写入为界 ≈ 10 分钟内（≤ 时间盒）。
- **同批收口（记「已修复未复审」）**：
  - **RG-W1**（事实性措辞：「AlertDialog Esc 不关闭」与项目自身契约矛盾——`confirm-dialog.test.ts` / 组件文档均记录 Esc 以「取消」结算）：规格注释与 §2 改为「点遮罩不关闭；Esc 亦以取消语义关闭，本规格固定用按钮路径」。
  - **RG-S1**（焦点断言缺独立负向对照）：**未采纳**——焦点断言在面板未渲染时必为 `false`（非恒真），且滚动锁已有负向对照；补一组会与前置守卫重复。
  - **RG-S2**（`todo.md` 完成态先于 Pass）：本批完成态与 RG 结论同批提交；后续按「Pass 后回填」执行。
  - **RG-S3**（焦点归还依据措辞宽泛）：§2 细化到「归还给打开瞬间捕获的 `activeElement`（内容挂载时记录）」。
- **未覆盖边界**（采信调用方证据）：审计方未重跑全量 `test:e2e`；ConfirmDialog 的「Esc=取消」真实路径未单独断言（§4 登记）；焦点陷阱 Tab 循环 / 多浮层滚动锁计数 / Toast 焦点不在本批。
