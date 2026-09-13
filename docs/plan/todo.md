# 待办事项

本文档记录当前阶段的原子条目与验收状态；准入、命名与阶段衔接规则见 [规划规范](../standards/planning.md)，本文档不重述。

## 当前阶段

> Phase 0 ~ Phase 3 已完成并归档（见 [待办归档](./todo-archive.md)）。Phase 4（Tier 3 稳定批组件）已由用户决策启动。
>
> 用户决策：优先推进 Tier 3 稳定批组件（清单见 [组件设计 §5](../design/components.md)，阶段对齐见 [路线图](./roadmap.md)）；文档站增强、首版发布与下游接入顺延至 Phase 5+。
> 实现粒度约束见 [规划规范 §5](../standards/planning.md#5-任务粒度约束)；覆盖率门禁启用见 [Backlog](./backlog.md)。

### Phase 4：Tier 3 稳定批组件

状态：**进行中**

> 范围：纳入优先级为「中」的 7 个候选（6 个封装 Reka UI 稳定 primitive，Skeleton 为自建纯样式）；Alpha primitive（Drawer、日期类、Color 系列）、自建复杂件（InputGroup / FloatLabel、SplitButton、Sidebar）与优先级「低」的 Stepper 留在 [Backlog](./backlog.md) 按需评估。

#### 主线 A：表单控件（RadioGroup / Slider）

- 执行范围：RadioGroup / RadioButton（封装 Reka UI `RadioGroup`）、Slider（封装 Reka UI `Slider`）
- 非目标：不改动现有 Checkbox / Switch 契约；不引入表单校验框架
- 最小验收：两组件均具备实现、单元测试、组件文档与示例、浏览器验证（键盘方向键、禁用与表单语义），并通过 Review Gate

- [x] **RadioGroup / RadioButton**：封装 Reka UI `RadioGroup`，支持 `v-model`、`disabled`、`required`、`name` 表单语义与可访问名 `label`。
- [x] **Slider**：封装 Reka UI `Slider`，支持 `v-model`、`min` / `max` / `step`、禁用与键盘方向键调节。

#### 主线 B：开关与工具（ToggleButton / Toolbar）

- 执行范围：ToggleButton（封装 Reka UI `Toggle`）、Toolbar（封装 Reka UI `ToolbarRoot`）
- 非目标：ToggleButton 不与既有 SelectButton（ToggleGroup）合并；Toolbar 不承载富文本编辑等业务逻辑
- 最小验收：实现、单元测试、组件文档与示例、浏览器验证（选中态 / 受控、键盘漫游、`aria-pressed`），并通过 Review Gate

- [x] **ToggleButton**：封装 Reka UI `Toggle`，支持 `v-model` 按下态、`disabled` 与图标 / 文本插槽。
- [x] **Toolbar**：封装 Reka UI `ToolbarRoot`，提供分组、分隔线与键盘漫游。

#### 主线 C：反馈与占位（Skeleton / ProgressBar）

- 执行范围：Skeleton（自建纯样式 + CSS 动画）、ProgressBar（封装 Reka UI `Progress`，与 ProgressSpinner 同源）
- 非目标：Skeleton 不做布局引擎；ProgressBar 不替换既有 ProgressSpinner
- 最小验收：实现、单元测试、组件文档与示例、浏览器验证（reduced-motion、暗色 / token 覆盖、确定与不确定进度），并通过 Review Gate

- [x] **Skeleton**：自建占位骨架，支持 `variant`（text / circular / rectangular）、尺寸与多行。
- [x] **ProgressBar**：封装 Reka UI `Progress`，支持确定 / 不确定进度与 `max` / `value`。

#### 主线 D：浮层（Popover）

- 执行范围：Popover（封装 Reka UI `Popover`）
- 非目标：不替代 Dialog / DropdownMenu；滚动锁行为沿用既有浮层约定
- 最小验收：实现、单元测试、组件文档与示例、浏览器验证（焦点管理、Escape / 外部关闭、Portal 层级与 SSR 安全），并通过 Review Gate

- [ ] **Popover**：封装 Reka UI `Popover`，支持触发方式、对齐与受控开合。
