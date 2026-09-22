<script setup>
import { useData } from 'vitepress'

const { theme } = useData()
</script>

# 版本与兼容策略

当前最新版本：**v{{ theme.version }}**

## 获取渠道

- **npm**：`pnpm add caomei-ui`（或 `npm i caomei-ui`），registry 页：[npmjs.com/package/caomei-ui](https://www.npmjs.com/package/caomei-ui)。
- **GitHub Releases**：[CaoMeiYouRen/caomei-ui releases](https://github.com/CaoMeiYouRen/caomei-ui/releases)（含版本说明与 tag）。
- **变更记录**：[CHANGELOG](https://github.com/CaoMeiYouRen/caomei-ui/blob/master/CHANGELOG.md)——破坏性变更在 `BREAKING CHANGES` 段单列，形态与适配说明见[发布指南](./release.md) §9。

## 0.x 兼容策略

- 0.x 阶段**不承诺**语义化版本的兼容性：`minor` 版本可能包含破坏性变更（例如样式入口由 `caomei-ui/styles.css` 改为 `caomei-ui/theme.css`，产物不再提供单体全量样式）。
- 破坏性变更一律在 CHANGELOG 的 `BREAKING CHANGES` 段与[发布指南](./release.md)中披露，并给出下游修复指引；进入 1.0 的时机须单独决策。
- `patch` 版本只包含修复与不改变公开契约的内部调整。

## 下游 pin 建议

- 需要稳定基线时**锁定精确版本**（在 `package.json` 中写 `"caomei-ui": "<目标版本>"`，不带 `^` / `~`），升级前先阅读目标版本的 `BREAKING CHANGES`。
- 仅在已确认兼容的前提下使用范围依赖（`~` / `^`）；组件库以 Vue 3.5+ 作为 peer 依赖，需由项目自行安装。
- 升级后至少复跑下游的 `typecheck` 与 `build`；跨版本迁移的下游回归机制见[路线图](../plan/roadmap.md)。
