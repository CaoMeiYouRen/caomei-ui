# Phase 19 M1-2：设计规范 §6 实现对齐与浏览器验证

> 创建时间：2026-10-05
> 关联条目：[待办归档](../../plan/todo-archive.md) Phase 19 **M1-2**（设计一致性口径裁定与守卫落地）
> 事实源：[设计规范 §6](../design-spec.md) / [Phase 18 M3-1 评估 §4](./2026-10-01-phase18-m3-1-design-consistency-evaluation.md)
> 实现提交：`89c4d82`（`fix(style): 更新组件背景色和阴影样式`）；V 阶段工作区 HEAD `1728a0f`
> 边界：实现面已完成并提交；本记录补 **V 阶段（浏览器验证）**、实现范围核对与审查留痕，**不改 `src/**`**。

---

## 1. 结论

- M1-2 的**三处实现对齐**（D3 浮层背景 / D4 Popover 默认圆角 / D6 AutoComplete 面板阴影）已由 `89c4d82` 落地，并与 `89c4d82` 同批扩写的 §6 口径一致。
- **D3 覆盖 11 面**（非登记文本所写 8 面）：D3 原定 8 面 + 同批随 §6 扩写的 `ConfirmDialog` / `Drawer` / `DatePicker`。
- **V 阶段通过**：真实 Chromium 在亮 / 暗 × 桌面 / 移动 4 组合下，11 个面板的背景 / 圆角 / 阴影逐项与 token 探针一致；**负向对照 11 / 11 用例组失败（共 15 条断言）**（判别力已证）；console error 0。
- 本记录经 Review Gate 放行后，`todo.md` 的 M1-2 由「进行中」回填「已完成」。

## 2. 实现范围（`89c4d82`）

`background: var(--caomei-color-bg)` → `var(--caomei-color-bg-elevated)` 共 **11 处**：

| 组件 | 文件:行 | 说明 |
| --- | --- | --- |
| Dialog | `src/components/dialog/dialog.vue:180` | D3 原定 8 面 |
| Popover | `src/components/popover/popover-content.vue:53`（+ `:64` 箭头填充回退） | D3 |
| Select | `src/components/select/select.vue:472` | D3 |
| MultiSelect | `src/components/multi-select/multi-select.vue:432` | D3 |
| AutoComplete | `src/components/auto-complete/auto-complete.vue:594` | D3 + D6 阴影 token 化 |
| DropdownMenu | `src/components/dropdown-menu/dropdown-menu-content.vue:192` | D3 |
| Toast | `src/components/toast/toast.vue:214` | D3 |
| ColorPicker | `src/components/color-picker/color-picker.vue:206` | D3 |
| ConfirmDialog | `src/components/confirm-dialog/confirm-dialog.vue:177` | 随 §6 扩写 |
| Drawer | `src/components/drawer/drawer.vue:133` | 随 §6 扩写 |
| DatePicker | `src/components/date-picker/date-picker.vue:295` | 随 §6 扩写 + D6 阴影 token 化 |

另：D4 Popover 默认 `border-radius` `--caomei-radius-md` → `--caomei-radius-lg`（`popover-content.vue:52`）；D6 AutoComplete / DatePicker 的 `box-shadow` 由字面量改为 `var(--caomei-shadow-md)`。同批同步 [设计规范 §6](../design-spec.md)、组件文档（`popover.md` / `dropdown-menu.md` 中英）与 `test/capture/baseline.json`。

**非浮层残留核对**（`var(--caomei-color-bg)` 仍在，属正确）：`date-picker:211` 触发器、`color-picker:158` 触发器、`color-picker:189` inline 面板（§6 明确内联形态取基础面 `bg`）、`multi-select:272` / `auto-complete:412` 字段根。

## 3. V 阶段（真实 Chromium）

- **入口**：独立 Vite 夹具 `test-results/m1-2-validate/`（git-ignored，直接挂载 `src/`），dev 4531；驱动脚本 `validate.mjs`（Playwright 1.63 / Chromium）。
- **契约 vs 夹具固有值**：只比对面板 CSS 自持的计算样式，不采内容盒尺寸。
- **矩阵**：亮 / 暗 × 桌面 1280×800 / 移动 390×844。

### 3.1 关键实测值

| 核对项 | 亮 | 暗 |
| --- | --- | --- |
| `bg-elevated`（面板背景，11 面一致） | `rgb(247, 247, 248)` | `rgb(23, 23, 26)` |
| `bg`（判别力探针） | `rgb(255, 255, 255)` | `rgb(11, 11, 13)` |
| Popover `border-radius`（`radius-lg`） | `12px` | `12px` |
| `shadow-md`（AutoComplete / DatePicker / Toast） | `rgba(0, 0, 0, 0.12) 0px 8px 24px 0px` | 同左 |

- 结果：**44 / 44 通过**（4 矩阵 × 11 用例）；宿主稳定性 `clientWidth` delta `0px`（实测滚动条 `0px`）；console error / pageerror **0**。
- **判别力**：token 探针自证 `bg ≠ bg-elevated`；`shadow-md ≠ shadow-lg`。
- **负向对照**：注入修复前形态（面板 `background: var(--caomei-color-bg) !important` + Popover `radius-md` + 阴影 `none`）→ **11 / 11 用例组失败（共 15 条断言）**，还原后全绿。
- **宿主稳定性测量集**：本批仅改颜色 / 圆角 / 阴影 token（非 portal / 滚动锁路径），测量集取 `documentElement.clientWidth` 开合前后差（实测 `0px`、滚动条 `0px`）；**未**按[测试规范 §5.1](../../standards/testing.md) 全量浮层矩阵（fixed / `100%` 视口元素几何与遮罩 bounding rect）展开，该视觉契约由 M1-3 的 capture 固化项承接。
- 局部观察（脚本自身缺陷，非组件缺陷，已在复跑前修正）：初版把 Drawer 误加「圆角 = `radius-lg`」断言（§6 明示 Drawer 不设圆角，实测 `0px` 正确）、ConfirmDriver 误将 `useConfirm()` 返回对象当方法调用、Toast 取错内部 `__content` 而非根——均属取证脚本 bug。

### 3.2 复现

```bash
node test-results/m1-2-validate/validate.mjs                     # 44 项，exit 0
NEGATIVE_CONTROL=1 node test-results/m1-2-validate/validate.mjs  # 负向对照 11/11 用例组失败，exit 1
```

原始记录：`test-results/m1-2-validate/validation.md`；截图 `test-results/m1-2-validate/screens/`。

## 4. 与 §6 一致性核对

| §6 行 | 约定 | 实现 / 实测 |
| --- | --- | --- |
| Dialog / ConfirmDialog / Popover | 圆角 `radius-lg`；浮层背景 `bg-elevated`；Dialog / ConfirmDialog `shadow-lg`，Popover / DropdownMenu / Select / MultiSelect / AutoComplete / DatePicker / Toast `shadow-md` | 11 面背景与圆角 / 阴影均一致 |
| Drawer | 面板背景 `bg-elevated`、贴边、不设圆角 | 背景一致，圆角 `0px` |
| ColorPicker | 浮层面板背景 `bg-elevated`（内联 `--inline` 取 `bg`）、圆角 `radius-lg`、阴影 `shadow-lg` | 一致（inline 保留 `bg`） |

## 5. 质量门

| 门禁 | 结果 |
| --- | --- |
| `pnpm capture:styles` | **262 项 0 差异**（重冻结基线一致） |
| `pnpm check:design` | 通过（800 规则 / 2688 声明） |
| V 阶段 `validate.mjs` | 44 / 44 通过；负向对照 11 / 11 用例组失败（15 条断言） |
| `pnpm lint:md:check` | exit 0 |
| `pnpm docs:check` | 11 段 exit 0 |
| `pnpm governance:check` | exit 0（含 `check:governance-records` OK：110 记录 / 300 指针） |

## 6. Review Gate 结论

- **R1（`standard`）`Pass`**：0 blocker / 1 warning / 2 suggest。审计方独立复跑 V 阶段（44 / 44）、负向对照（11 / 11 用例组失败）、`capture:styles`（0 差异）、`check:design`、`lint:md:check`、`docs:check`，并逐项核对 11 面清单与残留 `bg` 分类。
- **同批收口**：warning（§5 / §6 悬空待回填）→ 本节回填 + §5 补齐实测值；suggest ① 把「负向对照 11/11」改为**用例组**口径（含 15 条断言）；suggest ② 在 §3 声明宿主稳定性测量集范围。
- 留痕：`artifacts/review-gate/2026-10-05-phase19-m1-2-visual-alignment.md`（本地态）。

## 7. 规模与边界

- 实现批次（`89c4d82`）：18 文件 / +39 −35（唯一口径以该提交 `--stat` 为准）。
- 本轮新增：本记录 + 治理索引登记 + `todo.md` 状态回填（`89c4d82` 之外）。
- **未覆盖**：文档站宿主内复核（组件层 token 变更与宿主样式无关）、上游 `md-editor-v3` 浮层。
