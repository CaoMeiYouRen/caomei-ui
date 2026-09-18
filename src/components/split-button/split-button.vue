<script setup lang="ts">
import { ChevronDown } from '@lucide/vue'
import { DropdownMenuTrigger } from 'reka-ui'
import { computed, useAttrs } from 'vue'
import { useLocale } from '../../composables/use-locale'
import { CaomeiIcon } from '../../icons'
import { resolveLabelName } from '../_shared/use-label-attrs'
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
const attrs = useAttrs()
const menuLabel = computed(() => props.menuLabel || locale.value.splitButton.menu)
/** 主按钮可访问名优先级：显式 `label` > 透传 `aria-label`（无语言兜底文案） */
const mainLabel = computed(() => resolveLabelName(props.label, attrs['aria-label'], undefined))
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
            :label="mainLabel"
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
              下拉触发器沿用 Reka DropdownMenuTrigger + as-child：CaomeiDropdownMenuTrigger 已支持
              `unstyled` 外观豁免，但收敛共用其 a11y 接线仍需复验 ButtonGroup 的拼接边框 / 圆角规则；
              遗留收敛登记于 `docs/plan/backlog.md` 的「触发器 `unstyled` 遗留收敛」（同类先例：
              date-picker.vue / color-picker.vue 的 PopoverTrigger）。
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
                    :key="item.separator ? `separator-${index}` : `${item.label ?? 'item'}-${index}`"
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
