<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiFloatLabel } from '@/components/float-label'
import { CaomeiInput } from '@/components/input'
import { CaomeiMultiSelect } from '@/components/multi-select'
import { CaomeiSelect, type SelectOption } from '@/components/select'

const options: SelectOption[] = [
    { label: '全部', value: 'all' },
    { label: '已发布', value: 'published' },
    { label: '草稿', value: 'draft' },
]

const name = ref('草梅 UI')
const status = ref('published')
const tags = ref(['all', 'draft'])
</script>

<template>
    <div class="demo-stack">
        <CaomeiFloatLabel variant="in">
            <CaomeiInput id="float-in-input" v-model="name" />
            <label for="float-in-input">名称</label>
        </CaomeiFloatLabel>
        <CaomeiFloatLabel variant="in">
            <CaomeiSelect
                id="float-in-select"
                v-model="status"
                :options="options"
            />
            <label for="float-in-select">状态</label>
        </CaomeiFloatLabel>
        <CaomeiFloatLabel variant="in">
            <CaomeiMultiSelect
                id="float-in-multi"
                v-model="tags"
                :options="options"
            />
            <label for="float-in-multi">标签</label>
        </CaomeiFloatLabel>
    </div>
</template>

<style scoped>
.demo-stack {
    display: grid;
    gap: 16px;
    max-width: 320px;
}
</style>
