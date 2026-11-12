# Phase 31 M4-1：触摸目标 P2 交付（行高受限 + 内联行）

> 创建时间：2026-11-12
> 触发：Phase 31 M4-1（[Phase 31 登记批次](./2026-11-12-phase31-registration.md) §2）。
> 依据：审计 §4 / §5 的 P2 行（[触摸目标实测复核记录](./2026-10-16-phase25-m2-2-touch-target-audit.md)）；原语与判据见 [P0 / P1 记录](./2026-11-10-phase30-m4-1-hit-target-p1.md)。

## 1. 交付清单（28 个指针目标 + 7 个非目标排除）

| 目标族 | 数量 | 处置 | 命中区 | 视觉盒 |
|:---|:--:|:---|:---|:---|
| DataTable 排序按钮 | 3 | 挂 `.caomei-hit-target`（`::after` 不可见扩展） | 24×24 | 58×18 不变 |
| Breadcrumb 链接 | 2 | 同上（`<a>` 上 `::after` 居中扩展） | 24×24 | 28×18 / 56×18 不变 |
| Select 清除按钮 | 1 | 同上（短边 20 由伪元素补到 24） | 24×24 | 20×36 不变 |
| 字段族内联行·普通 Input | 8（审计 §3.1：`field` 族） | 控件盒 `align-self: stretch` 填满外壳内容高 | 34 高（真实控件盒） | 外壳 36 / 28 / 44 不变 |
| 字段族内联行·TagsInput | 4（审计 §3.1：`tags-input` 族） | 根节点补 click-to-focus（复用 MultiSelect 的守卫：`button` / `input` 目标不拦截） | 外壳面 ≥24 | 不变 |
| 字段族内联行·MultiSelect / AutoComplete | 5 + 5（审计 §3.1：两族各 5） | **不改**：锚点已绑定点击聚焦，有效目标即锚点面 | 锚点面 ≥24 | 不变 |
| MultiSelect 值片（5）+ 值片内 icon（2） | 7 | **不改**：值片根无点击处理、icon 为装饰，非指针目标 | — | — |

- 合计：**28 个交互目标** = 内联行 **22**（`field` 8 + `tags-input` 4 + `multi-select` 5 + `auto-complete` 5，按审计 §3.1 的宽度签名归并）+ 行高受限 **6**；另 **7 个非目标排除**（值片 5 + 值片内 icon 2），22 + 6 + 7 = 35，与审计 §4 一一对应。

## 2. 实现要点

1. **行高受限目标复用既有原语**：`data-table.vue` / `breadcrumb-item.vue` / `select.vue` 只加类名，`::after` 24×24 居中；不新增 token、不改布局、不改 DOM 语义。
2. **Breadcrumb 用 `<a>` 自身的包含块**：链接保持 inline（不改 `display`），`position: relative` 后 `::after` 以行内盒为包含块居中，跨项间距（`space-2`）内不重叠。
3. **普通 Input 必须放大控件自身**：Input 根容器没有 click-to-focus（与 MultiSelect / AutoComplete / TagsInput 的锚点不同），因此命中区只能由控件盒承载——`align-self: stretch` 使控件填满外壳内容高（md 34 / sm 26 / lg 42），文字仍垂直居中，外壳视觉盒不变。
4. **按组件区分绑定方式**：`multi-select.vue:173` / `auto-complete.vue:305` 的锚点 `@click` 聚焦输入，故其 10 个输入行由锚点面承接；TagsInput 原先只有清除按钮的 `@click`（`tags-input.vue:144`），根节点无聚焦行为，本批补 `onRootClick`（与 MultiSelect 同守卫：`button` / `input` 目标不拦截），使其 4 个输入行的有效目标扩到外壳面。
5. **值片与 icon 排除有据**：MultiSelect 值片根为无交互容器（删除按钮已由 P0 覆盖），值片内 icon（14×14）为装饰性图形。
6. **探针新增 P2 分族**：`P2_FAMILIES` 复用逐轴 `max(边长, 24)` 判据与 `visualBox` 上限（Breadcrumb / 排序 18、Select 清除 20）；内联输入行单独断言「控件短边 ≥24 + 外壳高度不超单行契约」。

## 3. 验证证据

| 项 | 结果 |
|:---|:---|
| `pnpm lint:check` / `pnpm lint:css:check` | 通过 |
| `pnpm typecheck` | 通过 |
| 定向 `vitest`（tags-input / input / select / breadcrumb / data-table，12 文件） | **318 passed** |
| `pnpm exec playwright test test/e2e/hit-target.e2e.ts` | **21 passed**（P0 / P0 负向 / P1 ×2 / P2 ×3，三视口；含「字段空白处点击聚焦」四族断言） |
| `pnpm exec playwright test field-overflow / focus-visible-expansion / form` | **129 passed**（布局、焦点、表单无回归） |
| `pnpm capture:styles` | **0 差异**（399 项；Input 控件盒拉伸未进入采样面，外壳与计算样式不变） |
| `pnpm test:visual` | 36 passed / 6 failed——失败均为既有 `font-latin*` / `font-mixed*` 字体族用例（本次改动前后一致），无新增视觉差异 |

- **负向判别力**：P2 复用 P0 已建立的「20px 普通按钮不通过探针」与逐轴内外采样；类名被移除时 `MIN_HIT_TARGETS_P2 = 6` 的总数下界失败，不会静默变绿。
- **矩阵扩面**：`responsive.e2e.ts` 复用同一探针（P0 / P1 选择器不变），P2 仅在三档 project 上常驻运行。

## 4. 风险与边界

1. **Input 控件盒高度随档位**：sm 26 / md 34 / lg 42（外壳高 − 2px 边框），均 ≥24；若下游把 `--caomei-control-height-sm` 调到 <26 或覆盖外壳高度，命中区会随之缩小——与现有「调大命中区须同步相邻轴距」的约束同源。
2. **Breadcrumb 行内盒包含块**：链接文本折行（窄容器 + 长文案）时 `::after` 只覆盖首个行盒；面包屑通常单行，列为已声明边界。
3. **相邻目标间距**：P2 行高受限目标的 24px 命中区依赖布局间距（面包屑 `space-2`、表头单元格 padding）；下游把两个目标压到 <24 仍会重叠，属既有口径。
4. **不覆盖下游页面内的紧凑单元格 / 表格内嵌控件**；未做真机触摸验证（与 P0 / P1 边界一致）；P2 常驻用例只在 390 / 768 / 1280 三档 project 运行，`mobile-320` 档（`only: 'responsive'`）不加载本 spec，320 视口下仅由页面级溢出检查覆盖（已声明边界）。
6. **`capture:styles` 未覆盖控件盒**：Input 控件盒 16 → 34 的几何变化不在采样面内，由 P2 用例与截图兜底；纳入采样面登记为后续增强。
5. **任务粒度**：`git status --porcelain | wc -l` = **15** 文件——5 个 `src/**`（4 个类名 / 样式 1–4 行 + TagsInput 点击聚焦 12 行）、3 个 `test/**`、7 个文档（新记录 + 索引 + 待办 + 响应式 / 主题 / 移动指南中英）。文档属交付台账同批回写；生产代码面（5 文件、约 20 行）远低于阈值，故不拆分提交。

## 5. Review Gate

- **audit-depth**：`standard`（组件样式类名挂载 + 控件盒拉伸 + 探针新增分族；无发布、无依赖、无运行时配置）；时间盒 ≤10 分钟。
- **结论**：见本轮 RG 记录（R1）。
- **复查基线**：本记录 §1 / §2；`src/components/{data-table/data-table.vue,select/select.vue,breadcrumb/breadcrumb-item.vue,input/input.vue}`；`test/e2e/hit-target.e2e.ts` 的 `P2_FAMILIES`；`test/e2e/helpers/hit-target.ts` 的 `MIN_HIT_TARGETS_P2`；`docs/design/responsive.md` §3 #16 / §4 断言 7。
