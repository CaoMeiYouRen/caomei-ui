# Popover 浮层

浮层用于承载与触发元素相关的临时内容（说明、表单、操作），基于 Reka UI Popover 封装，由 `CaomeiPopover` 与 `CaomeiPopoverTrigger` / `CaomeiPopoverContent` / `CaomeiPopoverArrow` / `CaomeiPopoverClose` 组合使用。

## 基础用法

`CaomeiPopover` 通过 `v-model:open` 控制开合（默认非受控）；点击触发器开合，按 Esc 或点击面板外部关闭。

> `class` / `style` 请落在触发器或内容上；根容器不渲染 DOM，其上的其余属性不会生效。

<demo
    vue="../examples/popover/basic.vue"
    ssg="true"
/>

## 弹出方向

`CaomeiPopoverContent` 支持 `side`（`top` / `right` / `bottom` / `left`）、`align`（`start` / `center` / `end`）与 `side-offset` / `align-offset`，并默认启用碰撞检测自动翻转（可用 `avoid-collisions="false"` 关闭）。

<demo
    vue="../examples/popover/placement.vue"
    ssg="true"
/>

## 箭头与关闭

`CaomeiPopoverArrow` 渲染指向触发器的箭头；`CaomeiPopoverClose` 渲染点击即关闭的按钮（无可见文本时用 `label` 提供可访问名）。

<demo
    vue="../examples/popover/rich.vue"
    ssg="true"
/>

## 模态

`modal` 默认 `false`（非模态浮层，不锁定页面滚动，避免滚动条消失引起布局跳动）；需要模态行为时设置 `modal`。

```vue
<CaomeiPopover modal>
  <CaomeiPopoverTrigger>打开</CaomeiPopoverTrigger>
  <CaomeiPopoverContent>模态浮层</CaomeiPopoverContent>
</CaomeiPopover>
```

## 无障碍

- 触发器为原生 `<button>`，输出 `aria-haspopup="dialog"`、`aria-expanded` 与 `aria-controls`。
- 面板为 `role="dialog"`，并通过 `aria-labelledby` 固定关联触发器的可访问名；可用 `aria-label` 覆盖面板名称（`aria-labelledby` 由组件接管，传入不会生效）。
- 打开后将焦点移入面板：存在可聚焦元素时聚焦首个元素，否则聚焦面板容器（`tabindex="-1"`）；关闭后焦点回到触发器；非模态下按 Esc 或点击外部关闭。
- 面板挂载于 body（Portal），层级高于表单类浮层。

## 样式定制

样式基于 CSS variables，保持低特异性便于覆盖：

| 变量 | 默认 | 说明 |
|------|------|------|
| `--caomei-popover-z-index` | `1050` | 面板层级 |
| `--caomei-popover-width` | `max-content` | 面板宽度 |
| `--caomei-popover-min-width` | `12rem` | 面板最小宽度 |
| `--caomei-popover-max-width` | `min(20rem, 可用宽度)` | 面板最大宽度 |
| `--caomei-popover-padding` | `--caomei-space-3` | 面板内边距 |
| `--caomei-popover-bg` | `--caomei-color-bg` | 面板背景色 |
| `--caomei-popover-border` | `--caomei-color-border` | 面板描边色 |
| `--caomei-popover-radius` | `--caomei-radius-md` | 面板圆角 |
| `--caomei-popover-arrow-bg` | 面板背景色 | 箭头填充色 |
| `--caomei-popover-trigger-height` | `--caomei-control-height-md` | 触发器高度 |
| `--caomei-popover-trigger-gap` | `--caomei-space-1` | 触发器内图标与文本间距 |
| `--caomei-popover-trigger-padding-x` | `--caomei-space-3` | 触发器水平内边距 |
| `--caomei-popover-trigger-bg` | `--caomei-color-bg` | 触发器背景色 |
| `--caomei-popover-trigger-border` | `--caomei-color-border` | 触发器描边色 |
| `--caomei-popover-trigger-radius` | `--caomei-radius-md` | 触发器圆角 |

```css
.caomei-popover__content {
    --caomei-popover-max-width: 24rem;
    --caomei-popover-radius: var(--caomei-radius-lg);
}
```

## 组合件 API

| 组件 | 关键属性 | 说明 |
|------|----------|------|
| `CaomeiPopover` | `modal`（默认 `false`），`v-model:open` | 根容器，控制开合与模态 |
| `CaomeiPopoverTrigger` | `disabled` | 触发器，渲染为原生 `<button>` |
| `CaomeiPopoverContent` | `side`、`sideOffset`、`align`、`alignOffset`、`avoidCollisions`、`forceMount`、`disableOutsidePointerEvents` | 浮层面板，经 Portal 挂载 |
| `CaomeiPopoverArrow` | `width`、`height` | 指向触发器的箭头 |
| `CaomeiPopoverClose` | `label` | 点击关闭的按钮 |

<ComponentApi name="popover" />
