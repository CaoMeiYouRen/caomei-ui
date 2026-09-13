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
  - [ ] 建立 momei 组件使用台账（使用点、用法、缺口）
  - [ ] 产出复核报告与缺口清单并回写 Backlog

### 主线 M2：设计规范与主题预设（需求 7 + 需求 4）

- 执行范围：沉淀设计规范（尺寸 / 颜色 / 主题 / 风格及细节）并落为可验证脚本；提供 `caomei` 与 `momei` 两套默认主题预设（含暗色）。
- 非目标：引入 Tailwind / UnoCSS；改变组件与样式解耦原则。
- 最小验收标准：规范文档成文；校验脚本可在已有与新增组件上运行并纳入 `pnpm verify`；两套预设均支持亮 / 暗切换并在文档站可演示。
- 条目：
  - [ ] 设计规范文档（尺寸档位 / 语义色 / 对比度 / 圆角 / 阴影 / 图标尺寸 / 排版）
  - [ ] 规范可验证脚本（硬编码颜色与尺寸 / 档位一致性 / variant 与 size 命名）
  - [ ] 从 caomei-auth 与 momei 提取语义 token 映射表
  - [ ] `caomei` 主题预设（亮 / 暗）
  - [ ] `momei` 主题预设（亮 / 暗）
  - [ ] 预设承载形式（CSS 入口 / `data-theme` / Nuxt 配置）与文档站演示切换
  - [ ] 新组件规范模板 / 自检清单

### 主线 M3：组件补全（需求 1）

- 执行范围：补齐 momei 迁移缺口组件。清单以 M1 复核结论为准，下列为已识别候选；每个组件独立走 D→A→V→T→F。
- 非目标：实现无下游使用证据的长尾组件；Select 增强 / Tag / Badge 增强（视 M1 结论另行评估，不默认纳入）。
- 最小验收标准：组件具备 API 文档、单元测试与英文文档页；符合 M2 设计规范；`pnpm verify` 通过。
- 条目：
  - [ ] Divider
  - [ ] IconField / InputIcon（Input 家族扩展）
  - [ ] InputGroup / FloatLabel
  - [ ] Panel（先评估能否由 Accordion 承接）
  - [ ] DatePicker / Calendar（Reka Alpha，锁版本 + 回归）
  - [ ] Drawer（Reka Alpha，或由 Dialog 派生）
  - [ ] SplitButton
  - [ ] ColorPicker（Reka Alpha）
  - [ ] Stepper

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
