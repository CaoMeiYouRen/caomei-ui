# Password 密码输入框

密码输入框由 [Input](./input.md) 衍生，在文本输入基础上提供明文可见性切换与密码自动填充语义。

## 基础用法

通过 `v-model` 双向绑定；右侧按钮在「密文 / 明文」之间切换，按钮的可访问名随状态切换。

<demo
    vue="../examples/password/basic.vue"
    ssg="true"
/>

## 尺寸

透传 Input 的 `size`，支持 `sm` / `md` / `lg`。

## 状态与自动填充

`disabled` / `readonly` / `invalid` / `clearable` 与 Input 一致；`autocomplete` 默认为 `current-password`，注册或修改密码场景应显式传 `new-password`，以配合浏览器密码管理器。

<demo
    vue="../examples/password/states.vue"
    ssg="true"
/>

## 强度反馈

设置 `feedback`（默认关闭）后显示强度计量条与文案：聚焦或已有输入时可见，空值未聚焦时仅保留读屏器播报区域。

- 默认关闭（与 PrimeVue 默认开启不同）：外部服务凭据（密钥 / Token）一类字段通常无需强度反馈，可省略不传；用户自设密码（如安装向导的管理员密码）建议显式 `feedback`。
- 空值聚焦会插入强度区域，使输入框下方内容下移约一行（输入框自身位置不变）；对字段级辅助文案属有意取舍。
- 强度规则与 PrimeVue 默认一致：同时含大小写与数字且 ≥8 位为强，任两类字符且 ≥6 位为中，其余非空为弱。
- 文案走内建多语言（`password.prompt` / `weak` / `medium` / `strong`），可用 `promptLabel` / `weakLabel` / `mediumLabel` / `strongLabel` 覆盖。
- 计量条颜色取 `danger` / `warning` / `success`，可经对应 CSS variables 覆盖。

<demo
    vue="../examples/password/feedback.vue"
    ssg="true"
/>

> PrimeVue 的 `mediumRegex` / `strongRegex` 未实现（下游无用量），强度规则当前固定；需要自定义规则时请提出。

## 切换按钮文案

切换按钮使用内建多语言标签（「显示密码」/「隐藏密码」），可通过 `showLabel` / `hideLabel` 覆盖。

## 无障碍

- 切换按钮为 `type="button"`，带 `aria-label`（随状态切换）与 `aria-pressed` 表达当前是否已显示明文；`disabled` 时同步禁用。
- 其余无障碍行为（`label` / `invalid` / `aria-describedby` 透传等）继承自 [Input](./input.md)。
- `type` 由组件内部管理（`password` / `text`），外部传入的 `type` 会被忽略以避免误关闭掩码；如需固定类型请使用 [Input](./input.md)。
- 事件 `focus` / `blur` / `change` / `enter` / `clear` 与 `focus()` / `blur()` 方法透传，可用于表单校验。

<ComponentApi name="password" />
