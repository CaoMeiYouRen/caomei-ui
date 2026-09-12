# 治理决策与经验归档

本目录记录 caomei-ui 的跨模块 / 治理 / 重大变更专项设计，以及可复用的经验教训。

## 命名约定

- 决策类：`[YYYY-MM-DD]-<topic>.md`（如 `2026-09-12-primevue-migration-evaluation.md`）。
- 经验类：`experience-archive.md`（按需拆分）。
- 通用治理：`<topic>-governance.md`。

## 收录标准

- 改动预计 > 10 文件 / > 800 行，或跨 ≥ 2 个模块；
- 引入新依赖、外部 skill / agent / MCP；
- 重大技术选型或架构变更；
- 需要跨项目复用的经验教训。

## 当前条目

- [session-wisdom-distillation.md](./session-wisdom-distillation.md)：Session Wisdom 蒸馏机制（`.session/` 任务态与知识沉淀）。
