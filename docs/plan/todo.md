# 待办事项

本文档记录当前阶段的原子条目与验收状态。新需求先进入 [Backlog](./backlog.md)，经用户决策后才进入本文件。

## 当前阶段

> Phase 0 与 Phase 1 已完成并归档（见 [待办归档](./todo-archive.md)）；Phase 2（Tier 1 组件 + Nuxt 模块）待用户确认后启动。

### Phase 2：Tier 1 组件 + Nuxt 模块（待启动）

状态：**待启动**

> Switch 已由用户授权先行落地并归档（见 [待办归档](./todo-archive.md) 的「跨阶段预落地条目」）；以下为剩余范围。

- [ ] **Message / Alert**：自建业务语义包装。
- [ ] **Password**：Input 派生，含可见性切换等增强。
- [ ] **ProgressSpinner**：封装 Reka UI `Progress` 派生。
- [ ] **MultiSelect**：封装 Reka UI `Combobox`。
- [ ] **ConfirmDialog**：封装 Reka UI `AlertDialog` + 服务封装。
- [ ] **Avatar**：封装 Reka UI `Avatar`。
- [ ] **Paginator**：封装 Reka UI `Pagination`。
- [ ] **`caomei-ui/nuxt`**：Nuxt 模块（替换 `src/nuxt/module.ts` 占位实现）。

> 以上为 [路线图](./roadmap.md) Phase 2 的规划范围，未经用户确认不启动；启动时再拆解为可独立验收的原子条目。

## 说明

- 条目命名不带规划编号前缀以外的语义噪音；代码注释与测试名禁止写入条目编号。
- 每条完成后更新状态，并在阶段收口时迁入 [todo-archive.md](./todo-archive.md)。
