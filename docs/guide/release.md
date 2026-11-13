# 发布指南

## 1. 发布方式与当前状态

- 版本推断与发布工具为 **semantic-release**，依据 Conventional Commits 自动推断版本并发布。
- **1.0 期决策（历史，2026-10）**：采用**本地手动发布**；**当时暂不启动 CI 自动发布流程**。1.0 走「rc 预发布 → 正式版」两步：预发布发 npm `next`，正式版发 `latest`。`manual-release.mjs` 已支持 `--tag=next|latest`（缺省按版本推断：预发布 → `next`、正式版 → `latest`；**预发布 + `latest` 会被直接拒绝**，不会落到正式通道）。通道口径与验证证据见 [M3-1 发布预检记录](../design/governance/2026-10-26-phase26-m3-1-release-tag-coverage-preflight.md)。
- **转向（2026-11-03，2026-11-06 简化）**：用户裁定**下一阶段起通过 CI 发布**。`release.yml` 直接调用 `pnpm release`（semantic-release），版本推断、`CHANGELOG`、版本句、里程碑、npm publish、GitHub Release 与 tag 全部由 `release.config.js` 驱动；npm 使用 **Trusted Publishing（OIDC）**，`id-token: write` 即可，**不再需要 `NPM_TOKEN`**；GitHub 使用 `GITHUB_TOKEN`。触发模型 = `workflow_dispatch`（无 `dry_run` 输入、无 `environment` 审批）。手工流保留为回退路径。范围与验收口径见 [Phase 27 登记批次记录](../design/governance/2026-11-03-phase27-registration.md) §1.1 / §2，简化决策见 [发布工作流 OIDC 简化记录](../design/governance/2026-11-06-phase27-release-workflow-oidc-simplification.md)。
- **发布节奏（2026-11-13 用户裁定）**：默认**每周最多发布一次**（有可发布提交时才发版，无变更不发版），以**每周固定手动触发** `Release` workflow 执行；试运行 **4 周**，自**首个允许发布的阶段**起算（定义 = 首个未声明「本阶段不发布」的阶段，实际起点在该阶段登记时回填）。**阶段决策优先**：阶段可显式声明「本阶段不发布」，此时暂停周更。**可提前发布**的情形：① 安全修复；② 下游构建 / 发布阻塞修复；③ `BREAKING CHANGE`；④ 大型能力或里程碑；其中安全修复可在阶段暂停期内单独授权发布。后期更新频率下降时按需放宽（周 → 月），**每季度复核一次**（自政策落定日 2026-11-13 起算，下次 2027-02-13）；本次**不启用 `schedule`**，如需无人值守发布须另行授权。

> **1.0 发布门禁（2026-10-26 起）**：`1.0.0-rc.1` 发布前须通过 **G0 / G1（若 G1 裁定「修复」，另需 G1-F）/ G2**，以及 S1 / S2 / S3 前置批次；`1.0.0` 正式版发布前须通过 **G0 ~ G4**（含 G3 的 rc 与下游复验）。**所有 `publish`（含 rc）前另须通过[安全规范 §2.1](/standards/security#_2-1-发布前安全告警门禁)的告警门禁（critical 不允许豁免；high 须修复或留痕豁免）**。未通过前不得执行对应 `publish`。目标评审 2026-11-13、硬截止 2026-11-27，到期未通过不得自动延期。门禁口径见[Phase 26 执行期追加与 1.0 发布门禁](../design/governance/2026-10-26-phase26-ui-gate-planning.md) §4。

> 不使用 changesets（本项目为单包，semantic-release 是标准场景）。

## 2. 为什么首版采用手工发布（历史）

首版基线（1.0 之前的版本）的形态如下，属历史决策；1.0 仍维持本地手动发布。

- semantic-release 的首版**恒为 `1.0.0`**（内置常量 `FIRST_RELEASE`，且**没有** `initialVersion` 选项），无法直接产出 1.0 之前的版本。
- 建立基线 tag 的做法：**手工发布首个 1.0 之前的版本并建立基线 tag**（如 `v0.1.0`）。此后 semantic-release 以该 tag 为基线，按 Conventional Commits 递增（`fix` → patch，`feat` → minor）。
- 注意：一旦出现 `BREAKING CHANGE` / `!`，semantic-release 仍会直接升到 `1.0.0`；是否进入 1.0 须单独决策。

## 3. 发布流程（本地手动）

> **单入口编排**：`pnpm release:manual <step> --version=<v> [--tag=next|latest]`（脚本 `scripts/release/manual-release.mjs`，publish 可选 `--otp=<code>`，API 差分可选 `--base=<version>` / `--allow-breaking=<记录路径>`）把本节流程串成一条可复算链路，消除「命令分散 / 隐式前置 / 后置文档同步易漏 / GitHub Release 手工」四类易错点。
> 变更型步骤（`bump` / `changelog` / `publish` / `sync` / `announce`）**必须显式 `--yes`**，否则以 `--dry-run` 预览。

### 3.1 一键执行（推荐）

```bash
# 预发布（rc）→ npm next
pnpm release:manual run --version=1.0.0-rc.1 --tag=next [--date=YYYY-MM-DD] [--otp=<code>] [--yes]
# 正式版 → npm latest
pnpm release:manual run --version=1.0.0 --tag=latest [--date=YYYY-MM-DD] [--otp=<code>] [--yes]
```

`run` 依序执行 8 步：`preflight → api-diff → bump → changelog → sync → publish → verify → announce`。**`api-diff` 排在 `preflight` 之后**：`preflight` 的 `pnpm verify` 会构建 `dist`，差分直接比对这份当前产物；基线按目标 dist-tag 取**同通道上一已发布版本**（`latest` → 上一 `latest`，`next` → 上一 `next`），可用 `--base=<version>` 覆写。**`sync` 排在 `publish` 之前**：`npm publish` 打包当前工作区，README 随包发布；`sync` 在后会让 tarball 内的「当前版本」句永远落后一版。**`run` / `preflight` 内置安全告警门禁**：按[安全规范 §2.1](/standards/security#_2-1-发布前安全告警门禁)检查 Dependabot / Code Scanning 的 open 告警，`SECURITY_ALERTS_TOKEN` 缺失即中止；`publish` 在发布动作前复跑一次（`--dry-run` 预览不执行门禁），检查计数与豁免清单仍须写入当次发布治理记录。省略 `--tag` 时按版本自动推断（含 `-` 后缀的预发布 → `next`，正式版 → `latest`）；**预发布版本显式传 `--tag=latest` 会在参数校验阶段终止**。

### 3.2 分步执行（可复算 / 失败恢复）

```bash
pnpm release:manual preflight --version=1.0.0-rc.1 --tag=next
pnpm release:manual api-diff  --version=1.0.0-rc.1 --tag=next [--base=<version>] [--allow-breaking=<记录路径>]
pnpm release:manual bump      --version=1.0.0-rc.1 --yes
pnpm release:manual changelog --version=1.0.0-rc.1 --yes
pnpm release:manual sync      --version=1.0.0-rc.1 --yes
pnpm release:manual publish   --version=1.0.0-rc.1 --tag=next [--otp=<code>] --yes
pnpm release:manual verify    --version=1.0.0-rc.1 --tag=next
pnpm release:manual announce  --version=1.0.0-rc.1 --yes
```

### 3.3 各步骤口径（runbook）

> 下列第 0 项是内置门禁，不是 `STEPS` 中的步骤；`run` 实际执行第 1 ~ 8 项。

0. **发布前安全告警门禁（内置 + 留痕）**：`preflight` 与 `publish` 自动执行[安全规范 §2.1](/standards/security#_2-1-发布前安全告警门禁)的检查（open + dismissed，`auto_dismissed` 不参与）——**critical 不允许豁免**（被 dismiss 也算存在）；**high 须修复，或按规范留痕豁免**；其余级别可暂缓。`SECURITY_ALERTS_TOKEN` 缺失即中止（fail-closed），本地写入仓库根 `.env.local` 或临时 export（`--dry-run` 预览不执行门禁）；CI 侧由 `Security Alerts` workflow 执行同名检查（secret `SECURITY_ALERTS_TOKEN`，见 §2.1）。检查计数与豁免清单仍须写入当次发布治理记录。
1. **预检（`preflight`）**：工作区干净；分支为 `master`（`--dry-run` 下这两项只提示、不阻断，便于在任意分支预览计划）；`pnpm verify` 全链路通过；随后运行 `pnpm test:coverage` + `pnpm check:coverage` 生成并校验覆盖率证据（`verify` 内含 `test`，故预检会跑两遍测试）；目标版本尚未发布（`npm view`）；npm 凭据可用（`npm whoami`）；dist-tag 取 `--tag` 或按版本推断，**预发布 + `latest` 在参数层直接拒绝**；提示「长期任务门槛复核轮已执行并留痕」（发布前触发义务）。领先 `origin/master` 的提交会提示先推送。
2. **API 表面差分（`api-diff`）**：对**上一已发布版本**的 `.d.ts` 做差分，阻断项 = 删除 / 重命名声明文件或导出、非继承且无索引签名的导出类型成员删除、成员由 optional 变为 required；**新增不阻断**；其余内容变化只列出、人工复核类型变化。基线缺省按目标 dist-tag 取同通道上一版本（`latest` → 上一 `latest`，`next` → 上一 `next`），`--base=<version>` 可覆写；通道首版无基线、或目标已是通道当前版本时跳过。分步执行前须先完成 `preflight`（其 `pnpm verify` 构建 `dist`）；单独运行会使用现有 `dist` 并打印提示。`--dry-run` 仍执行只读差分并打印结论，网络 / 基线不可用时降级为提示；真实运行中 breaking 会中止。已批准的 major 用 `--allow-breaking=<治理记录路径>` 显式放行（路径须为 `docs/design/governance/` 下的 `.md` 文件、存在且会打印留痕）。
3. **版本基线（`bump`）**：只改 `package.json` 的版本行（保持格式与末尾换行）→ 提交 `chore(release): <v>` → 打 **annotated** tag `v<v>`（与 semantic-release 默认 tag 格式 `v${version}` 对齐，作为后续自动发布的基线）。
   **tag 落点**：tag 指向版本提交，`CHANGELOG` 与 `sync` 提交都在其后——**tag 视图不含 CHANGELOG 段、README 版本句落后一版均属正常形态**（两者都是仓库内产物，作者是后续提交）；**已发布 tag 不重写**（见 §8「回滚与弃用」）。因此**已发布 tag 的 README 快照不是版本句校验的有效信号**（README 的作者提交在 tag 之后），权威校验以解包 tarball 的 README 为准（`verify` 已自动断言）。
4. **发布说明（`changelog`）**：`pnpm changelog`（`scripts/release/generate-changelog.mjs`）生成 / 重写 `CHANGELOG.md` → 单独提交。（`--version=` / `--date=` 仅对**直接运行** `pnpm changelog` 生效：`--version=` 用于尚未 bump `package.json` 时，`--date=` 固定发布日期；脚本路径恒传 `--version=<v>`。）**如有公开 API 弃用项，人工补 `Deprecations` 段**（生成器当前不自动分组）。**major 版另须人工补里程碑段**（里程碑 / 升级注意 / 已知限制，文案见当次发布治理记录）：生成器只按提交分组，`v1.0.0-rc.1..v1.0.0` 这类区间会只剩零星修复；插入必须在 `changelog` 之后、`announce` 之前——`announce` 直接抽取该段落作为 GitHub Release note，插早了会被 `changelog` 重写覆盖。补完另起一次 `docs(changelog): 补充 <v> 里程碑段` 提交，并用 `announce --dry-run` 复核 `note <N> 行`。**major 版须分步执行**（`bump → changelog → 插入并单独提交 → sync → publish → verify → announce`）：插入后不得重跑 `changelog` 步骤或整链 `run`，否则里程碑块会被整篇重写覆盖。
5. **文档同步（`sync`）**：**必须在 `publish` 之前**——`npm publish` 打包当前工作区，README 随包发布；`sync` 在后会让 tarball 内的「当前版本」句永远落后一版（`1.0.0-rc.1` 实测：README 仍写 `0.7.0`）。**当前版本句禁止声明 npm dist-tag**（`dist-tag-in-statement`）；若版本句已是目标版本但受检文件仍有未提交改动，`sync` 会 fail-closed，要求先提交再继续（防半提交状态进入 `publish` / `announce`）。更新仓库根 README（中 2 处 / 英 1 处）与 `docs/plan/roadmap.md` 的「当前版本」句 → **守卫前置**（先跑 `pnpm docs:check:version`，失败即不落提交）→ 单独提交 `docs(release): sync version statements to <v>`（不命中发布元数据豁免，提交前须已有新鲜 Review Gate 工件）。
6. **发布（`publish`）**：**发布前 fail-closed 断言** `package.json` 版本与全部「当前版本」声明句均已到达目标版本（`scripts/release/manual-release.mjs` 的 `assertPublishVersionStatements`；分步执行绕过 `STEPS` 顺序时由该断言兜底），未就绪即中止并提示先跑 `bump` / `sync`。`npm publish --tag=<dist-tag>`（rc → `next`，正式版 → `latest`；未显式传 `--tag` 时按版本推断）；启用 npm 2FA 时传 `--otp=<code>`（未传时由 npm 在终端交互提示）。`prepublishOnly` 自动复跑许可校验（见 §7）。**预发布禁止发 `latest`**：`--version` 含 `-` 后缀且 `--tag=latest` 时脚本在预检前终止。
7. **后校验（`verify`）**：从 registry 读取 `dist-tags`，断言 `dist-tags.<目标 tag>` = 目标版本（rc 断言 `next`、正式版断言 `latest`），并额外断言**预发布版本不出现在 `latest`**；tarball **sha1 与 `dist.shasum` 比对**；解包 `package.json` 版本；`exports` 键集合（人工比对 13 键）。并断言**解包 tarball 内 README（中 / 英）的「当前版本」句 = 目标版本**（产物级最终防线）。API 差分的唯一执行点是第 2 步 `api-diff`，`verify` 不重复执行。
8. **GitHub Release（`announce`）**：先校验本地 / 远程 `v<v>` tag 一致；**本地有 tag、远程没有时中止并提示先 `git push origin v<v>` 再重试**（不自动推送）。通过后从 `CHANGELOG.md` 抽取该版本段落作 note → `gh release create v<v> --title <v> --verify-tag`；预发布版本追加 `--prerelease`，目标 dist-tag 非 `latest` 时追加 `--latest=false`（staged release 不抢 Latest）。

> **落痕（人工，脚本未覆盖）**：发布结论与关键实测值（registry 版本 / tarball shasum / 解包与冒烟结果 / GitHub Release）应落到可提交位置（发布执行治理记录或提交信息）。

> **推送**：`git push origin master --follow-tags`（`--follow-tags` **只推送 annotated tag**；若用轻量 tag 须显式 `git push origin v0.1.0`）。按 [Git 规范](/standards/git) 须用户明确授权，**脚本不自动推送**；`announce` 检测到本地 tag 未推送时会中止并给出上述命令，推送后重试 `announce` 即可。

### 3.4 提交构成与发布元数据豁免（重要）

一次发布产生 **3 次提交**（major 版另有第 4 次里程碑提交），其中**前两次与 major 版里程碑提交命中** `check-review-gate-artifacts` 的**发布元数据豁免**（否则发布提交会被 Review Gate 工件守卫阻断）——非 major 为 2 次、major 为 3 次：`chore(release)` 走 `VERSION_METADATA_FILES` 的版本行规则，两次 `docs(changelog)` 走 `GENERATED_RELEASE_FILES`（当前仅 `CHANGELOG.md`）。`sync` 提交不豁免，提交前须已有新鲜 Review Gate 工件：

| 提交 | 内容 | 发布元数据豁免 |
|:---|:---|:---:|
| `chore(release): <v>` | 仅 `package.json` 的版本行 | ✅ |
| `docs(changelog): <v>` | 仅 `CHANGELOG.md` | ✅ |
| `docs(changelog): 补充 <v> 里程碑段` | 仅 `CHANGELOG.md`（major 版人工里程碑段，见 §3.3 第 4 步） | ✅ |
| `docs(release): sync version statements to <v>` | README（中英）+ `docs/plan/roadmap.md` 的版本句（在 `publish` **之前**提交，版本句才随 tarball 发布） | ❌ **不豁免** |

> 豁免要求范围**等于全量暂存集**且每项状态为 `M`、版本清单 diff 增删行**全部**为 `"version": "…"` 形态；与任何其它文件同批即失去豁免。故执行 `sync` 提交前**须已有新鲜 Review Gate 工件**。

> **关于 `npm version`（本地发布的常见做法）**：`npm version <v>` 会**直接提交并打 annotated tag**——提交信息为裸版本号（非 Conventional 形态），`pnpm changelog` 提交在其后；这是**正常流程**（2026-09-30 用户口径），其 tag 指向版本提交、tag 视图不含 CHANGELOG 段，按第 3 步口径**不视为偏差、无需重指 tag**。若要改为按本节 3 ~ 5 步自行提交与打 tag，加 `--no-git-tag-version`（该开关同时关闭自动提交与打 tag）。**无论采用哪种方式，版本基线提交前都须复跑 `pnpm verify` 并留痕。**

### 3.5 发版后的文档同步边界

站点内展示的版本号由 `themeConfig.version` 从 `package.json` **自动派生**（页面用 `useData()` 的 `theme.version` 插值，由 `pnpm docs:check:version` 看守），发版时**无需手改站点文档**；但仓库根 `README.md` / `README.en-US.md`（GitHub / npm 渲染，无插值能力）与 `docs/plan/roadmap.md` 的版本表述仍需同步——由 `sync` 步骤按「当前版本」句式锚点自动完成（`scripts/shared/version-statements.mjs` 为唯一事实源），且必须在 `publish` 之前完成，版本句才会随 tarball 一起发布。

### 3.6 CHANGELOG 生成口径

`pnpm changelog`（`scripts/release/generate-changelog.mjs`）基于 `conventional-changelog` 与 `conventional-changelog-cmyr-config` 预设生成 / 重写 `CHANGELOG.md`；分组标题、commit 链接与模板均来自该预设（`package.json` 的 `changelog.language` 为 `zh`），生成口径与 semantic-release 一致。脚本对预设做两处定向补丁：① 预置 `headerPattern` 不识别 `type(scope)!: …`，会整条丢弃 `BREAKING CHANGE` 提交（semantic-release 走同一预设，行为相同），补 `!?` 后恢复；② 本仓提交正文含 Vue 插槽名（`#option`）与十六进制色值（`#60a5fa`），会被 GitHub 的 issue 前缀规则误判为引用，故关闭引用抽取。已知残留：预设 writer 仍会把**提交标题**中的 `#<数字>` 渲染为 issue 链接（当前历史 0 命中，出现时需补丁或改用其他标题写法）。指定 `--version=` 时脚本会剥离**空**的 `# Unreleased` 段（同名 tag 已存在时重生成不会再产生「Unreleased + 目标版本」双标题）；有内容的 Unreleased 段（尚未发布的提交）保持原样。依赖 `conventional-changelog@7.2.1` 与 `conventional-changelog-cmyr-config@3.0.0` 精确钉定：预设的字符串模板配套 `conventional-changelog-writer@8`，升到内置 writer@9 的 `conventional-changelog@8` 会在运行期抛 `headerPartial is not a function`。

## 4. 凭据与本地运行

- 本地运行 semantic-release 需 `--no-ci`（跳过 CI 环境校验），并设置 `GH_TOKEN`；本地 npm 发布可用本机登录或 `NPM_TOKEN`，CI 走 OIDC（见 §5）。
- **CI 发布流是 `1.1.0` 起的默认路径**（见 §5）；本地 semantic-release 仅作机制参考，未经授权不要执行 `pnpm release`（它会提交 `CHANGELOG.md` / `package.json`、打 tag、发布 npm 与 GitHub Release）。本地回退路径是 §3 的 `pnpm release:manual`。
- **registry 必须是 npmjs**：本机全局 `registry` 可能指向 `registry.npmmirror.com`（只读镜像，`npm whoami` 会 `ENEEDAUTH`、`npm publish` 不可用）。发布前显式 `export NPM_CONFIG_REGISTRY=https://registry.npmjs.org`，并用 `npm whoami` 确认账号；`~/.npmrc` 中的 `//registry.npmjs.org/:_authToken` 失效时会返回 `401`，需重新登录或换 token。
- 本地 npm 凭据须有效（`npm whoami` 可验证）；凭据失效时 `npm publish` 会返回 `401`（`ENEEDAUTH` / `E401`）。启用 2FA 时用 `--otp=<code>` 传入一次性密码；脚本在日志与错误信息中对 OTP 做脱敏。注意 OTP 仍会进入进程参数与 Shell history，优先在受控环境使用，或省略 `--otp` 让 npm 交互提示。
- **版本已发布过**时 `npm publish` 会以 `403`（`You cannot publish over the previously published versions: <version>`）失败——npm 不允许覆盖同名版本。处理：确认 `package.json` 的 `version` 是否已递增；确需修复已发布版本时**改发新 patch 版本**（不要尝试 unpublish，见 §8）。
- `prepublishOnly` 失败（如许可声明过期）会中止发布且不产生 tarball——按报错补齐后重跑即可，无需处理 registry 状态。
- **本地手动流**的 npm 发布侧无需 CI secret，但仍需本机 `npm whoami` 可用（或 2FA OTP）；**CI 发布流**使用 Trusted Publishing（OIDC），**不需要 `NPM_TOKEN`**，见 §5。安全告警门禁使用 `SECURITY_ALERTS_TOKEN`（CI 为仓库 secret，本地写入仓库根 `.env.local`，见[安全规范 §2.1](/standards/security#_2-1-发布前安全告警门禁)），该凭据仍须配置；发布链在 `preflight` / `publish` 强制检查，缺失即中止。

## 5. CI 发布链路（semantic-release + OIDC）

- `.github/workflows/release.yml` **直接调用 `pnpm release`（semantic-release）**，与 momei / caomei-auth 同一模式：workflow 不手写版本计算、不重检版本、不手工 `npm publish`；版本推断、`CHANGELOG.md`、README / roadmap 版本句、里程碑注入、npm publish、GitHub Release 与 tag 全部由 `release.config.js` 的插件链完成。
- **触发**：仅 `workflow_dispatch`（手动），且只允许 `master`（首步显式失败，非 master 会标红）。周更按 §1 的发布节奏以手动触发执行；`schedule` 维持注释（`0 12 * * 6`），启用无人值守发布须按 §1 单独授权。
- **发布前门禁**：`pnpm check:security-alerts`（`SECURITY_ALERTS_TOKEN` 缺失或 critical / high 未处置即中止）→ `pnpm verify` → `pnpm test:coverage` + `pnpm check:coverage` → `pnpm release`。
- **npm 凭据**：Trusted Publishing（OIDC）。workflow 声明 `id-token: write`，npm 自动生成 provenance，**不再需要 `NPM_TOKEN`**；仓库 / npm 侧只需绑定 Trusted Publisher（workflow filename 必须精确匹配 `release.yml`；Node ≥ 22.14 / npm ≥ 11.5.1，当前 `lts/*` 满足）。
- **GitHub 凭据**：`GITHUB_TOKEN`（`contents: write`）。`persist-credentials: false` 下 semantic-release 会把 `GITHUB_TOKEN` 注入推送 URL，用于 `@semantic-release/git` 回推 `CHANGELOG.md` / `package.json` / README / roadmap 与创建 GitHub Release；不再使用 `RELEASE_TOKEN` 或手写 `extraheader`。若 `master` 受分支保护，需为 `GITHUB_TOKEN` 对应身份配置 bypass。
- **版本句与里程碑同步（M6-2，保留）**：`@semantic-release/exec` 的 `prepareCmd` 在 `@semantic-release/npm` bump `package.json` 之后、`@semantic-release/git` 提交之前，同步 README（中英）与 `docs/plan/roadmap.md` 的「当前版本」句；`generateNotesCmd` 读取 `docs/release-notes/<version>.md`（按版本读取，文件缺失时为空）并追加到提交分组之后。锚点缺失或 `docs:check:version` 失败时 prepare 直接中止，不提交、不发布。
- **事件链与下游复验（M6-4，保留）**：发布成功后由独立 job（`actions: write` + `GITHUB_TOKEN`；`workflow_dispatch` 属防递归规则的显式豁免）执行 `gh workflow run downstream-compat.yml -f caomei-ui-version=<v>`，run URL 写入 job summary；`GITHUB_TOKEN` 创建的 tag / release 不触发 `v*` workflow。
- **不再保留的步骤（2026-11-06 按用户指令简化）**：`dry_run` 输入与 dry-run job、发布前 `Recheck next version`、`Capture previous published version`、`verify-publish` 后校验、`environment: release` 审批、`NPM_TOKEN` / `RELEASE_TOKEN` 回退。`scripts/release/verify-publish.mjs` 仍保留供本地手动流使用。
- **`next` 通道结论（2026-11-04，保留）**：仓库无 `next` 分支，CI **只发 `latest`**；预发布仍走本地 `pnpm release:manual --tag=next`，不新建 `next` 分支。
- **首次运行**：仓库侧绑定 npm Trusted Publisher；触发 `Release` workflow 即直接发布。`master` 若受保护，先确认 `GITHUB_TOKEN` 可回推。无待发布提交时 semantic-release 不创建 tag，下游 dispatch job 跳过；下游版本只认「发布前后全量 tag 集合的差集」中新增的版本 tag，重跑不会重复 dispatch 已发布的版本。
- **历史**：1.0 期采用本地手动发布；2026-11-03 用户裁定转向 CI 发布；2026-11-06 按用户指令把发布流简化为 semantic-release 直连 + OIDC。缺口与验收口径以 [Phase 27 登记批次记录](../design/governance/2026-11-03-phase27-registration.md) §2 与[发布工作流 OIDC 简化记录](../design/governance/2026-11-06-phase27-release-workflow-oidc-simplification.md)为准。

## 6. 版本推断（基线建立后）

| 提交类型 | 版本变化 |
|----------|----------|
| `fix` | patch |
| `feat` | minor |
| `BREAKING CHANGE` / `!` | major |
| `docs` / `chore` / `test` / `ci` / `refactor` | 不产生版本（除非配置） |

## 7. 第三方许可合规

- 运行时依赖（`reka-ui` / `@tanstack/vue-table` / `@lucide/vue` / `@internationalized/date` / `@vavt/cm-extension`，后者为富文本扩展语言包）、peer 依赖 `vue` 与可选 peer（`md-editor-v3`，富文本内核）的许可证统一声明在仓库根 `THIRD-PARTY-LICENSES`，并随 npm 包分发（已加入 `package.json` 的 `files`）。
- 新增或升级运行时依赖后，运行 `pnpm check:licenses` 校验声明覆盖与版本一致；该检查已纳入 `pnpm verify`（`governance:check`）。
- 同步更新声明：新增依赖时补充 `## <name>@<version>` 条目，升级版本时同步条目标题与许可证全文（可从 `node_modules/<pkg>/LICENSE` 复制）。
- `prepublishOnly` 会在发布前自动执行同一校验，声明缺失或不一致将中止发布。

## 8. 回滚与弃用

> 本节「弃用」指 **npm 版本标记**（`npm deprecate`），与[版本与兼容策略](./version-policy.md)的 **API 弃用政策**不同名不同义。

- 标记问题版本：`npm deprecate caomei-ui@<version> "<reason>"`。
- npm 的 `unpublish` 受发布时长（一般 72 小时）、依赖方数量、下载量与所有权等政策约束，且可能被拒绝；超期或已被广泛安装时**不建议** unpublish，改用 deprecate + 修复后 patch。
- 已发布的 git tag 不重写，修复以新版本提交。

**处置阶梯（逐级升级，不跳级）**：

1. **标记**：`npm deprecate caomei-ui@<version> "<原因>；请升级到 <修复版本>"`——只影响新的安装与升级提示，不改动已有 lockfile 的解析结果，也**不阻止安装**；「装不上」类 P0 不能只靠它止血。误判时用 `npm deprecate caomei-ui@<version> ""` 撤销。
2. **修复**：从对应 tag 拉 hotfix 发 patch 到 `latest`；`latest` 自然前移，**不改 tag、不改 dist-tag**。
3. **回退通道**（P0 立即执行；P1 超时执行）：`npm dist-tag add caomei-ui@<上一稳定版> latest`；修好后 `npm dist-tag add caomei-ui@<修复版本> latest` 恢复。**只影响不带范围的新安装**：已锁 `<version>` 的 lockfile 或 `^<version>` / `~<version>` 范围仍解析到问题版本，这批下游只能靠 patch 或显式 pin 回上一版。
4. **时点要求**：**P0（下游无法安装）分钟级**完成 `deprecate` + 回退 `latest`；**P1（可安装但构建 / 类型失败，或核心功能阻断）**在确认后 **24 小时内**完成 `deprecate` 并给出计划、**72 小时内**出 patch 或完成回退。
5. **禁止项**：不 `unpublish`、不重写 / 移动已推送 tag、不覆盖已发布 tarball；GitHub Release 正文可编辑（`gh release edit`），tag 与产物不动。
6. **校验与信号对齐**：`npm view caomei-ui dist-tags --json`、`npm view caomei-ui@<version> deprecated`、`gh workflow run downstream-compat.yml -f caomei-ui-version=<target>`（下游 `typecheck` + `build`，记录 revision 归因）；回退期间三处信号（npm dist-tags / GitHub Release 的 Latest / README 版本句）必须一致，必要时 `gh release edit v<version> --latest=false`；随后同步「当前版本」句并跑 `pnpm docs:check:version`（不得声明 dist-tag）。启用 npm 2FA 时 `deprecate` / `dist-tag` 同样需要 `--otp=<code>`。

## 9. 包形态与兼容性

- 单包 ESM：`package.json` 为 `"type": "module"`，`exports` 仅提供 `import` 条件，无 `require` 入口；下游按 ESM 使用（Nuxt 4 / Vite 场景）。
- 子路径导出：`caomei-ui`、`caomei-ui/theme.css`、`caomei-ui/resolver`、`caomei-ui/nuxt`，以及按需语言包 `caomei-ui/locale/<code>`（`zh-tw` / `ja-jp` / `ko-kr`，见下）。
- `files` 仅分发 `dist` 与 `THIRD-PARTY-LICENSES`；发布前以 `check:build` 确认产物齐全。
- **0.2.0 起为破坏性形态变更**：移除 `caomei-ui/styles.css`（旧单体全量样式）子路径导出，改为 `caomei-ui/theme.css`（基础层：tokens + 暗色 + `.caomei-root` + 品牌预设）。产物不再提供单体全量样式，组件样式随模块自带（`sideEffects: ["**/*.css"]`，由打包器按需 tree-shaking）。
- **下游修复指引**：把 `import 'caomei-ui/styles.css'` 改为 `import 'caomei-ui/theme.css'`；若此前依赖单体样式覆盖全部组件，改为「显式引入 `theme.css` + 按需引入组件」。resolver 与 Nuxt 模块会自动注入基础层，**注入点须唯一**以免重复注入与覆盖丢失。
- **按需语言包（未发布版本起为破坏性形态变更）**：内建语言拆为**预注册**（`zh-CN` / `en-US`，随包根可用）与**按需引入**（`zh-TW` / `ja-JP` / `ko-KR` / `es-ES` / `fr-FR` / `de-DE` / `ru-RU` / `pt-BR`）两类；`caomeiLocales` 由「内置全量」变为**已注册表**（初值 = `PRE_REGISTERED_LOCALES`）。
- **下游修复指引（语言）**：若使用了任一门按需语言（`zh-TW` / `ja-JP` / `ko-KR` / `es-ES` / `fr-FR` / `de-DE` / `ru-RU` / `pt-BR`），请在应用入口先注册再挂载 provider：
  `import jaJP from 'caomei-ui/locale/ja-jp'` + `registerLocale('ja-JP', jaJP)`。
  `zh-CN` / `en-US` 无需改动；直接读 `caomeiLocales['ja-JP']` 的写法应改为经 `registerLocale` 后读取注册表（或改用 `useLocale`）。
  详见[内建文案与语言](../components/locale.md) 的「按需引入语言」。
- **消费前提**：产物 JS 保留逐模块 CSS import，故**裸 Node ESM 不能直接 `import` 包根**（`ERR_UNKNOWN_FILE_EXTENSION: .css`），须经打包器（Vite / rolldown 系实测）或等效 CSS stub 加载器；本仓 `check:build` 的产物冒烟即使用 stub loader。

## 10. 下游兼容性回归

> **历史**：本机制原为后置项（2026-09-19 决策「下游接入验证后置」）；2026-10-10 随[路线图 Phase 8](/plan/roadmap) **启动**，以 dependfix 为试点。

- **机制**：caomei-ui 自身工作流 **checkout 已接入下游源码**，在**上游 runner** 上执行其 `typecheck` + `build`（**上游触发 + 上游执行**）；任一失败视为**兼容性阻塞**。
- **载体**：`.github/workflows/downstream-compat.yml`——caomei-ui **发布 tag（`v*`）自动触发**，另可手动 `workflow_dispatch`（可传被测版本）。下游仓库须为**公开**（上游 checkout 无需额外凭据）。
- **CI 发布事件链（M6-4）**：`GITHUB_TOKEN` 创建的 tag / release **不会触发** `v*` workflow；但 `workflow_dispatch` 是防递归规则的显式豁免，`Release` 在发布成功后由独立 job 以 `GITHUB_TOKEN` + `actions: write` 执行 `gh workflow run downstream-compat.yml -f caomei-ui-version=<v>`，并把 run URL 写入 job summary（run 暂不可见时写「已提交、尚未可见」）。**dispatch 前先轮询 npm 传播**：`npm view caomei-ui@<v> version --prefer-online` 以 600s 总预算轮询（间隔 20s、单次探测 ≤15s），版本可解析后才派发；超时 fail-closed 并提示手动 dispatch（1.1.0 首次发布实测：npm publish 返回成功到 registry 可解析仍有约 3 分钟延迟）。
- **受检清单（接入即登记）**：登记于工作流的 `matrix`——**已在受检面**即已在 `matrix` 登记。
  - **已在受检面**：`dependfix`（`apps/platform`，试点）；`caomei-auth`（根包，setup 为 `pnpm exec nuxt prepare`）；`momei`（根包，setup 先构建 `@momei-blog/api-client` 与 `momei-mcp-server` 再 `nuxt prepare`）。各仓 `timeout-minutes` 与完整命令以工作流 `matrix` 为准，本节不复制数值。
  - **已消费但未接入**：无。
  - **路线图目标下游但当前零消费**：`rss-impact-next` / `afdian-linker`——接入后增量登记。
  - **版本断言**：override 且 `Setup downstream build chain` 后在目标包目录读取 `node_modules/caomei-ui/package.json`，实际版本与目标版本不一致即 fail-closed（`Assert installed caomei-ui version`），结果写入 job summary；避免「命令成功但未重装生效」或 setup 阶段重解析回退。**变更历史（2026-11-12）**：新增 `caomei-auth` / `momei` 两仓与按仓 `timeout-minutes`（按仓取值见工作流 `matrix`，此处不复写数值），两仓本地 `typecheck` + `build` 已实测通过（评估 §1.4）；**真实 run 已取证**（run `43211984429`，2026-11-12，被测 `1.2.0`，三仓 success）。
- **触发与容量**：caomei-ui **发布 tag（`v*`）触发 1 次**（另可手动）；检查范围最低 `typecheck` + `build`，**不含** e2e / 视觉回归 / 全量单测 / 覆盖率。三仓按 `matrix` 并行，单 job 时长上限按各条目的 `timeout-minutes` 取值（见工作流 `matrix`）。**下游默认分支为移动目标**：工作流记录下游 revision（SHA）以便归因——红可能是下游自身改动所致，非 caomei-ui 回归。**刚发布版本的安装**：下游可能启用 pnpm 11 的 `minimumReleaseAge`，会拒绝「过新」的版本。两层处理：① `Override caomei-ui to target version` 步骤以 `--config.minimumReleaseAge=0` 安装刚发布版本（只作用于该条 `pnpm add`）；② override 写入 lockfile 后，build chain 的隐式 install 仍需 `pnpm_config_minimum_release_age=0`（由 override 步骤末尾写入 `$GITHUB_ENV`，pnpm 11 不读 `npm_config_*`），并由 `Assert minimumReleaseAge override` 断言配置已解析。初次 `pnpm i --frozen-lockfile` 仍走默认门槛，防护未削弱。详见同节「归属与现状」。
- **归属与现状**：本机制为[路线图 Phase 8](/plan/roadmap)；工作流**已就绪并经多次真实触发验证**——run #1（2026-10-12，registry latest `0.6.0`，`dependfix @ 46c6fb61`，见 `docs/design/governance/2026-10-12-phase22-m1-1-downstream-compat-first-run.md`）、**run #2（2026-10-13，显式版本入参 `0.5.0`，与下游锁定版本构成**版本差**，`dependfix @ edbe5e04…`，见 `docs/design/governance/2026-10-13-phase23-m2-1-downstream-compat-explicit-version-run.md`）** 与 **run #3（2026-10-13 UTC / 本地 2026-10-14，**负向对照**：显式入参 `0.2.0` 的已知不兼容版本 → `Typecheck downstream` **红**，`dependfix @ 1a6aca15…`，见 `docs/design/governance/2026-10-14-phase24-m1-2-downstream-compat-negative-control.md`）**。**run #4（2026-10-20，tag `v0.7.0`）** 在 `Override caomei-ui to target version` 被下游 pnpm 11 `minimumReleaseAge` 拒绝（版本刚发布 10 分钟），属发布年龄门槛而非兼容性回归。**run #5（2026-10-30，tag `v1.0.0-rc.1`，`41023344064`）** 暴露上一轮修复不完整：override 步骤自身带 `--config.minimumReleaseAge=0`，但 override 会把刚发布的 rc 写入下游 lockfile，后续 `Setup downstream build chain` 的隐式 `pnpm install` 重新校验后再次被拒（同一门槛，非兼容性回归）。现改为：override 后通过 `$GITHUB_ENV` 设 `pnpm_config_minimum_release_age=0`（**pnpm 11 不读取 `npm_config_*`**），并用 `pnpm config get minimumReleaseAge` 断言生效；初次 `pnpm i --frozen-lockfile` 仍走默认门槛，防护未削弱。**run #6（2026-11-06，`1.1.0` 发布自动 dispatch，`42250122497`）** 在 `Override caomei-ui to target version` 报 `ERR_PNPM_NO_MATCHING_VERSION`：npm publish 返回成功到 registry 可解析存在传播延迟（本次约 3 分钟），发布链即时 dispatch 过早——属发布链时序缺陷，非兼容性回归；修复见上条「dispatch 前先轮询 npm 传播」。**run #7（2026-11-06，显式入参 `1.1.0` 重跑，`42251067161`）** `dependfix @ ad592c92…` 全绿（`Override` / `Assert minimumReleaseAge override` / `Typecheck downstream` / `Build downstream` 均 success，约 2 分钟），同时验证 run #5 的 `minimumReleaseAge` 修复。**2026-11-12 扩容**：新增 `caomei-auth` / `momei` 两仓与按仓 timeout，本地命令可行性已实测（评估 §1.4）。**run #8（2026-11-12，`43211984429`，被测 `1.2.0`）** 三仓（`dependfix` / `caomei-auth` / `momei`）**全部 success**，首跑总耗时约 3 分钟（`11:46:17` → `11:49:23` UTC），扩容矩阵与安装版本断言均已取证。
- **判别力口径（避免把「绿 run」读成「兼容性已验证」）**：**管道贯通**（运行时无缺陷 / 可归因）与**重装生效**（override 确实换了版本）**已成立**；**回归判别力**（区分「新版本破坏下游」与「不破坏」）**已由负向对照路径成立**——run #3 安装已知不兼容的 `0.2.0` 后期望红、实际红，失败面 6 条 TS 诊断逐条归因到 `0.3.0` 才补齐的 `DataTable` 多列排序 / 行分组 / 行展开能力面。**正向方向已成立**：run #7 以比下游锁定版本更新的 `1.1.0`（dependfix 锁定 `1.0.0-rc.1`）跑通 `typecheck` + `build`；run #4 / #6 的中止均已归因到发布年龄门槛与 npm 传播延迟，非兼容性回归。启动范围与形态见 Phase 8 启动范围评估记录（`docs/design/governance/2026-10-08-phase8-downstream-regression-scope-evaluation.md`）。

## 11. 相关文档

- [Git 规范](/standards/git)
- [架构设计 - 发布链路](/design/architecture#_7-发布链路)
- [路线图](/plan/roadmap)
