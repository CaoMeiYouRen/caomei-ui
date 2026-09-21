<script setup lang="ts">
import { ChevronDown } from '@lucide/vue'
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
    CaomeiDropdownMenuTrigger,
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
        :group-label="groupLabel"
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
              下拉触发器经本库 CaomeiDropdownMenuTrigger（as-child + unstyled）：由本库触发器统一承载
              开合、禁用与无障碍接线（内部委托 Reka primitive）；`unstyled` 保证内建触发器外观类不合并到拼接按钮上（否则会与 ButtonGroup
              的内侧边框 / 圆角规则竞争）。
            -->
            <CaomeiDropdownMenuTrigger
                as-child
                unstyled
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
            </CaomeiDropdownMenuTrigger>
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
