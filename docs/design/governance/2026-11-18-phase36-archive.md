# Phase 36 归档批次

> 创建时间：2026-11-18
> 触发：用户指令「开始归档」。阶段范围与验收口径见 [Phase 36 登记批次](./2026-11-17-phase36-registration.md) §1 / §2；条目级交付见 [待办归档](../../plan/todo-archive.md) 的 Phase 36 块。

## 1. 改动面

| 面 | 文件 |
|:---|:---|
| 归档主窗口 | `docs/plan/todo-archive.md`：新增 Phase 36 块（12 条交付、阶段总结、三段式回扫、遗留）；文首主窗口口径句更新为 Phase 31 ~ Phase 36 共 6 块 / 362 行（未越 warn 阈值，无需迁出） |
| 当前待办 | `docs/plan/todo.md`：清空阶段状态句与条目表，改为「当前无进行中阶段」，保留未完成项汇总 |
| 路线图 | `docs/plan/roadmap.md`：§1 当前态与 Phase 36 行（完成并归档） |
| 长期任务 | `docs/plan/recurring.md`：第 40 轮门槛复核（Phase 36 收口），两任务「上次执行」前移 |
| 治理索引 | `docs/design/governance/index.md`：本记录登记一行 |

`.session/current-task.yaml` 与 `.session/runtime-state.json` 同批切到「无进行中阶段」（gitignored，不进提交物）。

复算口径（2026-11-18）：`git status --porcelain -uall` 为 6，其中 5 落在上表、1 为本记录。

## 2. 决策

- **窗口不迁出**：`todo-archive.md` 归档后 362 行，低于 `docs:check:line-count` 的 warn 阈值（400），按「窗口与阈值解耦」口径暂不压缩；下次越阈再机械迁出最早块。
- **不发布**：Phase 36 按登记 D3 维持不发布，`latest` 仍为 `1.3.0`；本轮不触发 Release。
- **不启动下一阶段**：候选维持 Backlog，登记需用户明确授权。

## 3. 验证

- `pnpm verify`：见 §3.1。
- `pnpm capture:styles` → **399 项 0 差异**。
- `pnpm distill:wisdom --check` → **16 条活跃**（< 阈值 20，不蒸馏）。
- `pnpm check:stage-counts` → 跳过（`todo.md` 显式声明无进行中阶段，与 `roadmap.md` §1 一致）。
- `pnpm check:archive-rg-counts` → OK（受检条目 112 / 有比对 36 / 可比对字段 75）。
- `pnpm governance:check` / `docs:check` 全绿。

### 3.1 `pnpm verify`

- 首次运行：`lint:check` / `lint:css:check` / `lint:md:check` / `typecheck` / `typecheck:docs` 全绿；`pnpm test` 出现 **1 例并行 flaky**（`data-table.select-all-scope` 的 `scope=all` 用例）→ 该文件单独复跑 **10 passed**、`pnpm test` 复跑 **3469 passed**。
- 随后 `pnpm build` / `check:build` / `check:resolver` / `check:nuxt` / `docs:build` / `docs:check:i18n-routing` / `governance:check` 依次 **exit 0**（合并日志 `rest_exit=0`）。
- 结论：verify 链无真实红灯；1 例属已知并行 flaky 类（Vitest `maxWorkers` 负载，见 [Phase 18 M2-1](./2026-10-01-phase18-m2-1-flaky-class.md)），单独与复跑均通过。
- `node scripts/docs/check-docs-axe.mjs`（全矩阵 23 条目 / 22 路径）→ **OK**：零违规。

## 4. Review Gate

- **R1（`quick`）**：Reject —— 1 blocker（`todo-archive` 文首主窗口口径句停留在 Phase 31 ~ 35 / 311 行，与实际 6 块 / 362 行冲突）/ 4 warning（第 40 轮行插在 39 前、证据漏项、触发义务段未补 39 / 40 轮、索引摘要复述读数）/ 3 suggest。
- **R2（`quick`）**：Pass —— B1 与 W2 ~ W5 全部关闭；S6 / S7 已修，另 3 条 suggest 同批处理（证据措辞限定、索引措辞、M4-2 轮次归属）。
- 验证：`check:archive-rg-counts`（112 / 36 / 75）、`check:stage-counts`（跳过）、`check:governance-records`（366 / 602 / 56）、`lint:md:check`、`docs:check:line-count`（362 行）全绿。

## 5. 遗留

- **虚拟滚动**：评估结论「可行（有条件）」，触发条件 = 单页 > 200 行（经验值，立项前须实测校准）或用户裁定；在此之前不新增运行时依赖。
- **列宽拖拽**：冻结列手柄吸边的像素级几何未单独断言；最小宽 / 步进不可配置，无 resize 结束事件。
- **浮层隔离**：DropdownMenu 无独立 E2E 夹具锚点；页面级非模态 Popover 的三视口 Tab 用例待补。
- **长期任务条件候选**：表单控件公共 props 契约（维持未达门槛）。
- 其余条件触发候选见 [Backlog](../../plan/backlog.md)。

## 6. 复查基线

- `master` 在 `ae61ba2`；本批提交后以 `git log --oneline --no-merges 4f57ce6^..ae61ba2` 复算提交对账（归档批提交本身不计入阶段交付）。
- 三段式回扫口径见 [待办归档](../../plan/todo-archive.md) 的 Phase 36 块。
