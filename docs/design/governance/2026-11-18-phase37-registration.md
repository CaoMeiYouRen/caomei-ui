# Phase 37 登记批次：质量收口、选择器空值 opt-in、迁移口径与 Rating 表单集成

> 创建时间：2026-11-18
> 触发：用户就[第二十一轮范围评估](./2026-11-18-next-stage-scope-evaluation-21.md) §4 的决策点作出裁定（D0 ① 推荐组合 A + B（+ C）/ D1 ① `allowEmptyValue`（默认 `false`）/ D2 ① 虚拟滚动不立项 / D3 ① 不发布 / D4 ③ 纳入 Rating 表单集成）。
> **本记录是 Phase 37 范围与验收口径的唯一载体**；`todo.md` / `roadmap.md` 只做状态指针与阶段摘要。

## 1. 阶段构成

- **编号推导**：取授权启动时已有最大编号 Phase 36 + 1 = **Phase 37**（[规划规范 §4](../../standards/planning.md)）。
- **4 条主线 / 9 条原子条目**：质量收口与回归补齐 **3** / 选择器空值 opt-in **3** / 迁移口径 **1** / Rating 表单集成 **2**；构成对账 3 + 3 + 1 + 2 = 9。
- **不发布**（D3 ①）：`latest` 维持 `1.3.0`，不触发 Release。
- **阶段级非目标**：不新增运行时依赖（虚拟滚动不立项，D2 ①）；不做 i18n 二期 / RTL、`useDialog`、Sidebar / ScrollPanel、文档站多版本托管、Storybook / Tailwind preset、破坏性 API、自动发布。
- **主线级非目标**：
  - M1：只补 Phase 36 已交付能力的残余证据与复用，不改已定契约（`resizableColumns` / 隔离工具语义不变）。
  - M2：`allowEmptyValue` 默认 `false`，**默认行为与 Phase 36 M4-1 完全一致**；不做 `emptyValues` 多值形态（D1 ② 未取）。
  - M3：只统一文档口径与迁移陷阱，不改示例语义与公共 API。
  - M4：只做 Rating 与 `CaomeiForm` 的字段契约接入，不做 rules 引擎、不改 Form 既有字段契约。

## 2. 条目与验收口径

| 编号 | 主线 | 条目 | 验收口径 | 文件面 |
|:---|:---|:---|:---|:---|
| **M1-1** | 质量收口 | 列宽拖拽残余补齐 | 冻结列手柄吸边的像素级 E2E 断言；新增 resize 结束事件（拖动 / 键盘 / 复位均触发，载荷 `{ key, width }`）；`columnResizeMinWidth` / `columnResizeStep` 可配置且默认值与现值一致（48 / 8）；三视口 E2E | ≈ 6 |
| **M1-2** | 质量收口 | 浮层隔离残余补齐 | DropdownMenu 增加 E2E 夹具锚点与三视口用例（展开隔离 / Tab 不入背景 / 关闭回退）；页面级（非模态）Popover 三视口 Tab 用例；`disableOutsidePointerEvents` 下的隔离窗口按判定规则处置：**实测面板在该配置下仍会关闭 → 必须修复，并补「点背景后浮层仍开 → Tab 仍不入背景」断言；实测 Reka 保证不关闭 → 登记为边界并锁断言**；两种结论都须在记录中给出实测证据 | ≈ 5 |
| **M1-3** | 质量收口 | 隔离接线下沉 | Select / MultiSelect / AutoComplete / DatePicker / ColorPicker 改用 `useOpenStateIsolation`（或等价共享实现），删除逐份接线；行为与现有一致（全部隔离相关单测与 E2E 不改期望值即可通过） | ≈ 7 |
| **M2-1** | 空值 opt-in | `allowEmptyValue` 契约设计（只设计） | 出设计记录：`allowEmptyValue`（默认 `false`）的作用面、内部私有 token 承载 `''` 的方式、`hasValue` / `data-filled` / 浮标 label / `showClear` 在「选中空值项」时的口径、与 `SelectButton` 的差异；零实现、零 API 落地 | ≈ 2 |
| **M2-2** | 空值 opt-in | 实现（Select / MultiSelect / AutoComplete） | `allowEmptyValue` 为 `true` 时空串选项不再丢弃、面板可渲染与选中、模型原样回显 `''`；为 `false` 时行为与 M4-1 一致（告警 + 丢弃）；`hasValue` / `data-filled` / `showClear` 按 M2-1 口径；`SelectButton` 不参与 | ≈ 6 |
| **M2-3** | 空值 opt-in | 测试与文档 | 单测覆盖两种开关下的丢弃 / 放行 / 回显 / 清除；中英组件页补 `allowEmptyValue` 属性说明与示例，并**改写**既有「选项值不能为空字符串」否定句（`select.md` / `multi-select.md` / `auto-complete.md` 中英六页）；**同步改写 `design-spec.md` §7 Select 家族映射段**（该段是迁移映射的唯一事实源）；示例用组件页内代码块、不新增 `.vue`；`check:planning-numbers` 无编号 | ≈ 10 |
| **M3-1** | 迁移口径 | 哨兵与 PrimeVue 陷阱统一 | `primevue-migration` 常见陷阱补「PrimeVue 允许 `''`、本库默认不允许（`allowEmptyValue` 可放行）」，并**回链 `design-spec.md` §7**、不在第二处复述契约；复算确认现有「全部」哨兵无漂移（口径 `rg -n "value: 'all'" docs/examples docs/i18n/en-US/examples` 逐条核对），出现其他哨兵写法时统一为 `'all'`；不改库代码 | ≈ 4 |
| **M4-1** | Rating 表单集成 | 字段契约接入 | `CaomeiRating` 接入 **`FieldStateProps` + `FieldIdentityProps`**（非输入类控件不引入 `placeholder`；`size` 与既有同名 prop 合一，`invalid` 落到 `role="radiogroup"` 根），在 `CaomeiFormItem` 内可聚焦、可清除、可禁用；单测覆盖标签接线与表单提交值 | ≈ 5 |
| **M4-2** | Rating 表单集成 | 文档与示例 | 中英组件页补「表单集成」节与示例；`CaomeiForm` 页「字段绑定」表与 `form.test.ts` 的「输入类 / 状态型」分组计数按实际复算同步（Rating 归入状态型）；不新增 rules 能力 | ≈ 4 |

> 文件面为登记估算，实施时按[规划规范 §5](../../standards/planning.md) 的 10 文件阈值拆分；生成物与基线不计入。

## 3. 阶段规则

- **任务粒度**：单条 ≤ 10 文件 / 800 行；超出时按 §5 拆分（同批更新三处计数）。
- **质量门**：每条目 `lint` / `typecheck` / 定向测试 / 必要 E2E / Review Gate；阶段末 `pnpm verify`。
- **Review Gate**：每条目至少一轮 `@code-reviewer`；未 `Pass` 不得提交。
- **文档**：组件能力变化同步中英组件页与设计登记；不虚构未实现能力。
- **发布**：本阶段不发布；`release.yml` 与发布触发模型不改。
- **依赖**：不新增运行时依赖。

## 4. 载体同步与候选流转

- `backlog.md`：§1.1 的「Select 家族空串选项值 opt-in」→ 本阶段 M2-1 ~ M2-3（迁出候选池）；§1.1「Rating 半星以外形态 / 表单集成」中**表单集成**部分 → M4-1 / M4-2（「半星以外形态」仍留候选）；§1.6「选择器哨兵 / 迁移口径」→ M3-1（迁出）。
- `todo.md`：新增 Phase 37 状态句与 9 条条目表。
- `roadmap.md`：§1 当前态与 Phase 37 行。
- `.session`：`current_phase` / `plan_state` 同批切到 Phase 37。
- 治理索引：本记录登记一行。

## 5. 风险与前置

| 项 | 风险 / 前置 | 处置 |
|:---|:---|:---|
| M2 `allowEmptyValue` | 放行 `''` 后 `hasValue` / `data-filled` / 清除按钮语义可能自相矛盾 | M2-1 先定口径再实现；默认 `false` 保证存量行为不变 |
| M2 与 Reka | Reka 的 Select / Combobox 选项禁止空串（面板渲染即抛） | 内部以私有 token 承载 `''`，对外原样回显；实现前先探针验证 token 方案 |
| M1-1 resize 事件 | 新增公共事件属 API 增量 | 事件名与载荷在设计内先定，`check:api-surface` 同批更新基线 |
| M1-2 DropdownMenu 夹具 | 新增锚点会触及 `overlay-panels.json` 受检集合 | 与 `check:overlay-z-index` 同批登记 |
| M1-3 接线下沉 | 五组件时序不同（sync 回退 / 焦点兜底） | 以现有单测 + E2E 期望值为回归基线，不改断言 |
| M4 Rating | 与 Form 的字段契约若不一致会引入第二套字段语义 | 复用 `FieldStateProps` / `FieldIdentityProps`（`FieldProps` 仅限输入类），不新造字段契约 |
| 发布 | 本阶段不发布（D3 ①） | 不触发 Release；`latest` 维持 `1.3.0` |

## 6. Review Gate

**结论：Pass**（R3，`quick`，2026-11-18）。

- 轮次：R1 `standard` Reject（1B / 3W / 2S）→ R2 `quick` Reject（1B / 2W / 2S）→ **R3 `quick` Pass**。
- 已关闭：M1-2 判定规则（双分支 + 均须留实测证据）；M2-3 文件面与载体（六页 + `design-spec.md` §7 + 三单测 = 10，仍在阈值内）；§5 基类型命名（`FieldStateProps` / `FieldIdentityProps`，`FieldProps` 仅限输入类）；M3-1 哨兵复算口径（实测 6 处均为 `'all'`）；M4-2 表名（「字段绑定」）。
- 验证：`lint:md:check` / `check:stage-counts`（4 主线 / 9 条 / 条目行 9 / 载体 2）/ `governance:check` 全绿；计数载体（本记录 §1、`todo.md`、`roadmap.md`、`governance/index.md`）一致。
- 遗留（执行期）：M2-3 处于阈值上限，若载体增至 >10 须按规划规范 §5 拆分；`form.test.ts` 的计数同步归属记在 M4-1。

## 7. 验收与回扫

- 阶段完成时按[规划规范 §7](../../standards/planning.md) 归档：`todo.md` 清空、`roadmap.md` 更新、`todo-archive.md` 入窗、`recurring.md` 门槛复核、三段式回扫。
- `.session` 阶段态在登记 / 范围变更 / 归档三类事件同批同步。
