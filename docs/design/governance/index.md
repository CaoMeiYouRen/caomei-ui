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

- [2026-09-14-momei-usage-audit.md](./2026-09-14-momei-usage-audit.md)：momei 组件使用复核台账（Phase 6 M1 交付物，需求 2 输入）。
- [2026-09-14-phase7-first-stage-evaluation.md](./2026-09-14-phase7-first-stage-evaluation.md)：Phase 7 第一阶段评估记录（迁移就绪范围、缺口优先级、i18n 注入机制与用户决策；该阶段已于 2026-09-16 完成并归档，交付见 [待办归档](../../plan/todo-archive.md)）。
- [2026-09-16-new-requirements-evaluation.md](./2026-09-16-new-requirements-evaluation.md)：2026-09-16 新需求评估记录（文档站信息架构 / 默认主色 / 站点观感 / Drawer 动画诊断 / 复用抽取 / 类型与 ESLint 严格化）。
- [2026-09-16-pre-release-stage-evaluation.md](./2026-09-16-pre-release-stage-evaluation.md)：下一阶段评估记录（发布前收口：文档站与代码质量；5 条主线、验收标准、容量与风险，未构成阶段登记）。
- [experience-archive.md](./experience-archive.md)：Session 经验归档（已蒸馏条目的摘要与链接，跨机器留存）。
- [session-wisdom-distillation.md](./session-wisdom-distillation.md)：Session Wisdom 蒸馏机制（`.session/` 任务态与知识沉淀）。
