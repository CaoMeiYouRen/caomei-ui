<script setup lang="ts">
import { computed, ref } from 'vue'
import { useLocale } from '../../composables/use-locale'
import { CaomeiIcon, useInternalIcons } from '../../icons'
import type { TransferOption, TransferProps, TransferValue } from './types'
import { labelAttrs } from '../_shared/use-label-attrs'

defineOptions({ name: 'CaomeiTransfer' })

const props = withDefaults(defineProps<Omit<TransferProps, 'modelValue'>>(), {
    dataSource: () => [],
    searchable: true,
    disabled: false,
})

const emit = defineEmits<{
    change: [value: TransferValue[]]
}>()

const icons = useInternalIcons()
const messages = useLocale()
const model = defineModel<TransferValue[]>({ default: () => [] })
const leftSelected = ref<TransferValue[]>([])
const rightSelected = ref<TransferValue[]>([])
const leftQuery = ref('')
const rightQuery = ref('')

const titles = computed<[string, string]>(() => props.titles ?? [messages.value.transfer.source, messages.value.transfer.target])

function matches(option: TransferOption, query: string): boolean {
    return !query || option.label.toLowerCase().includes(query.trim().toLowerCase())
}

const targetSet = computed(() => new Set(model.value))
const leftOptions = computed(() => props.dataSource.filter(
    (option) => !targetSet.value.has(option.value) && matches(option, leftQuery.value),
))
const rightOptions = computed(() => props.dataSource.filter(
    (option) => targetSet.value.has(option.value) && matches(option, rightQuery.value),
))

function toggle(side: 'left' | 'right', value: TransferValue, checked: boolean): void {
    const list = side === 'left' ? leftSelected : rightSelected
    list.value = checked ? [...list.value, value] : list.value.filter((item) => item !== value)
}

function commit(next: TransferValue[]): void {
    model.value = next
    emit('change', next)
}

function moveToTarget(): void {
    if (props.disabled || !leftSelected.value.length) {
        return
    }
    const moving = leftSelected.value.filter((value) => !props.dataSource.find((option) => option.value === value)?.disabled)
    commit([...model.value, ...moving])
    leftSelected.value = []
}

function moveToSource(): void {
    if (props.disabled || !rightSelected.value.length) {
        return
    }
    const moving = new Set(rightSelected.value)
    commit(model.value.filter((value) => !moving.has(value)))
    rightSelected.value = []
}
</script>

<template>
    <div
        class="caomei-transfer"
        :class="{'caomei-transfer--disabled': disabled}"
        v-bind="labelAttrs(label)"
        role="group"
    >
        <section class="caomei-transfer__panel">
            <header class="caomei-transfer__header">
                <span class="caomei-transfer__title">{{ titles[0] }}</span>
                <span class="caomei-transfer__count">{{ leftOptions.length }}</span>
            </header>
            <input
                v-if="searchable"
                v-model="leftQuery"
                class="caomei-transfer__search"
                type="search"
                :placeholder="messages.transfer.search"
                :aria-label="messages.transfer.search"
                :disabled="disabled"
            >
            <ul
                class="caomei-transfer__list"
                :aria-label="titles[0]"
            >
                <li
                    v-for="option in leftOptions"
                    :key="option.value"
                    class="caomei-transfer__item"
                >
                    <label class="caomei-transfer__option">
                        <input
                            type="checkbox"
                            :checked="leftSelected.includes(option.value)"
                            :disabled="disabled || option.disabled"
                            @change="toggle('left', option.value, ($event.target as HTMLInputElement).checked)"
                        >
                        <span>{{ option.label }}</span>
                    </label>
                </li>
                <li
                    v-if="!leftOptions.length"
                    class="caomei-transfer__empty"
                >
                    {{ messages.transfer.empty }}
                </li>
            </ul>
        </section>

        <div class="caomei-transfer__actions">
            <button
                type="button"
                class="caomei-transfer__button"
                :disabled="disabled || !leftSelected.length"
                :aria-label="messages.transfer.moveToTarget"
                @click="moveToTarget"
            >
                <CaomeiIcon :icon="icons.chevronRight" />
            </button>
            <button
                type="button"
                class="caomei-transfer__button"
                :disabled="disabled || !rightSelected.length"
                :aria-label="messages.transfer.moveToSource"
                @click="moveToSource"
            >
                <CaomeiIcon :icon="icons.chevronLeft" />
            </button>
        </div>

        <section class="caomei-transfer__panel">
            <header class="caomei-transfer__header">
                <span class="caomei-transfer__title">{{ titles[1] }}</span>
                <span class="caomei-transfer__count">{{ rightOptions.length }}</span>
            </header>
            <input
                v-if="searchable"
                v-model="rightQuery"
                class="caomei-transfer__search"
                type="search"
                :placeholder="messages.transfer.search"
                :aria-label="messages.transfer.search"
                :disabled="disabled"
            >
            <ul
                class="caomei-transfer__list"
                :aria-label="titles[1]"
            >
                <li
                    v-for="option in rightOptions"
                    :key="option.value"
                    class="caomei-transfer__item"
                >
                    <label class="caomei-transfer__option">
                        <input
                            type="checkbox"
                            :checked="rightSelected.includes(option.value)"
                            :disabled="disabled || option.disabled"
                            @change="toggle('right', option.value, ($event.target as HTMLInputElement).checked)"
                        >
                        <span>{{ option.label }}</span>
                    </label>
                </li>
                <li
                    v-if="!rightOptions.length"
                    class="caomei-transfer__empty"
                >
                    {{ messages.transfer.empty }}
                </li>
            </ul>
        </section>
    </div>
</template>

<style scoped>
.caomei-transfer {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
    gap: var(--caomei-space-3);
    align-items: stretch;
    color: var(--caomei-color-text);
    font-family: var(--caomei-font-sans);
}

.caomei-transfer__panel {
    display: flex;
    flex-direction: column;
    min-width: 0;
    border: 1px solid var(--caomei-color-border);
    border-radius: var(--caomei-radius-md);
    background: var(--caomei-color-bg);
}

.caomei-transfer__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--caomei-space-2) var(--caomei-space-3);
    border-bottom: 1px solid var(--caomei-color-border);
    font-weight: 600;
}

.caomei-transfer__count {
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-sm);
    font-weight: 400;
}

.caomei-transfer__search {
    margin: var(--caomei-space-2);
}

.caomei-transfer__list {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    gap: var(--caomei-space-1);
    min-height: 10rem;
    max-height: 16rem;
    margin: 0;
    padding: 0 var(--caomei-space-2) var(--caomei-space-2);
    overflow: auto;
    list-style: none;
}

.caomei-transfer__option {
    display: flex;
    gap: var(--caomei-space-2);
    align-items: center;
    padding: var(--caomei-space-1) var(--caomei-space-2);
    border-radius: var(--caomei-radius-sm);
    cursor: pointer;
}

.caomei-transfer__option:hover {
    background: var(--caomei-color-bg-elevated);
}

.caomei-transfer__empty {
    padding: var(--caomei-space-3);
    color: var(--caomei-color-text-muted);
    text-align: center;
}

.caomei-transfer__actions {
    display: flex;
    flex-direction: column;
    gap: var(--caomei-space-2);
    align-items: center;
    justify-content: center;
}

.caomei-transfer__button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: var(--caomei-control-height-sm);
    min-height: var(--caomei-control-height-sm);
    border: 1px solid var(--caomei-color-border);
    border-radius: var(--caomei-radius-sm);
    background: var(--caomei-color-bg);
    color: var(--caomei-color-text);
    cursor: pointer;
}

.caomei-transfer__button:disabled {
    cursor: not-allowed;
    opacity: var(--caomei-disabled-opacity);
}

.caomei-transfer--disabled {
    opacity: var(--caomei-disabled-opacity);
}

@media (width <= 640px) {
    .caomei-transfer {
        grid-template-columns: 1fr;
    }

    .caomei-transfer__actions {
        flex-direction: row;
    }
}
</style>
