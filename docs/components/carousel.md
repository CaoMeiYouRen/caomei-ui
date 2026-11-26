# Carousel 轮播

Carousel 把一组平级内容排成可翻页的轮播，基于 [embla-carousel-vue](https://www.embla-carousel.com/) 封装，支持水平 / 垂直、循环、每页多图、间距、受控页索引、内置上一页 / 下一页与指示点，以及键盘与拖拽翻页。

`CaomeiCarousel` 是容器，`CaomeiCarouselSlide` 是每一页。页序号按挂载顺序生成（首屏等价书写顺序），用于「第 n 张 / 共 m 张」的可访问名；在中间插入或重排页时，需要让整组子页重新挂载，否则序号会错位。

## 基础用法

默认每页一张、不循环；`gap` 控制页间距（数字按 px）。容器宽度自适应，高度由内容决定。

<demo
    vue="../examples/carousel/basic.vue"
    ssg="true"
/>

## 多图与循环

`slidesPerView` 设置每页显示的张数，`loop` 让末页可继续翻到首页。多图时 `v-model:index` 的「页」与「张」不是一回事：一页包含多张，指示点表达的是页。

<demo
    vue="../examples/carousel/multiple.vue"
    ssg="true"
/>

## 受控页索引

`v-model:index` 是**页（scroll snap）**索引：挂载时按外部初值定位，翻页（按钮 / 指示点 / 键盘 / 拖拽）后回写；外部写入越界值时，非循环模式钳位到首末页、循环模式取模，并把钳位结果回写模型。

容器在挂载时不可见（如 `v-show`、折叠面板、隐藏页签）会测不到尺寸，此时组件保留外部值、不覆盖模型，待容器重新显示触发重新测量后按原值定位。

## 键盘与无障碍

- 根节点可聚焦（`tabindex="0"`）；提供 `label` 时为 `role="region"` 并以之作为区域名，未提供时降级为 `role="group"`，避免无名地标。
- 容器声明 `aria-roledescription="carousel"`，每页 `role="group"` + `aria-roledescription="slide"`，可访问名为「第 n 张 / 共 m 张」（可用 `label` 覆盖）。
- 聚焦轮播后：水平方向用左右方向键、垂直方向用上下方向键翻页，`Home` / `End` 直达首末页；焦点位于页内输入框、下拉框或可编辑区域时不接管方向键。
- 上一页 / 下一页为图标按钮，指示点为页码按钮（`aria-label="n / m"`），当前页带 `aria-current="true"`；到达边界时对应按钮禁用（循环模式除外）。

## 客户端边界与按需引入

embla 只在组件挂载（`onMounted`）后初始化，服务端渲染不触碰 DOM，Nuxt / SSR 可直接使用；首屏由插槽内容构成，页位置在客户端测量后才生效。

组件随包根导出（`import { CaomeiCarousel } from 'caomei-ui'`），Nuxt 应用可经自动导入使用；`embla-carousel-vue` 为运行时依赖并在构建中 external 化，未使用轮播的消费方不会把它带进首屏包。

## 属性

| 组件 | 主要 props |
|------|------|
| `CaomeiCarousel` | `orientation`（`horizontal` / `vertical`）、`loop`、`slidesPerView`（数字或 `auto`）、`gap`、`controls`、`controlSize`、`label`、`v-model:index` |
| `CaomeiCarouselSlide` | `label`（覆盖自动生成的可访问名） |

> 垂直轮播需要给根元素确定高度（例如 `style="height: 320px"`），否则主轴尺寸为 0、无法测量页位置。

## 样式定制

| 变量 | 默认 | 说明 |
|------|------|------|
| `--caomei-carousel-gap` | `0px` | 页间距，由 `gap` 写入 |
| `--caomei-carousel-slides-per-view` | `1` | 每页张数，由 `slidesPerView` 写入（`auto` 时不写入） |

<ComponentApi name="carousel" />
