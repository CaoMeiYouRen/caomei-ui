<script setup lang="ts">
import { computed, getCurrentInstance, inject, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { warnDev } from '../../_shared/dev-warn'
import {
    formContextKey,
    isPromiseLike,
    type FormValidateOutcome,
    type FormValidateResult,
} from './context'
import type { FormItemProps, FormItemSlotProps } from './types'

defineOptions({ name: 'CaomeiFormItem' })

const props = withDefaults(defineProps<FormItemProps>(), {
    id: undefined,
    name: undefined,
    label: '',
    hint: '',
    error: '',
    required: false,
    invalid: false,
    modelValue: undefined,
    validate: undefined,
    validationMode: undefined,
})

defineSlots<{
    /**
     * 字段内容；作用域提供 `id` / `name` / `aria-labelledby` / `aria-describedby` / `invalid`
     * @en Field content; the scope provides `id` / `name` / `aria-labelledby` / `aria-describedby` / `invalid`
     */
    default?: (props: FormItemSlotProps) => unknown
}>()

const instanceId = useId()
const formContext = inject(formContextKey, null)

const itemRef = ref<HTMLElement | null>(null)
const localError = ref('')
/** 校验函数抛错：按失败处理但不展示文案（只标红），避免静默放行 */
const validateFailed = ref(false)
/** 服务端错误的下发版本：每次 `errors` 源或该字段文案变化时自增 */
const serverErrorVersion = ref(0)
/** 值变更时已消费到的版本；`errors` 版本更高时才重新展示服务端错误 */
const clearedAtVersion = ref(-1)
const instance = getCurrentInstance()

/** 控件 id：显式 id 优先，缺省按实例生成（SSR 与客户端一致） */
const controlId = computed(() => props.id || `caomei-form-item-${instanceId}`)
const labelId = computed(() => `${instanceId}-label`)
const hintId = computed(() => `${instanceId}-hint`)
const errorId = computed(() => `${instanceId}-error`)

/** 服务端下发的原始错误文案（不经过「已清除」状态） */
const serverErrorValue = computed(() => {
    const name = props.name
    if (!name || !formContext) {
        return ''
    }
    const value = formContext.errors()[name]
    const first = Array.isArray(value) ? value[0] : value
    return first || ''
})

/** 服务端 / 提交回填错误：仅展示晚于最近一次值变更的版本 */
const serverError = computed(() => (
    serverErrorVersion.value > clearedAtVersion.value ? serverErrorValue.value : ''
))

/**
 * 展示用错误文案，优先级：受控 `error` > 本地校验 > 服务端 `errors`。
 *
 * 受控 `error` 代表使用方最新的判断；本地校验比服务端快照更接近当前值，故高于 `errors`。
 */
const displayError = computed(() => props.error || localError.value || serverError.value)

/** `error` / 本地校验 / 服务端错误 / 校验抛错任一成立即失败；`invalid` 可单独使用（只标红不显示文案） */
const isInvalid = computed(() => Boolean(props.invalid || displayError.value || validateFailed.value))

/** hint / error 的 id 列表；只有实际渲染的文本才进入 `aria-describedby` */
const describedBy = computed(() => {
    const ids = [
        props.hint ? hintId.value : '',
        displayError.value ? errorId.value : '',
    ].filter(Boolean)
    return ids.length > 0 ? ids.join(' ') : undefined
})

const slotProps = computed<FormItemSlotProps>(() => ({
    id: controlId.value,
    name: props.name,
    'aria-labelledby': props.label ? labelId.value : undefined,
    'aria-describedby': describedBy.value,
    invalid: isInvalid.value,
}))

const validationMode = computed(() => props.validationMode ?? formContext?.validationMode() ?? 'onSubmit')

/** 是否真的传入了 `modelValue`（`undefined` 也可能是显式传入） */
function hasValueChannel(): boolean {
    const vnodeProps = instance?.vnode.props
    return Boolean(vnodeProps && ('modelValue' in vnodeProps || 'model-value' in vnodeProps))
}
let warnedMissingValue = false
let warnedWritableModel = false

/** 校验序号：异步结果只采纳最近一次，避免旧结果覆盖新结果 */
let validateId = 0

function normalizeMessage(result: FormValidateResult): string {
    if (!result) {
        return ''
    }
    if (Array.isArray(result)) {
        return result.find(Boolean) ?? ''
    }
    return result
}

/**
 * 执行字段校验，返回是否通过。
 *
 * 异步结果同样被等待（不做请求编排）；校验器抛错按**失败**处理（只标红、不展示文案），避免静默放行。
 */
function runValidate(): FormValidateOutcome {
    if (!props.validate) {
        localError.value = ''
        validateFailed.value = false
        return true
    }
    if (!hasValueChannel() && !warnedMissingValue) {
        warnedMissingValue = true
        warnDev('[CaomeiFormItem] 已提供 validate 但未传入 modelValue：校验将收到 undefined。请把字段值传给 modelValue。')
    }
    if (!warnedWritableModel && instance?.vnode.props && 'onUpdate:modelValue' in instance.vnode.props) {
        warnedWritableModel = true
        warnDev('[CaomeiFormItem] modelValue 是只读值通道，不会 emit update:modelValue；请把 v-model 绑到内部字段组件上。')
    }
    const currentId = ++validateId
    let result: FormValidateResult | Promise<FormValidateResult>
    try {
        result = props.validate(props.modelValue, formContext?.getValues() ?? {})
    } catch (error) {
        console.error(error)
        if (currentId === validateId) {
            localError.value = ''
            validateFailed.value = true
        }
        return false
    }
    if (isPromiseLike(result)) {
        return result.then(
            (resolved) => {
                const message = normalizeMessage(resolved)
                if (currentId === validateId) {
                    localError.value = message
                    validateFailed.value = false
                }
                // 过期结果只跳过状态写入，不篡改本次调用的真实结论
                return !message
            },
            (error: unknown) => {
                console.error(error)
                if (currentId === validateId) {
                    localError.value = ''
                    validateFailed.value = true
                }
                return false
            },
        )
    }
    const message = normalizeMessage(result)
    localError.value = message
    validateFailed.value = false
    return !message
}

/**
 * 字段内可聚焦控件的优先级：原生控件 → 可访问触发件 / 组根 → 非破坏性按钮。
 *
 * 逐个选择器查询（而非逗号合并）：合并后 `querySelector` 按文档顺序取首个命中，
 * 会让标签删除按钮（位于输入框之前）抢走焦点。
 */
const CONTROL_SELECTORS = [
    'input:not([type="hidden"])',
    'textarea',
    'select',
    '[role="combobox"]',
    '[role="checkbox"]',
    '[role="switch"]',
    '[role="radiogroup"][tabindex]',
    '[role="group"][tabindex]',
    '[role="radio"]',
]
/** 兜底按钮：排除 hit-target（清除 / 删除类破坏性按钮） */
const FALLBACK_BUTTON_SELECTOR = 'button:not([disabled]):not(.caomei-hit-target)'

function resolveControl(): HTMLElement | null {
    const root = itemRef.value
    if (!root) {
        return null
    }
    for (const selector of CONTROL_SELECTORS) {
        const found = root.querySelector<HTMLElement>(selector)
        if (found) {
            return found
        }
    }
    return root.querySelector<HTMLElement>(FALLBACK_BUTTON_SELECTOR)
}

/**
 * 值变更即清除该字段的服务端错误。
 *
 * 用同步 flush：先于任何排队中的 `errors` 版本自增执行，使「同一 tick 内值变更 + 新错误」
 * 不会把刚下发的新错误压掉。
 */
watch(
    () => props.modelValue,
    () => {
        clearedAtVersion.value = serverErrorVersion.value
    },
    { flush: 'sync' },
)

watch(
    () => props.modelValue,
    () => {
        const mode = validationMode.value
        const submitted = (formContext?.submitCount() ?? 0) > 0
        if (mode === 'onChange' || (mode === 'onSubmit' && submitted)) {
            void runValidate()
        }
    },
)

/**
 * `errors` 源或该字段文案变化即视为「服务端重新下发」，自增版本使新错误重新可见。
 *
 * 与值变更的先后由「同步 flush 的清除 + 排队中的版本自增」保证，不依赖 watcher 创建顺序。
 */
watch([(): Record<string, string | string[] | undefined> | undefined => formContext?.errors(), serverErrorValue], (): void => {
    serverErrorVersion.value += 1
})

/**
 * 仅在**移除**校验器时复位本地状态。
 *
 * 不能按引用变化复位：模板内联的 `:validate="(v) => …"` 每次父渲染都是新引用，
 * 复位会让已展示的错误被无关重渲染清空（`onChange` 下甚至完全不展示）。
 */
watch(
    () => props.validate,
    (validate) => {
        if (!validate) {
            localError.value = ''
            validateFailed.value = false
        }
    },
)

/** `onBlur` 模式：焦点离开字段（含子控件间移动不触发）即校验 */
function onFocusOut(event: FocusEvent): void {
    if (validationMode.value !== 'onBlur') {
        return
    }
    const next = event.relatedTarget as Node | null
    if (next && itemRef.value?.contains(next)) {
        return
    }
    void runValidate()
}

let unregister: (() => void) | undefined

onMounted(() => {
    if (!formContext) {
        return
    }
    unregister = formContext.register({
        name: () => props.name,
        value: () => props.modelValue,
        root: () => itemRef.value,
        control: resolveControl,
        validate: runValidate,
        invalid: () => isInvalid.value,
    })
})

onBeforeUnmount(() => {
    validateId += 1
    unregister?.()
    unregister = undefined
})
</script>

<template>
    <div
        ref="itemRef"
        class="caomei-form-item"
        :class="{'caomei-form-item--invalid': isInvalid}"
        @focusout="onFocusOut"
    >
        <span
            v-if="label"
            :id="labelId"
            class="caomei-form-item__label"
        >
            {{ label }}
            <span
                v-if="required"
                class="caomei-form-item__required"
                aria-hidden="true"
            >*</span>
        </span>
        <div class="caomei-form-item__control">
            <slot v-bind="slotProps" />
        </div>
        <p
            v-if="hint"
            :id="hintId"
            class="caomei-form-item__hint"
        >
            {{ hint }}
        </p>
        <p
            v-if="displayError"
            :id="errorId"
            class="caomei-form-item__error"
            role="alert"
        >
            {{ displayError }}
        </p>
    </div>
</template>

<style scoped>
.caomei-form-item {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: var(--caomei-form-item-gap, var(--caomei-space-1));
    width: 100%;
}

.caomei-form-item__label {
    display: inline-flex;
    align-items: baseline;
    gap: var(--caomei-form-item-required-gap, var(--caomei-space-1));
    color: var(--caomei-form-item-label-color, var(--caomei-color-text));
    font-size: var(--caomei-form-item-label-font-size, var(--caomei-font-size-sm));
    font-weight: 500;
    line-height: 1.4;
}

.caomei-form-item__required {
    color: var(--caomei-form-item-required-color, var(--caomei-color-danger-text));
}

.caomei-form-item__control {
    display: block;
    min-width: 0;
}

.caomei-form-item__hint,
.caomei-form-item__error {
    margin: 0;
    font-size: var(--caomei-form-item-message-font-size, var(--caomei-font-size-sm));
    line-height: 1.4;
}

.caomei-form-item__hint {
    color: var(--caomei-form-item-hint-color, var(--caomei-color-text-muted));
}

.caomei-form-item__error {
    color: var(--caomei-form-item-error-color, var(--caomei-color-danger-text));
}

.caomei-form-item--invalid .caomei-form-item__label {
    color: var(--caomei-form-item-invalid-label-color, var(--caomei-color-danger-text));
}

@keyframes caomei-form-item-error-in {
    from {
        opacity: 0;
        transform: translateY(calc(var(--caomei-motion-distance-sm) * -1));
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/*
  动效优先模式：标签颜色随校验状态过渡，错误行出现时淡入 + 轻微下移归位。
  错误行由 `v-if` 挂载 / 卸载，动效只承担入场；`minimal` 无对应规则，`reduce` 在末尾压平。
*/
:where([data-motion='expressive']) .caomei-form-item__label {
    transition: color var(--caomei-motion-duration-base) var(--caomei-motion-ease-standard);
}

:where([data-motion='expressive']) .caomei-form-item__error {
    animation: caomei-form-item-error-in var(--caomei-motion-duration-base) var(--caomei-motion-ease-out);
}

@media (prefers-reduced-motion: reduce) {
    :where([data-motion='expressive']) .caomei-form-item__label {
        transition: none;
    }

    :where([data-motion='expressive']) .caomei-form-item__error {
        animation: none;
        transform: none;
    }
}
</style>
