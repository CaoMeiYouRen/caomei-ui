# Image 图片

图片组件基于原生 `img` 自建，提供比例占位、懒加载与加载 / 失败占位，避免加载过程引发布局跳动。

## 基础用法

通过 `src` / `alt` 传入图片信息；`ratio` 提供宽高比（如 `16 / 9`），容器按比例占位；`fit` 控制填充方式（默认 `cover`）。示例源图为方图、容器为 `16 / 9`，比例不同才能看出差异：`cover` 裁切铺满，`contain` 完整显示并在留白处露出容器背景（示例覆盖了 `--caomei-image-bg` 以便看清留白，默认值为 `--caomei-color-bg-elevated`）。

<demo
    vue="../examples/image/basic.vue"
    ssg="true"
/>

## 懒加载

`lazy` 开启后，图片进入视口才开始请求 `src`。建议同时提供 `ratio`，让容器在加载前保持占位。示例刻意使用与本页其他示例不同的图片地址，并加上图片源提供的不可缓存参数，避免命中浏览器缓存而看不出加载过程。

<demo
    vue="../examples/image/lazy.vue"
    ssg="true"
/>

## 加载与失败占位

加载中显示脉冲占位，加载失败显示失败图标；可通过 `#loading` / `#error` 插槽自定义。图片加载失败时 `alt` 仍保留在可访问树中。

<demo
    vue="../examples/image/states.vue"
    ssg="true"
/>

## 点击放大预览

`preview` 开启后，图片加载成功即可点击放大：点击弹出遮罩与放大图，遮罩、Esc 与关闭按钮均可关闭，并遵循 Reka Dialog 的模态语义（焦点陷阱、滚动锁、关闭后焦点回到入口按钮）。指示器默认取 `Eye` 图标，可用 `previewIcon`（`@lucide/vue` 组件）或 `#indicatoricon` 插槽替换——**插槽优先于 prop**；加载中与加载失败时不渲染入口。`show` / `hide` 事件在预览开合时抛出。

<demo
    vue="../examples/image/preview.vue"
    ssg="true"
/>

## 无障碍

- `alt` 映射原生 `alt`；装饰性图片传空字符串。
- 加载中占位层 `aria-hidden="true"`；失败占位层不带 `aria-hidden`，以承载自定义失败文案（默认失败图标由 Lucide 自动 `aria-hidden`）。
- 组件抛出 `load` / `error` 事件，参数为原生事件对象；服务端直出且水合前已判定失败的图片会在挂载时直接进入失败态，不会补发 `error`。
- 预览入口为常规 `button`，可访问名取内建「预览图片」文案（`#indicatoricon` 只替换内容、不改变可访问名）；遮罩为模态对话框（`role="dialog"` + `aria-modal`），标题取内建「图片预览」文案，放大图沿用 `alt`。
- 键盘可 Tab 聚焦入口、Enter / Space 打开；焦点在遮罩内循环，Esc / 关闭按钮 / 点击遮罩关闭后焦点回到入口。`preview` 由真转假时遮罩同步收回。

## 样式定制

样式基于 CSS variables，保持低特异性便于覆盖：

| 变量 | 默认 | 说明 |
|------|------|------|
| `--caomei-image-bg` | `--caomei-color-bg-elevated` | 容器背景色 |
| `--caomei-image-loading-bg` | `--caomei-color-bg-elevated` | 加载中占位背景色 |
| `--caomei-image-placeholder-color` | `--caomei-color-text-muted` | 占位 / 失败图标颜色 |
| `--caomei-image-placeholder-size` | `24px` | 占位图标尺寸 |
| `--caomei-image-preview-color` | `--caomei-color-on-solid` | 预览指示器图标颜色 |
| `--caomei-image-preview-icon-size` | `24px` | 预览指示器图标尺寸 |
| `--caomei-image-preview-close-color` | `--caomei-color-on-solid` | 关闭按钮图标颜色 |
| `--caomei-image-preview-close-size` | `20px` | 关闭按钮图标尺寸 |
| `--caomei-image-preview-z-index` | `1100` | 遮罩层级（放大内容取其值 +1；默认高于 Dialog / Drawer 的 1000 / 1001 与浮层的 1050，与 Toast 同层） |

> 组件不处理 `srcset` 与跨域；需要响应式图片或跨域策略时请在业务层自行处理。

## 从 PrimeVue 迁移

| PrimeVue | 本组件 |
| --- | --- |
| `src` | `src` |
| `preview`（点击放大 + 遮罩） | `preview`（默认 `false`；加载成功后出现放大入口，遮罩 / Esc / 关闭按钮关闭） |
| `previewIcon` / `indicatorIcon`（字符串图标类名） | `previewIcon`（`@lucide/vue` 组件，默认 `Eye`） |
| `#previewicon` / `#indicatoricon` 插槽 | `#indicatoricon`（合并为单一插槽名；**仅旧名 `#indicatoricon` 可零改动迁移**，使用当前 PrimeVue 文档的 `#previewicon` 需改名） |
| `@show` / `@hide` | `show` / `hide`（同名，预览开合时抛出） |
| `imageStyle` / `imageClass` | 未实现：样式经组件根类与 CSS 变量覆盖（原生图片属性不透传到内层 `<img>`） |
| `zoomInDisabled` / `zoomOutDisabled` | 未实现：本库无旋转 / 缩放工具条，无需禁用开关 |
| `#refresh` / `#undo` / `#zoomin` / `#zoomout` / `#close` / `#image` / `#original`（`#preview`）插槽 | 未实现：无工具条；放大图固定沿用 `src` / `alt`，关闭按钮为内建 |
| `previewButtonProps` | 未实现：入口按钮外观经类名与 CSS 变量覆盖 |
| 无 | `alt`、`ratio`（按比例占位防抖动）、`fit`、`lazy`（进入视口再请求）与 `#loading` / `#error` 插槽为本库新增 |

> **已知差异（有意）**：① 放大遮罩只做「放大展示 + 关闭」，不提供 PrimeVue 的旋转 / 缩放工具条；② 预览入口仅在图片加载成功后渲染，加载中 / 失败时不可点开；③ 遮罩基于 Reka Dialog 实现（焦点陷阱 + 滚动锁 + 关闭后焦点回到入口），PrimeVue 为自绘 Portal + FocusTrap。

> 迁移流程与通用陷阱见[从 PrimeVue 迁移](../guide/primevue-migration.md)。

<ComponentApi name="image" />
