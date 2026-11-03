<script setup lang="ts">
import { computed, ref } from 'vue'
import { CaomeiButton } from '@/components/button'
import { CaomeiForm, CaomeiFormItem } from '@/components/form'
import { CaomeiInput } from '@/components/input'

const name = ref('')
const submitted = ref(false)
const error = computed(() => (submitted.value && !name.value.trim() ? 'Name is required' : ''))

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
                hint="Validated on submit; this field is required"
                :error="error"
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
            <CaomeiButton type="submit">
                Submit
            </CaomeiButton>
        </CaomeiForm>
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
</style>
