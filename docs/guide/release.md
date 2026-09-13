# 发布指南

## 发布工具

使用 **semantic-release**，依据 Conventional Commits 自动推断版本并发布。

> 不使用 changesets（本项目为单包，semantic-release 是标准场景）。

> **当前状态**：`release.yml` 已就位，但发布步骤尚未启用；待配置 npm 凭据（`NPM_TOKEN` 或 npm Trusted Publisher / OIDC）后再放开。

## 版本推断

| 提交类型 | 版本变化 |
|----------|----------|
| `fix` | patch |
| `feat` | minor |
| `BREAKING CHANGE` / `!` | major |
| `docs` / `chore` / `test` / `ci` / `refactor` | 不产生版本（除非配置） |

## 发布流程

1. 提交遵循 Conventional Commits（经 `conventional-committer` skill）。
2. push 到 `master` 后触发 `release.yml` 的 semantic-release（发布步骤当前未启用）。
3. 启用后自动执行：
   - 推断版本号；
   - 生成/更新 `CHANGELOG.md`；
   - 发布 npm 包 `caomei-ui`；
   - 创建 GitHub Release 与 tag。

## 发布前检查

- 全部质量门通过（lint / typecheck / test / build）。
- 构建产物冒烟：确认 ESM、类型声明、CSS 与子路径导出可用。
- 公共 API 变更确认向后兼容或已规划 major。
- 文档站构建通过。

## 下游兼容性回归（延迟启用）

当一个组件库改动可能影响下游项目时，应同步跑一遍已接入下游项目的 CI，验证是否存在兼容性问题。

**启用条件**（三者同时满足）：

1. caomei-ui 功能基本可用；
2. 已接入至少一个下游项目；
3. 稳定使用一段时间后，出现新的组件库改动。

**回归范围**：已接入的下游项目（dependfix/platform、caomei-auth、rss-impact-next、momei、afdian-linker），至少覆盖其 typecheck 与 build。

**执行建议**：

- patch 变更跑关键下游；minor / major 跑全部已接入下游。
- 通过跨仓库机制（`repository_dispatch` 或 reusable workflow）触发。
- 任一 typecheck / build 失败即视为兼容性阻塞，不得直接发布；按语义化版本决定修组件库还是下游适配。

> 本机制不阻塞立项与初期迁移，作为独立阶段（路线图 Phase 7）在稳定后落地。

## 相关文档

- [Git 规范](/standards/git)
- [架构设计 - 发布链路](/design/architecture#7-发布链路)
- [路线图](/plan/roadmap)
