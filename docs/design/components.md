# 组件设计

本文档定义 caomei-ui 的组件分层与最小组件集。组件集依据下游项目（afdian-linker / caomei-auth / momei / rss-impact-next / dependfix-platform）实际使用面统计得出。

## 1. 组件分层

| 层 | 内容 | 示例 |
|----|------|------|
| Primitive 层 | Reka UI 原始件，不直接对外 | Select / Dialog 等组件内部使用的 primitive |
| 封装 / 自建层 | Reka UI 封装，或原生元素 + 样式 / 变体 | 封装：Select、Dialog、Switch、Toast、Checkbox；自建：Button、Input、Card、Tag / Badge |
| 复合层 | 多 primitive 组合 | DataTable、ConfirmDialog、MultiSelect |
| 服务层 | composables | useToast、useConfirm、useDialog、useTheme |

### 1.1 实现方式决策原则

- **优先封装 Reka UI 已有组件**；仅当 Reka UI 缺失对应组件，或对应组件无法满足设计需要（交互语义 / 无障碍 / 布局结构）时才自建。
- 自建前须核对 [Reka UI 官方文档](https://reka-ui.com/docs/overview/introduction) 的 Components 导航与本地 `reka-ui` 导出，确认确无可用 primitive。
- 封装层只承担样式、变体、尺寸、语义 token 与服务封装，不重复实现 primitive 已提供的交互与无障碍。
- 组件清单以「Reka UI 对应」列为准维护：新增组件时先判定能否封装，再决定是否自建。

## 2. Tier 0：必选（9 个）

覆盖下游约 80% 使用场景。

| 组件 | 实现方式 | Reka UI 对应 |
|------|----------|--------------|
| Button | 自建（原生 button + variants） | 无 |
| DataTable + Column | 自建（@tanstack/vue-table） | 无 |
| Input 家族（Input / Textarea / Password / InputNumber） | Input / Textarea / Password 自建（原生 input）；InputNumber 封装 NumberField | 文本输入无；InputNumber → NumberField |
| Tag / Badge | 自建（span + variants） | 无 |
| Select | 封装 Select | Select |
| Dialog | 封装 Dialog | Dialog |
| Toast | 封装 Toast + 服务封装 | Toast |
| Card | 自建（布局 + variants） | 无 |
| Checkbox | 封装 Checkbox | Checkbox |

## 3. Tier 1：强烈推荐（8 个）

在 Tier 0 基础上覆盖至约 95%。

| 组件 | 实现方式 | Reka UI 对应 |
|------|----------|--------------|
| Message / Alert | 自建（业务语义包装） | 无 |
| Password | Input 派生（Tier 0 已含基础能力，此处为增强） | 无 |
| ProgressSpinner | 封装 Progress 派生 | Progress |
| MultiSelect | 封装 Combobox | Combobox |
| ConfirmDialog | 封装 AlertDialog + 服务 | AlertDialog |
| Avatar | 封装 Avatar | Avatar |
| Paginator | 封装 Pagination | Pagination |
| Switch（统一 ToggleSwitch / InputSwitch） | 封装 Switch（文档 / 测试已补齐） | Switch |

## 4. Tier 2：按需（6 个）

| 组件 | 实现方式 | Reka UI 对应 |
|------|----------|--------------|
| Tabs（含 TabList/TabPanel） | 封装 Tabs | Tabs |
| Accordion | 封装 Accordion | Accordion |
| Menu / DropdownMenu | 封装 DropdownMenu | DropdownMenu |
| Image | 自建（img + 懒加载） | 无（可选 AspectRatio 比例容器） |
| SelectButton / SegmentedControl | 封装 ToggleGroup | ToggleGroup |
| FileUpload | 自建 | 无 |

## 5. 不自研

| 能力 | 建议 |
|------|------|
| 富文本 Editor | 引入 Tiptap / Quill / Lexical |
| Chart | 引入 Chart.js / ECharts |
| Galleria / Carousel | 引入 embla-carousel-vue（headless）+ 自建样式 |
| Knob / MeterGroup / OrganizationChart / TreeTable 等长尾 | 下游按需引入 Element Plus 或自留 |

## 6. composables

| composable | 职责 |
|------------|------|
| `useToast` | 轻提示，基于 Reka UI Toast |
| `useConfirm` | 确认对话框，基于 AlertDialog |
| `useDialog` | 通用对话框服务 |
| `useTheme` | 主题/暗色模式管理 |

## 7. 组件开发顺序

1. Button（验证 tsdown + SFC + 样式抽取 + 子路径导出）
2. Input（验证 v-model）
3. Select（验证 Reka UI primitive 包装）
4. Dialog + Toast（验证 Portal / Teleport / SSR）
5. DataTable（最复杂，最后攻坚）
