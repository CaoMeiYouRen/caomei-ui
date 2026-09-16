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
- [2026-09-16-language-matrix-midterm-evaluation.md](./2026-09-16-language-matrix-midterm-evaluation.md)：语言矩阵 - 中期（zh-TW / ja-JP / ko-KR）范围评估——现状调研（22 命名空间 / 59 条文案 / 25 个 `.vue`（23 个组件目录）消费 / 基准回退语义与测试耦合点）、五个方案（A–E）比较与推荐、条目拆分、规模与风险、5 项待决策、包体实测与 tree-shaking 结论。**已获用户决策并登记为 Phase 10 M1（2026-09-16 授权启动）**。
- [2026-09-16-phase9-closure.md](./2026-09-16-phase9-closure.md)：Phase 9 收口与遗留清单——汇总 M1~M5 交付结果、契约变更裁定（含下游调研证据）、长期任务下一轮范围、下一阶段方向（已登记为 Phase 10）、已登记待执行项与已知偏差。
- [2026-09-16-m3-demo-motion-validation.md](./2026-09-16-m3-demo-motion-validation.md)：M3 条目 1「demo 动画恢复层」浏览器验证记录（Phase 9 V 阶段，共三轮）。首轮：最小验收通过——reduced-motion 下 demo 内 Drawer 入场 0.2s + 逐帧位移 13 位置、demo 外仍 1ms，Accordion/Image/Button/AutoComplete 与 4 个 Portal 面板入场实测播放，no-preference 下规则全部位于 reduce 媒体查询内；失败 2 项同一根因 P1＝Drawer / Accordion 的 `closed` 条目被 Reka `usePresence` 同名动画判定绕过（非回归）。复验轮（P1 修复后）：P1 闭环，但新发现 P2＝reduce 下 Accordion 高度插值仅「起始展开 item 的第一次折叠」成立（`--reka-collapsible-content-height` 被写死 `0px`）→ Reject。**末轮（P2 修复后，现行结论）：Pass——P2 闭环**，Accordion 改为「`animation-name` 更高特异性非 `!important` + duration/timing/iteration `!important`」后，Reka 测量窗口的内联 `animation-name: none` 恢复生效、变量在 `animationstart` 前写入自然高度，两条路径共 12 次过渡全部逐帧插值（distinctHeights 13~14）；P1 与 Portal / 加载指示未回归，CSSOM 逐规则归属与优先级断言成立 → **核对项 18 / 失败 0 / 观察项 6 / console 0**。
- [2026-09-17-m2-batch3-calendar-baseline.md](./2026-09-17-m2-batch3-calendar-baseline.md)：M2 批次 3「含日历面板（DatePicker / Calendar）」改动前基线与收敛记录——面板内容定宽 224×239（单月），改动前横向靠 floating-ui shift 落在视口内（390 右缘 0.18px 亚像素越界）、**纵向在极矮视口越出 13 / 53px**；补「可用空间上限（宽 + 高）+ 滚动降级」后 390 / 768 / 1280 与 320 / 280 / 240 探针几何逐项不变（仅上限制与溢出计算值变化），极窄 / 极矮探针下面板收敛且内容可滚动可达，常驻用例 48/48（含两个上限生效路径探针）；含桌面 1280 计算样式快照（断言 4 基线参考）与「内联日历内容宽 198px 在布局视口或容器宽 < 198px 时撑出溢出」的已知边界。
- [2026-09-17-momei-migration-feasibility.md](./2026-09-17-momei-migration-feasibility.md)：momei 迁移可行性评估（Phase 10 阶段尾部再评估点，2026-09-17）。**结论：可行（有条件）**——能力面无阻塞（台账 §4.1 需新组件 11/11 已交付；§4.2 受检 24 项＝完全交付 8 / 部分交付 16 / 完全未交付 0；momei 用量自 2026-09-14 逐项未变：59 组件 / 1515 用法 / 148 个 `.vue`）；三个先决条件是「DataTable 列级插槽先行（组件能力面唯一结构性差距：`<Column>` 153 / `#body` 123 / `slotProps` 163）、主题映射表与视觉基线先行（`--p-*` token 1394 处 + 20 个 SCSS + class 190 处）、分批 + 关键路径先行 + 并存白名单」。含剩余缺口分级清单、迁移面量化（图标 598 / 134 文件、命令式 43 个 `.vue`、测试 21 文件）、16 条有意差异影响、C1/C2/C3 方案对照与五批分期建议、五项待用户决策。
- [experience-archive.md](./experience-archive.md)：Session 经验归档（已蒸馏条目的摘要与链接，跨机器留存）。
- [session-wisdom-distillation.md](./session-wisdom-distillation.md)：Session Wisdom 蒸馏机制（`.session/` 任务态与知识沉淀）。
