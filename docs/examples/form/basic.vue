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
    { label: '苹果', value: 'apple' },
    { label: '香蕉', value: 'banana' },
]

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
                hint="用于展示的显示名"
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
                label="水果"
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
                label="通知"
                name="notify"
                hint="Switch 没有校验状态通道"
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
                提交
            </CaomeiButton>
        </CaomeiForm>
        <p class="demo-value">
            提交状态：{{ submitted ? '已提交' : '未提交' }}
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
