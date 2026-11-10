# GitHub 协作规范

本文档定义 caomei-ui 对 GitHub 上来路可信度、issue / PR 处置、自动化会话的推送与分支授权、跨仓 issue 的规则。推送纪律的基线见 [Git 规范](./git.md) §4，本文档 §4 是自动化会话推送授权的唯一权威定义。

## 1. 来源判定与可信提交者

- 判定分两步，顺序固定：
  1. 先取作者登录名 `gh api repos/<owner>/<repo>/issues/<n> --jq .user.login`，匹配**机器人白名单**。命中即视为可信来源，不再看 `author_association`——`dependabot[bot]` 实测为 `CONTRIBUTOR`，白名单是其唯一放行依据。
  2. 未命中时执行 `gh api repos/<owner>/<repo>/issues/<n> --jq .author_association`（issue 与 PR 均走 issues 端点）：`OWNER` / `MEMBER` / `COLLABORATOR` 为**可信来源**，`CONTRIBUTOR` / `FIRST_TIME_CONTRIBUTOR` / `NONE` 为**外部来源**。
- 白名单生效前提：`gh api users/<login> --jq .type` 返回 `Bot`。返回 404 或其它类型时不生效——名字空置期间被第三方注册为 App 也不放行；未注册的登记项只作意图记录。
- fail-closed：命令失败、字段缺失或为空、取不到作者登录名时，一律按外部来源处理，不得合并。
- 白名单登记（每个机器人须有完整批准记录）：

| 机器人 | 批准人 | 批准日期 | 用途 | 权限范围 |
|:---|:---|:---|:---|:---|
| `dependabot[bot]` | CaoMeiYouRen（OWNER） | 2026-11-11 | 依赖与 Actions 版本升级 PR | 仅其自身分支的 PR；不含合并策略变更 |
| `dependfix[bot]` | CaoMeiYouRen（OWNER） | 2026-11-11 | 依赖漏洞自动修复 PR | 同上；账号未注册前不会命中（`gh api users/dependfix[bot]` 返回 404） |

- 新增机器人须由用户 / `OWNER` 批准并补齐上述五列。`@code-reviewer` 只校验记录是否齐全、身份是否一致，不得自行批准；白名单变更须同批更新本文档与定时任务 prompt。
- 可信度只决定「能否合并」，不决定「是否需要审查」（§3）。

## 2. Issue 处置

- 默认只做调研：阅读、复现、定位、给出结论，不直接改代码。
- 例外：CI 失败修复与影响可用性的 blocker 级缺陷，可按 §4 授权修复；其余一律先调研。
- 可信来源的 issue：调研并评估；新需求登记到 [Backlog](../plan/backlog.md)，缺陷类按上一条处理或转 Backlog。进入当前阶段仍以用户决策为准（[规划规范](./planning.md) §3）。
- 外部来源的 issue：先核实真伪。
  - 「成立」判据（须全部满足）：可复现，或与文档 / 类型契约一致且有明确使用场景。
  - 成立 → 保留，追加中文评论写明复现命令、版本、影响范围与判断依据。
  - 不成立 / 无法复现 / 与实现不符 → 评论说明依据后关闭。
- 关闭任何 issue 都必须给可核对依据（复现命令、版本、文件与行号），不得凭印象关闭。
- 外部 issue 进 Backlog 须开发者审批：审批载体为 `OWNER` 在该 issue 的明确评论，或会话中的明确授权；`backlog.md` 对应行须写审批出处（评论 URL 或授权日期）。未留痕的「已批准」不成立。
- 看板状态同步按 [GitHub Projects 看板约定](./github-projects.md) 执行。

## 3. PR 处置

- 一律审查：读 diff、跑必要验证、给出结论；来源可信不减免审查。
- 处置结论三选一并写明理由：保留开放 / 关闭 / 合并。
- 合并前提（全部满足）：
  - 作者为可信来源（§1）；
  - `Quality`、`Test & Build` 及该 PR 触发的其它 workflow 全绿；
  - Review Gate `Pass`（dependabot 自动合并路径见本节「dependabot 自动合并路径」条）；
  - 无冲突；
  - 改动不触碰 `AGENTS.md`、`.env*`、`release.config.js`、`.github/workflows/release.yml`。
- **dependabot 自动合并路径**（配置文件 `.github/mergify.yml`）：
  - 覆盖范围只有常规版本升级：`dependabot.yml` 的 `allow.update-types` 只放行 patch / minor，major 不产生自动 PR，由人工发起与合并。
  - 放行条件含 `base = master`、`author = dependabot[bot]`、`label = dependencies`、非 draft、`Quality` 与 `Test & Build` 全绿，并排除 `release.config.js` 与 `.github/workflows/release.yml`。
  - 该路径不要求 Review Gate。逐条条件文本以 `.github/mergify.yml` 为准，本节只保留策略意图与例外；收紧或放宽策略须同批修改本节、配置文件与 `check-dependabot-policy` 的常量（`ALLOWED_UPDATE_TYPES` / `MERGIFY_FILE_EXCLUSIONS`），一致性由 `pnpm check:dependabot-policy` 守卫。
  - 安全更新不受 `update-types` 限制，可能以 major 形式出现并走该路径合入；合入后出现不兼容时由巡检开 revert，不因此放宽或回退配置。
- 外部来源的 PR：只审查与评论，不合并；质量不足或方向不符时说明理由后关闭。
- 可信来源的 PR 可代为修改，但限于简单修改：rebase、`pnpm-lock.yaml` 冲突、lint 格式、`package.json` 的依赖版本、CI 配置中的明显笔误。本包 `version` 字段由 semantic-release 管理，不得手改。
- 复杂修改（业务逻辑、公共 API、测试结构）不得代改：另开分支提交本仓 PR，并在原 PR 说明处置关系。
- 合并或关闭后同步看板状态（[GitHub Projects 看板约定](./github-projects.md)）。

## 4. 推送与分支（自动化会话）

- 适用范围：本节只约束定时任务等自动化会话；人工会话按 [Git 规范](./git.md) §4 处理（用户明确要求即可推送）。
- 允许推送的情形只有两种：
  1. **验证 CI 修复**：走分支 + PR，推送后等待该次运行结果再决定后续；同一时刻最多有一个在途。
  2. **条目完整交付**：Review Gate `Pass` + 本地验证通过后，风险与规模均未触发本节「新开分支条件」时可直接推 `master`；触发则该改动走分支 + PR，CI 通过后合并。非默认动作，建议累积若干条目后成批推送。
- 在途判定与登记：修复 PR 打 `ci-fix-inflight` 标签，存在该标签的 open PR 即表示有在途修复，须先处理完再开新的；合并或关闭时移除标签。
- 推送前本地最低验证集：`pnpm lint:check`、`pnpm typecheck`、定向 `pnpm test`；改样式加 `pnpm lint:css:check`，改文档加 `pnpm lint:md:check`，改文档站配置加 `pnpm typecheck:docs`。长耗时项（`pnpm verify` 全量、E2E 全量）可跳过，但须在提交说明与报告中列出跳过项。
- 推送后监控 CI；CI 耗时长时可继续下一项改动。
- 新开分支条件：改动可能影响项目整体运行状态（构建、发布、依赖、公共 API），或规模超 [规划规范](./planning.md) §5 的粒度阈值。此类改动在新分支完成、经 CI 通过后合并回 `master`，合并后清理本地与远程分支。
- 若 CI 失败的根因在 `.github/workflows/*` 或 release 配置：按情形 1 开 PR，只开到待人工合并，并在报告中列为需人工介入；不得自行合并，不得直接推 `master`。
- 自动化会话禁止：强推、`--no-verify`、绕过提交钩子；情形 1 下直接推 `master`。

## 5. 跨仓 issue

- 依赖作者为 `CaoMeiYouRen` 的包，或与本仓存在协作关系的上下游项目，确认问题出在对方时，可向该项目提交 issue。
- 提交前：① 检索对方仓库已有 issue 与 PR，确认不重复；② 读对方 `CONTRIBUTING` 与 issue 模板，按其规范填写（复现步骤、版本、环境、最小复现）。
- 提交前必须经用户审查并授权：拟稿（目标仓库、标题、正文）先交用户确认，未获授权不得提交。
- 提交后把链接回填到本仓对应 issue 或交付记录，便于回访与闭环。

## 6. 阶段规划输入

- 进入下一阶段规划前，拉取最新 issue、PR、Action 运行状态与安全告警，逐条判断对本仓的影响，必要时列入下一阶段候选。
- 本节只产出候选与依据，不改变 [规划规范](./planning.md) §3 的准入流程（评估 → Backlog → 用户决策 → 当前阶段）。

## 7. 任务载体与记录

- 12:00 巡检与 18:00 待办推进两条定时任务的定义在 OpenChamber 平台侧；仓库内只约定授权边界（本文档）、记录位置（各次运行报告、PR 与 issue 评论）与互斥方式（§4 的在途标签）。
- 任务定义变更须同批更新本文档与平台侧 prompt，不得只改其一。
