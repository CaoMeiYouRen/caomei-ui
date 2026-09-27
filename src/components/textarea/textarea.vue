<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch, type StyleValue } from 'vue'
import { useAttrForwarding } from '../_shared/use-attr-forwarding'
import { useFocusControl } from '../_shared/use-focus-control'
import { labelAttrs } from '../_shared/use-label-attrs'
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
    `caomei-field--${props.size}`,
    {
        'caomei-field--invalid': props.invalid,
        'caomei-field--disabled': props.disabled,
        'caomei-field--readonly': props.readonly,
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
        class="caomei-field caomei-textarea"
        :class="rootClass"
        :data-filled="model ? 'true' : undefined"
    >
        <textarea
            :id="id"
            ref="textareaRef"
            v-model="model"
            v-bind="{...controlAttrs, ...labelAttrs(label)}"
            class="caomei-field__control caomei-textarea__control"
            :style="controlStyle"
            :disabled="disabled"
            :readonly="readonly"
            :placeholder="placeholder"
            :name="name"
            :autocomplete="autocomplete"
            :rows="rows"
            :aria-invalid="invalid || undefined"
            @focus="emit('focus', $event)"
            @blur="emit('blur', $event)"
            @change="emit('change', $event)"
        />
    </div>
</template>

<style scoped>
/*
  Textarea 组件特有样式：block 布局、垂直内边距、自动增高逻辑的配合样式。
  外壳样式（边框/圆角/背景/色值/聚焦/非法/禁用/只读/尺寸档位）由共享层 `field-shell.css`
  的 `.caomei-field` 基类提供。
  差异点：需要垂直内边距，覆盖基类的水平-only padding。
*/
.caomei-textarea {
    display: block;
    /* width: 100% 由 .caomei-field 基类提供 */
    padding: var(--caomei-field-padding-block) var(--caomei-field-padding-inline);
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
    /* 控件本身不加 padding，由包裹层提供 */
    padding: 0;
    font-size: var(--caomei-field-font-size);
}

.caomei-textarea__control:disabled {
    cursor: not-allowed;
}

.caomei-textarea__control::placeholder {
    color: var(--caomei-color-text-muted);
}

/* 自动增高时高度由内容决定，尺寸档位变量不生效 */
.caomei-textarea--auto-resize {
    height: auto;
}
</style>
