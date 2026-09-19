# 发布指南

## 1. 发布方式与当前状态

- 版本推断与发布工具为 **semantic-release**，依据 Conventional Commits 自动推断版本并发布。
- **当前决策（Phase 5 第二阶段，2026-09-19 授权启动）**：首版停在 **0.x**；采用**本地手动发布**；**暂不启动 CI 自动发布流程**。

> 不使用 changesets（本项目为单包，semantic-release 是标准场景）。

## 2. 为什么 0.x 首版要手工发布

- semantic-release 的首版**恒为 `1.0.0`**（内置常量 `FIRST_RELEASE`，且**没有** `initialVersion` 选项），无法直接产出 0.x。
- 停在 0.x 的做法：**手工发布首个 0.x 版本并建立基线 tag**（如 `v0.1.0`）。此后 semantic-release 以该 tag 为基线，按 Conventional Commits 在 0.x 递增（`fix` → `0.1.1`，`feat` → `0.2.0`）。
- 注意：一旦出现 `BREAKING CHANGE` / `!`，semantic-release 仍会直接升到 `1.0.0`；是否进入 1.0.0 须单独决策。

## 3. 首个版本发布流程（0.1.0）

1. **预检**：工作区干净；`master` 与 `origin/master` 同步；`pnpm verify` 全链路通过。
2. **版本基线与发布说明**：把 `package.json` 的 `version` 置为 `0.1.0`；落 `CHANGELOG.md` 首版条目。
3. **提交**：版本基线变更后复跑 `pnpm verify`，再经 `conventional-committer` 提交（例如 `chore(release): 0.1.0`）。
4. **打 tag**：`git tag -a v0.1.0 -m "0.1.0"`（**annotated** tag，与 semantic-release 默认 tag 格式 `v${version}` 对齐，作为后续自动发布的基线）。
5. **发布**：配置有效 npm 凭据后执行 `npm publish`；`prepublishOnly` 会自动复跑许可校验。
6. **推送**：`git push origin master --follow-tags`（`--follow-tags` **只推送 annotated tag**；若用轻量 tag 须显式 `git push origin v0.1.0`）。按 [Git 规范](/standards/git) 须用户明确授权，不自动 push。
7. **校验**：`npm view caomei-ui versions dist-tags`；`npm pack caomei-ui --dry-run` 或安装到临时目录做冒烟。
8. **记录**：把发布结论与关键实测值落到可提交位置（规划文档或提交信息）。

## 4. 凭据与本地运行

- 本地运行 semantic-release 需 `--no-ci`（跳过 CI 环境校验），并设置 `NPM_TOKEN` 与 `GH_TOKEN`。
- **本阶段首发使用 `npm publish`**（见 §3）；本地 semantic-release 仅作机制说明与后续备选——它会额外触发 `@semantic-release/git`（提交 `package.json` / `CHANGELOG.md`）与 `@semantic-release/github`（创建 GitHub Release），与「本地手动发布」的当前决策不同，未经决策不要执行 `pnpm release`。
- 本地 npm 凭据须有效（`npm whoami` 可验证）；凭据失效时 `npm publish` 会返回 `401`。
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

- 运行时依赖（`reka-ui` / `@tanstack/vue-table` / `@lucide/vue`）与 peer 依赖 `vue` 的许可证统一声明在仓库根 `THIRD-PARTY-LICENSES`，并随 npm 包分发（已加入 `package.json` 的 `files`）。
- 新增或升级运行时依赖后，运行 `pnpm check:licenses` 校验声明覆盖与版本一致；该检查已纳入 `pnpm verify`（`governance:check`）。
- 同步更新声明：新增依赖时补充 `## <name>@<version>` 条目，升级版本时同步条目标题与许可证全文（可从 `node_modules/<pkg>/LICENSE` 复制）。
- `prepublishOnly` 会在发布前自动执行同一校验，声明缺失或不一致将中止发布。

## 8. 回滚与弃用

- 标记问题版本：`npm deprecate caomei-ui@<version> "<reason>"`。
- npm 的 `unpublish` 受发布时长（一般 72 小时）、依赖方数量、下载量与所有权等政策约束，且可能被拒绝；超期或已被广泛安装时**不建议** unpublish，改用 deprecate + 修复后 patch。
- 已发布的 git tag 不重写，修复以新版本提交。

## 9. 包形态与兼容性

- 单包 ESM：`package.json` 为 `"type": "module"`，`exports` 仅提供 `import` 条件，无 `require` 入口；下游按 ESM 使用（Nuxt 4 / Vite 场景）。
- 子路径导出：`caomei-ui`、`caomei-ui/styles.css`、`caomei-ui/resolver`、`caomei-ui/nuxt`。
- `files` 仅分发 `dist` 与 `THIRD-PARTY-LICENSES`；发布前以 `check:build` 确认产物齐全。

## 10. 下游兼容性回归（后置）

- 按 Phase 5 第二阶段决策（2026-09-19），**下游接入验证后置**为发布后由下游实际迁移反馈驱动，本阶段不作为发布准入。
- 启用条件（三者同时满足）：组件库功能基本可用、已接入至少一个下游、稳定使用一段时间后出现新的组件库改动。
- 回归范围：已接入下游（dependfix/platform、caomei-auth、rss-impact-next、momei、afdian-linker），至少覆盖 typecheck 与 build。
- 通过跨仓库机制（`repository_dispatch` 或 reusable workflow）触发；任一 typecheck / build 失败视为兼容性阻塞。本机制归属[路线图 Phase 8](/plan/roadmap)。

## 11. 相关文档

- [Git 规范](/standards/git)
- [架构设计 - 发布链路](/design/architecture#_7-发布链路)
- [路线图](/plan/roadmap)
