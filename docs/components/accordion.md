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

## 从 PrimeVue 迁移

PrimeVue v4 的 Accordion 为四件组合，本库合并为两件：

| PrimeVue | 本组件 |
| --- | --- |
| `<Accordion v-model:value>` + `<AccordionPanel :value>` + `<AccordionHeader>` + `<AccordionContent>` | `<CaomeiAccordion v-model>` + `<CaomeiAccordionItem :value :title>` |
| `v-model:value` | `v-model`（值域为 `string \| string[]`；`number` 需转字符串） |
| `multiple`（默认 `false`） | `type="multiple"`（默认 `single`；属性形态由布尔 `multiple` 改为枚举 `type`，默认语义一致） |
| `lazy`（默认 `false`；`true` 时隐藏面板不渲染） | `unmountOnHide`（默认 `true`；同向、默认相反，见下） |
| `<AccordionHeader>` 文本 | `title`（富内容改用 `#trigger` 插槽） |
| `<AccordionContent>` | 默认插槽 |
| panel 级 `disabled` | 条目 `disabled`（另有根级 `disabled`） |
| v3 `activeIndex`（v4 已弃用）/ `header` | `v-model` 的字符串值 / `title` |
| 无 | `collapsible`、`defaultValue`（非受控初始展开）、根级 `disabled` 与 `#trigger` 插槽为本库新增 |

> `lazy` 与 `unmountOnHide` 语义同向、默认相反：`lazy` 默认 `false`（保留 DOM），`unmountOnHide` 默认 `true`（卸载）。`:lazy="true"` 迁移后无需改动（默认即卸载）；需要保留 DOM 时改传 `:unmount-on-hide="false"`。

> **已知差异（有意）**：① PrimeVue single 模式**恒可收起**（再点已展开项即置空），本库默认 `collapsible=false`，需要一致时显式传 `collapsible`；② 触发器为 `<h3>` 包裹原生 `<button>`（WAI-ARIA Accordion 推荐），PrimeVue v4 直接渲染 `<button>`；③ 指示箭头为内置 `ChevronDown`（展开旋转 180°），不提供 `expandIcon` / `collapseIcon`。

**未实现（已登记为后续补强项，交付后同步本节）**：`expandIcon` / `collapseIcon` 与 `#expandicon` / `#collapseicon` 插槽（自定义指示图标；富内容可经 `#trigger` 自带图标，内置箭头仍保留、不随 `#trigger` 移除）、`tabindex`（根级；触发器各自可聚焦）、`selectOnFocus`（聚焦即切换）、`AccordionPanel` 与 `AccordionHeader` 的 `as` / `asChild` 多态渲染、`AccordionHeader` 的 `#toggleicon` 插槽，以及 v4 已弃用的 `update:activeIndex` / `tab-open` / `tab-close` / `tab-click` 事件（改用 `v-model`）。

> 迁移流程与通用陷阱见[从 PrimeVue 迁移](../guide/primevue-migration.md)。

<ComponentApi name="accordion" />
