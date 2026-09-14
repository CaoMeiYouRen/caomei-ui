# 待办事项

本文档记录当前阶段的原子条目与验收状态；准入、命名与阶段衔接规则见 [规划规范](../standards/planning.md)，本文档不重述。

## 当前阶段

> **Phase 7 第一阶段：迁移就绪（momei 优先）** — 2026-09-14 经用户授权启动；范围来自 [Phase 7 第一阶段评估记录](./phase7-evaluation.md)。
>
> **阶段目标**：在 momei 实际迁移之前，打通消费与接入通道，补齐迁移高频硬缺口，并前置组件 i18n 注入机制，使组件库达到「可直接迁移」状态。
>
> **阶段非目标（明确不做）**：momei 实际页面替换与其他下游接入（第二阶段）；P1 增强（[Phase 7 第一阶段评估记录 §8](./phase7-evaluation.md) M5，延至第二阶段）；P2 低频增强（保留 [Backlog](./backlog.md)）；RTL 与多语种翻译、移动端 / 响应式（Backlog §1.4 / §1.5）；Phase 8 下游兼容性回归机制。
>
> **排序原则**：先改好再迁移；按「优先级 + 依赖关系」排序。i18n 机制（M2）先于组件改造（M3 / M4）；接入通道（M1）可并行，且**本地 link 先行**（首版发布待外部凭据到位后补）。

### 主线 M1：消费路径与 Nuxt 接入

- 执行范围：打通 momei 消费 caomei-ui 的通道（**本地 link 先行**，首版发布待外部凭据到位后补），落地 `caomei-ui/nuxt` 真实集成。
- 非目标：momei 实际页面替换；其他下游接入。
- 最小验收标准：本地 link 冒烟通过（后续发布产物可安装）；`caomei-ui/nuxt` 在最小 Nuxt 4 应用中自动导入组件、注入样式、主题与 SSR 无报错。
- 条目：
  - [ ] 本地 link 调试通道（先行：`link:` / `file:` 指引 + 构建产物联调）
  - [ ] 首版发布链路协调（归属 [Phase 5 第二阶段](./roadmap.md)，待 npm 凭据；作为 M1 并行依赖，不在本阶段重复承载）
  - [ ] `caomei-ui/nuxt` 真实集成（`@nuxt/kit` 自动导入 + 样式 + 主题 + SSR）
  - [ ] 最小 Nuxt 消费冒烟（preset / 暗色 / SSR hydrate）

### 主线 M2：组件 i18n 注入机制

- 执行范围：提供 locale provider 与 `useLocale`；16 个内建文案组件改为消费注入 locale；支持下游注入。
- 非目标：RTL；多语种翻译；移动端。
- 最小验收标准：组件不再硬编码 `defaultLocaleMessages`；下游可注入自定义 locale 且运行时切换生效；中英文档与示例齐备。
- 条目：
  - [ ] locale provider 机制（`CaomeiConfigProvider` / `provideLocale` + `useLocale`；合并覆盖与回退）
  - [ ] 组件接入批次一（表单类：Input / InputNumber / Password / MultiSelect / AutoComplete / Slider）
  - [ ] 组件接入批次二（反馈浮层类：Message / Toast / ConfirmDialog / Dialog / ProgressBar / ProgressSpinner）
  - [ ] 组件接入批次三（数据展示类：DataTable / Paginator / Tag / Stepper）
  - [ ] 文档与 momei 注入示例（中英）

### 主线 M3：P0 高频增强（迁移硬缺口）

- 执行范围：补齐对象选项映射、Tag / Message 语义形态、InputNumber 分组、Textarea 自动增高、Password 强度反馈。
- 非目标：P1 / P2 项；破坏现有 API 的改动。
- 最小验收标准：API 文档、单元测试与英文文档页齐备；符合设计规范；`pnpm verify` 通过。
- 条目：
  - [ ] Select 家族对象选项映射（`optionLabel` / `optionValue` + 非 `string` value）
  - [ ] Select 补充 `showClear` / `filter` / `#option`
  - [ ] Tag 语义与形态（severity 映射规范化、`rounded` / `outlined`、`#icon`）
  - [ ] Message 形态与尺寸（`variant` `simple` / `text`、`size`、severity 映射）
  - [ ] InputNumber 分组与小数位（`useGrouping` / `minFractionDigits` / `maxFractionDigits`）
  - [ ] Textarea 自动增高（`autoResize`）
  - [ ] Password 强度反馈（`feedback`）

### 主线 M4：组件补全（按用量与依赖排序）

- 执行范围：实现 Phase 6 延后的 5 个组件（`DatePicker / Calendar`、`Drawer`、`SplitButton`、`ColorPicker`、`DataView`）。
- 非目标：与该组件无关的长尾候选。
- 最小验收标准：API 文档、单元测试与英文文档页齐备；Alpha 组件补 primitive API 回归测试；`pnpm verify` 通过。
- 条目：
  - [ ] DatePicker / Calendar 基础（日期选择 + 格式化；锁 `reka-ui@2.10.4` + 回归）
  - [ ] DatePicker 时间 / 范围（`showTime` / `hourFormat` / `RangeCalendar`）
  - [ ] Drawer（四向 `position`，Reka Alpha）
  - [ ] SplitButton（Button + DropdownMenu 组合）
  - [ ] ColorPicker（组合 color primitive，Reka Alpha）
  - [ ] DataView（`layout` grid / list + 插槽）

> **M5（P1 增强）已延至第二阶段**（2026-09-14 用户决策）：Image 预览、ProgressSpinner 线宽、Dialog 形态断点、DataTable 剩余迁移项，由 momei 迁移实际暴露驱动；详见 [Phase 7 第一阶段评估记录 §8](./phase7-evaluation.md) 与 [路线图 Phase 7](./roadmap.md)。

## 阶段验收通则

完成条件见 [路线图 §4](./roadmap.md)；每个原子条目收尾必须经 `@code-reviewer` Review Gate，涉及界面或样式时另经 `@ui-validator` 验证。

## 完成情况概览

> 本节仅汇总未完成项以供跨阶段可见，**不构成阶段待办登记**（登记需用户明确决策）。

- 已归档：Phase 0 ~ Phase 4、Phase 5 第一阶段、Phase 6。
- 进行中：Phase 7 第一阶段（迁移就绪，momei 优先）。
- 未启动 / 未完成：Phase 5 第二阶段（首版发布 / 首个下游接入，待外部前置）、Phase 7 第二阶段（momei 迁移闭环 + P1 增强）、Phase 8（下游兼容性回归，稳定后启用）；范围见 [路线图](./roadmap.md)。
- 未纳入本阶段的候选：P1 增强（延至 Phase 7 第二阶段）、Phase 6 遗留 Button 角标（`:badge`）、P2 低频增强、组件国际化多语种翻译与 RTL、移动端与响应式，详见 [Backlog](./backlog.md) 与 [Phase 7 第一阶段评估记录](./phase7-evaluation.md)。
