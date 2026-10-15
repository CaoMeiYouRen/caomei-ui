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
