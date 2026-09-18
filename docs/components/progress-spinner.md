# ProgressSpinner 加载指示

加载指示器用于表示正在进行的异步操作，基于 Reka UI Progress 封装（不确定进度）。

## 基础用法

<demo
    vue="../examples/progress-spinner/basic.vue"
    ssg="true"
/>

## 尺寸

通过 `size` 切换尺寸，支持 `sm` / `md` / `lg`。

<demo
    vue="../examples/progress-spinner/sizes.vue"
    ssg="true"
/>

## 可访问名与颜色

`label` 提供可访问名（默认取当前语言的「加载中」）；颜色与轨道可用 CSS 变量覆盖。

<demo
    vue="../examples/progress-spinner/states.vue"
    ssg="true"
/>

## 无障碍

- 根节点为 `role="progressbar"`；不确定进度下不输出 `aria-valuenow`。
- 可访问名优先级为 `label` > 透传 `aria-label` > 当前语言「加载中」；未提供 `label`（或传空串）时透传值生效；相邻可见文本建议与 `label` 保持一致。
- 遵循 `prefers-reduced-motion`：减弱动画时放慢旋转而非停止（保留运动以表达进行中）。使用方全局的 reduced-motion 规则（如 VitePress 默认主题的 `* { animation-duration: 1ms !important }`）可能完全停用动画；文档站已就地恢复该减速旋转以保证演示可见。

## 样式定制

样式基于 CSS variables，保持低特异性便于覆盖：

| 变量 | 默认 | 说明 |
|------|------|------|
| `--caomei-progress-spinner-size` | 由 `size` 档位决定 | 尺寸（sm 16 / md 24 / lg 32） |
| `--caomei-progress-spinner-stroke` | 由 `size` 档位决定 | 轨道宽度（sm / md 2px，lg 3px） |
| `--caomei-progress-spinner-color` | `--caomei-color-primary` | 指示色 |
| `--caomei-progress-spinner-track` | `--caomei-color-border` | 轨道色 |

```css
.caomei-progress-spinner {
    --caomei-progress-spinner-color: #16a34a;
    --caomei-progress-spinner-track: #d1fae5;
}
```

## 从 PrimeVue 迁移

| PrimeVue | 本组件 |
| --- | --- |
| 经 `style` 传宽高（任意 px） | `size` 档位（`sm` / `md` / `lg` ＝ 16 / 24 / 32px）或覆盖 `--caomei-progress-spinner-size` |
| `strokeWidth` | 未实现：当前经 CSS 变量 `--caomei-progress-spinner-stroke`（档位默认 2 / 2 / 3px）；**该 prop 已登记为后续补强项，交付后同步本节** |
| `fill`（圆背景色） | 未实现：轨道颜色经 `--caomei-progress-spinner-track` |
| `animationDuration` | 未实现：固定 `0.6s`，`prefers-reduced-motion` 下 `1.6s` |
| 无 | `label`（可访问名；未提供时回退内建「加载中」文案）为本库新增 |

> 迁移流程与通用陷阱见[从 PrimeVue 迁移](../guide/primevue-migration.md)。

<ComponentApi name="progress-spinner" />
