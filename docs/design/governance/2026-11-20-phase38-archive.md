# Phase 38 归档批次

> 创建时间：2026-11-20
> 触发：用户指令「开始归档」。范围与验收口径的唯一载体是 [Phase 38 登记批次](./2026-11-20-phase38-registration.md)；条目交付记录见 [M1-1](./2026-11-20-phase38-m1-1-safe-area.md) / [M1-2](./2026-11-20-phase38-m1-2-fixed-overlays.md) / [M2–M4 交付记录](./2026-11-20-phase38-m2-m4-mobile-shell-and-acceptance.md)。本记录只承载归档结论、质量门与回扫证据。

## 1. 阶段构成与交付对账

- **4 条主线 / 11 条原子条目**全部交付（基础层 2 / 移动壳 3 / 操作与空态 3 / 口径与验收 3；对账 2 + 3 + 3 + 3 = 11）。
- 本阶段**不发布**：`latest` 维持 `1.3.0`，未执行 `pnpm release`、未触发 Release workflow。

| 条目 | 提交 | Review Gate 结论 |
|:---|:---|:---|
| M1-1 安全区 token 与工具类 | `89f0fc6` | R1 `standard` Pass → R2 `quick` Pass |
| M1-2 固定定位件接入与 `dvh` 回退 | `d1f0e4d` | R1 `standard` Pass → R2 `quick` Pass |
| M2-1 Cell / CellGroup | `a7e3159` + `2097a24` | 同批 R1 `standard` → R2 delta → R3 `quick` Pass |
| M2-2 Tabbar / TabbarItem | `6f91402` + `50dbcc7` | 同批 R1 `standard` → R2 delta → R3 `quick` Pass |
| M2-3 M2 的 10 语、台账与文档 | `0710963` + `cb8d03b` + `6052436` | 同批 R1 `standard` → R2 delta → R3 `quick` Pass |
| M3-1 ActionSheet | `0ecd371` + `9f7dd1d` | 同批 R1 `standard` → R2 delta → R3 `quick` Pass |
| M3-2 Empty | `e203b70` + `ef6d7c4` | 同批 R1 `standard` → R2 delta → R3 `quick` Pass |
| M3-3 M3 的 10 语、台账与文档 | `0710963` + `cb8d03b` + `6052436` | 同批 R1 `standard` → R2 delta → R3 `quick` Pass |
| M4-1 移动端适配指南 | `0115a33` | 同批 R1 `standard` → R2 delta → R3 `quick` Pass |
| M4-2 44px 政策与回归扩面 | `47ff782` + `d582e26` + `b71b655` | 同批 R1 `standard` → R2 delta → R3 `quick` Pass |
| M4-3 验收视口扩面 | `b71b655` + `7218e98` | 同批 R1 `standard` → R2 delta → R3 `quick` Pass |

- **提交对账**：窗口 `git log --oneline --no-merges d1f0e4d..291499e` → **18**（9 条实现 / 测试 / 文档与规划状态回填）；归档提交另计 1 个。
- **Review Gate 明细**：三区分审 R1（运行时 Pass 0B/3W/8S；文档 Reject 1B/5W/7S；测试 Reject 3B/4W/4S）→ R2（运行时 Pass 0B/1W/6S；文档 Reject 1B/3W/4S；测试 Pass 0B/1W/5S）→ R3 Pass（另 2 条措辞 warning 同批关闭）。详见 [M2–M4 交付记录](./2026-11-20-phase38-m2-m4-mobile-shell-and-acceptance.md) §3。

## 2. 归档动作

- `todo.md`：清空当前阶段状态句与条目表，回到「当前无进行中阶段」；未完成项汇总只保留等待外部反馈指针。
- `todo-archive.md`：Phase 38 归档块入窗；主窗口由 6 块（Phase 32 ~ 37）变为 7 块前，按「目标窗口 5 个；未越 `warn` 暂留 6 块」口径把最早的 Phase 32 迁入深度归档 [phase-32.md](../../plan/archive/phase-32.md)，主窗口回到 **Phase 33 ~ Phase 38 共 6 块 / 374 行**。
- `archive/index.md`：新增 phase-32 行与 2026-11-20 迁出时点。
- `roadmap.md`：§1 当前态改为「当前无进行中阶段」，阶段表 Phase 38 行改为「已完成（2026-11-20 归档）」，§5 深度归档范围与压缩历史同步。
- `recurring.md`：新增第 **42** 轮门槛复核（Phase 38 收口轮）并补触发义务句。
- `docs/design/governance/index.md`：登记本记录。
- `.session/current-task.yaml` / `runtime-state.json`：同批切到「无进行中阶段、无在办条目」。

## 3. 质量门

### 3.1 本地

- `pnpm verify` → 全绿（lint / lint:css / lint:md / typecheck / typecheck:docs / test / build / check:build / check:resolver / check:nuxt / docs:build / docs:check:i18n-routing / governance:check）。
- 全量单测 **182 文件 / 3553 例**通过；`pnpm capture:styles` → **399 项 0 差异**；`pnpm test:visual` → **48/48**。
- E2E：`mobile-shell` 三档 **27/27**；`responsive` 9 档 **186 passed / 12 skipped**（12 = 6 个定向档 × 2 条自驱探针）。
- `pnpm distill:wisdom --check` → **17 条活跃**（< 阈值 20，不蒸馏）；`distill-wisdom --reconcile` 通过。

### 3.2 CI

- Phase 38 的 18 个登记 / 交付提交已推送：`origin/master` = `291499e`（`docs(plan): 登记 Phase 38 交付并校准冻结面计数`）。本归档改动写入时 `HEAD` 同为 `291499e`；归档提交本身尚未推送，如需 CI 复核，由用户明确推送后触发。

## 4. 长期任务门槛复核

第 **42** 轮（2026-11-20，Phase 38 收口轮）：待执行批次 **0 项**；未达门槛的条件触发候选 **1 项维持**（表单控件公共 props 契约后续候选）；已判定不纳入 5 项维持。计数漂移（含内联同名字段 37 → 40、`useAttrs()` 15 → 16）全部归因于 Phase 38 新增的 `action-sheet` / `empty` / `tabbar`，不改变条件触发结论。详见 [长期任务](../../plan/recurring.md)。

## 5. 回扫口径（三段式）

- **机检面**：`check:governance-records` / `check:planning-numbers` / `check:stage-counts`（无进行中阶段分支）/ `check:archive-rg-counts` / `check:governance-counts` / `check:design` / `docs:check` / `governance:check` 全绿（见 §6）。
- **人工面**：`todo.md`（当前无进行中阶段 + 未完成项汇总）/ `roadmap.md`（§1、Phase 38 行、§5）/ `todo-archive.md`（Phase 38 块、主窗口口径句）/ `archive/index.md`（phase-32 行与迁出时点）/ `recurring.md`（第 42 轮与触发义务句）/ `governance/index.md`（本记录行）逐处核过；`.session` 两份文件同批切到「无进行中阶段」。
- **未处理面**：历史治理记录中指向 `docs/plan/todo.md` 的时点陈述按既有边界不回改；本次未新增失效指针。

## 6. 归档门禁命令

- `pnpm lint:md:check` / `pnpm docs:check:line-count` / `pnpm docs:check:i18n-parity` / `pnpm docs:check:structure` / `pnpm docs:check:links` / `pnpm check:stage-counts` / `pnpm check:archive-rg-counts` / `pnpm check:governance-records` / `pnpm check:governance-counts` / `pnpm governance:check` → 全绿。

## 7. 遗留与后续候选

- **真实设备验收**：iOS safe-area / 软键盘与 `dvh` 动态差异无自动化条目，随真机验收执行。
- **既有 E2E 装置失败**：back-top、overlay-stacking、navigation-motion、selector-motion、data-table-scroll 已在干净 HEAD 复现，登记 [Backlog §1.6](../../plan/backlog.md)，待用户裁定是否排期。
- **宽屏视觉基线 / `xl` 断点**：维持 [Backlog §1.6](../../plan/backlog.md) 候选，按触发条件启动。
- 其余条件触发候选见 [Backlog](../../plan/backlog.md)；启动需用户明确授权。
