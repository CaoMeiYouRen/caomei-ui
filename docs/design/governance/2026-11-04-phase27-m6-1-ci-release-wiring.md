# Phase 27 M6-1 CI 发布工作流接线与凭据交付记录

> 创建时间：2026-11-04
> 依据：[Phase 27 登记批次记录](./2026-11-03-phase27-registration.md) §2 的 M6-1。
> 定位：Phase 27「CI 发布链路」第 1 条的交付记录；本记录是工作流接线、凭据口径、`next` 通道结论与未覆盖边界的唯一载体。

## 1. 交付范围

- `.github/workflows/release.yml` 重写：
  - **触发**：仅 `workflow_dispatch`，输入 `dry_run`（默认 `true`）；**不启用 push 触发**。
  - **两个 job**：
    - `dry-run`（无 environment，超时 15 分钟）：install + 最小插件集 `semantic-release --dry-run`，**不跑质量门**；解析下一版本并写 job summary，不发布；
    - `publish`（`environment: release` 审批，超时 30 分钟）：完整的 `pnpm verify` + `test:coverage` + `check:coverage` → 凭据配置 → **`Recheck next version`** → `pnpm release`。
  - **凭据**：
    - npm 优先 Trusted Publisher（OIDC，`id-token: write`）；回退 environment secret `NPM_TOKEN`，缺失且无 OIDC 时 publish 前 fail-closed；
    - GitHub 优先 `RELEASE_TOKEN`（PAT / App token），缺省 `GITHUB_TOKEN`；`persist-credentials: false` 下显式注入 `AUTHORIZATION` extraheader 供 `@semantic-release/git` 回推。
  - **并发 / 超时**：`concurrency` 按 workflow + ref 分组、`cancel-in-progress: false`；dry-run 15 分钟 / publish 30 分钟。
- `docs/guide/release.md` §5 与英文镜像同步：触发模型、审批、凭据、`next` 通道、首次运行前置。

## 2. `next` 通道结论（2026-11-04）

- **结论：维持**——仓库**无 `next` 分支**；CI **只发 `latest`**。
- 预发布仍走本地 `pnpm release:manual --tag=next`；本阶段**不新建 `next` 分支**（等价需求另立评估）。
- 该结论已写入工作流头注释与发布指南 §5。

## 3. 凭据与事件链

| 项 | 口径 |
| :--- | :--- |
| npm 首选 | Trusted Publisher（OIDC，`id-token: write`，无需长期 token） |
| npm 回退 | environment secret `NPM_TOKEN`（临时回退，需轮换与最小权限；缺失且无 OIDC 时 publish 前中止） |
| GitHub 回推 | `RELEASE_TOKEN` 优先，缺省 `GITHUB_TOKEN`；两者均建议存 `release` environment secret（审批通过后才注入）；`persist-credentials: false` + 显式 extraheader |
| dry-run 推送校验 | `semantic-release --dry-run` 仍执行 `git push --dry-run`，因此 dry-run job 也需 `contents: write` 与可写凭据；`master` 受保护时需 bypass |
| 审批期间漂移 | publish 在 `pnpm release` 前重新推断版本，与 dry-run 输出不一致即 fail-closed（要求重新 dry-run + 审批） |
| 循环触发 | 触发仅 `workflow_dispatch`，发布提交回推 master 不会重触发本工作流 |
| 下游兼容 | `GITHUB_TOKEN` 创建的 tag / release 不触发 `v*` workflow；由 M6-4 显式 dispatch 承接 |

## 4. 验证证据

- 本地 dry-run（受网络限制，使用本地 bare remote + 最小插件集）：
  - `CI=true pnpm exec semantic-release --dry-run --repository-url file:///tmp/... --plugins @semantic-release/commit-analyzer --plugins @semantic-release/release-notes-generator` → **exit 0**，输出 `The next release version is 1.1.0`。
  - **本地 file remote 会绕过推送权限校验**：真实 CI 中 semantic-release 仍执行 `git push --dry-run`，故 dry-run job 已补 `contents: write` 与 extraheader；该路径需首次真实 run 取证。
  - 未使用完整插件集，因为 `@semantic-release/npm` 的 verifyConditions 需要 OIDC / `NPM_TOKEN`，`@semantic-release/github` 需要有效仓库 URL；该两段在 CI 内由真实凭据覆盖。
- 无相关提交时：dry-run 识别 `There are no relevant changes`，写「无下一版本」summary 并 exit 0；publish 由 `needs.dry-run.outputs.version != ''` 跳过。
- 审批期间漂移：publish 的 `Recheck next version` 会重新推断版本，与 dry-run 输出不一致即 fail-closed。
- `pnpm lint:md:check` / `pnpm governance:check` → **exit 0**（2026-11-04 提交前批次）。
- 工作流 YAML 结构经 YAML 解析（`name` / `concurrency` / `jobs` / `environment` / `inputs` 均存在）。

## 5. Review Gate

- **audit-depth**：`standard`（CI 发布工作流 + 对外发布指南；影响发布主路径）；R2 / R3 为 `quick` delta。时间盒：R1 ≤ 8 分钟，delta ≤ 4 分钟。
- **R1（`standard`）：`Reject`**（1 blocker / 8 warning / 6 suggest）——blocker：dry-run job 无推送凭据，semantic-release 在 `--dry-run` 下仍执行 `git push --dry-run`，整条发布链不可达；warning：dry-run 推送凭据未落记录、指南矛盾、中文缺 M6-2 约束、OIDC 判定、无变更被当作失败、凭据暴露窗口、死分支、分支保护未取证。
- **R2（`quick` delta）：`Pass`**（0 blocker / 0 warning；B1 与 W1 ~ W8 关闭；新增：dry-run 质量门/超时文档漂移、审批期间版本漂移）。
- **R3（`quick` delta）：`Pass`**（0 blocker / 0 warning；RW1 / RW2 关闭；新增非阻塞：重检步骤未入文档，已同批补齐）。
- **用时实测（宿主时钟）**：R1 发起 `2026-11-04T14:21:10Z`、返回 `14:33:53Z` ≈ **12 分 43 秒**（**超时间盒 4 分 43 秒**；审计方独立复现 `EGITNOPERMISSION` 与源码核对）；R2 发起 `14:36:40Z`、返回 `14:39:26Z` ≈ **2 分 46 秒**；R3 发起 `14:42:13Z`、返回 `14:43:17Z` ≈ **1 分 4 秒**（均 ≤ 4 分钟）。
- **完成态边界**：代码级接线通过 Review Gate，但验收口径含「CI 中 `semantic-release --dry-run` 输出下一版本」「回推成功」等运行时事实；首次真实 `dry_run: true` run 全绿并回填 run 链接前，`todo.md` 的 M6-1 保持「待执行」。
- **复查基线**：`.github/workflows/release.yml`、`docs/guide/release.md` §5、`docs/i18n/en-US/guide/release.md`、本记录、`docs/design/governance/index.md`。

## 6. 未覆盖边界

- **未在真实 CI 运行**：`workflow_dispatch`、`environment: release` 审批、OIDC exchange、dry-run 的 `git push --dry-run`、`@semantic-release/git` 回推与 job summary 需首次真实 run 验证；推送与运行以用户当次明确指令为前提。
- **用户侧前置**：`release` environment（审批人）、Trusted Publisher 绑定或 `NPM_TOKEN`、`RELEASE_TOKEN`（建议同存 environment secret）；`master` 若受分支保护，需为发布身份配置 bypass，否则回推会停在半完成态。
- **安全告警门禁与发布后校验**由 M6-3 接入；**版本句同步**由 M6-2 接入；两者未完成前不得以 `dry_run: false` 发布。
- 未验证 `RELEASE_TOKEN` 的分支保护绕过策略与 token 过期行为。
- 未验证 `lts/*` 在未来 Node 版本下 npm OIDC 的行为差异。
- 审批期间合入的 `chore` / `docs` 等非发布类提交不会改变版本，`Recheck next version` 会放行，但会进入本次发布的 commit 范围与 release notes；当前设计接受该行为。
