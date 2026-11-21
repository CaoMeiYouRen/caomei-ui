<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useLocale } from '../../composables/use-locale'
import { CaomeiIcon, useInternalIcons } from '../../icons'
import { CaomeiPopover, CaomeiPopoverContent, CaomeiPopoverTrigger } from '../popover'
import type { CascaderOption, CascaderProps, CascaderValue } from './types'
import { labelAttrs } from '../_shared/use-label-attrs'

defineOptions({ name: 'CaomeiCascader' })

const props = withDefaults(defineProps<Omit<CascaderProps, 'modelValue'>>(), {
    options: () => [],
    placeholder: '',
    clearable: true,
    changeOnSelect: false,
    separator: ' / ',
    disabled: false,
})

const emit = defineEmits<{
    change: [value: CascaderValue[]]
}>()

const model = defineModel<CascaderValue[] | null>({ default: () => [] })
const messages = useLocale()
const icons = useInternalIcons()
const open = ref(false)
const activePath = ref<CascaderValue[]>([])

/** 按值路径解析节点链；任一级缺失时返回空数组 */
function resolvePath(values: CascaderValue[]): CascaderOption[] {
    const nodes: CascaderOption[] = []
    let level = props.options
    for (const value of values) {
        const node = level.find((option) => option.value === value)
        if (!node) {
            return []
        }
        nodes.push(node)
        level = node.children ?? []
    }
    return nodes
}

const selectedNodes = computed(() => resolvePath(model.value ?? []))
const displayText = computed(() => selectedNodes.value.map((node) => node.label).join(props.separator))
const hasValue = computed(() => selectedNodes.value.length > 0)

/** 打开时把活动路径对齐到已选路径；无选择时回到根列 */
watch(open, (isOpen) => {
    if (isOpen) {
        activePath.value = selectedNodes.value.map((node) => node.value)
    }
})

/** 当前展开的列：根列 + 每个已展开父节点的子列 */
const columns = computed<CascaderOption[][]>(() => {
    const result: CascaderOption[][] = [props.options]
    let level = props.options
    for (const value of activePath.value) {
        const node = level.find((option) => option.value === value)
        if (!node?.children?.length) {
            break
        }
        level = node.children
        result.push(level)
    }
    return result
})

/** 每列当前选中的值（用于 aria-selected） */
function isActive(index: number, value: CascaderValue): boolean {
    return activePath.value[index] === value
}

function select(option: CascaderOption, index: number): void {
    if (props.disabled || option.disabled) {
        return
    }
    const nextPath = [...activePath.value.slice(0, index), option.value]
    activePath.value = nextPath
    if (option.children?.length && !props.changeOnSelect) {
        return
    }
    const next = nextPath
    model.value = next
    emit('change', next)
    open.value = false
}

function clear(): void {
    if (props.disabled) {
        return
    }
    model.value = []
    activePath.value = []
    emit('change', [])
}
</script>

<template>
    <CaomeiPopover v-model:open="open">
        <div class="caomei-cascader" :class="{'caomei-cascader--disabled': disabled}">
            <CaomeiPopoverTrigger as-child>
                <button
                    type="button"
                    class="caomei-cascader__trigger"
                    v-bind="labelAttrs(label)"
                    :aria-expanded="open"
                    :disabled="disabled"
                >
                    <span
                        class="caomei-cascader__text"
                        :data-empty="hasValue ? undefined : 'true'"
                    >{{ displayText || placeholder }}</span>
                    <CaomeiIcon
                        :icon="icons.chevronDown"
                        class="caomei-cascader__icon"
                    />
                </button>
            </CaomeiPopoverTrigger>
            <button
                v-if="clearable && hasValue && !disabled"
                type="button"
                class="caomei-cascader__clear"
                :aria-label="messages.cascader.clear"
                @click.stop="clear"
            >
                <CaomeiIcon :icon="icons.dismiss" />
            </button>
            <CaomeiPopoverContent
                class="caomei-cascader__content"
                align="start"
                :side-offset="6"
            >
                <div
                    class="caomei-cascader__columns"
                    role="group"
                    v-bind="labelAttrs(label)"
                >
                    <ul
                        v-for="(column, index) in columns"
                        :key="index"
                        class="caomei-cascader__column"
                        role="listbox"
                    >
                        <li
                            v-for="option in column"
                            :key="option.value"
                            role="option"
                            :aria-selected="isActive(index, option.value)"
                            :aria-disabled="option.disabled || undefined"
                            class="caomei-cascader__option"
                            :class="{
                                'caomei-cascader__option--active': isActive(index, option.value),
                                'caomei-cascader__option--disabled': option.disabled
                            }"
                            tabindex="0"
                            @click="select(option, index)"
                            @keydown.enter.prevent="select(option, index)"
                            @keydown.space.prevent="select(option, index)"
                        >
                            <span>{{ option.label }}</span>
                            <CaomeiIcon
                                v-if="option.children?.length"
                                :icon="icons.chevronRight"
                                class="caomei-cascader__arrow"
                            />
                        </li>
                        <li
                            v-if="!column.length"
                            class="caomei-cascader__empty"
                        >
                            {{ messages.cascader.empty }}
                        </li>
                    </ul>
                </div>
            </CaomeiPopoverContent>
        </div>
    </CaomeiPopover>
</template>

<style scoped>
.caomei-cascader {
    position: relative;
    display: inline-flex;
    max-width: 100%;
}

.caomei-cascader__trigger {
    display: inline-flex;
    gap: var(--caomei-space-2);
    align-items: center;
    justify-content: space-between;
    width: 100%;
    min-width: 12rem;
    min-height: var(--caomei-control-height-md);
    padding: 0 var(--caomei-space-3);
    border: 1px solid var(--caomei-color-control-border);
    border-radius: var(--caomei-radius-md);
    background: var(--caomei-color-bg);
    color: var(--caomei-color-text);
    font: inherit;
    text-align: left;
    cursor: pointer;
}

.caomei-cascader__text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.caomei-cascader__text[data-empty='true'] {
    color: var(--caomei-color-text-muted);
}

.caomei-cascader__clear {
    position: absolute;
    top: 50%;
    right: 2rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.25rem;
    height: 1.25rem;
    border: 0;
    border-radius: 50%;
    background: transparent;
    color: var(--caomei-color-text-muted);
    transform: translateY(-50%);
    cursor: pointer;
}

.caomei-cascader__clear:hover {
    color: var(--caomei-color-text);
}

.caomei-cascader__content {
    z-index: var(--caomei-cascader-z-index, var(--caomei-z-dropdown));
    padding: var(--caomei-space-1);
    border: 1px solid var(--caomei-color-border);
    border-radius: var(--caomei-radius-md);
    background: var(--caomei-color-bg-elevated);
    box-shadow: var(--caomei-shadow-md);
}

.caomei-cascader__columns {
    display: flex;
    max-width: min(40rem, 80vw);
    overflow: auto;
}

.caomei-cascader__column {
    min-width: 10rem;
    max-height: 16rem;
    margin: 0;
    padding: 0;
    overflow: auto;
    border-right: 1px solid var(--caomei-color-border);
    list-style: none;
}

.caomei-cascader__column:last-child {
    border-right: 0;
}

.caomei-cascader__option {
    display: flex;
    gap: var(--caomei-space-2);
    align-items: center;
    justify-content: space-between;
    padding: var(--caomei-space-2) var(--caomei-space-3);
    border-radius: var(--caomei-radius-sm);
    cursor: pointer;
}

.caomei-cascader__option:hover,
.caomei-cascader__option--active {
    background: var(--caomei-color-bg);
}

.caomei-cascader__option--disabled {
    cursor: not-allowed;
    opacity: var(--caomei-disabled-opacity);
}

.caomei-cascader__arrow {
    color: var(--caomei-color-text-muted);
    font-size: 0.75rem;
}

.caomei-cascader__empty {
    padding: var(--caomei-space-3);
    color: var(--caomei-color-text-muted);
    text-align: center;
}

.caomei-cascader--disabled {
    opacity: var(--caomei-disabled-opacity);
}
</style>
