# ColorPicker 颜色选择器

颜色选择器由色块触发按钮与浮层面板组成，面板内提供饱和度 / 明度区域、色相滑条与十六进制输入框；组合 Reka UI 的 ColorArea / ColorSlider / ColorField primitive，预设色板为自建按钮组（Reka `ColorSwatchPicker` 未采用，见[设计规范 §7](../design/design-spec.md)）。

## 基础用法

通过 `v-model` 绑定颜色字符串，`label` 作为触发按钮的不可见可访问名。

<demo
    vue="../examples/color-picker/basic.vue"
    ssg="true"
/>

## 格式

`format` 决定 `v-model` 的序列化形式，支持 `hex`（默认，`#rrggbb`）、`rgb`（`rgb(r, g, b)`）、`hsb`（`hsb(h, s%, b%)`）。

模型接受 `#rgb` / `#rrggbb` / `#rrggbbaa`、`rgb()` / `rgba()`、`hsl()` / `hsla()`、`hsb()` / `hsba()` 形式的字符串；**具名色（如 `red`）、`oklch()` 等未支持**，会回退 `defaultColor`。解析边界：`rgb()` / `rgba()` 需逗号分隔，`hsl()` / `hsla()` 的饱和度与亮度需带 `%`；现代空格语法（如 `rgb(0 255 0)`、`hsl(120 100% 50%)`）不支持，同样回退 `defaultColor`。**透明度不支持**：带 alpha 的输入会被剥离为 6 位十六进制（`#rrggbb`）。空值或非法值展示 `defaultColor`（默认 `#ff0000`）且不写回模型。

<demo
    vue="../examples/color-picker/options.vue"
    ssg="true"
/>

## 面板与状态

- `inline`：直接内联展示面板，不渲染触发按钮与浮层。
- `swatches`：预设色板（`role="group"` + `aria-pressed` 的按钮组），点击即选中；不提供时不渲染色板。
- `showInput`：是否显示十六进制输入框，默认 `true`。
- `disabled` / `invalid`：禁用与校验失败态。

> 迁移映射（PrimeVue → caomei-ui）：`format` → `format`（取值一致）；`disabled` → `disabled`；`inline` → `inline`；`invalid` → `invalid`；`appendTo` / `overlayClass` / `panelClass` 未实现（面板经 Portal 挂载、层级与外观由库管理）。**已知行为差异**：PrimeVue `format="hex"` 的 `v-model` 为**不带 `#`** 的 6 位十六进制（momei 现以 `replace('#', '')` / 补 `#` 适配），本库统一使用**标准 CSS 颜色字符串**（`#rrggbb`），迁移时可移除该适配包装；PrimeVue `format="rgb"` / `"hsb"` 的 `v-model` 为 `{ r, g, b }` / `{ h, s, b }` **对象**，本库统一为**字符串**（`rgb(r, g, b)` / `hsb(h, s%, b%)`）；`alpha` 通道不支持（带 alpha 输入按 6 位十六进制处理）。

## 无障碍

- 触发按钮带内建可访问名（「颜色」），可通过 `label` 覆盖；`invalid` 时标注 `aria-invalid`。
- 面板内可聚焦控件（区域 / 色相 thumb、十六进制输入框、色板按钮）的**可访问名**与 `aria-roledescription` 均走内建 locale 文案；区域 thumb 的 `aria-valuenow` 与 `aria-valuetext` 同源（均由模型派生，为整数），色相 thumb 的 `aria-valuetext` 为 Reka 生成的裸数值；色板按钮以色值作为名称、`aria-pressed` 随当前颜色实时同步。
- 键盘操作：区域 / 色相用方向键调整；输入框回车或失焦提交。
- **已知限制**：色板按钮不支持方向键 roving 导航（用 Tab 遍历）；色相 thumb 的 `aria-valuetext` 仍为 Reka 生成的裸数值（无本地化需求）。

<ComponentApi name="color-picker" />
