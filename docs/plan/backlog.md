# 长期规划与 Backlog

本文档记录已评估的候选与长期主线，等待用户决策后进入 [todo.md](./todo.md) 当前阶段。

> 纪律：本文件中的候选**不得**包含阶段编号，AI 不得自动将其升级为当前阶段最高优先级。

## 1. 候选池

### 组件扩展候选

| 候选 | 来源 | 说明 | 优先级 |
|------|------|------|--------|
| Tier 2 组件补齐 | 组件使用面统计 | Tabs / Accordion / Menu / Image / SelectButton / FileUpload | 中 |
| Tag/Badge 增强 | 组件实现评估 | Tag 可选中筛选标签 / 可编辑；Badge 叠加位置与偏移自定义（placement / offset）、数值变化时的宽度过渡动画（`interpolate-size` 目前主要 Chromium 支持，跨浏览器需 JS 回退） | 低 |
| Select 增强 | 组件实现评估 | 分组（SelectGroup）、自定义选项渲染、搜索过滤；多选由 Tier 1 MultiSelect 承接 | 低 |
| momei 专属组件 | momei 使用面 | Skeleton / DatePicker / RadioButton / ProgressBar / Stepper / Popover / Slider / Drawer / InputGroup | 低（可下游自留） |
| 富文本与图表封装 | momei 使用面 | Editor / Chart 建议外购（Tiptap / ECharts），不自研 | 低 |

### 基建与治理候选

| 候选 | 说明 | 优先级 |
|------|------|--------|
| 国际文字内置文案补全 | 组件内建文案完整覆盖 zh-CN / en-US | 中 |
| 组件覆盖率门禁 | 待 Tier 0 组件基本实现后，在 `vitest` 配置中启用 `coverage.thresholds` ≥ 80% | 中 |
| Review Gate 证据留存 | 评审结论与浏览器验证截图归档到 `artifacts/review-gate/` 并纳入 `.gitignore` 策略 | 低 |
| 层级与阴影 token | Dialog / Select 等浮层组件 z-index 与 box-shadow 目前为字面量，后续抽 `--caomei-z-*` 与阴影 token 统一管理 | 低 |
| 文档站组件页推广 | 用户授权提前实施；已沉淀 [文档与演示站](../design/documentation-site.md) 并完成 Button 样板页，其余组件页按 Phase 3 推广 | 高 |
| docs 纳入 typecheck | `docs/.vitepress/**` 尚未纳入 `vue-tsc`，需补 docs 专用 tsconfig 与 `docs:gen` 前置 | 中 |
| @iconify/vue 可选接入 | 当前图标仅支持 `@lucide/vue` 组件；按需引入 `@iconify/vue` 支持字符串图标名（escape hatch） | 低 |
| Input 家族样式层共享 | attrs 透传已抽取 `useAttrForwarding`；容器/状态 scoped 样式仍按组件重复，出现第 4 个文本输入类组件或样式分叉时再评估共享样式层 | 低 |
| a11y 自动化回归 | 引入 axe-core 对关键组件做可访问性断言 | 中 |
| 视觉回归基线 | Playwright 截图比对主题/暗色/响应式，并对浮层断言页面稳定性（遮罩完整、`in-flow` 不位移；fixed 元素按滚动条宽容差） | 低 |
| Tailwind preset（可选） | 为 Tailwind 用户提供 token 映射，不内置依赖 | 低 |
| Storybook 组件工坊 | 暂不启用；组件演示优先使用文档站（见 [文档与演示站](../design/documentation-site.md)） | 低 |

### 下游协同候选

| 候选 | 说明 | 优先级 |
|------|------|--------|
| 下游兼容性回归机制 | 见 [路线图 Phase 5](./roadmap.md)，稳定使用后启用 | 延迟 |

## 2. 插队例外清单

仅以下三类可直接进入当前阶段，无需走 backlog 决策：

- 已确认的安全漏洞（依赖 CVE / 供应链告警）；
- 破坏下游项目构建或发布的兼容性问题；
- 直接影响可用性的 blocker 级缺陷。

## 3. 维护约定

- 新增候选时注明来源（用户需求 / 治理发现 / 使用面统计）与初步优先级。
- 已决策实施的候选，移入 `todo.md` 并标注所属阶段；被否决的候选记录结论与理由。
