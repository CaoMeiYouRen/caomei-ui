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

## 1.x 兼容策略

自 1.0 起，本库遵循语义化版本（SemVer）：

- `patch`：修复与不改变公开契约的内部调整。
- `minor`：向后兼容的新增（新组件、新增可选 props / events / slots、新增 token、新增 locale 文案键）与弃用标记；不删除、不改义既有公开契约。
- `major`：破坏性变更的唯一发布通道；破坏项须在 CHANGELOG 的 `BREAKING CHANGES` 段与[发布指南](./release.md)中列明，并给出下游修复指引。

1.0 之前的版本不承诺语义化兼容，期间的破坏性变更按历史记录保留、不回改。自 0.7 起，内建语言为「预注册 + 按需子路径」形态：`zh-CN` / `en-US` 预注册，其余语言经 `caomei-ui/locale/<code>` 引入后调用 `registerLocale()`；该形态已纳入 1.x 冻结面（见[内建文案与语言](../components/locale.md)）。

## 1.x 冻结面

以下面的**名称与语义**在 1.x 内冻结。新增属向后兼容增量；删除、重命名或改义属破坏性变更：

- **组件公开契约**：既有组件的公开 props / events / slots 的名称与语义。必填性放宽（required → optional）属向后兼容；收紧（optional → required）属破坏性变更。
- **子路径导出**：`package.json` 的 `exports` 全部 **13 键**的集合与语义（包根、`theme.css`、8 条语言子路径、`resolver`、`nuxt`、`package.json` 约定入口）。
- **包根导出名**：包根可导入的全部 **324** 个名称（组件、图标、composables、组件级类型、locale 运行时 / 类型、图表 helper、注入键、公共类型）。
- **token 契约**：**380** 个 `--caomei-*` token 的名称与用途（155 个有默认声明 + 290 个组件页「样式定制」已披露的覆盖钩子，去重后 380；15 个仅内部消费、未披露的中间变量不冻结）。默认色值 / 尺寸值可调，视觉细节不承诺像素级稳定。
- **locale 形态**：10 语、每语 28 个命名空间 / 80 条文案；`zh-CN` / `en-US` 预注册，其余 8 语经子路径按需注册；命名空间与既有键的名称 / 语义冻结。
- **`InputNumber` 的 `step` 语义**：按[冻结面终审记录](../design/governance/2026-10-24-phase26-m1-1-freeze-final-review.md) §2.6 所列 `NumberField` 行为冻结；升级 `reka-ui` 若改变该行为，须按破坏性变更处理或提供兼容层（缺省 1、非正数回退 1、不吸附到 step 整数倍、精度取整后按 min / max 钳制）。

**非冻结面**：

- 新增能力：新增组件、新增可选 props / events / slots、新增 token、新增 locale 文案键。
- 实现与样式细节：内部实现、DOM 结构、类名、计算样式与像素级表现、示例与文档措辞。
- 未从包根导出的内部模块、未在组件页披露的 15 个内部 token，以及 `reka-ui` 之外的传递依赖。

冻结面的逐项清单、复算命令与裁定理由见[冻结面终审记录](../design/governance/2026-10-24-phase26-m1-1-freeze-final-review.md)。

## 弃用政策

- 弃用项在**某个 `minor` 发布**中标记：文档标注、类型 JSDoc `@deprecated`、CHANGELOG 的 `Deprecations` 段（当前由发布流程人工补入）。
- 弃用项至少保留一个 `minor`，期间保持可用；在**下一个 `major`** 移除。
- `patch` 不引入弃用、不改变公开契约。

## 预发布通道

- 预发布版本发布到 npm 的 `next` dist-tag，不占用 `latest`；正式版本发布后才更新 `latest`。
- 冻结自 1.0 的首个 rc 起生效；rc 到正式版之间只允许修复与文档调整。
- rc 期站内与 README 的「当前最新版本」展示该 rc（与 `package.json` 一致）；npm 的 `latest` / `next` 实际指向以 registry 的 dist-tags 为准。

## 例外与流程

- 冻结面若因安全或正确性必须破坏，须**单独决策**，并只能随 `major` 发布；须在 CHANGELOG 的 `BREAKING CHANGES` 段披露、给出下游修复指引与可执行替换写法。
- 不得在 `minor` / `patch` 静默破坏冻结面；确需过渡时按弃用政策保留至少一个 `minor`。
- 冻结面的解除或放宽须单独决策，不在本声明内自动生效。

## 下游 pin 建议

- 需要稳定基线时**锁定精确版本**（在 `package.json` 中写 `"caomei-ui": "<目标版本>"`，不带 `^` / `~`），升级前先阅读目标版本的 `BREAKING CHANGES`。
- 仅在已确认兼容的前提下使用范围依赖（`~` / `^`）；组件库以 Vue 3.5+ 作为 peer 依赖，需由项目自行安装。
- 预发布版本请显式 pin 精确版本或 `next` dist-tag，不要与 `latest` 混用。
- 升级后至少复跑下游的 `typecheck` 与 `build`；跨版本迁移的下游回归机制见[路线图](../plan/roadmap.md)。
