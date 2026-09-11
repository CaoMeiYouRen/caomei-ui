# 文档规范

本文档定义 caomei-ui 文档的分类、维护职责与检查要求。

## 1. 文档分类

| 类别 | 位置 | 职责 |
|------|------|------|
| 权威准则 | `AGENTS.md` | AI 行为准则、PDTFC+、安全红线（唯一事实源） |
| 规范 | `docs/standards/` | 开发/测试/文档/Git/安全/规划/AI 治理细则 |
| 设计 | `docs/design/` | 架构、主题、组件设计与治理专项 |
| 指南 | `docs/guide/` | 上手、开发、发布、AI 协同 |
| 规划 | `docs/plan/` | roadmap / todo / backlog / 归档 |
| 组件文档 | `docs/components/` | 每个组件的 API 与示例（随文档站发布） |

## 2. 事实源原则

- 同一事实只在一个地方定义；其他文档以链接引用，禁止重复抄写完整条款与阈值。
- `AGENTS.md` 与 `docs/standards/*` 是规范事实源；`docs/design/*` 记录「为什么这样设计」及决策背景。
- 已实现能力才写入正式文档，未实现内容不得描述为已完成。

## 3. 格式要求

- Markdown 遵循 `lint-md`（`@lint-md/cli`）检查：标题层级、列表、代码块、链接等。
- 标题层级从 `#` 开始，不跳级。
- 使用中文标点；中英文之间保留空格。
- 代码块标注语言。
- 表格用于结构化对比，避免超长段落。

## 4. 维护职责

- `@documentation-specialist` 主责文档同步；`AGENTS.md` 重大变更后同步检查 `CLAUDE.md`。
- 代码相关文档与对应开发/审计结论对齐；规划类文档与 `@product-manager` 对齐。
- 文档站导航（`docs/.vitepress/config.ts`）新增页面时同步更新侧边栏。

## 5. 文档站

- 使用 VitePress；组件演示通过 `vitepress-demo-plugin` 在 Markdown 中内联。
- 命令：`pnpm docs:dev` / `pnpm docs:build`。
- 构建文档站纳入 CI 质量门。

## 6. 检查命令

- `pnpm lint:md`：检查全部 Markdown。
- `pnpm docs:build`：确保文档站可构建。

## 7. 反模式

- 文档描述与实现不一致。
- 在多个文档重复定义同一规则（应链接引用）。
- 创建大量空壳占位文档。
- 文档链接失效。
