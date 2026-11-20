# Cell 单元格

单元格是移动端列表的基本行：承载标题、描述、右值与前后插槽，点击语义交由宿主元素（`div` / `button` / `a`）承载。

## 基础用法

标题、描述与右侧值由属性提供，行高下限取 `--caomei-control-height-lg`（桌面 44px，`data-density="touch"` 下 52px），整行即命中区。

<demo
    vue="../examples/cell/basic.vue"
    ssg="true"
/>

## 插槽与宿主语义

- `#prefix` / `#suffix`：行首与右侧附加区域（图标、开关、徽标等）。
- `#title` / `#description` / `#value`：覆盖对应属性文案。
- `as` 取 `div`（默认）/ `button` / `a`：可点击行请使用 `button` 或带 `href` 的 `a`，由原生元素提供焦点、键盘与点击语义。
- `arrow` 显示右侧进入指示箭头（装饰性，对辅助技术隐藏）。

<demo
    vue="../examples/cell/slots.vue"
    ssg="true"
/>

## 点击与进入态

`as="button"` 时默认 `type="button"`，可用 `type` 切换为 `submit` / `reset`；`as="a"` 时透传 `href` 与 `target`。组件本身不绑定点击行为，选择、跳转与埋点由使用方在宿主元素上处理。

## 无障碍

- 可点击行使用真实交互元素；`button` / `a` 自带键盘触达，不需要额外 `tabindex`。
- 标题、描述与右值都是普通文本，不引入标题层级；需要标题语义时用 `#title` 传入真实标题元素。
- 进入指示箭头为装饰性内容，已标记 `aria-hidden`。

## 样式定制

| 变量 | 默认 | 说明 |
| --- | --- | --- |
| `--caomei-cell-min-height` | `--caomei-control-height-lg` | 行高下限 |
| `--caomei-cell-padding-y` / `--caomei-cell-padding-x` | `--caomei-space-2` / `--caomei-space-3` | 行内边距 |
| `--caomei-cell-gap` | `--caomei-space-3`（窄屏 `--caomei-space-2`） | 行内分区间距 |

<ComponentApi name="cell" />
