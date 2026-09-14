<script setup lang="ts">
import { CircleCheck, CircleDashed } from '@lucide/vue'
import { ref } from 'vue'
import { CaomeiSelect } from '@/components/select'
import { CaomeiIcon } from '@/icons'

interface Status {
    id: number
    name: string
    done: boolean
}

const value = ref<number | null>(2)

const statuses: Status[] = [
    { id: 1, name: 'Draft', done: false },
    { id: 2, name: 'Published', done: true },
    { id: 3, name: 'Archived', done: false },
]
</script>

<template>
    <div class="demo-column">
        <CaomeiSelect
            v-model="value"
            :options="statuses"
            option-label="name"
            option-value="id"
            placeholder="Select a status"
        >
            <template #option="slotProps">
                <span class="demo-option">
                    <CaomeiIcon :icon="slotProps.option.done ? CircleCheck : CircleDashed" />
                    {{ slotProps.option.name }}
                </span>
            </template>
        </CaomeiSelect>
        <p class="demo-value">
            Value: {{ value ?? '(empty)' }}
        </p>
    </div>
</template>

<style scoped>
.demo-column {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
}

.demo-option {
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.demo-value {
    margin: 0;
    font-size: 13px;
    color: var(--vp-c-text-2);
}
</style>
