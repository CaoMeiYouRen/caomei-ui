<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiTreeSelect } from '@/components/tree-select'

const items = [
    {
        id: 'form',
        label: '表单',
        children: [
            { id: 'checkbox', label: 'Checkbox 复选框' },
            { id: 'select', label: 'Select 选择器' },
        ],
    },
    {
        id: 'feedback',
        label: '反馈',
        children: [
            { id: 'message', label: 'Message 消息' },
            { id: 'toast', label: 'Toast 轻提示' },
        ],
    },
]

const value = ref<string[]>(['select', 'message'])
</script>

<template>
    <div class="demo-section">
        <p class="demo-hint">
            多选：面板不因选中而关闭，可连续勾选；已选标签按顺序以逗号拼接并单行截断。
        </p>
        <CaomeiTreeSelect
            v-model="value"
            multiple
            clearable
            label="组件范围"
            placeholder="请选择组件"
            :items="items"
        />
        <p class="demo-hint">
            已选 {{ value.length }} 项
        </p>

        <div class="demo-narrow">
            <CaomeiTreeSelect
                v-model="value"
                multiple
                label="窄屏容器"
                placeholder="请选择组件"
                :items="items"
            />
        </div>
    </div>
</template>

<style scoped>
.demo-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-width: 22rem;
}

.demo-hint {
    margin: 0;
    font-size: 13px;
    color: var(--caomei-color-text-muted);
}

/* 窄容器：字段与面板都随容器收敛，320 / 390 档不横向溢出 */
.demo-narrow {
    width: min(14rem, 100%);
}
</style>
