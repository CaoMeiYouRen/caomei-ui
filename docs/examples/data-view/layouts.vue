<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiDataView } from '@/components/data-view'
import type { DataViewLayout } from '@/components/data-view'
import { CaomeiSelectButton } from '@/components/select-button'
import type { SelectButtonModelValue } from '@/components/select-button'

interface Article {
    id: number
    title: string
    summary: string
}

const layout = ref<DataViewLayout>('list')

const layoutOptions = [
    { label: '列表', value: 'list' },
    { label: '网格', value: 'grid' },
]

const articles: Article[] = [
    { id: 1, title: '组件库发布说明', summary: '首个版本的能力范围与已知差异。' },
    { id: 2, title: '主题定制指南', summary: '通过 CSS variables 覆盖默认外观。' },
    { id: 3, title: '迁移映射', summary: '从 PrimeVue 迁移时的字段对应关系。' },
]

function setLayout(value: SelectButtonModelValue | undefined): void {
    if (value === 'list' || value === 'grid') {
        layout.value = value
    }
}
</script>

<template>
    <CaomeiDataView
        :value="articles"
        :layout="layout"
    >
        <template #header>
            <div class="demo-header">
                <span>文章列表</span>
                <CaomeiSelectButton
                    :model-value="layout"
                    :options="layoutOptions"
                    label="布局切换"
                    size="sm"
                    @update:model-value="setLayout"
                />
            </div>
        </template>

        <template #list="{items}">
            <ul class="demo-list">
                <li
                    v-for="item in items"
                    :key="item.id"
                >
                    <strong>{{ item.title }}</strong>
                    <span>{{ item.summary }}</span>
                </li>
            </ul>
        </template>

        <template #grid="{items}">
            <div class="demo-grid">
                <div
                    v-for="item in items"
                    :key="item.id"
                    class="demo-grid-item"
                >
                    <strong>{{ item.title }}</strong>
                    <span>{{ item.summary }}</span>
                </div>
            </div>
        </template>
    </CaomeiDataView>
</template>

<style scoped>
.demo-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}

.demo-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 0;
    padding: 0;
    list-style: none;
}

.demo-list li {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin: 0;
    padding: 10px 12px;
    border: 1px solid var(--caomei-color-border);
    border-radius: var(--caomei-radius-md);
}

.demo-list span,
.demo-grid-item span {
    color: var(--vp-c-text-2);
    font-size: 13px;
}

.demo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
}

.demo-grid-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 12px;
    border: 1px solid var(--caomei-color-border);
    border-radius: var(--caomei-radius-md);
}
</style>
