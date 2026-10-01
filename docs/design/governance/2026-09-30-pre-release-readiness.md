# 发布前预备检查：下一版本就绪度评估

> 创建时间：2026-09-30
> 触发：用户指令「开始发布前预备检查」（非阶段条目；当前无进行中阶段）
> 快照：本仓 HEAD `29a7693`（工作区干净）、`package.json` version **0.4.0**、registry `latest = 0.4.0`、`origin/master` = `e2f2793`
> 发布前门槛复核：[长期任务](../../plan/recurring.md) §3 **第 19 轮**（同日执行并留痕）
> 口径：**本轮只做预备检查**——不 bump 版本、不生成 CHANGELOG、不打 tag、不 publish、不 push。

---

## 1. 结论

- **库侧就绪**：质量门、产物、许可声明、文档链路、样式等价与浏览器回归全部通过（§3）。
- **发布执行前有 2 项外部前置**（均需用户动作 / 授权）：
  1. **发布凭据失效**——`npm whoami` 返回 `ENEEDAUTH`（`need auth`），须先在本机 `npm login` 后才能 `npm publish`；
  2. **远端与本地不同步**——本地领先 `origin/master` **27** 提交，且**远端 0 个 tag**（`v0.1.0` ~ `v0.4.0` 均仅本地），推送须用户明确授权（[Git 规范](../../standards/git.md)）。
- **待用户决策**：目标版本号。按 [发布指南 §6](../../guide/release.md) 的推断规则，`v0.4.0..29a7693` 含 `feat` → **minor → 0.5.0**（无 `BREAKING` 形态，不触发 major）。

## 2. 发布面取证（版本推断）

- 范围 `v0.4.0..29a7693` = **35** 提交；按类型：`feat` **7** / `fix` **2** / `build` **1** / `test` **1** / `docs` **24**。复算命令：`git log --pretty=%s v0.4.0..29a7693 | sed 's/(.*//' | sort | uniq -c | sort -rn`。
- 破坏性变更检索（三条口径均 0 命中）：`git log --grep=BREAKING v0.4.0..29a7693 | wc -l` → 0；`git log --pretty=%B v0.4.0..29a7693 | grep -c "BREAKING CHANGE"` → 0；`git log --pretty=%s v0.4.0..29a7693 | grep -c "!:"` → 0。
- 发布面里的 `feat` / `fix` / `build` 逐条穷举（10 条），并标注作用面：

| 提交 | 类型 | 作用面 | 能力 |
| :--- | :--- | :--- | :--- |
| `023e30c` | feat | 消费方 | 新增 `CaomeiRichTextEditor` 富文本封装（可选 peer `md-editor-v3`） |
| `46b8f12` | feat | 消费方 | 新增 `richTextEditor` 文案命名空间（5 语种） |
| `50c1f0e` | feat | 消费方 | 新增极简具名预设 `minimal`（未指定 `data-preset` 时即缺省） |
| `25f79fa` | feat(docs) | 文档站 | 组件画廊进侧栏、RichTextEditor 独立分组、画廊卡片对齐修复 |
| `0378fd4` | feat(governance) | 治理 | 新增类名前缀拼写守卫 `check:class-prefix` |
| `1c26cd3` | feat(governance) | 治理 | 新增 docs 取证命令 revision 钉定守卫 `check:docs-git-revision` |
| `17ff31f` | feat(governance) | 治理 | 新增浮层档位语义门禁 `check:overlay-z-index` |
| `79e4ef9` | fix(components) | 消费方 | 修正模态内浮层层级（Select / MultiSelect / AutoComplete / ColorPicker） |
| `bca8db8` | fix(docs) | 文档站 | 修正版本策略页版本口径并补两条弱守卫 |
| `0d5eb2f` | build(deps) | 消费方 | 接入 `@vavt/cm-extension`（运行期依赖）与 `md-editor-v3`（可选 peer） |

> 余下 24 条 `docs` 与 1 条 `test`（`29c4076`）按 [发布指南 §6](../../guide/release.md) 不产生版本语义，故不逐条列出。

- **下游影响面判定**：① 新增**可选** peer `md-editor-v3`——不使用 `CaomeiRichTextEditor` 的下游既不安装也不受影响（[快速上手](/guide/getting-started)口径）；② `minimal` 预设为**具名化 + 缺省化**，缺省路径 token 声明体逐字未动（**零视觉漂移**，Phase 17 M1-1 已验证）；③ 模态内浮层修复对下游为缺陷修复；④ 本次**无**包形态变更（`exports` 5 键与 0.4.0 一致，`check:build` 复核 8 个产物文件）。

## 3. 就绪检查表

| # | 检查项 | 命令 / 口径 | 实测 | 结论 |
| :--- | :--- | :--- | :--- | :--- |
| 1 | 工作区状态 | `git status --short` | 空（改动前） | ✅ |
| 2 | 上游同步 | `git rev-list --count origin/master..29a7693`；`git ls-remote --tags origin \| wc -l` | **27** 领先 / 远端 tag **0** | ⚠️ 待授权推送 |
| 3 | 全链路质量门 | `pnpm verify` | **exit 0**（102 文件 / **2126** 例；lint / lint:css / lint:md / typecheck / typecheck:docs / test / build / check:build / check:resolver / check:nuxt / docs:build / docs:check:i18n-routing / governance:check 全绿） | ✅ |
| 4 | 样式等价回归 | `pnpm capture:styles` | **245 项 0 差异**（对冻结基线） | ✅ |
| 5 | 无障碍 | `pnpm test:a11y` | **59 passed** | ✅ |
| 6 | 浏览器回归 | `pnpm test:e2e --workers=2` | **114 passed**（1.1m） | ✅ |
| 7 | 产物完整性 | `check:build` | 8 个 exports 产物齐全，`index` / `resolver` / `nuxt` 入口可加载 | ✅ |
| 8 | Nuxt / resolver 冒烟 | `check:nuxt` / `check:resolver` | 最小 Nuxt 4 应用自动导入 / 样式注入 / 主题暗色 / SSR 正常；resolver 注入生效 | ✅ |
| 9 | 许可声明 | `check:licenses` | 第三方许可覆盖全部运行时依赖（含新增 `@vavt/cm-extension@2.0.0` 与可选 peer `md-editor-v3@7.1.0`，条目见 `THIRD-PARTY-LICENSES`） | ✅ |
| 10 | 包形态预演 | `npm pack --dry-run`（version 仍为 0.4.0） | **358** 文件 / 195.0 kB packed / 858.4 kB unpacked；含 `THIRD-PARTY-LICENSES`（22.6 kB）与 `dist/styles/index.css`（9.5 kB） | ✅ |
| 11 | 文档链路 | `docs:check` 11 段（verify 内） | integrity 284 md / links 286 md / structure 245 页 + 侧栏 7 组 48 条目 / config-links 157 条 / parity 60 对 / version 5 展示面 / interpolation 245 md / example-refs 245 md·382 引用 / showcase 14 项 / line-count / i18n | ✅ |
| 12 | 治理账实一致 | `check:governance-records` 等 | 93 记录与索引一致 / 283 md 指针无失效；locale 27 命名空间 × 78 条 × 5 语种 | ✅ |
| 13 | registry 状态 | `npm view caomei-ui version dist-tags` | `version = 0.4.0`、`latest = 0.4.0`（目标版本未被占用） | ✅ |
| 14 | 发布凭据 | `npm whoami` | `npm error code ENEEDAUTH` | ⛔ 待用户 `npm login` |

> **计数口径**：§3 #11 / #12 的文档与治理类计数取自**本记录落盘后的受检面**（含本记录自身；`git ls-tree -r 29a7693` 口径下为 283 / 285 / 244 / 92 / 282，即不含本记录）。两者相差 1 属快照边界，非漂移。

## 4. 已在册、需在发布批次一并处置的事项

- **已修复未发布的缺陷**：0.4.0（`latest`）仍含「模态内浮层被遮挡」，修复在 `79e4ef9`（未发布）。发布后须同步 [待办事项](../../plan/todo.md) 中「已发布版本的缺陷状态」一行（当前写「下游需 **0.4.1 及以后版本**才能获得修复」）。
- **版本号展示面同步（发布后）**：站点内版本由 `themeConfig.version` 从 `package.json` 派生、**无需手改**；但仓库根 `README.md`（2 处「当前版本」句）/ `README.en-US.md`（1 处）/ `docs/plan/roadmap.md` §1 的 `` `latest` = `` 句须与新版本一致——`docs:check:version` 规则 7 会在版本号变更后立即失败，属**有意**的防漂移设计。
- **CHANGELOG 生成器已知边界**（[Backlog §1.6](../../plan/backlog.md) 在册）：无未发布提交时可能输出空 `# Unreleased` 段；当前 `CHANGELOG.md` 顶部无该段（0.4.0 段在首位），生成后须目视核对。
- **下游升级护航**（[Backlog §1.8](../../plan/backlog.md) 在册，条件候选）：下游（dependfix `apps/platform` / momei）均锁 `0.3.0`（**跨仓值引自既有治理记录，本轮未跨仓复核**）；本仓 0.4.0 已发布但零下游消费，本次发布进一步拉开代差——升级指引按候选的触发条件（某下游启动升级时）产出，不阻塞本次发布。

## 5. 发布执行清单（本轮**未执行**，按 [发布指南 §3](../../guide/release.md)）

1. 用户裁定目标版本号（推断 `0.5.0`）。
2. （授权后）同步远端：`git push origin master`；如需先在远端补齐既有基线 tag（远端当前 0 tag，缺失会阻断后续 semantic-release 使用），另行 `git push origin --follow-tags`。
3. 版本基线：`package.json` bump → **复跑 `pnpm verify`** → `pnpm changelog` → 再复跑 `pnpm verify` → 经 `conventional-committer` 提交（`chore(release): <version>` 形态）。
4. annotated tag：`git tag -a v<version> -m "<version>"`，**指向 CHANGELOG 提交**（0.3.0 的「tag 不含 CHANGELOG 段」偏差已在 0.4.0 修正）。
5. 发布：`npm login` 后 `npm publish`（`prepublishOnly` 自动复跑许可校验）。
6. （授权后）推送代码与**新 tag**：`git push origin master --follow-tags`——按 [发布指南 §3 步骤 6](../../guide/release.md) 该步在 `npm publish` **之后**，漏做则 `v<version>` 仅存本地。
7. 发布后校验：`npm view caomei-ui version dist-tags` + registry tarball shasum / 解包冒烟（复用 `scripts/release/smoke-runtime.mjs` + `register-css-stub.mjs`）。
8. 发布后文档同步：README（中英）/ `roadmap` §1 / `todo.md`；产出发布执行治理记录并登记索引。

## 6. 边界与未覆盖

- 本轮**未执行任何发布动作**（无 bump / 无 changelog 生成 / 无 tag / 无 publish / 无 push；属间接判定——本地 tag 仅 `v0.1.0` ~ `v0.4.0`、registry `latest` 仍为 0.4.0、无新增发布提交）；`pnpm changelog` 有意未试跑——其输出绑定 `package.json` 的版本号，在版本裁定前试跑会重写 0.4.0 段。
- 下游兼容性回归（[发布指南 §10](../../guide/release.md) / Phase 8）未启动，按既定决策不作为发布准入。
- 未复跑 `check:coverage`（不在 `verify` 链；本次零 `src/**` 改动，覆盖率面不构成发布风险）。
- 检查项 3 ~ 6 的浏览器类证据在本容器以 Chromium（`--single-process` 等参数）取得，与既有批次的运行条件一致。
