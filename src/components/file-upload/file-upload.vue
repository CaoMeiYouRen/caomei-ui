<script setup lang="ts">
import { FileUp, X } from '@lucide/vue'
import { computed, onBeforeUnmount, onMounted, ref, useSlots } from 'vue'
import { CaomeiIcon } from '../../icons'
import { useAttrForwarding } from '../_shared/use-attr-forwarding'
import type { FileUploadProps } from './types'

defineOptions({ name: 'CaomeiFileUpload', inheritAttrs: false })

defineSlots<{
    default?: (props: { open: () => void, dragging: boolean }) => unknown
    file?: (props: { file: File, index: number, remove: () => void }) => unknown
}>()

const props = withDefaults(defineProps<FileUploadProps>(), {
    accept: '',
    multiple: false,
    disabled: false,
})

const model = defineModel<File[] | null>({ default: () => [] })

const slots = useSlots()
const { rootAttrs, controlAttrs } = useAttrForwarding()

/** 表单语义属性透传到内层 input；其余（id / aria-* / data-*）透传到可聚焦的选择按钮 */
const inputAttrs = computed<{ name?: string, form?: string, required?: boolean }>(() => {
    const { name, form, required } = controlAttrs.value
    return {
        name: typeof name === 'string' ? name : undefined,
        form: typeof form === 'string' ? form : undefined,
        required: required === true ? true : undefined,
    }
})
const buttonAttrs = computed(() => {
    const { name: _name, form: _form, required: _required, ...rest } = controlAttrs.value
    return rest
})

/** 默认提示文本本身即可访问名；仅在自定义（可能无可见文本）提示内容时使用 label */
const accessibleLabel = computed(() => (slots.default ? props.label : undefined))

const dropzoneRef = ref<HTMLButtonElement>()
const inputRef = ref<HTMLInputElement>()
const isDragging = ref(false)

const files = computed(() => model.value ?? [])

/** 判断文件是否匹配原生 `accept` 语法（扩展名、`type/*` 或精确 MIME） */
function matchesAccept(file: File, accept: string): boolean {
    const patterns = accept.split(',').map((pattern) => pattern.trim()).filter(Boolean)
    if (!patterns.length) {
        return true
    }
    const name = file.name.toLowerCase()
    return patterns.some((pattern) => {
        const normalized = pattern.toLowerCase()
        if (normalized.startsWith('.')) {
            return name.endsWith(normalized)
        }
        if (normalized.endsWith('/*')) {
            return file.type.startsWith(normalized.slice(0, -1))
        }
        return file.type.toLowerCase() === normalized
    })
}

/** 以名称 + 大小 + 修改时间作为去重键 */
function fileKey(file: File): string {
    return `${file.name}:${file.size}:${file.lastModified}`
}

function commitFiles(incoming: File[]): void {
    const accepted = incoming.filter((file) => matchesAccept(file, props.accept))
    if (!accepted.length) {
        return
    }
    if (!props.multiple) {
        model.value = [accepted[0]]
        return
    }
    const seen = new Set(files.value.map(fileKey))
    const next = [...files.value]
    for (const file of accepted) {
        const key = fileKey(file)
        if (seen.has(key)) {
            continue
        }
        seen.add(key)
        next.push(file)
    }
    model.value = next
}

function openPicker(): void {
    if (props.disabled) {
        return
    }
    inputRef.value?.click()
}

function handleInputChange(event: Event): void {
    const input = event.target as HTMLInputElement
    if (input.files?.length) {
        commitFiles(Array.from(input.files))
    }
    // 复位以支持再次选择同一文件
    input.value = ''
}

function handleDragEnter(): void {
    if (!props.disabled) {
        isDragging.value = true
    }
}

function handleDragLeave(event: DragEvent): void {
    const related = event.relatedTarget as Node | null
    if (related && dropzoneRef.value?.contains(related)) {
        return
    }
    isDragging.value = false
}

function handleDrop(event: DragEvent): void {
    isDragging.value = false
    if (props.disabled) {
        return
    }
    const dropped = event.dataTransfer?.files
    if (dropped?.length) {
        commitFiles(Array.from(dropped))
    }
}

function resetDragging(): void {
    isDragging.value = false
}

onMounted(() => {
    // 拖出窗口或在选择区外释放时，避免高亮状态残留
    window.addEventListener('dragend', resetDragging)
    window.addEventListener('drop', resetDragging)
})

onBeforeUnmount(() => {
    window.removeEventListener('dragend', resetDragging)
    window.removeEventListener('drop', resetDragging)
})

function remove(index: number): void {
    if (props.disabled) {
        return
    }
    model.value = files.value.filter((_, current) => current !== index)
}

/** 人类可读的文件大小 */
function formatSize(bytes: number): string {
    if (bytes < 1024) {
        return `${bytes} B`
    }
    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
</script>

<template>
    <div
        v-bind="rootAttrs"
        class="caomei-file-upload"
        :class="{'caomei-file-upload--disabled': disabled}"
    >
        <button
            ref="dropzoneRef"
            v-bind="{...buttonAttrs, ...(accessibleLabel ? {'aria-label': accessibleLabel} : {})}"
            type="button"
            class="caomei-file-upload__dropzone"
            :class="{'caomei-file-upload__dropzone--dragging': isDragging}"
            :disabled="disabled"
            @click="openPicker"
            @dragenter.prevent="handleDragEnter"
            @dragover.prevent
            @dragleave="handleDragLeave"
            @drop.prevent="handleDrop"
        >
            <slot :open="openPicker" :dragging="isDragging">
                <CaomeiIcon
                    :icon="FileUp"
                    class="caomei-file-upload__icon"
                />
                <span class="caomei-file-upload__text">点击选择文件，或将文件拖拽到此处</span>
            </slot>
        </button>

        <input
            ref="inputRef"
            v-bind="inputAttrs"
            type="file"
            class="caomei-file-upload__input"
            :accept="accept || undefined"
            :multiple="multiple"
            :disabled="disabled"
            :tabindex="-1"
            aria-hidden="true"
            @change="handleInputChange"
        >

        <ul
            v-if="files.length"
            class="caomei-file-upload__list"
        >
            <li
                v-for="(file, index) in files"
                :key="`${file.name}-${file.size}-${index}`"
                class="caomei-file-upload__item"
            >
                <slot
                    name="file"
                    :file="file"
                    :index="index"
                    :remove="() => remove(index)"
                >
                    <span class="caomei-file-upload__name">{{ file.name }}</span>
                    <span class="caomei-file-upload__size">{{ formatSize(file.size) }}</span>
                    <button
                        type="button"
                        class="caomei-file-upload__remove"
                        :disabled="disabled"
                        :aria-label="`移除 ${file.name}`"
                        @click="remove(index)"
                    >
                        <CaomeiIcon :icon="X" />
                    </button>
                </slot>
            </li>
        </ul>
    </div>
</template>

<style scoped>
.caomei-file-upload {
    position: relative;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: var(--caomei-file-upload-gap, var(--caomei-space-2));
    font-family: var(--caomei-font-sans);
}

.caomei-file-upload__dropzone {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--caomei-space-1);
    width: 100%;
    padding: var(--caomei-file-upload-padding, var(--caomei-space-4));
    border: 1px dashed var(--caomei-file-upload-border, var(--caomei-color-border));
    border-radius: var(--caomei-radius-md);
    background: var(--caomei-file-upload-bg, var(--caomei-color-bg));
    color: var(--caomei-color-text-muted);
    font: inherit;
    font-size: var(--caomei-font-size-md);
    cursor: pointer;
    transition: border-color 0.15s ease, background-color 0.15s ease;
}

.caomei-file-upload__dropzone:hover:not(:disabled) {
    border-color: var(--caomei-color-primary);
}

.caomei-file-upload__dropzone:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 2px;
}

.caomei-file-upload__dropzone--dragging {
    border-color: var(--caomei-color-primary);
    background: var(--caomei-color-bg-elevated);
}

.caomei-file-upload__dropzone:disabled {
    cursor: not-allowed;
    opacity: var(--caomei-disabled-opacity);
}

.caomei-file-upload__icon {
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-file-upload-icon-size, 24px);
}

.caomei-file-upload__input {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
    border: 0;
}

.caomei-file-upload__list {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: var(--caomei-space-1);
}

.caomei-file-upload__item {
    display: flex;
    align-items: center;
    gap: var(--caomei-space-2);
    margin: 0;
    padding: var(--caomei-space-1) var(--caomei-space-2);
    border-radius: var(--caomei-radius-sm);
    background: var(--caomei-file-upload-item-bg, var(--caomei-color-bg-elevated));
    font-size: var(--caomei-font-size-sm);
}

.caomei-file-upload__name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.caomei-file-upload__size {
    flex-shrink: 0;
    color: var(--caomei-color-text-muted);
}

.caomei-file-upload__remove {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--caomei-color-text-muted);
    font: inherit;
    cursor: pointer;
}

.caomei-file-upload__remove:hover:not(:disabled) {
    color: var(--caomei-color-danger);
}

.caomei-file-upload__remove:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 2px;
    border-radius: var(--caomei-radius-sm);
}

.caomei-file-upload__remove:disabled {
    cursor: not-allowed;
    opacity: var(--caomei-disabled-opacity);
}

@media (prefers-reduced-motion: reduce) {
    .caomei-file-upload__dropzone {
        transition: none;
    }
}
</style>
