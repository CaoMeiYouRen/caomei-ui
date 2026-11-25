# ContextMenu 右键菜单

ContextMenu 在指定区域右键（触屏长按）处弹出上下文菜单，基于 Reka UI 的 `ContextMenu` 封装，菜单项 / 分隔 / 快捷键 / 危险项语义与下拉菜单一致。

## 基础用法

`CaomeiContextMenu` 包裹触发区与菜单内容；`CaomeiContextMenuContent` 的 `model` 为数据驱动条目，`command` 在选中时调用并收到 `{ item, originalEvent }`。`shortcut` 仅展示快捷键文本，不绑定按键。

<demo
    vue="../examples/context-menu/basic.vue"
    ssg="true"
/>

## 分组、标签与快捷键

需要分组标题或自定义内容时使用子组件：`CaomeiContextMenuGroup` + `CaomeiContextMenuLabel` + `CaomeiContextMenuItem` + `CaomeiContextMenuSeparator`。条目支持 `danger`（危险语气）、`disabled`（禁用）与 `shortcut`。

<demo
    vue="../examples/context-menu/groups.vue"
    ssg="true"
/>

## 禁用项

禁用条目保留在菜单中但不响应点击与键盘选择，`data-disabled` 可作样式钩子；数据条目用 `disabled: true` 表达。

<demo
    vue="../examples/context-menu/disabled.vue"
    ssg="true"
/>

## 子组件 props

| 组件 | 主要 props |
|------|------|
| `CaomeiContextMenu` | `modal`（是否模态，默认 `false`） |
| `CaomeiContextMenuContent` | `model`（数据条目）、`loop`（键盘循环，默认 `true`）、`forceMount` |
| `CaomeiContextMenuTrigger` | `unstyled`（去掉触发区类名） |
| `CaomeiContextMenuItem` | `disabled`、`shortcut`、`danger`、`textValue` |
| `CaomeiContextMenuGroup` / `CaomeiContextMenuLabel` / `CaomeiContextMenuSeparator` | 透传属性到对应 Reka 原语 |

## 开合、键盘与焦点

- `v-model:open` 控制开合；菜单打开后由 Reka 提供方向键导航、Enter 选择与 Esc 关闭。
- 触发区默认不生成盒（`display: contents`）、不带 `tabindex`：右键菜单由指针打开，键盘用户需要入口时由使用方提供（如在可聚焦元素上监听 Shift+F10 并写入 `v-model:open`）。
- Esc 关闭后焦点归还「打开前最后一个焦点元素」（通常是页面或所在模态内容），而不是触发区本身；归还由组件保证（`forceMount` 下同样生效），若 `command` 等消费方已把焦点接管到新容器则不抢回。
- 打开时背景按既有浮层接线置 `inert`，触发器保留为隔离面的第二根，关闭后还原。

## 样式定制

| 变量 | 默认 | 说明 |
|------|------|------|
| `--caomei-context-menu-z-index` | `--caomei-z-dropdown` | 面板层级（高于模态内容） |
| `--caomei-context-menu-min-width` | `10rem` | 面板最小宽度 |
| `--caomei-context-menu-padding` | `--caomei-space-1` | 面板内边距 |
| `--caomei-context-menu-radius` | `--caomei-radius-md` | 面板圆角 |
| `--caomei-context-menu-bg` | `--caomei-color-bg-elevated` | 面板背景 |
| `--caomei-context-menu-border` | `--caomei-color-border` | 面板边框 |
| `--caomei-context-menu-item-padding-y` | `--caomei-space-2` | 条目纵向内边距 |
| `--caomei-context-menu-item-highlighted-bg` | `--caomei-color-bg-elevated` | 键盘高亮底色（与面板同值时请覆盖） |
| `--caomei-context-menu-danger-bg` | 由危险色派生的 12% 底 | 危险项高亮底色 |

<ComponentApi name="context-menu" />
