# 待办事项

本文档记录当前阶段的原子条目与验收状态；准入、命名与阶段衔接规则见 [规划规范](../standards/planning.md)，本文档不重述。

## 当前阶段

> **Phase 6：组件库补全与规范化（momei 迁移就绪）** — 2026-09-14 经用户授权启动；范围由全量 [Backlog](./backlog.md) 整体评估得出，并经用户决策收敛为 **4 条主线**（覆盖需求 1 / 2 / 3 / 4 / 7）。
>
> **阶段目标**：在下游迁移（[Phase 7](./roadmap.md)，momei 优先）之前，使组件库在**组件覆盖、设计规范、主题、许可合规**四方面达到「可迁移」状态。
>
> **阶段非目标（明确不做）**：组件国际化机制（需求 5，含短期 zh-CN / en-US）与移动端 / 响应式（需求 6）经用户决策**延后**，退回 [Backlog](./backlog.md) 候选池；实际下游迁移（Phase 7）；首版发布（Phase 5 第二阶段，待外部前置）；Nuxt 模块真实集成（随 Phase 7 迁移需要评估）；富文本 / 图表（维持外购结论）。

### 主线 M1：下游使用复核（需求 2）

- 执行范围：以 momei 实际调用为样本，逐组件核对 props / slots / variants / 事件 / 尺寸语义是否满足真实需求。
- 非目标：直接改造组件（缺口交由 M3 承载）。
- 最小验收标准：台账覆盖 momei 拟替换的全部 PrimeVue 组件；每条给出「满足 / 需增强 / 需新组件」结论并回写 [Backlog](./backlog.md)。
- 条目：
  - [x] 建立 momei 组件使用台账（使用点、用法、缺口）
  - [x] 产出复核报告与缺口清单并回写 Backlog
- 交付物：[momei 使用复核台账](../design/governance/2026-09-14-momei-usage-audit.md)（59 个 PrimeVue 组件 / 1515 次用法；满足 21 / 需增强 23 / 需新组件 15）。
- 复核结论：23 项「需增强」回写 [Backlog §1.1](./backlog.md)；新识别 `AutoComplete` / `ButtonGroup` / `DataView` 回写 §1.2；`IconField` / `InputIcon` 可由 `Input` 插槽承载（建议降级）；`DataTable + Column` 与 `Button` 为迁移关键路径。
- 待用户决策：M3 组件清单与「需增强」项是否按台账调整（原 9 项候选成立，另建议纳入 Button / DataTable 增强）。

### 主线 M2：设计规范与主题预设（需求 7 + 需求 4）

- 执行范围：沉淀设计规范（尺寸 / 颜色 / 主题 / 风格及细节）并落为可验证脚本；提供 `caomei` 与 `momei` 两套默认主题预设（含暗色）。
- 非目标：引入 Tailwind / UnoCSS；改变组件与样式解耦原则。
- 最小验收标准：规范文档成文；校验脚本可在已有与新增组件上运行并纳入 `pnpm verify`；两套预设均支持亮 / 暗切换并在文档站可演示。
- 条目：
  - [x] 设计规范文档（尺寸档位 / 语义色 / 对比度 / 圆角 / 阴影 / 图标尺寸 / 排版）
  - [x] 从 caomei-auth 与 momei 提取语义 token 映射表
  - [x] 规范可验证脚本（硬编码颜色 / 档位常量一致性 / 旧尺寸命名；rgb 字面量按预算约束）
  - [x] `caomei` 主题预设（亮 / 暗）
  - [x] `momei` 主题预设（亮 / 暗）
  - [x] 预设承载形式（随 `styles.css` 分发 + 根元素 `data-preset`）与文档站演示切换
  - [x] 新组件规范模板 / 自检清单
- 交付物：
  - [设计规范](../design/design-spec.md)（token 体系、尺寸 / 颜色 / 主题 / 风格规范、迁移映射、校验脚本与新组件自检清单）。
  - 主题预设：`src/styles/theme.css`（基础 + `.dark` / `[data-theme]` / `prefers-color-scheme`）与 `src/styles/presets/caomei.css`、`presets/momei.css`；文档站顶栏提供预设演示切换。
  - 校验脚本：`scripts/governance/check-design.mjs`（`pnpm check:design`，已纳入 `pnpm verify`）+ 单测 `check-design.test.mjs`。

### 主线 M3：组件补全与关键增强（需求 1）

- 执行范围：按 [M1 复核台账](../design/governance/2026-09-14-momei-usage-audit.md) 补齐缺口组件与关键增强。**核心路径优先：Button 形态增强、DataTable + Column 能力增强**；其余按序推进。
- 非目标：实现无下游使用证据的长尾组件；富文本 / 图表（维持外购结论）。
- 最小验收标准：组件具备 API 文档、单元测试与英文文档页；符合 M2 设计规范；`pnpm verify` 通过。
- 条目：
  - 核心路径（优先）：
    - [x] Button 形态增强：`tone` 语义色、`text` / `outlined` 映射（`ghost` / `secondary`）、`rounded`、`iconPosition`
    - [ ] Button 角标（`:badge`）增强（M1 台账标记待评估，未纳入本批）
    - [x] DataTable 列能力 + 排序 + 加载态（嵌套字段 `accessor`、可排序列、列 `class` / `style`、受控与非受控排序、`loading`）
    - [x] DataTable 行选择（`selectionMode` / 全选 / `v-model:selection`）
    - [x] DataTable Lazy 分页与分页集成
    - [x] DataTable 冻结列
  - 缺口组件：
    - [x] Divider
    - [ ] InputGroup / FloatLabel
    - [ ] AutoComplete（Reka Combobox）
    - [ ] ButtonGroup
    - [ ] DataView
    - [ ] Panel（先评估能否由 Accordion 承接）
    - [ ] DatePicker / Calendar（Reka Alpha，锁版本 + 回归）
    - [ ] Drawer（Reka Alpha，或由 Dialog 派生）
    - [ ] SplitButton
    - [ ] ColorPicker（Reka Alpha）
    - [ ] Stepper
- 已决策（不新建组件）：`IconField` / `InputIcon` 采用 `Input` 的 `prefix` / `suffix` 插槽降级方案；映射规范归口 M2 设计规范。

### 主线 M4：依赖许可合规（需求 3）

- 执行范围：为核心依赖声明许可，并纳入发布流程。
- 非目标：变更依赖选型。
- 最小验收标准：声明文件覆盖 `reka-ui`（MIT）/ `@tanstack/vue-table`（MIT）/ `@lucide/vue`（ISC）/ `vue`（peer，MIT）；随分发保留并进入发布前检查。
- 条目：
  - [ ] 第三方许可声明文件（`THIRD-PARTY-LICENSES` / `NOTICE`）
  - [ ] 纳入发布产物（`files` / semantic-release assets）与发布前检查

## 阶段验收通则

完成条件见 [路线图 §4](./roadmap.md)；每个原子条目收尾必须经 `@code-reviewer` Review Gate，涉及界面或样式时另经 `@ui-validator` 验证。

## 完成情况概览

> 本节仅汇总未完成项以供跨阶段可见，**不构成阶段待办登记**（登记需用户明确决策）。

- 已归档：Phase 0 ~ Phase 4、Phase 5 第一阶段。
- 进行中：Phase 6（本阶段，4 条主线）。
- 未启动 / 未完成：Phase 5 第二阶段、Phase 7、Phase 8；范围与依赖见 [路线图](./roadmap.md)。
- 延后 / 未纳入本阶段的候选：组件国际化机制、移动端与响应式，以及其余候选见 [Backlog](./backlog.md)。
