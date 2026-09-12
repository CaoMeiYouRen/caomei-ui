# Badge 徽标

徽标用于展示数量或状态提示，可独立使用，也可叠加在其它元素右上角。

## 基础用法

通过 `value` 展示数字或文本；单个数字或窄字符渲染为正圆，多字符自动撑为胶囊。

<demo
    vue="../examples/badge/basic.vue"
    ssg="true"
/>

## 色调与变体

通过 `tone` 切换语义色调，通过 `variant` 切换 `soft` / `solid` / `outline`。

<demo
    vue="../examples/badge/tones.vue"
    ssg="true"
/>

## 数值上限

`value` 为数字且超过 `max` 时显示 `max+`。

<demo
    vue="../examples/badge/max.vue"
    ssg="true"
/>

## 圆点与叠加

提供默认插槽时为叠加模式，徽标定位在内容右上角；`dot` 仅显示圆点。

<demo
    vue="../examples/badge/overlay.vue"
    ssg="true"
/>

## 无障碍

- `dot` 模式无可见文本，建议通过 `label` 提供可访问名（映射 `aria-label` 并补充 `role="img"`）；未提供时对辅助技术隐藏。
- 数值模式下 `label` 会覆盖可见文本的朗读内容，一般无需设置。
- 叠加模式保留插槽内容语义，徽标为兄弟节点；`class` 等透传属性落在包裹容器 `.caomei-badge-wrapper` 上。

<ComponentApi name="badge" />
