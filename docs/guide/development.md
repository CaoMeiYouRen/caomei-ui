# 开发指南

## 环境要求

- Node.js >= 20
- pnpm（版本以根 `package.json` 的 `packageManager` 为准）

## 初始化

```bash
pnpm install
```

## 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动 playground 开发/演示环境 |
| `pnpm build` | 构建库产物（tsdown） |
| `pnpm build:watch` | tsdown watch 模式 |
| `pnpm lint` | ESLint 检查与修复 |
| `pnpm lint:css` | Stylelint 检查与修复 |
| `pnpm lint:md` | Markdown 检查 |
| `pnpm typecheck` | `vue-tsc --noEmit` |
| `pnpm test` | 单元测试 |
| `pnpm test:coverage` | 覆盖率 |
| `pnpm test:e2e` | Playwright E2E |
| `pnpm docs:dev` | 文档站开发 |
| `pnpm docs:build` | 文档站构建 |

## 目录约定

```
src/
├─ components/    # 组件（kebab-case 目录 + kebab-case.vue）
├─ composables/   # useToast / useConfirm / useDialog / useTheme
├─ locale/        # 组件内建文案
├─ styles/        # tokens 与基础样式
├─ icons/         # 图标封装
├─ resolver/      # unplugin resolver
├─ nuxt/          # Nuxt 模块
├─ types.ts       # 共享类型
└─ index.ts       # 公共 API 导出
playground/       # 本地开发/演示环境（不发布）
docs/             # VitePress 文档站
examples/         # 集成示例
test/             # 测试
```

## 新增组件流程

1. 在 `docs/design/components.md` 确认组件是否在组件集内；不在则先走 [Backlog](/plan/backlog)。
2. 创建 `src/components/<name>/`：`<name>.vue` + `types.ts` + `index.ts`（目录与文件均 kebab-case）。
3. 在 `src/index.ts` 导出组件与类型。
4. 补充单元测试与组件文档。
5. 通过质量门与 `@code-reviewer` Review Gate。

## 质量门

参见 [开发规范 - 质量门](/standards/development#10-质量门) 与 [测试规范 - 验证矩阵](/standards/testing#5-验证矩阵)。

## 注意事项

- **禁止引入 Tailwind / UnoCSS**。
- 组件前缀统一 `Caomei`；组件目录与文件命名统一 kebab-case。
- 公共 API 变更须考虑向后兼容。
- 修改被 `defineProps<ImportedType>()` 引用的 `types.ts` 后，dev server 可能给出半陈旧 HMR 产物（模板已引用新 prop 而 `defineProps` 未更新）；行为异常时先重启 dev server 再排查源码。
- Vite / VitePress 以 `codeSplitting: false` 打包 config，相对路径的动态 import 会被内联（config 加载即引入该依赖），无法借此延迟加载。
- `docs:preview` 服务的是旧构建产物；`pkill -f "vitepress preview"` 不匹配真实进程名（`vitepress.js preview`），浏览器验证应改用 dev server 或按端口重启 preview。
