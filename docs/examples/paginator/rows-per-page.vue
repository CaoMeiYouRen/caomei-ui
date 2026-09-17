<script setup lang="ts">
import { computed, ref } from 'vue'
import { CaomeiPaginator } from '@/components/paginator'

const page = ref(1)
const itemsPerPage = ref(10)
const total = 96

const rangeText = computed(() => {
    const start = (page.value - 1) * itemsPerPage.value + 1
    const end = Math.min(page.value * itemsPerPage.value, total)
    return `${start}–${end} / ${total}`
})
</script>

<template>
    <div class="demo-column">
        <CaomeiPaginator
            v-model:page="page"
            v-model:items-per-page="itemsPerPage"
            :total="total"
            :rows-per-page-options="[10, 20, 50]"
        />
        <p class="demo-value">
            当前显示：{{ rangeText }}
        </p>
    </div>
</template>

<style scoped>
.demo-column {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
}

.demo-value {
    margin: 0;
    font-size: 13px;
    color: var(--vp-c-text-2);
}
</style>
