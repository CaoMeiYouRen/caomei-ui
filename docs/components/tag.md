# Tag 标签

标签用于对内容进行分类或标记，支持语义色调、多种变体与可关闭交互。

## 基础用法

<demo
    vue="../examples/tag/basic.vue"
    ssg="true"
/>

## 色调

通过 `tone` 切换语义色调，支持 `neutral` / `primary` / `success` / `warning` / `danger`。

<demo
    vue="../examples/tag/tones.vue"
    ssg="true"
/>

## 变体与尺寸

通过 `variant` 切换 `soft` / `solid` / `outline`，通过 `size` 切换 `sm` / `md` / `lg`，通过 `rounded` 切换胶囊形态（圆角取 `--caomei-radius-full`）。

<demo
    vue="../examples/tag/variants.vue"
    ssg="true"
/>

> 迁移映射（PrimeVue → caomei-ui）：`severity` → `tone`，其中 `secondary` / `contrast` → `neutral`、`success` → `success`、`warn` / `warning` → `warning`、`danger` → `danger`、`info` → `primary`（`secondary` / `contrast` / `info` 均为**有损近似**，`info` tone 见[设计规范 §9 未决项](../design/design-spec.md)）；Tag 无 `error` 用量，通用语义色映射见[复核台账 §4.3](../design/governance/2026-09-14-momei-usage-audit.md)；`outlined` → `variant="outline"`；`rounded` → `rounded`；`value` → 默认插槽；字符串 `icon` → `#icon` 插槽。Tag 不新增 `outlined` / `severity` / `value` prop。

## 可关闭

设置 `closable` 后显示关闭按钮，点击抛出 `close` 事件由父级处理移除。

<demo
    vue="../examples/tag/closable.vue"
    ssg="true"
/>

## 无障碍

- 关闭按钮使用内建多语言标签，可通过 `closeLabel` 覆盖。
- `disabled` 时关闭按钮不可交互且不抛出 `close`。
- 可通过 `icon` 插槽在文本前放置图标。

<ComponentApi name="tag" />
