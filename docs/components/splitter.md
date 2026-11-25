# Splitter 分栏

Splitter 把区域拆成可拖拽调整的分栏，基于 Reka UI 的 `SplitterGroup` / `SplitterPanel` / `SplitterResizeHandle` 封装，支持水平 / 垂直、尺寸约束、折叠与嵌套。

## 基础用法

`CaomeiSplitter` 是容器，`CaomeiSplitterPanel` 是面板，两者之间放 `CaomeiSplitterResizeHandle`。面板顺序由书写顺序决定；`defaultSize` / `minSize` / `maxSize` 均为百分比。

容器默认 `width/height: 100%`，因此**父容器需要有确定高度**（或给分栏自身设高度），否则纵向分栏会塌缩为内容高度。

<demo
    vue="../examples/splitter/basic.vue"
    ssg="true"
/>

## 垂直分栏

`direction="vertical"` 改为上下分栏，分隔线方向、拖拽光标与 `aria-orientation` 随之切换。

<demo
    vue="../examples/splitter/vertical.vue"
    ssg="true"
/>

## 嵌套分栏

分栏可嵌套：内层分栏放在外层面板内，内外拖拽互不影响。面板内容自适应容器，面板自身 `overflow: auto`。

<demo
    vue="../examples/splitter/nested.vue"
    ssg="true"
/>

## 受控布局

`v-model:layout` 为各面板的百分比数组（和约 100）：挂载时应用初值，外部写入时重新应用；拖拽、键盘调整与折叠会回写模型，越界值按 `minSize` / `maxSize` 钳制后回写。`autoSaveId` 与受控初值同时使用时以受控值为准。

<demo
    vue="../examples/splitter/controlled.vue"
    ssg="true"
/>

## 键盘与无障碍

- 分隔条为 `role="separator"`，可访问名取 `label`（缺省为当前语言的「调整面板大小」），`aria-orientation` 与分栏方向相反（水平分栏为 `vertical`）。
- 聚焦分隔条后方向键按 `keyboardResizeBy`（默认 10%）调整；`Enter` 在可折叠面板上折叠 / 展开。
- `disabled` 时 `tabindex="-1"`，不响应拖拽与键盘。
- 分隔线视觉 3px，命中区扩大到 13px，不影响布局。

## 子组件 props

| 组件 | 主要 props |
|------|------|
| `CaomeiSplitter` | `direction`（`horizontal` / `vertical`）、`keyboardResizeBy`、`autoSaveId`、`v-model:layout` |
| `CaomeiSplitterPanel` | `defaultSize`、`minSize`、`maxSize`、`collapsible`、`collapsedSize` |
| `CaomeiSplitterResizeHandle` | `label`、`disabled` |

> `CaomeiSplitter` 还暴露 `resize(sizes: number[])`，用于命令式设置各面板尺寸。面板增删后布局按 `defaultSize` 重新分配，原比例不继承。

## 样式定制

| 变量 | 默认 | 说明 |
|------|------|------|
| `--caomei-splitter-handle-bg` | `--caomei-color-border` | 分隔线颜色 |
| `--caomei-splitter-handle-z-index` | `--caomei-z-raise` | 分隔线层级 |
| `--caomei-splitter-grip-bg` | 弱化文字色的 60% | 分隔线中段抓手颜色 |
| `--caomei-splitter-grip-size` | `3px` | 抓手粗细 |
| `--caomei-splitter-grip-length` | `1.5rem` | 抓手长度 |

<ComponentApi name="splitter" />
