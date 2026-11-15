# BackTop 回到顶部

BackTop 是常驻页面的回顶按钮：滚动超过阈值后出现在右下角，点击回到目标容器顶部。

## 基础用法

`label` 是可访问名；缺省取当前语言的「回到顶部」。`target` 缺省为 `window`，也可传 CSS 选择器或元素，用于监听指定滚动容器。

<demo
    vue="../examples/back-top/basic.vue"
    ssg="true"
/>

## 滚动目标与阈值

- `target`：`window`（缺省）/ CSS 选择器 / 元素。选择器无匹配或非法时回退 `window`；目标元素须在挂载时已存在。
- `threshold`：显示阈值，单位 px，默认 `200`；滚动距离**严格大于**阈值才显示。
- 目标变化或阈值变化会立即按新值重算显隐。

## 回顶行为

- 点击后调用目标容器的 `scrollTo({ top: 0 })`；`prefers-reduced-motion: reduce` 时用 `behavior: 'auto'`（瞬时），否则 `smooth`。
- 抛出 `click` 事件（原生事件对象），可做额外埋点。
- 默认插槽可替换按钮内容，作用域提供 `visible`。

## 无障碍

- 按钮渲染为原生 `<button type="button">`，可访问名取 `label`，缺省为当前语言文案。
- 默认图标 `aria-hidden="true"`，不重复进入可访问名。
- 固定定位与层级可用 CSS 变量覆盖，层级默认取 `--caomei-z-sticky`（低于所有浮层）。

## 样式定制

| 变量 | 默认 | 说明 |
|------|------|------|
| `--caomei-back-top-right` | `--caomei-space-4` | 距视口右侧 |
| `--caomei-back-top-bottom` | `--caomei-space-4` | 距视口底部 |
| `--caomei-back-top-size` | `2.5rem` | 按钮尺寸（宽高） |
| `--caomei-back-top-radius` | `--caomei-radius-full` | 圆角 |
| `--caomei-back-top-bg` | `--caomei-color-bg-elevated` | 背景色 |
| `--caomei-back-top-color` | `--caomei-color-text` | 图标颜色 |
| `--caomei-back-top-border` | `--caomei-color-border` | 边框颜色 |
| `--caomei-back-top-shadow` | `--caomei-shadow-sm` | 阴影 |
| `--caomei-back-top-z-index` | `--caomei-z-sticky` | 层级 |

## 从 PrimeVue 迁移

| PrimeVue `ScrollTop` | 本组件 |
| --- | --- |
| `target="window"` | 省略 `target`（默认 `window`） |
| `target="parent"` | 传父容器元素或选择器；本组件没有 `parent` 哨兵 |
| `threshold`（默认 400） | 同名，**默认 200** |
| `icon` | 用默认插槽替换内容 |
| `behavior`（v4+） | 不提供开关，按 `prefers-reduced-motion` 自动选择 `smooth` / `auto` |
| `buttonProps`（v4+） | 无对应；样式用 CSS 变量，其余属性按常规透传 |
| locale `aria.scrollTop` | `label`（缺省取当前语言） |

> 迁移流程与通用陷阱见[从 PrimeVue 迁移](../guide/primevue-migration.md)。

<ComponentApi name="back-top" />
