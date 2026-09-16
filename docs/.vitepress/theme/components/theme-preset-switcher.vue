<script setup lang="ts">
import { onMounted, ref } from 'vue'

const presets = [
    { value: '', label: '默认' },
    { value: 'caomei', label: 'caomei' },
    { value: 'momei', label: 'momei' },
] as const

const STORAGE_KEY = 'caomei-docs-preset'
const VALID_PRESETS: Set<string> = new Set<string>(presets.map((preset) => preset.value))
const current = ref('')

function apply(value: string): void {
    const safe = VALID_PRESETS.has(value) ? value : ''
    current.value = safe
    const root = document.documentElement
    if (safe) {
        root.dataset.preset = safe
    } else {
        delete root.dataset.preset
    }
}

function onChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value
    apply(value)
    localStorage.setItem(STORAGE_KEY, current.value)
}

onMounted(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
        apply(saved)
    }
})
</script>

<template>
    <label class="theme-preset-switcher">
        <span class="theme-preset-switcher__label">主题预设</span>
        <select
            :value="current"
            @change="onChange"
        >
            <option
                v-for="preset in presets"
                :key="preset.value"
                :value="preset.value"
            >
                {{ preset.label }}
            </option>
        </select>
    </label>
</template>

<style scoped>
.theme-preset-switcher {
    display: inline-flex;
    align-items: center;
    gap: var(--caomei-space-2, 8px);
    margin-left: var(--caomei-space-3, 12px);
    font-size: 12px;
}

.theme-preset-switcher__label {
    color: var(--vp-c-text-2, inherit);
    white-space: nowrap;
}

.theme-preset-switcher select {
    padding: 2px 6px;
    border: 1px solid var(--caomei-color-border, #e5e7eb);
    border-radius: var(--caomei-radius-sm, 4px);
    background: var(--caomei-color-bg-elevated, transparent);
    color: inherit;
    font: inherit;
    cursor: pointer;
}
</style>
