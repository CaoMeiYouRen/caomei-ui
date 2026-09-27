<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiSelect } from '@/components/select'

interface Fruit {
    label: string
    value: string
}

interface StarredFruit extends Fruit {
    star: boolean
}

const value1 = ref<string>()
const value2 = ref<string>()
const value3 = ref<string>()
const value4a = ref<string>()
const value4b = ref<string>()
const value4c = ref<string>()
const value5 = ref<string>()

const options: Fruit[] = [
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
    { label: 'Cherry', value: 'cherry' },
]

const starredOptions: StarredFruit[] = [
    { label: 'Apple', value: 'apple', star: true },
    { label: 'Banana', value: 'banana', star: false },
    { label: 'Cherry', value: 'cherry', star: true },
]
</script>

<template>
    <div class="demo-section">
        <h4>Basic usage</h4>
        <div class="demo-row">
            <CaomeiSelect
                v-model="value1"
                :options="options"
                placeholder="Select a fruit"
            >
                <template #value="{option, label, selected}">
                    <span class="custom-trigger">
                        <span v-if="selected" class="selected-badge">Selected</span>
                        <span>{{ label || 'Please select' }}</span>
                        <span v-if="option" class="option-id">(ID: {{ option.value }})</span>
                    </span>
                </template>
            </CaomeiSelect>
        </div>
    </div>

    <div class="demo-section">
        <h4>Icon + label</h4>
        <div class="demo-row">
            <CaomeiSelect
                v-model="value2"
                :options="starredOptions"
                placeholder="Select a favorite"
            >
                <template #value="{option, label}">
                    <span class="custom-trigger-icon">
                        <span v-if="option?.star" class="star-icon">★</span>
                        <span>{{ label || 'None selected' }}</span>
                    </span>
                </template>
            </CaomeiSelect>
        </div>
    </div>

    <div class="demo-section">
        <h4>Placeholder when nothing is selected</h4>
        <div class="demo-row">
            <CaomeiSelect
                v-model="value3"
                :options="options"
                placeholder="Shown when nothing is selected"
            >
                <template #value="{label, selected}">
                    <span class="custom-trigger">
                        <span v-if="selected" class="selected-tag">Selected: {{ label }}</span>
                        <span v-else class="placeholder-tag">None selected</span>
                    </span>
                </template>
            </CaomeiSelect>
        </div>
    </div>

    <div class="demo-section">
        <h4>Sizes</h4>
        <div class="demo-row">
            <CaomeiSelect
                v-model="value4a"
                :options="options"
                placeholder="Small"
                size="sm"
            >
                <template #value="{label, selected}">
                    <span v-if="selected" class="selected-tag">✓ {{ label }}</span>
                    <span v-else class="placeholder-tag">Please select</span>
                </template>
            </CaomeiSelect>
            <CaomeiSelect
                v-model="value4b"
                :options="options"
                placeholder="Medium"
                size="md"
            >
                <template #value="{label, selected}">
                    <span v-if="selected" class="selected-tag">✓ {{ label }}</span>
                    <span v-else class="placeholder-tag">Please select</span>
                </template>
            </CaomeiSelect>
            <CaomeiSelect
                v-model="value4c"
                :options="options"
                placeholder="Large"
                size="lg"
            >
                <template #value="{label, selected}">
                    <span v-if="selected" class="selected-tag">✓ {{ label }}</span>
                    <span v-else class="placeholder-tag">Please select</span>
                </template>
            </CaomeiSelect>
        </div>
    </div>

    <div class="demo-section">
        <h4>#value combined with #option</h4>
        <p class="desc">
            The trigger shows custom content while the panel uses the #option slot
        </p>
        <div class="demo-row">
            <CaomeiSelect
                v-model="value5"
                :options="starredOptions"
                placeholder="Select"
            >
                <template #value="{option, label}">
                    <span class="custom-trigger">
                        <span v-if="option?.star">⭐ </span>
                        <span>{{ label || 'Please select' }}</span>
                    </span>
                </template>
                <template #option="{option, selected}">
                    <span class="custom-option">
                        <span v-if="option.star">⭐ </span>
                        {{ option.label }}
                        <span v-if="selected" class="selected-badge">(current)</span>
                    </span>
                </template>
            </CaomeiSelect>
        </div>
    </div>
</template>

<style scoped>
.demo-section {
    margin-bottom: 24px;
}

.demo-section h4 {
    margin: 0 0 12px;
    font-size: 14px;
    font-weight: 600;
    color: var(--caomei-color-text);
}

.demo-section .desc {
    margin: 0 0 12px;
    font-size: 13px;
    color: var(--caomei-color-text-muted);
}

.demo-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
}

.custom-trigger,
.custom-trigger-icon,
.custom-option {
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.star-icon {
    color: #f59e0b;
    font-size: 14px;
}

.selected-badge {
    font-size: 10px;
    padding: 1px 4px;
    background: var(--caomei-color-primary);
    color: var(--caomei-color-primary-foreground);
    border-radius: var(--caomei-radius-sm);
    margin-right: 4px;
}

.selected-tag {
    font-size: 12px;
    padding: 1px 6px;
    background: var(--caomei-color-success);
    color: white;
    border-radius: var(--caomei-radius-sm);
    margin-right: 4px;
}

.placeholder-tag {
    font-size: 12px;
    color: var(--caomei-color-text-muted);
}

.option-id {
    font-size: 11px;
    color: var(--caomei-color-text-muted);
    margin-left: 4px;
}
</style>
