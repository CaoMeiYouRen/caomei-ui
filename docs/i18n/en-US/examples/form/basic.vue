<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiButton } from '@/components/button'
import { CaomeiForm, CaomeiFormItem } from '@/components/form'
import { CaomeiInput } from '@/components/input'
import { CaomeiSelect } from '@/components/select'
import { CaomeiSwitch } from '@/components/switch'

const name = ref('')
const fruit = ref<string>('apple')
const notify = ref(true)
const submitted = ref(false)

const options = [
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
]

function onSubmit(): void {
    submitted.value = true
}
</script>

<template>
    <div class="demo-column">
        <CaomeiForm @submit="onSubmit">
            <CaomeiFormItem
                label="Name"
                name="name"
                hint="Display name"
                required
            >
                <template #default="{id, name: fieldName, invalid, ...aria}">
                    <CaomeiInput
                        :id="id"
                        v-model="name"
                        :name="fieldName"
                        :invalid="invalid"
                        placeholder="Enter a name"
                        v-bind="aria"
                    />
                </template>
            </CaomeiFormItem>
            <CaomeiFormItem
                label="Fruit"
                name="fruit"
            >
                <template #default="{id, name: fieldName, invalid, ...aria}">
                    <CaomeiSelect
                        :id="id"
                        v-model="fruit"
                        :name="fieldName"
                        :invalid="invalid"
                        :options="options"
                        v-bind="aria"
                    />
                </template>
            </CaomeiFormItem>
            <CaomeiFormItem
                label="Notify"
                name="notify"
                hint="Switch has no validation-state channel"
            >
                <template #default="{id, name: fieldName, ...aria}">
                    <CaomeiSwitch
                        :id="id"
                        v-model="notify"
                        :name="fieldName"
                        v-bind="aria"
                    />
                </template>
            </CaomeiFormItem>
            <CaomeiButton type="submit">
                Submit
            </CaomeiButton>
        </CaomeiForm>
        <p class="demo-value">
            Submit state: {{ submitted ? 'submitted' : 'not submitted' }}
        </p>
    </div>
</template>

<style scoped>
.demo-column {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
    max-width: 320px;
}

.demo-value {
    margin: 0;
    font-size: 13px;
    color: var(--vp-c-text-2);
}
</style>
