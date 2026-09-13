# 长期规划与 Backlog

本文档记录已评估的候选与长期主线；候选准入、优先级与插队例外规则见 [规划规范 §3](../standards/planning.md#3-新需求处理原则hard-requirement)，本文档不重述。

## 1. 候选池

### 组件扩展候选

| 候选 | 来源 | 说明 | 优先级 |
|------|------|------|--------|
| Tier 2 组件补齐 | 组件使用面统计 | Tabs / Accordion / Menu / Image / SelectButton / FileUpload | 中 |
| Tag/Badge 增强 | 组件实现评估 | Tag 可选中筛选标签 / 可编辑（可编辑标签可由 Reka UI TagsInput 封装）；Badge 叠加位置与偏移自定义（placement / offset）、数值变化时的宽度过渡动画（`interpolate-size` 目前主要 Chromium 支持，跨浏览器需 JS 回退） | 低 |
| Select 增强 | 组件实现评估 | 分组（SelectGroup）、自定义选项渲染、搜索过滤；多选已由 Tier 1 MultiSelect 承接（Phase 2 交付） | 低 |
| momei 专属组件 | momei 使用面 | Skeleton / InputGroup 需自建；DatePicker / RadioGroup / ProgressBar / Stepper / Popover / Slider / Drawer 均可由 Reka UI 封装（Drawer 与日期类为 Alpha） | 低（可下游自留） |
| 富文本与图表封装 | momei 使用面 | Editor / Chart 建议外购（Tiptap / ECharts），不自研 | 低 |

### 基建与治理候选

| 候选 | 说明 | 优先级 |
|------|------|--------|
| 国际文字内置文案补全 | 组件内建文案已提供 zh-CN / en-US，但组件固定消费默认 zh-CN，缺语言选择 / 注入机制 | 中 |
| 组件覆盖率门禁 | 待启用 `coverage.thresholds` 门禁；阈值与启用时机待定 | 中 |
| Review Gate 证据留存 | 评审结论与浏览器验证截图归档到 `artifacts/review-gate/` 并纳入 `.gitignore` 策略 | 低 |
| 层级与阴影 token | Dialog / Select 等浮层组件 z-index 与 box-shadow 目前为字面量，后续抽 `--caomei-z-*` 与阴影 token 统一管理 | 低 |
| docs 纳入 typecheck | `docs/.vitepress/**` 尚未纳入 `vue-tsc`，需补 docs 专用 tsconfig 与 `docs:gen` 前置 | 中 |
| @iconify/vue 可选接入 | 当前图标仅支持 `@lucide/vue` 组件；按需引入 `@iconify/vue` 支持字符串图标名（escape hatch） | 低 |
| Input 家族样式层共享 | attrs 透传已抽取 `useAttrForwarding`；Password 已由 Input 派生并复用其样式（未分叉），其余文本输入类组件仍各自维护 scoped 样式，出现样式分叉时再评估共享样式层 | 低 |
| a11y 自动化回归 | 引入 axe-core 对关键组件做可访问性断言 | 中 |
| 视觉回归基线 | Playwright 截图比对主题/暗色/响应式，并对浮层断言页面稳定性（遮罩完整、`in-flow` 不位移；fixed 元素按滚动条宽容差） | 低 |
| 浮层交互 E2E 规格 | ConfirmDialog / Dialog 的焦点落位、滚动锁复位、遮罩拦截等浏览器态行为目前仅由一次性脚本验证；待补 `test/e2e/` 规格与 playwright 配置，使验证可在 CI 复现 | 低 |
| Tailwind preset（可选） | 为 Tailwind 用户提供 token 映射，不内置依赖 | 低 |
| Storybook 组件工坊 | 暂不启用；组件演示优先使用文档站（见 [文档与演示站](../design/documentation-site.md)） | 低 |
| Nuxt 模块真实集成 | 用户决策延后（Phase 2 范围外）：`caomei-ui/nuxt` 接入 `@nuxt/kit`，实现组件 / composables 自动导入、样式注入、主题与 SSR | 中 |
| 执行层规则重述与失效引用收敛 | 治理发现：code-reviewer `SKILL.md` §5.6 仍重述 planning §4 的编号禁令（宜改为一行引用）；`code-quality-checklist.md` 的「不可简化清单」引用了不存在的 `security.md §8`（该清单本体缺失，应补入安全规范或改指权威位置），「事实源层次」引用 `documentation.md §4`（实际为「维护职责」，事实源原则在 §2，且 `L0 > L1 > L2 > L3` 表述全仓未定义） | 低 |

### 下游协同候选

| 候选 | 说明 | 优先级 |
|------|------|--------|
| 下游兼容性回归机制 | 见 [路线图 Phase 5](./roadmap.md)，稳定使用后启用 | 延迟 |

## 2. 维护约定

- 新增候选时注明来源（用户需求 / 治理发现 / 使用面统计）与初步优先级。
- 被否决的候选记录结论与理由。
