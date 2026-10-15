# Menu 导航菜单

导航菜单用于组织页面级导航（侧栏 / 顶栏），采用 WAI-ARIA 的 **disclosure 导航**结构（`nav` + 列表 + 可展开子菜单），子菜单的展开 / 收起由 Reka `Collapsible` primitive 承载；由 `CaomeiMenu` 与 `CaomeiMenuItem` / `CaomeiSubMenu` 组合使用。

## 基础用法

`CaomeiMenu` 渲染 `nav` + `ul`；`CaomeiMenuItem` 传 `href` 时渲染链接、否则渲染按钮；当前页用 `current` 标记（映射 `aria-current="page"`）。

<demo
    vue="../examples/menu/basic.vue"
    ssg="true"
/>

## 横向排布与受控展开

`orientation` 取 `vertical`（默认，侧栏）或 `horizontal`（顶栏）。`CaomeiSubMenu` 的展开态可由 `v-model:open` 接管（受控），或用 `default-open` 指定初始展开。

<demo
    vue="../examples/menu/orientation.vue"
    ssg="true"
/>

## 键盘导航

| 按键 | 行为 |
| --- | --- |
| `ArrowDown` / `ArrowUp` | 纵向：在可聚焦项之间前后移动（不循环，到端点即停） |
| `ArrowRight` / `ArrowLeft` | 横向：前后移动；纵向：展开 / 收起当前子菜单（展开后焦点移入面板首项，收起后交回触发器） |
| `Home` / `End` | 跳到首项 / 末项 |
| `Escape` | 收起所在子菜单并把焦点交回其触发器 |
| `Enter` / `Space` | 激活项（链接跳转 / 按钮点击）；在子菜单触发器上切换展开态 |

收起状态的子菜单面板由 Presence **卸载**，其子项不进入键盘序列与可访问树。**收起（`ArrowLeft` / `Escape`）以焦点位于面板内为前提**：焦点停在已展开的触发器上时二者不动作（避免误吞按键）。

## 无障碍

- 容器为 `nav`（`label` 映射 `aria-label`）+ `ul[role="list"]`：`list-style: none` 会移除 Safari 的列表语义，故显式声明 `role="list"`。
- 项为原生链接或按钮；当前项经 `current` 输出 `aria-current="page"`（也支持 `step` / `location` / `date` / `time`）。
- 子菜单触发器输出 `aria-expanded` 与 `aria-controls`（指向面板容器）。
- 禁用项输出 `aria-disabled="true"`（链接同时去掉 `href` 与 Tab 停靠点），且不进入方向键序列。
- 组件**不内建文案**：未传 `label` 时不渲染 `aria-label`；同一页面存在多个导航区时应逐区提供。

## 与 DropdownMenu 的分工

| | Menu（本组件） | DropdownMenu |
| --- | --- | --- |
| 语义 | **导航**：一组页面入口 | **动作**：一组命令 |
| 结构 | 常驻的 `nav` 列表，子菜单就地展开 | 触发器 + 浮层菜单，弹出即浮于内容之上 |
| 层级 | 参与文档流（无浮层档位） | 浮层档位 `--caomei-z-dropdown`（1050） |
| 典型用途 | 侧栏 / 顶栏导航、设置分区 | 「更多操作」、右键菜单式命令 |

## 样式定制

样式基于 CSS variables，保持低特异性便于覆盖：

| 变量 | 默认 | 说明 |
|------|------|------|
| `--caomei-menu-gap` | `2px` | 项之间 / 面板与触发器的间距 |
| `--caomei-menu-indent` | `--caomei-space-4` | 子菜单面板的缩进 |
| `--caomei-menu-item-gap` | `--caomei-space-2` | 项内图标与文本间距 |
| `--caomei-menu-item-padding` | `--caomei-space-2 --caomei-space-3` | 项内边距 |
| `--caomei-menu-item-radius` | `--caomei-radius-md` | 项圆角 |
| `--caomei-menu-item-hover-bg` | `--caomei-color-bg-elevated` | 悬停背景 |
| `--caomei-menu-item-current-bg` | `--caomei-color-bg-elevated` | 当前项背景 |
| `--caomei-menu-item-current-color` | `--caomei-color-primary` | 当前项文字色 |

## 从 PrimeVue 迁移

| PrimeVue | 本组件 |
| --- | --- |
| `<Menu :model>` / `<Menubar :model>`（菜单项内建为浮层或横排命令） | `<CaomeiMenu>` + `<CaomeiMenuItem>` / `<CaomeiSubMenu>` 声明式组合（导航语义、就地展开） |
| `MenuItem` 的 `label` / `icon` / `url` / `target` | 项内容走默认插槽（图标用 `@lucide/vue` 组件）；链接用 `href`（原生属性） |
| `MenuItem` 的 `items`（嵌套） | `<CaomeiSubMenu>` 包裹子项 |
| `MenuItem` 的 `command` | 项若为按钮（不传 `href`）则监听原生 `click` |
| `PanelMenu` / `TieredMenu` | `<CaomeiSubMenu>` 多层嵌套（每层一个 `SubMenu`） |
| `<Breadcrumb :model>` | `<CaomeiBreadcrumb>` + `<CaomeiBreadcrumbItem>` |
| `appendTo` / `baseZIndex` / `popup` | **不适用**：导航菜单参与文档流、不产生浮层（浮层/动作菜单请用 `CaomeiDropdownMenu`） |

**已知差异（有意）**：① 本组件为**导航**语义（`nav` + 列表 + `aria-current`），不是 WAI-ARIA 的 `menu` / `menubar` 角色——PrimeVue 的 `Menubar` 使用 `menubar` 角色，迁移后若依赖该角色的自动化断言需同步调整；② 子菜单为就地展开（disclosure），非浮层弹出；③ 键盘导航由本组件统一接管（方向键 + Home / End + Esc），PrimeVue 的导航菜单无等价的方向键序列。

### 与 Element Plus `el-menu` 的差异

| Element Plus | 本组件 |
| --- | --- |
| `<el-menu>` + `<el-menu-item>` + `<el-sub-menu>` | `<CaomeiMenu>` + `<CaomeiMenuItem>` + `<CaomeiSubMenu>` |
| `default-active` + `index`（字符串索引激活态） | 逐项 `current`（映射 `aria-current`，无需全局索引） |
| `router` / `route`（内建路由跳转） | 用 `href` 或自行包裹 `RouterLink`（`as-child` 形态由使用方组合） |
| `collapse`（整栏收成图标） | **未提供**：收起态请由使用方切换 `SubMenu` 的 `v-model:open` / 渲染形态（本组件的「折叠」指子菜单展开态） |
| `mode="horizontal"` / `"vertical"` | `orientation`（`horizontal` / `vertical`） |
| `unique-opened`（同级只展开一个） | **未提供**：多个 `SubMenu` 可同时展开（需要时由使用方经 `v-model:open` 互斥） |
| `@select` / `@open` / `@close` 事件 | 项经原生 `click` 监听；展开态经 `v-model:open` 监听 |
| `ellipsis` / `popper-*` / `background-color` 等外观项 | 外观经 CSS variables 与类名覆盖；无省略折叠与浮层弹出子菜单 |

<ComponentApi name="menu" />
