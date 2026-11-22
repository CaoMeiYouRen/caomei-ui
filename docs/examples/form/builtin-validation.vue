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
    const text = typeof value === 'string' ? value.trim() : ''
    return text ? '' : '名称不能为空'
}

function validateConfirm(value: unknown, values: Record<string, unknown>): string {
    const text = typeof value === 'string' ? value : ''
    if (!text) {
        return '请再次输入密码'
    }
    const expected = typeof values.password === 'string' ? values.password : ''
    return text === expected ? '' : '两次输入的密码不一致'
}

function onSubmit(): void {
    message.value = '校验通过，已提交'
    // 模拟服务端回填：字段值再次变化时该错误会自动让位
    errors.value = { email: '该邮箱已被占用（服务端返回）' }
}
</script>

<template>
    <div class="demo-column">
        <CaomeiForm
            :errors="errors"
            @submit="onSubmit"
        >
            <CaomeiFormItem
                label="名称"
                name="name"
                hint="必填：提交时才校验"
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
                        placeholder="请输入名称"
                        v-bind="aria"
                    />
                </template>
            </CaomeiFormItem>
            <CaomeiFormItem
                label="密码"
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
                label="确认密码"
                name="confirm"
                hint="自定义校验：与其他字段比较"
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
                label="邮箱"
                name="email"
                hint="提交后由服务端回填错误；再次输入即自动清除"
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
                提交
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
