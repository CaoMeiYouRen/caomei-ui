# Phase 30 登记批次记录

> 创建时间：2026-11-10
> 触发：用户就[下一阶段范围评估（第十四轮）](./2026-11-10-next-stage-scope-evaluation-14.md) §3 的 D0 ~ D5 作出裁定：**D0 ① 直接登记 / D1 ⑤ A4 + A5 + A6（不发布）/ D2 ② 不发布 / D3 ② 仅触摸 P1 / D4 ① 纳入治理小项 / D5 ① 维持独立审查页**。
> 依据：[规划规范 §3 / §4](../../standards/planning.md)（阶段编号只在**授权启动**时分配；登记 = 用户决策后同步全部载体）。
> **本记录是该次登记的唯一口径载体**：`todo.md` / `roadmap.md` / `backlog.md` / 治理索引只引用本记录的结论。

## 1. 编号分配与构成

- **编号**：取授权启动时已有最大编号（Phase 29）+ 1 = **Phase 30**。
- **构成（5 条主线 / 5 条原子条目）**：表单输入动效 **1** + 基础与布局动效 **1** + 选择器动效 **1** + 触摸目标 P1 **1** + 治理小项 **1**；对账 **1 + 1 + 1 + 1 + 1 = 5**。
- **取向来源**：D1 ⑤ 取动效 A4 / A5 / A6（A7 数据展示后置）；D2 ② **本阶段不发布**（继续积累，`latest` 维持 `1.2.0`）；D3 ② 仅纳入触摸目标 **P1**（P2 维持 Backlog）；D4 ① 纳入 `check-stage-counts` 无阶段交叉校验；D5 ① 文档站 demo 保持「尊重系统偏好 + 独立审查页」。
- **组合口径**：D1 ⑤ 为 3 条动效条目；叠加 D3 ② 的 P1 与 D4 ① 的治理小项后为 **5 条**。原评估 §3 的「D1 ⑤ = 3 主线 / 3 条目」为仅动效时的读数，最终构成本记录为准。

## 2. 逐条范围与验收口径

| 条目 | 主线 | 范围 | 验收口径 |
|:---|:---|:---|:---|
| **M1-1** | 表单输入动效（A4） | InputGroup / CheckboxGroup / Form / Slider 补状态动效；既有表单控件统一到 `--caomei-motion-*`；TagsInput reduced-motion 补齐；Input / InputNumber / Textarea 共享层已由 Phase 29 A1 统一，本批不重复 | `minimal` 逐选择器零差异；`expressive` 下聚焦 / invalid / 步进 / 勾选 / 滑块状态有动效；`reduce` 无位移 / 缩放；`capture:styles` 默认组 0 差异；`test:visual` 通过 |
| **M2-1** | 基础与布局动效（A5） | Avatar / Tag / Divider / Row / Col 补齐；Card / Image / Badge 的过渡统一到 token；不做常驻装饰 | `minimal` 零差异；增删 / hover / 加载态在 `expressive` 下时间轴非空（`sampleTriggeredTimeline` 或 `transition-duration > 0`），且无布局位移（`test:visual` / 布局位移探针）；`reduce` 压平 |
| **M3-1** | 选择器动效（A6） | ColorPicker / Calendar 补齐；AutoComplete / DatePicker / MultiSelect / SelectButton / ToggleButton 统一；MultiSelect reduced-motion；Select 面板状态（共享层归 A1 / A4） | Portal 面板在 `html` 轴下生效；面板 / 选中 / 清空状态有动效；`reduce` 无位移 / 缩放；面板开关无终态错位 |
| **M4-1** | 触摸目标 P1 | 表单控件盒 **17** 个目标（Checkbox 2 / RadioButton 6 / Switch 2 / Slider 3 / ColorPicker 滑柄 4）扩到不可见命中区 ≥ 24×24（WCAG 2.5.8）；视觉盒不变。P0（34 个 icon 按钮）已由 Phase 27 完成；P2（35 个行高受限目标）不在本阶段 | 命中区 E2E 覆盖 17 个目标（三视口）；视觉基线 0 差异 + `capture:styles` 对 `::after` 命中区逐属性断言；相邻目标 **Chebyshev 中心距 ≥ 24**（两个 24×24 方命中区不相交）；键盘 / 焦点不回归 |
| **M5-1** | 治理小项 | `check-stage-counts` 的「无进行中阶段」分支增加两项增量断言：`todo.md` 的 `## 当前状态` 段不得出现 `Phase \d+`、不得含 `todo-archive.md` 链接；补负向单测 | 守卫在两种残留形态下失败、正常状态通过；单测覆盖；`governance:check` 接入不变 |

## 3. 非目标（本阶段）

- 动效 **A7 数据展示**（DataTable / DataView / Paginator / Progress / Skeleton），留待下一阶段。
- 触摸目标 **P2**（35 个行高受限 / 内联行目标），留待独立阶段。
- **不发布**（D2 ②）：`latest` 维持 `1.2.0`，不执行 `pnpm release`、不推送；版本积累至下一阶段。
- 文档站 demo 过渡恢复（D5 ① 维持现状）；RTL / 二期语言；长尾组件（Sidebar / ScrollPanel / BackTop / Rating / TimePicker）；破坏性 API 变更；Tailwind / UnoCSS；文档站多版本托管；Storybook。
- 不引入运行时依赖。

## 4. 载体同步与候选移出

| 载体 | 动作 |
|:---|:---|
| `docs/plan/todo.md` | 声明「当前进行中阶段：Phase 30」+ `## Phase 30 原子条目` 段（5 行，状态「待执行」） |
| `docs/plan/roadmap.md` | §1 当前态改为 Phase 30；阶段表新增 Phase 30 行 |
| `docs/plan/backlog.md` | 移出 A4 / A5 / A6（§1.10 3 行）与 `check-stage-counts` 交叉校验（§1.6 1 行）；触摸行由「P1 / P2」收敛为「P2」单行（P1 移出、P2 保留）。候选池 **39 → 35**（3 + 1 行移出；触摸行仍计 1 行） |
| `docs/design/governance/index.md` | 新增本记录 |
| `.session`（git-ignored） | `current_phase` / `active_plan` / `next_steps` 与 `runtime-state.json` 的 `plan_state` 同批同步 |

## 5. 风险与前置

1. **基线稳定性**：A4 ~ A6 必须保持 `minimal` 零差异；新增动效只在 `data-motion="expressive"` 下生效，`reduce` 显式压平；每条完成后跑 `capture:styles` / `test:visual`。
2. **触摸 P1 与动效批次重叠**：P1 的 Checkbox / RadioButton / Slider 与 **M1-1（A4）** 同文件，P1 的 **ColorPicker 滑柄 4** 与 **M3-1（A6）** 同文件。建议 M4-1 排在 M3-1 之后（或与 M3-1 同批协调），M1-1 与 M4-1 按「先动效后命中区」实施，避免同一文件多批冲突。
3. **Phase 29 守卫复用**：`check-motion-contract` 的布局属性白名单与 `motion-acceptance` 采样装置可直接复用；新增动效不得引入裸时长或未登记关键帧。
4. **实现期回扫（M4-1 收口义务）**：P1 落地会改写既有口径，收口判据 = `grep -n 'P1' docs/design/responsive.md docs/design/theming.md` 逐处清零或改指。已知面：`responsive.md` §1 非目标句、§3 矩阵 #16、§4 断言 7、§5（不纳入 / 决策① / P0 落地条），`theming.md` §5.2，以及 `test/e2e/helpers/hit-target.ts`。
   - **装置硬事实**：`MIN_HIT_TARGETS = 37` 为 P0 夹具下界，P1 新增独立夹具与下界，不改 37；`collectHitTargetProblems` 的 `maxVisualBox` 默认 18，Switch 视觉盒 40×22，需按目标分级；Chebyshev 配对只在同一交互族内进行，避免跨组件误报。
   - **Switch 归属**：P1 的 Switch 2 个目标与 M1-1 的「既有表单控件统一」可能同文件，M1-1 实施时按实际 diff 回填 §5.2 的组件名单。
5. **文件数**：A4 ~ A6 合计 33 个组件页，单条仍可能超过 10 文件阈值；按交互族拆提交，由 Review Gate 判定。
6. **版本面**：本阶段不发布；阶段收口前执行长期任务第 **33** 轮门槛复核。

## 6. Review Gate

- **audit-depth**：`standard`（规划载体登记 + 跨载体计数 + 候选池变更，零 `src/**`）；时间盒 ≤ 8 分钟。
- **R1**：待回填。
- **复查基线**：本记录 §1 / §2 / §4；`docs/plan/todo.md` 当前状态与条目表；`docs/plan/roadmap.md` §1 与阶段表；`docs/plan/backlog.md` §1.5 / §1.6 / §1.10 计数；[第十四轮评估](./2026-11-10-next-stage-scope-evaluation-14.md) §3；`docs/design/governance/index.md` 摘要。
