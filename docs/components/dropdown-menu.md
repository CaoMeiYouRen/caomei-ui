# DropdownMenu 下拉菜单

下拉菜单由触发器展开一组操作，支持分组、禁用、勾选、单选与分隔线，基于 Reka UI DropdownMenu 封装。

## 基础用法

`CaomeiDropdownMenu` 为逻辑根容器（不渲染 DOM），`CaomeiDropdownMenuTrigger` 触发展开，`CaomeiDropdownMenuContent` 承载条目（内部自动 `Portal` 到 `body`）。条目可用 `shortcut` 展示快捷键提示。

<demo
    vue="../examples/dropdown-menu/basic.vue"
    ssg="true"
/>

> `class` / `style` 请落在触发器或内容上；根容器不渲染 DOM，其上的其余属性不会生效。

## 分组与分隔线

`CaomeiDropdownMenuGroup` 聚合一组条目，`CaomeiDropdownMenuLabel` 提供不可聚焦的分组标题，`CaomeiDropdownMenuSeparator` 作分隔线。

## 勾选与单选

- `CaomeiDropdownMenuCheckboxItem` 支持 `v-model` 布尔值（或 `'indeterminate'`）表示勾选态。
- `CaomeiDropdownMenuRadioGroup` + `CaomeiDropdownMenuRadioItem` 组成单选组，`v-model` 承载选中值，条目 `value` 需在组内唯一。

默认点击条目后菜单关闭；在 `select` 事件中调用 `event.preventDefault()`（模板可用 `@select.prevent`）可保持展开，适合连续勾选。

<demo
    vue="../examples/dropdown-menu/checkable.vue"
    ssg="true"
/>

## 数据驱动项模型

`CaomeiDropdownMenuContent` 的 `model` 接收 `DropdownMenuModelItem[]`，适合从 PrimeVue `MenuItem` 迁移的场景：渲染顺序即数组顺序，其中 `separator: true` 渲染分隔线（忽略其余字段），其余条目在选中时调用 `command`。`model` 渲染在默认插槽之前，二者可共存（需要更复杂结构时用插槽）。

<demo
    vue="../examples/dropdown-menu/model.vue"
    ssg="true"
/>

| 字段 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `label` | `string` | — | 条目文本 |
| `icon` | `Component` | — | 条目图标，传 `@lucide/vue` 组件（**不接受字符串类名**） |
| `command` | `(event: DropdownMenuCommandEvent) => void` | — | 选中回调，载荷为 `{ item, originalEvent }` |
| `disabled` | `boolean` | `false` | 是否禁用（不参与键盘导航、不触发 `command`） |
| `separator` | `boolean` | `false` | 渲染为分隔线（忽略其余字段） |

> 需要逐条目自定义类名或嵌套子菜单时改用声明式条目（`v-for` + `CaomeiDropdownMenuItem`）；相关未实现项见迁移节。
>
> `label` 同时是条目的可访问名与 typeahead 匹配文本；仅有图标的条目也应提供 `label`。

## 禁用

触发器 `disabled` 禁用整个菜单；条目 `disabled` 仅禁用单项（不参与键盘导航，不触发 `select`）。

<demo
    vue="../examples/dropdown-menu/disabled.vue"
    ssg="true"
/>

## 模态模式

默认 `modal: false` 为非模态：不锁定页面滚动、不禁用外部交互，也不圈定焦点，适合普通操作菜单。传入 `modal` 后进入模态模式：锁定页面滚动、圈定焦点并隐藏背景内容。

<demo
    vue="../examples/dropdown-menu/modal.vue"
    ssg="true"
/>

## 组合件 API

| 组件 | 关键 props | 说明 |
|------|-----------|------|
| `CaomeiDropdownMenu` | `v-model:open`、`modal`（默认 `false`）、`dir` | 逻辑根容器，无 DOM |
| `CaomeiDropdownMenuTrigger` | `disabled`、`unstyled` | 触发器，渲染 `<button>`；`as-child` + `unstyled` 可复用自定义按钮而不继承内建外观 |
| `CaomeiDropdownMenuContent` | `model`、`side`（`bottom`）、`sideOffset`（`4`）、`align`（`start`）、`alignOffset`（`0`）、`loop`（`true`）、`forceMount` | 弹出面板，内含 Portal；`model` 为数据驱动条目 |
| `CaomeiDropdownMenuItem` | `disabled`、`shortcut`、`textValue` | 普通条目，抛出 `select` |
| `CaomeiDropdownMenuCheckboxItem` | `v-model`、`disabled`、`shortcut`、`textValue` | 勾选条目，抛出 `select` |
| `CaomeiDropdownMenuRadioGroup` | `v-model` | 单选组容器 |
| `CaomeiDropdownMenuRadioItem` | `value`、`disabled`、`shortcut`、`textValue` | 单选条目，抛出 `select` |
| `CaomeiDropdownMenuGroup` | — | 分组容器 |
| `CaomeiDropdownMenuLabel` | — | 分组标题，不可聚焦 |
| `CaomeiDropdownMenuSeparator` | — | 分隔线 |

> 条目默认以文本内容参与 typeahead；内容复杂或带 `shortcut` 时建议传入 `textValue`，避免快捷键提示被计入匹配。

## 无障碍

- 遵循 WAI-ARIA Menu Button 模式：触发按钮输出 `aria-haspopup="menu"` 与 `aria-expanded`，条目按语义渲染 `menuitem` / `menuitemcheckbox` / `menuitemradio`，面板为 `role="menu"`。
- 键盘：触发器上 `Enter` / 空格 / `ArrowDown` 打开并聚焦首个条目；条目间用 `ArrowUp` / `ArrowDown` 移动，`Home` / `End` 跳转，`Enter` / 空格选中，`Esc` 关闭并把焦点还给触发器。
- 默认 `modal: false` 为非模态：不禁用外部交互、不锁定页面滚动、不圈定焦点（`Tab` 可移出菜单），避免滚动条消失引起布局跳动（见[主题与样式设计 §5.1](../design/theming.md#_5-1-浮层滚动锁与布局稳定性)）；传入 `modal` 时锁定页面滚动、圈定焦点并隐藏背景。

## 样式定制

样式基于 CSS variables，保持低特异性便于覆盖：

| 变量 | 默认 | 说明 |
|------|------|------|
| `--caomei-dropdown-menu-z-index` | `1050` | 面板层级（高于 Dialog 的 1001，低于 Toast 的 1100） |
| `--caomei-dropdown-menu-min-width` | `9rem` | 面板最小宽度（窄屏收敛为 `min(9rem, 可用宽)`，上限亦取可用宽，见[响应式设计 §3](../design/responsive.md) 矩阵 #3） |
| `--caomei-dropdown-menu-padding` | `--caomei-space-1` | 面板内边距 |
| `--caomei-dropdown-menu-bg` | `--caomei-color-bg` | 面板背景色 |
| `--caomei-dropdown-menu-border` | `--caomei-color-border` | 面板描边色 |
| `--caomei-dropdown-menu-item-gap` | `--caomei-space-2` | 条目内元素间距 |
| `--caomei-dropdown-menu-item-padding-x` | `--caomei-space-2` | 条目水平内边距 |
| `--caomei-dropdown-menu-item-padding-y` | `--caomei-space-2` | 条目垂直内边距 |
| `--caomei-dropdown-menu-item-highlighted-bg` | `--caomei-color-bg-elevated` | 条目高亮背景 |
| `--caomei-dropdown-menu-indicator-width` | `1em` | 勾选 / 单选指示位宽度 |
| `--caomei-dropdown-menu-separator-color` | `--caomei-color-border` | 分隔线颜色 |
| `--caomei-dropdown-menu-trigger-gap` | `--caomei-space-1` | 触发器内元素间距 |
| `--caomei-dropdown-menu-trigger-padding-x` | `--caomei-space-3` | 触发器水平内边距 |
| `--caomei-dropdown-menu-trigger-padding-y` | `--caomei-space-2` | 触发器垂直内边距 |
| `--caomei-dropdown-menu-trigger-border` | `--caomei-color-border` | 触发器描边色 |
| `--caomei-dropdown-menu-trigger-bg` | `--caomei-color-bg` | 触发器背景色 |

```css
.caomei-dropdown-menu__content {
    --caomei-dropdown-menu-min-width: 12rem;
    --caomei-dropdown-menu-item-highlighted-bg: #f1f5f9;
}
```

## 从 PrimeVue 迁移

PrimeVue 的 `<Menu :model :popup>` + `ref.toggle(event)` 是「命令式弹出 + 外部锚点」形态；本库为声明式组合：**原触发按钮本身就是触发器**（锚点即该按钮，等价于 `toggle(event)` 的事件坐标锚定），面板恒经 Portal 弹出。逐处落点见下表。

```vue
<!-- PrimeVue：命令式，以事件坐标为锚点 -->
<Button icon="pi pi-ellipsis-h" @click="toggle" />
<Menu ref="menu" :model="items" :popup="true" />
```

```ts
const menu = ref()
const toggle = (event: Event): void => menu.value.toggle(event)
```

```vue
<!-- caomei-ui：原按钮即触发器，锚点一致 -->
<CaomeiDropdownMenu>
  <CaomeiDropdownMenuTrigger as-child unstyled>
    <CaomeiButton variant="secondary" label="操作">
      <template #icon><CaomeiIcon :icon="Ellipsis" /></template>
    </CaomeiButton>
  </CaomeiDropdownMenuTrigger>
  <CaomeiDropdownMenuContent :model="items" />
</CaomeiDropdownMenu>
```

| PrimeVue | 本组件 |
| --- | --- |
| `<Menu :model="items" :popup="true" />` | `<CaomeiDropdownMenu>` + `<CaomeiDropdownMenuTrigger>` + `<CaomeiDropdownMenuContent :model="items" />` |
| `:popup`（弹出模式） | 无对应 prop：本库面板恒经 Portal 弹出，迁移时删除 |
| `ref.toggle(event)` / `show(event)`（以事件坐标为锚点） | 把原触发按钮本身作为 `CaomeiDropdownMenuTrigger`（锚点即该按钮）；`as-child` 复用自定义按钮时加 `unstyled`，否则内建外观类会合并到子元素 |
| `hide()` | 受控 `v-model:open`（根组件） |
| `model` 的 `label` / `icon` / `command` / `disabled` / `separator` | `model` 同名字段；`icon` 由字符串类名改为 `@lucide/vue` 组件；`command` 载荷 `{ originalEvent, item }` → `{ item, originalEvent }`（同形） |
| `#item` / `#itemicon` 插槽 | 默认插槽 + `model.icon`；需要完全自定义时改用声明式条目 |
| `append-to` / `auto-z-index` / `base-z-index` | 未实现（面板恒挂 `body`；层级经 `--caomei-dropdown-menu-z-index`） |
| `show` / `hide` 事件 | 监听 `v-model:open` |
| `aria-label` / `aria-labelledby` | 面板可访问名经属性透传到 `CaomeiDropdownMenuContent` |

**未实现 / 未暴露**：`MenuItem.items`（嵌套子菜单；迁移时改为 `CaomeiDropdownMenuGroup` + `CaomeiDropdownMenuLabel` 平铺分组）、`MenuItem.class` / `style` / `key`（逐条目类名与内联样式；需要时改用声明式条目 + 原生属性）、`MenuItem.url` / `target`（导航；迁到 `command` 内自行跳转）、`MenuItem.visible`（条件渲染由调用方过滤数组）与 `label` / `disabled` 的函数形态（`disabled` 传布尔即可）；`#start` / `#end` / `#submenulabel` 插槽、`tabindex`、以及 PrimeVue 的 `unstyled`（其语义为「去除主题样式」，与 Trigger 的 `unstyled`（去除触发器外观类）不同）。

> 迁移流程与通用陷阱见[从 PrimeVue 迁移](../guide/primevue-migration.md)。

<ComponentApi name="dropdown-menu" />
