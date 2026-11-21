# Popconfirm 气泡确认

气泡确认在触发按钮旁弹出一张小面板，用于轻量的二次确认。它基于 `CaomeiPopover` 与 `CaomeiButton` 组合实现，不打断页面上下文。

## 基础用法

默认插槽是触发按钮的文本；`title` / `description` 提供面板内容，确认与取消分别抛出 `confirm` / `cancel`。确认或取消后面板自动关闭。

<demo
    vue="../examples/popconfirm/basic.vue"
    ssg="true"
/>

## 语气与文案

- `tone="danger"` 把确认按钮切为危险色，并把图标切为警告态；默认 `neutral`。
- `confirmLabel` / `cancelLabel` 覆盖按钮文案；缺省取当前语言的「确定」「取消」。
- `icon` 传组件可替换面板图标，传 `null` 可隐藏；缺省按语气回退。
- `triggerLabel` 提供触发按钮的可访问名；缺省取默认插槽文本。

<demo
    vue="../examples/popconfirm/async.vue"
    ssg="true"
/>

## 异步确认与受控开合

`open` 支持 `v-model:open` 受控。组件**不代管异步请求**：点击确认后立即抛出 `confirm` 并关闭；需要「请求期间保持面板」时，把 `open` 提升为受控，在回调中自行请求、用 `loading` 表达进行中，完成后再把 `open` 置为 `false`。

`loading` 为真时确认按钮进入加载态、两枚按钮同时禁用；`disabled` 只禁用触发按钮。

## 键盘与焦点

- 面板打开后焦点落在确认按钮：`Enter` 确认，`Esc` 取消。
- 面板关闭（确认、取消、Esc、点击外部）后焦点归还触发按钮。
- 点击面板外部与按 `Esc` 都按「取消」结算，抛出 `cancel`。
- 面板为 `role="dialog"`，标题存在时以标题命名；无标题时以描述或确认文案兜底命名。

## 与 ConfirmDialog 的边界

- `CaomeiPopconfirm` 用于**就近、轻量**的二次确认（删除一行、保存一次），不锁定页面、不遮挡上下文。
- `CaomeiConfirmDialog`（及 `useConfirm()`）用于**必须打断**的确认：模态、锁定滚动、必须显式选择确认或取消，适合不可逆的高风险操作。
- 两者都不代管异步请求；`ConfirmDialog` 以 `Promise<boolean>` 返回结果，`Popconfirm` 以 `confirm` / `cancel` 事件回写。

## 样式定制

| 变量 | 默认 | 说明 |
| --- | --- | --- |
| `--caomei-popconfirm-width` | `min(20rem, 可用宽度)` | 面板宽度 |

面板内的间距与字号复用 `--caomei-space-*` / `--caomei-font-size-*`；外观（背景、圆角、阴影）复用 `CaomeiPopover` 的 `--caomei-popover-*` 变量。

## 从 PrimeVue 迁移

| PrimeVue `ConfirmPopup` | 本组件 |
| --- | --- |
| `<ConfirmPopup />` + `useConfirm().require({...})` 命令式调用 | `<CaomeiPopconfirm>` 声明式包裹触发按钮，事件回写 |
| `message` | `title` / `description`（或 `#title` / 默认插槽） |
| `acceptLabel` / `rejectLabel` | `confirmLabel` / `cancelLabel` |
| `acceptIcon` / `rejectIcon` | 未支持（按钮图标请用 `#icon` 形态的 `CaomeiButton` 自行组合） |
| `acceptClass` / `rejectClass` | 用 `tone` 表达确认按钮语气（`danger` / `neutral`） |
| `icon`（字符串图标类名） | `icon`（传 `@lucide/vue` 组件；缺省按语气回退） |
| `appendTo` / `baseZIndex` / `autoZIndex` / `pt` / `dt` / `unstyled` | 未实现（面板经 Portal 挂 `body`、层级由库管理） |

**已知差异（有意）**：PrimeVue 的 `ConfirmPopup` 由全局容器 + 命令式 `require()` 驱动；本组件改为声明式包裹，每个触发按钮各自持有一个面板，受控开合与加载态由使用方掌握。`accept` / `reject` 回调改为 `confirm` / `cancel` 事件。

> 迁移流程、通用陷阱与逐组件对照入口见[从 PrimeVue 迁移](../guide/primevue-migration.md)。

<ComponentApi name="popconfirm" />
