# 主题与样式设计

本文档定义 caomei-ui 的设计 token、主题切换、暗色模式与响应式方案。

## 1. 核心原则

- **组件与样式解耦**：默认极简可用，可 100% 覆盖。
- 使用 CSS variables 承载语义化 token，禁止在组件内部硬编码品牌色。
- **不引入 Tailwind / UnoCSS**。

## 2. Token 命名

统一前缀 `--caomei-*`，语义化命名。

```css
:root {
  --caomei-color-primary: #e63946;
  --caomei-color-primary-foreground: #ffffff;
  --caomei-color-bg: #ffffff;
  --caomei-color-bg-elevated: #f7f7f8;
  --caomei-color-text: #1a1a1a;
  --caomei-color-text-muted: #6b7280;
  --caomei-color-border: #e5e7eb;
  --caomei-color-success: #15803d;
  --caomei-color-warning: #b45309;
  --caomei-color-danger: #dc2626;
  --caomei-color-primary-solid: #e63946;
  --caomei-color-success-solid: #15803d;
  --caomei-color-warning-solid: #b45309;
  --caomei-color-danger-solid: #dc2626;
  --caomei-color-neutral-solid: #52525b;

  --caomei-radius-sm: 4px;
  --caomei-radius-md: 8px;
  --caomei-radius-lg: 12px;

  --caomei-font-sans: system-ui, -apple-system, sans-serif;

  --caomei-space-1: 4px;
  --caomei-space-2: 8px;
  --caomei-space-3: 12px;
  --caomei-space-4: 16px;

  --caomei-input-number-max-width: 12rem;
  --caomei-select-max-width: 20rem;

  --caomei-breakpoint-sm: 640px;
  --caomei-breakpoint-md: 768px;
  --caomei-breakpoint-lg: 1024px;
}

.dark {
  --caomei-color-bg: #0b0b0d;
  --caomei-color-bg-elevated: #17171a;
  --caomei-color-text: #f5f5f5;
  --caomei-color-text-muted: #a1a1aa;
  --caomei-color-border: #2a2a2e;
  --caomei-color-danger: #f87171;
  --caomei-color-success: #4ade80;
  --caomei-color-warning: #fbbf24;
}
```

`--caomei-color-<tone>` 为**随主题自适应的强调色**（用于文字、边框、soft 底）；`--caomei-color-<tone>-solid` 为**跨主题稳定的实底背景色**，仅用于 `solid` 变体，保证暗色下白字对比度。`neutral` 无强调色，仅提供 `--caomei-color-neutral-solid`。

## 3. 主题切换

- 支持方式：
  - `.dark` class（默认，便于 SSR 与手动切换）；
  - `[data-theme="dark"]` 属性；
  - `prefers-color-scheme`（跟随系统）。
- Nuxt 模块可配置 `darkMode: 'class' | 'media' | false`。
- 提供 `useTheme()` composable 管理当前主题与切换。

## 4. 消费者定制

优先级由低到高：

1. 引入 `caomei-ui/styles.css` 获得默认样式；
2. 覆盖 `--caomei-*` CSS variables 调整视觉；
3. 通过组件 `class` / 样式透传做局部覆盖。

不提供 Tailwind preset 作为内置依赖；如需为 Tailwind 用户提供 token 映射，另作可选文档。

> `solid` 变体的实底色由 `--caomei-color-<tone>-solid` 控制，该组 token 跨主题稳定（不随明暗切换），以保证白字对比度；替换品牌强调色时需同时覆盖对应 `-solid`。

### 4.1 表单控件宽度

表单控件默认 `width: 100%` 以适配表单栅格；其中数值输入框与选择器另设可覆盖的默认 `max-width`，避免在宽容器中过度拉伸：

- `--caomei-input-number-max-width`（默认 `12rem`）
- `--caomei-select-max-width`（默认 `20rem`）

需要撑满所在列时，将该 token 覆盖为 `none`，或对实例覆盖 `max-width`：

```css
.caomei-select {
  --caomei-select-max-width: none;
}
```

文本类控件（`Input` / `Textarea`）默认不设上限，如需限制宽度，在使用层通过容器或 `max-width` 控制即可。

## 5. 响应式

- 单包响应式，不拆移动端包；断点由组件内部媒体查询处理。
- 典型适配：
  - DataTable 窄屏转卡片列表；
  - Dialog 窄屏转全屏或 Drawer；
  - 表单栅格在窄屏堆叠。
- 触摸/鼠标差异由 Reka UI 的指针事件处理，无需额外适配。

## 6. 无障碍

- 基于 Reka UI 的无障碍语义（ARIA、键盘导航、焦点管理）。
- 组件必须保证键盘可达与焦点可见。
- 可选引入 axe-core 做自动化 a11y 回归（见 Backlog）。
