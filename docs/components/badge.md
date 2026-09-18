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

- `dot` 模式无可见文本，建议通过 `label` 提供可访问名（映射 `aria-label` 并补充 `role="img"`）；未提供 `label` 时对辅助技术隐藏（此时透传的 `aria-label` 也会被 `aria-hidden` 抵消）。
- 非 `dot` 模式下可访问名 `label` 优先级高于透传的 `aria-label`，未提供（或为空）时透传值生效。
- 数值模式下 `label` 会覆盖可见文本的朗读内容，一般无需设置。
- 叠加模式保留插槽内容语义，徽标为兄弟节点；`class` 等透传属性落在包裹容器 `.caomei-badge-wrapper` 上（徽标自身的可访问名取 `label`）。

## 从 PrimeVue 迁移

| PrimeVue | 本组件 |
| --- | --- |
| `value` | `value`（超过 `max` 时截断为 `max+`；`null` / 空串不渲染） |
| `severity` | `tone`（`secondary` / `contrast` → `neutral`、`info` → `primary`、`success` → `success`、`warn` → `warning`、`danger` → `danger`；其中 `info` / `contrast` 为有损近似） |
| `size`（`small` / `large` / `xlarge`） | `size`（`sm` / `md` / `lg`） |
| 无 | `variant`（`soft` / `solid` / `outline`）为本库新增 |

**已知差异（有意）**：默认 `tone` 为 `danger`、`variant` 为 `solid`（PrimeVue 未传 `severity` 时走默认主色样式）；`max`（数值上限）、`dot`（仅圆点不显示数值）、`label`（可访问名）与「默认插槽作为叠加角标」为本库新增。

> 迁移流程与通用陷阱见[从 PrimeVue 迁移](../guide/primevue-migration.md)。

<ComponentApi name="badge" />
