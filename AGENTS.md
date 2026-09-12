# caomei-ui AI 代理配置文档 (AGENTS.md)

## 1. 概述

本文档规范 caomei-ui 项目中 AI 代理（Agents）与智能助手的配置、协作模式及行为准则，确保 AI 在高效辅助组件库开发的同时符合项目质量标准。

## 2. 权威事实源与冲突处理顺序

- `AGENTS.md` 是平台无关的唯一权威事实源，定义项目级 AI 行为准则、职责边界、PDTFC+ 工作流与安全红线。
- `CLAUDE.md`、`.github/copilot-instructions.md`、`docs/guide/ai-development.md` 等平台适配文档只承担工具适配与差异补充，不得与 `AGENTS.md` 并列定义核心规则。
- 冲突处理顺序：
  1. `AGENTS.md` 与其显式引用的规范文档（`docs/standards/*`）。
  2. 平台适配文件中与工具能力、加载顺序、目录回退相关的补充说明。
  3. `README.md`、文档站导航等导览性提示。
- 若平台能力受限，只允许补充「工具差异、降级策略与回退路径」，不得覆盖项目级行为准则。

## 3. 项目基本信息

- **项目名称**: caomei-ui（草梅 UI）
- **项目类型**: Vue 3 组件库（单仓库单包，非应用、非 monorepo）
- **核心框架**: Vue 3.5.x + TypeScript（严格模式）
- **底层 primitives**: Reka UI
- **样式方案**: CSS variables + 原生 CSS/SCSS（**不引入 Tailwind / UnoCSS**）
- **构建工具**: tsdown（库）
- **包管理器**: pnpm
- **测试**: Vitest（单元）+ Playwright（E2E）
- **文档站**: VitePress
- **发布**: semantic-release
- **图标**: @lucide/vue（`@iconify/vue` 后续可选接入）
- **组件前缀**: `Caomei`（如 `<CaomeiButton>`）

### 3.1 常用命令

| 分类 | 命令 | 说明 |
|------|------|------|
| 开发 | `pnpm dev` | 启动 Vite 开发/演示环境 |
| 构建 | `pnpm build` | 构建库产物 |
| 质量 | `pnpm lint` | 运行 ESLint 并自动修复 |
| 质量 | `pnpm lint:css` | 运行 Stylelint 并自动修复 |
| 质量 | `pnpm lint:md` | 运行 markdownlint（`lint-md`） |
| 质量 | `pnpm typecheck` | `vue-tsc --noEmit` 类型检查 |
| 测试 | `pnpm test` | 运行全部单元测试 |
| 测试 | `pnpm test:coverage` | 运行测试并生成覆盖率 |
| 测试 | `pnpm test:e2e` | 运行 Playwright E2E |
| 文档 | `pnpm docs:dev` | 启动文档站开发服务器 |
| 文档 | `pnpm docs:build` | 构建文档站 |
| 发布 | `pnpm release` | semantic-release 自动化发布 |

> 具体脚本以 `package.json` 实际内容为准；AI 不得臆造不存在的脚本。

## 4. 项目定位与边界

- caomei-ui 是**面向多个下游 Nuxt 4 / Vue 3 项目**的通用组件库，需同时支持桌面端与移动端、ToC 与 ToB（管理端）场景。
- **组件与样式解耦**：默认提供极简可用样式，支持通过 CSS variables 100% 覆盖。
- **主题切换与暗色模式**开箱即用。
- **单包发布**：全部能力（组件、样式、composables、resolver、Nuxt 模块）通过子路径导出承载，不拆分子包。
- 下游项目通过 `caomei-ui`、`caomei-ui/styles.css`、`caomei-ui/resolver`、`caomei-ui/nuxt` 接入。

## 5. 技术栈偏好

- **语言**：TypeScript 严格模式，禁止 `any` 逃逸，优先 `unknown` + 类型收窄。
- **框架**：Vue 3 + Composition API + `<script setup>`。
- **样式**：CSS variables（语义化 token）+ 原生 CSS/SCSS；**禁止引入 Tailwind / UnoCSS**（项目级覆盖全局规范）。
- **状态**：库内状态最小化，优先 `ref` / `computed`；不在组件库内引入全局 store。
- **构建**：tsdown；禁止为库另起 Vite 打包（Vite 仅用于开发/演示与文档）。
- **表格**：`@tanstack/vue-table`（headless）。
- **校验**：如涉及入参校验优先 Zod。
- **新增依赖前**：先确认项目中没有功能相近的已有依赖。

## 6. AI 编程配置与指导

### 6.1 核心编程准则

AI 在生成或修改代码时，必须优先参考 [开发规范](./docs/standards/development.md)，确保 TypeScript、Vue 风格、样式与组件 API 设计的一致性。

### 6.2 Agent-First 方法论

用户应直接把目标交给 Agent；一次性需求由 Agent 直接完成，可复用流程沉淀为 skill，自动化步骤再下沉为 skill 内的 script。高频任务应由 Agent 主动抽象稳定输入、边界与步骤，持续演化既有 skills。

### 6.3 信息获取与搜索优先原则 (Search-First)

AI 在遇到以下情况时，**必须优先使用搜索工具获取一手信息**，严禁仅凭训练记忆生成答案：

- 同一问题修复失败 >= 2 次，或根因分析不明确；
- 涉及不熟悉的库/框架/API、跨平台差异或安全合规判断；
- 需要外部文档、版本迁移指南或社区方案支撑决策（如 Reka UI、tsdown、Vue 版本兼容性）。

搜索应多源交叉验证，优先采纳 L1（官方文档）与 L2（权威社区）来源。详见 [AI 协作规范](./docs/standards/ai-collaboration.md)。

## 7. 协作工作流 (PDTFC+ 循环)

任何功能开发任务必须遵循 PDTFC+ 流程（P → D → A → V → T → F）：

1. **P (Plan)**: 需求澄清、范围判定、验收标准、`docs/plan/todo.md` 对齐。
2. **D (Do)**: 按方案实现，遵守 [开发规范](./docs/standards/development.md)。
3. **A (Audit)**: `@code-reviewer` Review Gate（强制，未放行不得进入后续阶段）。
4. **V (Validate)**: `@ui-validator` 浏览器验证（无 UI 影响时显式说明跳过）。
5. **T (Test)**: 补齐并运行相关测试。
6. **F (Finish)**: 文档与规划收口、通过 `conventional-committer` 单次提交。

详细流程见 [AI 协作规范](./docs/standards/ai-collaboration.md)。

## 8. AI 智能体体系 (AI Agents Matrix)

每个阶段必须有明确唯一的主责角色，避免多角色重复承担同类职责。

| 智能体 | 适用场景 | 主要输出 | 必经交接点 | 不应承担 |
| :--- | :--- | :--- | :--- | :--- |
| `@full-stack-master` | 默认开发主责角色；编排需求、方案、组件实现与收口 | 阶段拆解、组件代码、交接计划、收口说明 | 需求不清先交 `@product-manager`；代码落地后交 `@code-reviewer` | 不应绕过审计、测试与文档收口直接宣布完成 |
| `@product-manager` | 需求澄清、范围判定、验收标准、Todo/Backlog 维护 | 范围判定、验收标准、规划更新 | 需求明确后交 `@full-stack-master` | 不应承担代码实现、审计或测试编写 |
| `@frontend-developer` | 已切分的组件实现、样式、交互专项 | 组件代码、自检记录、UI 风险提示 | 代码改动交 `@code-reviewer`；涉及界面交 `@ui-validator` | 不应承担跨模块方案设计或最终 Review Gate |
| `@code-reviewer` | 所有代码/文档/配置/治理改动的强制 Review Gate | Pass/Reject、问题分级、验证矩阵 | Pass 后才能提交；Reject 退回开发者 | 不应承担需求定义、功能开发或测试增强主责 |
| `@ui-validator` | 组件在真实页面的渲染、响应式、主题、暗色验证 | 验证记录、截图/结论、问题清单 | 通过后交 `@test-engineer` 或回开发者 | 不应承担业务逻辑实现或产品规划 |
| `@test-engineer` | 测试补强、回归验证、覆盖率提升 | 新增/修正测试、运行结果、剩余风险 | 测试改动仍需交 `@code-reviewer` | 不应承担需求规划或视觉验收 |
| `@documentation-specialist` | 规范、设计、Guide、Plan、组件文档同步 | 文档更新、原文回链、同步说明 | 规划类与 `@product-manager` 对齐 | 不应虚构未实现能力 |
| `@qa-assistant` | 只读问答、代码/文档检索、架构解释 | 证据化回答、定位结果 | 需修改时转交执行角色 | 严禁修改代码、配置或规划文档 |

### 8.1 默认推荐路径

1. 需求不清或怀疑插队时，先交 `@product-manager`。
2. 代码实现默认由 `@full-stack-master` 统筹；边界稳定后再拆给 `@frontend-developer`。
3. 任何代码改动收尾必须进入 `@code-reviewer` Review Gate。
4. 涉及实际渲染的改动交 `@ui-validator`。
5. 测试补强由 `@test-engineer` 主责。
6. 文档同步由 `@documentation-specialist` 承担。

### 8.2 主定义、镜像与 Skills 复用治理

- `.github/agents/` 与 `.github/skills/` 是项目内 agent / skill 的**主定义目录**。
- `.claude/`、`.opencode/`、`.agents/` 是对应平台的兼容镜像，必须与 `.github/` 保持同名、同库存、同职责边界，由 `scripts/setup/setup-ai.mjs` 维护为符号链接，不得独立发明另一套角色体系。
- Agent 文件只保留角色定位、输入输出、交接点与禁区；PDTFC+ 全流程与专项规则沉淀在 `AGENTS.md`、skills 与规范文档中。
- 任何 agent / skill 库存变更，都应同步更新 `AGENTS.md`、平台适配入口与镜像。

### 8.3 CLAUDE.md 维护约定

- `CLAUDE.md` 由 `@documentation-specialist` 维护；`AGENTS.md` 重大变更后同步检查。
- `CLAUDE.md` 只保留平台适配内容（目录发现顺序、工具差异、回退策略），不重复项目级规则。

## 9. 安全与行为红线

### 9.1 核心文件保护

- 严禁修改或删除 `.env`；非必要不得读取 `.env`，优先参考 `.env.example`。
- 修改本文件 `AGENTS.md` 前必须询问用户并获明确指示。
- 严禁在代码中硬编码任何 API Key、Token 或敏感凭据。

### 9.2 终端操作安全

执行脚本或命令前必须做环境检查与路径校验。**禁止批量删除文件或目录**，删除文件时一次只删一个明确路径。详见 [安全规范](./docs/standards/security.md)。

### 9.3 Git 规范

- **禁止擅自推送**：`git commit` 后不得自动 `git push`，除非用户明确要求。
- **提交必须通过 `conventional-committer` skill**，禁止裸 `git commit -m "..."`。
- 提交消息符合 Conventional Commits（`type(scope): description`），描述使用中文。
- 提交前必须确认 `@code-reviewer` 已放行，且 `lint` / `typecheck` / 必要测试通过。
- 一个提交对应一个逻辑变更。详见 [Git 规范](./docs/standards/git.md)。

## 10. 其他要求

1. **多语言响应**：使用用户发送的语言回复（默认中文）。
2. **重大变更确认**：涉及架构、核心逻辑或路线图的重大变更前，必须主动向用户请求确认。
3. **规划纪律**：新需求默认走「评估 → backlog → 用户决策」，不得自动升级为当前 todo 阶段。详见 [规划规范](./docs/standards/planning.md)。
4. **性能下限原则**：使用的 AI 智能体基础能力不应低于 Claude Sonnet 4.6 / GPT-5.3 / DeepSeek V4 Flash 这一档。

## 11. 相关文档

- **规划**: [路线图](./docs/plan/roadmap.md) | [待办事项](./docs/plan/todo.md) | [Backlog](./docs/plan/backlog.md)
- **规范**: [规范索引](./docs/standards/index.md) | [开发](./docs/standards/development.md) | [测试](./docs/standards/testing.md) | [文档](./docs/standards/documentation.md) | [Git](./docs/standards/git.md) | [安全](./docs/standards/security.md) | [规划](./docs/standards/planning.md) | [AI 协作](./docs/standards/ai-collaboration.md) | [AI 资产治理](./docs/standards/ai-governance.md)
- **设计**: [设计索引](./docs/design/index.md) | [架构](./docs/design/architecture.md) | [主题](./docs/design/theming.md) | [组件](./docs/design/components.md)
- **指南**: [上手](./docs/guide/getting-started.md) | [开发](./docs/guide/development.md) | [发布](./docs/guide/release.md) | [AI 协同](./docs/guide/ai-development.md)
- **适配与入口**: [Claude 适配](./CLAUDE.md) | [README](./README.md)
