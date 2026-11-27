# TreeVirtualizer 虚拟树

面向**大列表**的树：只渲染可视区附近的行，几千个节点也能流畅滚动。基于 Reka UI 的 `TreeVirtualizer` 封装，展开 / 折叠、选择与键盘导航语义与 `CaomeiTree` 一致。

## 基础用法

滚动容器的高度由 `height` 决定（虚拟化需要确定高度才能算出可视区间）；`itemHeight` 是行高估算值，必须与实际行高一致（默认 28px），否则滚动定位会累积偏移。

<demo
    vue="../examples/tree-virtualizer/basic.vue"
    ssg="true"
/>

## 大数据

下面示例共 4200 个节点（200 个分组 × 20 个子节点），DOM 里始终只保留可视区 + `overscan` 行。`overscan`（默认 12）越大滚动越平滑、渲染成本越高。

<demo
    vue="../examples/tree-virtualizer/large.vue"
    ssg="true"
/>

## 交互与无障碍

- **虚拟化边界**：只有可视区附近的行进入 DOM，因此「查找所有节点」类操作必须基于 `items` 数据，不能依赖 DOM 查询。
- **展开 / 折叠**：`v-model:expanded` 受控，未绑定时自持；展开后容器总高度按新增可见行增长，折叠后回落。
- **键盘**：树是单一 Tab 停靠点，方向键在当前渲染窗口内移动（`CaomeiTree` 的 roving tabindex 语义）；跨窗口移动由虚拟化器滚动后重新聚焦，随滚动更新。
- **选择**：`v-model` 为键列表；`multiple` 关闭时最多一项。
- **可访问名**：`label` 优先于透传的 `aria-label`；虚拟树同样需要名称说明「这棵树是什么」。
- 与 `CaomeiTree` 的分工：节点数量小（几百以内）用 `CaomeiTree`；上千或需要固定高度滚动区用本组件。本组件不支持 `propagateSelect` / `bubbleSelect`。

## 属性

| 组件 | 主要 props |
|------|------|
| `CaomeiTreeVirtualizer` | `items`、`itemKey`、`labelKey`、`childrenKey`、`height`、`itemHeight`、`overscan`、`v-model`、`v-model:expanded`、`multiple`、`label` |

## 样式定制

| 变量 | 默认 | 说明 |
|------|------|------|
| `--caomei-tree-virtualizer-border` | `--caomei-color-border` | 滚动容器描边 |
| `--caomei-tree-virtualizer-item-height` | `28px` | 行高，须与 `itemHeight` 一致 |
| `--caomei-tree-virtualizer-indent` | `--caomei-space-4` | 每层缩进 |
| `--caomei-tree-virtualizer-selected-bg` | `color-mix(in srgb, --caomei-color-primary 12%, transparent)` | 选中行底色 |

<ComponentApi name="tree-virtualizer" />
