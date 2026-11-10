# Phase 30 M4-1：触摸目标 P1 交付（表单控件盒）

> 创建时间：2026-11-10
> 触发：Phase 30 M4-1（[Phase 30 登记批次](./2026-11-10-phase30-registration.md) §2 / §5）。
> 依据：[触摸目标实测复核记录](./2026-10-16-phase25-m2-2-touch-target-audit.md) §4 的 P1 行；P0 原语与装置见 [M1-3 记录](./2026-11-03-phase27-m1-3-mobile-matrix-baseline.md)；口径回写 [响应式设计 §3 #16 / §4 断言 7 / §5](../responsive.md)。

## 1. 交付清单（17 个目标）

复用既有 `--caomei-hit-target-min`（默认 `24px`）+ `.caomei-hit-target` 的 `::after` 不可见扩展原语，**视觉盒逐族保持原尺寸**，不新增 token、不改布局与视觉基线。

| 目标族 | 数量 | 命中宿主 | 视觉盒（边框盒） | 命中区 |
|:---|:--:|:---|:---|:---|
| Checkbox | 2 | `.caomei-checkbox__control`（Reka `CheckboxRoot`） | 18×18 | 24×24 |
| RadioButton | 6 | `.caomei-radio-button`（`RadioGroupItem` 根，含关联标签并集） | 高 18、宽随标签 | 高 24（宽本就 ≥24） |
| Switch | 2 | `.caomei-switch`（轨道） | 40×22 | 宽 40 × 高 24 |
| Slider | 3 | `.caomei-slider__thumb`（单值 1 + 区间 2） | 18×18 | 24×24 |
| ColorPicker 滑柄 | 4 | `.caomei-color-picker__area-thumb` / `__hue-thumb`（两块内联面板） | 18×18（14px 内容盒 + 2px 边框） | 24×24 |

## 2. 实现要点

1. **只加类名，零 DOM 语义变化**：原语与 `--caomei-hit-target-min` 完全复用，不给组件新增 props / 插槽 / 事件；键盘与焦点面无改动（Reka 的 roving tabindex、`aria-*` 保持原样）。
2. **Checkbox 挂在控制盒而非根**：根 `.caomei-checkbox` 是普通 `div`（无点击处理），标签经 `for` 关联；命中宿主只能是 `CheckboxRoot`，`::after` 3px 溢出落在 8px 的 `gap` 内，不覆盖标签。
3. **RadioButton 挂在根**：指示器已有 `::after`（选中圆点），不能复用该元素；根节点本身就是可点目标，宽度由关联标签并集承接，缺的只是高度（18 → 24）。
4. **Switch 挂在轨道**：轨道已是 `position: relative`，`::after` 只扩命中、不参与轨道 / 圆点绘制；视觉盒 22 高的短边由 `::after` 补到 24。
5. **Slider / ColorPicker 滑柄**：Reka 以内联样式写 `position: absolute` 与定位 `transform`，全局 `position: relative` 会被内联样式覆盖；由于绝对定位元素本身即包含块，`::after` 仍以滑柄 padding 盒居中，无需分叉实现。
6. **探针从「24×24 方框」升级为「逐轴取 `max(边长, 24)`」**：某轴已 ≥24（RadioButton 根、Switch 轨道）时该轴不再要求扩展，也不再取四角——宽宿主的四角由另一轴的 `::after` 覆盖不到，取角会误报；两轴都 <24 时保留四角，P0 的 9 点方框采样口径不变。
7. **分族断言**：视觉盒上限、Chebyshev 配对按交互族进行（跨组件配对会把正常间距当违规）；分族计数之和须等于 `#hit-target-form` 内目标总数，防漏检 / 重复计数。
8. **capture 装置补采**：新增 `hit-form.*` 的视觉盒与 `::after` 逐属性（`position` / `width` / `height`）样本；`TRIGGER_SAMPLES` 的 color-picker 面板选择器收窄为 `:not(.caomei-color-picker__panel--inline)`——夹具新增常驻内联面板后，原来的通用选择器永远「未 detach」。

## 3. 验证证据

| 项 | 结果 |
|:---|:---|
| `pnpm lint:check` / `pnpm lint:css:check` | 通过（类名按 `vue/static-class-names-order` 字母序排列） |
| `pnpm typecheck` | 通过 |
| 定向 `vitest`（checkbox / radio-group / switch / slider / color-picker，6 文件） | **143 passed** |
| `pnpm exec playwright test test/e2e/hit-target.e2e.ts` | **12 passed**（4 用例 × 3 project：P0 命中 / P0 负向对照 / P1 命中 / P1 短边） |
| `pnpm exec playwright test test/e2e/focus-visible-expansion.e2e.ts` | **96 passed**（键盘 / 可见焦点面无回归：含 Checkbox / RadioButton / Switch / Slider 等目标族） |
| 负向验证（把 `--caomei-hit-target-min` 临时改为 20px） | P0 与 P1 命中用例**同时失败**，恢复 24px 后全绿（探针有判别力） |
| `pnpm capture:styles` | **0 差异**（既有 386 项逐属性不变）；冻结后新增 13 项 |
| `pnpm test:visual` | **42 passed**（亮暗 / 视口 / 预设 / 命中区 / 区间面板基线 0 差异） |
| `pnpm governance:check` / `pnpm docs:check` | 通过 |

### 3.1 `capture:styles` 新增项（真实 Chromium 1280×800）

| 键 | 实测 |
|:---|:---|
| `hit-form.checkbox` / `hit-form.checkbox-hit` | `18×18` / `::after` `absolute 24×24` |
| `hit-form.radio` / `hit-form.radio-hit` / `hit-form.radio-indicator` | `68×18` / `absolute 24×24` / 指示器 `18×18` |
| `hit-form.switch` / `hit-form.switch-hit` | `40×22` / `absolute 24×24` |
| `hit-form.slider` / `hit-form.slider-hit` | `18×18` / `absolute 24×24` |
| `hit-form.color-area` / `-hit`、`hit-form.color-hue` / `-hit` | 内容盒 `14×14`（边框盒 18） / `absolute 24×24` |

- 视觉盒采 `width` / `height` 计算值（ColorPicker 滑柄 `box-sizing` 为 `content-box`，故读数为 14）；几何探针用 `getBoundingClientRect` 读边框盒 18，两处口径都已在 §1 标注。

## 4. 风险与边界

1. **间距契约转嫁给使用方**：`::after` 只保证单目标 ≥24，相邻目标不重叠仍取决于布局间距（夹具用 `--caomei-space-3` 行距；区间滑块取 20 / 80）。下游把两个命中区压得比 24 更近（例如区间滑块两柄贴边）时仍会重叠，这与 P0 多行值片的行距契约同源。
2. **RadioButton 宿主宽度随标签**：命中区判定对宽宿主只补短轴；若下游用无标签的纯指示器用法，根退化为 18×18，此时两轴都由 `::after` 补到 24（已由 E2E 覆盖宽宿主形态，纯指示器形态按同一 CSS 生效）。
3. **调大 `--caomei-hit-target-min`**：命中区随之变大，相邻目标轴距须同步放大（与 [主题设计 §5.2](../theming.md) 的既有约束一致）。
4. **P2 不在本批**：行高受限 / 内联行目标（字段族内联行、Breadcrumb、DataTable 排序、Select 清除等）仍留 Backlog。
5. **任务粒度**：本批 17 文件 / 约 470 新增行（`git diff --numstat` 合计 393 行 + 本记录约 77 行；删除 29 行），其中 5 个 `src/**` 组件仅加类名与 1 处注释（生产源码改动合计不足 10 行），其余为夹具、探针、capture 装置与文档。文件数超过 10 的建议阈值集中在测试装置与文档，按 §3.2 拆两个审计分区（组件样式面 / 测试与文档面），不拆分提交。

## 5. Review Gate

- **audit-depth**：`standard`（5 个 `src/**` 组件仅类名挂载 + 探针语义变更 + 夹具 / capture 装置 + 文档口径回写；无发布、无依赖、无运行时配置）；时间盒 ≤ 10 分钟。
- **分区**：A = 组件样式面（`src/components/{checkbox,radio-group,switch,slider,color-picker}` + `src/styles/index.css`）；B = 测试与文档面（`test/e2e/**`、`test/capture/**`、`docs/**`、`docs/plan/todo.md`）。
- **R1**：`Pass`（两分区，0 blocker / 4 warning / 6 suggest；实测 A ≈ 6 分钟、B ≈ 9 分钟，均未超 ≤ 10 分钟时间盒）。
  - **分区 A（组件样式面）`Pass`**：0 blocker / 0 warning / 3 suggest——伪元素冲突（RadioButton 圆点在指示器、其余宿主无 `::after`）、overflow / 包含块 / `pointer-events` 均逐项核验；capture 未命中路径返回 `__missing` 并计入 errors，无静默通过。S1 提示 Slider / ColorPicker / 指示器此前无几何基线（视觉不变由 `test:visual` 兜底）：**已登记**于本记录 §3.1 与 §6；S2 建议补采 `box-sizing` / 边框宽：**登记为后续增强**（当前由视觉基线覆盖）；S3 提示 `hit-form.radio` 与夹具文案耦合：**已登记**（由 `hit-form.radio-indicator` 单独锁 18px）。
  - **分区 B（测试与文档面）`Pass`**：0 blocker / 4 warning / 3 suggest——W1 用户面 `guide/mobile.md`（中英）与 `backlog.md` 仍称 P1 未做：**已修**（两语种改为 P1 已交付 + 指针）；W2 本记录行数 690 与实测不符：**已修**（约 470，含计算口径）；W3 `INSIDE_POINTS` / `OUTSIDE_POINTS` / `samplingOffsets` 三个死导出：**已修**（删除，判据只保留浏览器侧一处并写明理由）；W4 键盘 / 焦点缺运行证据：**已补**（`focus-visible-expansion` 96 passed 写入 §3）；S1 E2E 只锁短边：**已登记**于 §6；S2 P0 侧按 `#hit-target` 全域配对（比文档更严）：**已在响应式设计 §4 断言 7 注明**；S3 todo 状态与 R1 未定不一致：**已按 R1 Pass 回填**。
- **复查基线**：本记录 §1 ~ §3；`test/e2e/helpers/hit-target.ts` 的逐轴采样；`test/e2e/hit-target.e2e.ts` 的分族断言；`docs/design/responsive.md` §3 #16 / §4 断言 7 / §5；`docs/design/theming.md` §5.2；`docs/guide/mobile.md` 与 `docs/i18n/en-US/guide/mobile.md` 的触摸目标段。

## 6. 未覆盖边界

- 未做人工触摸（真机 / 触屏模拟）拖拽跟手验证；命中区扩展后拖拽起点的观感未逐组件录屏。
- 未覆盖下游页面内的紧凑单元格 / 表格内嵌控件（与 §4 风险 1 同源）。
- 未覆盖 320px 定向档以外的极窄视口与浏览器缩放下 24px 的 DPR 取整边界。
- 未把 P1 夹具纳入 `responsive.e2e.ts` 的矩阵扩面清单（仍只在三档全量 project 上跑）。
- **E2E 只锁宿主短边**（`min(宽, 高) ≤ 视觉盒上限`）：长边被放大的情形由 `capture:styles` 的 `hit-form.*` `width` / `height` 与 `test:visual` 兜底，不在几何探针内。
- Slider 滑柄、RadioButton 指示器、ColorPicker 滑柄在改动前**没有**几何基线，其 `width` / `height` 是变更后冻结的绝对值；「视觉不变」由 `test:visual` 42 passed 与期望值（18 / 18 / 18 边框盒）共同锁定，而非前后 diff。
