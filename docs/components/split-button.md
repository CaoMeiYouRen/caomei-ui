# SplitButton 分裂按钮

分裂按钮由一个主按钮与一个下拉按钮组成：主按钮触发默认操作，下拉按钮展开一组次要操作。自建实现，内部组合 `CaomeiButton` 与 `CaomeiDropdownMenu`。

## 基础用法

主按钮触发 `click`，下拉菜单由 `model` 描述；菜单项通过 `command` 回调执行。主按钮的可见文本放入默认插槽，图标放入 `#icon` 插槽；`label` 为主按钮的**不可见可访问名**（映射 `aria-label`，供图标按钮场景使用），`menuLabel` 同理作用于下拉按钮。

<demo
    vue="../examples/split-button/basic.vue"
    ssg="true"
/>

## 外观与状态

主按钮与下拉按钮共用 `variant` / `tone` / `size` / `rounded`；下拉按钮仅显示图标并保留内建可访问名。`disabled` 同时禁用两个按钮，`loading` 仅让主按钮进入加载态（下拉仍可用）。

<demo
    vue="../examples/split-button/options.vue"
    ssg="true"
/>

## 菜单数据

`model` 为菜单项数组，每项支持：

| 字段 | 说明 |
| --- | --- |
| `label` | 菜单项文本 |
| `icon` | 菜单项图标，传 `@lucide/vue` 图标组件 |
| `command` | 选中回调，收到 `{ item, originalEvent }` |
| `disabled` | 是否禁用 |
| `separator` | 渲染为分隔线（此时忽略其余字段） |

菜单方向由 `menuSide`（默认 `bottom`）与 `menuAlign`（默认 `end`）控制。

> 迁移映射（PrimeVue → caomei-ui）：`label` → 默认插槽（可见文本）；本库 `label` 统一为**不可见可访问名**（见[开发规范 §组件设计](../standards/development.md)），图标按钮场景改传 `label`。`icon` → `#icon` 插槽（主按钮，传 `@lucide/vue` 组件，非字符串类名）；`model` → `model`（`MenuItem` 的 `label` / `icon` / `command` / `disabled` 支持；`icon` 改传组件）；`severity` → `tone`；`text` → `variant="ghost"`；`outlined` → `variant="secondary"`；`size="small"` / `"large"` → `sm` / `lg`；`rounded` → `rounded`。**未实现 / 未暴露（下游零用量）**：`MenuItem` 的 `items` 子菜单、`url` / `target` 导航、`menuButtonIcon` / `dropdownIcon`（下拉按钮图标固定）、`menuButtonProps` / `buttonProps`（改用根元素属性与 `#icon` 插槽）、`raised` / `plain`、`appendTo` / `baseZIndex` / `autoZIndex`（面板经 Portal 挂载，层级固定）；`fluid` 未实现（按内容宽度）。

> 根元素为 `CaomeiButtonGroup`（复用两按钮拼接规则），`class` / `style` / `id` 等属性透传到该容器；`orientation` 等 ButtonGroup 自身 prop 不属于 SplitButton 的 API，请勿传入。

## 无障碍

- 主按钮的可访问名优先级为 `label` > 透传 `aria-label`（无内建兜底文案）；下拉按钮带内建可访问名（「更多操作」/ "More actions"），可通过 `menuLabel` 覆盖；仅图标时该名称即其可访问名。
- 下拉按钮暴露 `aria-haspopup="menu"` 与 `aria-expanded`，菜单支持方向键导航与 Esc 关闭（由 Reka DropdownMenu 提供）。

<ComponentApi name="split-button" />
