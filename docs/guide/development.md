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
| `pnpm dev` | 启动 Vite 开发/演示环境 |
| `pnpm build` | 构建库产物 |
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
├─ components/    # 组件（kebab-case 目录 + PascalCase.vue）
├─ composables/   # useToast / useConfirm / useDialog / useTheme
├─ locale/        # 组件内建文案
├─ styles/        # tokens 与基础样式
├─ icons/         # 图标封装
├─ resolver/      # unplugin resolver
├─ nuxt/          # Nuxt 模块
└─ index.ts       # 公共 API 导出
docs/             # VitePress 文档站
examples/         # 集成示例
test/             # 测试
```

## 新增组件流程

1. 在 `docs/design/components.md` 确认组件是否在组件集内；不在则先走 [Backlog](/plan/backlog)。
2. 创建 `src/components/<name>/`：`<Name>.vue` + `types.ts` + `index.ts`。
3. 在 `src/index.ts` 导出组件与类型。
4. 补充单元测试与组件文档。
5. 通过质量门与 `@code-reviewer` Review Gate。

## 质量门

参见 [开发规范 - 质量门](/standards/development#10-质量门) 与 [测试规范 - 验证矩阵](/standards/testing#5-验证矩阵)。

## 注意事项

- **禁止引入 Tailwind / UnoCSS**。
- 组件前缀统一 `Caomei`。
- 公共 API 变更须考虑向后兼容。
