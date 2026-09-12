# 待办事项

本文档记录当前阶段的原子条目与验收状态；准入、命名与阶段衔接规则见 [规划规范](../standards/planning.md)，本文档不重述。

## 当前阶段

> Phase 0 与 Phase 1 已完成并归档（见 [待办归档](./todo-archive.md)）。Phase 2 已由用户决策启动。

### Phase 2：Tier 1 组件

状态：**进行中**

> 用户决策：本阶段实现 7 个 Tier 1 组件（Switch 已先行落地并归档）；Nuxt 模块延后（见 [Backlog](./backlog.md)）。
> 验收沿用 Tier 0 基线；覆盖率 ≥80% 作为目标，现阶段不强制（门禁启用见 [Backlog](./backlog.md)）。
>
> 主线 A–D 均已完成，7 个组件齐备；阶段收口归档与下一阶段启动待用户决策。

#### 主线 A：展示与导航组件

- 执行范围：Avatar（封装 Reka UI `Avatar`）、Paginator（封装 Reka UI `Pagination`）
- 非目标：不做图片懒加载 / 跨域处理；不做每页条数选择器的复合封装
- 最小验收：两组件均具备实现、单元测试、组件文档与示例、浏览器验证，并通过 Review Gate

- [x] **Avatar**：封装 Reka UI `Avatar`，支持 `src` / `alt` / `fallback` / 尺寸与形状，含加载失败回退；已通过 Review Gate。
- [x] **Paginator**：封装 Reka UI `Pagination`，支持 `v-model:page`、`total` / `itemsPerPage`、首尾与省略展示；已通过 Review Gate。

#### 主线 B：反馈与浮层组件

- 执行范围：Message / Alert（自建业务语义包装）、ProgressSpinner（封装 Reka UI `Progress` 派生）
- 非目标：不做全局消息队列服务（由 Toast 承担）；ProgressSpinner 不做确定性进度条
- 最小验收：两组件均具备实现、单元测试、组件文档与示例、浏览器验证，并通过 Review Gate

- [x] **Message / Alert**：自建提示条，支持 `tone` / `variant` / `closable` 与图标、操作插槽；已通过 Review Gate。
- [x] **ProgressSpinner**：封装 Reka UI `Progress` 的不确定进度指示器，支持尺寸与可访问名；已通过 Review Gate。

#### 主线 C：确认对话框

- 执行范围：ConfirmDialog（封装 Reka UI `AlertDialog`）及其依赖的 `useConfirm` 服务
- 非目标：不替换既有 Dialog；不做多级确认链与自定义 Portal 容器
- 最小验收：服务与组件均具备单元测试、组件文档与示例、浏览器验证（含焦点与滚动锁），并通过 Review Gate

- [x] **useConfirm**：确认对话框服务（open / confirm / cancel 与 Promise 语义）；已通过 Review Gate。
- [x] **ConfirmDialog**：基于 `AlertDialog` 的确认对话框，接入 `useConfirm`；已通过 Review Gate。

#### 主线 D：表单增强组件

- 执行范围：Password（Input 衍生）、MultiSelect（封装 Reka UI `Combobox`）
- 非目标：不做密码强度校验（业务层职责）；MultiSelect 不做分组与远程搜索
- 最小验收：两组件均具备实现、单元测试、组件文档与示例、浏览器验证，并通过 Review Gate

- [x] **Password**：Input 衍生，含可见性切换与 `autocomplete` 语义；已通过 Review Gate。
- [x] **MultiSelect**：封装 Reka UI `Combobox`，支持多选、`v-model` 数组与已选项标签；已通过 Review Gate。
