<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiPaginator } from '@/components/paginator'

const page = ref(3)
const itemsPerPage = ref(10)
const total = 96
</script>

<template>
    <div class="demo-column">
        <CaomeiPaginator
            v-model:page="page"
            v-model:items-per-page="itemsPerPage"
            :total="total"
            :rows-per-page-options="[10, 20, 50]"
        >
            <template #report="{page: currentPage, pages, total: totalCount}">
                <span class="demo-value">
                    {{ (currentPage - 1) * itemsPerPage + 1 }} 到
                    {{ Math.min(currentPage * itemsPerPage, totalCount) }} 共 {{ totalCount }} 条（{{ currentPage }}/{{ pages }} 页）
                </span>
            </template>
        </CaomeiPaginator>
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
