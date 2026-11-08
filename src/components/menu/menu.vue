<script setup lang="ts">
import { ref } from 'vue'
import type { MenuProps } from './types'

defineOptions({ name: 'CaomeiMenu' })

const props = withDefaults(defineProps<MenuProps>(), {
    orientation: 'vertical',
    label: '',
    as: 'nav',
})

const listRef = ref<HTMLElement | null>(null)

/**
 * 键盘序列：菜单内所有「可聚焦目标」（项与子菜单触发器）。
 *
 * 收起状态的子菜单面板由 Reka 的 Presence **卸载**（不在 DOM 中），故无需额外可见性过滤——
 * 折叠项天然不进入序列。
 */
function focusableTargets(): HTMLElement[] {
    const root = listRef.value
    if (!root) {
        return []
    }
    return Array.from(root.querySelectorAll<HTMLElement>('[data-caomei-menu-target]'))
        // `aria-disabled`（项）与原生 `disabled`（子菜单触发器）两种禁用形态都要排除，
        // 否则 `.focus()` 在原生禁用元素上是 no-op，键盘序列会在该处静默堵死。
        .filter((element) => element.getAttribute('aria-disabled') !== 'true' && !element.hasAttribute('disabled'))
}

function focusAt(targets: HTMLElement[], index: number): void {
    const clamped = Math.min(Math.max(index, 0), targets.length - 1)
    targets[clamped]?.focus()
}

/** 移动焦点；焦点不在菜单内时落到首项（键盘进入路径）。 */
function moveFocus(event: KeyboardEvent, step: number): void {
    const targets = focusableTargets()
    if (targets.length === 0) {
        return
    }
    const index = targets.indexOf(document.activeElement as HTMLElement)
    focusAt(targets, index === -1 ? 0 : index + step)
    event.preventDefault()
}

/** 展开后把焦点移入面板首项：面板由 Presence 挂载，可能晚一帧就位，故按帧重试。 */
function focusFirstItemOfSubmenu(trigger: HTMLElement): void {
    const submenu = trigger.closest('[data-caomei-submenu]')
    if (!submenu) {
        return
    }
    const attempt = (remaining: number): void => {
        const first = submenu.querySelector<HTMLElement>('[data-caomei-submenu-panel] [data-caomei-menu-target]')
        if (first) {
            first.focus()
            return
        }
        if (remaining > 0) {
            requestAnimationFrame(() => {
                attempt(remaining - 1)
            })
        }
    }
    attempt(5)
}

/** 纵向：在子菜单触发器上按右键展开并把焦点移入面板首项。 */
function expandFocusedSubmenu(event: KeyboardEvent): void {
    const active = document.activeElement as HTMLElement | null
    if (!active?.matches('[data-caomei-submenu-trigger]') || active.getAttribute('aria-expanded') === 'true') {
        return
    }
    event.preventDefault()
    active.click()
    focusFirstItemOfSubmenu(active)
}

/** 纵向：焦点位于面板内时收起该面板并把焦点交回触发器（Esc 同此）。 */
function collapseFocusedSubmenu(event: KeyboardEvent): void {
    const active = document.activeElement as HTMLElement | null
    const panel = active?.closest('[data-caomei-submenu-panel]')
    const trigger = panel?.closest('[data-caomei-submenu]')?.querySelector<HTMLElement>('[data-caomei-submenu-trigger]')
    if (!panel || !trigger) {
        return
    }
    event.preventDefault()
    trigger.click()
    trigger.focus()
}

function handleKeydown(event: KeyboardEvent): void {
    const horizontal = props.orientation === 'horizontal'

    switch (event.key) {
        case 'ArrowDown':
            if (!horizontal) {
                moveFocus(event, 1)
            }
            return
        case 'ArrowUp':
            if (!horizontal) {
                moveFocus(event, -1)
            }
            return
        case 'ArrowRight':
            if (horizontal) {
                moveFocus(event, 1)
            } else {
                expandFocusedSubmenu(event)
            }
            return
        case 'ArrowLeft':
            if (horizontal) {
                moveFocus(event, -1)
            } else {
                collapseFocusedSubmenu(event)
            }
            return
        case 'Home': {
            const targets = focusableTargets()
            if (targets.length === 0) {
                return
            }
            focusAt(targets, 0)
            event.preventDefault()
            return
        }
        case 'End': {
            const targets = focusableTargets()
            if (targets.length === 0) {
                return
            }
            focusAt(targets, targets.length - 1)
            event.preventDefault()
            return
        }
        case 'Escape':
            collapseFocusedSubmenu(event)
            return
        default:
    }
}
</script>

<template>
    <component
        :is="as"
        :aria-label="label || undefined"
        class="caomei-menu"
        :class="`caomei-menu--${orientation}`"
    >
        <ul
            ref="listRef"
            class="caomei-menu__list"
            role="list"
            @keydown="handleKeydown"
        >
            <slot />
        </ul>
    </component>
</template>

<style scoped>
/*
  导航菜单（disclosure 导航模式）：容器为 `nav` + 列表，项为链接 / 按钮；
  `--caomei-menu-*` 只作为带回退值的覆盖钩子，基类不预声明默认值。
*/
.caomei-menu {
    box-sizing: border-box;
    color: var(--caomei-color-text);
    font-family: var(--caomei-font-sans);
    font-size: var(--caomei-font-size-md);
}

.caomei-menu__list {
    display: flex;
    margin: 0;
    padding: 0;
    list-style: none;
    gap: var(--caomei-menu-gap, 2px);
}

.caomei-menu--vertical .caomei-menu__list {
    flex-direction: column;
}

.caomei-menu--horizontal .caomei-menu__list {
    flex-flow: row wrap;
}
</style>

<style>
/*
  菜单项外观统一在此声明（非 scoped）：`CaomeiMenuItem` 与 `CaomeiSubMenu` 的触发器共用
  `.caomei-menu__item` 类，跨组件 scoped 选择器无法互相命中，放在根组件可保证两者一致
  （子菜单触发器此前只有布局类、缺少内边距与 flex，表现为比普通项矮一截）。
  选择器前缀 `.caomei-menu` 用于恢复特异性（0,2,0）：宿主文档的 `.vp-doc a` / `.prose a`
  （0,1,1）会压过单类选择器，导致菜单链接被加上下划线 / 品牌色。类名带 BEM 前缀且以
  `CaomeiMenu` 为唯一使用场景，不做全局扩散。
*/
.caomei-menu .caomei-menu__item {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: var(--caomei-menu-item-gap, var(--caomei-space-2));
    width: 100%;
    padding: var(--caomei-menu-item-padding, var(--caomei-space-2) var(--caomei-space-3));
    border: 0;
    border-radius: var(--caomei-menu-item-radius, var(--caomei-radius-md));
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: start;
    text-decoration: none;
    cursor: pointer;
    transition: background-color var(--caomei-motion-duration-base) var(--caomei-motion-ease-standard), color var(--caomei-motion-duration-base) var(--caomei-motion-ease-standard);
}

.caomei-menu .caomei-menu__item:hover:not([aria-disabled='true'], [aria-current]) {
    background: var(--caomei-menu-item-hover-bg, var(--caomei-color-bg-elevated));

    /* 显式声明颜色：宿主 `.vp-doc a:hover`（0,2,1）会压过基础规则的 `color: inherit` */
    color: var(--caomei-menu-item-hover-color, inherit);
}

.caomei-menu .caomei-menu__item:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: -2px;
}

.caomei-menu .caomei-menu__item[aria-current] {
    background: var(--caomei-menu-item-current-bg, var(--caomei-color-bg-elevated));
    color: var(--caomei-menu-item-current-color, var(--caomei-color-primary-text));
    font-weight: 600;
}

.caomei-menu .caomei-menu__item[aria-disabled='true'] {
    cursor: not-allowed;
    opacity: var(--caomei-disabled-opacity);
}

/* 禁用链接同样要挡住宿主 `a:hover` 的颜色（不得改变文字色） */
.caomei-menu .caomei-menu__item[aria-disabled='true']:not([aria-current]) {
    color: inherit;
}

@media (prefers-reduced-motion: reduce) {
    .caomei-menu .caomei-menu__item {
        transition: none;
    }
}
</style>
