<h1 align="center">caomei-ui</h1>
<p>
  <img alt="Version" src="https://img.shields.io/github/package-json/v/CaoMeiYouRen/caomei-ui.svg" />
  <a href="https://app.codecov.io/gh/CaoMeiYouRen/caomei-ui" target="_blank">
    <img alt="Codecov" src="https://img.shields.io/codecov/c/github/CaoMeiYouRen/caomei-ui">
  </a>
  <a href="https://github.com/CaoMeiYouRen/caomei-ui/actions?query=workflow%3ATest" target="_blank">
    <img alt="GitHub Workflow Status" src="https://img.shields.io/github/actions/workflow/status/CaoMeiYouRen/caomei-ui/test.yml?branch=master">
  </a>
  <a href="http://ui.cmyr.dev/" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" />
  </a>
  <img src="https://img.shields.io/badge/node-%3E%3D20-blue.svg" />
  <a href="https://github.com/CaoMeiYouRen/caomei-ui/graphs/commit-activity" target="_blank">
    <img alt="Maintenance" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" />
  </a>
  <a href="https://github.com/CaoMeiYouRen/caomei-ui/blob/master/LICENSE" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/github/license/CaoMeiYouRen/caomei-ui?color=yellow" />
  </a>
</p>

> 一个基于 Vue 3 与 [Reka UI](https://reka-ui.com/) 的自建组件库。组件与样式解耦，默认提供极简可用的样式并支持 100% 覆盖；主题切换与暗色模式开箱即用，同一套组件适配桌面端与移动端。

## 📌 项目状态

组件库已完成 Tier 0 ~ Tier 3 稳定批组件与各阶段补全，首个正式版本 **0.1.0** 已于 2026-09-19 发布到 npm。当前处于 Phase 5 第二阶段（首版发布）的发布后校验与状态同步阶段：采用本地手动发布，CI 自动发布暂缓，下游接入验证由发布后的实际迁移反馈驱动。0.x 期间 API 与目录结构仍可能调整。

- 定位：替代多个下游项目中的 PrimeVue，规避 PrimeUI 商业许可风险。
- 阶段进展、组件清单与下一步方向见[路线图](./docs/plan/roadmap.md)、[待办事项](./docs/plan/todo.md) 与 [Backlog](./docs/plan/backlog.md)。

## ✨ 特性

- **组件与样式解耦**：默认极简样式，可完全通过 `--caomei-*` CSS variables 覆盖，不引入 Tailwind / UnoCSS。
- **主题与暗色模式**：CSS variables + 语义化 token；支持 `.dark` / `[data-theme="dark"]` 与两套品牌预设（`data-preset`）；系统跟随需显式开启（`data-scheme="auto"`）。
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

当前最新版本为 `0.1.0`，组件库以 Vue 3.5+ 作为 peer 依赖（需在项目中自行安装）。0.x 阶段 API 与目录结构在 1.0 前可能调整。

需要参与开发或本地联调时，也可通过本地依赖（`file:` / `link:`）消费构建产物，步骤见[本地联调](./docs/guide/local-linking.md)。

## 📖 使用

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
```

> 组件样式随包自带（打包器按组件丢弃未使用的 CSS）；**基础层（tokens / 暗色 / 品牌预设）需显式引入** `import 'caomei-ui/theme.css'`，或走上面的按需引入（resolver 会自动注入）。

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
    injectStyles: true,
    theme: { primary: '#2563eb' },
  },
})
```

组件、composables 与样式自动接入；选项见[架构设计 §5](./docs/design/architecture.md)。

### 主题定制

```css
:root {
  --caomei-color-primary: #2563eb;
  --caomei-radius-md: 6px;
}
```

若自定义品牌色会作为实底或底色承载文字 / 图标，需同时覆盖对应 tone 的 `-solid` 与 `-foreground`（如 `primary-solid` / `primary-foreground`）（详见[主题与样式 §4](./docs/design/theming.md)）。

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

## 🧱 技术栈

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
| 发布 | 本地手动 npm publish（semantic-release / CI 自动发布暂缓） |

> 图标默认使用 `@lucide/vue`；`@iconify/vue` 作为字符串图标名的可选扩展按需引入。

## 📁 目录结构

```
src/
├─ components/    # 组件（kebab-case 目录 + kebab-case.vue）
├─ composables/   # useToast / useConfirm / useTheme / useLocale / provideLocale
├─ locale/        # 组件内建文案（zh-CN / en-US / zh-TW / ja-JP / ko-KR）
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
This project is [MIT](https://github.com/CaoMeiYouRen/caomei-ui/blob/master/LICENSE) licensed. 第三方依赖许可见 [THIRD-PARTY-LICENSES](./THIRD-PARTY-LICENSES)。
