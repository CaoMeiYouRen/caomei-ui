# Phase 28 M1-2 交付记录：DatePicker 范围选择的文档、示例与基线

> 创建时间：2026-11-07
> 条目：M1-2「DatePicker 范围选择：文档 / 示例 / E2E / 视觉与 API 基线」。
> 口径来源：[Phase 28 登记批次记录](./2026-11-07-phase28-registration.md) §2；实现定形见 [M1-1 设计记录](./2026-11-07-phase28-m1-1-datetime-range-design.md)。

## 1. 交付面

| 面 | 交付 |
|:---|:---|
| 中英组件页 | 新增「范围选择 / Range selection」节（模型、半开区间、清空、`closeOnSelect`、`showTime` 不兼容、`min/max`、分隔符与类型说明）；「未实现」段收窄为 `multiple` 与其余项；无障碍节补区间可访问名、`data-selection-*` 与区间带 |
| 中英示例 | `date-picker/range.vue`（表单场景：`min/max` + 区间 + 已选区间回显） |
| 迁移文档 | 组件页迁移表新增 `selection-mode="range"` / `manual-input="false"` 映射；`primevue-migration` 中英新增「日期区间」行与迁移后自检项 |
| E2E | `test/e2e/date-picker-range.e2e.ts`：区间选择、单日区间与清空、键盘两端确定、可访问名与面板可访问名；三档视口 12 例 |
| 视觉基线 | 形态轴新增 `date-range-picker`（区间面板亮 / 暗 2 张）；`test:visual` 40 passed |
| 计算样式 | `capture:styles` 374 项 0 差异（触发器显式 id 变更后重冻结 3 条 dump） |
| a11y | `CaomeiDatePicker` 夹具改为打开态的区间形态并补 `requiredSelectors`；新增 1 条 axe `aria-valid-attr-value` incomplete 例外（`controlsWithinPopup`，引用的 id 经单测 / E2E 证明存在） |
| API / 冻结面 | 包根导出名 **330 → 333**（3 个新公开类型）；API 面 props **517 → 518**；冻结记录 §2.3 追加增量注记；`version-policy` 中英同步 |

## 2. 顺带修复（实现侧）

1. **触发器 id 被覆盖导致面板引用悬空**：Reka `PopoverTrigger` 生成的 `id` 被本组件按钮的 `id` 绑定覆盖（缺省时连属性一起丢失），面板 `aria-labelledby` 指向不存在的 id。修复为「按钮不绑定 `id`」，并新增内部接线组件 `popover-trigger-id.vue`：在触发器之前把显式 `id` 写入 `PopoverRoot` 的 `triggerId`，使触发器 DOM id 与面板 `aria-labelledby` **同源**；不做事后移除。`PopoverRoot` 以 `id` 为 key，运行时变更 id 时重建上下文（Reka 的 `triggerId` 非响应式值）。
2. **面板 `role="dialog"` 缺可访问名**：为面板补 `aria-label`（显式 `label` > 透传 `aria-label` > 语言兜底）。正常路径名称由 `aria-labelledby` 指向触发器提供，`aria-label` 仅在该 IDREF 无法解析时兜底；由打开态 a11y 夹具首次暴露。
3. **区间带样式误伤单日期日历**：区间内日期的浅色带规则补区间标记类 `.caomei-calendar__day--range`，避免单日期日历的选中日（同样带 `data-selected`、无 `data-selection-*`）被改成浅底。

## 3. 计数与基线

| 项 | 旧值 | 新值 | 复算 |
|:---|:-:|:-:|:---|
| 包根导出名 | 330 | **333** | `src/index.ts` 的 TypeScript 导出枚举（`Caomei*` 100 / `use*`·`provide*` 7 / 其余 226） |
| API 面 props | 517 | **518** | `pnpm docs:gen` 后对 `component-meta.json` 求和（events 86 / slots 71 / exposed 18） |
| locale 键 / 语 | 80 | **83** | `check:locale-keys`（28 命名空间 / 10 语）；本批只同步 `check-locale-keys.test.mjs` 的期望值 |
| `capture:styles` 项 | 374 | **374**（3 条 dump 重冻结） | `pnpm capture:styles` |
| 视觉基线 | 38 | **40**（PNG 34 → 36） | `pnpm test:visual` 用例数；截图数按 `__screenshots__` 计 |
| a11y 夹具预算 | 61 | **61**（同一夹具改为打开态区间） | `test/a11y/fixtures.ts` |

## 4. 验证证据

- `pnpm lint:check` / `pnpm lint:css:check` / `pnpm lint:md:check` exit 0。
- `pnpm typecheck` / `pnpm typecheck:docs` exit 0。
- `pnpm test`：152 文件 / 2983 例（含 `check-locale-keys` 期望值 80 → 83 的同步与新增的显式 id / 动态 id 用例；E2E 注释中的规划编号已移除，`check-planning-numbers` 通过）。首轮全量在并行负载下 `split-button.test.ts` 挂 1 例（`separator 项渲染`），隔离复跑 24 passed、`--maxWorkers=2` 全量 2983 passed，判为既有并行负载 flaky 类、与本批无因果。
- `pnpm build` + `pnpm check:build` 通过（24 个 exports 产物）。
- `pnpm docs:build` 通过；`pnpm docs:check` 全通过。
- `pnpm test:e2e`（本 spec）三档视口 12 passed；`pnpm test:visual` 40 passed；`pnpm test:a11y` 68 passed；`pnpm capture:styles` 0 差异。
- 已知边界：E2E 仅覆盖本 spec 的三档视口；全量 E2E 与 `verify` 在条目收口批次执行。

## 5. Review Gate

- **audit-depth**：`standard`（文档 / 示例 / E2E / 视觉基线 / 计数载体；含实现修复，无发布 / 安全面）。时间盒 ≤ 10 分钟。
- **R1（`standard`）**：`Reject`（1 blocker / 6 warning / 3 suggest）。**已修**：B1 组件页 / 代码注释对 Label in Name 的绝对表述改为条件表述；W1 `MIN_FORM_AXIS` 5 → 6、负向对照补区间面板、describe 标题同步（历史记录 `MIN_FORM_AXIS = 5` 补「当时」快照标记）；W2 清空语义按三种情形改写；W3 显式 `id` 改为在 `PopoverRoot` 上下文注入（新增内部接线组件），触发器 DOM id 与面板 `aria-labelledby` 同源，不再需要事后移除；W4 E2E 键盘断言精确到 11–12、可访问名改用真实 accname、面板改为断言 `role=dialog` 名称；W5 a11y 夹具补 `requiredSelectors` 并改写注释与例外 judgment；W6 迁移文档「收窄」改为「放宽」。**已采纳** S1 计数口径、S2 本记录 §6 豁免留痕、S3 `version-policy` 登记类型迁移项。**未修**：无（S4 分隔符口径维持 follow-up）。
- **R2（`standard` delta）**：`Pass`（0 blocker / 2 warning / 4 suggest）。**已修**：记录 §2 第 1 / 2 条按「上下文注入」与「labelledby 为主、aria-label 兜底」重写；`id` 运行时变更改为 `:key` 重建 Root 并补单测；E2E 补 `toHaveRole('dialog')`；负向对照与形态轴注释补第 6 类；`version-policy` 去掉具体版本号并补「可能导致下游 typecheck 失败（非运行时破坏）」。**未修**：无（字体覆盖自检未打开区间面板，记 follow-up）。
- **实测用时**：R1 起于 `2026-11-07T15:34:34+08:00`，结果返回约 `16:44`（≈70 分钟，含子代理排队 / 调度等待；超 ≤10 分钟时间盒，按 §3.3 记为调度成本信号）；R2 起于 `2026-11-07T17:04:45+08:00`，结果返回约 `17:36`（≈31 分钟，同样含调度等待）。

## 6. diff 粒度

本批 22 个文件、约 +123/−28 行加 6 个新增文件（约 254 行），低于 800 行阈值但超过 [规划规范 §5](../../standards/planning.md#_5-任务粒度约束) 的 10 文件建议值。豁免依据：中英组件页 / 示例 / 迁移指南必须成对同步（`check-i18n-parity` 与 `docs:check` 逐对校验）；计数载体（`version-policy` 中英、冻结记录、guard 测试常量）与实现同源；2 张视觉基线必须与形态轴登记同批（否则 `test:visual` 在中间提交必红）。实现侧 3 项顺带修复（触发器 id、面板命名、区间带标记类）直接由本批新增的打开态 a11y 夹具与视觉基线暴露，拆开会留下「基线红 / 例外不成立」的中间态。
