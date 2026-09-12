# 待办事项

本文档记录当前阶段的原子条目与验收状态。新需求先进入 [Backlog](./backlog.md)，经用户决策后才进入本文件。

## 当前阶段

> Phase 0 已启动：P0-1 已完成，其余条目按序推进。

### Phase 0：立项与 POC

状态：**进行中**

- [x] **P0-1 确定组件前缀**：已冻结为 `Caomei`；组件目录与文件采用 kebab-case，对外名称使用 `Caomei` + PascalCase（如 `CaomeiButton`）。
- [x] **P0-2 tsdown POC**：已验证（tsdown 0.23.0 + unplugin-vue 7.2.0 + @tsdown/css 0.23.0），结论见 [架构设计 §4.1](../design/architecture.md)；产物为 `.js` / `.d.ts`，`pnpm build` 已切换为库构建。
- [ ] **P0-3 设计 token 草案**：产出 `--caomei-*` CSS variables 与暗色模式方案。
- [ ] **P0-4 仓库与基建就绪**：AI 基建（agents / skills / 镜像）与文档基建（standards / plan / design / 文档站）落地。
- [ ] **P0-5 组件目录骨架**：建立 `src/components/`、`src/composables/`、`src/styles/` 等目录与构建配置。

## 说明

- 条目命名不带规划编号前缀以外的语义噪音；代码注释与测试名禁止写入条目编号。
- 每条完成后更新状态，并在阶段收口时迁入 [todo-archive.md](./todo-archive.md)。
