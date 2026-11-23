# 待办归档 · Phase 35

> 本文件为[待办归档](../todo-archive.md)主窗口迁出的 Phase 35 原始归档块；迁移为机械操作（相对链接深度 `../` → `../../`，同目录 `./` → `../`），正文不改写。迁出时点见[深度归档索引](./index.md)。

## Phase 35：质量与无障碍收口、DataTable 进阶、长尾 Rating（**2026-11-16 完成并归档；本阶段不发布**）

- 时间：2026-11-15 用户就[第十九轮范围评估](../../design/governance/2026-11-15-next-stage-scope-evaluation-19.md) §3 裁定 D1 质量收口 + DataTable 进阶 / D2 五项质量债全取 / D3 不发布 / D4 长尾 Rating 后登记；2026-11-16 交付 **3 条主线 / 10 条原子条目**并完成阶段归档（用户指令「开始归档」）。
- 范围与授权：**质量与无障碍 5 / DataTable 进阶 2 / 长尾 3**，构成对账 **5 + 2 + 3 = 10**；本阶段**不发布**（`latest` 维持 `1.3.0`）。范围与验收口径的唯一载体见 [Phase 35 登记批次](../../design/governance/2026-11-15-phase35-registration.md) §1 / §2。
- 非目标：DataTable 虚拟滚动（需新增运行时依赖）、i18n 二期 / RTL、Form 规则引擎、`useDialog`、Sidebar / ScrollPanel、破坏性 API、新增运行时依赖、自动发布、Storybook / Tailwind preset / 文档站多版本。

### M1 质量与无障碍收口（5 条）

- **M1-1 Select 展开态补 `inert`**（`7ac7e22`；记录见 [M1-1](../../design/governance/2026-11-16-phase35-m1-1-select-open-inert.md)）：新增 `suppressOutside`，面板落位后给背景补 `inert`、关闭先于焦点归还回退；`select-open-zh` 恢复 `aria-hidden-focus`，三视口 E2E 与负向对照；RG R1 `Pass`（4 warning）/ R2 `Pass` / R3 `Pass`。
- **M1-2 截断配方 × 提示布局守卫**（`974d7b8`；记录见 [M1-2](../../design/governance/2026-11-16-phase35-m1-2-tooltip-truncation-guard.md)）：成对夹具 + 三视口 E2E（真截断出提示 / 装得下静默）；采样差异实测后取「等价 E2E 守卫」而非扩展 `capture:styles`；RG R1 `Pass` / R2 `Pass`。
- **M1-3 记录计数一致性机检**（`501bb09`；记录见 [M1-3](../../design/governance/2026-11-16-phase35-m1-3-record-count-guard.md)）：`check-governance-counts` 新增算式恒等式、新记录文件面模板与用例数归因，含负向语料；RG R1 `Reject`（4 blocker）/ R2 `Pass`。
- **M1-4 逐格提示退出开关**（`ae28ad4` / PR #62；记录见 [M1-4](../../design/governance/2026-11-16-phase35-m1-4-cell-tooltip-optout.md)）：实测 60 × 8 默认单元格约 0.6–0.7 s、+480 提示实例；新增 `cellTooltips`（默认开启，关闭保留截断配方）；RG R1 / R2 `Reject` / R3 `Pass`。
- **M1-5 Menu `#icon`**（`26bbb97` / PR #63；记录见 [M1-5](../../design/governance/2026-11-16-phase35-m1-5-menu-icon-slot.md)）：普通项与子菜单触发器新增前置图标插槽，`--caomei-menu-item-gap` 恢复作用于「图标 + 文本」；RG R1 `Reject` / R2 `Pass`。

### M2 DataTable 进阶（2 条）

- **M2-1 列可见性与列顺序**（`28ba5b6` / PR #64；记录见 [M2-1](../../design/governance/2026-11-16-phase35-m2-1-column-visibility-order.md)）：受控 `columnVisibility` / `columnOrder`，隐藏列在表头 / 表体 / 空态 `colspan` / 冻结偏移同步，展开列禁止隐藏；RG R1 / R2 `Reject` / R3 `Pass`。
- **M2-2 受控列宽**（`0aa3c66` / PR #65；记录见 [M2-2](../../design/governance/2026-11-16-phase35-m2-2-column-sizing.md)）：`columnSizing` 优先于列定义 `width`，冻结偏移、`min-width` 与截断上限同源；拖拽与持久化归使用方；RG R1 / R2 `Reject` / R3 `Pass`。

### M3 长尾 Rating（3 条）

- **M3-1 实现与导出**（`ad2ffbf` / PR #66；记录见 [M3-1](../../design/governance/2026-11-16-phase35-m3-1-rating.md)）：封装 Reka `RatingRoot` / `RatingItem`；整星 / 半星、只读 / 禁用、`max` / `size` / `label` / `clearable`；半星按 primitive 步进裁切、着色只取「最右一格」；RG R1 `Reject`（3 blocker）/ R2 `Pass`。
- **M3-2 10 语 locale 与台账**（`042cf1a` / PR #67；记录见 [M3-2](../../design/governance/2026-11-16-phase35-m3-2-rating-locale.md)）：新增 `rating` 命名空间（区域名 / 只读名 / step 数值模板），10 语同批；台账 31 命名空间 / 32 消费组件；RG R1 `Pass`。
- **M3-3 文档、示例、E2E 与视觉基线**（`ffe3f08` / PR #68；记录见 [M3-3](../../design/governance/2026-11-16-phase35-m3-3-rating-docs-e2e.md)）：中英组件页与示例、侧栏 / 总览 / §5 / §11 登记、三视口 E2E（点击 / 键盘 / 只读 / 半星）、亮暗视觉基线；RG R1 `Reject`（1 blocker）/ R2 `Pass`。

### 阶段总结

- **3 条主线 / 10 条原子条目全部交付**；本阶段不发布，`latest` 维持 `1.3.0`。
- **提交对账**：窗口 `git log --oneline --no-merges bf67d19..8e5dc0d` → **12**（登记 / 评估、十条条目交付与 PR 合并、规划状态回填）。
- **质量门**：`pnpm verify` `exit 0`；`master` 在 `8e5dc0d` 上 CI（Test / Visual / CodeQL / Security Alerts / Deploy Pages）全绿；三视口 E2E（Select inert、DataTable 列能力与整格提示、Rating）与视觉全量（含新增 rating 亮暗基线）通过；`governance:check` / `docs:check` 全绿。
- **长期任务**：第 **39** 轮门槛复核（2026-11-16，Phase 35 收口轮）——待执行批次 **0 项**；条件触发 **1 项维持**（表单控件公共 props 契约）；已判定不纳入 5 项维持；`capture:styles` 399 项 0 差异。
- **wisdom 蒸馏**：`pnpm distill:wisdom --check` → **16 条活跃**（< 阈值 20，不蒸馏）。

### 回扫口径（三段式）

- **机检面**：`check:governance-records` / `check:planning-numbers` / `check:stage-counts`（无进行中阶段分支）/ `check:archive-rg-counts` / `check:governance-counts` / `check:design` / `docs:check` 全绿（`docs:check:line-count` 主窗口值见文首口径）。
- **人工面**：`todo.md`（清空阶段状态句与条目表）/ `roadmap.md`（§1 当前态、Phase 35 行与 §5 深度归档范围）/ `todo-archive.md`（本块入窗、Phase 28 ~ 30 迁出、索引行与口径句）/ `archive/index.md`（三份新文件与压缩记录）/ `recurring.md`（第 39 轮）逐处核过；`.session/current-task.yaml`、`.session/runtime-state.json` 同批切到「无进行中阶段」。
- **未处理面**：历史记录中指向 `docs/plan/todo.md` 的时点陈述按既有边界不回改；本批无新增失效指针（机检 0 命中，人工面未发现需改指者）。

### 遗留与后续候选

- **浮层隔离扩面（观察项，非条目）**：MultiSelect / AutoComplete / DatePicker 等经 Reka 打开浮层的组件仍只有 `aria-hidden`；是否扩为全库隔离属范围决策（见 [M1-1 记录](../../design/governance/2026-11-16-phase35-m1-1-select-open-inert.md) §5）。
- **DataTable 列宽拖拽手柄 / 虚拟滚动**：本阶段取受控契约，拖拽交互与虚拟滚动（需新增依赖）维持候选。
- 其余条件触发候选见 [Backlog](../backlog.md)；启动需用户明确授权。
