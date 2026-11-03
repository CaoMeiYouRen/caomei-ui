<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiButton } from '@/components/button'
import { CaomeiInput } from '@/components/input'
import { CaomeiSelect } from '@/components/select'

const keyword = ref('')
const selected = ref<string | null>('caomei')
const options = [
    { label: '草梅预设', value: 'caomei' },
    { label: '墨色预设', value: 'ink' },
]
</script>

<template>
    <div
        class="demo-row density-demo"
        data-density="touch"
    >
        <CaomeiButton>保存</CaomeiButton>
        <CaomeiInput v-model="keyword" placeholder="搜索关键词" />
        <CaomeiSelect
            v-model="selected"
            :options="options"
            label="主题预设"
        />
    </div>
</template>

<style scoped>
.density-demo {
    padding: var(--caomei-space-4);
    border: 1px dashed var(--caomei-color-border);
    border-radius: var(--caomei-radius-md);
}

.density-demo > * {
    max-width: 100%;
}
</style>
