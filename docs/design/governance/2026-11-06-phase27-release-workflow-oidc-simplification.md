# Phase 27 发布工作流 OIDC 简化（semantic-release 直连）

> 创建时间：2026-11-06
> 触发：用户指令「`.github/workflows/release.yml` 改一下，应该直接使用 semantic-release 发布而不是手动写流程。具体参照 momei、caomei-auth 等项目。而且不符合当前 OIDC 发布的规范，在 OIDC 下已经不需要 `NPM_TOKEN` 了。」
> 定位：本记录是 2026-11-06 发布工作流简化的单一事实源；登记时点口径仍见 [Phase 27 登记批次记录](./2026-11-03-phase27-registration.md) §2。

## 1. 背景

2026-11-04 的 M6-1 / M6-3 把发布链写成了「手动编排」形态：`dry_run` 输入 + dry-run job 计算下一版本、`environment: release` 审批、发布前 `Recheck next version`、`Capture previous published version`、`verify-publish.mjs` 后校验，以及 `NPM_TOKEN` / `RELEASE_TOKEN` 回退。该形态与 momei / caomei-auth 的既有做法不一致，也不符合当前 npm Trusted Publishing 的 OIDC 规范——OIDC 下不需要 `NPM_TOKEN`。

## 2. 变更

### 2.1 `release.yml`

- **单 `release` job 直接调用 `pnpm release`（semantic-release）**：版本推断、`CHANGELOG.md`、README / roadmap 版本句、里程碑、npm publish、GitHub Release 与 tag 全部由 `release.config.js` 的插件链驱动。
- **权限**：`id-token: write`（npm OIDC）、`contents: write`、`issues: write`、`pull-requests: write`。
- **保留发布前门禁**：`pnpm check:security-alerts` → `pnpm verify` → `pnpm test:coverage` + `pnpm check:coverage`。
- **npm 凭据**：Trusted Publishing（OIDC）；npm 自动生成 provenance；移除 `NPM_TOKEN` 检查、写入 `.npmrc` 与回退提示。
- **GitHub 凭据**：仅 `GITHUB_TOKEN`；`persist-credentials: false` 下由 semantic-release 自动注入推送 URL；移除 `RELEASE_TOKEN` 与手写 `AUTHORIZATION` extraheader。
- **触发**：仅 `workflow_dispatch`，首步显式校验 `GITHUB_REF == refs/heads/master`（非 master 标红，避免「绿色 run 但未发布」）；`concurrency.group` 固定为 workflow 名，所有发布 run 串行。移除 `dry_run` 输入与 dry-run job；周级 `schedule` 以注释保留，参照 momei / caomei-auth，确认需要后再启用。
- **移除的步骤**：`environment: release` 审批、`Recheck next version`、`Capture previous published version`、`verify-publish` 后校验。
- **保留的下游 job（M6-4）**：发布成功后由独立 job 以 `GITHUB_TOKEN` + `actions: write` 执行 `gh workflow run downstream-compat.yml -f caomei-ui-version=<v>`，run URL 写入 summary。job 显式设置 `GH_REPO`（未 checkout，`gh` 需要仓库上下文）；版本只认「发布前后全量 tag 集合的差集」新增的版本 tag（不依赖 tag 落点，HEAD 或其父提交均可），无新增 tag 时跳过，避免重跑或 publish 失败后误 dispatch。

### 2.2 文档

- `docs/guide/release.md` §1 / §4 / §5：改为 semantic-release 直连 + OIDC，删除 `dry_run`、environment 审批、`NPM_TOKEN` / `RELEASE_TOKEN`、手动重检与后校验的描述。
- `docs/i18n/en-US/guide/release.md`：同步 Current status、Release flow、Pre-release checks 的 Registry 段。
- `docs/plan/todo.md`：M5-1 / M6-1 / M6-3 的验收口径改为直连 semantic-release / OIDC / 保留前置门禁。
- `docs/design/governance/2026-11-03-phase27-registration.md` §2：加「2026-11-06 简化」指针，保留登记时点口径。

## 3. 保留面

- **M6-2**：`@semantic-release/exec` 的 `prepareCmd` / `generateNotesCmd` 与 `@semantic-release/git` assets 不变；版本句与里程碑仍随发布提交同步。
- **M6-4**：下游兼容 dispatch 不变。
- **本地手动流**：`pnpm release:manual` 与 `scripts/release/verify-publish.mjs` 保留为回退路径；本地 npm 仍需要有效登录 / OTP。
- **安全告警门禁**：`SECURITY_ALERTS_TOKEN` 仍需配置；不是 npm 凭据。

## 4. 验证证据

- `node -e "..."` / YAML 解析：workflow 结构有效。
- `pnpm vitest run scripts/release/release.config.test.mjs`：插件集合 / 顺序 / assets 不变。
- `pnpm verify`：全链通过（文档 / 治理 / 构建 / 测试）。
- `pnpm lint:md:check` / `pnpm docs:check` / `pnpm governance:check`：exit 0。
- `pnpm check:security-alerts`（`SECURITY_ALERTS_TOKEN`）：critical / high 0。
- 未执行真实 CI 发布 run；OIDC Trusted Publisher 绑定与 `GITHUB_TOKEN` 回推需首次真实 run 取证。

## 5. Review Gate

- **audit-depth**：`standard`（发布主路径 + 对外文档；无 `src/**` 改动）。时间盒 ≤ 8 分钟；R2 / R3 为 `quick` delta。
- **R1（`standard`）：`Reject`**（2 blocker / 2 warning / 3 suggest）——B1 下游 dispatch job 未 checkout 且无 `GH_REPO`，`gh workflow run` / `gh run list` 在空目录必失败；B2 版本读取仅用 `git describe --tags --exact-match HEAD`，无法区分「本次新增 tag」与「HEAD 既有 tag」，重跑 / tag 已推但 publish 失败时会产生假绿与错误 dispatch；W1 `docs/plan/roadmap.md` 仍以当前口径写 `environment` 审批 / `NPM_TOKEN`；W2 移除 master 闸门且 `concurrency` 按 ref 分组，发布互斥性削弱；S1 `NPM_CONFIG_PROVENANCE` 冗余；S2 首次运行前置缺 Trusted Publisher workflow filename 与 Node / npm 版本；S3 `.session` 任务态仍指向 `release environment` / `dry_run`。
- **R2（`quick` delta）：`Pass`**（0 blocker / 0 warning；B1 / B2 / W1 / W2 / S1 / S2 关闭；新增 RS1：master 闸门改为 job 级 `if` 后静默 skip，非 master 触发显示绿色 run）。
- **R3（`quick` delta）：`Pass`**（RS1 关闭：改为首步显式 `exit 1`，非 master 标红；0 残留）。
- **R4（`quick` delta）：`Pass`**（§5 回填与终态验证一致；0 残留 blocker / warning；S3 转交收尾，`.session` 同步后关闭）。
- **R5（`quick` delta）：`Pass`**（B2 的 tag 读取改为全量 tag 差集，覆盖 tag 落在 HEAD / 父提交、重跑、publish 失败、多 tag、非版本 tag 等路径；新增 RS3：注释对 tag 落点的归因不准确）。
- **R6（`quick` delta）：`Pass`**（RS3 关闭：注释与记录改为「不依赖 tag 落点」，实现未变；0 残留 blocker / warning）。
- **用时**：R1 按 `standard` 执行并完成 gh / semantic-release 真实复现；R2 ~ R6 为 `quick` delta。本轮未由工具返回逐轮秒级时长，故不补写估算值；首次真实 run 前以各轮时间盒声明为准。
- **复查基线**：`.github/workflows/release.yml`、`docs/guide/release.md`、`docs/i18n/en-US/guide/release.md`、`docs/plan/roadmap.md`、`docs/plan/todo.md`、本记录。

## 6. 未覆盖边界

- 未在真实 CI 运行 `workflow_dispatch`；`id-token: write` 的 OIDC token exchange、`GITHUB_TOKEN` 回推、下游 dispatch 仍需首次真实 run 验证。
- 未验证仓库侧 Trusted Publisher 是否已绑定；未验证 `master` 分支保护下的 bypass（当前分支未受保护）。
- 未执行 npm 发布；`1.1.0` 仍未发布。
