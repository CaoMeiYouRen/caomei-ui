# HoverCard 悬停卡片

悬停 / 聚焦后浮出补充信息的卡片，用于「术语解释、用户简介、链接预览」这类非必要但仍需可访问的场景。基于 Reka UI 的 `HoverCard` 原语封装，提供触发器 / 内容 / 箭头三层组件。

## 基础用法

`CaomeiHoverCardTrigger` 固定渲染为可聚焦按钮（不透传 `as` / `asChild`）；`CaomeiHoverCardContent` 经 portal 浮出，默认位于触发器下方并与起始边对齐。

<demo
    vue="../examples/hover-card/basic.vue"
    ssg="true"
/>

## 打开与关闭延迟

`openDelay`（默认 200ms）控制悬停后展开的时间，`closeDelay`（默认 100ms）控制离开后的收起时间；指针移入卡片再移出同样按 `closeDelay` 收起。

<demo
    vue="../examples/hover-card/delay.vue"
    ssg="true"
/>

## 交互与无障碍

- 悬停与**键盘聚焦**都会展开；`Esc` 关闭（键盘路径下焦点留在触发器，指针路径同样关闭），指针与焦点离开后按 `closeDelay` 关闭。
- 触发器是可聚焦按钮；`disabled` 时不渲染浮层、悬停与聚焦都不展开（该信息源对指针与键盘同时移除）。卡片内容是补充信息，不应承载必须完成的操作用户才能继续。
- 卡片为**非模态**浮层：背景保持可交互，点击外部即关闭。
- `v-model:open` 可受控开合；未绑定时为非受控。

## 属性

| 组件 | 主要 props |
|------|------|
| `CaomeiHoverCard` | `v-model:open`、`openDelay`、`closeDelay` |
| `CaomeiHoverCardTrigger` | `disabled` |
| `CaomeiHoverCardContent` | `side`、`align`、`sideOffset`、`alignOffset`、`forceMount` |
| `CaomeiHoverCardArrow` | — |

## 样式定制

| 变量 | 默认 | 说明 |
|------|------|------|
| `--caomei-hover-card-max-width` | `20rem` | 卡片最大宽度 |
| `--caomei-hover-card-padding` | `--caomei-space-3` | 卡片内边距 |
| `--caomei-hover-card-border` | `--caomei-color-border` | 卡片描边 |
| `--caomei-hover-card-bg` | `--caomei-color-bg-elevated` | 卡片底色（箭头同色） |
| `--caomei-hover-card-z-index` | `--caomei-z-dropdown` | 卡片层级 |

<ComponentApi name="hover-card" />
