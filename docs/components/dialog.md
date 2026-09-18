# Dialog 对话框

对话框用于在当前页面之上承载需要用户聚焦处理的内容，基于 Reka UI Dialog 封装。

## 基础用法

通过 `v-model:open` 控制显隐，`title` 作为无障碍名称（可省略，省略时回退内建「对话框」文案作为不可见可访问名），可用 `footer` 插槽放置操作按钮。

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

## 头部与关闭事件

`showHeader="false"` 时头部（标题区域与关闭按钮）整体不渲染，适合完全自定义内容的浮层；此时 `title` 仅作为不可见可访问名保留。关闭按钮随头部一并移除，需自行提供关闭入口（或保留遮罩 / Esc 关闭）。`hide` 事件在对话框由打开转为关闭时触发——遮罩、Esc、关闭按钮与外部受控置假均计入。

<demo
    vue="../examples/dialog/headerless.vue"
    ssg="true"
/>

## 断点宽度

`breakpoints` 按视口宽度上限设置面板宽度：键为视口最大宽度（px），值为面板宽度。命中多个断点时以**最窄档**为准（与键顺序无关），未提供时按 `size` 档位宽度；语义与[响应式设计](../design/responsive.md)一致（统一 `width <=`）。键或值非法的条目会被忽略。

<demo
    vue="../examples/dialog/breakpoints.vue"
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
- `title` 可省略：省略或 `showHeader="false"` 时标题（与描述）转为视觉隐藏仍留在 DOM 中，保证可访问名非空（回退内建「对话框」文案），不会产生空属性。
- 模态打开时锁定页面滚动；Portal 内容仅客户端挂载，`open` 默认关闭时 SSR 无额外输出，可在文档站安全使用 `ssg`。

## 从 PrimeVue 迁移

| PrimeVue | 本组件 |
| --- | --- |
| `v-model:visible` | `v-model:open` |
| `header` | `title`（**可选**：缺省时以内建「对话框」文案作为不可见可访问名） |
| `show-header` | `showHeader`（默认同为 `true`；为 `false` 时头部整体不渲染） |
| `breakpoints` | `breakpoints`（键为视口最大宽度、值为面板宽度；命中多个时最窄档优先） |
| `@hide` | `hide`（本组件无出场动画，契约为「`open` 由真转假」） |
| `dismissable-mask` / `close-on-escape` | `closeOnOverlay` / `closeOnEsc` |
| `block-scroll` | 未暴露：`modal="true"` 已锁定页面滚动（比 PrimeVue 默认更严格） |

**已知差异（有意）**：断点规则写在面板自身的 `<style>` 上、依赖源序 tie-break（下游需以更高特异性或 `!important` 覆盖），且要求消费方 CSP `style-src` 允许内联样式；其余有意差异见[设计规范 §7](../design/design-spec.md)。

**未实现 / 未暴露**：`maximizable` / `draggable` / `position` / `appendTo`，以及 `show` / `after-hide` 等生命周期事件。

> 迁移流程与通用陷阱见[从 PrimeVue 迁移](../guide/primevue-migration.md)。

<ComponentApi name="dialog" />
