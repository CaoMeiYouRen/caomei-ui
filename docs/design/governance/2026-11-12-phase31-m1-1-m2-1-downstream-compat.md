# Phase 31 M1-1 / M2-1：下游兼容扩容与实际安装版本断言交付

> 创建时间：2026-11-12
> 触发：Phase 31 M1-1 / M2-1（[Phase 31 登记批次](./2026-11-12-phase31-registration.md) §2）。
> 依据：[发布指南 §10](../../guide/release.md)（下游兼容回归口径）。

## 1. 交付内容

| 条目 | 内容 |
|:---|:---|
| M1-1 | `downstream-compat.yml` 受检矩阵新增 `caomei-auth` 与 `momei`：按仓声明 `setup`（`nuxt prepare` / workspace 子包预构建）与 `timeout-minutes`（dependfix / caomei-auth / momei 分别为 30 / 45 / 60，**以工作流 `matrix` 为准**）；发布指南中英 §10 同步三仓清单 |
| M2-1 | override 且构建链 setup 完成后新增 `Assert installed caomei-ui version`：读取目标包 `node_modules/caomei-ui/package.json` 与目标版本比对，不一致即 fail-closed；结果写入 job summary |

- **不改 dependfix 现有口径**：版本断言对根包与 workspace 子包（`@dependfix/platform`）同样生效。
- **无凭据**：下游仓库公开，`checkout` 不引入额外 secret。

## 2. 真实 run 取证

- **run**：[43211984429](https://github.com/CaoMeiYouRen/caomei-ui/actions/runs/43211984429)（`workflow_dispatch`，ref `master`，提交 `1ec8464`，被测版本取 registry `latest` = `1.2.0`）。
- **结论**：三个 job **全部 success**——`Compat / dependfix`、`Compat / caomei-auth`、`Compat / momei`；各 job summary 记录下游 revision，用于区分「下游自身改动」与「本库回归」。
- **归因面**：momei 首次 run 在 60 分钟预算内完成（无超时），三仓 `typecheck` + `build` 均通过；版本断言未触发 fail-closed，证明 override 后实际安装版本与目标版本一致。

## 3. 本地可行性证据（提交前）

- `caomei-auth`：`pnpm exec nuxt prepare` + `pnpm typecheck` + `pnpm build` 全链路 exit 0。
- `momei`：`pnpm --filter @momei-blog/api-client build` + `pnpm --filter momei-mcp-server build` + `pnpm exec nuxt prepare` + `typecheck` + `build` 全链路 exit 0。
- 版本断言负向验证：以不匹配的 `EXPECTED_VERSION` 运行断言脚本 exit 1；正例在根包与 workspace 子包两种目录形态下均通过。

## 4. Review Gate

- 登记批次 R1 / R2 `Reject` → R3 `Pass`（详见[登记批次记录](./2026-11-12-phase31-registration.md) §6）；本批为工作流改动，按「触及构建面走分支 + PR」提交。
- **PR**：[#51](https://github.com/CaoMeiYouRen/caomei-ui/pull/51)，CI（Quality / Test & Build / CodeQL）全绿后 squash 合并为 `1ec8464`。
- **本记录批次**（`quick`）：R1 `Reject`（1 blocker：发布指南 §10 仍写「待取证」）→ R2 `Pass`（0 blocker / 0 warning / 3 suggest，已按建议收口）。

## 5. 风险与边界

1. **下游是移动目标**：受检分支为下游默认分支，红可能是下游自身改动所致；job summary 的 revision 是归因依据。
2. **命令漂移**：下游改构建命令会使检查失效，需上游同步维护。
3. **版本断言位置**：断言在 setup 之后执行，只覆盖「override 已重新安装」的路径；未安装（构建链跳过 install）时由 setup 步骤自身失败兜底。
4. **时间预算**：首跑实测总耗时约 3 分钟（`11:46:17` → `11:49:23` UTC），60 分钟是 `matrix` 的**配置预算**而非实测上界；后续若下游体积增长，按实测值重新评估预算。
