# Phase 40 归档批次：国际化收口、P1 组件广度与 `1.4.0` 发布

> 创建时间：2026-11-21
> 触发：用户指令「开始归档」。
> 性质：**归档与规划载体收口记录**；阶段交付的权威记录是各条目治理记录，本记录只做归档动作、载体同步与回扫留痕。

## 1. 归档动作

- `todo.md`：清除 Phase 40 状态句、6 列进度表与 15 条条目表，回到「**当前无进行中阶段** + 未完成项汇总」；不保留阶段编号与交付摘要。
- `todo-archive.md`：Phase 40 块入窗（6 项必填）；主窗口由「Phase 34 ~ 39」变为「**Phase 35 ~ 40 共 6 块**」，`docs:check:line-count` 读数 **378 行**（未越 warn 400，按「未越阈值暂留 6 块」口径不额外压缩）。
- 深度归档：Phase 34 块机械迁入 [todo-archive-phases-34.md](../../plan/archive/todo-archive-phases-34.md)；`archive/index.md` 新增文件行与 2026-11-21 迁出时点；`roadmap.md` §5 深度归档清单补 Phase 34、主窗口起点改为 Phase 35。
- `roadmap.md`：§1 当前态改为「当前无进行中阶段 + Phase 40 已完成并归档」；Phase 40 阶段表行改为「2026-11-21 完成并归档（发布 `1.4.0`）」。
- `recurring.md`：新增第 **45 轮**（Phase 40 收口门槛复核），任务表「最近执行」同步。
- 治理索引：本记录登记一行。
- `.session`：`current-task.yaml` / `runtime-state.json` 切到「无进行中阶段，Phase 40 已归档」，推送态与发布态同步。

## 2. 阶段交付与发布

- **4 条主线 / 15 条原子条目全部交付**：国际化收口 4 / P1 组件广度 6 / 发布收口 3 / 规划载体收口 2。
- **`1.4.0` 已发布**：Weekly Regression `44909361461` success；Release `44913800718` success；npm `latest` = `1.4.0`；tag `v1.4.0`；GitHub Release 已建；Downstream Compat `44914670234` 三仓 success。
- 完整逐条对账见 [待办归档](../../plan/todo-archive.md) Phase 40 块与 [发布与下游复验记录](./2026-11-21-phase40-m3-2-m3-3-release-and-downstream.md)。

## 3. 质量门与长期任务

- `pnpm verify` 全链通过（194 文件 / 3655 例；VitePress 构建成功；`capture:styles` 399 项 0 差异）。
- 长期任务第 45 轮：待执行批次 **0 项**；条件触发 **1 项维持**；已判定不纳入 5 项维持。
- wisdom 蒸馏：活跃 **20 条**达到阈值，已全部压缩进[经验归档](./experience-archive.md)；`check:distill-archive` 15 段对账通过，`.session/wisdom.md` 活跃清零。

## 4. 回扫口径（三段式）

- **机检面**：`check:governance-records` / `check:planning-numbers` / `check:stage-counts`（无进行中阶段分支）/ `check:stage-progress`（跳过）/ `check:archive-index` / `check:archive-rg-counts` / `check:governance-counts` / `check:design` / `docs:check` / `governance:check` 全绿。
- **人工面**：`todo.md`（阶段状态句 / 进度表 / 条目表清空）/ `roadmap.md`（§1 当前态、Phase 40 行、§5）/ `todo-archive.md`（Phase 40 入窗、Phase 34 迁出、主窗口口径与行数）/ `archive/index.md`（phase-34 行与迁出时点）/ `recurring.md`（第 45 轮与触发义务句）/ `governance/index.md`（归档记录行）逐处核过；`.session` 同批切到「无进行中阶段」。
- **未处理面**：历史治理记录中指向 `docs/plan/todo.md` 的时点陈述按既有边界不回改；`1.4.0` tag 不含发布后 `labelAttrs` 修正，tag 不回改，修正随下一 patch；本批无新增失效指针。

## 5. 遗留与后续候选

- **issue #71（规划文档模型 v1）**：进度表、分片改名、机检已落地，`roadmap-phases-*.md` 未采纳；需回写结论并关闭。
- **issue #73（破坏性提交人工审查）**：新提案，待研判；不属 Phase 40 范围。
- **下一 patch**：包含 `labelAttrs` 修正（`90c4c67f`）；是否发 `1.4.1` 待用户裁定。
- **momei 页面级反馈**：仍等待外部反馈；不阻塞归档。
- 其余条件触发候选见 [Backlog](../../plan/backlog.md)；启动需用户明确授权。

## 6. Review Gate

**结论：R1 Pass**（`standard`，2026-11-21）。

- audit-depth：`standard`——归档批次含跨载体计数与索引覆盖。
- 时间盒：≤ 10 分钟；实际用时约 7 分钟。
- 验证：`governance:check` exit 0；`check:archive-index` 20 分片；`check:archive-rg-counts` 137 / 37 / 78 无矛盾；`check:distill-archive` 15 段；`docs:check:links` 665 md；`docs:check:line-count` todo-archive 378 行；`docs:check:version` 通过。
- Findings：无 blocker；RG-W01（recurring 表格空行）与 RG-W02（行数 376 → 378）已在本轮修正；RG-S01 为 Phase 34 迁出形态说明，不影响归档结果。
- 未覆盖边界：历史点时指针不回改；`1.4.0` tag 不含发布后 `labelAttrs` 修正。
