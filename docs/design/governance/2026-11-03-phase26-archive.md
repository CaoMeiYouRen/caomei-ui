# Phase 26 归档批次：阶段收口、Phase 24 补齐与深度归档

- 时点：2026-11-03
- 范围：Phase 26 阶段块归档（含 G1-F / S1 / S2 / S3 插队批次与 G0 ~ G4 门禁）、Phase 24 补齐后整体归档、Phase 19 / 20 深度迁移、`todo.md` 收口、第 28 轮门槛复核
- 上游：[M3-3 发布记录](./2026-11-03-phase26-m3-3-1.0.0-release.md)；[门禁规划](./2026-10-26-phase26-ui-gate-planning.md) §4
- 下游：下一阶段范围评估（待用户裁定）

## 1. 交付面

| 交付 | 结果 |
| --- | --- |
| Phase 26 块入归档 | 5 条主线 / 17 条条目 + 4 个插队批次；含阶段总结、提交对账、回扫、长期任务、遗留 |
| Phase 24 补齐 | M1-1 / M2-1 于 2026-10-22 回填，本批改「部分归档」为「已完成并整体归档」，逐条交付 14 → 16 |
| 深度归档 | Phase 19 → `docs/plan/archive/phase-19.md`；Phase 20 → `docs/plan/archive/phase-20.md`（仅链接深度 `../` → `../../`，含 `./backlog.md` → `../backlog.md` 等机械修正） |
| 主窗口口径 | 近线窗口现状 **Phase 21 ~ Phase 26 共 6 块**（口径 = 目标窗口 5 个，未越 `warn` 暂留 6）；主窗口本批前 **396 行**；Phase 26 入窗后约 470 行（> warn 400），Phase 19 / 20 迁出后回落至 **362 行**（`docs:check:line-count` 口径） |
| `todo.md` 收口 | 移除阶段块与门禁段落；当前状态改为「无进行中阶段」；已发布版本改 `1.0.0`（shasum / fileCount 432 / 8 个 tag）；长期任务指针改第 28 轮 |
| 第 28 轮门槛复核 | 两组任务待执行批次 0；条件触发 1 项维持；不纳入 5 项维持；计数与第 27 轮逐项一致（15 / 11 / 0 / 12 / 35 / 4 / 13；shared 0；`capture:styles` 349） |

## 2. 提交对账

- `git log --oneline 10de6e8^..37ca419 --no-merges | wc -l` → **56**（下界 = 登记提交 `10de6e8` 的父提交 `51f00bc`，上界 = 1.0 发布治理收口提交 `37ca419`）；构成 = 条目行 28 + 门禁 / 规划 / 发布记录与收口 28。
- 本归档批次自身提交不计入上式；条目行 28 条可逐条复核，其余 28 条为门禁 / 规划 / 发布记录与收口。
- 归档批次为纯规划 / 治理载体改动（README 时态收口另批提交），零 `src/**`。

## 3. 回扫口径（三段式）

- **机检面**：`pnpm governance:check`（含 `check-governance-records` / `check-governance-counts` / `check:candidate-anchors` / `check:planning-numbers`）与 `pnpm docs:check` 全绿；`docs:check:links` 修复 5 处迁出块的 `./` 相对链接。
- **人工面**：Phase 26 各治理记录对 `todo.md` 的引用按「点时记录保持原样」；逐条核对 M1-1 ~ M1-4 / M2 / M3-1 ~ M3-3 / M4-2 / M5-1 ~ M5-4 / G1-F / S1 ~ S3 的回链。
- **未处理面**：历史记录内「阶段限定 + 复用编号」类散文指针不回改（边界见 [M3-5](./2026-10-15-phase24-m3-5-planning-carrier-discrepancy-cleanup.md)）。

## 4. 阶段收口观察

- `docs:check:integrity` 对 `todo.md` 报「H1/H2 由 9 降为 3」告警——阶段 / 条目标题在 H3/H4，属归档正常移除面（非阻断）。
- 归档后 `todo.md` 不再有「当前进行中阶段：」声明，`check-planning-numbers` 按归档形态全文件受检，0 命中。
- 归档载体行数回落到 warn 阈值内（362 / warn 400），下一次超阈值时按同一规则继续迁出最早的阶段块。

## 5. wisdom 蒸馏

- `pnpm distill:wisdom --check`：活跃 14 条（< 阈值 20，不蒸馏）；`check:distill-archive` 通过。

## 6. Review Gate

- **R1（standard）：Reject**（1 blocker / 7 warning / 6 suggest）：blocker = `roadmap` 仍写「待独立批次」，与已归档形成跨载体两套口径；warning = 行数口径、归档索引缺 Phase 19/20、窗口口径、提交对账、CI 镜像义务、会话态、integrity 覆盖面。
- **R2（standard，delta）：Reject**（1 blocker / 4 warning）：blocker = 行数声明 358 与实测 362 不符（W1 复发）；另有 `:5` 索引范围、深归档「另 5 处」计数、README 归批、记录窗口口径。
- **R3（standard，delta）：Reject**（0 blocker / 1 warning / 2 suggest）：W10 / S1 声明已改但未落地。
- **R4（quick，确认）：Pass**（0 blocker / 0 warning）：W10 / S1 落地；行数 362 与三处声明一致。
