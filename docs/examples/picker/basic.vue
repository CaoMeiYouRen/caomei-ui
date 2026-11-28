<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiPicker } from '@/components/picker'
import type { PickerColumn } from '@/components/picker'

const provinceColumn: PickerColumn = {
    label: '省份',
    options: [
        { label: '浙江', value: 'zj' },
        { label: '江苏', value: 'js' },
        { label: '广东', value: 'gd' },
    ],
}

const value = ref<(string | number)[]>(['zj'])
</script>

<template>
    <div class="picker-demo">
        <CaomeiPicker
            v-model="value"
            :columns="[provinceColumn]"
            label="选择省份"
        />
        <p class="picker-demo__hint">
            当前值：{{ value[0] ?? '未选择' }}
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
