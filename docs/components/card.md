# Card 卡片

卡片用于分组承载相关内容，作为纯布局容器不引入任何交互逻辑，自带边框 / 阴影 / 填充三种基础外观。

## 基础用法

通过 `title` / `subtitle` 提供头部文案，默认插槽为正文，`footer` 插槽放置底部操作。

<demo
    vue="../examples/card/basic.vue"
    ssg="true"
/>

## 变体

通过 `variant` 切换外观，支持 `outlined`（默认，边框）、`elevated`（阴影）、`filled`（填充底色）。

<demo
    vue="../examples/card/variants.vue"
    ssg="true"
/>

## 内边距

通过 `padding` 切换内边距档位，支持 `none` / `sm` / `md`（默认）/ `lg`。

<demo
    vue="../examples/card/padding.vue"
    ssg="true"
/>

## 自定义头部与底部

- `title` / `extra` 插槽用于自定义标题内容与头部右侧操作。
- `header` 插槽整体替换默认头部（此时 `title` 等属性不再生效）。
- `footer` 插槽放置底部操作。
- `hoverable` 开启悬浮反馈，适合可点击卡片。

<demo
    vue="../examples/card/slots.vue"
    ssg="true"
/>

## 语义标签

`as` 指定根元素标签，默认 `div`。可根据场景改为 `section` / `article`，或包裹为可点击元素的 `a`：

```vue
<CaomeiCard as="article" title="文章标题">
  正文
</CaomeiCard>
```

## 样式定制

样式基于 CSS variables，保持低特异性便于覆盖：

| 变量 | 默认 | 说明 |
|------|------|------|
| `--caomei-card-bg` | 按变体 | 背景色：`outlined` / `elevated` 取 `--caomei-color-bg`，`filled` 取 `--caomei-color-bg-elevated` |
| `--caomei-card-border` | `--caomei-color-border` | 描边颜色 |
| `--caomei-card-radius` | `--caomei-radius-lg` | 圆角 |
| `--caomei-card-padding` | 由 `padding` 档位决定 | 各区块内边距 |
| `--caomei-card-shadow` | `--caomei-shadow-sm`（`0 4px 12px rgb(0 0 0 / 0.08)`） | `elevated` 阴影 |
| `--caomei-card-shadow-hover` | `--caomei-shadow-md`（`0 8px 24px rgb(0 0 0 / 0.12)`） | `hoverable` 悬浮阴影 |

```css
.caomei-card {
    --caomei-card-radius: 4px;
    --caomei-card-bg: var(--caomei-color-bg-elevated);
}
```

> `padding` 档位通过 `:where()` 以零特异性写入 `--caomei-card-padding`，可直接在 `.caomei-card` 上覆盖该变量调整内边距。

## 无障碍

- 卡片为通用容器，不内置 `role` 与标题层级；`title` 属性渲染为普通 `div`，需要标题语义时请通过 `title` 插槽传入 `<h3>` 等真实标题元素。该属性同时会拦截原生 HTML `title` 提示，需要原生 tooltip 时请改用其他方式。
- 可点击卡片建议通过包裹原生可交互元素实现，而非给容器绑定点击事件；使用 `as="a"` 时需带 `href` 才能键盘聚焦，或改用原生 `button` 包裹。

<ComponentApi name="card" />
