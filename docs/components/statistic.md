# Statistic 统计数值

大号数值展示：精度、千分位、前后缀与加载态。展示型组件，不做数字滚动动画；空值与非法输入降级为占位，不隐式按 `0` 处理。

## 基础用法

<demo
    vue="../examples/statistic/basic.vue"
    ssg="true"
/>

```vue
<CaomeiStatistic label="本月收入" :value="1234567.891" :precision="2" prefix="¥" suffix="元" />
```

## 属性

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `value` | `number \| string \| null` | `null` | 数值；数字字符串按数值解析，空串 / 非数字串 / `NaN` / `Infinity` / 缺省按空值渲染 `placeholder` |
| `precision` | `number` | — | 小数位（0 ~ 20）；缺省保留数值自身小数位，非整数或越界值按未提供处理 |
| `groupSeparator` | `string` | `,` | 千分位分隔符；传空串关闭分组 |
| `decimalSeparator` | `string` | `.` | 小数点符号 |
| `prefix` | `string` | — | 数值前缀（如货币符号），随数值一起朗读 |
| `suffix` | `string` | — | 数值后缀（如单位），随数值一起朗读 |
| `label` | `string` | — | **可见标签**（与本库 Input / Select 等表单控件「`label` 仅提供可访问名」的约定不同）；提供后数值区以它（或 `label` 插槽内容）作为可访问名 |
| `loading` | `boolean` | `false` | 加载态：隐藏数值区内容（含前后缀）并显示骨架，数值区标记 `aria-busy` |
| `placeholder` | `string` | `--` | 空值占位 |
| `size` | `'sm' \| 'md' \| 'lg'` | `md` | 尺寸档 |
| `as` | `'div' \| 'span'` | `div` | 根元素标签 |

## 插槽

| 插槽 | 说明 |
| --- | --- |
| `label` | 自定义标签内容（优先于 `label`） |
| `prefix` | 自定义前缀（优先于 `prefix`） |
| `suffix` | 自定义后缀（优先于 `suffix`） |

## 加载态与空值

- 加载态只替换数值区的内容（含前后缀文本）：骨架块 `aria-hidden`，数值区保留 `aria-busy="true"`，标签仍在朗读范围内，读屏不会读到假的数字。
- 空值与非法输入渲染 `placeholder`（默认 `--`），并加 `caomei-statistic--empty` 供使用方着色；不会隐式变成 `0`。
- 需要「无数据」与「加载中」两种文案时，分别用 `placeholder` 与 `loading`，不要用 `0` 冒充。

## 无障碍

- 根元素不是 landmark，也不带 `role`；数值区为 `role="group"`，仅在存在可见标签时以 `aria-labelledby` 指向标签文本。
- `prefix` / `suffix` 是数值语义的一部分（如货币符号、百分号），随数值一起朗读；纯装饰符号请用插槽自行加 `aria-hidden`。
- 无障碍名与可见标签同源时，部分读屏会把标签读两遍（`group` 的标准成本）；组件不提供「单次播报」模式——如需不同语境，请省略 `label` 并由外层带角色的容器承载语义（不要给无 role 的根元素加 `aria-label`，ARIA 1.2 禁止在 generic 元素上命名）。

## 格式化边界

- `precision` 按 `Number#toFixed` 语义处理，受二进制浮点表示影响，不是十进制严格四舍五入（如 `1.005` 保留 2 位得 `1.00`）。
- 数值一律经双精度解析：超过 `Number.MAX_SAFE_INTEGER` 的整数或超过约 17 位有效数字的小数无法保证逐位精确；需要逐位展示时不要用本组件承载该数值。
- 输出为指数形式时（如 `1e+21`）原样输出、不分组，`precision` 不参与。
- `groupSeparator` 按字面量插入，不解释 `$1` / `$&` 等替换模式；分隔符传空串即可得到不带分组的原值。

<ComponentApi name="statistic" />
