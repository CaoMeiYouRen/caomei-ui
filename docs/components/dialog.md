# Dialog 对话框

对话框用于在当前页面之上承载需要用户聚焦处理的内容，基于 Reka UI Dialog 封装。

## 基础用法

通过 `v-model:open` 控制显隐，`title` 必填并作为无障碍名称，可用 `footer` 插槽放置操作按钮。

<demo
    vue="../examples/dialog/basic.vue"
    ssg="true"
/>

## 尺寸

通过 `size` 切换尺寸，支持 `sm` / `md` / `lg`（宽度上限 360 / 480 / 640px）。

<demo
    vue="../examples/dialog/sizes.vue"
    ssg="true"
/>

## 行为选项

`closable` 控制关闭按钮；`closeOnOverlay` / `closeOnEsc` 控制点击遮罩与 Esc 是否关闭；`modal="false"` 时无遮罩、背景可交互且不锁定滚动（此时 `closeOnOverlay` 语义为点击对话框外部）。

<demo
    vue="../examples/dialog/behaviors.vue"
    ssg="true"
/>

部分内容可滚动时，标题与关闭按钮固定在对话框顶部，正文区域独立滚动。

## 触发插槽

除受控 `open` 外，也可通过 `trigger` 插槽传入触发元素（Reka `as-child`）：

```vue
<CaomeiDialog title="示例">
  <template #trigger>
    <CaomeiButton>打开</CaomeiButton>
  </template>
  内容
</CaomeiDialog>
```

## 无障碍与 SSR

- 基于 Reka UI：`role="dialog"`、焦点圈定、Esc 关闭、背景交互屏蔽；标题与描述分别关联 `aria-labelledby` / `aria-describedby`。
- 模态打开时锁定页面滚动；Portal 内容仅客户端挂载，`open` 默认关闭时 SSR 无额外输出，可在文档站安全使用 `ssg`。

<ComponentApi name="dialog" />
