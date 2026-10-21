# Phase 25 归档批次记录

- 触发：2026-10-21 用户指令「更新 M4-1 状态，然后开始归档」。
- 范围：Phase 25（归档载体收口、移动端与响应式优化、国际化深化一期、发布收口）阶段归档 + M4-1 发布收口 + 长期任务第 27 轮门槛复核。
- 关联：[Phase 25 登记批次记录](./2026-10-16-phase25-registration.md)、[M4-1 发布执行记录](./2026-10-21-phase25-m4-1-release-execution.md)、[待办归档](../../plan/todo-archive.md) Phase 25 块。

## 1. 交付对账

| 条目 | 交付 / 提交 | 记录 | RG |
|:---|:---|:---|:---|
| M1-1 归档载体深度归档 | `746b75e` | [M1-1](./2026-10-16-phase25-m1-1-todo-archive-deep-migration.md) | R1 Pass → R2 Pass |
| M2-1 视口矩阵扩面 | `0b4849c` | [M2-1](./2026-10-16-phase25-m2-1-viewport-matrix-expansion.md) | R1 Pass |
| M2-2 触摸目标复核 | `8661ae5` | [M2-2](./2026-10-16-phase25-m2-2-touch-target-audit.md) | R1 Reject → R2 Pass |
| M2-3 移动端指南页 | `67f0522` | [M2-3](./2026-10-16-phase25-m2-3-mobile-guide.md) | R1 Pass → R2 Pass |
| M3-1a locale 包形态 | `1eb562b` / `8206b01` / `d9949f3` / `1191eab` / `9435c9c` | [M3-1a](./2026-10-16-phase25-m3-1a-locale-subpath-exports.md) | 逐批放行（含 1 次分区 Reject、R1/R2 Reject 收口） |
| M3-1b 一期 5 语 | `8a6ddf9` / `eca0ec8` | [M3-1b](./2026-10-20-phase25-m3-1b-five-locales.md) | 代码 R1 Pass → R2 Pass；文档 quick Reject → delta Pass |
| M3-2 台账 / 守卫对齐 | `aaf5f7d` | [M3-2](./2026-10-20-phase25-m3-2-locale-ledger-alignment.md) | R1 Reject → R2 Reject → R3 Pass |
| M4-1 发布 0.7.0 | `c496f61` / `8766f86` / `183a917`；工具修复 `a0e91f5` | [M4-1](./2026-10-21-phase25-m4-1-release-execution.md) | 见记录 §5（本批回填） |

## 2. 归档动作

- `todo.md`：移除 Phase 25 原子条目表；当前状态改为「无进行中阶段」；Phase 24 遗留两条保留在本文件，编号改为「遗留-视觉基线 / 遗留-CI 镜像」以通过归档后规划编号守卫。
- `todo-archive.md`：新增 Phase 25 完整归档块；主窗口口径改为「Phase 19 ~ Phase 23 + Phase 25 共 6 块已完成阶段 + Phase 24 部分归档块」；主窗口仍在 warn 阈值内，**本轮不迁出 Phase 19**。
- `roadmap.md`：§1 现状句、Phase 25 阶段表行、状态行、§5 归档索引四处同步「2026-10-21 完成并归档 / 当前无进行中阶段 / Phase 24 遗留待触发」。
- `recurring.md`：新增第 27 轮门槛复核（Phase 25 收口 / 0.7.0 发布后）。
- `CHANGELOG.md` + GitHub Release：补齐 0.7.0 的 `💥 BREAKING CHANGES` 语言包按需化段（不改 tag、不发新版本）。
- `docs/plan/todo.md`「已发布版本」：0.6.0 → 0.7.0，同步 shasum / tag / GitHub Release / 推送态。

## 3. 阶段线数口径

- Phase 25 归档块加入后主窗口 `docs:check:line-count` 仍在 warn 阈值内（396 行），按「未越阈时窗口可暂时多于 5 块」口径保留 Phase 19，不新增深度归档文件。

## 4. 长期任务

- 第 27 轮门槛复核：待执行批次 **0 项**；条件触发 **1 项维持**（表单控件公共 props 契约）；已判定不纳入 **5 项维持**。
- 计数漂移归因：`labelAttrs` +1（`chart.vue`）、含内联同名字段 +3（`chart` / `menu` / `tooltip` 的 `types.ts`）、`useAttrs()` +2（`alert.vue` / `chart.vue`）均来自 Phase 24 新增的非字段组件；`capture:styles` +5（308 → 313）属 Phase 24 新组件 / 形态纳入，未改变条件触发结论。

## 5. Review Gate

**R1（`standard`）**：**Reject**（1 blocker / 2 warning / 2 suggest）。

- blocker：`todo.md` 长期任务摘要仍写第 26 轮，与 `recurring.md` / 归档块 / 本记录的第 27 轮矛盾；已改为第 27 轮。
- warning：① `recurring.md` §2.1 基线计数未同步；已更新为 `labelAttrs` 11 / 含内联同名字段 35 / `useAttrs()` 13，并保留 +1 / +3 / +2 漂移归因。② wisdom 指针悬空；已改为「14 条活跃（<20，不蒸馏）/ 13 段归档对账通过」，并在本记录 §6 落盘。
- suggest：① README / roadmap 补 0.7.0 版本亮点；已采纳。② `todo.md` 下游 0.6.0 快照标注「0.7.0 发布后未重测」；已采纳。

**R2（delta `quick`）**：**Pass**（0 blocker / 1 warning / 1 suggest）。

- R1 blocker / warning / suggest 全部闭合；1 warning 为「完成态先于 §5 回填」，本次回填后闭合；1 suggest 为 Phase 24 部分归档块的点时记录不回改，保留历史说明。

## 6. Wisdom

- `pnpm distill:wisdom --check`：**14 条活跃条目**（阈值 20，未达、不蒸馏）。
- `pnpm check:distill-archive`：**13 段归档对账通过**。

## 7. 未覆盖边界

- GitHub Release 说明为**编辑补正**，不是新发布；未重写 tag、未重新发布 0.7.0。
- Downstream Compat run #4 因 `minimumReleaseAge` 中止，未进入 `typecheck` / `build`；未在真实 Actions 重跑。
- 未做 0.7.0 下游真实升级验证；momei / dependfix 等由各仓自行执行。
- 未审译文质量；语言包破坏性披露只覆盖接入形态。
- Phase 19 未迁深度归档（主窗口未越 warn 阈值）；窗口暂时为 6 块已完成阶段 + 1 块部分归档，按既有口径接受。
