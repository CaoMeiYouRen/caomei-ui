# Menubar 菜单栏

桌面应用式的横向菜单栏：一组触发按钮共享弹出菜单，同一时刻只展开一个菜单。基于 Reka UI 的 `Menubar` 原语封装，提供菜单 / 触发器 / 内容 / 条目四层组件。

## 基础用法

`CaomeiMenubar` 是容器，`CaomeiMenubarMenu` 是一组「触发器 + 内容」，`value` 为这组菜单的标识；条目支持 `disabled` 与仅作展示的 `shortcut` 提示。

<demo
    vue="../examples/menubar/basic.vue"
    ssg="true"
/>

## 分组条目

条目可以按业务分组：分组容器只是普通元素（配 `role="group"` 与分组名），不改变键盘顺序；条目不提供内建分组组件，分组标题与分隔线由使用方按需组织。

<demo
    vue="../examples/menubar/grouped.vue"
    ssg="true"
/>

## 受控展开

`v-model` 与各 `CaomeiMenubarMenu` 的 `value` 对应：写入某个 `value` 即展开该菜单，关闭后回落为空字符串。受控值只影响展开态，不改变焦点位置。`CaomeiMenubarMenu` 未提供 `value` 时由 Reka 生成标识，此后无法用受控值寻址，受控场景请显式传值。

## 非模态语义

菜单栏是非模态浮层：打开菜单时**不做整页隔离**，背景保持可点击、可聚焦；点击外部或切换到另一组触发器即关闭，`Esc` 关闭并把焦点还给触发器。需要模态行为时请改用 `CaomeiDropdownMenu`（传 `modal`）或对话框。

## 键盘与无障碍

- 多个菜单栏并存时应各自提供可访问名（根节点透传 `aria-label`），避免出现多个无名 `menubar` 控件。
- 菜单栏为 `role="menubar"`，触发器为 `role="menuitem"` 且带 `aria-haspopup="menu"`；左右方向键在同一菜单栏的触发器之间移动（`loop` 控制是否循环），`Home` / `End` 直达首末项。
- `Enter` / `Space` 切换开合、`ArrowDown` 展开菜单；内容内方向键移动、`Esc` 关闭并把焦点还给触发器。
- 禁用条目带 `data-disabled`，不可聚焦、不可激活；`shortcut` 只做展示，不绑定按键。

## 属性

| 组件 | 主要 props |
|------|------|
| `CaomeiMenubar` | `v-model`、`loop`、`dir` |
| `CaomeiMenubarMenu` | `value` |
| `CaomeiMenubarTrigger` | `disabled` |
| `CaomeiMenubarContent` | `side`、`sideOffset`、`align`、`alignOffset`、`loop`、`forceMount` |
| `CaomeiMenubarItem` | `disabled`、`shortcut`、`textValue` |

## 样式定制

| 变量 | 默认 | 说明 |
|------|------|------|
| `--caomei-menubar-gap` | `--caomei-space-1` | 触发器间距 |
| `--caomei-menubar-padding` | `--caomei-space-1` | 菜单栏内边距 |
| `--caomei-menubar-border` | `--caomei-color-border` | 菜单栏描边 |
| `--caomei-menubar-bg` | `--caomei-color-bg-elevated` | 菜单栏底色 |
| `--caomei-menubar-trigger-padding-x` | `--caomei-space-3` | 触发器横向内边距 |
| `--caomei-menubar-trigger-padding-y` | `--caomei-space-1` | 触发器纵向内边距 |
| `--caomei-menubar-trigger-active-bg` | `--caomei-color-bg` | 触发器悬停 / 展开底色 |
| `--caomei-menubar-content-padding` | `--caomei-space-1` | 菜单内容内边距 |
| `--caomei-menubar-content-border` | `--caomei-color-border` | 菜单内容描边 |
| `--caomei-menubar-content-bg` | `--caomei-color-bg-elevated` | 菜单内容底色 |
| `--caomei-menubar-min-width` | `9rem` | 菜单内容最小宽度 |
| `--caomei-menubar-z-index` | `--caomei-z-dropdown` | 菜单内容层级 |
| `--caomei-menubar-item-gap` | `--caomei-space-2` | 条目文本与快捷键提示间距 |
| `--caomei-menubar-item-padding-x` | `--caomei-space-2` | 条目横向内边距 |
| `--caomei-menubar-item-padding-y` | `--caomei-space-2` | 条目纵向内边距 |
| `--caomei-menubar-item-highlighted-bg` | `--caomei-color-bg-elevated` | 条目高亮底色 |

<ComponentApi name="menubar" />
