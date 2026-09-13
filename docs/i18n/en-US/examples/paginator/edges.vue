<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiPaginator } from '@/components/paginator'

const page = ref(6)
</script>

<template>
    <div class="demo-col">
        <CaomeiPaginator
            v-model:page="page"
            :total="200"
            :items-per-page="10"
            :sibling-count="2"
            show-edges
        />
        <p class="demo-state">
            Current page: {{ page }} of 20
        </p>
    </div>
</template>

<style scoped>
.demo-col {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.demo-state {
    margin: 0;
    color: var(--caomei-color-text-muted);
    font-size: 14px;
}
</style>
