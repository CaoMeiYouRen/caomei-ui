# 图标

caomei-ui 的图标能力由 `@lucide/vue` 与 `CaomeiIcon` 组成：`@lucide/vue` 提供图标组件，`CaomeiIcon` 负责统一的尺寸与对齐。

## 基础用法

`icon` 接收一个图标组件，`size` 默认 `1em`。

```vue
<script setup lang="ts">
import { CaomeiIcon } from 'caomei-ui'
import { Check, ChevronDown } from '@lucide/vue'
</script>

<template>
  <CaomeiIcon :icon="Check" />
  <CaomeiIcon :icon="ChevronDown" size="20" />
</template>
```

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `icon` | `Component` | — | 图标组件，必填 |
| `size` | `number \| string` | `'1em'` | 尺寸；数字按 px，字符串原样使用 |

> 在自身模板中直接引用图标组件时，需在项目中安装 `@lucide/vue`（`pnpm add @lucide/vue`）。它虽是 caomei-ui 的运行时依赖，但在 pnpm 严格依赖布局下不保证可被下游直接解析。

## 在组件中传入图标

Button、Tag、Message 等组件通过 `#icon` 插槽接收图标组件，而不是字符串图标名。以 [Button 按钮](/components/button) 为例：

```vue
<script setup lang="ts">
import { Plus } from '@lucide/vue'
</script>

<template>
  <CaomeiButton variant="primary" icon-position="start">
    <template #icon>
      <CaomeiIcon :icon="Plus" />
    </template>
    新建
  </CaomeiButton>
</template>
```

各组件支持的插槽与插槽位置以对应组件页为准。

## 尺寸

`CaomeiIcon` 默认继承字号（`1em`），与相邻文本基线对齐；需要固定尺寸时传入 `size`（数字按 px，如 `16` / `20`）。
