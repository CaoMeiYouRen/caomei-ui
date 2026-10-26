<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiSelect } from '@/components/select'

const value = ref<string>()
const empty = ref<string>()

const options = [
    { label: '苹果', value: 'apple' },
    { label: '香蕉', value: 'banana' },
    { label: '樱桃（库存不足）', value: 'cherry', disabled: true },
]
</script>

<template>
    <div class="demo-column">
        <CaomeiSelect
            v-model="value"
            label="水果（禁用）"
            :options="options"
            disabled
            placeholder="禁用"
        />
        <CaomeiSelect
            v-model="empty"
            label="水果（校验失败）"
            :options="options"
            invalid
            placeholder="校验失败"
        />
        <CaomeiSelect
            v-model="value"
            label="水果（含禁用选项）"
            :options="options"
            placeholder="含禁用选项"
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
</style>
