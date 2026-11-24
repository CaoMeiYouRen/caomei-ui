<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useLocale } from '../../composables/use-locale'
import { CaomeiIcon, useInternalIcons } from '../../icons'
import { CaomeiTree } from '../tree'
import { CaomeiPopover, CaomeiPopoverContent, CaomeiPopoverTrigger } from '../popover'
import { useLabelAttrs } from '../_shared/use-label-attrs'
import type { TreeNode } from '../tree/types'
import type { TreeSelectProps } from './types'

defineOptions({ name: 'CaomeiTreeSelect', inheritAttrs: false })

const props = withDefaults(defineProps<TreeSelectProps>(), {
    multiple: false,
    clearable: false,
    disabled: false,
    itemKey: 'id',
    labelKey: 'label',
    childrenKey: 'children',
    panelMaxHeight: '16rem',
})

const emit = defineEmits<{
    /** 选中项变化（键列表） */
    'update:modelValue': [keys: string[]]
}>()

const icons = useInternalIcons()
const messages = useLocale()

const rootAttrs = useLabelAttrs(() => props.label)

/** 非受控值：未绑定 `v-model` 时由组件自持（`modelValue` 为 `undefined` 才视为非受控） */
const internalSelected = ref<string[]>([])
const selected = computed({
    get: () => props.modelValue ?? internalSelected.value,
    set: (keys: string[]) => {
        if (props.modelValue === undefined) {
            internalSelected.value = keys
        }
        emit('update:modelValue', keys)
    },
})

const open = ref(false)
/** 有值 = 有可回显的标签（与清空按钮可见性同源） */
const hasValue = computed(() => selectedLabels.value.length > 0)
const clearLabel = computed(() => props.clearLabel ?? messages.value.select.clear)

function getKey(item: TreeNode): string {
    const raw = typeof props.itemKey === 'function' ? props.itemKey(item) : item[props.itemKey]
    return typeof raw === 'string' || typeof raw === 'number' ? String(raw) : ''
}

function flatten(items: TreeNode[], acc: TreeNode[] = []): TreeNode[] {
    for (const item of items) {
        acc.push(item)
        const children = item[props.childrenKey]
        if (Array.isArray(children) && children.length) {
            flatten(children as TreeNode[], acc)
        }
    }
    return acc
}

const labelByKey = computed(() => {
    const map = new Map<string, string>()
    for (const item of flatten(props.items)) {
        const key = getKey(item)
        map.set(key, (item[props.labelKey] as string | undefined) ?? key)
    }
    return map
})

/** 已选标签：按选择顺序回显；`items` 中找不到的键回显键本身，避免「有值却显示占位」 */
const selectedLabels = computed(() => selected.value.map((key) => labelByKey.value.get(key) ?? key))

/** 回显：多选按逗号拼接（单行截断由样式负责），空值走占位 */
const displayText = computed(() => {
    const labels = selectedLabels.value
    if (!labels.length) {
        return props.placeholder ?? ''
    }
    return props.multiple ? labels.join(', ') : (labels[0] ?? '')
})

const showClear = computed(() => props.clearable && hasValue.value && !props.disabled)

const rootClass = computed(() => ({
    'caomei-tree-select--clearable': showClear.value,
    'caomei-tree-select--disabled': props.disabled,
    'caomei-tree-select--open': open.value,
    'caomei-tree-select--empty': !hasValue.value,
}))

function clearSelection(): void {
    // 走可写 computed：非受控时同时更新内部值，否则清空只发事件、回显不变
    selected.value = []
}

/** 单选选中后收起面板；多选保持展开 */
watch(selected, (keys) => {
    if (!props.multiple && keys.length) {
        open.value = false
    }
})
</script>

<template>
    <CaomeiPopover v-model:open="open" :disabled="disabled">
        <div class="caomei-tree-select" :class="rootClass">
            <CaomeiPopoverTrigger as-child :disabled="disabled">
                <button
                    v-bind="rootAttrs"
                    type="button"
                    class="caomei-tree-select__field"
                    :disabled="disabled"
                >
                    <span class="caomei-tree-select__value">{{ displayText }}</span>
                    <CaomeiIcon
                        v-if="!showClear"
                        class="caomei-tree-select__chevron"
                        :icon="icons.chevronDown"
                        aria-hidden="true"
                    />
                </button>
            </CaomeiPopoverTrigger>
            <button
                v-if="showClear"
                type="button"
                class="caomei-tree-select__clear"
                :aria-label="clearLabel"
                @click.stop="clearSelection"
            >
                <CaomeiIcon :icon="icons.dismiss" aria-hidden="true" />
            </button>
        </div>
        <CaomeiPopoverContent
            class="caomei-tree-select__panel"
            side="bottom"
            align="start"
            :side-offset="4"
            :style="{'--caomei-tree-select-panel-max-height': panelMaxHeight}"
        >
            <CaomeiTree
                v-if="items.length"
                v-model="selected"
                :items="items"
                :multiple="multiple"
                :item-key="itemKey"
                :label-key="labelKey"
                :children-key="childrenKey"
                :label="label"
            />
            <p v-else class="caomei-tree-select__empty">
                {{ emptyText }}
            </p>
        </CaomeiPopoverContent>
    </CaomeiPopover>
</template>

<style scoped>
.caomei-tree-select {
    position: relative;
    display: block;
    box-sizing: border-box;
    width: 100%;
}

.caomei-tree-select__field {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: var(--caomei-space-2);
    width: 100%;
    height: var(--caomei-control-height-md);
    padding: 0 var(--caomei-space-3);
    border: 1px solid var(--caomei-color-control-border);
    border-radius: var(--caomei-radius-md);
    background: var(--caomei-color-bg);
    color: var(--caomei-color-text);
    font-family: var(--caomei-font-sans);
    font-size: var(--caomei-font-size-md);
    text-align: left;
    cursor: pointer;
}

.caomei-tree-select__field:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 1px;
}

.caomei-tree-select__value {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.caomei-tree-select--empty .caomei-tree-select__value {
    color: var(--caomei-color-text-muted);
}

.caomei-tree-select__chevron {
    flex-shrink: 0;
    color: var(--caomei-color-text-muted);
    transition: transform var(--caomei-motion-duration-fast) var(--caomei-motion-ease-standard);
}

.caomei-tree-select--open .caomei-tree-select__chevron {
    transform: rotate(180deg);
}

/* 清空按钮外挂字段之上，避免按钮内嵌按钮；有值时右侧留出位置 */
.caomei-tree-select--clearable .caomei-tree-select__field {
    padding-right: calc(var(--caomei-space-4) + var(--caomei-hit-target-min));
}

.caomei-tree-select__clear {
    position: absolute;
    top: 50%;
    right: var(--caomei-space-4);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--caomei-hit-target-min);
    height: var(--caomei-hit-target-min);
    padding: 0;
    border: 0;
    border-radius: var(--caomei-radius-full);
    background: transparent;
    color: var(--caomei-color-text-muted);
    transform: translateY(-50%);
    cursor: pointer;
}

.caomei-tree-select__clear:hover {
    background: var(--caomei-color-bg-elevated);
    color: var(--caomei-color-text);
}

.caomei-tree-select--disabled {
    cursor: not-allowed;
    opacity: var(--caomei-disabled-opacity);
}

.caomei-tree-select--disabled .caomei-tree-select__field {
    cursor: not-allowed;
}

@media (prefers-reduced-motion: reduce) {
    .caomei-tree-select__chevron {
        transition: none;
    }
}
</style>

<!--
  Portal 面板样式说明：面板经 `PopoverPortal` 挂到 body，scoped 的 `data-v` 落在 popper 包裹层而非
  面板本体，故改用命名空间化的非 scoped 规则（与 Popover / Select / Cascader 同口径）。
  组件私有的 `--caomei-tree-select-panel-*` 变量由内联样式写在面板元素上，在此消费。
  注：`.caomei-tree-select__panel` 与 `.caomei-popover__content` 同为单类选择器，本组件的差异化
  声明依赖注入顺序（组件样式晚于 popover 产物）；E2E 的 `padding` / `max-height` 断言守住结果。
-->
<style>
.caomei-tree-select__panel {
    box-sizing: border-box;
    min-width: var(--caomei-tree-select-panel-min-width, 12rem);
    max-height: var(--caomei-tree-select-panel-max-height, 16rem);
    overflow: auto;
    padding: var(--caomei-space-1);
    background: var(--caomei-color-bg-elevated);
    border: 1px solid var(--caomei-color-border);
    border-radius: var(--caomei-radius-md);
    box-shadow: var(--caomei-shadow-md);
    color: var(--caomei-color-text);
    font-family: var(--caomei-font-sans);
    font-size: var(--caomei-font-size-md);
}

.caomei-tree-select__empty {
    margin: 0;
    padding: var(--caomei-space-2);
    color: var(--caomei-color-text-muted);
}
</style>
