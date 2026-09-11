# 长期规划与 Backlog

本文档记录已评估的候选与长期主线，等待用户决策后进入 [todo.md](./todo.md) 当前阶段。

> 纪律：本文件中的候选**不得**包含阶段编号，AI 不得自动将其升级为当前阶段最高优先级。

## 1. 候选池

### 组件扩展候选

| 候选 | 来源 | 说明 | 优先级 |
|------|------|------|--------|
| Tier 2 组件补齐 | 组件使用面统计 | Tabs / Accordion / Menu / Image / SelectButton / FileUpload | 中 |
| momei 专属组件 | momei 使用面 | Skeleton / DatePicker / RadioButton / ProgressBar / Stepper / Popover / Slider / Drawer / InputGroup | 低（可下游自留） |
| 富文本与图表封装 | momei 使用面 | Editor / Chart 建议外购（Tiptap / ECharts），不自研 | 低 |

### 基建与治理候选

| 候选 | 说明 | 优先级 |
|------|------|--------|
| 国际文字内置文案补全 | 组件内建文案完整覆盖 zh-CN / en-US | 中 |
| a11y 自动化回归 | 引入 axe-core 对关键组件做可访问性断言 | 中 |
| 视觉回归基线 | Playwright 截图比对主题/暗色/响应式 | 低 |
| Tailwind preset（可选） | 为 Tailwind 用户提供 token 映射，不内置依赖 | 低 |
| Storybook 组件工坊 | 作为开发时工坊（VitePress 仍为对外文档主站） | 低 |

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
