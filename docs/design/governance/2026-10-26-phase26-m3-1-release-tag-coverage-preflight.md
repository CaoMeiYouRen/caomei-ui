# Phase 26 M3-1：预发布通道（`--tag`）与覆盖率预检

> 创建时间：2026-10-26
> 触发：Phase 26 M3-1（[Phase 26 登记批次](./2026-10-22-phase26-registration.md) §2）。
> 依据：[发布指南 §1 / §3](../../guide/release.md)、[测试规范 §2](../../standards/testing.md)。
> **本记录是 M3-1 的发布通道口径、安全不变量与验证证据的唯一载体**；发布指南只承载操作步骤，不另立决策。

## 1. 决策摘要

| 子项 | 实现 | 验收对应 |
|:---|:---|:---|
| `--tag` 解析 | `parseArgs` 支持 `--tag=next\|latest`；`resolveDistTag` 校验取值并按版本推断缺省通道（预发布 → `next`，正式版 → `latest`） | `release:manual run --version=1.0.0-rc.1 --tag=next --dry-run` |
| 安全不变量 | 预发布版本（semver 含 `-` 后缀）显式传 `--tag=latest` 时在参数校验阶段终止（exit 1） | 单测 + CLI 负向对照 |
| 发布 | `npm publish --tag=<dist-tag>`；`buildPublishArgs` **强制要求**目标 tag（缺省抛错），OTP 继续脱敏展示 | dry-run 输出 / 单测 |
| 后校验 | 断言 `dist-tags.<tag>` = 目标版本；**`latest` 上不得出现任何预发布版本（含历史 rc）**；`dist.shasum` 必须读取成功且为 40 位小写 sha1，再与本地 tarball 比对 | 真实 registry 实测（`0.7.0` → `latest`）+ 单测 |
| GitHub Release | 预发布版本追加 `--prerelease`；目标 tag 非 `latest` 时追加 `--latest=false` | 单测 |
| 覆盖率预检 | `preflight` 在 `pnpm verify` 后运行 `pnpm test:coverage` + `pnpm check:coverage` | 2026-10-26 实测 exit 0（statements 92.98 / branches 85.89 / functions 94.69 / lines 92.33） |
| 文档 | 中英 `release.md` 的 §1 状态句、§3 命令与步骤口径、§5 决策句同步，并链接本记录 | `docs:check` |

**对外影响**：仅发布脚本与文档，零 `src/**`、零公开 API / `exports` / locale 变更；下游消费方无感知。rc 的 npm 通道由 `latest` 改为 `next` 属**发布流程修正**（此前脚本不支持 `--tag`，rc 会被迫落到 `latest`）。

## 2. 实现细节

### 2.1 dist-tag 解析与安全不变量

- `DIST_TAGS = ['next', 'latest']`；`DEFAULT_PRERELEASE_TAG = 'next'` / `DEFAULT_STABLE_TAG = 'latest'`。
- `isPrereleaseVersion(version)`：按 semver 预发布后缀（`-`）判定。
- `resolveDistTag(version, tag)`：
  - 显式 `tag` 不在 `DIST_TAGS` → `Invalid --tag`；
  - 未显式给出时按版本推断；
  - **预发布 + `latest` → 抛错终止**（安全不变量）。
- `buildPublishArgs(otp, tag)`：必须提供 `tag`，否则抛错；始终在 `npm publish` 上带 `--tag=<tag>`，OTP 继续脱敏展示；`stepPublish` 另有 `DIST_TAGS` 守卫（防未来重构绕过）。

### 2.2 `preflight` 的覆盖率证据

- `pnpm verify`（原有全链路）之后追加：
  1. `pnpm test:coverage`（生成 `coverage/coverage-summary.json`）；
  2. `pnpm check:coverage`（按阈值断言行 / 分支 / 函数 / 语句覆盖率）。
- **成本口径**：`verify` 内含 `pnpm test`，故预检会跑两遍测试；该重复是「覆盖率证据必须在发布前生成」的直接代价，未引入新脚本或改动 `verify` 的组成（避免门禁清单双载体漂移）。
- dry-run 只打印计划，不执行上述命令。

### 2.3 `verify` 按目标 dist-tag 断言

- 由 `npm view caomei-ui version`（恒为 `latest`）改为 `npm view caomei-ui dist-tags --json`；**只解析 stdout**，避免 npm notice 等 stderr 输出污染 JSON。
- `parseDistTags` 解析输出；非法 / 空输入回落空对象（随后断言失败）。
- `checkDistTagState`：
  - `dist-tags.<tag>` 必须等于目标版本；
  - `latest` 上出现**任何**预发布版本（含历史 rc）→ 失败（该通道只应指向正式版）；
  - 正式版断言 `latest`，rc 断言 `next`。
- `dist.shasum` 校验**fail-closed**：`npm view` 必须 exit 0，输出必须匹配 40 位小写十六进制 sha1，随后与本地 tarball 的无条件比对；任一环节缺失即失败（旧实现中空输出会静默跳过比对）。
- 后续解包 / `exports` 校验保持不变。

### 2.4 `announce` 的预发布 / staged 标记

- `buildAnnounceArgs(version, tag, notesFile)`：
  - 预发布版本追加 `--prerelease`；
  - 目标 tag 非 `latest` 时追加 `--latest=false`（staged release 不抢 GitHub Latest）；
  - 必须提供 `tag`，否则抛错。
- 该标记与 npm `next` 通道同源（同用 `isPrereleaseVersion` / `ctx.tag`），避免「npm 对了、GitHub 仍把 rc 或 staged release 标为 Latest」的双口径。

## 3. 验证与证据

- **验收命令（dry-run）**：`pnpm release:manual run --version=1.0.0-rc.1 --tag=next --dry-run`
  - `[preflight] 当前 package.json version = 0.7.0，目标 = 1.0.0-rc.1（dist-tag = next）`
  - `[publish] dry-run：npm publish --tag=next（caomei-ui@1.0.0-rc.1 → dist-tag next）`
  - `[verify] dry-run：registry dist-tags.next / tarball shasum / 解包 / exports 校验`
  - 全流程 exit 0，未落盘 / 未改 git。
- **安全不变量负向对照**：`node scripts/release/manual-release.mjs run --version=1.0.0-rc.1 --tag=latest --dry-run` → exit 1，提示「预发布版本 1.0.0-rc.1 不得发布到 latest（请改用 --tag=next）」。
- **真实 registry 后校验**：`node scripts/release/manual-release.mjs verify --version=0.7.0 --tag=latest` → `[verify] OK：dist-tag latest = 0.7.0、shasum 5b59e41aa400…、exports 13 键`（shasum 与 registry `dist.shasum` 一致）。
- **覆盖率预检实测（2026-10-26 01:13）**：`pnpm test:coverage` + `pnpm check:coverage` → exit 0；statements **92.98%** / branches **85.89%** / functions **94.69%** / lines **92.33%**（阈值 90 / 80 / 90 / 90），`coverage/coverage-summary.json` 于同一批次重新生成。
- **定向单测**：`npx vitest run scripts/release/manual-release.test.mjs` → **34 例通过**，含：
  - dist-tag 默认推断 / 未知 tag / rc + latest 拒绝；
  - `latest` 上出现历史 rc 的失败用例；
  - `dist-tags` 解析（JSON / 非法 / 空数组）；
  - `dist.shasum` 形态校验；
  - publish / announce 参数构造；
  - **CLI 子进程用例**：rc + latest → exit 1 且不执行 publish；rc + next dry-run → exit 0 且输出 `--tag=next`。
- **静态与文档门**：`npx eslint`（脚本 + 测试）exit 0；`pnpm typecheck` exit 0；`lint-md`（中英 `release.md` + 本记录 + 索引）exit 0；`pnpm docs:check` 全部 12 段通过。
- **全量质量门**：首轮 `pnpm verify` 在 `data-table.test.ts` 的「sortable 列渲染排序按钮并在点击时切换顺序（非受控）」超时失败；该文件隔离复跑 **30 / 30** 通过，随后 `npx vitest run --maxWorkers=2` 全量 **141 文件 / 2724 例全部通过**（仓库已知的并行负载 flaky 类，本批零 `src/**` 改动）。其余 verify 段单独执行均 exit 0：`pnpm build` / `check:build` / `check:resolver` / `check:nuxt` / `docs:build` / `docs:check:i18n-routing` / `governance:check`。
- **V 阶段**：显式跳过——本批为零 UI / 零 `src/**` 改动的发布脚本与文档批次，无渲染面。

## 4. 边界与未覆盖

- **未真实发布 rc**：`--tag=next` 的端到端效果需真实 `npm publish` 才能完全验证；该动作归 M3-3（发布执行），且以用户明确授权推送为前提。本批以 dry-run + 真实 registry 读取 + 单测覆盖参数构造与断言逻辑。
- **未执行完整 `preflight` 包装**：其前置要求为洁净工作区 / `master` / npm 凭据；本批在脏工作区下无法跑完整包装。已按同批次执行其全部组成命令（verify 各段 + `test:coverage` + `check:coverage`），并以 dry-run 校验编排顺序与日志。
- **未改动 `release.yml`**：CI 自动发布仍关闭（Phase 26 非目标）。
- **`preflight` 的测试重复**：接受「跑两遍测试」的成本；若后续 `verify` 拆分出「不含 test」的形态，应同批更新本节与发布指南。
- **网络依赖**：`verify` 读取 registry 的 `dist-tags` / `dist.shasum`，离线时按失败处理（发布本身即需网络，属预期）。

## 5. Review Gate

- **audit-depth**：`deep`（发布流程改动；按 [AI 协作规范 §3.1](../../standards/ai-collaboration.md) 取严），时间盒 ≤ 20 分钟（单分区）。
- **R1**：`Reject`（1 blocker / 2 warning / 4 suggest）。
  - **RG-B01（blocker）**：本记录把覆盖率预检写成「真实 `verify` 实测」，但 `verify` 不含 coverage 命令，且覆盖率摘要早于本批改动 → 已改为实际执行的 `pnpm test:coverage` + `pnpm check:coverage`（2026-10-26 01:13，exit 0，四项读数见 §3），并删除错误的证据归属。
  - **RG-W01（warning）**：`checkDistTagState` 只拦「目标版本在 latest」，历史 rc 占用 `latest` 会通过 → 已改为 `latest` 上出现任何预发布版本即失败，并补历史 rc 用例。
  - **RG-W02（warning）**：`dist.shasum` 空输出时静默跳过比对（fail-open）→ 已改为 exit status + 40 位 sha1 形态 + 无条件比对，并补形态用例。
  - **RG-S01（suggest）**：正式版 + `next` 会形成 npm `latest` 未动、GitHub Latest 已指向新版本的分离状态 → 已采纳：非 `latest` 通道追加 `--latest=false`，并补用例。
  - **RG-S02（suggest）**：`buildPublishArgs` 允许 tag 缺省 → 已改为必填 + `stepPublish` 守卫，并补抛错用例。
  - **RG-S03（suggest）**：安全不变量缺 CLI 级自动化 → 已补不触网 / 不写盘的子进程用例（rc + latest exit 1；rc + next dry-run exit 0）。
  - **RG-S04（suggest）**：发布指南未链接本记录 → 中英 `release.md` §1 已加记录链接（英文用站点根绝对路径）。
- **R2**：`Pass`（0 blocker / 0 warning / 1 suggest）。R1 的 1 blocker / 2 warning / 4 suggest **全部关闭**；新增 RG-S05（`stepVerify` 的 shasum 非零状态分支缺注入式用例）为 follow-up，不阻断。复审仅复查修复点，audit-depth `deep`，时间盒 ≤ 10 分钟。
- **残余风险**：未真实执行 `npm publish --tag=next` / `gh release create --latest=false`（归 M3-3，需用户授权）；未跑完整 `preflight` 包装（其组成命令已分段执行）；`stepVerify` 的 shasum 非零状态分支仅代码审查 + 真实成功路径覆盖（RG-S05）。
