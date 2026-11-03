<script setup lang="ts">
import { computed, ref } from 'vue'
import { CaomeiButton } from '@/components/button'
import { CaomeiForm, CaomeiFormItem } from '@/components/form'
import { CaomeiInput } from '@/components/input'

const name = ref('')
const submitted = ref(false)
const error = computed(() => (submitted.value && !name.value.trim() ? '名称不能为空' : ''))

function onSubmit(): void {
    submitted.value = true
}
</script>

<template>
    <div class="demo-column">
        <CaomeiForm @submit="onSubmit">
            <CaomeiFormItem
                label="名称"
                name="name"
                hint="提交后校验；该字段为必填"
                :error="error"
                required
            >
                <template #default="{id, name: fieldName, invalid, ...aria}">
                    <CaomeiInput
                        :id="id"
                        v-model="name"
                        :name="fieldName"
                        :invalid="invalid"
                        placeholder="请输入名称"
                        v-bind="aria"
                    />
                </template>
            </CaomeiFormItem>
            <CaomeiButton type="submit">
                提交
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
