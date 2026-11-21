# InputOtp 验证码输入

验证码输入用于录入一次性的数字或字母数字验证码：逐格输入、方向键与退格导航、粘贴整串自动分发。封装 Reka UI 的 `PinInputRoot` / `PinInputInput`。

## 基础用法

`v-model` 绑定字符串；`length` 决定输入格数（默认 6），`label` 提供分组可访问名。填满全部输入格后抛出 `complete`，载荷为完整字符串。

示例只反馈填写状态，不打印验证码本身；真实业务同样应避免把验证码写入日志或持久化存储。

<demo
    vue="../examples/input-otp/basic.vue"
    ssg="true"
/>

## 输入类型与长度

- `type="numeric"`（默认）只接受数字，输入框输出 `inputmode="numeric"` 与 `[0-9]` 校验形态；非数字输入被丢弃。
- `type="alphanumeric"` 接受字母与数字，`inputmode="text"`。
- `length` 变更会按新长度重新归一化内部值；缩短时超出部分被截断，不抛事件。
- `otp` 默认 `true`：输入格按顺序填充（不跳过空格），并输出 `autocomplete="one-time-code"`，便于移动端从短信或剪贴板自动填充。`otp: false` 恢复为可任意跳格编辑的形态。

<demo
    vue="../examples/input-otp/states.vue"
    ssg="true"
/>

## 粘贴与完成事件

- 粘贴整串验证码时按输入格数量分发；粘贴内容超出 `length` 时只取前 `length` 位。
- `numeric` 模式下粘贴内容会先剥离非数字字符；中间的空格、连字符不会占用输入格。
- `complete` 只在「未填满 → 填满」的跃迁时抛出一次；受控回写同值不会重复触发。清空任意一格后再次填满会重新触发。
- 中间删除某一格时，后续字符**不左移**（保持格位稳定）；`v-model` 只承载非空字符拼接结果，不会携带空位。

## 状态与尺寸

- `size` 取 `sm` / `md`（默认）/ `lg`，控制输入格边长与字号。
- `invalid` 输出 `aria-invalid` 与错误态描边；`disabled` 禁用全部输入格；`readonly` 保留可聚焦与可复制，但不接受编辑。
- `name` + `required` 在 `<form>` 内生成隐藏控件以触发原生校验。
- 触摸设备上可在祖先元素设置 `data-density="touch"`，统一放大该子树内的控件高度与字号；密度轴与 `size` 档位正交，详见[触摸密度轴](../guide/mobile.md#触摸密度轴与尺寸覆盖)。

## 表单与无障碍

- 根元素为 `role="group"`，可访问名取 `label`（也可经透传 `aria-label` 提供）；未提供时不输出空名。
- 每个输入格都有独立的可访问名，取当前语言的「验证码第 N 位，共 M 位」文案，随 `length` 更新。
- 方向键在输入格间移动；`Backspace` 清空当前格，当前格已空时回到上一格并清空；`Delete` 清空当前格。
- `disabled` 输出 `aria-disabled`，`invalid` 输出 `aria-invalid`；`aria-readonly` 不放在 `role="group"` 根上（该组合不允许），只读语义由各输入格的原生 `readonly` 承载。

## 样式定制

样式基于 CSS variables，保持低特异性便于覆盖：

| 变量 | 默认 | 说明 |
| --- | --- | --- |
| `--caomei-input-otp-gap` | `--caomei-space-2` | 输入格间距 |
| `--caomei-input-otp-cell-width` | `--caomei-control-height-md` | 输入格宽度 |
| `--caomei-input-otp-cell-height` | `--caomei-control-height-md` | 输入格高度 |
| `--caomei-input-otp-font-size` | `--caomei-font-size-lg` | 输入格字号 |

`sm` / `lg` 档只在 `:where()` 内覆盖上述变量，消费方可直接在同元素或祖先上覆盖。窄视口下输入格按 `flex-wrap` 折行，不产生横向溢出。

## 从 PrimeVue 迁移

| PrimeVue `InputOtp` | 本组件 |
| --- | --- |
| `v-model` 字符串 | 同名（`string`） |
| `length` | 同名（默认 6） |
| `integerOnly` | 用 `type` 表达：`true` → `numeric`（本库默认），`false` → `alphanumeric`；**默认语义相反**（PrimeVue 默认允许字母） |
| `mask` | 同名 |
| `invalid` / `disabled` / `readonly` | 同名 |
| `size`（`small` / `large`） | `size`（`sm` / `lg`） |
| `ariaLabel` / `ariaLabelledby` | `label`（映射 `aria-label`）；`aria-labelledby` 可经属性透传 |
| 无 | `otp`（默认 `true`，输出一次性验证码自动填充语义）、`placeholder`、`required`、`complete` 事件为本库新增 |

**已知差异（有意）**：默认输入类型为 `numeric`（PrimeVue 的 `integerOnly` 默认 `false`，允许字母）；迁移到纯数字场景无需改动，字母验证码需显式传 `type="alphanumeric"`。

**未实现**：`variant`（`outlined` / `filled`）、`fluid`（字段默认 `width: 100%`）、`pt` / `dt` / `unstyled`，以及 PrimeVue 的分隔符插槽等主题透传能力。

> 迁移流程、通用陷阱与逐组件对照入口见[从 PrimeVue 迁移](../guide/primevue-migration.md)。

<ComponentApi name="input-otp" />
