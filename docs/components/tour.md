# Tour 引导

Tour 用于分步介绍页面功能：全视口遮罩挖空当前目标，卡片贴目标展示说明，用户逐步前进或随时跳过。Reka UI 没有对应原语，组件为自建实现。

## 基础用法

`steps` 描述每一步的目标与文案，`target` 支持选择器、元素或返回元素的函数（函数在每次重算时调用，适合配合模板 `ref`）。遮罩形态下页面滚动被锁定、背景不可交互，`Escape` 关闭并把焦点归还打开前的元素。

<demo
    vue="../examples/tour/basic.vue"
    ssg="true"
/>

## 受控开合与步骤

`v-model:open` 控制开合（缺省 `true`，即不绑定时挂载即打开；需要延迟触发时先置 `false`），`v-model:current` 控制当前步骤。通过 `next` / `prev` / `skip` / `finish` 事件可接管埋点或跳转；索引越界会被钳位并写回 `update:current`，`steps` 收缩时同样收敛到有效区间。

<demo
    vue="../examples/tour/controlled.vue"
    ssg="true"
/>

## 自定义内容

默认插槽接管正文，作用域提供 `step` / `index` / `total`；标题仍由 `step.title` 渲染。需要富内容（列表、链接、表单控件）时优先使用插槽，而不是拼接长字符串。

<demo
    vue="../examples/tour/custom.vue"
    ssg="true"
/>

## 遮罩、滚动锁与非模态形态

`mask` 默认开启：

- 绘制遮罩并挖空目标，高亮区外扩距离由 `padding` 控制；
- 锁定页面滚动（移除滚动条并按滚动条宽度补偿 `body` 的 `padding-right`，见[主题与样式设计 §5.1](../design/theming.md#_5-1-浮层滚动锁与布局稳定性)），遮罩完整覆盖视口；
- 背景置于 `inert`，键盘焦点在层内循环，以 `role="dialog"` + `aria-modal="true"` 暴露；
- 挖空区不放行点击，页面整体不可交互。

关闭 `mask` 后为非模态形态：不绘制遮罩、不锁滚动、背景保持可交互，键盘可以正常离开卡片，以 `role="region"` 暴露。

<demo
    vue="../examples/tour/mask-off.vue"
    ssg="true"
/>

> 暗色主题下请把页面底色设在 `html` / `body`：锁滚动时补偿出来的 `padding-right` 留白由页面底色承载，只给内层容器设底色会在视口右缘露出一条浅色竖带。

## 定位与重算

- `placement` 为卡片默认方位（`top` / `bottom` / `left` / `right`），`steps[].placement` 可按步骤覆盖；该侧空间不足时翻到对侧，两侧都不足时选空间更大的一侧，并整体钳位到视口留白内。
- `offset` 为卡片与目标的间距，`padding` 为高亮区外扩距离；`steps[].offset` 可按步骤覆盖。
- 步骤切换时会把目标滚动到可视区（`scrollIntoView`，尊重 `prefers-reduced-motion`）；任意滚动容器滚动、窗口尺寸变化、`steps` 变更后都会重算。
- 目标缺失或选择器非法时降级为「无挖空 + 居中卡片 + 整屏遮罩」，不抛异常；目标与视口无交集时同样退回整屏遮罩。

## 无障碍

- 浮层根的可访问名取 `label`，缺省为当前语言的「产品引导」。
- 卡片以 `role="group"` 暴露，可访问名取当前步骤标题；打开与每次步进都会把焦点放到卡片上，读屏可获步骤名。
- 遮罩形态下 `Tab` / `Shift+Tab` 在卡片内循环；`Escape` 关闭并归还焦点。`closable=false` 时不渲染「跳过」，`Escape` 也不关闭。
- 被遮罩的背景处于 `inert`，不进入可访问性树也不可聚焦。

## 样式定制

| 变量 | 默认 | 说明 |
|------|------|------|
| `--caomei-tour-z-index` | `--caomei-z-toast` | 浮层层级 |
| `--caomei-tour-mask-bg` | `--caomei-color-mask` | 遮罩与高亮外圈颜色 |
| `--caomei-tour-spotlight-radius` | `--caomei-radius-md` | 高亮挖空区圆角 |
| `--caomei-tour-card-width` | `min(20rem, 100% - 2 × var(--caomei-space-4))` | 卡片宽度 |
| `--caomei-tour-card-max-height` | `100% - 2 × var(--caomei-space-4)` | 卡片最大高度（超出滚动） |
| `--caomei-tour-card-padding` | `--caomei-space-4` | 卡片内边距 |
| `--caomei-tour-card-radius` | `--caomei-radius-lg` | 卡片圆角 |
| `--caomei-tour-card-bg` | `--caomei-color-bg-elevated` | 卡片背景 |
| `--caomei-tour-card-border` | `--caomei-color-border` | 卡片边框 |

<ComponentApi name="tour" />
