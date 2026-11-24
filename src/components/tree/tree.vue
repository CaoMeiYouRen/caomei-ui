<script setup lang="ts">
import { computed, ref } from 'vue'
import { TreeItem, TreeRoot } from 'reka-ui'
import { CaomeiIcon, useInternalIcons } from '../../icons'
import { useLabelAttrs } from '../_shared/use-label-attrs'
import { warnDev } from '../../_shared/dev-warn'
import type { TreeItemKey, TreeNode, TreeProps } from './types'

defineOptions({ name: 'CaomeiTree', inheritAttrs: false })

const props = withDefaults(defineProps<TreeProps>(), {
    itemKey: 'id',
    labelKey: 'label',
    childrenKey: 'children',
    multiple: false,
    propagateSelect: false,
    bubbleSelect: false,
    disabled: false,
})

defineSlots<{
    /** 自定义节点文案；缺省取 `labelKey` 字段 */
    label?: (props: { item: TreeNode, level: number, expanded: boolean, selected: boolean, disabled: boolean }) => unknown
}>()

const icons = useInternalIcons()

/** 根属性：整体透传 + 显式 `label` 优先于透传的 `aria-label` */
const rootAttrs = useLabelAttrs(() => props.label)

const emit = defineEmits<{
    /** 选中项变化（键列表）；单选时最多一项 */
    'update:modelValue': [keys: TreeItemKey[]]
    /** 展开项变化（键列表） */
    'update:expanded': [keys: TreeItemKey[]]
}>()

/** 非受控选中态：`v-model` 未绑定时由组件自持 */
const internalSelected = ref<TreeItemKey[]>([])
const selectedKeys = computed(() => props.modelValue ?? internalSelected.value)

/** 非受控展开态：`v-model:expanded` 未绑定时由组件自持 */
const internalExpanded = ref<TreeItemKey[]>(props.defaultExpanded ?? [])
const expandedKeys = computed(() => props.expanded ?? internalExpanded.value)

function commitSelection(keys: TreeItemKey[]): void {
    if (props.modelValue === undefined) {
        internalSelected.value = keys
    }
    emit('update:modelValue', keys)
}

function getKey(item: TreeNode): TreeItemKey {
    const raw = typeof props.itemKey === 'function' ? props.itemKey(item) : item[props.itemKey]
    if (typeof raw === 'string') {
        return raw
    }
    if (typeof raw === 'number') {
        return String(raw)
    }
    // 键缺失会让多个节点共用同一（空）键：选择与展开互相串扰，故开发期点名。
    // 空对象是 primitive 在「单选且未选中」时传入的占位值（`getKey(modelValue ?? {})`），不告警。
    if (raw === undefined && Object.keys(item).length > 0) {
        warnDev(`[CaomeiTree] 节点缺少键（itemKey 字段「${String(props.itemKey)}」为空），选择与展开会互相串扰。`)
    }
    return ''
}

/**
 * 子节点：空数组按「无子节点」处理。
 *
 * primitive 以 `!!children` 判断 `hasChildren`，返回 `[]` 会渲染成「可展开但点开为空」的节点
 * （`aria-expanded="false"` + 旋转箭头却无内容）。
 */
function getChildren(item: TreeNode): TreeNode[] | undefined {
    const children = item[props.childrenKey]
    return Array.isArray(children) && children.length ? (children as TreeNode[]) : undefined
}

function labelOf(item: TreeNode): string {
    return (item[props.labelKey] as string | undefined) ?? ''
}

function isExpanded(item: TreeNode): boolean {
    return expandedKeys.value.includes(getKey(item))
}

function isSelected(item: TreeNode): boolean {
    return effectiveKeys.value.includes(getKey(item))
}

/** 扁平化全部节点：把模型里的键映射回节点，供 Reka 的 `selectedKeys` 比较 */
function flattenAll(items: TreeNode[], acc: TreeNode[] = []): TreeNode[] {
    for (const item of items) {
        acc.push(item)
        const children = getChildren(item)
        if (children?.length) {
            flattenAll(children, acc)
        }
    }
    return acc
}

const allNodes = computed(() => flattenAll(props.items))

/** 单选只取第一个键：多键输入（父级误传）时以首个为准，避免槽内 `selected` 与 `aria-selected` 不一致 */
const effectiveKeys = computed(() => (props.multiple ? selectedKeys.value : selectedKeys.value.slice(0, 1)))

const selectedItems = computed(() => {
    const keys = effectiveKeys.value
    return keys.length ? allNodes.value.filter((item) => keys.includes(getKey(item))) : []
})

/**
 * 交给 Reka 的模型：多选为数组；单选时 primitive 只接受**单个节点**（内部按 `getKey` 比较），
 * 传数组会让它的 `[getKey(modelValue)]` 拿到 `undefined`、`aria-selected` 恒为 false。
 */
const modelForReka = computed(() => (props.multiple ? selectedItems.value : selectedItems.value[0]))

/** Reka 回写的是节点对象（多选为数组），对外统一收敛成键 */
function onSelectUpdate(value: TreeNode | TreeNode[] | undefined): void {
    const values = Array.isArray(value) ? value : (value ? [value] : [])
    commitSelection(values.map((item) => getKey(item)))
}

function onExpandedUpdate(keys: TreeItemKey[] = []): void {
    const next = keys
    if (props.expanded === undefined) {
        internalExpanded.value = next
    }
    emit('update:expanded', next)
}
</script>

<template>
    <TreeRoot
        v-bind="rootAttrs"
        class="caomei-tree"
        as="ul"
        :items="items"
        :get-key="getKey"
        :get-children="getChildren"
        :expanded="expandedKeys"
        :model-value="modelForReka"
        :multiple="multiple"
        :disabled="disabled"
        :propagate-select="propagateSelect"
        :bubble-select="bubbleSelect"
        @update:expanded="onExpandedUpdate"
        @update:model-value="onSelectUpdate"
    >
        <template #default="{flattenItems}">
            <TreeItem
                v-for="entry in flattenItems"
                :key="String(entry._id)"
                v-bind="entry.bind"
                class="caomei-tree__item"
                :disabled="Boolean(entry.value.disabled)"
                :style="{'--caomei-tree-level': String(entry.level)}"
            >
                <span class="caomei-tree__row">
                    <span
                        class="caomei-tree__toggle"
                        :class="{'caomei-tree__toggle--expanded': isExpanded(entry.value)}"
                        aria-hidden="true"
                    >
                        <CaomeiIcon
                            v-if="entry.hasChildren"
                            :icon="icons.chevronRight"
                        />
                    </span>
                    <span class="caomei-tree__label">
                        <slot
                            name="label"
                            :item="entry.value"
                            :level="entry.level"
                            :expanded="isExpanded(entry.value)"
                            :selected="isSelected(entry.value)"
                            :disabled="disabled || Boolean(entry.value.disabled)"
                        >
                            {{ labelOf(entry.value) }}
                        </slot>
                    </span>
                </span>
            </TreeItem>
        </template>
    </TreeRoot>
</template>

<style scoped>
.caomei-tree {
    box-sizing: border-box;
    margin: 0;
    padding: var(--caomei-space-1);
    color: var(--caomei-color-text);
    font-family: var(--caomei-font-sans);
    font-size: var(--caomei-font-size-md);
    list-style: none;
}

.caomei-tree__item {
    border-radius: var(--caomei-radius-sm);
    outline: none;
}

.caomei-tree__item:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: -2px;
}

.caomei-tree__row {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    gap: var(--caomei-space-1);
    min-height: var(--caomei-tree-row-height, var(--caomei-control-height-md));

    /* 层级缩进：层级由内联 `--caomei-tree-level` 提供（primitive 同时把层级写在 `data-indent` 上） */
    padding-left: calc((var(--caomei-tree-level, 1) - 1) * var(--caomei-tree-indent, var(--caomei-space-4)));
    padding-right: var(--caomei-space-2);
    border-radius: var(--caomei-radius-sm);
    cursor: pointer;
}

.caomei-tree__item[aria-selected='true'] > .caomei-tree__row {
    background: var(--caomei-tree-selected-bg, color-mix(in srgb, var(--caomei-color-primary) 12%, transparent));
    color: var(--caomei-tree-selected-color, var(--caomei-color-primary-text));
}

.caomei-tree__item[aria-disabled='true'] {
    cursor: not-allowed;
    opacity: var(--caomei-disabled-opacity);
}

.caomei-tree__toggle {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: var(--caomei-tree-toggle-size, 1rem);
    color: var(--caomei-color-text-muted);
    transition: transform var(--caomei-motion-duration-fast) var(--caomei-motion-ease-standard);
}

.caomei-tree__toggle--expanded {
    transform: rotate(90deg);
}

.caomei-tree__label {
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

@media (prefers-reduced-motion: reduce) {
    .caomei-tree__toggle {
        transition: none;
    }
}
</style>
