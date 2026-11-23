# NavBar 导航栏

路由级页头：左侧返回、中间标题、右侧操作，可选吸顶与安全区。组件**不接 vue-router**——返回按钮只抛出 `back`，历史栈判断与跳转由使用方接管。

> **例外项声明**：NavBar 未满足 `caomei-todo` §11.5 三条组件准入标准的**第 1 条**，**第 2 条存疑**（三条未全部满足）；按用户 2026-11-22 的方向例外立项，不作为「满足三条标准」的先例。

## 基础用法

<demo
    vue="../examples/nav-bar/basic.vue"
    ssg="true"
/>

```vue
<CaomeiNavBar title="项目设置" @back="router.back()">
    <template #end>
        <CaomeiButton size="sm" variant="ghost">保存</CaomeiButton>
    </template>
</CaomeiNavBar>
```

## 属性

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `title` | `string` | — | 标题文本；默认插槽优先 |
| `back` | `boolean` | `true` | 是否渲染返回按钮 |
| `backLabel` | `string` | 当前语言「返回」 | 返回按钮的可访问名 |
| `backDisabled` | `boolean` | `false` | 返回按钮禁用（无历史时使用） |
| `sticky` | `boolean` | `false` | 吸顶（`position: sticky` + `--caomei-z-sticky`） |
| `safeArea` | `boolean` | `true` | 叠加 `--caomei-safe-area-top`；该值是**视口级**的，非吸顶页头不需要留白时传 `false` |
| `label` | `string` | 当前语言「导航栏」 | 导航区的可访问名 |

## 事件

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `back` | — | 返回按钮点击；组件不做跳转，也不读历史栈 |

## 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 标题内容（优先于 `title`），需要标题层级时自行放 `<h1>` |
| `start` | 左侧区域，替换默认返回按钮 |
| `end` | 右侧操作区 |

## 吸顶与安全区

- 吸顶页头用 `sticky`：层级取 `--caomei-z-sticky`，不要另写数字 `z-index`；容器不要设置 `overflow: hidden`，否则会截断内部浮层。
- `safe-area` 默认开启并叠加 `--caomei-safe-area-top`；`env(safe-area-inset-top)` 属于视口级，非吸顶页头在 `viewport-fit=cover` 下同样会加高，不需要时显式传 `:safe-area="false"`。
- 页面内容与吸顶页头之间无需额外占位：`sticky` 参与文档流，首屏即占据高度。

## 无障碍

- 根元素是 `nav` landmark，可访问名优先级为「显式 `label` > 透传 `aria-label` > 当前语言「导航栏」」；`Tabbar` 的默认名是当前语言的「主导航」，两者默认不同名，但若把 `label` 设为同一个值（或透传同名 `aria-label`），同页会出现两个同名 `nav` landmark，需显式区分。
- 返回按钮是原生 `button`，`aria-label` 取 `backLabel` 或当前语言的「返回」；视觉盒默认 44px（`data-density="touch"` 下 52px），命中区经 `.caomei-hit-target` 保证 ≥24×24。
- 标题单行省略（`text-overflow: ellipsis`），完整文本仍在 DOM 中；需要读屏读到完整标题时不要截断业务关键信息。

## 与 Toolbar 的边界

**单点声明**：`NavBar` 是**页面级**页头（`nav` landmark，承载返回与页面标题，一页一个）；`Toolbar` 是**组件级**操作条（`role="toolbar"`，承载一组操作控件与方向键序列，可在一页内出现多次）。页面级导航用 `NavBar`，内容区操作条用 `Toolbar`；两者不要互相替代。

<ComponentApi name="nav-bar" />
