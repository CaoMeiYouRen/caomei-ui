<script setup lang="ts">
import { CaomeiCard } from '@/components/card'
import { CaomeiDataView } from '@/components/data-view'

interface ThemeConfig {
    id: number
    name: string
    description: string
}

const themes: ThemeConfig[] = [
    { id: 1, name: '默认主题', description: '内置的浅色主题，适合日间阅读' },
    { id: 2, name: '暗色主题', description: '深色界面，夜间使用更舒适' },
    { id: 3, name: '护眼主题', description: '低饱和度的米色配色' },
]
</script>

<template>
    <CaomeiDataView
        :value="themes"
        layout="grid"
    >
        <template #grid="{items}">
            <div class="demo-grid">
                <CaomeiCard
                    v-for="item in items"
                    :key="item.id"
                    variant="outlined"
                >
                    <template #title>
                        {{ item.name }}
                    </template>
                    {{ item.description }}
                </CaomeiCard>
            </div>
        </template>
    </CaomeiDataView>
</template>

<style scoped>
/*
  网格列数由内容层自行定义：数据视图只负责状态与布局插槽，
  不干预卡片内部结构，因此可在窄屏收敛为单列。
*/
.demo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
}
</style>
