# Anchor 锚点导航

Anchor 把一组标题索引为目录：滚动时高亮当前章节，点击平滑跳到对应标题。支持窗口与自定义滚动容器、层级缩进、受控激活项与 hash 同步；Reka UI 无对应原语，组件为自研 scroll-spy。

## 基础用法

`items` 描述目录；`key` 同时作为 `v-model:active` 的取值，`id` 缺省与 `key` 相同并用于查找标题元素。导航渲染为 `nav` + 链接列表，可访问名取 `label`（缺省为当前语言的「锚点导航」）。

<demo
    vue="../examples/anchor/basic.vue"
    ssg="true"
/>

## 指定滚动容器

`container` 接受元素或 CSS 选择器，缺省为窗口；字符串选择器在挂载与 `container` 变更时解析一次，找不到或非法时回退窗口。滚动监听与点击滚动都作用于该容器——容器场景下点击只滚容器，不会连带滚动页面。

<demo
    vue="../examples/anchor/container.vue"
    ssg="true"
/>

## 嵌套层级

`children` 渲染为缩进层级（`--caomei-anchor-indent-step` 控制步长，默认 12px）；自身与子项都会参与激活计算。

<demo
    vue="../examples/anchor/nested.vue"
    ssg="true"
/>

## 激活判定、点击与 hash

> 示例统一关闭 `hashSync`，避免改动文档站自身的 URL hash；实际接入可按需开启。

- 判定线 = 容器顶 + `offset`（默认 12px）；按 `items`（拍平）顺序遍历，遇到第一个未越过判定线的条目即停止，取它之前的最后一项——因此 **`items` 顺序应与标题在文档中的出现顺序一致**。没有越线项时取首个已解析条目；全部目标都未渲染时保留受控值。
- 点击写回 `v-model:active` 并滚动到「标题顶对齐判定线」的位置；`smooth` 控制平滑滚动，且始终尊重 `prefers-reduced-motion`。修饰键点击（新标签 / 新窗口）交给浏览器。
- `hashSync` 默认开启：点击写入 `#<id>`（`pushState`，后退可回上一节），首屏与 `hashchange` 会据此反查条目并滚动。**hash 模式路由（如 `createWebHashHistory`）的宿主请设 `hashSync="false"`**，避免覆盖路由 hash；此时仍可用 `v-model:active` 自行控制。
- 外部写入 `v-model:active` 只改变高亮，不触发滚动；后续滚动会由 scroll-spy 接管。

## 无障碍

- 根为 `nav` 并带可访问名；当前项用 `aria-current="location"` 标记，链接保持原生 `<a href="#id">` 语义。
- 目标元素未渲染时点击不拦截原生锚点行为，保留浏览器默认跳转。
- 键盘 Tab 可依次聚焦链接，`:focus-visible` 提供 2px 焦点环。

## 样式定制

| 变量 | 默认 | 说明 |
|------|------|------|
| `--caomei-anchor-gap` | `--caomei-space-1` | 条目间距 |
| `--caomei-anchor-indent-step` | `12px` | 每层缩进步长 |
| `--caomei-anchor-link-padding-y` | `--caomei-space-1` | 链接纵向内边距 |
| `--caomei-anchor-link-padding-x` | `--caomei-space-2` | 链接横向内边距 |

<ComponentApi name="anchor" />
