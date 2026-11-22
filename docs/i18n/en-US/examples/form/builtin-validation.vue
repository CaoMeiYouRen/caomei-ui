<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiButton } from '@/components/button'
import { CaomeiForm, CaomeiFormItem } from '@/components/form'
import { CaomeiInput } from '@/components/input'

const name = ref('')
const password = ref('')
const confirm = ref('')
const email = ref('')
const errors = ref<Record<string, string>>({})
const message = ref('')

function validateName(value: unknown): string {
    return String(value ?? '').trim() ? '' : 'Name is required'
}

function validateConfirm(value: unknown, values: Record<string, unknown>): string {
    if (!value) {
        return 'Please confirm the password'
    }
    return String(value) === String(values.password ?? '') ? '' : 'The two passwords do not match'
}

function onSubmit(): void {
    message.value = 'Validated and submitted'
    // Simulates a server response: the error yields as soon as the field changes again
    errors.value = { email: 'This email is already taken (from the server)' }
}
</script>

<template>
    <div class="demo-column">
        <CaomeiForm
            :errors="errors"
            @submit="onSubmit"
        >
            <CaomeiFormItem
                label="Name"
                name="name"
                hint="Required; validated on submit"
                :model-value="name"
                :validate="validateName"
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
                label="Password"
                name="password"
                :model-value="password"
            >
                <template #default="{id, name: fieldName, invalid, ...aria}">
                    <CaomeiInput
                        :id="id"
                        v-model="password"
                        type="password"
                        :name="fieldName"
                        :invalid="invalid"
                        v-bind="aria"
                    />
                </template>
            </CaomeiFormItem>
            <CaomeiFormItem
                label="Confirm password"
                name="confirm"
                hint="Custom validation against another field"
                :model-value="confirm"
                :validate="validateConfirm"
            >
                <template #default="{id, name: fieldName, invalid, ...aria}">
                    <CaomeiInput
                        :id="id"
                        v-model="confirm"
                        type="password"
                        :name="fieldName"
                        :invalid="invalid"
                        v-bind="aria"
                    />
                </template>
            </CaomeiFormItem>
            <CaomeiFormItem
                label="Email"
                name="email"
                hint="The server fills this in on submit; typing again clears it"
                :model-value="email"
            >
                <template #default="{id, name: fieldName, invalid, ...aria}">
                    <CaomeiInput
                        :id="id"
                        v-model="email"
                        :name="fieldName"
                        :invalid="invalid"
                        v-bind="aria"
                    />
                </template>
            </CaomeiFormItem>
            <CaomeiButton type="submit">
                Submit
            </CaomeiButton>
        </CaomeiForm>
        <p v-if="message">
            {{ message }}
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
</style>
