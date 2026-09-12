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
- 可访问名默认取当前语言的「加载中」，可用 `label` 覆盖；相邻可见文本建议与 `label` 保持一致。
- 遵循 `prefers-reduced-motion`：减弱动画时降低旋转速度（保留运动以表达进行中）。使用方全局的 reduced-motion 规则可能完全停用动画。

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

<ComponentApi name="progress-spinner" />
