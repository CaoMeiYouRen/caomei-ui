# Sticky 吸顶

让一段内容在滚动到指定偏移后固定在顶部，并在**父容器边界内**自动释放。基于原生 `position: sticky`，不劫持滚动、不改动文档流。

## 基础用法

`offset`（默认 0）是吸顶位置距视口 / 滚动容器顶部的距离。把吸顶元素放进任意可滚动容器即可——组件会监听**最近的可滚动祖先**，而不是永远监听 `window`。

<demo
    vue="../examples/sticky/basic.vue"
    ssg="true"
/>

## 容器边界内吸附

`position: sticky` 的吸附范围由父容器（包含块）天然限定：容器底边到齐时元素被推着走。组件把两种状态暴露成 `data-stuck` / `data-constrained` 与 `change` 事件，便于加阴影、提示或做联动。

<demo
    vue="../examples/sticky/in-container.vue"
    ssg="true"
/>

## 交互与无障碍

- **状态属性**：`data-stuck`（已吸住）与 `data-constrained`（已被容器底边推走）；`change` 事件载荷为 `{ stuck, constrained }`，只在状态真的变化时派发。
- **滚动容器协作**：向上查找 `overflow-y` 为 `auto` / `scroll` / `overlay` 的最近祖先，找不到才回退到 `window`；因此放进 Dialog 内容区、数据面板等内层滚动容器时同样可用。
- **层级**：默认沿用基础层 `--caomei-z-sticky`；需要更高层级时传 `zIndex`（写入组件私有变量，不污染全局档位）。
- **禁用降级**：`disabled` 时退回普通文档流（`position: static`）并清空状态，用于窄屏或「不加吸顶」的分支。
- **无障碍**：吸顶本身不改变语义与焦点顺序；若吸顶条承担导航职责，请使用 `nav` / `role="navigation"` 等语义并用 `label` 或 `aria-label` 命名。
- **注意**：`position: sticky` 要求父级没有 `overflow: hidden`；`height` 受限的祖先才形成滚动面。

## 属性

| 组件 | 主要 props |
|------|------|
| `CaomeiSticky` | `offset`、`zIndex`、`disabled` |

## 事件

| 事件 | 载荷 | 说明 |
|------|------|------|
| `change` | `{ stuck, constrained }` | 吸顶状态变化时触发 |

## 样式定制

| 变量 | 默认 | 说明 |
|------|------|------|
| `--caomei-sticky-bg` | `--caomei-color-bg` | 吸顶元素底色（滚动时避免透出下层内容） |
| `--caomei-sticky-shadow` | `--caomei-shadow-sm` | 吸住时的投影 |
| `--caomei-sticky-z-index` | `--caomei-z-sticky` | 层级（`zIndex` prop 会写入该变量） |

<ComponentApi name="sticky" />
