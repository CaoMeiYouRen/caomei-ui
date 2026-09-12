<script setup lang="ts">
import { CaomeiPaginator } from '@/components/paginator'
</script>

<template>
    <div class="demo-col">
        <CaomeiPaginator :total="0" />
        <CaomeiPaginator
            :total="100"
            :items-per-page="10"
            disabled
        />
    </div>
</template>

<style scoped>
.demo-col {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
}
</style>
