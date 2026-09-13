<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiSlider } from '@/components/slider'

const price = ref([20, 80])
</script>

<template>
    <div class="demo-col">
        <CaomeiSlider
            v-model="price"
            :thumb-labels="['最低价', '最高价']"
        />
        <p class="demo-state">
            价格区间:{{ price[0] }} ~ {{ price[1] }}
        </p>
    </div>
</template>

<style scoped>
.demo-col {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-width: 320px;
}

.demo-state {
    margin: 0;
    color: var(--caomei-color-text-muted);
    font-size: 14px;
}
</style>
