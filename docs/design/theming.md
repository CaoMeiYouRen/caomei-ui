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
  --caomei-color-primary: #2563eb;
  --caomei-color-primary-foreground: #ffffff;
  --caomei-color-bg: #ffffff;
  --caomei-color-bg-elevated: #f7f7f8;
  --caomei-color-text: #1a1a1a;
  --caomei-color-text-muted: #6b7280;
  --caomei-color-border: #e5e7eb;
  --caomei-color-success: #15803d;
  --caomei-color-warning: #b45309;
  --caomei-color-danger: #dc2626;
  --caomei-color-primary-solid: #2563eb;
  --caomei-color-success-solid: #15803d;
  --caomei-color-warning-solid: #b45309;
  --caomei-color-danger-solid: #dc2626;
  --caomei-color-neutral-solid: #52525b;
  --caomei-color-on-solid: #fff;

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
}

:is(.dark, [data-theme='dark']) {
  --caomei-color-primary: #60a5fa;
  --caomei-color-primary-foreground: #0b0b0d;
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

`--caomei-color-<tone>` 为**随主题自适应的强调色**（用于文字、边框、soft 底）；`--caomei-color-<tone>-foreground` 是**与该 tone 配套的前景色**（tone 作底时的文字 / 图标色，随明暗切换，如暗色 `primary-foreground` 取深色 `#0b0b0d` 以配亮蓝底）；`--caomei-color-<tone>-solid` 为**跨主题稳定的实底背景色**，仅用于 `solid` 变体，固定配 `--caomei-color-on-solid`（保证实底白字对比度）。`neutral` 无强调色，仅提供 `--caomei-color-neutral-solid`。

> 以上 token 片段为节选，完整清单以 `src/styles/theme.css` 为准。断点约定为 sm 640px / md 768px / lg 1024px；`@media` 不支持 CSS 自定义属性，故未定义 `--caomei-breakpoint-*`（详见 [设计规范 §2.3](./design-spec.md)）。

## 3. 主题切换

- 支持方式（**默认亮色**；显式 `.light` / `[data-theme="light"]` 可在开启系统跟随后临时锁定亮色）：
  - `.dark` class（默认，便于 SSR 与手动切换）；
  - `[data-theme="dark"]` 属性；
  - 系统跟随（`prefers-color-scheme: dark`）：需在根元素显式加 `data-scheme="auto"`。
- 品牌预设：根元素 `data-preset="caomei"` / `"momei"`（基础预设缺省），见 [设计规范 §5](./design-spec.md)。
- Nuxt 模块可配置 `darkMode: 'class' | 'media' | false`（`media` 时模块写入 `data-scheme="auto"` 跟随系统），并可用 `theme` 覆盖 token，详见[架构设计 §5](./architecture.md)。
- 提供 `useTheme()` composable 管理当前主题与切换。

## 4. 消费者定制

优先级由低到高：

1. 引入 `caomei-ui/styles.css` 获得默认样式；
2. 选择品牌预设（根元素 `data-preset="caomei"` / `"momei"`）；
3. 覆盖 `--caomei-*` CSS variables 调整视觉；
4. 通过组件 `class` / 样式透传做局部覆盖。

不提供 Tailwind preset 作为内置依赖；如需为 Tailwind 用户提供 token 映射，另作可选文档。

> `solid` 变体的实底色由 `--caomei-color-<tone>-solid` 控制，该组 token 跨主题稳定（不随明暗切换），以保证与 `--caomei-color-on-solid` 的对比度；替换品牌强调色时需同时覆盖对应 `-solid`，并在该色会作为底承载文字 / 图标时一并覆盖 `--caomei-color-primary-foreground`（Nuxt 模块可用 `primary-foreground` 别名，但别名写入的是单条 `:root` 声明、跨明暗同值，需要按明暗分别取值时仍以 CSS 覆盖为准；详见 [设计规范 §2.2](./design-spec.md)）。

### 4.1 表单控件宽度

表单控件默认 `width: 100%` 以适配表单栅格；其中数值输入框与选择器另设可覆盖的默认 `max-width`，避免在宽容器中过度拉伸：

- `--caomei-input-number-max-width`（默认 `12rem`）
- `--caomei-select-max-width`（默认 `20rem`）

`MultiSelect` / `AutoComplete` / `DatePicker` 的上限不各自声明默认值，按回退链取 `--caomei-select-max-width`，可用 `--caomei-multi-select-max-width` / `--caomei-auto-complete-max-width` / `--caomei-date-picker-max-width` 单独覆盖。

需要撑满所在列时，把对应 token 覆盖为 `none`：`Select` 的上限由字段外层 `.caomei-select__field` 承载，需覆盖在该元素或其祖先上；`MultiSelect` / `AutoComplete` / `DatePicker` 直接读取组件根元素上的 token，覆盖在组件元素或其祖先上即可。

```css
.caomei-select__field {
  --caomei-select-max-width: none;
}

.caomei-date-picker {
  --caomei-date-picker-max-width: none;
}
```

> `Select` 的宽度上限由字段外层 `.caomei-select__field` 承载（其内为触发器与清除按钮两个兄弟节点），直接写在 `.caomei-select`（触发器）上不会生效。上述 scoped 规则都以「组件类 + scope 属性」声明 `max-width`，故用单类选择器覆盖 `max-width` 属性会因特异性不足而失效，请改用 token。

文本类控件（`Input` / `Textarea`）默认不设上限，如需限制宽度，在使用层通过容器或 `max-width` 控制即可。

> 这些默认 `max-width` 会改变既有页面中数值输入框 / 选择器 / 日期选择器的宽度；如需保持全宽，请将对应 token 覆盖为 `none`。

## 5. 响应式

- 单包响应式，不拆移动端包；断点由组件内部媒体查询处理。
- **权威定义**：断点语义（640 / 768 / 1024）、窄屏行为矩阵、验收标准与分批清单见[响应式设计](./responsive.md)；本文档不重述。
- 触摸/鼠标差异由 Reka UI 的指针事件处理，无需额外适配。

### 5.1 浮层滚动锁与布局稳定性

- 模态浮层（Dialog 等）打开时会锁定页面滚动，通常通过移除 `body` 滚动条实现，这会使视口宽度变化。
- `body` 的 `padding-right` 补偿只能稳定文档流（`in-flow`）内容；固定定位或 `100%` 视口元素（如顶部导航）仍会随视口宽度变化，产生布局位移。
- 两类方案互斥：① 保留 `body` padding 补偿——`in-flow` 稳定且遮罩完整，但 fixed 元素随视口宽度变化；② 为基础滚动容器预留 `scrollbar-gutter: stable`——视口宽度稳定，但标准 `position: fixed; inset: 0` 遮罩无法覆盖预留区，出现未遮罩竖条。
- **决策：采用方案 ①**（保留 `body` padding 补偿，不设置 `scrollbar-gutter`）。理由：遮罩保持完整覆盖；「滚动条消失 + fixed / `100%` 视口元素随视口宽度变化」属预期的模态行为（参考同类组件库如 PrimeVue 的模态表现）。该位移须被验证记录，但作为已知预期，不作为缺陷。
- 非模态浮层不得锁 body 滚动：Reka `SelectContent.bodyLock` 默认为 `true`（移除滚动条并补偿 `padding-right`，引发布局跳动）；非模态下拉须显式设为 `false`，需要锁定时再开放。
- 验证要求见[测试规范 §5.1](../standards/testing.md#_5-1-浮层组件的页面稳定性-必测)。
- Reka `DropdownMenu` 以 `modal` prop 控制模态（默认 `true`，会锁定 `body` 并屏蔽外部指针）；非模态下拉应关闭该 prop。

## 6. 无障碍

- 基于 Reka UI 的无障碍语义（ARIA、键盘导航、焦点管理）。
- 组件必须保证键盘可达与焦点可见。
- 可选引入 axe-core 做自动化 a11y 回归（见 Backlog）。

## 7. 对比度实测约定

- 实测须在**同一页面状态内**切换 token（注入旧值 → 清除注入读新值），并在测量期禁用 `transition` / `animation`；否则会采到过渡中间态，得到并不存在的差值。
- 不要用 `git stash` 造「改前」状态重跑：Vite 的 mtime 缓存会让服务端仍发旧 CSS（改前 = 改后）。取证脚本应内置 **token 自检**（读取根元素 computed 自定义属性并断言期望值），不符即让证据作废退出。
- 改动前景 token 前须全库枚举三类消费点：① `-solid` 实底 + `on-solid`；② 自适应底 + `-foreground`；③ **就地覆写**（如 `--caomei-color-primary: var(--caomei-color-danger-solid)`，前景仍走全局 token）。
- 暗色下两类 token 不得共用同一前景：**自适应主色**取亮色变体作文字 / 边框（配深色前景），**跨主题稳定实底**保持品牌色（配 `on-solid` 白字）；否则必有一侧掉到 AA 以下。
