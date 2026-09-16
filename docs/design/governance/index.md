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
- [2026-09-16-m2-primary-browser-validation.md](./2026-09-16-m2-primary-browser-validation.md)：M2 条目 1「默认主色改蓝」浏览器验证记录（Phase 9 V 阶段：Reject 轮暗色 ConfirmDialog danger 4.07:1 回归；复验轮 F1 修复后 4.83:1、回归扫描无新增 → Pass，亮色 soft 变体 4.37:1 既有未达标维持 Backlog）。
- [2026-09-16-phase9-closure.md](./2026-09-16-phase9-closure.md)：Phase 9 收口与遗留清单——汇总 M1~M5 交付结果、契约变更裁定（含下游调研证据）、长期任务下一轮范围、下一阶段方向、已登记待执行项与已知偏差。
- [2026-09-16-m3-demo-motion-validation.md](./2026-09-16-m3-demo-motion-validation.md)：M3 条目 1「demo 动画恢复层」浏览器验证记录（Phase 9 V 阶段，共三轮）。首轮：最小验收通过——reduced-motion 下 demo 内 Drawer 入场 0.2s + 逐帧位移 13 位置、demo 外仍 1ms，Accordion/Image/Button/AutoComplete 与 4 个 Portal 面板入场实测播放，no-preference 下规则全部位于 reduce 媒体查询内；失败 2 项同一根因 P1＝Drawer / Accordion 的 `closed` 条目被 Reka `usePresence` 同名动画判定绕过（非回归）。复验轮（P1 修复后）：P1 闭环，但新发现 P2＝reduce 下 Accordion 高度插值仅「起始展开 item 的第一次折叠」成立（`--reka-collapsible-content-height` 被写死 `0px`）→ Reject。**末轮（P2 修复后，现行结论）：Pass——P2 闭环**，Accordion 改为「`animation-name` 更高特异性非 `!important` + duration/timing/iteration `!important`」后，Reka 测量窗口的内联 `animation-name: none` 恢复生效、变量在 `animationstart` 前写入自然高度，两条路径共 12 次过渡全部逐帧插值（distinctHeights 13~14）；P1 与 Portal / 加载指示未回归，CSSOM 逐规则归属与优先级断言成立 → **核对项 18 / 失败 0 / 观察项 6 / console 0**。
- [experience-archive.md](./experience-archive.md)：Session 经验归档（已蒸馏条目的摘要与链接，跨机器留存）。
- [session-wisdom-distillation.md](./session-wisdom-distillation.md)：Session Wisdom 蒸馏机制（`.session/` 任务态与知识沉淀）。
