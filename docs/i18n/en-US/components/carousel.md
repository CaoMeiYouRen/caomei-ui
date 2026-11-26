# Carousel

Carousel lays a group of peer items out as a paged carousel, wrapping [embla-carousel-vue](https://www.embla-carousel.com/). It supports horizontal / vertical axes, looping, multiple items per view, gaps, a controlled page index, built-in previous / next buttons and dot indicators, plus keyboard and drag navigation.

`CaomeiCarousel` is the container and `CaomeiCarouselSlide` is one page. Page numbers follow mount order (source order on first render) and feed the "slide n of m" accessible name; inserting or reordering pages in the middle requires remounting the whole slide group, otherwise the numbers drift.

## Basic usage

By default one item is shown per page and looping is off; `gap` sets the spacing (a number is px). The container fills the available width and its height follows the content.

<demo
    vue="../examples/carousel/basic.vue"
    ssg="true"
/>

## Multiple items and looping

`slidesPerView` sets how many items a page shows and `loop` lets the last page continue into the first. With multiple items per view, the `v-model:index` "page" is not the same as a "slide": one page holds several slides, and the dots describe pages.

<demo
    vue="../examples/carousel/multiple.vue"
    ssg="true"
/>

## Controlled page index

`v-model:index` is the **page (scroll snap)** index: it positions the carousel from the initial value on mount and writes back after paging (buttons / dots / keyboard / drag). An out-of-range external value is clamped to the first / last page, or wrapped when looping, and the clamped value is written back to the model.

A container that is not visible on mount (`v-show`, a collapsed panel, a hidden tab) cannot be measured; the component then keeps the external value instead of overwriting it, and re-applies it once the container becomes visible and is measured again.

## Keyboard and accessibility

- The root is focusable (`tabindex="0"`). With `label` it is `role="region"` named by it; without `label` it falls back to `role="group"` so no unnamed landmark is exposed.
- The container declares `aria-roledescription="carousel"`; each page is `role="group"` + `aria-roledescription="slide"` with a "slide n of m" accessible name (overridable via `label`).
- With focus on the carousel: arrow keys page horizontally or vertically, and `Home` / `End` jump to the first / last page. Arrow keys are not captured while focus sits in an input, select or editable area.
- Previous / next are icon buttons and the dots are page buttons (`aria-label="n / m"`); the current page carries `aria-current="true"` and the buttons at the edges are disabled unless looping.

## Client boundary and on-demand imports

embla initialises only after mount (`onMounted`) and never touches the DOM during server rendering, so Nuxt / SSR can use the component directly; the first render is the slot content and page positions take effect once measured on the client.

The component is exported from the package root (`import { CaomeiCarousel } from 'caomei-ui'`) and Nuxt apps get it through auto-imports; `embla-carousel-vue` is a runtime dependency kept external in the build, so consumers that never use the carousel do not ship it in their first bundle.

## Props

| Component | Main props |
|------|------|
| `CaomeiCarousel` | `orientation` (`horizontal` / `vertical`), `loop`, `slidesPerView` (number or `auto`), `gap`, `controls`, `controlSize`, `label`, `v-model:index` |
| `CaomeiCarouselSlide` | `label` (overrides the generated accessible name) |

> A vertical carousel needs an explicit height on the root (for example `style="height: 320px"`); otherwise the main axis measures 0 and page positions cannot be measured.

## Style customization

| Variable | Default | Description |
|------|------|------|
| `--caomei-carousel-gap` | `0px` | Page gap, written from `gap` |
| `--caomei-carousel-slides-per-view` | `1` | Items per page, written from `slidesPerView` (not written for `auto`) |

<ComponentApi name="carousel" />
