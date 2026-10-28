<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiSelect } from '@/components/select'

const value = ref<string>()
const empty = ref<string>()

const options = [
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
    { label: 'Cherry (out of stock)', value: 'cherry', disabled: true },
]
</script>

<template>
    <div class="demo-column">
        <CaomeiSelect
            v-model="value"
            label="Fruit (disabled)"
            :options="options"
            disabled
            placeholder="Disabled"
        />
        <CaomeiSelect
            v-model="empty"
            label="Fruit (invalid)"
            :options="options"
            invalid
            placeholder="Invalid"
        />
        <CaomeiSelect
            v-model="value"
            label="Fruit (with disabled option)"
            :options="options"
            placeholder="With a disabled option"
        />
    </div>
</template>

<style scoped>
.demo-column {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
}
</style>
