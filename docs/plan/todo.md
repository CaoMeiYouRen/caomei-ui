# 待办事项

本文档记录当前阶段的原子条目与验收状态。新需求先进入 [Backlog](./backlog.md)，经用户决策后才进入本文件。

## 当前阶段

> Phase 0 已完成并归档，进入 Phase 1（Tier 0 组件实现）。

### Phase 1：Tier 0 组件

状态：**进行中**

- [x] **Button**：原生 `button` + 变体/尺寸，含 `loading` / `block` / `icon` 插槽与首个单元测试；已通过 Review Gate。
- [ ] **DataTable + Column**：基于 `@tanstack/vue-table`，含列定义与空态。
- [x] **Input**：自建单行输入，支持 `v-model`、尺寸、`disabled` / `readonly` / `invalid`、`clearable`、前后缀插槽与 `type=password`。
- [x] **Textarea**：多行文本输入（Input 家族）；已通过 Review Gate。
- [x] **InputNumber**：数值输入，含 `min` / `max` / `step` / `precision`（Input 家族）；已通过 Review Gate。
- [x] **Tag / Badge**：`span` + 变体；已通过 Review Gate。
- [x] **Select**：基于 Reka UI `Select`；已通过 Review Gate。
- [ ] **Dialog**：基于 Reka UI `Dialog`，处理 Portal / SSR。
- [ ] **Toast**：基于 Reka UI `Toast` + `useToast` 服务封装。
- [ ] **Card**：布局容器 + 变体。
- [ ] **Checkbox**：基于 Reka UI `Checkbox`。

- [ ] **文档站样板（Button）**（用户授权提前实施）：沉淀文档站设计并验证 demo 渲染 + API 自动生成链路。

## 说明

- 条目命名不带规划编号前缀以外的语义噪音；代码注释与测试名禁止写入条目编号。
- 每条完成后更新状态，并在阶段收口时迁入 [todo-archive.md](./todo-archive.md)。
