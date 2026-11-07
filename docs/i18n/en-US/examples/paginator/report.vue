<script setup lang="ts">
import { computed, ref } from 'vue'
import { CaomeiPaginator } from '@/components/paginator'

const page = ref(3)
const itemsPerPage = ref(10)
const total = 96

const first = computed(() => (page.value - 1) * itemsPerPage.value + 1)
const last = computed(() => Math.min(page.value * itemsPerPage.value, total))
</script>

<template>
    <div class="demo-column">
        <p class="demo-value">
            {{ first }} to {{ last }} of {{ total }} records
        </p>
        <CaomeiPaginator
            v-model:page="page"
            v-model:items-per-page="itemsPerPage"
            :total="total"
            :rows-per-page-options="[10, 20, 50]"
        />
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
