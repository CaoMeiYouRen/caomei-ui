<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch, type StyleValue } from 'vue'
import { useAttrForwarding } from '../_shared/use-attr-forwarding'
import { useFocusControl } from '../_shared/use-focus-control'
import type { TextareaProps } from './types'

defineOptions({ name: 'CaomeiTextarea', inheritAttrs: false })

const props = withDefaults(defineProps<TextareaProps>(), {
    size: 'md',
    disabled: false,
    readonly: false,
    invalid: false,
    placeholder: '',
    resize: 'vertical',
    autoResize: false,
})

const emit = defineEmits<{
    focus: [event: FocusEvent]
    blur: [event: FocusEvent]
    change: [event: Event]
}>()

const model = defineModel<string>({ default: '' })

const textareaRef = ref<HTMLTextAreaElement | null>(null)

const { rootAttrs, controlAttrs } = useAttrForwarding()

const rootClass = computed(() => [
    `caomei-textarea--${props.size}`,
    {
        'caomei-textarea--invalid': props.invalid,
        'caomei-textarea--disabled': props.disabled,
        'caomei-textarea--readonly': props.readonly,
        'caomei-textarea--auto-resize': props.autoResize,
    },
])

const controlStyle = computed<StyleValue>(() => ({
    // 自动增高时高度由内容决定，手动调整会被下一次测量覆盖，故固定禁用
    resize: props.autoResize ? 'none' : props.resize,
}))

// 自动增高：先归零高度再读 scrollHeight，避免上一次的行高把内容高度顶住
// （scrollHeight 不会小于元素自身高度，否则无法收缩）。
let resizeObserver: ResizeObserver | null = null
let observedWidth = 0

function measureHeight(): void {
    const el = textareaRef.value
    if (!el?.isConnected) {
        return
    }

    el.style.height = 'auto'
    const next = el.scrollHeight
    if (next <= 0) {
        // 不可见或尚无布局时不写死高度，保留原生 rows 行为
        el.style.height = ''
        return
    }

    el.style.height = `${next}px`
}

function resetHeight(): void {
    const el = textareaRef.value
    if (el) {
        el.style.height = ''
    }
}

// 容器宽度变化会改变折行结果，需重新测量；高度变化由自身写入触发，按宽度去重避免观察器自激
function handleObservedResize(): void {
    const el = textareaRef.value
    if (!el) {
        return
    }

    const width = el.clientWidth
    if (width === observedWidth) {
        return
    }

    observedWidth = width
    measureHeight()
}

function startObserving(): void {
    const el = textareaRef.value
    if (!el || resizeObserver || typeof ResizeObserver === 'undefined') {
        return
    }

    observedWidth = el.clientWidth
    resizeObserver = new ResizeObserver(handleObservedResize)
    resizeObserver.observe(el)
}

function stopObserving(): void {
    resizeObserver?.disconnect()
    resizeObserver = null
}

watch(
    () => props.autoResize,
    (enabled) => {
        if (enabled) {
            startObserving()
            measureHeight()

            return
        }

        stopObserving()
        resetHeight()
    },
)

watch(
    model,
    () => {
        if (props.autoResize) {
            measureHeight()
        }
    },
    { flush: 'post' },
)

// 尺寸档位与会改变字号 / 内边距 / 初始行数，进而改变测量结果
watch(
    () => [props.size, props.rows],
    () => {
        if (props.autoResize) {
            measureHeight()
        }
    },
    { flush: 'post' },
)

onMounted(() => {
    if (props.autoResize) {
        startObserving()
        measureHeight()
    }
})

onBeforeUnmount(() => {
    stopObserving()
})

const { focus, blur } = useFocusControl(textareaRef)

defineExpose({ focus, blur, textareaRef })
</script>

<template>
    <div
        v-bind="rootAttrs"
        class="caomei-textarea"
        :class="rootClass"
        :data-filled="model ? 'true' : undefined"
    >
        <textarea
            :id="id"
            ref="textareaRef"
            v-model="model"
            v-bind="controlAttrs"
            class="caomei-textarea__control"
            :style="controlStyle"
            :disabled="disabled"
            :readonly="readonly"
            :placeholder="placeholder"
            :name="name"
            :autocomplete="autocomplete"
            :rows="rows"
            :aria-invalid="invalid || undefined"
            :aria-label="label"
            @focus="emit('focus', $event)"
            @blur="emit('blur', $event)"
            @change="emit('change', $event)"
        />
    </div>
</template>

<style scoped>
.caomei-textarea {
    box-sizing: border-box;
    display: block;
    width: 100%;
    border: 1px solid var(--caomei-color-border);
    border-radius: var(--caomei-radius-md);
    background: var(--caomei-color-bg);
    color: var(--caomei-color-text);
    font-family: var(--caomei-font-sans);
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.caomei-textarea:focus-within {
    border-color: var(--caomei-color-primary);
    box-shadow: 0 0 0 2px var(--caomei-color-border);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--caomei-color-primary) 20%, transparent);
}

.caomei-textarea--invalid {
    border-color: var(--caomei-color-danger);
}

.caomei-textarea--invalid:focus-within {
    border-color: var(--caomei-color-danger);
    box-shadow: 0 0 0 2px var(--caomei-color-border);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--caomei-color-danger) 20%, transparent);
}

.caomei-textarea--disabled {
    cursor: not-allowed;
    background: var(--caomei-color-bg-elevated);
    opacity: 0.6;
}

.caomei-textarea--readonly {
    background: var(--caomei-color-bg-elevated);
}

.caomei-textarea__control {
    box-sizing: border-box;
    display: block;
    width: 100%;
    margin: 0;
    border: 0;
    outline: 0;
    background: transparent;
    color: inherit;
    font: inherit;
}

.caomei-textarea__control:disabled {
    cursor: not-allowed;
}

.caomei-textarea__control::placeholder {
    color: var(--caomei-color-text-muted);
}

.caomei-textarea--sm .caomei-textarea__control {
    padding: var(--caomei-space-1) var(--caomei-space-2);
    font-size: var(--caomei-font-size-sm);
}

.caomei-textarea--md .caomei-textarea__control {
    padding: var(--caomei-space-2) var(--caomei-space-3);
    font-size: var(--caomei-font-size-md);
}

.caomei-textarea--lg .caomei-textarea__control {
    padding: var(--caomei-space-3) var(--caomei-space-4);
    font-size: var(--caomei-font-size-lg);
}
</style>
