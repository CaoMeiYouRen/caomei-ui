# FileUpload 文件上传

文件上传组件基于原生 `input[type=file]` 自建，负责文件选择（点击 / 拖拽）与列表管理，不负责上传传输（`customUpload` 下抛出 `uploader`，由业务层上传）。

## 基础用法

通过 `v-model` 绑定文件列表（`File[]`）；点击选择区或将文件拖拽到选择区均可添加。

<demo
    vue="../examples/file-upload/basic.vue"
    ssg="true"
/>

## 上传模式

`mode` 决定界面形态：`advanced`（默认）为拖放区 + 文件列表；`basic` 为紧凑的选择按钮 + 已选文案，每次选择替换列表、不渲染拖放区与列表。两种形态的选择入口文案都可用 `chooseLabel` 覆盖，缺省取内建 locale。

## 大小上限

`maxFileSize` 以字节为单位限制单个文件：超限文件不进入 `v-model`，并在组件内显示提示（文案取内建 locale，可经 `CaomeiConfigProvider` 的 `messages` 覆盖）。提示会在下一次选择时清空；被拒文件不影响列表中的既有文件。

## 自动上传与自定义上传

组件不负责传输：`customUpload` 开启后由组件抛出 `uploader({ files })`，业务层接管上传；`auto` 在选完文件后自动请求上传——**仅 `customUpload` 下产出 `uploader`**，未开启时 `auto` 不产生上传请求。`auto` 关闭时可通过组件暴露的 `upload()` 手动触发（等价 PrimeVue 的 `ref.upload()`）。`mode="basic"` + `custom-upload` + `auto` 是迁移 PrimeVue basic 用法的等价组合。

<demo
    vue="../examples/file-upload/custom-upload.vue"
    ssg="true"
/>

## 多选与类型约束

`multiple` 允许选择多个文件（关闭时新选择会替换列表）；`accept` 使用原生语法约束类型，同时作用于选择与拖拽。重复文件（名称 + 大小 + 修改时间一致）会被去重。

> `accept` 依据 `File.type` 匹配：当浏览器未提供该值（未知扩展名）时，`image/*` 等 MIME 通配无法匹配，仅扩展名（`.png`）与精确 MIME 可匹配。

<demo
    vue="../examples/file-upload/multiple.vue"
    ssg="true"
/>

## 禁用与自定义列表

`disabled` 禁用选择、拖拽与移除；列表项可通过 `#file` 插槽自定义，插槽参数为 `{ file, index, remove }`。默认插槽可替换提示内容（如仅图标），此时用 `label` 提供可访问名。

<demo
    vue="../examples/file-upload/states.vue"
    ssg="true"
/>

## 无障碍

- 选择区为原生 `<button>`（`basic` 形态为选择按钮），可通过键盘聚焦并触发选择；内置提示文本自带可访问名，仅在默认插槽替换为无可见文本的内容（如仅图标）时用 `label` 提供可访问名（映射 `aria-label`，未提供 `label` 时保留透传的 `aria-label`）。
- 文件输入视觉隐藏且 `tabindex="-1"` / `aria-hidden="true"`，避免重复焦点与冗余播报。
- 移除按钮提供 `移除 <文件名>` 的可访问名（`advanced` 形态）。
- 大小超限提示为 `role="alert"`，选择后即时播报。

## 样式定制

样式基于 CSS variables，保持低特异性便于覆盖：

| 变量 | 默认 | 说明 |
|------|------|------|
| `--caomei-file-upload-gap` | `--caomei-space-2` | 选择区与列表间距 |
| `--caomei-file-upload-padding` | `--caomei-space-4` | 选择区内边距 |
| `--caomei-file-upload-border` | `--caomei-color-border` | 选择区虚线描边色 |
| `--caomei-file-upload-bg` | `--caomei-color-bg` | 选择区背景色 |
| `--caomei-file-upload-icon-size` | `24px` | 选择区图标尺寸 |
| `--caomei-file-upload-item-bg` | `--caomei-color-bg-elevated` | 列表项背景色 |

> 组件只负责选择与列表管理；分片、断点续传、进度与服务端错误由业务层实现。

## 从 PrimeVue 迁移

| PrimeVue | 本组件 |
| --- | --- |
| `accept` / `multiple` | 同名 |
| `mode` | `mode`（默认 `advanced`；`basic` 为紧凑选择按钮 + 已选文案，每次选择替换列表） |
| `chooseLabel` | `chooseLabel`（`basic` 覆盖按钮文案、`advanced` 覆盖拖放提示；缺省取内建 locale） |
| `maxFileSize` | `maxFileSize`（字节；超限文件不入列表并显示内建提示） |
| `auto` | `auto`（选完文件自动请求上传） |
| `customUpload` + `@uploader` | `customUpload` + `uploader`（组件不做传输；`auto` 关闭时用暴露的 `upload()` 手动触发，等价 `ref.upload()`） |
| `@select` / `@remove` | `select` / `remove`（载荷同形：`{ originalEvent, files }` / `{ file, files }`；`select.files` 为选择后的完整列表，全部被拒时为未变化的当前列表） |
| `@clear` | `clear`（经暴露的 `clear()` 触发） |
| `name` | 透传到内层 `<input type="file">`（原生表单提交可用） |
| 无 | `disabled`、`label`（可访问名）与 `#file` 插槽（自定义文件列表项）为本库新增 |

**未实现（已登记为后续补强项，交付后同步本节）**：`url` / `withCredentials` 与默认 XHR 传输、`before-upload` / `progress` / `upload` / `before-send` / `error` 事件、`fileLimit` / `invalidFileLimitMessage` / `invalidFileTypeMessage`（超限文案固定走内建 locale，不提供 prop 覆盖）、`uploadLabel` / `cancelLabel` / `showUploadButton` / `showCancelButton`（无上传 / 取消按钮）、`previewWidth`（无图片缩略图）。

> 迁移流程与通用陷阱见[从 PrimeVue 迁移](../guide/primevue-migration.md)。

<ComponentApi name="file-upload" />
