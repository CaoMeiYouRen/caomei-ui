# Phase 37 归档批次

> 创建时间：2026-11-19
> 触发：用户指令「开始归档」。范围与验收口径的唯一载体是 [Phase 37 登记批次](./2026-11-18-phase37-registration.md)；条目交付记录见各条目链接。本记录只承载归档结论、质量门与回扫证据。

## 1. 阶段构成与交付对账

- **4 条主线 / 9 条原子条目**全部交付（质量收口 3 / 选择器空值 opt-in 3 / 迁移口径 1 / Rating 表单集成 2；对账 3 + 3 + 1 + 2 = 9）。
- 本阶段**不发布**：`latest` 维持 `1.3.0`，未执行 `pnpm release`、未触发 Release workflow。

| 条目 | 提交 | Review Gate 结论 |
|:---|:---|:---|
| M1-1 列宽拖拽残余补齐 | `f827773` | R2 `standard` Pass |
| M1-2 浮层隔离残余补齐 | `555a023` | R2 `standard` Pass |
| M1-3 隔离接线下沉 | `4e95bd7` | R1 `standard` Pass（W1 修复后 R2 `quick` 复核 Pass） |
| M2-1 `allowEmptyValue` 契约设计 | `1e1cdbc` | R1 ~ R3 Reject（同一落点复发）→ R4（显式追加预算）`quick` Pass |
| M2-2 `allowEmptyValue` 实现 | `54e0d86`（PR #69） | R1 Reject（3B/7W/4S）→ R2 `standard` Pass |
| M2-3 测试与文档 | `6caee64` | R1 Reject（1B/2W/4S）→ R2 `quick` Pass |
| M3-1 哨兵与迁移陷阱统一 | `41d2372` | R1 `quick` Pass（0B/0W/2S） |
| M4-1 Rating 字段契约接入 | `f46d8ae`（PR #70） | R1 `standard` Pass（0B/2W/3S） |
| M4-2 Rating 文档与示例 | `1ddceec`（PR #70） | R1 Reject（2B/3W/1S）→ R2 `quick` Pass |

- **提交对账**：窗口 `git log --oneline --no-merges 011cd95^..b6bf1b4` → **13**（登记、九条条目交付与规划状态回填；含合并前的 `4a12903` 夹具顺序修复）。

## 2. 归档动作

- `todo.md`：清空当前阶段状态句与条目表，回到「当前无进行中阶段」；未完成项汇总只保留等待外部反馈指针。
- `todo-archive.md`：Phase 37 归档块入窗；主窗口由 6 块（Phase 31 ~ 36）变为 7 块后越过 `docs:check:line-count` 的 warn 阈值（409 行），按既有口径把最早的 Phase 31 迁入深度归档 [phase-31.md](../../plan/archive/todo-archive-phases-31.md)，主窗口回到 **Phase 32 ~ Phase 37 共 6 块 / 363 行**。
- `roadmap.md`：§1 当前态改为「当前无进行中阶段」，阶段表 Phase 37 行改为「已完成（2026-11-19 归档）」，并回链本记录与待办归档。
- `recurring.md`：新增第 **41** 轮门槛复核（Phase 37 收口轮）并补触发义务句。
- `docs/design/governance/index.md`：登记本记录。
- `.session/current-task.yaml` / `runtime-state.json`：同批切到「无进行中阶段、无在办条目」。

## 3. 质量门

### 3.1 本地

- `pnpm verify` → 全绿（lint / lint:css / lint:md / typecheck / typecheck:docs / test / build / check:build / check:resolver / check:nuxt / docs:build / docs:check:i18n-routing / governance:check）。
- 全量单测 177 文件 / 3496 例通过；`pnpm capture:styles` → **399 项 0 差异**。
- `pnpm distill:wisdom --check` → **16 条活跃**（< 阈值 20，不蒸馏）。

### 3.2 CI

- PR #69（M2-1 / M2-2）与 PR #70（M4-1 / M4-2）的质量门全绿后合并；直推提交（`4e95bd7` / `6caee64` / `41d2372`）在 `master` 上的 Test / CodeQL / Security Alerts / Deploy Pages 均 success。

## 4. 长期任务门槛复核

第 **41** 轮（2026-11-19，Phase 37 收口轮）：待执行批次 **0 项**；未达门槛的条件触发候选 **1 项维持**（表单控件公共 props 契约后续候选）；已判定不纳入 5 项维持。计数漂移（`useLabelAttrs` 16 / 继承契约 13 / `useAttrs()` 15）全部归因于 M4-1 的 Rating 接入，不改变条件触发结论。详见 [长期任务](../../plan/recurring.md)。

## 5. 回扫口径（三段式）

- **机检面**：`check:governance-records` / `check:planning-numbers` / `check:stage-counts`（无进行中阶段分支）/ `check:archive-rg-counts` / `check:governance-counts` / `check:design` / `docs:check` 全绿（见 §6 的命令）。
- **人工面**：`todo.md`、`roadmap.md`（§1 与阶段表行）、`todo-archive.md`（本块与主窗口口径句）、`archive/index.md`（phase-31 行与批次日志）、`recurring.md`（第 41 轮与触发义务句）、`governance/index.md`（本记录行）、`.session` 两份文件逐处核过。
- **未处理面**：历史治理记录中指向 `docs/plan/todo.md` 的时点陈述按既有边界不回改；本次未新增失效指针。

## 6. 归档门禁命令

- `pnpm lint:md:check` / `pnpm docs:check:line-count` / `pnpm docs:check:i18n-parity` / `pnpm docs:check:structure` / `pnpm check:stage-counts` / `pnpm check:archive-rg-counts` / `pnpm check:governance-records` / `pnpm check:governance-counts` / `pnpm governance:check` → 全绿。

## 7. 遗留与后续候选

- `MultiSelect` 在 `allowEmptyValue` 开启时的原生 `required` 校验不生效（已文档化），如需原生校验需另立条目。
- 虚拟滚动维持「可行（有条件）」，触发条件 = 单页 > 200 行（需实测校准）或用户裁定。
- 其余条件触发候选见 [Backlog](../../plan/backlog.md)，启动需用户明确授权。

## 8. Review Gate

**轮次记录**：
- R1 `quick` Reject：2 blocker（归档记录三处链接失效致「verify 全绿」不成立；主窗口行数读数 361 ≠ 实测 362）+ 3 warning（归档索引缺 Phase 31 行、触发义务句未补第 41 轮、`.session` 读数与实况冲突）。
- 修复：三处链接改为 `../../plan/...`；三处行数读数统一为 362；`todo-archive.md` 归档索引补 Phase 31 行（范围改为 Phase 0 ~ Phase 31，`archive/index.md` 表行同批核对）；第 41 轮补入触发义务句与「上次执行」列；`docs:check:links` 复跑 exit 0。
- R2 `quick` **Pass**（2026-11-19）。
