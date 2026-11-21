# Phase 40 M3-2 / M3-3：`1.4.0` 发布与下游兼容复验

> 创建时间：2026-11-21
> 触发：用户授权推送、触发周回归并在周回归通过后发布 `1.4.0`。
> 性质：**发布执行记录**；发布范围为 Phase 34 ~ 40 的累积交付。

## 1. 发布执行

| 项 | 结果 |
|:---|:---|
| 发布提交 | `7ee8f7ce`（周回归被测提交） |
| Weekly Regression | run `44909361461` **success**（2026-11-21，Core Regression / Security Audit / E2E 全绿） |
| Release workflow | run `44913800718` **success**（`workflow_dispatch`，2026-11-21） |
| 版本 | npm `latest` = **`1.4.0`**；`package.json` = `1.4.0` |
| Tag | `v1.4.0` |
| GitHub Release | <https://github.com/CaoMeiYouRen/caomei-ui/releases/tag/v1.4.0> |
| 版本提交 | `2de2f8d9` `chore(release): 1.4.0 [skip ci]` |
| CHANGELOG | 顶部为 `# [1.4.0] ... (2026-11-21)`，含 Phase 34 ~ 40 的变更条目 |
| 版本一致性 | `pnpm docs:check:version` → 5 个版本展示面均派生自 `package.json`，README / roadmap 当前版本句一致 |

**发布门禁**：周回归 success + 安全告警 0 + `pnpm verify` + 覆盖率门禁均由 `release.yml` 执行；本地 `pnpm verify` 之前已 exit 0，覆盖率 `lines 90.04%`。

**发布后修正（进入下一 patch，不影响 `1.4.0` 产物）**：长期任务第 44 轮发现 4 处新组件模板级 `:aria-label="label"`，已改为 `labelAttrs`；`1.4.0` tag 仍保留旧写法，属代码一致性改进而非功能缺陷。

## 2. 下游兼容复验（M3-3）

`release.yml` 发布成功后自动 dispatch `downstream-compat`：

| 项 | 结果 |
|:---|:---|
| Run | `44914670234` **success**（2026-11-21） |
| `Compat / dependfix` | **success** |
| `Compat / caomei-auth` | **success** |
| `Compat / momei` | **success** |
| 被测版本 | `caomei-ui@1.4.0`（workflow 内 fail-closed 断言实际安装版本） |
| 下游 revision（本地读数，2026-11-21） | dependfix `6759a6a9` / caomei-auth `b3100bd` / momei `29a7c262` |

**说明**：兼容检查覆盖各仓默认分支的 `typecheck` + `build`，不含 E2E / 视觉 / 单测；下游默认分支是移动目标，红需先归因是否为下游自身改动。

## 3. 长期任务第 44 轮

按[规划规范 §8](../../standards/planning.md) 的「每次发布前执行一轮」义务，本轮为 **1.4.0 发布后复核**（发布前一轮未单独留痕，按实测后补执行）：

- 代码复用治理：待执行批次 **0 项**；条件触发 **1 项维持**（表单控件公共 props 契约后续候选）。
- 样式重复收敛：待执行批次 **0 项**。
- 证据与计数见 [长期任务台账](../../plan/recurring.md) 第 44 轮行。

## 4. 阶段状态

- Phase 40 的 15 条原子条目全部交付：M1 4 / M2 6 / M3 3 / M4 2。
- `1.4.0` 已发布；`latest` 由 `1.3.0` 升至 `1.4.0`。
- 阶段尚未归档；归档需用户指令，届时执行 `todo.md` 清空、`roadmap.md` 摘要、`todo-archive.md` 入窗与 wisdom 蒸馏（当前 20 条活跃 = 阈值）。

## 5. Review Gate

**结论：R1 Pass**（`standard`，2026-11-21）。

- audit-depth：`standard`——发布事实、下游 run 与跨载体状态需一致性核对。
- 时间盒：≤ 10 分钟；实际用时约 6 分钟。
- 验证：Weekly `44909361461` success；Release `44913800718` success；Downstream `44914670234` 三仓 success；npm / tag / Release / 版本句检查通过。
- Findings：本批无 blocker；RG-W01（首跑覆盖率 89.97%）与 RG-W02（首跑 E2E 30 分钟取消）均在发布前修正并复跑；RG-S01（新组件 `labelAttrs`）为发布后一致性修正，进入下一 patch。
- 未覆盖边界：`v1.4.0` tag 不回改；阶段归档与 wisdom 蒸馏待用户指令。
