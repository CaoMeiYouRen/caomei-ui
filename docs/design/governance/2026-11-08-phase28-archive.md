# Phase 28 归档批次记录

> 创建时间：2026-11-08
> 触发：用户指令「开始归档」（Phase 28 已完成 8/8 并发布 `1.2.0`）。
> 依据：[规划规范 §7](../../standards/planning.md)（归档清理、历史指针回扫、wisdom 蒸馏）；[待办归档](../../plan/todo-archive.md) 主窗口口径；[Session Wisdom 蒸馏机制](../../standards/session-wisdom-distillation.md)。
> 边界：规划载体与归档载体为主；零 `src/**` / `test/**` / 依赖改动；已发布 tag / GitHub Release 不回改。

## 1. 归档结果

- `docs/plan/todo.md`：移除 Phase 28 条目表与交付状态块，声明 **当前无进行中阶段**；保留「未完成项汇总」的外部反馈指针。
- `docs/plan/todo-archive.md`：新增 Phase 28 归档块（5 条主线 / 8 条原子条目、发布与验收、RG 结论、遗留候选）；归档索引表补 Phase 22 行并同步标题 / 口径句；主窗口收窄为 **Phase 23 ~ Phase 28 共 6 块**。
- `docs/plan/archive/phase-22.md`：Phase 22 块机械迁入深度归档（链接深度 `../` → `../../`，同目录 `./` → `../`，正文不改写）；主窗口越过 warn 阈值后回落至 **362** 行（`docs:check:line-count` 口径，warn 阈值 400）。
- `docs/plan/roadmap.md`：§1 声明 **当前无进行中阶段**；Phase 28 行标注 **完成并发布 `1.2.0`、已归档**；§5 深度归档与压缩史同步。
- `docs/plan/archive/index.md`：新增 Phase 22 行与 2026-11-08 压缩记录。
- `docs/design/governance/experience-archive.md`：新增「2026-11-08 阶段归档蒸馏（Phase 28）」段（20 行摘要）。
- `.session/wisdom.md`（git-ignored）：活跃段清空，保留蒸馏指针；`current-task.yaml` / `runtime-state.json` 同步为无进行中阶段。

## 2. 阶段交付摘要

- **范围**：5 条主线 / 8 条原子条目（DatePicker range 2 / Toast 逐语气 2 / DataTable 适配 2 / 图标调研 1 / 发布收口 1）。
- **发布**：`1.2.0` 经 CI 发布，`latest = 1.2.0`；`v1.2.0` / GitHub Release / 回推 `0ced91e` 到位；下游 compat run `42441345211` success。
- **质量门**：`pnpm verify` exit 0（152 文件 / 2983 例）；a11y 68；E2E 484 passed / 4 skipped；视觉 40；`capture:styles` 386 项 0 差异。
- **长期任务**：第 31 轮门槛复核（2026-11-08）已执行并留痕；待执行批次 0，条件触发 1 项维持。
- **归档块**：见 [todo-archive.md](../../plan/todo-archive.md) 的 Phase 28 块；发布运行时验收见 [M5-1 记录](./2026-11-08-phase28-m5-1-1.2.0-release.md)。

## 3. wisdom 蒸馏

- 触发：阶段归档 + 活跃条目 **20**（阈值 20）。
- 处置：`migrate 0 / compress 20 / remove 0 / keep 0`；活跃段清空至 **0**。
- 归档：`docs/design/governance/experience-archive.md` 新增 20 行摘要；`pnpm check:distill-archive` 通过（exit 0）。
- 说明：本轮 20 条均已有永久载体（发布指南 / AI 协作 / 测试 / 规划 / 开发 / 文档 / 版本策略），故采用 `compress` 保留摘要与链接，不重复扩写规范正文。

## 4. 验证与回扫

| 项 | 结果 |
| --- | --- |
| `pnpm docs:check` | exit 0（integrity / links / structure / parity / line-count / i18n 等） |
| `pnpm docs:build` | exit 0 |
| `pnpm lint:md:check` | exit 0 |
| `check:governance-records` | 记录与索引一致；历史规划指针无失效 |
| `check:archive-rg-counts` | 归档条目与 RG 计数无矛盾 |
| `check:stage-counts` | **skipped：当前无进行中阶段**（与 `roadmap.md` §1 交叉校验通过） |
| `check:planning-numbers` | 0 处命中 |
| `check:distill-archive` | 通过（exit 0） |
| `docs:check:line-count` | `todo-archive.md` 362 行（warn 400） |
| `docs:check:version` | 5 个展示面均为 `1.2.0`，README 中英与 roadmap 一致 |

- **回扫口径（三段式）**：
  - **机检面**：`check-governance-records` / `docs:check:links` / `check-archive-rg-counts` / `check-stage-counts` / `check-planning-numbers` / `docs:check:version` 全绿；`docs:build` 通过。
  - **人工面**：`rg -l "Phase 28" docs/ | wc -l` → **20** 个文件（2026-11-08 快照）；逐类核对——活跃载体 `todo.md` / `roadmap.md` / `todo-archive.md` / `archive/index.md` / 本记录 / 发布记录 / 发布前检查记录 / 治理索引 / `experience-archive.md` / `backlog.md` / `recurring.md` 均已同步；8 份 Phase 28 阶段记录与 `2026-11-07-next-stage-scope-evaluation-12.md` 属点时记录，其中「待执行 / 待归档」表述按快照保留。
  - **未处理面**：Phase 28 各条目治理记录不回改（点时记录）；已发布 `v1.2.0` tag / GitHub Release 不重写；`.session` 已同步但不入库。

## 5. Review Gate

- **audit-depth**：`standard`（归档批次：主窗口迁移 + 深度归档 + 规划载体 + wisdom 蒸馏；零代码改动）。时间盒 ≤ 10 分钟。
- **R1（`standard`）**：`Reject`（1 blocker / 2 warning / 5 suggest）。**已修**：B1 归档索引表补 Phase 22 行并同步标题 / 口径句；W1 回扫人工面补 `rg -l` 20 文件与逐类载体；W2 去掉 `check:distill-archive` 段数读数，改为 exit 0；S1 索引摘要去掉行数 / 活跃数；S2 起始行数订正为 368；S3 时间盒改 ≤ 10 分钟；S4 去掉 M5-1 记录重复链接；S5 `.session` 的 `active_plan` 改为无进行中阶段。
- **R2（`quick` delta）**：`Pass`（0 blocker / 1 warning / 2 suggest）；B1 / W1 / W2 / S1 / S3 / S4 / S5 关闭；RG-W01 行数口径已订正为 `docs:check:line-count` 的 362 行（三处载体同步），RG-S02 指针改为 §3 / §4；按 R2 约定不再开轮次。
- **实测用时**：R1 起于 `2026-11-08T13:37:33+08:00`，返回约 `13:43`（≈6 分钟，≤10 分钟时间盒）；R2 起于 `13:45:55`，返回约 `13:49`（≈3 分钟，≤5 分钟时间盒）。
