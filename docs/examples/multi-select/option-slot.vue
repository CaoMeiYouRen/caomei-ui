<script setup lang="ts">
import { CircleCheck, CircleDashed } from '@lucide/vue'
import { ref } from 'vue'
import { CaomeiMultiSelect } from '@/components/multi-select'
import { CaomeiIcon } from '@/icons'

interface Status {
    id: number
    name: string
    done: boolean
}

const value = ref<number[]>([2])

const statuses: Status[] = [
    { id: 1, name: '草稿', done: false },
    { id: 2, name: '已发布', done: true },
    { id: 3, name: '已下线', done: false },
]
</script>

<template>
    <div class="demo-column">
        <CaomeiMultiSelect
            v-model="value"
            :options="statuses"
            option-label="name"
            option-value="id"
            placeholder="请选择状态"
        >
            <template #option="slotProps">
                <span class="demo-option">
                    <CaomeiIcon :icon="slotProps.option.done ? CircleCheck : CircleDashed" />
                    {{ slotProps.option.name }}
                </span>
            </template>
        </CaomeiMultiSelect>
        <p class="demo-value">
            当前值：{{ value.length > 0 ? value.join('、') : '（空）' }}
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
