<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiFloatLabel } from '@/components/float-label'
import { CaomeiSelect, type SelectOption } from '@/components/select'

const options: SelectOption[] = [
    { label: '全部', value: 'all' },
    { label: '已发布', value: 'published' },
    { label: '草稿', value: 'draft' },
]

const status = ref('')
</script>

<template>
    <div class="demo-stack">
        <CaomeiFloatLabel>
            <CaomeiSelect
                id="float-select"
                v-model="status"
                :options="options"
            />
            <label for="float-select">状态</label>
        </CaomeiFloatLabel>
    </div>
</template>

<style scoped>
.demo-stack {
    max-width: 320px;
}
</style>
