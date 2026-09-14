<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiFloatLabel } from '@/components/float-label'
import { CaomeiSelect, type SelectOption } from '@/components/select'

const options: SelectOption[] = [
    { label: 'All', value: 'all' },
    { label: 'Published', value: 'published' },
    { label: 'Draft', value: 'draft' },
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
            <label for="float-select">Status</label>
        </CaomeiFloatLabel>
    </div>
</template>

<style scoped>
.demo-stack {
    max-width: 320px;
}
</style>
