<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiPicker } from '@/components/picker'
import type { PickerColumn } from '@/components/picker'

const columns: PickerColumn[] = [
    {
        label: '省份',
        options: [
            { label: '浙江', value: 'zj' },
            { label: '江苏', value: 'js' },
        ],
    },
    {
        label: '城市',
        options: [
            { label: '杭州', value: 'hz' },
            { label: '南京', value: 'nj' },
            { label: '苏州', value: 'sz' },
        ],
    },
]

const value = ref<(string | number)[]>(['zj', 'hz'])
</script>

<template>
    <div class="picker-demo">
        <CaomeiPicker
            v-model="value"
            :columns="columns"
            loop
            label="选择地区"
        />
        <p class="picker-demo__hint">
            当前值：{{ value.join(' / ') }}
        </p>
    </div>
</template>

<style scoped>
.picker-demo {
    display: flex;
    flex-direction: column;
    gap: var(--caomei-space-2);
    align-items: flex-start;
}

.picker-demo__hint {
    margin: 0;
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-sm);
}
</style>
