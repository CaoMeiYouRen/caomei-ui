# Phase 31 M3-1：数据展示动效（A7）交付

> 创建时间：2026-11-12
> 触发：Phase 31 M3-1（[Phase 31 登记批次](./2026-11-12-phase31-registration.md) §2）。
> 依据：[动效体系评估](./2026-11-08-motion-system-evaluation.md) §4 / §5 / §6；基础层见 [Phase 29 M1-1 记录](./2026-11-08-phase29-m1-1-motion-foundation.md)。

## 1. 交付清单

| 组件 | 模式 | 动效 |
|:---|:---|:---|
| DataTable | `expressive` 新增 | 行底色（悬浮 / 选中 / 斑马纹）过渡；排序激活列的图标与多列序号提亮；展开区透明度入场 |
| DataView | `expressive` 新增 | 加载 / 空态 / 内容切换与列表 ↔ 网格切换的透明度入场 |
| Paginator | 审计（不改） | 控件 `border-color` / `background-color` / `color` 过渡已消费 motion token，hover / 选中 / 焦点同元素，无遗漏状态面 |
| ProgressBar | 审计（不改） | 确定态 `width` 过渡消费 `duration-slower`（布局属性白名单已登记）；不定态循环动画在加载类白名单内 |
| Skeleton | 审计（不改） | `pulse` / `wave` 循环动画在加载类白名单内，`reduce` 降速 2.4s 维持 |
| Chart | `expressive` 新增（容器层） | 内核就绪后画布透明度入场；占位于画布同盒，动画本身不引入位移 |
| RichTextEditor | `expressive` 新增（容器层） | 内核就绪后编辑器透明度入场，时长取 `duration-instant`（`autoFocus` 时焦点环更快脱离入场层） |

- **缺省 `minimal` 零差异**：新增规则全部以 `:where([data-motion='expressive'])` 前缀隔离，`minimal` 无对应选择器。
- **reduce 压平**：入场动画包在 `@media (prefers-reduced-motion: no-preference)` 内（reduce 下 `animation-name: none`），过渡由 `[data-motion]` token 归零。
- **不做整表重排动画**：排序 / 分页不引入位移或高度动画，避免大数据量下的布局抖动。

## 2. 实现要点

1. **行状态只过渡底色**：`background-color` 单属性过渡，悬浮 / 选中 / 斑马纹切换不改变盒模型；排序引发斑马纹奇偶翻转时各行按 220ms 淡入，属已接受观感（非重排动画）。
2. **排序提亮走 `th[aria-sort]`**：不新增 class，激活列图标与多列序号取 `--caomei-color-primary-text`；列宽由既有占位元素（图标 + `1ch` 序号）保持，提亮不改变列宽（E2E 断言）。
3. **展开区只做透明度入场**：高度由新增行承担，`@keyframes` 只动 `opacity`；`transform` / `height` 逐帧相等（E2E 断言）。
4. **DataView 用 `contentKey` 驱动重挂载**：键为「loading / empty / ready-{layout}」，状态与布局切换都重放入场动画；`value` 刻意不入键，筛选 / 翻页刷新数据不重挂载消费方内容。布局切换本就替换 `#list` / `#grid` 两个不同插槽，故未新增状态丢失面。
5. **容器层只覆盖就绪入场**：Chart / RTE 的内核按需加载，动画宿主是内核根元素；占位 `role="status"` 路径未改，a11y 语义不变。
6. **不做多列排序的整表动画**：多列排序只提亮激活列，不逐行错峰淡入，避免与「避免整表重排动画」口径冲突。

## 3. 验证证据

| 项 | 结果 |
|:---|:---|
| `pnpm lint:check` / `pnpm lint:css:check` | 通过 |
| `pnpm typecheck` | 通过 |
| `pnpm check:motion-contract` | 通过（文件 55 / 声明 192，无白名单新增） |
| 定向 `vitest`（data-table / data-view / chart / rich-text-editor） | 16 文件 / 216 tests 通过 |
| `pnpm exec playwright test test/e2e/data-display-motion.e2e.ts` | **27 passed**（9 用例 × 3 视口） |
| `pnpm exec playwright test test/e2e/container-motion.e2e.ts` | **12 passed**（4 用例 × 3 视口） |
| `pnpm capture:styles` | **0 差异**（399 项，`minimal` 计算样式与冻结基线一致） |
| `pnpm test:visual` | 36 passed / 6 failed——失败全为 `font-latin-button` / `font-latin-input` / `font-mixed-button` 亮暗；**把夹具还原到 HEAD 后单跑同批字体用例仍同向失败**，判定为环境既有字体基线问题，与本次改动无因果，基线未更新 |

### 3.1 真实浏览器采样口径

- DataTable：行过渡时长等于 `--caomei-motion-duration-base`（`expressive` 220ms）；悬浮 / 选中底色前后不相等；排序激活后图标与序号颜色变化且列宽不变；展开区动画名锚定 `caomei-data-table-expansion-in`、起点透明、终点不透明、`transform: none`、高度逐帧相等；快速 hover→移出后收敛回初始底色（可打断）。
- DataView：状态切换与布局切换两条时序均采样到 `caomei-data-view-content-in`，起点透明 / 终点不透明 / 无位移；布局类名切到 `--grid`。
- Chart / RTE：内核就绪后计算样式绑定入场动画名与对应时长 token，`transform: none`；`minimal` 与 `reduce` 下均为 `none` / `0`。
- 三档视口与 `minimal` / `reduce` 双向覆盖；页面 console error / pageerror 均为 0。

## 4. 风险与边界

1. **斑马纹排序淡入**：排序后 `nth-child(even)` 归属变化，各行按 220ms 淡入，长表观感接近「整表闪一下」。已接受：它不是重排动画，且 `minimal` 无此效果；若后续需要更克制的实现，可把过渡限定到 `:hover` / `--selected`。
2. **排序提亮属颜色语义**：提亮由 `data-motion` 轴控制，`minimal` 下不出现「哪列已排序」的颜色提示（语义仍由 `aria-sort` 承担）。后续如认为对比度提示应默认生效，需把该规则移出动效轴——属行为变更，不在本批。
3. **DataView 布局切换的滚动位置**：重挂载后内容高度可能变化，滚动位置行为与迁移前一致（布局差异由插槽内容决定），本批未改变。
4. **容器层不做时间轴采样**：Chart / RTE 的内核按需加载，入场动画在导航时已播放完毕，故只断言计算样式声明；时间轴采样由 DataTable / DataView 承担。
5. **`test:visual` 字体基线**：6 项字体族失败为环境既有问题（负向对照已复现），未在本批更新基线；后续如换环境需重新冻结。
6. **任务粒度**：本批 7 文件 / 约 530 行（4 组件 + 夹具 + 2 套 E2E），未超 10 文件 / 800 行阈值。

## 5. Review Gate

- **audit-depth**：`standard`；时间盒 ≤10 分钟（R3 ≤8 分钟）。
- **R1**（`standard`）：**Pass**，0 blocker / 4 warning / 5 suggest。warning：`.sort-index` 零覆盖、选中态断言无判别力、「可打断」无证据、`test:visual` 失败口径不一致；suggest：`.sort` 颜色过渡为空操作、动画名断言过宽、夹具冗余 id、注释含 `A7`、斑马纹淡入观感。处置：全部 warning 修复，suggest 采纳 4 条、第 5 条登记为已接受观感。
- **R2**（`standard`）：**Pass**，0 blocker / 4 warning / 5 suggest。warning：`__items` 包裹层改变 DOM 契约、layout 切换动画口径不成立、Chart / RTE 零 E2E、loading / empty 死面；suggest：裸 `（A7）` 编号、RTE `autoFocus` 焦点可见性、注释错误前提、「可打断」用例竞争、排序提亮语义需文档声明。处置：撤销包裹层改 `contentKey`、补布局切换与容器层 E2E、RTE 降为 `duration-instant`、剔除编号、断言改读 token、补 `minimal` 轴。
- **R3**（`standard`，仅复审修复点）：**Pass**，0 blocker / 0 warning / 4 suggest（3 条已采纳：token 断言 / `minimal` 轴 / `contentKey` 计算属性；1 条留待下批统一清理既有动效规格里的规划编号）。
- **复查基线**：本记录 §1 / §2；`src/components/{data-table,data-view,chart,rich-text-editor}/*.vue` 的 `:where([data-motion='expressive'])` 段落；`test/e2e/data-display-motion.e2e.ts` 与 `test/e2e/container-motion.e2e.ts`；`test/e2e/fixtures/app.vue` 的 `#data-display-motion` section。
