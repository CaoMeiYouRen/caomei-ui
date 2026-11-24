# 待办归档（深度归档）

本目录保存[待办归档](../todo-archive.md)主窗口迁出的**旧阶段完整归档块**——主窗口只保留近线阶段窗口与归档索引（口径见 [todo-archive.md](../todo-archive.md) 文首，依据 `docs:check:line-count` 的「主窗口只保留近线窗口与索引」）。

> **权威不变**：阶段交付的权威记录仍是各阶段治理记录（见[治理索引](../../design/governance/index.md)）；本目录只保存迁出的原始正文，迁移为**机械操作**（仅把相对链接深度由 `../` 调整为 `../../`，正文不改写）。

## 文件

| 文件 | 收录阶段 |
|:---|:---|
| [phase-00-06.md](./todo-archive-phases-00-06.md) | Phase 0（立项与 POC）、Phase 1 ~ Phase 4（Tier 0 ~ Tier 3 组件）、Phase 5 第一阶段（文档站增强）、Phase 6（组件库补全与规范化） |
| [phase-07-12.md](./todo-archive-phases-07-12.md) | Phase 7 第一阶段（迁移就绪）、Phase 9（发布前收口）、Phase 10（国际化与移动端）、Phase 7 第二阶段（库侧迁移就绪与交接）、Phase 5 第二阶段（首版发布）、Phase 11（样式按需化与能力增强）、Phase 12（发布就绪与一致性收官） |
| [phase-13-17.md](./todo-archive-phases-13-17.md) | Phase 13（组件能力补齐与 dependfix 迁移解阻）、Phase 14（质量与一致性收口）、Phase 15（治理收口深化 + 组件能力补齐 + 下游迁移护航文档）、Phase 16（质量收口与治理装置落地）、Phase 17（极简主题预设与富文本封装 + 治理补口） |
| [phase-18.md](./todo-archive-phases-18.md) | Phase 18（发布收口、测试稳定性与一致性治理） |
| [phase-19.md](./todo-archive-phases-19.md) | Phase 19（设计一致性口径落地、组件文档去重与观感缺陷处置） |
| [phase-20.md](./todo-archive-phases-20.md) | Phase 20（测试装置扩面、治理守卫补口与发布收口） |
| [phase-21.md](./todo-archive-phases-21.md) | Phase 21（下游回归机制启动、发布流统一与视觉基线落地） |
| [phase-22.md](./todo-archive-phases-22.md) | Phase 22（机制真实贯通、依赖安全与升级治理、治理与测试收口） |
| [phase-23.md](./todo-archive-phases-23.md) | Phase 23（机制收口与回归判别力、依赖与 CI 环境治理、治理与测试收口） |
| [phase-24.md](./todo-archive-phases-24.md) | Phase 24（机制远端生效与判别力收口、CI 环境治理、治理装置与规划载体补口、组件缺口补齐、图表能力） |
| [phase-25.md](./todo-archive-phases-25.md) | Phase 25（归档载体收口、移动端与响应式优化、国际化深化一期、0.7.0 发布收口） |
| [phase-26.md](./todo-archive-phases-26.md) | Phase 26（1.0 发布前冻结面终审与 1.x 承诺、行为收口、发布链路与 `1.0.0` 交付、下游复验、UI 可用性与示例可访问名） |
| [phase-27.md](./todo-archive-phases-27.md) | Phase 27（移动端密度轴、`Form` 组合层、迁移护航、机制收口与 CI 发布） |
| [phase-28.md](./todo-archive-phases-28.md) | Phase 28（caomei-auth 迁移反馈收口与图标体系调研，发布 `1.2.0`） |
| [phase-29.md](./todo-archive-phases-29.md) | Phase 29（动效体系与图标体系落地） |
| [phase-30.md](./todo-archive-phases-30.md) | Phase 30（表单、布局与选择器动效 + 触摸目标 P1 + 阶段残留机检） |
| [phase-31.md](./todo-archive-phases-31.md) | Phase 31（下游兼容扩容、数据展示动效与依赖卫生） |
| [phase-32.md](./todo-archive-phases-32.md) | Phase 32（质量收口与文档站回归） |
| [phase-33.md](./todo-archive-phases-33.md) | Phase 33（依赖与工具链升级、下游适配、组件增强与质量守卫，发布 `1.3.0`） |
| [phase-34.md](./todo-archive-phases-34.md) | Phase 34（Tooltip 提示体系、协作测试 T3、质量门禁、DataTable 数据面与长尾组件，不发布） |
| [phase-35.md](./todo-archive-phases-35.md) | Phase 35（质量与无障碍收口、DataTable 列可见性 / 列宽、长尾 Rating，不发布） |
| [phase-36-37.md](./todo-archive-phases-36-37.md) | Phase 36（浮层隔离扩面、DataTable 列宽拖拽与虚拟滚动评估、质量治理、选择器空值诊断）、Phase 37（质量收口与回归补齐、选择器空值 opt-in、迁移口径、Rating 表单集成） |

> `phase-07-12.md` 另含各阶段块之间的「跨阶段预落地条目」等过渡段，随迁入一并保留。

## 迁出时点

- 2026-09-30（Phase 17 归档批次）：主窗口自 Phase 0 起累计至 594 行（`docs:check:line-count` warn > 400 持续累积、error > 600 逼近），按用户决策压缩为「近线窗口（Phase 13 ~ Phase 17）+ 归档索引」，Phase 0 ~ Phase 12 迁入本目录。
- 2026-10-13（Phase 23 M4-1 压缩批次）：主窗口累计至 574 行（`docs:check:line-count` warn > 400），按用户决策 D6 二次压缩为「近线窗口（**Phase 18 ~ Phase 22**，口径 = 最近 5 个已完成阶段）+ 归档索引」，Phase 13 ~ Phase 17 迁入本目录 [phase-13-17.md](./todo-archive-phases-13-17.md)（迁移为机械操作：链接深度 `../` → `../../`，另含 5 处同目录 `./` → `../` 修正，正文不改写）。
- 2026-10-16（Phase 25 M1-1 压缩批次）：主窗口累计至 404 行（`docs:check:line-count` warn > 400，Phase 18 ~ Phase 23 共 6 块 + Phase 24 部分归档块），按「近线窗口 = 最近 5 个已完成阶段」口径三次压缩为「近线窗口（**Phase 19 ~ Phase 23**）+ 归档索引」，Phase 18 迁入本目录 [phase-18.md](./todo-archive-phases-18.md)（迁移为机械操作：链接深度 `../` → `../../`，另含 5 处同目录 `./` → `../` 修正，正文不改写）。**批次口径载体见[治理记录](../../design/governance/2026-10-16-phase25-m1-1-todo-archive-deep-migration.md)**。
- 2026-11-03（Phase 26 归档批次）：主窗口在 Phase 24 补齐与 Phase 26 入窗后越过 warn 阈值（400 行），按「目标窗口 5 个；未越 `warn` 暂留 6 块」口径压缩为「**Phase 21 ~ Phase 26** + 归档索引」，Phase 19 / Phase 20 分别迁入本目录 [phase-19.md](./todo-archive-phases-19.md) 与 [phase-20.md](./todo-archive-phases-20.md)（迁移为机械操作：链接深度 `../` → `../../`，另含 5 处同目录 `./` → `../` 修正，正文不改写）。
- 2026-11-07（Phase 27 收口批次）：Phase 27 入窗后主窗口约 415 行（`docs:check:line-count` warn > 400），按「目标窗口 5 个；未越 `warn` 暂留 6 块」口径压缩为「**Phase 22 ~ Phase 27** + 归档索引」，Phase 21 迁入本目录 [phase-21.md](./todo-archive-phases-21.md)（迁移为机械操作：链接深度 `../` → `../../`，同目录 `./` → `../`，正文不改写；迁出后 369 行）。
- 2026-11-08（Phase 28 归档批次）：Phase 28 入窗后主窗口越过 warn 阈值（`docs:check:line-count` warn > 400），按同一口径压缩为「**Phase 23 ~ Phase 28** + 归档索引」，Phase 22 迁入本目录 [phase-22.md](./todo-archive-phases-22.md)（迁移为机械操作：链接深度 `../` → `../../`，同目录 `./` → `../`，正文不改写；迁出后 363 行）。
- 2026-11-09（Phase 29 归档批次）：Phase 29 入窗后主窗口约 408 行（`docs:check:line-count` warn > 400），按「目标窗口 5 个；未越 `warn` 暂留 6 块」口径压缩为「**Phase 24 ~ Phase 29** + 归档索引」，Phase 23 迁入本目录 [phase-23.md](./todo-archive-phases-23.md)（迁移为机械操作：链接深度 `../` → `../../`，同目录 `./` → `../`，正文不改写；迁出后 368 行（补 Phase 29 回扫段后 373 行））。
- 2026-11-11（Phase 30 归档批次）：Phase 30 入窗后主窗口 417 行（`docs:check:line-count` warn > 400），按「目标窗口 5 个；未越 `warn` 暂留 6 块」口径压缩为「**Phase 25 ~ Phase 30** + 归档索引」，Phase 24 迁入本目录 [phase-24.md](./todo-archive-phases-24.md)（迁移为机械操作：链接深度 `../` → `../../`，同目录 `./` → `../`，正文不改写；**迁出后 366 行**）。
- 2026-11-12（Phase 31 归档批次）：Phase 31 入窗后主窗口 416 行（`docs:check:line-count` warn > 400；前态 366 + 块 49（含分隔空行）+ 索引行 1），按同一口径压缩为「**Phase 26 ~ Phase 31** + 归档索引」，Phase 25 迁入本目录 [phase-25.md](./todo-archive-phases-25.md)（迁移为机械操作：链接深度 `../` → `../../`，同目录 `./` → `../`，正文不改写；**迁出后 367 行**，416 − 49）。
- 2026-11-13（Phase 32 归档批次）：Phase 32 入窗后主窗口 **408 行**（`docs:check:line-count` warn > 400），按「目标窗口 5 个；未越 `warn` 暂留 6 块」口径压缩为「**Phase 27 ~ Phase 32** + 归档索引」，Phase 26 迁入本目录 [phase-26.md](./todo-archive-phases-26.md)（迁移为机械操作：链接深度 `../` → `../../`，同目录 `./` → `../`，正文不改写；**迁出后 331 行**，408 − 77）。
- 2026-11-15（Phase 34 归档批次）：Phase 34 入窗后主窗口越过 warn 阈值（`docs:check:line-count` warn > 400），按同一口径压缩为「**Phase 28 ~ Phase 34** + 归档索引」，Phase 27 迁入本目录 [phase-27.md](./todo-archive-phases-27.md)（迁移为机械操作：链接深度 `../` → `../../`，同目录 `./` → `../`，正文不改写；**迁出后 397 行**，口径 = `docs:check:line-count`）。
- 2026-11-16（Phase 35 归档批次）：Phase 35 入窗后主窗口 397 → 311 行（`docs:check:line-count` 值），按「目标窗口 5 个」口径压缩为「**Phase 31 ~ Phase 35** + 归档索引」，Phase 28 / Phase 29 / Phase 30 分别迁入本目录 [phase-28.md](./todo-archive-phases-28.md)、[phase-29.md](./todo-archive-phases-29.md)、[phase-30.md](./todo-archive-phases-30.md)（迁移为机械操作：链接深度 `../` → `../../`，同目录 `./` → `../`，正文不改写）。
- 2026-11-19（Phase 37 归档批次）：Phase 37 入窗后主窗口 409 行（`docs:check:line-count` warn > 400），按「目标窗口 5 个；未越 `warn` 暂留 6 块」口径压缩为「**Phase 32 ~ Phase 37** + 归档索引」，Phase 31 迁入本目录 [phase-31.md](./todo-archive-phases-31.md)（迁移为机械操作：链接深度 `../` → `../../`，同目录 `./` → `../`，正文不改写；**迁出后 363 行**）。
- 2026-11-20（Phase 38 归档批次）：Phase 38 入窗后主窗口将有 7 块，按「目标窗口 5 个；未越 `warn` 暂留 6 块」口径压缩为「**Phase 33 ~ Phase 38** + 归档索引」，Phase 32 迁入本目录 [phase-32.md](./todo-archive-phases-32.md)（迁移为机械操作：链接深度 `../` → `../../`，同目录 `./` → `../`，正文不改写；**迁出后 374 行**）。
- 2026-11-21（Phase 39 归档批次）：Phase 39 入窗后主窗口 384 行（`docs:check:line-count`，未越 warn 400），按「目标窗口 5 个；未越 `warn` 暂留 6 块」口径压缩为「**Phase 34 ~ Phase 39** + 归档索引」，Phase 33 迁入本目录 [phase-33.md](./todo-archive-phases-33.md)（迁移为机械操作：链接深度 `../` → `../../`，同目录 `./` → `../`，正文不改写；**迁出后 384 行**）。
- 2026-11-21（Phase 40 归档批次）：Phase 40 入窗后主窗口 378 行（`docs:check:line-count`，未越 warn 400），按「目标窗口 5 个；未越 `warn` 暂留 6 块」口径保持「**Phase 35 ~ Phase 40** + 归档索引」，Phase 34 迁入本目录 [phase-34.md](./todo-archive-phases-34.md)（迁移为机械操作：链接深度 `../` → `../../`，同目录 `./` → `../`，正文不改写；**迁出后 378 行**）。
- 2026-11-23（Phase 41 归档批次）：Phase 41 迁出后主窗口 400 行（`docs:check:line-count` 读数，未越 warn 400、恰在边界；入窗前读数未留），按「目标窗口 5 个；未越 `warn` 暂留 6 块」口径压缩为「**Phase 36 ~ Phase 41** + 归档索引」，Phase 35 迁入本目录 [phase-35.md](./todo-archive-phases-35.md)（迁移为机械操作：链接深度 `../` → `../../`，同目录 `./` → `../`，正文不改写；迁出后 400 行）。
- 2026-11-24（Phase 42 归档批次）：Phase 42 入窗后主窗口 **419 行**（`docs:check:line-count` warn > 400；5 块窗口 + 索引之外的累积），按「目标窗口 5 个」口径压缩为「**Phase 38 ~ Phase 42** + 归档索引」，Phase 36 / Phase 37 迁入本目录 [phase-36-37.md](./todo-archive-phases-36-37.md)（迁移为机械操作：链接深度 `../` → `../../`，同目录 `./` → `../`，正文不改写；**迁出后 371 行**，373 为索引补行后的读数）。
