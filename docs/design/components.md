# 组件设计

本文档定义 caomei-ui 的组件分层与最小组件集。组件集依据下游项目（afdian-linker / caomei-auth / momei / rss-impact-next / dependfix-platform）实际使用面统计得出。

## 1. 组件分层

| 层 | 内容 | 示例 |
|----|------|------|
| Primitive 层 | 直接使用 Reka UI | Select、Dialog、Switch、Tabs、Toast |
| 派生层 | Reka UI + 样式 + 变体 | Button（自建）、Message、ProgressSpinner、Drawer |
| 复合层 | 多 primitive 组合 | DataTable、ConfirmDialog、MultiSelect |
| 服务层 | composables | useToast、useConfirm、useDialog、useTheme |

## 2. Tier 0：必选（9 个）

覆盖下游约 80% 使用场景。

| 组件 | 实现方式 |
|------|----------|
| Button | 自建（原生 button + variants） |
| DataTable + Column | 自建（@tanstack/vue-table + Reka UI） |
| Input（含 InputText / Password / Textarea / InputNumber） | 自建（原生 + Field 包装） |
| Tag / Badge | 自建（span + variants） |
| Select | Reka UI Select |
| Dialog | Reka UI Dialog |
| Toast | Reka UI Toast + 服务封装 |
| Card | 自建（布局 + variants） |
| Checkbox | Reka UI Checkbox |

## 3. Tier 1：强烈推荐（8 个）

在 Tier 0 基础上覆盖至约 95%。

| 组件 | 实现方式 |
|------|----------|
| Message / Alert | 自建（业务语义包装） |
| Password | Input 派生 |
| ProgressSpinner | Reka UI Progress 派生 |
| MultiSelect | Reka UI Combobox |
| ConfirmDialog | Reka UI AlertDialog + 服务 |
| Avatar | Reka UI Avatar |
| Paginator | Reka UI Pagination |
| Switch（统一 ToggleSwitch / InputSwitch） | Reka UI Switch |

## 4. Tier 2：按需（6 个）

| 组件 | 实现方式 |
|------|----------|
| Tabs（含 TabList/TabPanel） | Reka UI Tabs |
| Accordion | Reka UI Accordion |
| Menu / DropdownMenu | Reka UI DropdownMenu |
| Image | 自建（img + 懒加载） |
| SelectButton / SegmentedControl | Reka UI ToggleGroup |
| FileUpload | 自建 |

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
