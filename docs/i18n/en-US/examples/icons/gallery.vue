<script setup lang="ts">
import type { Component } from 'vue'
import {
    Bold,
    Calendar,
    Check,
    ChevronDown,
    ChevronsLeft,
    CircleAlert,
    CircleCheck,
    CircleX,
    Copy,
    Eye,
    EyeOff,
    FileUp,
    ImageOff,
    Info,
    LoaderCircle,
    Minus,
    Plus,
    Search,
    Settings,
    Sparkles,
    Star,
    Trash2,
    TriangleAlert,
    X,
} from '@lucide/vue'
import { CaomeiIcon } from '@/icons'

const icons: { component: Component, name: string, label: string }[] = [
    { component: Check, name: 'Check', label: 'Done' },
    { component: X, name: 'X', label: 'Close' },
    { component: Plus, name: 'Plus', label: 'Add' },
    { component: Minus, name: 'Minus', label: 'Remove' },
    { component: Search, name: 'Search', label: 'Search' },
    { component: Settings, name: 'Settings', label: 'Settings' },
    { component: Calendar, name: 'Calendar', label: 'Date' },
    { component: Star, name: 'Star', label: 'Favorite' },
    { component: Eye, name: 'Eye', label: 'Show' },
    { component: EyeOff, name: 'EyeOff', label: 'Hide' },
    { component: Info, name: 'Info', label: 'Info' },
    { component: CircleCheck, name: 'CircleCheck', label: 'Success' },
    { component: CircleAlert, name: 'CircleAlert', label: 'Warning' },
    { component: CircleX, name: 'CircleX', label: 'Error' },
    { component: TriangleAlert, name: 'TriangleAlert', label: 'Risk' },
    { component: LoaderCircle, name: 'LoaderCircle', label: 'Loading' },
    { component: FileUp, name: 'FileUp', label: 'Upload' },
    { component: ImageOff, name: 'ImageOff', label: 'Broken image' },
    { component: Copy, name: 'Copy', label: 'Copy' },
    { component: Trash2, name: 'Trash2', label: 'Delete' },
    { component: Bold, name: 'Bold', label: 'Bold' },
    { component: Sparkles, name: 'Sparkles', label: 'AI' },
    { component: ChevronDown, name: 'ChevronDown', label: 'Expand' },
    { component: ChevronsLeft, name: 'ChevronsLeft', label: 'First page' },
]
</script>

<template>
    <ul class="demo-grid">
        <li
            v-for="item in icons"
            :key="item.name"
            class="demo-grid__item"
        >
            <CaomeiIcon :icon="item.component" class="demo-grid__icon" />
            <span class="demo-grid__name">{{ item.name }}</span>
            <span class="demo-grid__label">{{ item.label }}</span>
        </li>
    </ul>
</template>

<style scoped>
.demo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(112px, 1fr));
    gap: 8px;
    margin: 0;
    padding: 0;
    list-style: none;
}

.demo-grid__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 12px 8px;
    border: 1px solid var(--vp-c-divider);
    border-radius: 8px;

    /* 文档站会给正文列表项加 `li + li` 外边距，网格内会表现为卡片高度参差 */
    margin: 0;
}

.demo-grid__icon {
    font-size: 20px;
}

.demo-grid__name {
    color: var(--vp-c-text-1);
    font-family: var(--vp-font-family-mono);
    font-size: 12px;
}

.demo-grid__label {
    color: var(--vp-c-text-2);
    font-size: 12px;
}
</style>
