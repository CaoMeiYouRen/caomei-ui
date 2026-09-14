<script setup lang="ts">
import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from '@lucide/vue'
import { computed } from 'vue'
import { useLocale } from '../../composables/use-locale'
import { CaomeiIcon } from '../../icons'
import type { MessageProps } from './types'

defineOptions({ name: 'CaomeiMessage' })

const props = withDefaults(defineProps<MessageProps>(), {
    tone: 'neutral',
    variant: 'soft',
    title: '',
    description: '',
    icon: true,
    closable: false,
    role: 'status',
})

const emit = defineEmits<{
    close: []
}>()

const locale = useLocale()
const closeLabel = computed(() => props.closeLabel ?? locale.value.message.close)

defineSlots<{
    default?: () => unknown
    icon?: () => unknown
    actions?: () => unknown
}>()

const toneIcon = computed(() => {
    switch (props.tone) {
        case 'success':
            return CircleCheck
        case 'warning':
            return TriangleAlert
        case 'danger':
            return CircleAlert
        default:
            return Info
    }
})

const rootClass = computed(() => [
    `caomei-message--${props.tone}`,
    `caomei-message--${props.variant}`,
])
</script>

<template>
    <div
        class="caomei-message"
        :class="rootClass"
    >
        <span
            v-if="icon || $slots.icon"
            class="caomei-message__icon"
            aria-hidden="true"
        >
            <slot name="icon">
                <CaomeiIcon :icon="toneIcon" />
            </slot>
        </span>
        <!--
          role 施加在内容层而非根节点：关闭按钮与 #actions 等交互内容位于
          live region 之外，避免其可访问名被并入整条消息的播报。
        -->
        <div class="caomei-message__body" :role="role">
            <p v-if="title" class="caomei-message__title">
                {{ title }}
            </p>
            <div class="caomei-message__content">
                <slot>{{ description }}</slot>
            </div>
        </div>
        <div v-if="$slots.actions" class="caomei-message__actions">
            <slot name="actions" />
        </div>
        <button
            v-if="closable"
            type="button"
            class="caomei-message__close"
            :aria-label="closeLabel"
            @click="emit('close')"
        >
            <CaomeiIcon :icon="X" />
        </button>
    </div>
</template>

<style scoped>
/*
  `--caomei-message-*` 只作为覆盖钩子（消费处带默认回退值），基类不预声明默认值。
*/
.caomei-message {
    box-sizing: border-box;
    display: flex;
    align-items: flex-start;
    gap: var(--caomei-space-2);
    width: 100%;
    padding: var(--caomei-space-3) var(--caomei-space-4);
    border: 1px solid transparent;
    border-radius: var(--caomei-message-radius, var(--caomei-radius-md));
    font-family: var(--caomei-font-sans);
    font-size: var(--caomei-font-size-md);
    line-height: 1.5;
}

.caomei-message--primary {
    --caomei-message-tone: var(--caomei-color-primary);
    --caomei-message-solid: var(--caomei-color-primary-solid);
}

.caomei-message--success {
    --caomei-message-tone: var(--caomei-color-success);
    --caomei-message-solid: var(--caomei-color-success-solid);
}

.caomei-message--warning {
    --caomei-message-tone: var(--caomei-color-warning);
    --caomei-message-solid: var(--caomei-color-warning-solid);
}

.caomei-message--danger {
    --caomei-message-tone: var(--caomei-color-danger);
    --caomei-message-solid: var(--caomei-color-danger-solid);
}

.caomei-message--neutral {
    --caomei-message-tone: var(--caomei-color-text-muted);
    --caomei-message-solid: var(--caomei-color-neutral-solid);
}

.caomei-message--soft {
    background: color-mix(in srgb, var(--caomei-message-tone) 12%, transparent);
    color: var(--caomei-message-tone);
}

.caomei-message--solid {
    background: var(--caomei-message-solid);
    color: var(--caomei-color-primary-foreground);
}

.caomei-message--outline {
    border-color: var(--caomei-message-tone);
    color: var(--caomei-message-tone);
}

.caomei-message__icon {
    display: inline-flex;
    flex-shrink: 0;
    margin-top: 2px;
}

.caomei-message__body {
    flex: 1;
    min-width: 0;
}

.caomei-message__title {
    margin: 0;
    font-weight: 600;
}

.caomei-message__title + .caomei-message__content {
    margin-top: 2px;
}

.caomei-message__actions {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    gap: var(--caomei-space-2);
}

.caomei-message__close {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    padding: 2px;
    border: 0;
    border-radius: var(--caomei-radius-sm);
    background: transparent;
    color: inherit;
    cursor: pointer;
    opacity: 0.7;
}

.caomei-message__close:hover {
    opacity: 1;
}

.caomei-message__close:focus-visible {
    outline: 2px solid currentcolor;
    outline-offset: 2px;
}
</style>
