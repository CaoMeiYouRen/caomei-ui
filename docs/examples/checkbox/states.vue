<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiCheckbox } from '@/components/checkbox'

const indeterminate = ref<boolean | 'indeterminate'>('indeterminate')
</script>

<template>
    <div class="demo-col">
        <CaomeiCheckbox :model-value="true" text="选中" />
        <CaomeiCheckbox :model-value="false" text="未选中" />
        <CaomeiCheckbox v-model="indeterminate" text="半选（indeterminate，点击后选中）" />
        <CaomeiCheckbox
            :model-value="true"
            disabled
            text="禁用 · 选中"
        />
        <CaomeiCheckbox
            :model-value="false"
            disabled
            text="禁用 · 未选中"
        />
        <CaomeiCheckbox
            :model-value="false"
            invalid
            text="校验失败"
        />
    </div>
</template>

<style scoped>
.demo-col {
    display: flex;
    flex-direction: column;
    gap: 12px;
}
</style>
