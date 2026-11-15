# Phase 34 M4-1：DataTable 固定表头与滚动（`scrollable` / `scrollHeight`）

> 创建时间：2026-11-15
> 触发：用户「继续推进剩余待办」。范围与验收口径见 [Phase 34 登记批次](./2026-11-14-phase34-registration.md) §2 的 M4-1 行。

## 1. 交付面（9 文件）

| 面 | 文件 |
|:---|:---|
| 类型 | `src/components/data-table/types.ts`：新增 `scrollable`（默认 `false`）与 `scrollHeight`（`number \| string`），中英 JSDoc |
| 组件 | `src/components/data-table/data-table.vue`：根容器修饰类、`scrollStyle` 归一化、表头吸顶与分页器吸底的 CSS（仅 `--scrollable` 下生效） |
| 单测 | `src/components/data-table/data-table.scroll.test.ts`：未开启零变更、仅 `scrollable` 不限高、数字归一化、字符串原样与去空白、纯数字字符串按 `px`、`calc()` 原样、空值 / 非正数 / `Infinity` / 无法解析的字符串不生效（后者开发期告警）、非滚动态忽略 `scrollHeight`、行与分页器不回归 |
| E2E | `test/e2e/data-table-scroll.e2e.ts`：数字限高 = `240px` + 纵向溢出 + 表头 `sticky` + 滚到底表头贴顶且首行移出；字符串 `18rem` 按根字号换算 + 分页器在顶部与中部均吸底可见 + 最后一行可达；冻结列 + 选择 + 行展开 + 排序同用（横向滚动后冻结表头命中自身、层级高于普通表头）；未开启时无限高、无纵向溢出、表头非 `sticky` |
| 夹具 | `test/e2e/fixtures/app.vue`：新增 `#data-table-scroll`（40 行 × 数字 / 字符串 / 冻结列三张表，含分页器与选择 / 展开 / 排序），追加在模板末尾 |
| 示例（中 / 英） | `docs/examples/data-table/scrollable.vue` / `docs/i18n/en-US/examples/data-table/scrollable.vue` |
| 文档（中 / 英） | `docs/components/data-table.md` / `docs/i18n/en-US/components/data-table.md`：新增「固定表头与滚动 / Fixed header and scrolling」节、迁移对照 `scrollable` / `scrollHeight` 行、吸底分页器 token 行 |

治理索引、记录本体与规划状态位（`docs/plan/todo.md`）属登记 / 留痕，不计入上表。

## 2. 决策

1. **不改 DOM 结构**：限高、表头吸顶、分页器吸底全部由根容器上的修饰类与 `position: sticky` 实现，不复制表头、不新增包裹层——避免 `capture:styles` 与既有视觉基线因结构变化漂移。
2. **`overflow-y` 只在修饰类下打开**：根容器原本因 `overflow-x: auto` 已把另一轴计算为 `auto`，故「未开启滚动态」的零变更判据用「无限高 + 无纵向溢出 + 表头非 `sticky`」三项，而不是比较 `overflow-y` 的计算值。
3. **数字归一化进样式而非模板**：`scrollHeight` 为 `number` 时直接写进 `max-height` 会得到无效值（浏览器丢弃 `max-height: 240`），故在 `scrollStyle` 里统一转成 `${n}px`；字符串去首尾空白后原样使用。
4. **非正值不生成限高**：`0` / 负数 / `Infinity` / 空串按「未提供」处理，避免 `max-height: 0` 把表体压没；`scrollable` 仍生效（便于运行时切换）。
5. **吸顶表头用既有层级 token**：普通吸顶 `th` 与吸底分页器都用 `--caomei-z-pinned-header`；冻结表头在滚动模式下的额外层级见决策 8（同层会被普通表头按树序覆盖）。
6. **分页器吸底需要不透明背景**：滚动行会从分页器下方透出，故在 `--scrollable` 下给分页器加背景；取值走 `--caomei-data-table-pagination-sticky-bg`（默认 `--caomei-color-bg`），见决策 10。
7. **E2E 三张表分工**：数字态验证归一化与表头吸顶，字符串态验证 CSS 长度与分页器吸底，冻结列态验证双轴吸边时的层叠顺序（并顺带覆盖选择 / 展开 / 排序）；未开启的对照表取自既有 `#data-table-sort-width`，避免为「负向对照」新增无意义夹具。
8. **冻结表头在滚动模式下抬一层**：普通吸顶表头与冻结表头原本同为 `--caomei-z-pinned-header`（3），滚动模式下同层按树序绘制会让靠前的冻结列被其后的普通表头盖住。修法是在滚动模式下把冻结表头设为 `calc(var(--caomei-z-pinned-header) + 1)`——只影响 `--scrollable` 组合，既有非滚动态的层级与 `capture:styles` 采样保持不变。
9. **字符串归一化与数字同口径**：纯数字字符串按 `px` 处理（`max-height: 240` 是无效声明），空值 / `0` / 负数 / `Infinity` 不生成限高，非 CSS 长度字符串不生成并 `warnDev`；`calc()` / `min()` / `max()` / `clamp()` 放行。
10. **吸底分页器背景开放覆盖钩子**：`--caomei-data-table-pagination-sticky-bg`（默认 `--caomei-color-bg`），避免在卡片 / 提亮底色容器里出现一条与行底色不一致的横带，同时维持「CSS 变量 100% 可覆盖」。
11. **文档不宣称复制表头**：吸顶实现与 PrimeVue 的「克隆表头」不同，迁移表与正文都写明本库不复制表头，避免消费方按 PrimeVue 的 DOM 结构写选择器。

## 3. 验证

| 面 | 结果 |
|:---|:---|
| 单测 | `npx vitest run src/components/data-table` → 全绿 |
| 定向 E2E | `npx playwright test test/e2e/data-table-scroll.e2e.ts test/e2e/data-table-keyboard-scroll.e2e.ts test/e2e/data-table-sort-width.e2e.ts` → 三 project 全绿 |
| 判别力 | E2E 前置断言「40 行在 240px 下必须溢出」「冻结列表横向溢出」；滚动后「首行移出 + 表头贴顶」；冻结列用例断言层级严格大于普通表头并在横向滚动后做中心点命中；分页器可见性在 `scrollTop = 0` / 中部 / 底部三处采样（顶部是最有判别力的位置）；负向对照「未开启时无纵向溢出且表头非 `sticky`」；单测覆盖空值 / 非正数 / `Infinity` / 无法解析字符串的回落 |
| `capture:styles` | 0 差异。该采样面不含 `position` / `z-index` / `max-height`，故它只说明既有受检面无漂移，**零行为变更**由「新增 CSS 全部挂在 `--scrollable` 下 + 默认不产类名与内联样式」的代码事实与未开启态负向对照支撑 |
| 文档门禁 | `npx lint-md`（记录 / 索引 / todo / 中英组件页）通过；`check-i18n-parity` 通过；`check-example-refs` 通过；`docs:build` 与 `docs:check` 随 `pnpm verify` 复跑 |
| `pnpm typecheck` / ESLint | 通过 |
| `pnpm verify` | `exit 0`（含 `lint:md:check` / `docs:check` / `docs:build` / 全量单测与构建）；`pnpm capture:styles` 在归一化与断言加强后复跑，仍为 0 差异 |

## 4. Review Gate

- **R1-A（`standard`，组件 / 单测 / E2E / 夹具）**：`Reject`（1 blocker：滚动模式下冻结表头与普通吸顶表头同为 `z-index: 3`，横向滚动时冻结列被普通表头覆盖，且文档宣称该组合可用而无覆盖；3 warning：字符串分支漏掉非正值与无效值、吸底分页器背景硬编码无覆盖钩子、吸底断言只在滚到底采样且兼容组合缺覆盖；3 suggest：`capture:styles` 不能作为零变更证据、单测未卸载实例、JSDoc 缺字符串边界）。
- **R1-A 修复**：① 滚动模式下冻结表头 `z-index: calc(var(--caomei-z-pinned-header) + 1)`，夹具补冻结列 + 选择 / 展开 / 排序的组合表，E2E 断言层级严格大于普通表头且横向滚动后中心点命中自身；② 字符串与数字同口径回落（纯数字按 `px`、非正值与无效值不生效、无法解析时 `warnDev`），补 `'0'` / `'0px'` / `'-1rem'` / `'abc'` / `NaN` / `calc()` 用例；③ 分页器背景改为 `--caomei-data-table-pagination-sticky-bg`，两语文档补 token 行；④ 分页器可见性改在顶部 / 中部 / 底部三处采样；⑤ 记录删除 `capture:styles` 作为零变更证据的表述；⑥ 单测改用 `enableAutoUnmount(afterEach)` 卸载实例，另保留 `restoreAllMocks`；⑦ JSDoc 与两语文档补「限高应不小于表头 + 一行」「字符串须为有效 CSS 长度」。
- **R1-B（`standard`，记录 / 索引 / 文档）**：`Reject`（2 blocker：英文页引用的示例文件缺失导致 `check-example-refs` 失败、§2 决策 5 / 6 仍写已被 R1-A 否决的旧设计；5 warning：决策编号重复、`capture:styles` 抄录读数、§3 缺文档门禁、修复 ⑥ 与 suggest 不对应、索引把 `capture:styles` 当结构性证据；3 suggest）。
- **R1-B 修复**：① 新增 `docs/i18n/en-US/examples/data-table/scrollable.vue`（英文列名 / 文案），`check-example-refs` 恢复通过；② 决策 5 / 6 改为与现行实现一致并回链决策 8 / 10；③ 末条决策重编号为 11；④ §3 删除读数计数；⑤ §3 补文档门禁行；⑥ 单测改为 `enableAutoUnmount(afterEach)` 真正卸载实例；⑦ 索引删去 `capture:styles` 括注，改为「结构不变见记录 §2 决策 1」；⑧ 合并 §3 重复的单测行；⑨ §1 文档行补 token 行。

## 5. 遗留

| 编号 | 内容 | 落点 |
|:---|:---|:---|
| F1 | 承接 M1-1：可测量盒的真实布局级持久守卫 | 本阶段 |
| F7 ~ F9 | 承接 M1-2 | 见 M1-2 记录遗留节 |
| F10 / F11 | 承接 M1-3（F12 已收敛） | 见 M1-3 记录遗留节 |
| F14 | 承接 M1-5：验证表计数须与逐点清单求和一致 | 见 M1-5 记录遗留节 |
| F16 / F17 | 承接 M1-6 | 见 M1-6 记录遗留节 |
| F18 | 承接 M3-1：Select 展开时兄弟节点仅 `aria-hidden`、未 `inert` | 见 M3-1 记录遗留节 |

## 6. 复查基线

本记录 §1 ~ §5；`data-table.vue` 的 `scrollStyle` / `rootClass` 与 `--scrollable` 四段 CSS；`types.ts` 的 `scrollable` / `scrollHeight`；`data-table.scroll.test.ts`；`data-table-scroll.e2e.ts` 三个用例；`app.vue` 的 `#data-table-scroll`；两语文档的「固定表头与滚动」节与迁移对照行；中英示例 `docs/examples/data-table/scrollable.vue` / `docs/i18n/en-US/examples/data-table/scrollable.vue`。
