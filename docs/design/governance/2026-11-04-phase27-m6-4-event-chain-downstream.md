# Phase 27 M6-4 发布事件链与下游复验交付记录

> 创建时间：2026-11-04
> 依据：[Phase 27 登记批次记录](./2026-11-03-phase27-registration.md) §2 的 M6-4。
> 定位：Phase 27「CI 发布链路」第 4 条的交付记录；本记录是事件链、下游 dispatch 与凭据边界的唯一载体。

## 1. 问题与处置

- **事件链事实**：`GITHUB_TOKEN` 创建的 tag / release **不会触发**其它 workflow（GitHub 防递归规则）；但 `workflow_dispatch` 是该规则的**显式豁免**（见 [Events that trigger workflows](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows)），因此显式 dispatch 可用 `GITHUB_TOKEN` + `actions: write` 完成。
- **处置**：`release.yml` 新增独立 job `dispatch-downstream`（`needs: [dry-run, publish]`）：
  - 仅申请 `actions: write` + `contents: read`，不把该权限授予 publish 主 job 的构建 / 发布步骤；
  - `gh workflow run downstream-compat.yml --ref master -f caomei-ui-version=<v>`（`GH_TOKEN = secrets.GITHUB_TOKEN`）；
  - 轮询 6×5s 查找本次 dispatch 的 run（按 `--event workflow_dispatch` + `createdAt >= since` 过滤），URL 写入 job summary；未可见时写「已提交、尚未可见」，不静默跳过；
  - dispatch 失败 → summary 写 `Release published, downstream dispatch failed` + 手动命令，job 标红（发布已发生，不误称「发布失败」）。

## 2. 凭据最小权限

| 凭据 | 用途 | 权限 |
| :--- | :--- | :--- |
| `GITHUB_TOKEN`（release 主 job） | git 回推、创建 tag / Release | workflow 内声明：`contents` / `issues` / `pull-requests` write，`id-token` write |
| `GITHUB_TOKEN`（dispatch job） | workflow dispatch | `actions: write` + `contents: read`（`workflow_dispatch` 豁免防递归规则） |
| `RELEASE_TOKEN`（可选） | 分支保护 bypass 等场景 | 经典 PAT `repo`；仅在 `GITHUB_TOKEN` 无法直推 master 时需要 |
| `NPM_TOKEN`（回退） | npm publish | environment secret，仅发布权限，需轮换 |

- dispatch 不依赖长期 PAT；`RELEASE_TOKEN` 仅用于 `GITHUB_TOKEN` 无法直推受保护分支的场景。

## 3. 失败语义

| 场景 | 行为 |
| :--- | :--- |
| `gh workflow run` 被拒绝（缺 `actions:write` / 权限） | dispatch job 标红；summary 提示「包已发布 + 手动命令」 |
| dispatch 成功但 run 暂不可见 | summary 写「已提交、尚未可见」，不判红 |
| 下游 run 红 | 不阻断发布收尾；run URL 已留痕，按 §10 以 revision 归因 |
| publish 主 job 失败 | dispatch job 因 `needs` 不运行 |

## 4. 验证证据

- YAML 结构：publish job 不再持有 `actions: write`；新增 `dispatch-downstream` job（`permissions.actions = write`、`contents = read`），步骤顺序 `Verify published package → Record failure`（publish）与 `Trigger downstream compatibility → Record dispatch failure`（dispatch）。
- 契约对齐：`caomei-ui-version` 与 `downstream-compat.yml` 的 `workflow_dispatch.inputs` 名称、类型一致；`--ref master` 与发布分支约束一致；版本来自 `needs.dry-run.outputs.version`（publish 前已重检）。
- `pnpm lint:md:check` / `pnpm governance:check` → **exit 0**（2026-11-04 提交前批次）。
- 官方依据：`workflow_dispatch` 属 `GITHUB_TOKEN` 防递归规则的显式豁免（GitHub Docs）。

## 5. Review Gate

- **audit-depth**：`standard`（事件链 + 凭据 + 下游复验）；R2 为 `quick` delta。时间盒：R1 ≤ 8 分钟，delta ≤ 4 分钟。
- **R1（`standard`）：`Reject`**（1 blocker / 5 warning / 3 suggest）——blocker：误称 `GITHUB_TOKEN` 的 `workflow_dispatch` 会被防递归规则拒绝，并据此建议长期 PAT；warning：run URL 竞态、dispatch 失败 summary 误称发布失败、`actions:write` 权限过宽、中文旧前置、英文缺事件链。
- **R2（`quick` delta）：`Pass`**（0 blocker / 0 warning；blocker 与 W1 ~ W5、S1 ~ S3 全部关闭；重复 summary 块已同批收口）。
- **用时实测（宿主时钟）**：R1 发起 `2026-11-04T15:34:28Z`、返回 `15:38:16Z` ≈ **3 分 48 秒**（≤ 8 分钟）；R2 发起 `15:43:22Z`、返回 `15:45:05Z` ≈ **1 分 43 秒**（≤ 4 分钟）。
- **验收边界**：实现级 Gate 通过；「真实发布触发下游检查并留痕」需首次 `dry_run: false` run，`todo.md` 的 M6-4 保持「待执行」。
- **复查基线**：`.github/workflows/release.yml`、两份指南 §5 / §10、本记录、`docs/design/governance/index.md`。

## 6. 未覆盖边界

- **真实发布 run 未执行**：dispatch 实际生效、run URL 轮询、下游 run 结果需首次 `dry_run: false` 取证。
- `GITHUB_TOKEN` 的 `actions:write` 作用域与 `workflow_dispatch` 豁免在仓库规则集下的行为未实跑。
- 下游 run 变红可能是下游自身移动目标所致，按 §10 以 revision 归因。
- 未接入 `workflow_run` 自动链（显式 dispatch 已覆盖需求，避免 dry-run 触发噪音）。
