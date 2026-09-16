<script setup lang="ts">
import { AlignCenter, AlignLeft, AlignRight } from '@lucide/vue'
import { ref } from 'vue'
import { CaomeiSelectButton } from '@/components/select-button'
import { CaomeiIcon } from '@/icons'

const align = ref<string | number>('center')

const options = [
    { label: '左对齐', value: 'left' },
    { label: '居中', value: 'center' },
    { label: '右对齐', value: 'right' },
]

const icons = {
    left: AlignLeft,
    center: AlignCenter,
    right: AlignRight,
} as const

function iconFor(value: string | number): (typeof icons)[keyof typeof icons] {
    return icons[value as keyof typeof icons]
}
</script>

<template>
    <CaomeiSelectButton
        v-model="align"
        :options="options"
        label="文本对齐"
    >
        <template #option="slotProps">
            <CaomeiIcon :icon="iconFor(slotProps.option.value)" />
            {{ slotProps.option.label }}
        </template>
    </CaomeiSelectButton>
</template>
