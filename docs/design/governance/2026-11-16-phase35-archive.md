# Phase 35 归档批次

> 创建时间：2026-11-16
> 触发：用户指令「开始归档」。阶段范围与验收口径见 [Phase 35 登记批次](./2026-11-15-phase35-registration.md) §1 / §2；条目级交付见 [待办归档](../../plan/todo-archive.md) 的 Phase 35 块。

## 1. 改动面（8 文件）

| 面 | 文件 |
|:---|:---|
| 归档主窗口 | `docs/plan/todo-archive.md`：新增 Phase 35 块；Phase 28 ~ 30 块迁出；主窗口口径更新为 Phase 31 ~ Phase 35 / 311 行（`docs:check:line-count`） |
| 深度归档 | `docs/plan/archive/phase-28.md`、`docs/plan/archive/phase-29.md`、`docs/plan/archive/phase-30.md`：三块机械迁入（链接深度 `../` → `../../`，同目录 `./` → `../`） |
| 归档索引 | `docs/plan/archive/index.md`：新增三行文件表与 2026-11-16 压缩记录 |
| 当前待办 | `docs/plan/todo.md`：清空阶段状态句与条目表，改为「当前无进行中阶段」，保留未完成项汇总 |
| 路线图 | `docs/plan/roadmap.md`：§1 当前态、Phase 35 行与 §5 深度归档范围 / 压缩记录 |
| 长期任务 | `docs/plan/recurring.md`：第 39 轮门槛复核（Phase 35 收口），两任务「上次执行」前移 |

治理索引与本记录属登记 / 留痕，不计入上表。复算口径（2026-11-16）：`git status --porcelain -uall` 为 10，其中 8 落在上表，另 2 为登记留痕（`docs/design/governance/index.md`、本记录）。

## 2. 决策

1. **归档块按 3 条主线组织**：10 条编号全部落位并给出提交 / PR 与记录链接，与登记口径（5 + 2 + 3）一致；阶段总结、长期任务、wisdom、回扫口径与遗留各自成节。
2. **主窗口压缩到目标窗口 5 块**：Phase 35 入窗后若只迁出 Phase 28 仍会有 7 块且贴近阈值；按「目标窗口 = 最近 5 个已完成阶段」一次迁出 Phase 28 ~ Phase 30，主窗口变为 Phase 31 ~ Phase 35 共 5 块、311 行（净 −86：迁出三块约 134 行、新增块与索引行约 48 行），距 warn 400 有充足余量；块顺序保持升序（35 接在 34 之后）。
3. **三块迁移为机械操作**：仅把链接深度 `../` → `../../`、同目录 `./` → `../`；迁移后用「反向改写 + 逐行对比」自证与原块逐字一致（三块均通过）。
4. **`todo.md` 只留状态与未完成项**：不保留阶段编号、归档链接与交付摘要（`check-stage-counts` 的「无进行中阶段」分支对两者均判残留）。
5. **`roadmap.md` 保留阶段级摘要**：§1 改为当前无进行中阶段 + Phase 35 已完成并归档，§5 深度归档范围扩到 Phase 0 ~ Phase 30、压缩记录补第十二次。
6. **长期任务在归档批执行**：按 §8 触发义务执行第 39 轮门槛复核，结论与第 38 轮一致（待执行 0 / 条件触发 1 / 不纳入 5），`capture:styles` 399 项 0 差异。
7. **不登记下一阶段**：未评估、未授权，不在 `todo.md` / `roadmap.md` 登记 Phase 36；候选保留在 Backlog。

## 3. 验证

| 面 | 结果 |
|:---|:---|
| 主窗口行数 | `docs/plan/todo-archive.md` 311 行（`docs:check:line-count` 值），未越 warn 400 |
| 治理守卫 | `check:governance-records` / `check:planning-numbers` / `check:stage-counts`（无进行中阶段分支跳过）/ `check:archive-rg-counts` / `check:governance-counts` / `check:design` / `docs:check` → `exit 0` |
| 长期任务 | `node scripts/governance/distill-wisdom.mjs --check` → 16 条活跃（< 20，不蒸馏）；`capture:styles` 399 项 0 差异 |
| `pnpm verify` | `exit 0` |
| 迁移自证 | 以 `git show HEAD:docs/plan/todo-archive.md` 为基线做**正向**机械改写后逐行对比：phase-28 / 29 / 30 均零差异（38 / 50 / 41 行） |

## 4. Review Gate

- **R1（`standard`，约 10 分钟）**：**Reject**（1 blocker / 4 warning / 1 suggest）——① `phase-30.md` 中「链接深度 `../` → `../../` 18 处」被机械改写污染为 `../`，使「正文不改写」失实；② 记录 §1 的 `git status` 计数与「留痕另计」表述矛盾；③ 行数构成式的加数不可复算；④ 新块置顶与既有升序不一致；⑤ §4 占位。
- **R1 处置**：恢复 `phase-30.md` 该句的 `../../`，并以 `git show` 基线做正向 diff 重证（三块零差异）；§1 改为「git status 10 = 8 + 2 留痕」；行数构成改为净额表述（397 − 86 = 311）；Phase 35 块移到 Phase 34 之后保持升序；本节补齐。

## 5. 遗留

| 编号 | 内容 | 落点 |
|:---|:---|:---|
| O1 | 浮层隔离扩面（MultiSelect / AutoComplete / DatePicker 仍只有 `aria-hidden`） | 观察项，范围决策后另行登记 |
| O2 | DataTable 列宽拖拽手柄 / 虚拟滚动 | Backlog 候选（虚拟滚动需新增依赖） |

## 6. 复查基线

本记录 §1 ~ §5；`docs/plan/todo-archive.md` 的 Phase 35 块与主窗口口径；`docs/plan/archive/phase-28.md` ~ `phase-30.md` 与 `archive/index.md`；`docs/plan/todo.md` 当前状态；`docs/plan/roadmap.md` §1 / Phase 35 行 / §5；`docs/plan/recurring.md` 第 39 轮。
