# Countdown 倒计时

面向截止时间的倒计时：按秒刷新、可自定义格式、到点触发 `finish` 并停表。字号继承父级，可用 `--caomei-countdown-font-size` 调大；纯展示组件，不改写目标时间，也不做跨页持久化。

## 基础用法

<demo
    vue="../examples/countdown/basic.vue"
    ssg="true"
/>

```vue
<CaomeiCountdown :target="deadline" label="距离结束" @finish="onFinish" />
```

## 属性

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `target` | `number \| Date \| string \| null` | `null` | 目标时间（时间戳 / `Date` / 可被 `Date` 解析的字符串）；无效值渲染零值、不启动计时、不视为到点 |
| `format` | `string` | `HH:mm:ss` | 格式模板，支持 `DD` / `HH` / `mm` / `ss` / `SSS`；未知片段原样保留 |
| `autoStart` | `boolean` | `true` | 是否自动开始；为 `false` 时即使目标已过期也不触发 `finish`（仍渲染到点态） |
| `interval` | `number` | `1000` | 刷新间隔（毫秒）；非有限值或 ≤0 回退 1000，需要毫秒展示时传 `SSS` 并调小该值 |
| `finishText` | `string` | — | 到点后显示的文案；缺省按格式渲染零值，无效 `target` 时不替换 |
| `label` | `string` | — | 时间区的可访问名（`role="timer"` 允许命名） |

## 事件

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `finish` | — | 进入「到点」状态时触发一次；同一目标不重复通知，更换 `target` 后再次到点（含切回已到点目标）会重新通知 |

## 格式模板

- `DD` 天、`HH` 小时、`mm` 分、`ss` 秒、`SSS` 毫秒余数；位数不足补 0。
- 模板**含 `DD`** 时 `HH` 取当日小时（0–23）；**不含 `DD`** 时 `HH` 取累计小时，可 ≥24（如 `26:01:01`）。
- 剩余不足 1 秒时秒级片段（`DD` / `HH` / `mm` / `ss`）按 `Math.floor` 显示 0，但**尚未进入到点态**：不带 `data-finished`、不触发 `finish`，最多晚一个 `interval` 才真正到点；模板含 `SSS` 时该片段仍显示毫秒余数。

## 到点与回拨

- 到点后停表并冻结：`data-finished` 置位、`finish` 只发一次，系统时间回拨不会恢复计时，也不会二次通知。
- 到点前系统时间回拨时按实时剩余时间继续（`remaining = target - now`），因此剩余时间可能变大；到点仍只通知一次。
- 更换 `target` 会重新评估；切回已到点的目标视为新的到点并再通知一次。需要「暂停」时把 `autoStart` 置 `false` 或置 `target` 为无效值。

## 服务端渲染

- 组件不访问 `window` / `document`，`target` 用 ISO 字符串传入即可在服务端算出首帧文本。
- 首帧文本基于服务端时钟，客户端水合时按本地时钟重算；两者相差 ≥1 秒时该文本节点会出现一次水合差异。需要严格一致时，在挂载后再渲染倒计时，或把 `target` 由客户端计算后传入。

## 样式定制

| 变量 | 默认 | 说明 |
| --- | --- | --- |
| `--caomei-countdown-font-size` | 继承父级 | 时间区字号 |
| `--caomei-countdown-color` | 继承父级 | 时间区颜色 |
| `--caomei-countdown-finished-color` | `--caomei-color-text-muted` | 到点后的颜色（`data-finished` 生效时） |

## 无障碍

- 时间区为 `role="timer"`（隐式 `aria-live="off"`），不会逐秒播报；需要朗读语境时用 `label` 命名，或在周围文本里说明。
- `label` 为空时不输出空的 `aria-label`；组件不引入 landmark。
- `finishText` 为空串时回退为按格式渲染的零值，不会渲染空白；希望到点后给出可读结论时请显式传入「已结束」一类文案。

<ComponentApi name="countdown" />
