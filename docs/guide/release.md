# 发布指南

## 1. 发布方式与当前状态

- 版本推断与发布工具为 **semantic-release**，依据 Conventional Commits 自动推断版本并发布。
- **当前决策（Phase 5 第二阶段，2026-09-19 授权启动）**：首版停在 **0.x**；采用**本地手动发布**；**暂不启动 CI 自动发布流程**。

> 不使用 changesets（本项目为单包，semantic-release 是标准场景）。

## 2. 为什么 0.x 首版要手工发布

- semantic-release 的首版**恒为 `1.0.0`**（内置常量 `FIRST_RELEASE`，且**没有** `initialVersion` 选项），无法直接产出 0.x。
- 停在 0.x 的做法：**手工发布首个 0.x 版本并建立基线 tag**（如 `v0.1.0`）。此后 semantic-release 以该 tag 为基线，按 Conventional Commits 在 0.x 递增（`fix` → `0.1.1`，`feat` → `0.2.0`）。
- 注意：一旦出现 `BREAKING CHANGE` / `!`，semantic-release 仍会直接升到 `1.0.0`；是否进入 1.0.0 须单独决策。

## 3. 发布流程（本地手动）

> **单入口编排**：`pnpm release:manual <step> --version=<v>`（脚本 `scripts/release/manual-release.mjs`）把本节流程串成一条可复算链路，消除「命令分散 / 隐式前置 / 后置文档同步易漏 / GitHub Release 手工」四类易错点。
> 变更型步骤（`bump` / `changelog` / `publish` / `sync` / `announce`）**必须显式 `--yes`**，否则以 `--dry-run` 预览。

### 3.1 一键执行（推荐）

```bash
pnpm release:manual run --version=0.7.0 [--date=YYYY-MM-DD] [--yes]
```

`run` 依序执行 7 步：`preflight → bump → changelog → publish → verify → sync → announce`。

### 3.2 分步执行（可复算 / 失败恢复）

```bash
pnpm release:manual preflight --version=0.7.0
pnpm release:manual bump      --version=0.7.0 --yes
pnpm release:manual changelog --version=0.7.0 --yes
pnpm release:manual publish   --version=0.7.0 --yes
pnpm release:manual verify    --version=0.7.0
pnpm release:manual sync      --version=0.7.0 --yes
pnpm release:manual announce  --version=0.7.0 --yes
```

### 3.3 各步骤口径（runbook）

1. **预检（`preflight`）**：工作区干净；分支为 `master`；`pnpm verify` 全链路通过；目标版本尚未发布（`npm view`）；npm 凭据可用（`npm whoami`）；提示「长期任务门槛复核轮已执行并留痕」（发布前触发义务）。领先 `origin/master` 的提交会提示先推送。
2. **版本基线（`bump`）**：只改 `package.json` 的版本行（保持格式与末尾换行）→ 提交 `chore(release): <v>` → 打 **annotated** tag `v<v>`（与 semantic-release 默认 tag 格式 `v${version}` 对齐，作为后续自动发布的基线）。
   **tag 落点**：tag 指向版本提交，`CHANGELOG` 提交在其后——**tag 视图不含 CHANGELOG 段属正常形态**（CHANGELOG 是仓库内产物，不要求出现在 tag 视图里）；**已发布 tag 不重写**（见 §8「回滚与弃用」）。
3. **发布说明（`changelog`）**：`pnpm changelog`（`scripts/release/generate-changelog.mjs`）生成 / 重写 `CHANGELOG.md` → 单独提交。（`--version=` / `--date=` 仅对**直接运行** `pnpm changelog` 生效：`--version=` 用于尚未 bump `package.json` 时，`--date=` 固定发布日期；脚本路径恒传 `--version=<v>`。）
4. **发布（`publish`）**：`npm publish`；`prepublishOnly` 自动复跑许可校验（见 §7）。
5. **后校验（`verify`）**：registry `latest` = 目标版本；tarball **sha1 与 `dist.shasum` 比对**；解包 `package.json` 版本；`exports` 键集合。
6. **文档同步（`sync`）**：更新仓库根 README（中 2 处 / 英 1 处）与 `docs/plan/roadmap.md` 的「当前版本」句 → **守卫前置**（先跑 `pnpm docs:check:version`，失败即不落提交）→ 单独提交 `docs(release): sync version statements to <v>`。
7. **GitHub Release（`announce`）**：从 `CHANGELOG.md` 抽取该版本段落作 note → `gh release create v<v> --title <v> --verify-tag`。

> **落痕（人工，脚本未覆盖）**：发布结论与关键实测值（registry 版本 / tarball shasum / 解包与冒烟结果 / GitHub Release）应落到可提交位置（发布执行治理记录或提交信息）。

> **推送**：`git push origin master --follow-tags`（`--follow-tags` **只推送 annotated tag**；若用轻量 tag 须显式 `git push origin v0.1.0`）。按 [Git 规范](/standards/git) 须用户明确授权，**脚本不自动推送**。

### 3.4 提交构成与发布元数据豁免（重要）

一次发布产生 **3 次提交**，其中只有前两次命中 `check-review-gate-artifacts` 的**发布元数据豁免**（否则发布提交会被 Review Gate 工件守卫阻断）：

| 提交 | 内容 | 发布元数据豁免 |
|:---|:---|:---:|
| `chore(release): <v>` | 仅 `package.json` 的版本行 | ✅ |
| `docs(changelog): <v>` | 仅 `CHANGELOG.md` | ✅ |
| `docs(release): sync version statements to <v>` | README（中英）+ `docs/plan/roadmap.md` 的版本句 | ❌ **不豁免** |

> 豁免要求范围**等于全量暂存集**且每项状态为 `M`、版本清单 diff 增删行**全部**为 `"version": "…"` 形态；与任何其它文件同批即失去豁免。故执行 `sync` 提交前**须已有新鲜 Review Gate 工件**。

> **关于 `npm version`（本地发布的常见做法）**：`npm version <v>` 会**直接提交并打 annotated tag**——提交信息为裸版本号（非 Conventional 形态），`pnpm changelog` 提交在其后；这是**正常流程**（2026-09-30 用户口径），其 tag 指向版本提交、tag 视图不含 CHANGELOG 段，按第 2 步口径**不视为偏差、无需重指 tag**。若要改为按本节 2 ~ 4 步自行提交与打 tag，加 `--no-git-tag-version`（该开关同时关闭自动提交与打 tag）。**无论采用哪种方式，版本基线提交前都须复跑 `pnpm verify` 并留痕。**

### 3.5 发版后的文档同步边界

站点内展示的版本号由 `themeConfig.version` 从 `package.json` **自动派生**（页面用 `useData()` 的 `theme.version` 插值，由 `pnpm docs:check:version` 看守），发版时**无需手改站点文档**；但仓库根 `README.md` / `README.en-US.md`（GitHub / npm 渲染，无插值能力）与 `docs/plan/roadmap.md` 的版本表述仍需同步——由 `sync` 步骤按「当前版本」句式锚点自动完成（`scripts/shared/version-statements.mjs` 为唯一事实源）。

### 3.6 CHANGELOG 生成口径

`pnpm changelog`（`scripts/release/generate-changelog.mjs`）基于 `conventional-changelog` 与 `conventional-changelog-cmyr-config` 预设生成 / 重写 `CHANGELOG.md`；分组标题、commit 链接与模板均来自该预设（`package.json` 的 `changelog.language` 为 `zh`），生成口径与 semantic-release 一致。脚本对预设做两处定向补丁：① 预置 `headerPattern` 不识别 `type(scope)!: …`，会整条丢弃 `BREAKING CHANGE` 提交（semantic-release 走同一预设，行为相同），补 `!?` 后恢复；② 本仓提交正文含 Vue 插槽名（`#option`）与十六进制色值（`#60a5fa`），会被 GitHub 的 issue 前缀规则误判为引用，故关闭引用抽取。已知残留：预设 writer 仍会把**提交标题**中的 `#<数字>` 渲染为 issue 链接（当前历史 0 命中，出现时需补丁或改用其他标题写法）。另注意：**tag 建立后不可再用同名 `--version=` 重生成该段**——与已存在 tag 同名时会触发 `Unreleased` 置换（如需修复历史发布说明，应改名或改期另发）。依赖 `conventional-changelog@7.2.0` 与 `conventional-changelog-cmyr-config@3.0.0` 精确钉定：预设的字符串模板配套 `conventional-changelog-writer@8`，升到内置 writer@9 的 `conventional-changelog@8` 会在运行期抛 `headerPartial is not a function`。

## 4. 凭据与本地运行

- 本地运行 semantic-release 需 `--no-ci`（跳过 CI 环境校验），并设置 `NPM_TOKEN` 与 `GH_TOKEN`。
- **本阶段首发使用 `npm publish`**（见 §3）；本地 semantic-release 仅作机制说明与后续备选——它会额外触发 `@semantic-release/git`（提交 `package.json` / `CHANGELOG.md`）与 `@semantic-release/github`（创建 GitHub Release），与「本地手动发布」的当前决策不同，未经决策不要执行 `pnpm release`。
- 本地 npm 凭据须有效（`npm whoami` 可验证）；凭据失效时 `npm publish` 会返回 `401`（`ENEEDAUTH` / `E401`）。
- **版本已发布过**时 `npm publish` 会以 `403`（`You cannot publish over the previously published versions: <version>`）失败——npm 不允许覆盖同名版本。处理：确认 `package.json` 的 `version` 是否已递增；确需修复已发布版本时**改发新 patch 版本**（不要尝试 unpublish，见 §8）。
- `prepublishOnly` 失败（如许可声明过期）会中止发布且不产生 tarball——按报错补齐后重跑即可，无需处理 registry 状态。
- 当前为本地手动发布，故**无需**配置 CI secret。

## 5. CI 自动发布（暂缓）

- `.github/workflows/release.yml` 保持「仅执行 `pnpm verify`」，发布步骤注释保留、不放开。
- 后续启用条件：配置 `NPM_TOKEN` secret，或使用 npm **Trusted Publisher（OIDC）**，再放开发布步骤。

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

- 标记问题版本：`npm deprecate caomei-ui@<version> "<reason>"`。
- npm 的 `unpublish` 受发布时长（一般 72 小时）、依赖方数量、下载量与所有权等政策约束，且可能被拒绝；超期或已被广泛安装时**不建议** unpublish，改用 deprecate + 修复后 patch。
- 已发布的 git tag 不重写，修复以新版本提交。

## 9. 包形态与兼容性

- 单包 ESM：`package.json` 为 `"type": "module"`，`exports` 仅提供 `import` 条件，无 `require` 入口；下游按 ESM 使用（Nuxt 4 / Vite 场景）。
- 子路径导出：`caomei-ui`、`caomei-ui/theme.css`、`caomei-ui/resolver`、`caomei-ui/nuxt`。
- `files` 仅分发 `dist` 与 `THIRD-PARTY-LICENSES`；发布前以 `check:build` 确认产物齐全。
- **0.2.0 起为破坏性形态变更**：移除 `caomei-ui/styles.css`（旧单体全量样式）子路径导出，改为 `caomei-ui/theme.css`（基础层：tokens + 暗色 + `.caomei-root` + 品牌预设）。产物不再提供单体全量样式，组件样式随模块自带（`sideEffects: ["**/*.css"]`，由打包器按需 tree-shaking）。
- **下游修复指引**：把 `import 'caomei-ui/styles.css'` 改为 `import 'caomei-ui/theme.css'`；若此前依赖单体样式覆盖全部组件，改为「显式引入 `theme.css` + 按需引入组件」。resolver 与 Nuxt 模块会自动注入基础层，**注入点须唯一**以免重复注入与覆盖丢失。
- **消费前提**：产物 JS 保留逐模块 CSS import，故**裸 Node ESM 不能直接 `import` 包根**（`ERR_UNKNOWN_FILE_EXTENSION: .css`），须经打包器（Vite / rolldown 系实测）或等效 CSS stub 加载器；本仓 `check:build` 的产物冒烟即使用 stub loader。

## 10. 下游兼容性回归

> **历史**：本机制原为后置项（2026-09-19 决策「下游接入验证后置」）；2026-10-10 随[路线图 Phase 8](/plan/roadmap) **启动**，以 dependfix 为试点。

- **机制**：对已接入下游执行跨仓库**最小兼容性检查**（`typecheck` + `build`），任一失败视为**兼容性阻塞**。
- **库侧载体**：caomei-ui 提供 reusable workflow `.github/workflows/compat-check.yml`（`on: workflow_call`，在**调用方仓库上下文**运行、**无需跨仓 token**），供下游 `uses:` 调用。
- **受检清单（接入即登记）**：以**实测消费面**为准（**已消费＝在受检面**），新下游**接入时增量登记**，接入前不属于受检面。
  - **已消费（在受检面）**：`dependfix`（`apps/platform`）、`momei`（根包）。
  - **路线图目标下游但当前零消费**：`caomei-auth` / `rss-impact-next` / `afdian-linker`——**接入后增量登记**。
- **触发与容量**：每次 caomei-ui **发布（tag）触发 1 次**；检查范围最低 `typecheck` + `build`，**不含** e2e / 视觉回归 / 全量单测 / 覆盖率。**触发方式由调用方决定**（下游 `workflow_dispatch` / 既有定时回归）——「发布即刻自动触发」需跨仓 dispatch 凭据（A 形态），**当前未启用**。
- **归属与现状**：本机制为[路线图 Phase 8](/plan/roadmap)；库侧 reusable workflow **已就绪**、**下游接入进行中**（dependfix 试点）。启动范围与触发形态见 Phase 8 启动范围评估记录（`docs/design/governance/2026-10-08-phase8-downstream-regression-scope-evaluation.md`）。

## 11. 相关文档

- [Git 规范](/standards/git)
- [架构设计 - 发布链路](/design/architecture#_7-发布链路)
- [路线图](/plan/roadmap)
