<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiButton } from '@/components/button'
import { CaomeiInputGroup } from '@/components/input-group'
import { CaomeiSelect, type SelectOption } from '@/components/select'

const options: SelectOption[] = [
    { label: '全部', value: 'all' },
    { label: '已发布', value: 'published' },
    { label: '草稿', value: 'draft' },
]

const status = ref('')
</script>

<template>
    <CaomeiInputGroup>
        <CaomeiSelect
            v-model="status"
            :options="options"
            placeholder="筛选状态"
        />
        <CaomeiButton variant="secondary">
            应用
        </CaomeiButton>
    </CaomeiInputGroup>
</template>
