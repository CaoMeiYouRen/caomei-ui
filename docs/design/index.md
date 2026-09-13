# 设计文档索引

本目录记录 caomei-ui 的架构、主题、组件设计与治理决策。

| 文档 | 内容 |
|------|------|
| [architecture.md](./architecture.md) | 仓库形态、构建方案、包导出、Nuxt 模块、依赖选型 |
| [theming.md](./theming.md) | 设计 token、主题切换、暗色模式、响应式 |
| [design-spec.md](./design-spec.md) | 设计规范：token 体系、尺寸 / 颜色 / 主题 / 风格、迁移映射与校验规划 |
| [components.md](./components.md) | 组件分层与最小组件集（Tier 0/1/2 已落地，Tier 3 稳定批已完成） |
| [documentation-site.md](./documentation-site.md) | 文档站与组件演示方案（demo 渲染、API 自动生成） |
| [governance/](./governance/) | 治理决策与经验归档（按需创建） |

## 约定

- 设计文档记录「为什么这样设计」，规范文档（`docs/standards/`）记录「要做什么」。
- 重大设计决策需记录背景、选项、结论与理由。
- 已实现能力才描述为已完成；未实现内容标注为规划。
