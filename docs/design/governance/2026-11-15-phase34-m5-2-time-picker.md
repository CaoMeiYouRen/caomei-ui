# Phase 34 M5-2：TimePicker 实现与导出

> 创建时间：2026-11-15
> 触发：用户「继续推进剩余待办」。范围与验收口径见 [Phase 34 登记批次](./2026-11-14-phase34-registration.md) §2 的 M5-2 行。

## 1. 交付面（9 文件）

| 面 | 文件 |
|:---|:---|
| 组件 | `src/components/time-picker/time-picker.vue`：三个数字输入 + 12 小时制日序选择；公开 prop 为 `modelValue` / `label` / `ariaLabel` / `hourFormat` / `showSeconds` / `step` / `minValue` / `maxValue` / `disabled` / `readonly` / `id`（完整签名以 `types.ts` 为准；`locale` prop 已在 M5-3 移除，日序改取 `timePicker` 内置键） |
| 类型 | `src/components/time-picker/types.ts`：`TimePickerProps` / `TimePickerStep` / `TimePickerEmits` |
| 导出 | `src/components/time-picker/index.ts` |
| 单测 | `src/components/time-picker/time-picker.test.ts`：11 例，逐点清单——渲染标签 / 组名 / 时分输入、`showSeconds` 秒输入、12 小时制显示与日序选项、日序切换改小时、编辑分钟保留日期、`step` 步进（分 5 / 时 2）、`minValue` / `maxValue` 夹取、`disabled` / `readonly`（含只读下方向键不改值）、`minValue > maxValue` 不夹取、空值与非法日期、`ariaLabel` 覆盖 |
| 包入口 | `src/index.ts` |
| Nuxt 自动导入 | `src/nuxt/components.ts`（`CaomeiTimePicker`） |
| a11y 受检面 | `test/a11y/fixtures.ts`：`CaomeiTimePicker` 夹具，预算 63 → 64 |
| 夹具 | `test/e2e/fixtures/app.vue`：`#time-picker`（24 小时制含秒 + 12 小时制 + 受控值回显，供浏览器验证与后续 E2E 复用） |
| 规范 | `docs/standards/testing.md` §2.1：浏览器读数须标注元素与口径（computed / authored / rect），flex 子项的 `display` 记块化后的计算值 |

治理索引、记录本体与规划状态位不计入上表。复算口径（2026-11-15）：`git status --porcelain -uall | wc -l` 为 12，扣除治理载体 3（本记录、`docs/design/governance/index.md`、`docs/plan/todo.md`）后为 9，与表中 9 行求和一致；同批包含 BackTop 夹具注释中的规划编号清理（`check-planning-numbers` 受检面）。

## 2. 决策

1. **`v-model` 用 `Date \| null`**：与 `DatePicker` 的模型口径一致（时间部分即值，日期部分仅作载体）；回写时保留当前值的日期，无值时取今天，避免每次编辑都跳到某个固定日期。
2. **不直接暴露 Reka `TimeField` 的 12 小时制**：首版按「封装 Reka」实现后实测两组缺陷——段 `TimeFieldInput` 需自行渲染文本（空插槽导致可见区域只剩冒号）；12 小时制下 `aria-valuenow` 仍是 24 小时内部值、无日序段，且 Reka 的 dayPeriod 判定只识别英文（与 `date-picker/time-input.vue` 已记录的结论一致）。按「与 DatePicker 时间输入行为对齐」的验收优先级，改为自建三段数字输入 + 本地化日序选择；`TimePicker` 与 `DatePicker` 仍各自持有实现，不做预抽取。**重评估触发**：两处的时间段夹取 / 日序换算出现第二次分叉修复时再抽取共享层。
3. **`hourFormat` 只接受 `'12' \| '24'`**：与 `DatePicker` 同名同取值；12 小时制下小时输入范围 1–12，日序文案取内置 `timePicker.am` / `pm`（M5-3 起不再依赖 `Intl` 与 `locale` prop），切换日序只改小时。
4. **`showSeconds` 控制精度**：命名与 `DatePicker` 对齐；关闭时强制秒归零，避免旧值残留不可编辑的秒数。
5. **`step` 为 `{ hour?, minute?, second? }`**：数字输入的 `step` 属性与上下键增量共用同一口径，默认每段 1；不另造 `minuteStep`。
6. **`minValue` / `maxValue` 用 `Date` 入参、只比较时间部分**：命名与 `DatePicker` 对齐；编辑结果夹到区间内，`minValue > maxValue`（跨日）视为无解、不夹取（保留编辑值，不做跨日推断）。
7. **可访问名双通道**：`label` 渲染可见标签并经 `aria-labelledby` 关联；提供 `ariaLabel` 时改用它且不再输出 `aria-labelledby`（避免标签名压过显式名）。`id` 落在根容器供测试与定位。
8. **空值显示为空而非 0 点**：`null` 与非法日期下三个输入均为空串，不把「未填」读成午夜；首次编辑才以今天为日期载体。

## 3. 验证

| 面 | 结果 |
|:---|:---|
| 单测 | `npx vitest run src/components/time-picker` → 全绿；11 例（清单见同名测试文件） |
| 导出 / a11y 受检面 | `npx vitest run src/nuxt test/a11y` → 全绿（`CaomeiTimePicker` 在清单与夹具内） |
| 浏览器验证（V） | 对象：夹具 `#time-picker` 的 `#time-picker-default`（24 小时制含秒）与 `#time-picker-12`；入口 `vite --config test/e2e/fixtures/vite.config.ts`，Playwright Chromium 临时探针；取值方式：`input.element.value`、`getComputedStyle(group)`、`getBoundingClientRect()`；两视口 1280×900 与 390×844 读数逐项相同——三个输入可见值 `9 / 30 / 0`（当前实现不补零）、聚焦小时输入按 `ArrowUp` 后值 9 → 10、回显 `10:30:00`、12 小时制小时输入 `10`、日序选项「上午 / 下午」、按元素分列：`.caomei-time-picker__field`（`role="group"`）——`border-width: 1px`、`border-radius: 8px`、`display: flex`（作为 flex 子项被块化，作者声明为 `inline-flex`）、盒高 36px；`.caomei-time-picker`（根容器）——`display: flex`（纵向排列标签与字段）；暗色激活 `document.documentElement.dataset.theme='dark'`，聚焦态 `.caomei-time-picker__field` 的边框计算值 `rgb(96, 165, 250)` |
| `pnpm typecheck` / ESLint | 通过 |
| 文档门禁 | `lint-md`（记录 / 索引 / todo）通过；`check-governance-records` / `check-governance-counts` / `check-planning-numbers` / `check-stage-counts` / `check-components-overview` / `check-design-catalog` 通过 |
| `pnpm verify` | `exit 0` |

## 4. Review Gate

- **R1-A（`standard`，组件 / 类型 / 单测 / 导出）**：`Reject`（2 blocker：`TimeFieldInput` 无默认插槽导致可见时间段不渲染任何数字；12 小时制 `aria-valuenow` 越界、无日序段且沿用英文文案，与 DatePicker 已记录的「Reka 12 小时制不可用」结论冲突。6 warning：`ariaLabel` 与 `aria-labelledby` 冲突、`as unknown as TimeValue` 双重断言、attrs 未路由、跨日 `min > max` 静默、`null` 与 00:00 不可区分、单测只断言 ARIA 不判可见；2 suggest）。
- **R1-A 修复**：改为自建时间输入（三段数字 + 本地化日序选择），不再暴露 Reka 的 12 小时制；`ariaLabel` 存在时不再输出 `aria-labelledby`；空值显示为空；`minValue` / `maxValue` 夹取；单测新增 10 例、累计 11 例，覆盖可见值、日序切换、步进、边界夹取与跨日不夹取、空值、禁用 / 只读（含只读下方向键不改值）与显式命名。浏览器验证按可见值重做。**warning 处置**：attrs 透传随单根元素自然落到外层（组内描述改为 `aria-describedby` 关联）；`as unknown as TimeValue` 随重写消失；其余按决策 3 / 6 / 8 收敛。
- **R1-B（`standard`，记录 / 索引 / 文档）**：`Reject`（2 blocker：§4 用例数 10 与 §3 / §6 的 11 冲突、§3 秒段读数 `00` 与实现的 `0` 不符；12 warning / suggest：`step` 注释仍写 Reka、§1 用 `min` / `max` 旧名、读数缺复现要素与逐点清单、夹具引用不存在的 E2E、§1 缺复算口径、缺文档门禁、决策数量词、warning 对账、BackTop 注释清理未登记等）。
- **R1-B 修复**：§4 改「新增 10 例、累计 11 例」，§1 给出 11 条逐点清单；§3 读数按实测改 `9 / 30 / 0` 并补对象 / 入口 / 取值方式 / 暗色激活方式 / 两视口一致；`step` 注释改自建口径；§1 公开 prop 改 `minValue` / `maxValue`；夹具注释去掉不存在文件；§1 补复算口径；§3 补文档门禁与 `pnpm verify exit 0`；决策 2 改「两组缺陷」并补重评估触发；§4 补 warning 处置。
- **R2-A（`quick`）**：`Reject`（1 blocker：`readonly` 下方向键仍抛 `update:modelValue`；记录侧 follow-up：`min > max` 语义、索引仍写 Reka、`aria-readonly`、补零、prop 命名等）。已修复：键盘处理早返回 `disabled || readonly` 并补用例；日序选择补 `aria-readonly`；去掉分 / 秒补零与 DatePicker 对齐；prop 改名 `minValue` / `maxValue`；跨日区间不夹取并补用例；描述改 `aria-describedby`。
- **R3（`quick`，A/B 修复点）**：`Reject`（1 blocker：§3 把四项读数混记在同一 `group` 元素上）。
- **R4（`quick`，单点）**：`Reject`（1 blocker：`display` 记成作者声明值 `inline-flex`，flex 子项的计算值是 `flex`）。
- **R5（`quick`，单点）**：`Pass`（0 blocker；R4-B1 关闭；新增规范条「读数标注元素与口径」可执行）。

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

本记录 §1 ~ §5；`time-picker.vue` 的 `displayHour` / `dayPeriodLabel` / `commit` / `clampToRange` / `onSegmentKeydown`；`types.ts` 三个导出；`time-picker.test.ts` 十一个用例；`src/index.ts` / `src/nuxt/components.ts` / `test/a11y/fixtures.ts` / `test/e2e/fixtures/app.vue` 的登记行。
