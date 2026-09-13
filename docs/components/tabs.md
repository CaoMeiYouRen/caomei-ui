# Tabs 选项卡

选项卡在一组同级内容间切换，同一时刻只展示一个面板，基于 Reka UI Tabs 封装。

## 基础用法

选项卡采用组合式 API：`CaomeiTabs` 承载当前项 `v-model` 与 `orientation` 等根级配置，`CaomeiTabList` / `CaomeiTabTrigger` 组成触发器列表，`CaomeiTabContent` 承载各面板内容。触发器的 `value` 与面板的 `value` 一一对应。

<demo
    vue="../examples/tabs/basic.vue"
    ssg="true"
/>

> `CaomeiTabList` 需要可访问名：无可见标题时用 `aria-label` 提供；有可见标题时用 `aria-labelledby` 关联，缺失时屏幕阅读器无法说明该组选项卡的用途。

## 方向

`orientation="vertical"` 切换为纵向排布，键盘导航随之改为上下方向键。

<demo
    vue="../examples/tabs/vertical.vue"
    ssg="true"
/>

## 受控与非受控

- 受控：传入 `v-model`，当前项完全由外部状态决定。
- 非受控：传入 `default-value` 指定初始项，交互后由组件内部维护当前值。

`CaomeiTabs` 抛出 `update:modelValue`，值为被激活触发器的 `value`。

## 禁用与手动激活

- `CaomeiTabTrigger` 的 `disabled` 禁用单项，禁用的触发器不出现在键盘导航序列中。
- `activationMode="manual"` 时，聚焦不再自动切换，需点击或按 Enter / 空格激活；默认 `automatic` 为聚焦即激活。

> `activationMode` 在初始化时生效，运行期动态切换该值不会改变已建立的激活行为（Reka 内部实现限制）。

<demo
    vue="../examples/tabs/states.vue"
    ssg="true"
/>

## 组合件 API

除下方根组件 API 外，组合件各承担一项职责：

| 组件 | 关键 props | 说明 |
|------|-----------|------|
| `CaomeiTabs` | `v-model`、`defaultValue`、`orientation`、`activationMode`、`unmountOnHide`、`dir` | 根容器，提供上下文 |
| `CaomeiTabList` | `loop`（默认 `true`） | 触发器列表，渲染 `role="tablist"` |
| `CaomeiTabTrigger` | `value`、`disabled` | 触发器，渲染 `role="tab"` |
| `CaomeiTabContent` | `value`、`forceMount` | 面板，渲染 `role="tabpanel"` |

`unmountOnHide` 默认 `true`，非激活面板内容会被卸载；设为 `false` 后面板保留在 DOM 中并带 `hidden`，便于浏览器搜索或表单保留。

## 无障碍

- 遵循 WAI-ARIA Tabs 模式：`role="tablist"` / `role="tab"` / `role="tabpanel"`，并通过 `aria-controls` 与 `aria-labelledby` 建立关联。
- 键盘：`ArrowLeft` / `ArrowRight`（横向）或 `ArrowUp` / `ArrowDown`（纵向）切换，`Home` / `End` 跳到首个 / 末个可用项，`Tab` 进入当前面板。
- 禁用触发器输出 `disabled` 与 `data-disabled`，不参与键盘导航。
- 焦点环使用 `:focus-visible`，并遵循 `prefers-reduced-motion`。

## 样式定制

样式基于 CSS variables，保持低特异性便于覆盖：

| 变量 | 默认 | 说明 |
|------|------|------|
| `--caomei-tabs-gap` | `--caomei-space-2` | 列表与面板间距 |
| `--caomei-tabs-list-gap` | `--caomei-space-1` | 触发器间距 |
| `--caomei-tabs-border` | `--caomei-color-border` | 列表分隔线颜色 |
| `--caomei-tabs-trigger-gap` | `--caomei-space-1` | 触发器内图标与文字间距 |
| `--caomei-tabs-trigger-padding-x` | `--caomei-space-3` | 触发器水平内边距 |
| `--caomei-tabs-trigger-padding-y` | `--caomei-space-2` | 触发器垂直内边距 |
| `--caomei-tabs-trigger-color` | `--caomei-color-text-muted` | 触发器默认文字色 |
| `--caomei-tabs-trigger-active-color` | `--caomei-color-primary` | 激活触发器文字色 |
| `--caomei-tabs-indicator` | `--caomei-color-primary` | 激活指示条颜色 |

```css
.caomei-tabs {
    --caomei-tabs-indicator: #16a34a;
    --caomei-tabs-trigger-active-color: #16a34a;
}
```

<ComponentApi name="tabs" />
