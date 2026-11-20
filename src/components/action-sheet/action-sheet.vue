<script setup lang="ts">
import { computed, useId } from 'vue'
import { useLocale } from '../../composables/use-locale'
import CaomeiDrawer from '../drawer/drawer.vue'
import type { ActionSheetItem, ActionSheetProps, ActionSheetValue } from './types'

defineOptions({ name: 'CaomeiActionSheet' })

const props = withDefaults(defineProps<ActionSheetProps>(), {
    title: '',
    description: '',
    cancelLabel: '',
    closeOnSelect: true,
})

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
    /** 选择了某个条目 */
    select: [value: ActionSheetValue | undefined, item: ActionSheetItem]
    /** 点击了取消项 */
    cancel: []
}>()

defineSlots<{
    /** 自定义内容区；提供后不再渲染 `groups` */
    default?: () => unknown
}>()

const locale = useLocale()
const groupIdBase = useId()

function groupLabelId(index: number): string {
    return `${groupIdBase}-group-${index}`
}

const cancelText = computed(() => props.cancelLabel || locale.value.actionSheet.cancel)

function select(item: ActionSheetItem): void {
    if (item.disabled) {
        return
    }
    emit('select', item.value, item)
    if (props.closeOnSelect) {
        open.value = false
    }
}

function cancel(): void {
    open.value = false
    emit('cancel')
}
</script>

<template>
    <CaomeiDrawer
        v-model:open="open"
        class="caomei-action-sheet"
        position="bottom"
        size="md"
        :title="title"
        :description="description"
        :label="locale.actionSheet.label"
        :closable="false"
        :class="{'caomei-action-sheet--headerless': !title && !description}"
    >
        <div class="caomei-action-sheet__body">
            <slot>
                <div
                    v-for="(group, groupIndex) in groups ?? []"
                    :key="groupIndex"
                    class="caomei-action-sheet__group"
                    :role="group.label ? 'group' : undefined"
                    :aria-labelledby="group.label ? groupLabelId(groupIndex) : undefined"
                >
                    <div
                        v-if="group.label"
                        :id="groupLabelId(groupIndex)"
                        class="caomei-action-sheet__group-label"
                    >
                        {{ group.label }}
                    </div>
                    <button
                        v-for="item in group.items"
                        :key="item.value ?? item.label"
                        type="button"
                        class="caomei-action-sheet__item"
                        :class="{'caomei-action-sheet__item--danger': item.danger}"
                        :disabled="item.disabled"
                        @click="select(item)"
                    >
                        <span class="caomei-action-sheet__item-label">{{ item.label }}</span>
                        <span v-if="item.description" class="caomei-action-sheet__item-description">
                            {{ item.description }}
                        </span>
                    </button>
                </div>
            </slot>
        </div>
        <template #footer>
            <button
                type="button"
                class="caomei-action-sheet__cancel"
                @click="cancel"
            >
                {{ cancelText }}
            </button>
        </template>
    </CaomeiDrawer>
</template>

<!--
  面板内容经 Drawer 的 Portal 挂到 body，DOM 不在本组件作用域内，故使用
  命名空间化的非 scoped 样式（`.caomei-action-sheet*`）限定范围。
-->
<style>
/* 覆写 Drawer 内部类时提升到 0-3-0，不依赖样式注入源序 */
.caomei-action-sheet.caomei-action-sheet .caomei-drawer__footer {
    display: block;
    padding: 0;
}

/*
  无标题 / 说明时头部仍留在 DOM 中供 `aria-labelledby` 引用，只按视觉隐藏处理，不占布局。
*/
.caomei-action-sheet.caomei-action-sheet--headerless .caomei-drawer__header {
    position: absolute;
    overflow: hidden;
    width: 1px;
    height: 1px;
    padding: 0;
    border: 0;
    margin: -1px;
    clip-path: inset(50%);
    white-space: nowrap;
}

.caomei-action-sheet__body {
    display: flex;
    flex-direction: column;
    gap: var(--caomei-action-sheet-group-gap, var(--caomei-space-3));
    width: 100%;
}

.caomei-action-sheet__group {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-radius: var(--caomei-action-sheet-radius, var(--caomei-radius-md));
    background: var(--caomei-action-sheet-item-bg, var(--caomei-color-bg-elevated));
}

.caomei-action-sheet__group-label {
    padding: var(--caomei-space-2) var(--caomei-space-3);
    color: var(--caomei-color-text-muted);
    font-family: var(--caomei-font-sans);
    font-size: var(--caomei-font-size-sm);
    text-align: center;
}

.caomei-action-sheet__item {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--caomei-space-1);
    min-height: var(--caomei-action-sheet-item-min-height, calc(var(--caomei-control-height-lg) + var(--caomei-space-1)));
    padding: var(--caomei-space-2) var(--caomei-space-3);
    border: 0;
    background: transparent;
    color: var(--caomei-color-text);
    font-family: var(--caomei-font-sans);
    font-size: var(--caomei-font-size-md);
    line-height: 1.3;
    cursor: pointer;
}

.caomei-action-sheet__item + .caomei-action-sheet__item {
    border-top: 1px solid var(--caomei-action-sheet-divider, var(--caomei-color-border));
}

.caomei-action-sheet__item:hover:not(:disabled) {
    background: var(--caomei-color-bg);
}

.caomei-action-sheet__item:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: -2px;
}

.caomei-action-sheet__item:disabled {
    cursor: not-allowed;
    opacity: var(--caomei-disabled-opacity);
}

.caomei-action-sheet__item--danger {
    color: var(--caomei-color-danger-text);
}

.caomei-action-sheet__item-description {
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-sm);
}

.caomei-action-sheet__cancel {
    box-sizing: border-box;
    width: 100%;
    min-height: var(--caomei-action-sheet-item-min-height, calc(var(--caomei-control-height-lg) + var(--caomei-space-1)));
    padding: var(--caomei-space-2) var(--caomei-space-3);
    border: 1px solid var(--caomei-action-sheet-cancel-border, var(--caomei-color-border));
    border-radius: var(--caomei-action-sheet-radius, var(--caomei-radius-md));
    background: var(--caomei-action-sheet-cancel-bg, var(--caomei-color-bg-elevated));
    color: var(--caomei-color-text);
    font-family: var(--caomei-font-sans);
    font-size: var(--caomei-font-size-md);
    font-weight: 600;
    cursor: pointer;
}

.caomei-action-sheet__cancel:hover {
    background: var(--caomei-color-bg);
}

.caomei-action-sheet__cancel:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: -2px;
}
</style>
