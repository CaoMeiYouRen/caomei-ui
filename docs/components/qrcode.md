# QRCode 二维码

QRCode 把文本或链接编码为二维码图片，支持容错级别、静区、配色与居中图标。编码器 `qrcode` 为可选 peer 依赖，组件内部按需加载；加载或编码失败时清空旧图并给出失败提示。

## 基础用法

`value` 是编码内容；`label` 为图片的可访问名，缺省取当前语言的「二维码」。默认插槽在二维码下方渲染说明内容（在流内占据高度），作用域提供 `{ status, value }`。

<demo
    vue="../examples/qrcode/basic.vue"
    ssg="true"
/>

## 安装可选 peer

`qrcode` 声明为可选 peer：`npm install` 不会强制拉取，公共类型面也不引用它。**但消费方无论是否使用本组件，都需要安装 `qrcode` 才能通过打包**——加载器中的动态 `import()` 是字面量说明符，打包器会在模块图中解析它，未安装即报「无法解析 qrcode」。这与 `CaomeiChart`（`vue-echarts` + `echarts`）和 `CaomeiRichTextEditor`（`md-editor-v3`）同属既有结构边界，改进候选见 [Backlog](../plan/backlog.md)。

```bash
pnpm add qrcode
```

> 本仓用消费方 fixture 实测了四条路径（未安装 × 是否使用、已安装 × 是否使用），复算命令为 `pnpm check:optional-peer`。

## 图标与容错

`icon` 传入图片地址，居中覆盖在二维码上；`iconSize` 为图标占边长的比例（0–0.3，默认 0.2）。图标会遮住部分模块，建议同时把 `level` 提到 `H`（约 30% 容错）。需要自定义图标内容时使用 `#icon` 插槽（作用域同样提供 `{ status, value }`）。

<demo
    vue="../examples/qrcode/icon.vue"
    ssg="true"
/>

## 尺寸、静区、容错与配色

`size` 为渲染边长（px，默认 160），`margin` 为静区宽度（模块数，默认 2；规范建议至少 4），`level` 为容错级别（L 约 7% / M 15% / Q 25% / H 30%）：同尺寸下级别越高模块越密、可编码容量越小，也更耐遮挡。`color` / `background` 决定模块与底色，务必保持足够对比并让底色不透明——透明背景在深色页面上会降低识别率。失败文案会按内容撑高，极小尺寸（如 64px）下建议自行缩短文案或改用默认尺寸；常规展示建议不小于 96px。

<demo
    vue="../examples/qrcode/size-level.vue"
    ssg="true"
/>

## 无障碍

- 图片使用原生 `<img>`，可访问名取 `label`（缺省为当前语言文案）；传空字符串表示装饰性图片（`alt=""`）。
- 生成中为 `role="status"` 的轻提示，失败为 `role="alert"` 的即时播报；失败时不保留旧二维码，避免扫到与当前内容不一致的图。
- 同一页面存在多个二维码时请用 `label` 区分（如「订单二维码」「邀请二维码」）。

## 样式定制

| 变量 | 默认 | 说明 |
|------|------|------|
| `--caomei-qrcode-radius` | `--caomei-radius-sm` | 二维码圆角 |
| `--caomei-qrcode-icon-radius` | `--caomei-radius-sm` | 居中图标圆角 |

> 颜色不提供 CSS 变量：二维码的前景 / 背景色决定可扫性，须由 `color` / `background` 显式给值，避免主题切换改变对比。
>
> 二维码在挂载后才编码，SSR / SSG 首帧输出的是「正在生成二维码」提示占位；服务端与客户端首帧一致，不会触发水合失配。

<ComponentApi name="qrcode" />
