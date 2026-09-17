# InputGroup 输入框组合

输入框组合把多个表单控件拼接为单一控件外观：自动消除相邻重复边框与内侧圆角，并让输入类成员占满剩余宽度。

## 基础用法

组合输入框与图标按钮，按钮点击后回填内容：

<demo
    vue="../examples/input-group/basic.vue"
    ssg="true"
/>

## 与选择器组合

任意表单控件均可作为成员，例如选择器 + 操作按钮：

<demo
    vue="../examples/input-group/with-select.vue"
    ssg="true"
/>

## 垂直组合

`orientation="vertical"` 让成员纵向堆叠（常用于输入框 + 通栏按钮）：

<demo
    vue="../examples/input-group/vertical.vue"
    ssg="true"
/>

## 边框拼接约定

- 成员按 DOM 顺序拼接：首成员保留起始侧圆角、末成员保留结束侧圆角，中间成员去圆角。
- 组内圆角：组合首尾外侧圆角由 `--caomei-input-group-radius` 定制，连接侧恒为 0；成员自身与其内层元素的圆角由拼接规则接管（`Select` 的可见圆角在内层触发器上，跟随成员根元素取值）。
- 相邻成员以 `-1px` 外边距重叠边框，避免出现 2px 双线；聚焦成员会自动抬升到相邻边框之上。
- 输入类成员（`Input` / `InputNumber` / `Select` / `MultiSelect` / `Textarea`）自动占满剩余宽度，并解除成员自身的 `max-width` 限制（`Select` / `InputNumber` 默认封顶），使组合真正铺满；该规则以更高特异性直接置 `max-width: none`，故组内覆盖 `--caomei-select-max-width` 一类成员级宽度上限变量同样不生效；其余成员（如 `Button`）保持内容宽度。

## 无障碍

- 容器仅承担布局职责，不改变成员的语义、焦点顺序与 ARIA 属性。
- 只放图标按钮时，请为按钮提供可访问名（如 `Button` 的 `label`）。

## 样式定制

样式基于 CSS variables，保持低特异性便于覆盖：

| 变量 | 默认 | 说明 |
|------|------|------|
| `--caomei-input-group-radius` | `--caomei-radius-md` | 组合首尾外侧圆角 |

<ComponentApi name="input-group" />
