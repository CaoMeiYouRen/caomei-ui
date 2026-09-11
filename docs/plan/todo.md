# 待办事项

本文档记录当前阶段的原子条目与验收状态。新需求先进入 [Backlog](./backlog.md)，经用户决策后才进入本文件。

## 当前阶段

> 尚未进入正式开发阶段。以下为 Phase 0 的启动准备项，需用户确认后开始。

### Phase 0：立项与 POC

状态：**待启动**

- [ ] **P0-1 确定组件前缀**：`Caomei` 或短别名 `Cao`，冻结组件命名前缀。
- [ ] **P0-2 tsdown POC**：验证 tsdown 构建 Vue SFC + Reka UI，确认 external、CSS 抽取、类型声明、子路径导出可行。
- [ ] **P0-3 设计 token 草案**：产出 `--caomei-*` CSS variables 与暗色模式方案。
- [ ] **P0-4 仓库与基建就绪**：AI 基建（agents / skills / 镜像）与文档基建（standards / plan / design / 文档站）落地。
- [ ] **P0-5 组件目录骨架**：建立 `src/components/`、`src/composables/`、`src/styles/` 等目录与构建配置。

## 说明

- 条目命名不带规划编号前缀以外的语义噪音；代码注释与测试名禁止写入条目编号。
- 每条完成后更新状态，并在阶段收口时迁入 [todo-archive.md](./todo-archive.md)。
