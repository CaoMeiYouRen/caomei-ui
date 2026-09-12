# Avatar 头像

头像用于展示用户或实体的图像，未提供图片或加载失败时显示回退内容，基于 Reka UI Avatar 封装。

## 基础用法

通过 `src` 提供图片、`alt` 提供替代文本；未提供 `src` 或加载失败时显示回退内容。

<demo
    vue="../examples/avatar/basic.vue"
    ssg="true"
/>

## 尺寸与形状

通过 `size` 切换尺寸（`sm` / `md` / `lg`），`shape` 切换形状（`circle` / `square`）。

<demo
    vue="../examples/avatar/sizes.vue"
    ssg="true"
/>

## 回退内容

回退内容按优先级取自：`#fallback` 插槽 → `fallback` 属性 → `alt` 首字符（大写）。`delayMs` 可延迟回退内容出现，避免图片加载瞬间闪现（需为正数，`0` 等同不延迟）。

<demo
    vue="../examples/avatar/fallback.vue"
    ssg="true"
/>

## 无障碍

- 图片输出 `role="img"` 并透传 `alt` 作为可访问名。
- 提供 `alt` 且未使用 `#fallback` 插槽时，回退内容以 `role="img"` + `aria-label="alt"` 暴露同一可访问名（可见回退文本仅作视觉呈现，可访问名以 `alt` 为准）；缺失 `alt` 时回退内容不输出角色，由可见文本承担语义。
- 使用 `#fallback` 插槽时组件不覆盖其语义，由插槽内容自行承担，插槽内可放交互元素。
- 建议始终提供 `alt`；纯装饰用途请在使用层包裹 `aria-hidden="true"`。

## 样式定制

样式基于 CSS variables，保持低特异性便于覆盖：

| 变量 | 默认 | 说明 |
|------|------|------|
| `--caomei-avatar-size` | 由 `size` 档位决定 | 头像边长（sm 24 / md 32 / lg 40） |
| `--caomei-avatar-radius` | `999px` | 圆角（`shape="square"` 时为 `--caomei-radius-md`） |
| `--caomei-avatar-bg` | `--caomei-color-bg-elevated` | 回退背景色 |
| `--caomei-avatar-color` | `--caomei-color-text-muted` | 回退文字色 |
| `--caomei-avatar-font-size` | 由 `size` 档位决定 | 回退文字字号（sm 12 / md 14 / lg 16） |

```css
.caomei-avatar {
    --caomei-avatar-size: 48px;
    --caomei-avatar-bg: #16a34a;
    --caomei-avatar-color: #ffffff;
}
```

<ComponentApi name="avatar" />
