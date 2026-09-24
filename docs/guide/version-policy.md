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

## 0.x API 冻结窗口

> 起点：**当前发布版本**（页面顶部由 `theme.version` 派生展示，即 0.3.x 系列；`x` 随站点版本派生，非手写）。本声明与 dependfix 迁移评估 §12 的「上收触发条件 3」（caomei-ui 发布稳定 0.x 版本并明确 0.x API 冻结窗口）对齐。

**1.0 前不再做破坏性变更的面（冻结面）**：

- **组件公开契约**：既有组件的公开 props / events / slots 的**名称与语义**（新增可选 props / events / slots 属向后兼容增量，不算破坏）。
- **子路径导出**：`caomei-ui`、`caomei-ui/theme.css`、`caomei-ui/resolver`、`caomei-ui/nuxt` 的集合与语义，以及 `./package.json` 约定入口——即 `package.json` 的 `exports` 全部 5 键。
- **公开导出名**：包根导出的组件名（`Caomei*`）、composables（`use*`）、locale 类型与内建文案的命名空间（既有键的名称与语义；**新增**键属向后兼容增量，**删除 / 重命名**既有键属破坏性变更）。
- **token 契约**：语义化 `--caomei-*` token 的**名称与用途**（色值可调，名称与语义冻结）。

**仍可能调整的面（非冻结）**：

- **新增能力**：新增组件、新增可选 props / events / slots、新增 token、新增 locale 文案键——均为向后兼容增量。
- **实现与样式细节**：内部实现、DOM 结构、类名、计算样式与像素级表现、示例与文档措辞；不承诺像素级稳定。
- **未从包根导出的内部模块与类型**。

**例外与流程**：

- 冻结面若因安全或正确性必须破坏，须**单独决策**、递增 `minor`、在 CHANGELOG 的 `BREAKING CHANGES` 段披露并给出下游修复指引；不得静默破坏。
- 冻结窗口的解除（进入 1.0 或提前放宽）须单独决策，不在本声明内自动生效。
- 与上文「0.x 兼容策略」的关系：本节的冻结面**收窄**该节「`minor` 可能包含破坏性变更」的表述；非冻结面仍适用该节策略。

## 下游 pin 建议

- 需要稳定基线时**锁定精确版本**（在 `package.json` 中写 `"caomei-ui": "<目标版本>"`，不带 `^` / `~`），升级前先阅读目标版本的 `BREAKING CHANGES`。
- 仅在已确认兼容的前提下使用范围依赖（`~` / `^`）；组件库以 Vue 3.5+ 作为 peer 依赖，需由项目自行安装。
- 升级后至少复跑下游的 `typecheck` 与 `build`；跨版本迁移的下游回归机制见[路线图](../plan/roadmap.md)。
