# 待办事项

本文档记录当前阶段的原子条目与验收状态；准入、命名与阶段衔接规则见 [规划规范](../standards/planning.md)，本文档不重述。

## 当前阶段

> Phase 0 ~ Phase 4 已完成并归档（见 [待办归档](./todo-archive.md)）。Phase 5（文档站 + 首个下游接入）已由用户决策按两段式启动。
>
> 用户决策：先启动第一阶段（本仓库可独立闭环的文档站增强，按依赖顺序：docs 质量护栏 → 站内搜索 → 站点多语言）；第二阶段（semantic-release 首版发布、首个下游接入）依赖用户外部前置（npm 发布凭据、下游仓库授权），待就绪后另行登记。
> 实现粒度约束见 [规划规范 §5](../standards/planning.md#5-任务粒度约束)；组件内建文案 locale 注入、Nuxt 模块真实集成、覆盖率门禁、a11y 回归、文档站版本化等候选见 [Backlog](./backlog.md)。

### Phase 5：文档站 + 首个下游接入

状态：**进行中**（第一阶段）

> 范围：用户决策采用两段式，本阶段先推进 3 条本仓库可独立闭环的主线，按依赖顺序执行。
> 非目标：暂不落地文档站版本化（首版发布前无版本基线）、不启用组件覆盖率门禁与 a11y 自动化回归、不做组件内建文案 locale 注入；以上均留在 [Backlog](./backlog.md)。

#### 主线 A：docs 质量护栏（docs 纳入 typecheck）

- 执行范围：补 docs 专用 tsconfig，将 `docs/.vitepress/**`（主题与示例）纳入 `vue-tsc`，接入 `verify` / CI，并处理 `docs:gen` 前置依赖
- 非目标：不重构文档站目录结构；不改组件实现；不为凑覆盖修改示例语义
- 最小验收：docs 纳入类型检查后零 error；`pnpm verify` 通过；现有文档构建无回归

- [x] **docs 纳入 typecheck**：`docs/.vitepress/**` 纳入 `vue-tsc`，配套 docs 专用 tsconfig 与 `docs:gen` 前置，接入质量门与 CI。

#### 主线 B：文档站站内搜索

- 执行范围：启用 VitePress 内置站内搜索（local provider），配置索引范围与必要主题样式，验证组件名 / 标题 / 中文关键词检索
- 非目标：不接入需外部账号与审批的 Algolia DocSearch；不改组件页内容结构；不引入第三方搜索依赖
- 最小验收：`pnpm docs:build` 通过；可按组件名与标题命中；中文关键词检索效果经实测并记录内置分词局限；`pnpm verify` 通过

- [x] **文档站站内搜索**：启用内置搜索并实测中文检索效果；若内置分词不达标，先记录结论再决策是否另行走外部搜索。

#### 主线 C：文档站多语言（站点 i18n）

- 执行范围：配置 VitePress `locales`（zh-CN 默认 + en-US）与语言切换，nav / sidebar 本地化，首批高频页面英文版
- 非目标：不做组件运行时内建文案的 locale 注入（属库能力，另见 Backlog）；首期不要求翻译全部组件页
- 最小验收：`pnpm docs:build` 通过；中英切换可用、nav / sidebar 双语可达；未翻译页有明确 fallback 且不报错；`lang` 与元信息按 locale 输出

- [ ] **站点 i18n 基建**：配置 `locales`、语言切换与 nav / sidebar 双语骨架。
- [ ] **首批页面英文版**：按覆盖范围补充首批高频页面英文，其余走 fallback。
