# Phase 28 M1-1 设计记录：DatePicker 范围选择与时间交互定形

> 创建时间：2026-11-07
> 触发：[Phase 28 登记批次记录](./2026-11-07-phase28-registration.md) §5 风险 1——`showTime` × `range` 未定形，须先落设计记录再实现。
> 依据：[下一阶段范围评估（第十二轮）](./2026-11-07-next-stage-scope-evaluation-12.md) §3.1 A-1；issue [#28](https://github.com/CaoMeiYouRen/caomei-ui/issues/28) §1。

## 1. 结论

`CaomeiDatePicker` 新增 `selectionMode: 'single' | 'range'`（默认 `single`）。区间模式：

1. 模型为已完成的闭区间 `[Date, Date]`，未选择为 `null`；**半开区间不对外**。
2. 面板使用 Reka `RangeCalendarRoot`（`reka-ui` 2.10.4），与单日期面板共用同一呈现层与样式。
3. **不支持 `showTime` / `showSeconds` / `hourFormat`**：区间只承载日期；同时传入 `showTime` 时给出开发期告警并忽略时间层。
4. 触发按钮显示 `开始日期 – 结束日期`；可访问名以可见区间文本为主体，并以隐藏文本补「开始 / 结束」语义（不使用 `aria-label` 覆盖可见文本，规避 Label in Name 风险）。
5. `multiple` 不在本阶段范围（无下游用例），不提供该取值。

## 2. 逐项定形

| 项 | 定形 | 理由 |
|:---|:---|:---|
| 模型 | `Date`（`single`）/ `[Date, Date]`（`range`）/ `null` | 登记口径明确 `[Date, Date]`；二元组天然表达闭区间 |
| 半开区间 | 面板内部保留，不写回模型；完整后才抛 `update:modelValue` | Reka 先抛 `{ start, end: undefined }`，若受控写回会清空内部刚建立的起点，导致区间无法完成（实测行为，见 `RangeCalendarRoot` 的 `modelValue` watcher） |
| 清空 | 两端皆无时写回 `null` | 与单日期取消选择同语义；`closeOnSelect` 同时生效 |
| 同一天两端 | 允许，产生 `[d, d]` 单日闭区间；已存在完整区间时再次点击该日取消 | 复用 Reka `changeDate` 的既定行为，不另造语义 |
| `closeOnSelect` | 默认 `true`：完整区间确定后收起；`false` 保持展开 | 与单日期一致 |
| `showTime` | 区间模式忽略；`range + showTime` 打开发期告警 | Reka `RangeCalendarRoot` 无时间层；两个时间输入会翻倍交互面且超出本阶段验收口径。下游用例为登录日志日期筛选（`manualInput: false`），无时间诉求 |
| `minValue` / `maxValue` | 逐端生效（Reka `RangeCalendarRoot`） | 保留既有契约 |
| `fixedWeeks` / `weekStartsOn` / `weekdayFormat` / `locale` | 原样透传 | 保留既有契约 |
| `preventDeselect` | 透传 | 保留既有契约 |
| 可访问名 | 显式 `label` > 透传 `aria-label` > 兜底名（仅无可见文本时输出）；兜底名：无区间时「日期范围」。已选区间时**不输出 `aria-label`**，名称 = 可见区间文本 + 触发器内隐藏文本「（开始 / 结束）」 | 登记要求「可访问名区分开始 / 结束」；同时满足 WCAG 2.5.3 Label in Name（可见文本必须包含在名称内），避免 `aria-label` 覆盖可见文本 |
| 面板可访问名 | 与单日期面板同源（`label` > `aria-label` > 「日历」），根节点补 `role="group"` | 复用既有接线，避免第二套可访问名规则 |
| 视觉 | 区间内日期用主色 16% 浅带，两端实底主色；悬停预览 10% 浅带 | `data-selection-start` / `data-selection-end` 可区分端点；单日期路径不产生这两个属性，外观不变 |
| 类型面 | `DatePickerModelValue = Date | DatePickerRange | null`；新增`DatePickerRange` / `DatePickerSelectionMode` | `selectionMode` 是运行期 prop，无法静态窄化模型；`single` 消费方需把绑定值声明为联合类型（见组件页） |

## 3. 新增文案键

`datePicker` 命名空间新增 3 键（10 语同步）：`range` / `rangeStart` / `rangeEnd`。每语文案键 **80 → 83**，命名空间数与预注册集合不变；冻结面增量已回填 [冻结面终审记录](./2026-10-24-phase26-m1-1-freeze-final-review.md) §2.5。

## 4. 受影响文件

- `src/components/date-picker/date-picker.vue` / `types.ts` / `index.ts` / `date-picker.test.ts`
- `src/components/calendar/calendar-view.vue` / `calendar-range-panel.vue`（新增）/ `types.ts`
- `src/components/_shared/date.ts`
- `src/locale/types.ts` 与 10 个语言文件、`docs/components/locale.md` 中英、`docs/guide/version-policy.md` 中英

## 5. 未纳入与后续

- `multiple`（范围外，未立候选）。
- `numberOfMonths` / `view` / `disabledDates` 等 `Calendar` 侧既有未实现项维持原状。
- 文档 / 示例 / E2E / 视觉基线 / 迁移映射由 M1-2 承担。

## 6. Review Gate

- **audit-depth**：`standard`（组件逻辑 + 类型 + 文案键 + 单测；无发布 / 安全面）。时间盒 ≤ 10 分钟。
- **R1（`standard`）**：`Pass`（0 blocker / 5 warning / 5 suggest）。warning：受控 / 非受控覆盖不足、新增用例固定 `nextTick`、公开文档与 API 基线后置、文件数超建议值缺留痕、浏览器验证后置；suggest：`aria-label` 覆盖可见文本、`TimeParts` 多余公开、模型形状守卫、分隔符硬编码、区间带 CSS 特异性。
- **R2（`standard` delta）**：`Pass`（0 blocker / 4 warning / 3 suggest）。已关闭：受控 / 非受控用例（含 `v-model` 回写后再次展开）、`expectSettled` 收敛、Label in Name 结构、`TimeParts` 收口、形状守卫、区间带 muted 恢复。仍后置：公开文档 / API 基线 / 导出名计数（M1-2）、E2E / 视觉基线 / 浮层稳定性（M1-2 V 阶段）、分隔符口径（follow-up）。
- **实测用时**：R1 起于 `2026-11-07T12:08:59+08:00`，结果返回早于 `12:44` 的宿主复跑；R2 起于 `13:53:03`、止于 `14:48:38`（≈55 分钟，**超 ≤10 分钟时间盒**，含子代理排队 / 调度等待；两轮均按 `standard` 范围输出，未扩大审查面）。按 AI 协作规范 §3.3 记为档位偏松 / 子代理调度成本信号。
- **diff 粒度豁免**：本批 24 改 + 2 新增（新增约 700 行，< 800 行阈值），文件数超 [规划规范 §5](../../standards/planning.md#_5-任务粒度约束) 的 10 文件建议值。豁免依据：① 10 语 locale 键必须同提交，否则 `check:locale-keys` 在中间态断链；② locale 计数载体（`locale.md` 中英 / `version-policy` 中英 / 冻结面增量）与实现同源，拆开会让守卫在中间提交必红；③ 功能面实为 6 个源文件（`date-picker` × 3、`calendar` × 2、`_shared/date`）+ 2 个新增文件。后续同类批量按「守卫强耦合载体」同批判定，不再按文件数硬拆。
- **发布前置**：M1-2 未落地（中英组件页、示例、E2E、视觉基线、API 基线与冻结面增量、迁移映射）前不得发布 `1.2.0`。
