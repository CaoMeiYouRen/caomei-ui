# NavigationMenu 导航菜单

站点级导航菜单：一组触发器共享同一个内容视口，悬停或点击 / 键盘切换展开、切换时不跳动。基于 Reka UI 的 `NavigationMenu` 原语封装，提供菜单 / 触发器 / 内容 / 链接四层组件。

## 基础用法

`CaomeiNavigationMenu` 是容器（内含列表与内容视口）；`CaomeiNavigationMenuTrigger` 组合了「列表项 + 触发器」，**内容必须写进 `#content` 插槽**：触发器组件只把默认插槽渲染进按钮，内容应作为列表项内与触发器并列的节点；默认插槽里直接放链接等非 Teleport 的可交互元素会嵌进按钮。

<demo
    vue="../examples/navigation-menu/basic.vue"
    ssg="true"
/>

## 内容面板

内容面板由 Reka 渲染进根组件的视口，尺寸随当前面板自动收敛；面板内可放链接、说明或任意布局。

<demo
    vue="../examples/navigation-menu/panel.vue"
    ssg="true"
/>

## 交互语义

- 导航菜单是**非模态**浮层：展开时背景保持可交互，点击外部或切换到另一触发器即关闭。
- 鼠标悬停按 `delayDuration`（默认 200ms）展开，`skipDelayDuration` 控制相邻菜单之间跳过延迟的窗口；键盘 `Enter` / `Space` 切换开合，**已展开时** `ArrowDown` 进入首个链接，`Esc` 关闭并把焦点还给触发器。
- `v-model` 与触发器的 `value` 对应：写入某个 `value` 即展开该菜单，关闭后回写为空字符串；未绑定 `v-model` 时为非受控。触发器未提供 `value` 时由 Reka 生成标识，此后无法用受控值寻址，受控场景请显式传值。

## 键盘与无障碍

- 根元素为 `nav`（隐式 `role="navigation"`），透传 `aria-label` 作为导航名；触发器带 `aria-expanded` / `aria-controls`。
- 内容面板默认 `role="group"` 并以触发器为可访问名来源；需要其它角色时可透传 `role` 覆盖。
- 当前页链接用 `active` 标记，映射 `aria-current="page"`。

## 属性

| 组件 | 主要 props |
|------|------|
| `CaomeiNavigationMenu` | `v-model`、`delayDuration`、`skipDelayDuration`、`orientation`、`dir` |
| `CaomeiNavigationMenuTrigger` | `value`、`disabled`、`#content` 插槽 |
| `CaomeiNavigationMenuContent` | `forceMount` |
| `CaomeiNavigationMenuLink` | `active` |

## 样式定制

| 变量 | 默认 | 说明 |
|------|------|------|
| `--caomei-navigation-menu-gap` | `--caomei-space-1` | 触发器间距 |
| `--caomei-navigation-menu-padding` | `--caomei-space-1` | 菜单栏内边距 |
| `--caomei-navigation-menu-border` | `--caomei-color-border` | 菜单栏描边 |
| `--caomei-navigation-menu-bg` | `--caomei-color-bg-elevated` | 菜单栏底色 |
| `--caomei-navigation-menu-trigger-gap` | `--caomei-space-1` | 触发器内图标与文本间距 |
| `--caomei-navigation-menu-trigger-padding-x` | `--caomei-space-3` | 触发器横向内边距 |
| `--caomei-navigation-menu-trigger-padding-y` | `--caomei-space-1` | 触发器纵向内边距 |
| `--caomei-navigation-menu-trigger-active-bg` | `--caomei-color-bg` | 触发器悬停 / 展开底色 |
| `--caomei-navigation-menu-content-min-width` | `12rem` | 面板最小宽度 |
| `--caomei-navigation-menu-content-padding` | `--caomei-space-2` | 面板内边距 |
| `--caomei-navigation-menu-content-border` | `--caomei-color-border` | 面板描边 |
| `--caomei-navigation-menu-content-bg` | `--caomei-color-bg-elevated` | 面板底色 |
| `--caomei-navigation-menu-link-padding-x` | `--caomei-space-2` | 链接横向内边距 |
| `--caomei-navigation-menu-link-padding-y` | `--caomei-space-2` | 链接纵向内边距 |
| `--caomei-navigation-menu-link-active-bg` | `--caomei-color-bg` | 链接悬停 / 当前页底色 |
| `--caomei-navigation-menu-z-index` | `--caomei-z-dropdown` | 内容视口层级 |

<ComponentApi name="navigation-menu" />
