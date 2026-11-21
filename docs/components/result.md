# Result 结果页

结果页用于承载一个操作的最终结果（成功、失败、无权限、页面不存在等），提供图标、标题、说明与下一步操作。它只负责展示，不感知业务状态来源。

## 基础用法

`status` 决定默认图标与色调，默认 `info`；`title` / `description` 提供文案，`#extra` 放下一步操作。

<demo
    vue="../examples/result/basic.vue"
    ssg="true"
/>

## 状态与图标

- 语义态：`success` / `info` / `warning` / `danger`。
- HTTP 错误码：`403`（无权限，警告色）/ `404`（未找到，弱化色）/ `500`（服务错误，危险色）。
- `icon` 传组件可替换图标，传 `null` 可隐藏；缺省按状态映射（成功 / 信息 / 警告 / 危险 / 错误 / 信息 / 危险）。
- 图标为装饰性内容，标记 `aria-hidden`，可访问信息由标题与描述承载。

<demo
    vue="../examples/result/statuses.vue"
    ssg="true"
/>

## 标题层级与操作区

- 标题固定渲染为 `h2`；页面内已有更合适的层级时，用 `#title` 插槽传入真实标题元素，或把组件包进相应章节。
- `#description` 可放富文本说明；`#extra` 承载 1–2 个按钮，窄屏自动折行。
- `size` 取 `sm` / `md`（默认）/ `lg`，控制图标与标题字号、留白。
- `as` 取 `div`（默认）/ `section` / `article`：整页结果可用 `section`，卡片内结果可用 `article`。

## 与 Empty / Message / Alert 的边界

- `Result` 承载**页面或整块流程的最终结果**，通常占据主内容区并给出下一步操作。
- `Empty` 承载**区块级空态**（列表没有数据），不表达操作成败。
- `Message` 是**即时反馈条**，随操作出现在页面上方或表单附近，承载 live region 播报。
- `Alert` 是**内联常驻提示**（环境说明、配置警告），可与表单 / 页面内容并列展示。
- 同一场景只选一种：操作结束后的整页反馈用 `Result`；列表为空用 `Empty`；一次轻量操作结果用 `Message`。

## 无障碍

- 默认输出 `role="status"` 与 `aria-live="polite"`，结果出现时由读屏器播报；页面外层已有 live region 时传 `:live="false"` 避免重复播报。
- 图标装饰性 `aria-hidden`；标题为真实 `h2`，描述为段落。
- `#extra` 内的按钮沿用组件自身的可访问性，不额外接管焦点。

## 样式定制

| 变量 | 默认 | 说明 |
| --- | --- | --- |
| `--caomei-result-gap` | `--caomei-space-2` | 元素间距 |
| `--caomei-result-padding` | 由尺寸档决定 | 外层留白 |
| `--caomei-result-icon-size` | 2 / 3 / 4rem | 图标字号 |
| `--caomei-result-icon-color` | 按状态 | 图标颜色 |
| `--caomei-result-title-size` | 由尺寸档决定 | 标题字号 |
| `--caomei-result-description-size` | `--caomei-font-size-sm` | 描述字号 |

内容以 `overflow-wrap: anywhere` 折行，320px 视口下不裁切、不产生横向滚动。

<ComponentApi name="result" />
