<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiButton } from '@/components/button'
import { CaomeiInputGroup } from '@/components/input-group'
import { CaomeiSelect, type SelectOption } from '@/components/select'

const options: SelectOption[] = [
    { label: 'All', value: 'all' },
    { label: 'Published', value: 'published' },
    { label: 'Draft', value: 'draft' },
]

const status = ref('')
</script>

<template>
    <CaomeiInputGroup>
        <CaomeiSelect
            v-model="status"
            :options="options"
            placeholder="Filter by status"
        />
        <CaomeiButton variant="secondary">
            Apply
        </CaomeiButton>
    </CaomeiInputGroup>
</template>
