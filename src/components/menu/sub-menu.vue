<script setup lang="ts">
import { ChevronRight } from '@lucide/vue'
import { CollapsibleContent, CollapsibleRoot, CollapsibleTrigger } from 'reka-ui'
import { computed, ref } from 'vue'
import { CaomeiIcon } from '../../icons'
import type { SubMenuProps } from './types'

defineOptions({ name: 'CaomeiSubMenu' })

const props = withDefaults(defineProps<SubMenuProps>(), {
    label: '',
    disabled: false,
    defaultOpen: false,
    /* 显式 `default: undefined`：布尔型 prop 若无 `default` 键，Vue 的布尔转换会把「未传」解析成 `false`。 */
    open: undefined,
})

const emit = defineEmits<{ 'update:open': [value: boolean] }>()

/*
  开合状态**在包装层显式合成**：`open`（`v-model:open`）未接管时以 `defaultOpen` 为初值
  （父级受控 ⇒ 以父级为准；未受控 ⇒ 初值 `defaultOpen`、交互后就地自持）。
  不把开合直接交给 Reka 的非受控默认处理：其兜底依赖 `props.open === undefined` 这一非受控分支，
  行为受上游 `useVModel` 的默认值处理影响、不自明；而模型若带具名默认值又会把 `defaultOpen`
  静默压掉（与 `CaomeiTooltip` 的默认值陷阱同源）。
*/
/** 非受控时的自持状态（受控时以 `open` prop 为准）。 */
const internalOpen = ref(props.defaultOpen)
const isOpen = computed(() => props.open ?? internalOpen.value)

defineSlots<{
    default?: () => unknown
    label?: () => unknown
}>()

const triggerClass = computed(() => [
    'caomei-menu__item',
    'caomei-menu__submenu-trigger',
    { 'caomei-menu__submenu-trigger--open': isOpen.value },
])

function setOpen(value: boolean): void {
    internalOpen.value = value
    emit('update:open', value)
}
</script>

<template>
    <!--
      `CollapsibleRoot` 以 `as="li"` 渲染，使列表结构保持 `ul > li`（面板为 `li > div > ul`），
      避免在 `ul` 下插入非 `li` 元素破坏列表语义。
    -->
    <CollapsibleRoot
        :open="isOpen"
        as="li"
        class="caomei-menu__submenu"
        :disabled="disabled"
        data-caomei-submenu
        @update:open="setOpen"
    >
        <CollapsibleTrigger
            as="button"
            type="button"
            :class="triggerClass"
            :disabled="disabled"
            data-caomei-menu-target
            data-caomei-submenu-trigger
        >
            <slot name="label">
                {{ label }}
            </slot>
            <CaomeiIcon
                class="caomei-menu__submenu-indicator"
                :icon="ChevronRight"
                aria-hidden="true"
            />
        </CollapsibleTrigger>
        <CollapsibleContent class="caomei-menu__submenu-content">
            <ul
                class="caomei-menu__list caomei-menu__submenu-panel"
                role="list"
                data-caomei-submenu-panel
            >
                <slot />
            </ul>
        </CollapsibleContent>
    </CollapsibleRoot>
</template>

<style scoped>
/*
  子菜单 = disclosure（`Collapsible`）：触发器带 `aria-expanded` / `aria-controls`，
  收起的面板由 Presence 卸载（折叠项天然不进入键盘序列与可访问树）。
*/
.caomei-menu__submenu {
    min-width: 0;
}

.caomei-menu__submenu-trigger {
    justify-content: space-between;
}

.caomei-menu__submenu-indicator {
    flex-shrink: 0;
    color: var(--caomei-color-text-muted);
    transition: transform 0.15s ease;
}

.caomei-menu__submenu-trigger--open .caomei-menu__submenu-indicator {
    transform: rotate(90deg);
}

.caomei-menu__submenu-panel {
    margin-top: var(--caomei-menu-gap, 2px);
    padding-inline-start: var(--caomei-menu-indent, var(--caomei-space-4));
}

@media (prefers-reduced-motion: reduce) {
    .caomei-menu__submenu-indicator {
        transition: none;
    }
}
</style>
