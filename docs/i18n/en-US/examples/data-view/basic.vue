<script setup lang="ts">
import { CaomeiCard } from '@/components/card'
import { CaomeiDataView } from '@/components/data-view'

interface ThemeConfig {
    id: number
    name: string
    description: string
}

const themes: ThemeConfig[] = [
    { id: 1, name: 'Default', description: 'Built-in light theme for daytime reading' },
    { id: 2, name: 'Dark', description: 'Dark surfaces, easier on the eyes at night' },
    { id: 3, name: 'Sepia', description: 'Low-saturation warm palette' },
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
  The grid columns are defined by the content layer: the data view only owns state and
  layout slots, so the card structure stays untouched and can collapse to one column on narrow screens.
*/
.demo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
}
</style>
