# Tabbar 标签栏

标签栏用于在移动端切换顶层视图。它是**展示层**：`v-model` 只维护选中值，**不接 vue-router、不做页面切换**；路由跳转由使用方在条目点击后自行处理。

## 基础用法

`CaomeiTabbar` 维护单个选中值，`CaomeiTabbarItem` 的 `value` 与之一致时带 `aria-current="page"`。

<demo
    vue="../examples/tabbar/basic.vue"
    ssg="true"
/>

## 数据驱动与自定义内容

- `items` 传 `{ value, label, icon, badge, disabled }` 数组，组件按序渲染条目；提供 `items` 后默认插槽不再渲染。
- `#item` 插槽（作用域 `{ item, active }`）替换条目文案；条目自身的 `#icon` 插槽（作用域 `{ active }`）可自定义图标。
- 图标传 `@lucide/vue` 组件，不传字符串类名。

| `CaomeiTabbarItem` 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `value` | `string \| number` | 必填 | 与 `v-model` 比较得出选中态 |
| `label` | `string` | `''` | 文案 |
| `icon` | `Component` | — | 图标组件 |
| `badge` | `string \| number` | — | 角标内容 |
| `disabled` | `boolean` | `false` | 禁用，点击不抛事件 |

| 插槽 | 作用域 | 说明 |
| --- | --- | --- |
| `default` | `{ active }` | 文案内容 |
| `icon` | `{ active }` | 图标内容 |

## 禁用与角标

`disabled` 条目不可点击且不触发 `update:modelValue`；`badge` 以角标叠加在图标右上角，图标缺失时退化为独立徽标。

## 安全区与吸底

- 容器底部内边距叠加 `--caomei-safe-area-bottom`，在 iPhone home indicator 上不被遮挡。
- `fixed` 开启后以 `position: fixed` 吸底（层级取 `--caomei-z-sticky`）；默认不吸底，由使用方决定布局。

## 无障碍

- 根节点为 `nav`，可访问名取 `label` > 透传 `aria-label` > 当前语言的「主导航」文案；`NavBar` 的默认名是当前语言的「导航栏」，两者默认不同名，但若把 `label` 设为同一个值（或透传同名 `aria-label`），同页会出现两个同名 `nav` landmark，需显式区分。
- 只有选中条目带 `aria-current="page"`，任一时刻至多一个。
- 条目为原生 `button`，键盘可逐项触达；标签栏不劫持方向键。

## 样式定制

| 变量 | 默认 | 说明 |
| --- | --- | --- |
| `--caomei-tabbar-bg` | `--caomei-color-bg` | 标签栏背景 |
| `--caomei-tabbar-border` | `--caomei-color-border` | 顶部分隔线 |
| `--caomei-tabbar-item-min-height` | `--caomei-control-height-lg` | 条目高度下限（≥44px） |
| `--caomei-tabbar-icon-size` | `22px` | 图标字号 |
| `--caomei-tabbar-padding-y` / `--caomei-tabbar-padding-x` | `--caomei-space-1` | 容器上下 / 左右内边距 |
| `--caomei-tabbar-gap` | `--caomei-space-1` | 条目间距 |
| `--caomei-tabbar-item-gap` | `--caomei-space-1` | 条目内图标与文案间距 |

> 表为常用覆盖钩子，非穷举；其余 `--caomei-tabbar-*` 变量同样可直接覆盖。

<ComponentApi name="tabbar" />
