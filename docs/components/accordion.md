# Accordion 折叠面板

折叠面板将内容分节收纳，点击标题逐项展开 / 收起，基于 Reka UI Accordion 封装。

## 基础用法

`CaomeiAccordion` 承载 `v-model` 展开项，`CaomeiAccordionItem` 定义单个分节：`value` 为唯一标识，`title` 为触发器文本，默认插槽为面板内容。

`type="single"`（默认）同时只展开一项；`collapsible` 允许再次点击收起已展开项。

<demo
    vue="../examples/accordion/basic.vue"
    ssg="true"
/>

## 多开模式

`type="multiple"` 允许同时展开多项，此时 `v-model` / `defaultValue` 为字符串数组。

<demo
    vue="../examples/accordion/multiple.vue"
    ssg="true"
/>

## 默认展开与禁用

`defaultValue` 指定初始展开项；条目的 `disabled` 禁用单项，根组件的 `disabled` 可禁用整个面板。示例下半部分同时演示 `#trigger` 自定义触发器。

<demo
    vue="../examples/accordion/states.vue"
    ssg="true"
/>

## 自定义触发器

`title` 仅承载纯文本；需要图标等富内容时改用 `#trigger` 插槽（见上一示例的下半部分）。面板内容使用默认插槽。

> `CaomeiAccordionItem` 的 `title` 为组件 prop，会拦截原生 HTML `title` 提示属性；需要原生 tooltip 时请改用其他方式。

## 组合件 API

| 组件 | 关键 props | 说明 |
|------|-----------|------|
| `CaomeiAccordion` | `v-model`、`type`、`defaultValue`、`collapsible`、`disabled`、`unmountOnHide` | 根容器，提供上下文 |
| `CaomeiAccordionItem` | `value`（必填）、`title`、`disabled`；`#trigger` / 默认插槽 | 单个分节，内部渲染 `h3` 标题与触发器 |

`unmountOnHide` 默认 `true`，收起时卸载面板内容；设为 `false` 后内容保留在 DOM 中并以 `hidden="until-found"` 标记，在支持该属性的浏览器（Chromium 系）中可被页内查找定位，也便于表单保留。

## 无障碍

- 遵循 WAI-ARIA Accordion 模式：标题使用 `<h3>` 包裹原生 `<button>` 触发器，`aria-expanded` 反映展开状态，面板为 `role="region"` 并通过 `aria-labelledby` 关联触发器。
- 键盘：`ArrowUp` / `ArrowDown` 在触发器之间移动焦点，`Home` / `End` 跳到首个 / 末个条目，`Enter` / 空格展开或收起。
- 禁用条目输出 `disabled` 与 `aria-disabled`，不参与交互与键盘导航。

## 样式定制

样式基于 CSS variables，保持低特异性便于覆盖：

| 变量 | 默认 | 说明 |
|------|------|------|
| `--caomei-accordion-border` | `--caomei-color-border` | 容器描边与分隔线颜色 |
| `--caomei-accordion-radius` | `--caomei-radius-md` | 容器圆角 |
| `--caomei-accordion-trigger-gap` | `--caomei-space-3` | 触发器文本与指示箭头间距 |
| `--caomei-accordion-trigger-padding-x` | `--caomei-space-4` | 触发器水平内边距 |
| `--caomei-accordion-trigger-padding-y` | `--caomei-space-3` | 触发器垂直内边距 |
| `--caomei-accordion-title-gap` | `--caomei-space-2` | 自定义触发器中图标与文字间距 |
| `--caomei-accordion-panel-padding` | `--caomei-space-3` | 面板垂直内边距（水平沿用触发器内边距） |

```css
.caomei-accordion {
    --caomei-accordion-border: #d4d4d8;
    --caomei-accordion-radius: 12px;
}
```

<ComponentApi name="accordion" />
