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
    { component: Check, name: 'Check', label: '完成' },
    { component: X, name: 'X', label: '关闭' },
    { component: Plus, name: 'Plus', label: '新增' },
    { component: Minus, name: 'Minus', label: '移除' },
    { component: Search, name: 'Search', label: '搜索' },
    { component: Settings, name: 'Settings', label: '设置' },
    { component: Calendar, name: 'Calendar', label: '日期' },
    { component: Star, name: 'Star', label: '收藏' },
    { component: Eye, name: 'Eye', label: '显示' },
    { component: EyeOff, name: 'EyeOff', label: '隐藏' },
    { component: Info, name: 'Info', label: '信息' },
    { component: CircleCheck, name: 'CircleCheck', label: '成功' },
    { component: CircleAlert, name: 'CircleAlert', label: '警告' },
    { component: CircleX, name: 'CircleX', label: '错误' },
    { component: TriangleAlert, name: 'TriangleAlert', label: '风险' },
    { component: LoaderCircle, name: 'LoaderCircle', label: '加载中' },
    { component: FileUp, name: 'FileUp', label: '上传' },
    { component: ImageOff, name: 'ImageOff', label: '图片失效' },
    { component: Copy, name: 'Copy', label: '复制' },
    { component: Trash2, name: 'Trash2', label: '删除' },
    { component: Bold, name: 'Bold', label: '加粗' },
    { component: Sparkles, name: 'Sparkles', label: 'AI 生成' },
    { component: ChevronDown, name: 'ChevronDown', label: '展开' },
    { component: ChevronsLeft, name: 'ChevronsLeft', label: '首页' },
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
