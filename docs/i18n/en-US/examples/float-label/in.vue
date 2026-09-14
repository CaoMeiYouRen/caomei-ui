<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiFloatLabel } from '@/components/float-label'
import { CaomeiInput } from '@/components/input'
import { CaomeiMultiSelect } from '@/components/multi-select'
import { CaomeiSelect, type SelectOption } from '@/components/select'

const options: SelectOption[] = [
    { label: 'All', value: 'all' },
    { label: 'Published', value: 'published' },
    { label: 'Draft', value: 'draft' },
]

const name = ref('CaoMei UI')
const status = ref('published')
const tags = ref(['all', 'draft'])
</script>

<template>
    <div class="demo-stack">
        <CaomeiFloatLabel variant="in">
            <CaomeiInput id="float-in-input" v-model="name" />
            <label for="float-in-input">Name</label>
        </CaomeiFloatLabel>
        <CaomeiFloatLabel variant="in">
            <CaomeiSelect
                id="float-in-select"
                v-model="status"
                :options="options"
            />
            <label for="float-in-select">Status</label>
        </CaomeiFloatLabel>
        <CaomeiFloatLabel variant="in">
            <CaomeiMultiSelect
                id="float-in-multi"
                v-model="tags"
                :options="options"
            />
            <label for="float-in-multi">Tags</label>
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
