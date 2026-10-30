# 发布指南

## 1. 发布方式与当前状态

- 版本推断与发布工具为 **semantic-release**，依据 Conventional Commits 自动推断版本并发布。
- **当前决策（1.0 收尾，2026-10）**：采用**本地手动发布**；**暂不启动 CI 自动发布流程**。1.0 走「rc 预发布 → 正式版」两步：预发布发 npm `next`，正式版发 `latest`。`manual-release.mjs` 已支持 `--tag=next|latest`（缺省按版本推断：预发布 → `next`、正式版 → `latest`；**预发布 + `latest` 会被直接拒绝**，不会落到正式通道）。通道口径与验证证据见 [M3-1 发布预检记录](../design/governance/2026-10-26-phase26-m3-1-release-tag-coverage-preflight.md)。

> **1.0 发布门禁（2026-10-26 起）**：`1.0.0-rc.1` 发布前须通过 **G0 / G1（若 G1 裁定「修复」，另需 G1-F）/ G2**，以及 S1 / S2 / S3 前置批次；`1.0.0` 正式版发布前须通过 **G0 ~ G4**（含 G3 的 rc 与下游复验）。**所有 `publish`（含 rc）前另须通过[安全规范 §2.1](/standards/security#_2-1-发布前安全告警门禁)的告警门禁（critical 不允许豁免；high 须修复或留痕豁免）**。未通过前不得执行对应 `publish`。目标评审 2026-11-13、硬截止 2026-11-27，到期未通过不得自动延期。门禁口径见[Phase 26 执行期追加与 1.0 发布门禁](../design/governance/2026-10-26-phase26-ui-gate-planning.md) §4。

> 不使用 changesets（本项目为单包，semantic-release 是标准场景）。

## 2. 为什么首版采用手工发布（历史）

首版基线（1.0 之前的版本）的形态如下，属历史决策；1.0 仍维持本地手动发布。

- semantic-release 的首版**恒为 `1.0.0`**（内置常量 `FIRST_RELEASE`，且**没有** `initialVersion` 选项），无法直接产出 1.0 之前的版本。
- 建立基线 tag 的做法：**手工发布首个 1.0 之前的版本并建立基线 tag**（如 `v0.1.0`）。此后 semantic-release 以该 tag 为基线，按 Conventional Commits 递增（`fix` → patch，`feat` → minor）。
- 注意：一旦出现 `BREAKING CHANGE` / `!`，semantic-release 仍会直接升到 `1.0.0`；是否进入 1.0 须单独决策。

## 3. 发布流程（本地手动）

> **单入口编排**：`pnpm release:manual <step> --version=<v> [--tag=next|latest]`（脚本 `scripts/release/manual-release.mjs`，publish 可选 `--otp=<code>`）把本节流程串成一条可复算链路，消除「命令分散 / 隐式前置 / 后置文档同步易漏 / GitHub Release 手工」四类易错点。
> 变更型步骤（`bump` / `changelog` / `publish` / `sync` / `announce`）**必须显式 `--yes`**，否则以 `--dry-run` 预览。

### 3.1 一键执行（推荐）

```bash
# 预发布（rc）→ npm next
pnpm release:manual run --version=1.0.0-rc.1 --tag=next [--date=YYYY-MM-DD] [--otp=<code>] [--yes]
# 正式版 → npm latest
pnpm release:manual run --version=1.0.0 --tag=latest [--date=YYYY-MM-DD] [--otp=<code>] [--yes]
```

`run` 依序执行 7 步：`preflight → bump → changelog → sync → publish → verify → announce`。**`sync` 排在 `publish` 之前**：`npm publish` 打包当前工作区，README 随包发布；`sync` 在后会让 tarball 内的「当前版本」句永远落后一版。**`run` / `preflight` 不代查 GitHub 安全面板**：发布前须人工执行[安全规范 §2.1](/standards/security#_2-1-发布前安全告警门禁)的告警门禁，并把结论写入当次发布治理记录。省略 `--tag` 时按版本自动推断（含 `-` 后缀的预发布 → `next`，正式版 → `latest`）；**预发布版本显式传 `--tag=latest` 会在参数校验阶段终止**。

### 3.2 分步执行（可复算 / 失败恢复）

```bash
pnpm release:manual preflight --version=1.0.0-rc.1 --tag=next
pnpm release:manual bump      --version=1.0.0-rc.1 --yes
pnpm release:manual changelog --version=1.0.0-rc.1 --yes
pnpm release:manual sync      --version=1.0.0-rc.1 --yes
pnpm release:manual publish   --version=1.0.0-rc.1 --tag=next [--otp=<code>] --yes
pnpm release:manual verify    --version=1.0.0-rc.1 --tag=next
pnpm release:manual announce  --version=1.0.0-rc.1 --yes
```

### 3.3 各步骤口径（runbook）

0. **发布前安全告警门禁（人工）**：按[安全规范 §2.1](/standards/security#_2-1-发布前安全告警门禁)检查 Dependabot / Code Scanning 的 open 告警——**critical 不允许豁免**；**high 须修复，或按规范留痕豁免**；其余级别可暂缓。CI 侧由 `Security Alerts` workflow 执行同名检查（secret `SECURITY_ALERTS_TOKEN`，见 §2.1）；本地可跑 `SECURITY_ALERTS_TOKEN=<pat> pnpm check:security-alerts`。检查计数与豁免清单写入当次发布治理记录。
1. **预检（`preflight`）**：工作区干净；分支为 `master`；`pnpm verify` 全链路通过；随后运行 `pnpm test:coverage` + `pnpm check:coverage` 生成并校验覆盖率证据（`verify` 内含 `test`，故预检会跑两遍测试）；目标版本尚未发布（`npm view`）；npm 凭据可用（`npm whoami`）；dist-tag 取 `--tag` 或按版本推断，**预发布 + `latest` 在参数层直接拒绝**；提示「长期任务门槛复核轮已执行并留痕」（发布前触发义务）。领先 `origin/master` 的提交会提示先推送。
2. **版本基线（`bump`）**：只改 `package.json` 的版本行（保持格式与末尾换行）→ 提交 `chore(release): <v>` → 打 **annotated** tag `v<v>`（与 semantic-release 默认 tag 格式 `v${version}` 对齐，作为后续自动发布的基线）。
   **tag 落点**：tag 指向版本提交，`CHANGELOG` 与 `sync` 提交都在其后——**tag 视图不含 CHANGELOG 段、README 版本句落后一版均属正常形态**（两者都是仓库内产物，作者是后续提交）；**已发布 tag 不重写**（见 §8「回滚与弃用」）。因此**已发布 tag 的 README 快照不是版本句校验的有效信号**（README 的作者提交在 tag 之后），权威校验以解包 tarball 的 README 为准（`verify` 已自动断言）。
3. **发布说明（`changelog`）**：`pnpm changelog`（`scripts/release/generate-changelog.mjs`）生成 / 重写 `CHANGELOG.md` → 单独提交。（`--version=` / `--date=` 仅对**直接运行** `pnpm changelog` 生效：`--version=` 用于尚未 bump `package.json` 时，`--date=` 固定发布日期；脚本路径恒传 `--version=<v>`。）**如有公开 API 弃用项，人工补 `Deprecations` 段**（生成器当前不自动分组）。**major 版另须人工补里程碑段**（里程碑 / 升级注意 / 已知限制，文案见当次发布治理记录）：生成器只按提交分组，`v1.0.0-rc.1..v1.0.0` 这类区间会只剩零星修复；插入必须在 `changelog` 之后、`announce` 之前——`announce` 直接抽取该段落作为 GitHub Release note，插早了会被 `changelog` 重写覆盖。补完另起一次 `docs(changelog): 补充 <v> 里程碑段` 提交，并用 `announce --dry-run` 复核 `note <N> 行`。**major 版须分步执行**（`bump → changelog → 插入并单独提交 → sync → publish → verify → announce`）：插入后不得重跑 `changelog` 步骤或整链 `run`，否则里程碑块会被整篇重写覆盖。
4. **文档同步（`sync`）**：**必须在 `publish` 之前**——`npm publish` 打包当前工作区，README 随包发布；`sync` 在后会让 tarball 内的「当前版本」句永远落后一版（`1.0.0-rc.1` 实测：README 仍写 `0.7.0`）。**当前版本句禁止声明 npm dist-tag**（`dist-tag-in-statement`）；若版本句已是目标版本但受检文件仍有未提交改动，`sync` 会 fail-closed，要求先提交再继续（防半提交状态进入 `publish` / `announce`）。更新仓库根 README（中 2 处 / 英 1 处）与 `docs/plan/roadmap.md` 的「当前版本」句 → **守卫前置**（先跑 `pnpm docs:check:version`，失败即不落提交）→ 单独提交 `docs(release): sync version statements to <v>`（不命中发布元数据豁免，提交前须已有新鲜 Review Gate 工件）。
5. **发布（`publish`）**：**发布前 fail-closed 断言** `package.json` 版本与全部「当前版本」声明句均已到达目标版本（`scripts/release/manual-release.mjs` 的 `assertPublishVersionStatements`；分步执行绕过 `STEPS` 顺序时由该断言兜底），未就绪即中止并提示先跑 `bump` / `sync`。`npm publish --tag=<dist-tag>`（rc → `next`，正式版 → `latest`；未显式传 `--tag` 时按版本推断）；启用 npm 2FA 时传 `--otp=<code>`（未传时由 npm 在终端交互提示）。`prepublishOnly` 自动复跑许可校验（见 §7）。**预发布禁止发 `latest`**：`--version` 含 `-` 后缀且 `--tag=latest` 时脚本在预检前终止。
6. **后校验（`verify`）**：从 registry 读取 `dist-tags`，断言 `dist-tags.<目标 tag>` = 目标版本（rc 断言 `next`、正式版断言 `latest`），并额外断言**预发布版本不出现在 `latest`**；tarball **sha1 与 `dist.shasum` 比对**；解包 `package.json` 版本；`exports` 键集合（人工比对 13 键）。并断言**解包 tarball 内 README（中 / 英）的「当前版本」句 = 目标版本**（产物级最终防线）。另执行 `pnpm check:api-surface --baseline=<上一版解包 dist>` 比对 `.d.ts`：exit 1（删除 / 重命名）阻塞；exit 0 且列出内容变化时人工复核，命中 required 收紧按阻塞处理、纯类型变化记 warning。
7. **GitHub Release（`announce`）**：先校验本地 / 远程 `v<v>` tag 一致；**本地有 tag、远程没有时中止并提示先 `git push origin v<v>` 再重试**（不自动推送）。通过后从 `CHANGELOG.md` 抽取该版本段落作 note → `gh release create v<v> --title <v> --verify-tag`；预发布版本追加 `--prerelease`，目标 dist-tag 非 `latest` 时追加 `--latest=false`（staged release 不抢 Latest）。

> **落痕（人工，脚本未覆盖）**：发布结论与关键实测值（registry 版本 / tarball shasum / 解包与冒烟结果 / GitHub Release）应落到可提交位置（发布执行治理记录或提交信息）。

> **推送**：`git push origin master --follow-tags`（`--follow-tags` **只推送 annotated tag**；若用轻量 tag 须显式 `git push origin v0.1.0`）。按 [Git 规范](/standards/git) 须用户明确授权，**脚本不自动推送**；`announce` 检测到本地 tag 未推送时会中止并给出上述命令，推送后重试 `announce` 即可。

### 3.4 提交构成与发布元数据豁免（重要）

一次发布产生 **3 次提交**（major 版另有第 4 次里程碑提交），其中**前两次与 major 版里程碑提交命中** `check-review-gate-artifacts` 的**发布元数据豁免**（否则发布提交会被 Review Gate 工件守卫阻断）——非 major 为 2 次、major 为 3 次：`chore(release)` 走 `VERSION_METADATA_FILES` 的版本行规则，两次 `docs(changelog)` 走 `GENERATED_RELEASE_FILES`（当前仅 `CHANGELOG.md`）。`sync` 提交不豁免，提交前须已有新鲜 Review Gate 工件：

| 提交 | 内容 | 发布元数据豁免 |
|:---|:---|:---:|
| `chore(release): <v>` | 仅 `package.json` 的版本行 | ✅ |
| `docs(changelog): <v>` | 仅 `CHANGELOG.md` | ✅ |
| `docs(changelog): 补充 <v> 里程碑段` | 仅 `CHANGELOG.md`（major 版人工里程碑段，见 §3.3 第 3 步） | ✅ |
| `docs(release): sync version statements to <v>` | README（中英）+ `docs/plan/roadmap.md` 的版本句（在 `publish` **之前**提交，版本句才随 tarball 发布） | ❌ **不豁免** |

> 豁免要求范围**等于全量暂存集**且每项状态为 `M`、版本清单 diff 增删行**全部**为 `"version": "…"` 形态；与任何其它文件同批即失去豁免。故执行 `sync` 提交前**须已有新鲜 Review Gate 工件**。

> **关于 `npm version`（本地发布的常见做法）**：`npm version <v>` 会**直接提交并打 annotated tag**——提交信息为裸版本号（非 Conventional 形态），`pnpm changelog` 提交在其后；这是**正常流程**（2026-09-30 用户口径），其 tag 指向版本提交、tag 视图不含 CHANGELOG 段，按第 2 步口径**不视为偏差、无需重指 tag**。若要改为按本节 2 ~ 4 步自行提交与打 tag，加 `--no-git-tag-version`（该开关同时关闭自动提交与打 tag）。**无论采用哪种方式，版本基线提交前都须复跑 `pnpm verify` 并留痕。**

### 3.5 发版后的文档同步边界

站点内展示的版本号由 `themeConfig.version` 从 `package.json` **自动派生**（页面用 `useData()` 的 `theme.version` 插值，由 `pnpm docs:check:version` 看守），发版时**无需手改站点文档**；但仓库根 `README.md` / `README.en-US.md`（GitHub / npm 渲染，无插值能力）与 `docs/plan/roadmap.md` 的版本表述仍需同步——由 `sync` 步骤按「当前版本」句式锚点自动完成（`scripts/shared/version-statements.mjs` 为唯一事实源），且必须在 `publish` 之前完成，版本句才会随 tarball 一起发布。

### 3.6 CHANGELOG 生成口径

`pnpm changelog`（`scripts/release/generate-changelog.mjs`）基于 `conventional-changelog` 与 `conventional-changelog-cmyr-config` 预设生成 / 重写 `CHANGELOG.md`；分组标题、commit 链接与模板均来自该预设（`package.json` 的 `changelog.language` 为 `zh`），生成口径与 semantic-release 一致。脚本对预设做两处定向补丁：① 预置 `headerPattern` 不识别 `type(scope)!: …`，会整条丢弃 `BREAKING CHANGE` 提交（semantic-release 走同一预设，行为相同），补 `!?` 后恢复；② 本仓提交正文含 Vue 插槽名（`#option`）与十六进制色值（`#60a5fa`），会被 GitHub 的 issue 前缀规则误判为引用，故关闭引用抽取。已知残留：预设 writer 仍会把**提交标题**中的 `#<数字>` 渲染为 issue 链接（当前历史 0 命中，出现时需补丁或改用其他标题写法）。指定 `--version=` 时脚本会剥离**空**的 `# Unreleased` 段（同名 tag 已存在时重生成不会再产生「Unreleased + 目标版本」双标题）；有内容的 Unreleased 段（尚未发布的提交）保持原样。依赖 `conventional-changelog@7.2.0` 与 `conventional-changelog-cmyr-config@3.0.0` 精确钉定：预设的字符串模板配套 `conventional-changelog-writer@8`，升到内置 writer@9 的 `conventional-changelog@8` 会在运行期抛 `headerPartial is not a function`。

## 4. 凭据与本地运行

- 本地运行 semantic-release 需 `--no-ci`（跳过 CI 环境校验），并设置 `NPM_TOKEN` 与 `GH_TOKEN`。
- **本阶段首发使用 `npm publish`**（见 §3）；本地 semantic-release 仅作机制说明与后续备选——它会额外触发 `@semantic-release/git`（提交 `package.json` / `CHANGELOG.md`）与 `@semantic-release/github`（创建 GitHub Release），与「本地手动发布」的当前决策不同，未经决策不要执行 `pnpm release`。
- **registry 必须是 npmjs**：本机全局 `registry` 可能指向 `registry.npmmirror.com`（只读镜像，`npm whoami` 会 `ENEEDAUTH`、`npm publish` 不可用）。发布前显式 `export NPM_CONFIG_REGISTRY=https://registry.npmjs.org`，并用 `npm whoami` 确认账号；`~/.npmrc` 中的 `//registry.npmjs.org/:_authToken` 失效时会返回 `401`，需重新登录或换 token。
- 本地 npm 凭据须有效（`npm whoami` 可验证）；凭据失效时 `npm publish` 会返回 `401`（`ENEEDAUTH` / `E401`）。启用 2FA 时用 `--otp=<code>` 传入一次性密码；脚本在日志与错误信息中对 OTP 做脱敏。注意 OTP 仍会进入进程参数与 Shell history，优先在受控环境使用，或省略 `--otp` 让 npm 交互提示。
- **版本已发布过**时 `npm publish` 会以 `403`（`You cannot publish over the previously published versions: <version>`）失败——npm 不允许覆盖同名版本。处理：确认 `package.json` 的 `version` 是否已递增；确需修复已发布版本时**改发新 patch 版本**（不要尝试 unpublish，见 §8）。
- `prepublishOnly` 失败（如许可声明过期）会中止发布且不产生 tarball——按报错补齐后重跑即可，无需处理 registry 状态。
- 当前为本地手动发布，npm 发布侧无需 CI secret；但安全告警巡检由 `Security Alerts` workflow 使用 `SECURITY_ALERTS_TOKEN`（见[安全规范 §2.1](/standards/security#_2-1-发布前安全告警门禁)），该 secret 仍须配置。

## 5. CI 自动发布（暂缓）

- `.github/workflows/release.yml` 保持「仅执行 `pnpm verify`」，发布步骤注释保留、不放开。
- 后续启用条件：配置 `NPM_TOKEN` secret，或使用 npm **Trusted Publisher（OIDC）**，再放开发布步骤。
- **1.0 决策**：1.0 的 rc 与正式版均按本地手动发布执行；rc 走 `next`、正式版走 `latest`（`--tag` 已落地，见 §1 / §3）；提交驱动的自动发布在 1.0 后单独立项，本阶段不放开发布步骤。

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
- **受检清单（接入即登记）**：登记于工作流的 `matrix`——**已在受检面**即已在 `matrix` 登记。
  - **已在受检面**：`dependfix`（`apps/platform`，试点）。
  - **已消费但未接入**（待增量登记）：`momei`（根包）——**单条阻塞**：`momei` 的 `build`（`NODE_OPTIONS=--max-old-space-size=6144 nuxt build`）在上游 runner 的**无凭据可行性未验证**（`typecheck` = `nuxt typecheck` 相对轻量；`pnpm --filter <name>` 可**按根包名选中根工程**，现有 override 步骤无需参数化）。触发条件 = 该验证通过，或用户指定。
  - **路线图目标下游但当前零消费**：`caomei-auth` / `rss-impact-next` / `afdian-linker`——接入后增量登记。
- **触发与容量**：caomei-ui **发布 tag（`v*`）触发 1 次**（另可手动）；检查范围最低 `typecheck` + `build`，**不含** e2e / 视觉回归 / 全量单测 / 覆盖率。**下游默认分支为移动目标**：工作流记录下游 revision（SHA）以便归因——红可能是下游自身改动所致，非 caomei-ui 回归。**刚发布版本的安装**：下游可能启用 pnpm 11 的 `minimumReleaseAge`，会拒绝「过新」的版本。两层处理：① `Override caomei-ui to target version` 步骤以 `--config.minimumReleaseAge=0` 安装刚发布版本（只作用于该条 `pnpm add`）；② override 写入 lockfile 后，build chain 的隐式 install 仍需 `pnpm_config_minimum_release_age=0`（由 override 步骤末尾写入 `$GITHUB_ENV`，pnpm 11 不读 `npm_config_*`），并由 `Assert minimumReleaseAge override` 断言配置已解析。初次 `pnpm i --frozen-lockfile` 仍走默认门槛，防护未削弱。详见同节「归属与现状」。
- **归属与现状**：本机制为[路线图 Phase 8](/plan/roadmap)；工作流**已就绪并经三次真实触发验证**——run #1（2026-10-12，registry latest `0.6.0`，`dependfix @ 46c6fb61`，见 `docs/design/governance/2026-10-12-phase22-m1-1-downstream-compat-first-run.md`）、**run #2（2026-10-13，显式版本入参 `0.5.0`，与下游锁定版本构成**版本差**，`dependfix @ edbe5e04…`，见 `docs/design/governance/2026-10-13-phase23-m2-1-downstream-compat-explicit-version-run.md`）** 与 **run #3（2026-10-13 UTC / 本地 2026-10-14，**负向对照**：显式入参 `0.2.0` 的已知不兼容版本 → `Typecheck downstream` **红**，`dependfix @ 1a6aca15…`，见 `docs/design/governance/2026-10-14-phase24-m1-2-downstream-compat-negative-control.md`）**。**run #4（2026-10-20，tag `v0.7.0`）** 在 `Override caomei-ui to target version` 被下游 pnpm 11 `minimumReleaseAge` 拒绝（版本刚发布 10 分钟），属发布年龄门槛而非兼容性回归。**run #5（2026-10-30，tag `v1.0.0-rc.1`，`41023344064`）** 暴露上一轮修复不完整：override 步骤自身带 `--config.minimumReleaseAge=0`，但 override 会把刚发布的 rc 写入下游 lockfile，后续 `Setup downstream build chain` 的隐式 `pnpm install` 重新校验后再次被拒（同一门槛，非兼容性回归）。现改为：override 后通过 `$GITHUB_ENV` 设 `pnpm_config_minimum_release_age=0`（**pnpm 11 不读取 `npm_config_*`**），并用 `pnpm config get minimumReleaseAge` 断言生效；初次 `pnpm i --frozen-lockfile` 仍走默认门槛，防护未削弱。修复后待复验。
- **判别力口径（避免把「绿 run」读成「兼容性已验证」）**：**管道贯通**（运行时无缺陷 / 可归因）与**重装生效**（override 确实换了版本）**已成立**；**回归判别力**（区分「新版本破坏下游」与「不破坏」）**已由负向对照路径成立**——run #3 安装已知不兼容的 `0.2.0` 后期望红、实际红，失败面 6 条 TS 诊断逐条归因到 `0.3.0` 才补齐的 `DataTable` 多列排序 / 行分组 / 行展开能力面。**正向方向仍待验证**：run #4 已走到版本覆盖但被 `minimumReleaseAge` 中止，尚未进入 `typecheck` / `build`；下一次 tag 触发将验证正向方向。启动范围与形态见 Phase 8 启动范围评估记录（`docs/design/governance/2026-10-08-phase8-downstream-regression-scope-evaluation.md`）。

## 11. 相关文档

- [Git 规范](/standards/git)
- [架构设计 - 发布链路](/design/architecture#_7-发布链路)
- [路线图](/plan/roadmap)
