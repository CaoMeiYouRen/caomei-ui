# Timeline 时间轴

时间轴按时间顺序展示一组事件，由 `CaomeiTimeline` 与 `CaomeiTimelineItem` 组合。节点内容由调用方提供，组件不解析时间、不做排序。

## 基础用法

每个 `CaomeiTimelineItem` 可提供 `title` / `content` / `timestamp` / `tone` / `icon`；`tone` 只影响节点颜色（`primary` / `success` / `warning` / `danger` / `neutral`）。

<demo
    vue="../examples/timeline/basic.vue"
    ssg="true"
/>

## 布局方向

- `mode="left"`（默认）节点在左、内容在右；`mode="right"` 反转单侧布局。
- `mode="alternate"` 左右交替，适合较宽的记录流；窄屏建议回到单侧。
- `reverse` 反转节点顺序（最新在前），不改变传入的 DOM 语义。

## 无障碍

- 根为有序列表 `ol`，每个节点为 `li`，读屏器可播报节点数量与顺序。
- 圆点与图标为装饰，`aria-hidden`；时间戳、标题与正文按 DOM 顺序朗读。
- 可用 `label` 提供时间轴的可访问名；无名称时保持列表语义。

## 与 Steps 的边界

- `Timeline` 展示**已发生事件**的时间顺序，节点之间没有强制的完成状态。
- `Steps` 展示**流程进度**，带当前步骤与完成态；流程编排请用 Steps。

<ComponentApi name="timeline" />
