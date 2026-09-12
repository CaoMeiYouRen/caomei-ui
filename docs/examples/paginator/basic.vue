<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiPaginator } from '@/components/paginator'

const page = ref(1)
</script>

<template>
    <div class="demo-col">
        <CaomeiPaginator
            v-model:page="page"
            :total="100"
            :items-per-page="10"
        />
        <p class="demo-state">
            当前第 {{ page }} 页
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
