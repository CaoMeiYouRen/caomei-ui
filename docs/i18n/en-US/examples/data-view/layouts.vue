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
    { label: 'List', value: 'list' },
    { label: 'Grid', value: 'grid' },
]

const articles: Article[] = [
    { id: 1, title: 'Release notes', summary: 'Scope of the first version and known differences.' },
    { id: 2, title: 'Theming guide', summary: 'Override the default look through CSS variables.' },
    { id: 3, title: 'Migration mapping', summary: 'Field mapping when migrating from PrimeVue.' },
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
                <span>Articles</span>
                <CaomeiSelectButton
                    :model-value="layout"
                    :options="layoutOptions"
                    label="Layout switch"
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
