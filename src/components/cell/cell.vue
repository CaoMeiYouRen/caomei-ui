<script setup lang="ts">
import { computed } from 'vue'
import { CaomeiIcon, useInternalIcons } from '../../icons'
import type { CellProps } from './types'

defineOptions({ name: 'CaomeiCell' })

const props = withDefaults(defineProps<CellProps>(), {
    title: '',
    description: '',
    as: 'div',
    href: '',
    target: '',
    type: 'button',
    arrow: false,
})

defineSlots<{
    /** 行首区域（图标 / 头像等） */
    prefix?: () => unknown
    title?: () => unknown
    description?: () => unknown
    /** 右侧值区域 */
    value?: () => unknown
    /** 右侧值之后的附加区域（开关、徽标等） */
    suffix?: () => unknown
}>()

const icons = useInternalIcons()

const rootAttrs = computed<Record<string, string | undefined>>(() => {
    if (props.as === 'a') {
        return { href: props.href || undefined, target: props.target || undefined }
    }
    if (props.as === 'button') {
        return { type: props.type }
    }
    return {}
})
</script>

<template>
    <component
        :is="as"
        v-bind="rootAttrs"
        class="caomei-cell"
        :class="[
            `caomei-cell--${as}`,
            {'caomei-cell--arrow': arrow}
        ]"
    >
        <span v-if="$slots.prefix" class="caomei-cell__prefix">
            <slot name="prefix" />
        </span>
        <span class="caomei-cell__body">
            <span
                v-if="$slots.title || title"
                class="caomei-cell__title"
            >
                <slot name="title">
                    {{ title }}
                </slot>
            </span>
            <span
                v-if="$slots.description || description"
                class="caomei-cell__description"
            >
                <slot name="description">
                    {{ description }}
                </slot>
            </span>
        </span>
        <span
            v-if="$slots.value || (value !== undefined && value !== null && value !== '')"
            class="caomei-cell__value"
        >
            <slot name="value">
                {{ value }}
            </slot>
        </span>
        <span v-if="$slots.suffix" class="caomei-cell__suffix">
            <slot name="suffix" />
        </span>
        <CaomeiIcon
            v-if="arrow"
            class="caomei-cell__arrow"
            :icon="icons.chevronRight"
            aria-hidden="true"
        />
    </component>
</template>

<style scoped>
/*
  `--caomei-cell-*` 只作为覆盖钩子（消费处带默认回退值），基类不预声明默认值。
  行高下限复用 `--caomei-control-height-lg`（桌面 44 / 触摸密度 52），整行即命中区。
*/
.caomei-cell {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: var(--caomei-cell-gap, var(--caomei-space-3));
    width: 100%;
    min-width: 0;
    min-height: var(--caomei-cell-min-height, var(--caomei-control-height-lg));
    padding: var(--caomei-cell-padding-y, var(--caomei-space-2)) var(--caomei-cell-padding-x, var(--caomei-space-3));
    border: 0;
    background: transparent;
    color: var(--caomei-color-text);
    font-family: var(--caomei-font-sans);
    font-size: var(--caomei-font-size-md);
    line-height: 1.4;
    text-align: start;
    text-decoration: none;
}

.caomei-cell--button,
.caomei-cell--a {
    cursor: pointer;
}

.caomei-cell--button {
    /* 原生 button 默认居中并带系统外观，这里回归行外观 */
    appearance: none;
    justify-content: flex-start;
}

.caomei-cell--button:focus-visible,
.caomei-cell--a:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: -2px;
}

.caomei-cell--button:disabled {
    cursor: not-allowed;
    opacity: var(--caomei-disabled-opacity);
}

.caomei-cell__prefix,
.caomei-cell__suffix {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    color: var(--caomei-color-text-muted);
}

.caomei-cell__body {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: var(--caomei-space-1);
    min-width: 0;
}

.caomei-cell__title {
    overflow: hidden;
    font-size: var(--caomei-font-size-md);
    text-overflow: ellipsis;
    white-space: nowrap;
}

.caomei-cell__description {
    overflow: hidden;
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-sm);
    text-overflow: ellipsis;
    white-space: nowrap;
}

.caomei-cell__value {
    flex-shrink: 0;
    max-width: 50%;
    overflow: hidden;
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-sm);
    text-overflow: ellipsis;
    white-space: nowrap;
}

.caomei-cell__arrow {
    flex-shrink: 0;
    color: var(--caomei-color-text-muted);
}

/*
  窄屏只收敛形态：标题 / 描述 / 值按需截断，行本身不换行、不撑出容器。
  依据见响应式设计 §3 的长文本容器行。
*/
@media (width <= 640px) {
    .caomei-cell {
        gap: var(--caomei-cell-gap, var(--caomei-space-2));
    }

    .caomei-cell__value {
        max-width: 40%;
    }
}
</style>
