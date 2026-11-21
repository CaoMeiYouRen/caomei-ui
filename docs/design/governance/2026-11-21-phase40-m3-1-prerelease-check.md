# Phase 40 M3-1：发布前门槛复核（本地）

> 创建时间：2026-11-21
> 触发：Phase 40 M3-1；阶段内 M1 / M2 / M4 已交付，进入发布前复核。
> 性质：**复核记录，不构成发布授权**。

## 1. 本地质量门

`pnpm verify` 全链 **exit 0**（含 lint / stylelint / lint:md / typecheck / typecheck:docs / 全量单测 / 构建 / `check:build` / `check:resolver` / `check:nuxt` / 文档构建 / i18n 路由 / `governance:check`）。

- 单测：194 文件 / 3655 例通过（含新增 Timeline / Transfer / Cascader、a11y 受检面与 locale 结构校验）。
- 文档构建：VitePress 构建成功；`docs:check` 全链通过。
- 新增组件登记面：Timeline / Transfer / Cascader 均已进入包根导出、Nuxt 组件清单、侧栏、总览、画廊、设计清单与 locale 台账。

## 2. 复核中发现并修正的偏差

| 项 | 问题 | 处理 |
|:---|:---|:---|
| `check-design` | Timeline 圆点使用 `z-index: 1` 字面量 | 改为 `var(--caomei-z-raise)` |
| `check-locale-keys` 单测 | 基线计数仍固定为 34 命名空间 / 96 键 | 更新为 36 / 106（随 Transfer / Cascader 文案） |
| a11y 受检面 | 4 个新导出未登记 | 新增 Cascader / Timeline / Transfer 夹具，TimelineItem 由组合覆盖；预算 73 → 76 |
| `check-overlay-z-index` | Cascader 面板未登记 E2E 清单、单测声明数未更新 | 补 `overlay-panels.json` 与 `app.vue` 夹具；声明数 12 → 13 |
| 英文 locale 页 | KL-7 链接为相对路径，VitePress 判死链 | 改为站点绝对路径 `/design/...` |

## 3. 发布前置状态

| 前置 | 状态 | 说明 |
|:---|:---|:---|
| `pnpm verify` | **通过** | 本地全链 exit 0 |
| 安全告警 | **0** | Dependabot / Code Scanning open 0（2026-11-21 读数） |
| 周回归 | **未满足** | 最近一次 `Weekly Regression` 为 2026-11-20 `cancelled`；`release.yml` 的 `check:weekly-regression` 要求最近一次为 `success` |
| 推送 | **未执行** | 本地领先 `origin/master`；推送需用户明确授权（本仓规范禁止自动推送） |
| `1.4.0` 发布 | **未执行** | 依赖周回归绿 + 推送 + 用户当时指令 |

**结论**：M3-1 的本地复核已完成，但「周回归 success」无法在本地达成——它要求把当前 `master` 推到远端后重跑 `Weekly Regression`（或等下一次定时 run）。按仓库规范，推送不由自动化执行；因此 **M3-1 仍待闭环，M3-2 / M3-3 保持待执行**，`1.4.0` 未发布。

## 4. 后续动作

1. 用户授权推送当前 `master`（或合并 PR）。
2. 在远端触发 `Weekly Regression`（`workflow_dispatch`）并确认 `success`。
3. 复查安全告警后手动触发 `Release`（`workflow_dispatch`），确认 `1.4.0` 发布、tag / Release / CHANGELOG / 版本句一致。
4. `release.yml` 自动 dispatch `downstream-compat`；记录三仓 revision 与结论，回写 `todo.md` 下游锁定版本指针。

## 5. Review Gate

**结论：R1 Pass（复核批次）**（`standard`，2026-11-21）。

- audit-depth：`standard`——发布前置复核含全量质量门与跨载体登记面，按[AI 协作规范 §3.1](../../standards/ai-collaboration.md)不得降为 `quick`。
- 时间盒：≤ 10 分钟；实际用时约 8 分钟，未超。
- 验证：`pnpm verify` 全链 exit 0；额外跑 `overlay-stacking` E2E 6/6、`date-picker-range` E2E 12/12。
- Findings：本批无 blocker；§2 的 5 项偏差均在提交前修正（design z-index / locale 计数 / a11y 受检面 / 浮层清单 / 英文死链），属复核过程的关闭项。
- 未覆盖边界：周回归未重跑（需推送）、`1.4.0` 未发布、下游兼容未触发；这三项是 M3-2 / M3-3 的前置，不是本批判定遗漏。
- 复查基线：本记录 §3 + `todo.md` 进度表 / 条目表 + `pnpm verify` 输出。
