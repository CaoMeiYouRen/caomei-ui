<script setup lang="ts">
import { AlignCenter, AlignLeft, AlignRight } from '@lucide/vue'
import { ref } from 'vue'
import { CaomeiSelectButton } from '@/components/select-button'
import { CaomeiIcon } from '@/icons'

const align = ref<string | number>('center')

const options = [
    { label: 'Left', value: 'left' },
    { label: 'Center', value: 'center' },
    { label: 'Right', value: 'right' },
]

const icons = {
    left: AlignLeft,
    center: AlignCenter,
    right: AlignRight,
} as const

function iconFor(value: string | number) {
    return icons[value as keyof typeof icons]
}
</script>

<template>
    <CaomeiSelectButton
        v-model="align"
        :options="options"
        label="Text alignment"
    >
        <template #option="slotProps">
            <CaomeiIcon :icon="iconFor(slotProps.option.value)" />
            {{ slotProps.option.label }}
        </template>
    </CaomeiSelectButton>
</template>
