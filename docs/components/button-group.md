# ButtonGroup 按钮组

按钮组把多个按钮拼接为单一控件：相邻按钮的边框自动合并、内侧圆角去除，常用于一组紧密相关的操作。

## 基础用法

<demo
    vue="../examples/button-group/basic.vue"
    ssg="true"
/>

## 图标与垂直组合

`orientation="vertical"` 让按钮纵向堆叠：

<demo
    vue="../examples/button-group/variants.vue"
    ssg="true"
/>

## 边框拼接约定

- 成员按 DOM 顺序拼接：首成员保留起始侧圆角、末成员保留结束侧圆角，中间成员去圆角。
- 非末成员的内侧边框被移除，避免相邻边框叠成 2px 双线；聚焦成员会自动抬升到相邻按钮之上。
- 成员保持各自的内容宽度（`display: inline-flex` 容器随内容收缩）。

## 无障碍

- 容器仅承担布局职责，不改变成员的语义、焦点顺序与 ARIA 属性。
- 只放图标按钮时，请为按钮提供可访问名（如 `Button` 的 `label`）。

## 样式定制

按钮组不提供组级圆角变量：外侧圆角沿用各成员自身的圆角（默认 `--caomei-radius-md`，`Button` 的 `rounded` 则为 `--caomei-radius-full`），组仅负责去除成员内侧圆角与边框。

## 从 PrimeVue 迁移

PrimeVue 的 `ButtonGroup` 与本组件同为**拼接容器**（PrimeVue 侧 props 仅 `dt` / `pt` / `ptOptions` / `unstyled`，无功能 props；本组件另有布局 prop `orientation`），成员即普通按钮：

| PrimeVue | 本组件 |
| --- | --- |
| `<ButtonGroup>` | `<CaomeiButtonGroup>`（同为无 props 拼接容器） |
| `<Button>` 成员 | `CaomeiButton`；拼接规则按成员根元素去内侧圆角与边框 |
| 无 | `orientation`（`horizontal` / `vertical`）为本库新增；PrimeVue 无纵向组合支持 |
| `pt` / `dt` / `ptOptions` / `unstyled` | 未实现 / 未暴露（主题透传机制未暴露，样式经 CSS 变量与类名覆盖） |

> 迁移时把 `<ButtonGroup>` 与其中的 `<Button>` 换成 `Caomei` 前缀即可；`pt` / `dt` / `unstyled` 无等价物，主题定制改走 CSS 变量。

> 迁移流程与通用陷阱见[从 PrimeVue 迁移](../guide/primevue-migration.md)。

<ComponentApi name="button-group" />
