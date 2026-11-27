<script setup lang="ts">
import { computed, ref } from 'vue'
import { TreeItem, TreeRoot, TreeVirtualizer } from 'reka-ui'
import { CaomeiIcon, useInternalIcons } from '../../icons'
import { useLabelAttrs } from '../_shared/use-label-attrs'
import type { TreeItemKey, TreeNode } from '../tree/types'
import type { TreeVirtualizerProps } from './types'

defineOptions({ name: 'CaomeiTreeVirtualizer', inheritAttrs: false })

const props = withDefaults(defineProps<TreeVirtualizerProps>(), {
    itemKey: 'id',
    labelKey: 'label',
    childrenKey: 'children',
    height: '20rem',
    itemHeight: 28,
    overscan: 12,
    multiple: false,
})

defineSlots<{
    /** 自定义节点文案；缺省取 `labelKey` 字段 */
    label?: (props: { item: TreeNode, level: number, expanded: boolean, selected: boolean }) => unknown
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

/** 非受控选中态 */
const internalSelected = ref<TreeItemKey[]>([])
const selectedKeys = computed(() => props.modelValue ?? internalSelected.value)

/** 非受控展开态 */
const internalExpanded = ref<TreeItemKey[]>(props.defaultExpanded ?? [])
const expandedKeys = computed(() => props.expanded ?? internalExpanded.value)

function commitSelection(keys: TreeItemKey[]): void {
    if (props.modelValue === undefined) {
        internalSelected.value = keys
    }
    emit('update:modelValue', keys)
}

/**
 * 键归一化：数字键按字符串比较（与 `CaomeiTree` 同一口径），缺失键返回空串。
 *
 * 键缺失会让多个节点共用同一空键（选择 / 展开互相串扰）；本组件不重复 `CaomeiTree` 的开发期告警，
 * 只在数据侧以「同键即同节点」的既有语义运行。
 */
function getKey(item: TreeNode): TreeItemKey {
    const raw = typeof props.itemKey === 'function' ? props.itemKey(item) : item[props.itemKey]
    if (typeof raw === 'string') {
        return raw
    }
    return typeof raw === 'number' ? String(raw) : ''
}

/** 子节点：空数组按「无子节点」处理（与 `CaomeiTree` 同口径） */
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

/** 扁平化全部节点，供「键 → 节点」映射 */
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
const effectiveKeys = computed(() => (props.multiple ? selectedKeys.value : selectedKeys.value.slice(0, 1)))
const selectedItems = computed(() => {
    const keys = effectiveKeys.value
    return keys.length ? allNodes.value.filter((item) => keys.includes(getKey(item))) : []
})

/** 单选时 primitive 只接受单个节点（传数组会让 `aria-selected` 恒为 false），与 `CaomeiTree` 同口径 */
const modelForReka = computed(() => (props.multiple ? selectedItems.value : selectedItems.value[0]))

function onSelectUpdate(value: TreeNode | TreeNode[] | undefined): void {
    const values = Array.isArray(value) ? value : (value ? [value] : [])
    commitSelection(values.map((item) => getKey(item)))
}

function onExpandedUpdate(keys: TreeItemKey[] = []): void {
    if (props.expanded === undefined) {
        internalExpanded.value = keys
    }
    emit('update:expanded', keys)
}

/** 键盘 typeahead 取节点文案（primitive 在虚拟模式下用文本值定位） */
function textContentOf(item: TreeNode): string {
    return labelOf(item).toLowerCase()
}
</script>

<template>
    <!--
      滚动容器 = 虚拟化器的父元素，因此根节点自身承担 `height` + 滚动；`as="div"` 避免把
      虚拟化器内部的定位 `div` 放进 `ul`（Reka 的虚拟层固定渲染 `div`）。
    -->
    <TreeRoot
        v-bind="rootAttrs"
        class="caomei-tree-virtualizer"
        as="div"
        :items="items"
        :get-key="getKey"
        :get-children="getChildren"
        :expanded="expandedKeys"
        :model-value="modelForReka"
        :multiple="multiple"
        :style="{height}"
        @update:expanded="onExpandedUpdate"
        @update:model-value="onSelectUpdate"
    >
        <TreeVirtualizer
            :estimate-size="itemHeight"
            :overscan="overscan"
            :text-content="textContentOf"
        >
            <template #default="{item}">
                <TreeItem
                    v-bind="item.bind"
                    class="caomei-tree-virtualizer__item"
                    :style="{'--caomei-tree-level': String(item.level)}"
                >
                    <span class="caomei-tree-virtualizer__row">
                        <span
                            class="caomei-tree-virtualizer__toggle"
                            :class="{'caomei-tree-virtualizer__toggle--expanded': isExpanded(item.value)}"
                            aria-hidden="true"
                        >
                            <CaomeiIcon
                                v-if="item.hasChildren"
                                :icon="icons.chevronRight"
                            />
                        </span>
                        <span class="caomei-tree-virtualizer__label">
                            <slot
                                name="label"
                                :item="item.value"
                                :level="item.level"
                                :expanded="isExpanded(item.value)"
                                :selected="isSelected(item.value)"
                            >
                                {{ labelOf(item.value) }}
                            </slot>
                        </span>
                    </span>
                </TreeItem>
            </template>
        </TreeVirtualizer>
    </TreeRoot>
</template>

<style scoped>
.caomei-tree-virtualizer {
    box-sizing: border-box;
    overflow: auto;
    margin: 0;
    padding: var(--caomei-space-1);
    border: 1px solid var(--caomei-tree-virtualizer-border, var(--caomei-color-border));
    border-radius: var(--caomei-radius-md);
    color: var(--caomei-color-text);
    font-family: var(--caomei-font-sans);
    font-size: var(--caomei-font-size-md);
}

.caomei-tree-virtualizer__item {
    /* 行高必须与 `itemHeight` 估算一致，否则滚动定位会累积偏移 */
    height: var(--caomei-tree-virtualizer-item-height, 28px);
    outline: none;
}

.caomei-tree-virtualizer__item:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: -2px;
}

.caomei-tree-virtualizer__row {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    gap: var(--caomei-space-1);
    height: 100%;
    padding-left: calc((var(--caomei-tree-level, 1) - 1) * var(--caomei-tree-virtualizer-indent, var(--caomei-space-4)));
    padding-right: var(--caomei-space-2);
    border-radius: var(--caomei-radius-sm);
    cursor: pointer;
}

.caomei-tree-virtualizer__item[aria-selected='true'] > .caomei-tree-virtualizer__row {
    background: var(--caomei-tree-virtualizer-selected-bg, color-mix(in srgb, var(--caomei-color-primary) 12%, transparent));
    color: var(--caomei-tree-virtualizer-selected-color, var(--caomei-color-primary-text));
}

.caomei-tree-virtualizer__toggle {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: var(--caomei-tree-virtualizer-toggle-size, 1rem);
    color: var(--caomei-color-text-muted);
    transition: transform var(--caomei-motion-duration-fast) var(--caomei-motion-ease-standard);
}

.caomei-tree-virtualizer__toggle--expanded {
    transform: rotate(90deg);
}

.caomei-tree-virtualizer__label {
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

@media (prefers-reduced-motion: reduce) {
    .caomei-tree-virtualizer__toggle {
        transition: none;
    }
}
</style>
