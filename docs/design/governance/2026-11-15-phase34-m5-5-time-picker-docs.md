# Phase 34 M5-5：TimePicker 文档、示例、登记与 E2E

> 创建时间：2026-11-15
> 触发：用户「继续推进剩余待办」。范围与验收口径见 [Phase 34 登记批次](./2026-11-14-phase34-registration.md) §2 的 M5-5 行。

## 1. 交付面（15 文件）

| 面 | 文件 |
|:---|:---|
| 组件页（中 / 英） | `docs/components/time-picker.md` / `docs/i18n/en-US/components/time-picker.md`：用法、精度与小时制、边界与空值、无障碍、样式定制、PrimeVue 迁移对照、自动 API 表 |
| 示例（中 / 英） | `docs/examples/time-picker/basic.vue` / `docs/i18n/en-US/examples/time-picker/basic.vue` |
| 画廊登记 | `docs/.vitepress/showcase-registry.json`：`TimePicker`（表单输入，组内字母序） |
| 侧栏 | `docs/.vitepress/config.ts`：中英「表单输入」组内按字母序加入 TimePicker |
| 总览 | `docs/components/index.md` / `docs/i18n/en-US/components/index.md`：组内位置与 §11 一致 |
| 设计登记 | `docs/design/components.md` Tier 3 行（已实现，注明未采用 Reka TimeField 的原因）；`docs/design/documentation-site.md` §11 分组清单 |
| E2E | `test/e2e/time-picker.e2e.ts`：方向键编辑并回写 `v-model`、12 小时制日序切换、分钟输入回写 |
| 视觉基线 | `test/visual/components.visual.ts` 登记 `ds-time-picker`（下界 14 → 15）+ 负向对照规则；`test/e2e/fixtures/app.vue` 固定时间夹具；两份冻结基线 PNG |

治理索引、记录本体与规划状态位不计入上表。复算口径（2026-11-15）：`git status --porcelain -uall | wc -l` 为 18，扣除 3 个治理载体（本记录、`docs/design/governance/index.md`、`docs/plan/todo.md`）后为 15，与表内逐行求和一致。15 文件超过 10 文件阈值。按[规划规范 §5](../../standards/planning.md) 的拆分目的（控制单次改动面）以**提交粒度**拆两层（文档 / 登记与视觉面 → E2E）；不新增条目编号的裁定依据：同一组件的文档、示例、登记、视觉与 E2E 共用同一夹具与同一验收口径，拆成两个条目会让阶段构成计数与登记重算，而单次提交面已被提交粒度控制。

## 2. 决策

1. **迁移对照以 `DatePicker(timeOnly)` 为参照**：PrimeVue 没有独立 TimePicker，时间输入挂在 DatePicker 的 `timeOnly` 上；迁移表按 `timeOnly` / `hourFormat` / `showSeconds` / `step*` / `minDate` / `maxDate` 逐项对照，并注明本库是内联三段输入、无弹层。
2. **视觉面截字段本体**：固定时间 09:30:45，元素级截图；`ds-time-picker` 纳入负向对照（`padding` 注入须使该面报差异），避免截到空面。
3. **E2E 用夹具的受控回显**：默认字段的 `#time-picker-value` 与 12 小时制字段的 `#time-picker-12-value` 分别由各自的 `vModel` 渲染，断言可见输入值与回显字符串，覆盖「编辑 → 受控值」链路（12 小时制字段必须有监听者，否则事件落空）。
4. **12 小时制按初始值断言**：两个字段初始均为 09:30，12 小时制显示 9 与「上午」；切「下午」后该字段回显 21:30，避免把其它用例的状态带入。
5. **文档不宣称弹层**：TimePicker 是内联字段，页面明确写「无弹层」，避免消费者按 DatePicker 的交互预期使用。

## 3. 验证

| 面 | 结果 |
|:---|:---|
| 定向 E2E | `npx playwright test test/e2e/time-picker.e2e.ts` → `exit 0`（三档视口；`pnpm verify` 不包含 e2e / visual，二者需单独执行） |
| 视觉基线 | `pnpm test:visual` → `exit 0`（含 `time-picker-light` / `time-picker-dark` 两份冻结基线） |
| 负向对照 | `VISUAL_NEGATIVE_CONTROL=1` 下 `time-picker` 两项应报差异（与 back-top 同批自证） |
| 文档结构 | `check-docs-structure` / `check-showcase-registry` / `check-components-overview` / `check-design-catalog` → `exit 0` |
| `pnpm verify` | `exit 0`（该命令不含 `test:e2e` / `test:visual`，两类证据按上两行单独留存） |

## 4. Review Gate

- **R1（`standard`，A 文档 / 示例 / 登记 / E2E / 视觉，B 记录 / 索引）**：`Reject`（2 blocker：12 小时制 E2E 断言的字段是单向副本、事件无监听者，三档全红；记录 §2 / §3 的证据与实测相反。6 warning：`showSeconds` 文案与实现不符、负向对照注释类目数、视觉头部注释计数、`verify` 占位、迁移表 `hourFormat` 误标差异、超阈值拆分依据；4 suggest）。
- **R1 修复**：① 12 小时制字段改独立 `v-model`（`timePicker12Value`）并新增回显 span，E2E 改断言该字段，三档复跑全绿；② 记录 §2.3 / §2.4 改写为夹具事实，§3 回填真实结果并注明 `verify` 不含 e2e / visual；③ 两语 `showSeconds` 改为「下一次编辑时秒归零」；④ 负向对照注释不再写类目数；⑤ 视觉头部改为不计数表述、抽样原则改为「确定性」；⑥ 迁移表去掉 `hourFormat` 的伪差异；⑦ §1 补超阈值按提交粒度拆分的依据；⑧ 视觉面的 section 与字段均加 `width: fit-content` 收紧画布，重冻结基线并复验负向对照。
- **R2（`quick`，R1 修复点）**：`Pass`（0 blocker；B1 / B2 关闭，E2E 三档全绿、记录与实测一致；W1 ~ W6 关闭）。follow-up（已收口）：视觉头部残留计数、画布收紧表述。

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

本记录 §1 ~ §5；两语组件页与示例；`showcase-registry.json` 的 TimePicker 项；`config.ts` 中英侧栏的 TimePicker 行；两语总览页对应行；`design/components.md` 与 `documentation-site.md` §11 的登记；`test/e2e/time-picker.e2e.ts` 三例；`test/visual/components.visual.ts` 的 `ds-time-picker` 与负向对照规则。
