# Watermark 水印

在内容上覆盖一层平铺水印（文本或图片），用于标注归属、提示内部资料或降低截屏外传风险。水印是**装饰性**图层：遮罩对辅助技术隐藏，插槽内容保持正常可读、可选中。

## 基础用法

`content` 为文本水印内容，`rotate` / `opacity` / `gap` 控制倾斜、透明度与间距；容器尺寸随内容自适应。

<demo
    vue="../examples/watermark/basic.vue"
    ssg="true"
/>

## 图片水印

提供 `image` 时以图片为准，`imageWidth` / `imageHeight` 指定绘制尺寸；加载失败时，提供 `content` 则回退到文本水印，否则保留上一次绘制。图片水印同样按旋转包围盒平铺。

<demo
    vue="../examples/watermark/image.vue"
    ssg="true"
/>

## 语义与边界

- **只有遮罩**带 `aria-hidden="true"`；根节点与插槽不加，正文仍可被读屏器朗读、被用户选中。
- 水印在挂载时绘制，并在**子节点增删、属性改写、文本内容变化、容器尺寸变化或主题（暗色 / 预设）切换**后于下一个任务重建；组件卸载后断开观察、不再重建。
- **像素级篡改不覆盖**：用户脚本改写画布像素、截图后去除水印等行为不在检测范围内，也不承诺防篡改。遮罩节点被外部删除后会重新挂回，属恢复行为而非防篡改。
- 水印只在客户端绘制（挂载后），服务端渲染输出不含水印图案（遮罩元素为空）；首屏由插槽内容构成。

## 属性

| 组件 | 主要 props |
|------|------|
| `CaomeiWatermark` | `content`、`image`、`rotate`、`opacity`、`gap`、`offset`、`imageWidth`、`imageHeight`、`fontSize`、`color`、`zIndex` |

## 样式定制

| 变量 | 默认 | 说明 |
|------|------|------|
| `--caomei-watermark-z-index` | `--caomei-z-raise` | 遮罩层级；缺省低于浮层与弹层，可由 `zIndex` 覆盖 |

<ComponentApi name="watermark" />
