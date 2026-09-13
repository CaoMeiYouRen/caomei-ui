<h1 align="center">caomei-ui</h1>
<p>
  <img alt="Version" src="https://img.shields.io/github/package-json/v/CaoMeiYouRen/caomei-ui.svg" />
  <a href="https://github.com/CaoMeiYouRen/caomei-ui/actions?query=workflow%3ATest" target="_blank">
    <img alt="GitHub Workflow Status" src="https://img.shields.io/github/actions/workflow/status/CaoMeiYouRen/caomei-ui/test.yml?branch=master">
  </a>
  <img src="https://img.shields.io/badge/node-%3E%3D20-blue.svg" />
  <a href="https://github.com/CaoMeiYouRen/caomei-ui/blob/master/LICENSE" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/github/license/CaoMeiYouRen/caomei-ui?color=yellow" />
  </a>
</p>

> 一个基于 Vue 3 与 [Reka UI](https://reka-ui.com/) 的自建组件库。组件与样式解耦，默认提供极简可用的样式并支持 100% 覆盖；主题切换与暗色模式开箱即用，同一套组件适配桌面端与移动端。

## 📌 项目状态

Tier 0 / Tier 1 / Tier 2 / Tier 3 稳定批组件均已完成并归档（Phase 0~4），文档站增强（Phase 5 第一阶段）亦已完成并归档。首版发布与下游接入（Phase 5 第二阶段及以后）待外部前置就绪后决策。组件库尚未发布首个版本，API 与目录结构在 1.0 前可能调整。

- 定位：替代多个下游项目中的 PrimeVue，规避 PrimeUI 商业许可风险。
- 目标组件集：Tier 0（9 个，已完成）+ Tier 1（8 个，已完成）+ Tier 2（6 个，已完成）+ Tier 3 稳定批（7 个，已完成）。
- 规划与进展见 [路线图](./docs/plan/roadmap.md) 与 [待办事项](./docs/plan/todo.md)。

## ✨ 特性（目标形态）

- **组件与样式解耦**：默认极简样式，可完全通过 `--caomei-*` CSS variables 覆盖，不引入 Tailwind / UnoCSS。
- **主题与暗色模式**：CSS variables + 语义化 token，支持 `.dark`、`[data-theme="dark"]` 与跟随系统。
- **桌面与移动适配**：单包响应式，不拆分移动端包。
- **单仓库单包**：组件、样式、resolver、Nuxt 模块通过子路径导出，消费者只需安装一个包。
- **无障碍**：基于 Reka UI 的 ARIA、键盘导航与焦点管理。

## 📦 依赖要求

- Node.js >= 20
- pnpm（版本以根 `package.json` 的 `packageManager` 为准）

## 🚀 安装

```sh
pnpm add caomei-ui
```

> 尚未发布首个版本，以上为接入目标形态。

## 📖 使用（目标形态）

### 按需引入（推荐）

```ts
import Components from 'unplugin-vue-components/vite'
import { CaomeiUiResolver } from 'caomei-ui/resolver'

export default defineConfig({
  plugins: [Components({ resolvers: [CaomeiUiResolver()] })],
})
```

### 全量引入

```ts
import { CaomeiButton } from 'caomei-ui'
import 'caomei-ui/styles.css'
```

```vue
<template>
  <CaomeiButton variant="primary">按钮</CaomeiButton>
</template>
```

### Nuxt 项目

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['caomei-ui/nuxt'],
  caomeiUI: {
    prefix: 'Caomei',
    darkMode: 'class',
  },
})
```

### 主题定制

```css
:root {
  --caomei-color-primary: #e63946;
  --caomei-radius-md: 6px;
}
```

完整用法见 [快速上手](./docs/guide/getting-started.md)。

## 🛠️ 开发

```sh
pnpm install        # 安装依赖
pnpm dev            # 启动 playground 开发环境
pnpm build          # 构建库产物（tsdown）
pnpm typecheck      # vue-tsc --noEmit
pnpm test           # 单元测试（Vitest）
pnpm test:e2e       # E2E（Playwright）
pnpm lint           # ESLint
pnpm lint:css       # Stylelint
pnpm lint:md        # Markdown（lint-md）
pnpm docs:dev       # 文档站开发
pnpm verify         # 运行全部质量门
```

## 🧱 技术栈（目标形态）

| 类别 | 选型 |
|------|------|
| 语言 | TypeScript（严格模式） |
| 框架 | Vue 3.5.x + Composition API + `<script setup>` |
| 底层 primitives | Reka UI |
| 样式 | CSS variables + 原生 CSS/SCSS（不引入 Tailwind / UnoCSS） |
| 构建 | tsdown |
| 表格 | @tanstack/vue-table |
| 图标 | @lucide/vue |
| 测试 | Vitest + Playwright |
| 文档 | VitePress |
| 发布 | semantic-release |

> Reka UI、tsdown、`@lucide/vue` 等已在 Phase 0 接入；`@iconify/vue` 作为字符串图标名的可选扩展后续按需引入。

## 📁 目录结构（目标形态）

```
src/
├─ components/    # 组件（kebab-case 目录 + kebab-case.vue）
├─ composables/   # useToast / useConfirm / useDialog / useTheme
├─ locale/        # 组件内建文案（zh-CN / en-US）
├─ styles/        # tokens 与基础样式
├─ icons/         # 图标封装（@lucide/vue）
├─ resolver/      # unplugin-vue-components resolver
├─ nuxt/          # Nuxt 模块
├─ types.ts       # 共享类型
└─ index.ts       # 公共 API 导出
playground/       # 本地开发/演示环境（不发布）
docs/             # VitePress 文档站
examples/         # 集成示例（不发布）
test/             # 单元与 E2E 测试
```

> 组件目录与组件文件采用 kebab-case；组件对外名称使用 `Caomei` + PascalCase（如 `CaomeiButton`）。

## 📚 文档

- [快速上手](./docs/guide/getting-started.md)
- [开发指南](./docs/guide/development.md)
- [发布指南](./docs/guide/release.md)
- [架构设计](./docs/design/architecture.md)
- [组件设计](./docs/design/components.md)
- [项目规范](./docs/standards/index.md)

## 🤝 贡献

欢迎贡献、提问或提出新功能！如有问题请查看 [issues](https://github.com/CaoMeiYouRen/caomei-ui/issues)。提交前请阅读 [贡献指南](./CONTRIBUTING.md) 与 [开发规范](./docs/standards/development.md)。

## 💰 支持

如果觉得这个项目有用的话请给一颗 ⭐️，非常感谢。

<a href="https://afdian.com/@CaoMeiYouRen">
  <img src="https://oss.cmyr.dev/images/202306192324870.png" width="312px" height="78px" alt="在爱发电支持我">
</a>

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=CaoMeiYouRen/caomei-ui&type=Date)](https://star-history.com/#CaoMeiYouRen/caomei-ui&Date)

## 📝 License

Copyright © 2026 [CaoMeiYouRen](https://github.com/CaoMeiYouRen).<br />
This project is [MIT](https://github.com/CaoMeiYouRen/caomei-ui/blob/master/LICENSE) licensed.
