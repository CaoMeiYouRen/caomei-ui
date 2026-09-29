<script setup lang="ts">
import { useData } from 'vitepress'
import { computed, onMounted, ref } from 'vue'

/** 预设列表：`minimal` 为缺省预设——未指定 `data-preset` 时即它，显式设置与缺省渲染一致。 */
const presets = [
    { value: 'minimal', label: 'minimal' },
    { value: 'caomei', label: 'caomei' },
    { value: 'momei', label: 'momei' },
] as const

const { lang } = useData()

/**
 * 控件文案：窄档（<960px）会隐藏可见标签，故必须同时提供 `aria-label`，
 * 否则该 `<select>` 在窄档失去可访问名（文案中英各一，与站点语言一致）。
 */
const controlLabel = computed(() => (lang.value === 'en-US' ? 'Theme preset' : '主题预设'))

const STORAGE_KEY = 'caomei-docs-preset'
const DEFAULT_PRESET = 'minimal'
const VALID_PRESETS: Set<string> = new Set<string>(presets.map((preset) => preset.value))
const current = ref(DEFAULT_PRESET)

function apply(value: string): void {
    // 空值（旧存储 / 未知值）归一到缺省预设；设置 `data-preset="minimal"` 与不设置渲染一致。
    const safe = VALID_PRESETS.has(value) ? value : DEFAULT_PRESET
    current.value = safe
    document.documentElement.dataset.preset = safe
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
        <span class="theme-preset-switcher__label">{{ controlLabel }}</span>
        <select
            :value="current"
            :aria-label="controlLabel"
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

/* 窄档（<960px）收敛：隐藏标签并收紧左边距，避免导航栏在 768–959px 档横向溢出 */
@media (max-width: 959px) {
    .theme-preset-switcher {
        margin-left: 4px;
    }

    .theme-preset-switcher__label {
        display: none;
    }
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
