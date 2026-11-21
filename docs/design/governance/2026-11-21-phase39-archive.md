# Phase 39 归档批次

> 创建时间：2026-11-21
> 触发：用户指令「开始归档」。范围与验收口径的唯一载体是 [Phase 39 登记批次](./2026-11-21-phase39-registration.md)；逐条交付对账见 [Phase 39 交付记录](./2026-11-21-phase39-delivery.md)。本记录只承载归档结论、质量门与回扫证据。

## 1. 阶段构成与交付对账

- **7 条主线 / 14 条原子条目**全部交付（InputOtp 2 / Popconfirm 2 / Result 2 / Descriptions 3 / 治理收口 1 / 文档站设备预览 2 / E2E 质量收口 2；对账 2 + 2 + 2 + 3 + 1 + 2 + 2 = 14）。
- 本阶段**不发布**：`latest` 维持 `1.3.0`，未执行 `pnpm release`、未触发 Release workflow。
- **提交对账**：执行窗口 `git log --oneline --no-merges 6e11fb1..630faa92` → **15**（14 条交付与集成收口）；归档提交另计 1 个。
- 逐条提交与 Review Gate 结论见 [交付记录](./2026-11-21-phase39-delivery.md) §1。

## 2. 归档动作

- `todo.md`：清空当前阶段状态句、6 列进度表与条目表，回到「当前无进行中阶段」；未完成项汇总只保留等待外部反馈指针。
- `todo-archive.md`：Phase 39 归档块入窗；主窗口由 6 块（Phase 33 ~ 38）变为 7 块前，按「目标窗口 5 个；未越 `warn` 暂留 6 块」口径把最早的 Phase 33 迁入深度归档 [phase-33.md](../../plan/archive/phase-33.md)，主窗口回到 **Phase 34 ~ Phase 39 共 6 块 / 384 行**（`docs:check:line-count`）。
- `archive/index.md`：新增 phase-33 文件行、Phase 33 索引行与 2026-11-21 迁出时点。
- `roadmap.md`：§1 当前态改为「当前无进行中阶段」，阶段表 Phase 39 行改为「2026-11-21 完成并归档」，§5 深度归档范围（Phase 0 ~ 33）与压缩历史同步。
- `recurring.md`：新增第 **43** 轮门槛复核（Phase 39 收口轮）并补触发义务句。
- `docs/design/governance/index.md`：登记交付记录与归档记录。
- `.session/current-task.yaml` / `runtime-state.json`：同批切到「无进行中阶段、无在办条目」。

## 3. 质量门

### 3.1 本地

- `pnpm verify` → 全绿（lint / lint:css / lint:md / typecheck / typecheck:docs / test / build / check:build / check:resolver / check:nuxt / docs:build / docs:check:i18n-routing / governance:check）。
- 全量单测 **189 文件 / 3619 例**通过；`pnpm capture:styles` → **399 项 0 差异**。
- 目标 E2E：5 spec × 3 project → **81 passed**；全量 E2E 首跑 **1119 passed / 12 skipped / 1 failed**（`safe-area-fixed` 的 BackTop 偏移），修复后复跑 back-top + safe-area → **30 passed**。
- `pnpm distill:wisdom --check` → **19 条活跃**（< 阈值 20，不蒸馏）；`distill-wisdom --reconcile` 通过。

### 3.2 CI

- Phase 39 的 15 个执行提交均未推送（遵守禁止自动推送）；`origin/master` = `6e11fb1`。归档提交本身亦未推送；如需 CI 复核，由用户明确推送后触发。

## 4. 长期任务门槛复核

第 **43** 轮（2026-11-21，Phase 39 收口轮）：待执行批次 **0 项**；未达门槛的条件触发候选 **1 项维持**（表单控件公共 props 契约后续候选）；已判定不纳入 5 项维持。Phase 39 新增的四个组件均不改变两组门槛的条件触发结论；`capture:styles` 采样面 **399 项 0 差异**。详见 [长期任务](../../plan/recurring.md)。

## 5. 回扫口径（三段式）

- **机检面**：`check:governance-records` / `check:planning-numbers` / `check:stage-counts`（无进行中阶段分支）/ `check:stage-progress`（跳过）/ `check:archive-rg-counts` / `check:governance-counts` / `check:design` / `docs:check` / `governance:check` 全绿。
- **人工面**：`todo.md`（当前无进行中阶段 + 未完成项汇总）/ `roadmap.md`（§1、Phase 39 行、§5）/ `todo-archive.md`（Phase 39 块、Phase 33 迁出、主窗口口径句与行数）/ `archive/index.md`（phase-33 行、文件表与迁出时点）/ `recurring.md`（第 43 轮与触发义务句）/ `governance/index.md`（交付记录与归档记录两行）逐处核过；`.session` 两份文件同批切到「无进行中阶段」。
- **未处理面**：历史治理记录中指向 `docs/plan/todo.md` 的时点陈述按既有边界不回改；本批无新增失效指针。

## 6. 归档门禁命令

- `pnpm lint:md:check` / `pnpm docs:check:line-count` / `pnpm docs:check:i18n-parity` / `pnpm docs:check:structure` / `pnpm docs:check:links` / `pnpm check:stage-counts` / `pnpm check:stage-progress` / `pnpm check:archive-rg-counts` / `pnpm check:governance-records` / `pnpm check:governance-counts` / `pnpm governance:check` → 全绿。

## 7. 遗留与后续候选

- **真实设备验收**：OTP 短信自动填充 / 输入法、设备预览的 iOS 地址栏 `dvh` 与触摸滚动无自动化条目，随真机验收执行。
- **Popconfirm 可访问名**：dialog 名称来自触发器（Reka 内部绑定），标题名未接管；如需改为标题名须调整 `PopoverContent` 的 ARIA 接线。
- **并行 worker 动效采样**：`navigation-motion` / `selector-motion` 在并行 worker 下存在采样竞争；CI 固定 `workers=1`。
- **阶段不发布**：`latest` 维持 `1.3.0`，`1.4.0` 发布未登记。
- 其余条件触发候选见 [Backlog](../../plan/backlog.md)；启动需用户明确授权。
