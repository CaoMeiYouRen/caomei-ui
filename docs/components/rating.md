# Rating 评分

Rating 用于收集或展示分值：默认 5 颗星、整星步进，可开启半星；只读与禁用两态都可用。

## 基础用法

`v-model` 是数字分值（未选择时为 `0`）。`label` 是评分区域的可访问名；不传时取当前语言的内建文案（只读态取只读文案）。

<demo
    vue="../examples/rating/basic.vue"
    ssg="true"
/>

## 最大分值与步进

- `max`：渲染的星级数量，默认 `5`；键盘方向键与点击都按该数量取值。
- `step`：`1`（默认，整星）或 `0.5`（半星）。半星由步进切片实现——每个星级拆成两个可交互指示器，悬停到左半即预览半星。
- 分值按 `step` 取最近一格展示：`0.5` 步进下 `2.3` 显示为 `2.5`；这只影响着色，不会回写模型，也不改变 `aria-checked`（模型仍由交互更新）。

## 只读与禁用

- `readonly`：展示当前分值但不可交互（不可聚焦、不可改值），评分区域带 `aria-readonly`。
- `disabled`：语义为停用，视觉上降低不透明度；同样不可交互。
- 两者都会关掉悬停预览，避免只读态跟随指针变化。

## 无障碍

- 根元素为 `role="radiogroup"`，名称取 `label`，缺省用内建文案（可交互 / 只读各一条）。
- 每个可交互步进是 `role="radio"`，可访问名即该步进的数值（如 `3.5`）；单位语义由区域名提供，避免各语言单复数错误。
- 键盘：`Tab` 进入当前分值或第一项，方向键（← → ↑ ↓）移动并提交，`Space` 选中当前项。

## 样式定制

| 变量 | 默认 | 说明 |
|------|------|------|
| `--caomei-rating-icon-size` | 随 `size` 档位 | 图标尺寸（`sm` / `md` / `lg`） |
| `--caomei-rating-gap` | `--caomei-space-1` | 星级间距 |
| `--caomei-rating-empty-color` | `--caomei-color-border` | 空星颜色 |
| `--caomei-rating-fill-color` | `--caomei-color-primary-text` | 填充星颜色 |

## 从 PrimeVue 迁移

| PrimeVue `Rating` | 本组件 |
| --- | --- |
| `v-model` 数字分值 | 同名 |
| `stars` | `max` |
| `cancel`（再次点击清零） | `clearable` |
| `readonly` | 同名（另有 `aria-readonly`） |
| `disabled` | 同名 |
| 图标由模板 / 样式槽决定 | 内建 `star` 语义图标，可用 `provideIconOverrides()` 替换 |

> 迁移流程与通用陷阱见[从 PrimeVue 迁移](../guide/primevue-migration.md)。

<ComponentApi name="rating" />
