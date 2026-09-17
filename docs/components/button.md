# Button 按钮

按钮用于触发一个操作。

## 基础用法

<demo
    vue="../examples/button/basic.vue"
    ssg="true"
/>

## 变体

通过 `variant` 切换视觉变体。

<demo
    vue="../examples/button/variants.vue"
    ssg="true"
/>

## 语义色调

通过 `tone` 为按钮指定语义色；不设置时沿用变体默认配色。PrimeVue 迁移时的 `text` / `outlined` 形态分别对应 `variant="ghost"` / `variant="secondary"`。

<demo
    vue="../examples/button/tones.vue"
    ssg="true"
/>

## 圆角与图标位置

`rounded` 输出胶囊圆角；`iconPosition` 控制图标相对文本的位置（默认 `start`）。

<demo
    vue="../examples/button/rounded-icon.vue"
    ssg="true"
/>

## 尺寸

通过 `size` 切换尺寸。

<demo
    vue="../examples/button/sizes.vue"
    ssg="true"
/>

## 状态

`loading` 时按钮自动禁用并显示加载指示；`block` 时撑满父容器宽度。

<demo
    vue="../examples/button/states.vue"
    title="禁用、加载与 Block"
    description="点击加载按钮可查看 loading 状态。"
    ssg="true"
/>

## 角标

`badge` 提供非空字符串时在按钮右上角渲染角标（内容即该字符串），`badgeTone` 控制色调（默认 `neutral`，对应 PrimeVue `badge-severity` 的默认值 `secondary`）；传 `undefined` 或空串即不渲染，可用于按数量控制显隐。

<demo
    vue="../examples/button/badge.vue"
    ssg="true"
/>

> 角标以右上角外扩方式叠加，不参与按钮布局、也不改变按钮尺寸；未用 `label`（或透传 `aria-label`）覆盖可访问名时，角标文本会计入由可见文本推导的可访问名（如「通知 3」）。
>
> 因角标超出按钮边界，承载它的祖先元素不要设置会裁切的 `overflow`（`hidden` / `clip` 等），否则角标会被切掉。

## 无障碍

- `label` 用于无可见文本（仅图标）时提供可访问名，映射为 `aria-label`；`label` 优先级高于透传的 `aria-label`，未提供（或为空）时透传值生效。
- 加载态通过 `aria-busy` 标注，并沿用原生 `disabled` 阻止交互。

<ComponentApi name="button" />
