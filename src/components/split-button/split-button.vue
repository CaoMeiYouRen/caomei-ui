<script setup lang="ts">
import { ChevronDown } from '@lucide/vue'
import { DropdownMenuTrigger } from 'reka-ui'
import { computed } from 'vue'
import { useLocale } from '../../composables/use-locale'
import { CaomeiIcon } from '../../icons'
import { CaomeiButton } from '../button'
// 两按钮的拼接（去内侧边框宽度 + 相邻圆角）复用 ButtonGroup，避免重复实现同一套规则
import { CaomeiButtonGroup } from '../button-group'
import {
    CaomeiDropdownMenu,
    CaomeiDropdownMenuContent,
    CaomeiDropdownMenuItem,
    CaomeiDropdownMenuSeparator,
} from '../dropdown-menu'
import type { SplitButtonMenuItem, SplitButtonProps } from './types'

defineOptions({ name: 'CaomeiSplitButton', inheritAttrs: false })

const props = withDefaults(defineProps<SplitButtonProps>(), {
    variant: 'primary',
    size: 'md',
    rounded: false,
    disabled: false,
    loading: false,
    menuSide: 'bottom',
    menuAlign: 'end',
})

const emit = defineEmits<{
    click: [event: MouseEvent]
}>()

defineSlots<{
    default?: () => unknown
    icon?: () => unknown
}>()

const locale = useLocale()
const menuLabel = computed(() => props.menuLabel || locale.value.splitButton.menu)
const items = computed(() => props.model ?? [])

function onSelect(item: SplitButtonMenuItem, event: Event): void {
    item.command?.({ item, originalEvent: event })
}
</script>

<template>
    <CaomeiButtonGroup
        v-bind="$attrs"
        class="caomei-split-button"
    >
        <CaomeiButton
            class="caomei-split-button__main"
            :variant="variant"
            :tone="tone"
            :size="size"
            :rounded="rounded"
            :disabled="disabled"
            :loading="loading"
            :label="label"
            @click="emit('click', $event)"
        >
            <template v-if="$slots.default">
                <slot />
            </template>
            <template
                v-if="$slots.icon"
                #icon
            >
                <slot name="icon" />
            </template>
        </CaomeiButton>

        <CaomeiDropdownMenu>
            <!--
              下拉触发器直接用 Reka DropdownMenuTrigger + as-child，而非 CaomeiDropdownMenuTrigger：
              后者把 caomei-dropdown-menu__trigger 样式类固定在根上，as-child 会把其 padding / border /
              background 一并合并到 CaomeiButton 上造成样式冲突（同类先例：date-picker.vue 用
              PopoverTrigger as-child）。样式豁免方案见 Backlog。
            -->
            <DropdownMenuTrigger
                as-child
                :disabled="disabled"
            >
                <CaomeiButton
                    class="caomei-split-button__menu"
                    :variant="variant"
                    :tone="tone"
                    :size="size"
                    :rounded="rounded"
                    :label="menuLabel"
                >
                    <template #icon>
                        <CaomeiIcon :icon="ChevronDown" />
                    </template>
                </CaomeiButton>
            </DropdownMenuTrigger>
            <CaomeiDropdownMenuContent
                :side="menuSide"
                :align="menuAlign"
            >
                <template
                    v-for="(item, index) in items"
                    :key="item.separator ? `separator-${index}` : (item.label ?? `item-${index}`)"
                >
                    <CaomeiDropdownMenuSeparator v-if="item.separator" />
                    <CaomeiDropdownMenuItem
                        v-else
                        :disabled="item.disabled"
                        @select="onSelect(item, $event)"
                    >
                        <span class="caomei-split-button__item">
                            <CaomeiIcon
                                v-if="item.icon"
                                :icon="item.icon"
                            />
                            <span v-if="item.label">{{ item.label }}</span>
                        </span>
                    </CaomeiDropdownMenuItem>
                </template>
            </CaomeiDropdownMenuContent>
        </CaomeiDropdownMenu>
    </CaomeiButtonGroup>
</template>

<style scoped>
.caomei-split-button__item {
    display: inline-flex;
    align-items: center;
    gap: var(--caomei-space-2);
}

/* 菜单展开时的状态反馈：用 background-image 叠加，不覆盖各 variant 的 background-color */
.caomei-split-button__menu[data-state='open'] {
    background-image: linear-gradient(
        color-mix(in srgb, currentcolor 8%, transparent),
        color-mix(in srgb, currentcolor 8%, transparent)
    );
}
</style>
