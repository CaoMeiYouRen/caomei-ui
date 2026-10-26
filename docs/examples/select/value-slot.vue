<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiSelect } from '@/components/select'

interface Fruit {
    label: string
    value: string
}

interface StarredFruit extends Fruit {
    star: boolean
}

const value1 = ref<string>()
const value2 = ref<string>()
const value3 = ref<string>()
const value4a = ref<string>()
const value4b = ref<string>()
const value4c = ref<string>()
const value5 = ref<string>()

const options: Fruit[] = [
    { label: '苹果', value: 'apple' },
    { label: '香蕉', value: 'banana' },
    { label: '樱桃', value: 'cherry' },
]

const starredOptions: StarredFruit[] = [
    { label: '苹果', value: 'apple', star: true },
    { label: '香蕉', value: 'banana', star: false },
    { label: '樱桃', value: 'cherry', star: true },
]
</script>

<template>
    <div class="demo-section">
        <h4>基础用法</h4>
        <div class="demo-row">
            <CaomeiSelect
                v-model="value1"
                label="水果（value 插槽）"
                :options="options"
                placeholder="选择水果"
            >
                <template #value="{option, label, selected}">
                    <span class="custom-trigger">
                        <span v-if="selected" class="selected-badge">已选</span>
                        <span>{{ label || '请选择' }}</span>
                        <span v-if="option" class="option-id">(ID: {{ option.value }})</span>
                    </span>
                </template>
            </CaomeiSelect>
        </div>
    </div>

    <div class="demo-section">
        <h4>显示图标 + 标签</h4>
        <div class="demo-row">
            <CaomeiSelect
                v-model="value2"
                label="水果（value 插槽·图标）"
                :options="starredOptions"
                placeholder="选择收藏"
            >
                <template #value="{option, label}">
                    <span class="custom-trigger-icon">
                        <span v-if="option?.star" class="star-icon">★</span>
                        <span>{{ label || '未选择' }}</span>
                    </span>
                </template>
            </CaomeiSelect>
        </div>
    </div>

    <div class="demo-section">
        <h4>无选中值时显示占位</h4>
        <div class="demo-row">
            <CaomeiSelect
                v-model="value3"
                label="水果（value 插槽·占位）"
                :options="options"
                placeholder="未选中时显示此文本"
            >
                <template #value="{label, selected}">
                    <span class="custom-trigger">
                        <span v-if="selected" class="selected-tag">选中: {{ label }}</span>
                        <span v-else class="placeholder-tag">未选择</span>
                    </span>
                </template>
            </CaomeiSelect>
        </div>
    </div>

    <div class="demo-section">
        <h4>不同尺寸</h4>
        <div class="demo-row">
            <CaomeiSelect
                v-model="value4a"
                label="水果（value 插槽·小尺寸）"
                :options="options"
                placeholder="默认"
                size="sm"
            >
                <template #value="{label, selected}">
                    <span v-if="selected" class="selected-tag">✓ {{ label }}</span>
                    <span v-else class="placeholder-tag">请选择</span>
                </template>
            </CaomeiSelect>
            <CaomeiSelect
                v-model="value4b"
                label="水果（value 插槽·中尺寸）"
                :options="options"
                placeholder="中等"
                size="md"
            >
                <template #value="{label, selected}">
                    <span v-if="selected" class="selected-tag">✓ {{ label }}</span>
                    <span v-else class="placeholder-tag">请选择</span>
                </template>
            </CaomeiSelect>
            <CaomeiSelect
                v-model="value4c"
                label="水果（value 插槽·大尺寸）"
                :options="options"
                placeholder="大号"
                size="lg"
            >
                <template #value="{label, selected}">
                    <span v-if="selected" class="selected-tag">✓ {{ label }}</span>
                    <span v-else class="placeholder-tag">请选择</span>
                </template>
            </CaomeiSelect>
        </div>
    </div>

    <div class="demo-section">
        <h4>#value 与 #option 组合使用</h4>
        <p class="desc">
            触发器显示自定义内容，面板选项使用 #option 插槽
        </p>
        <div class="demo-row">
            <CaomeiSelect
                v-model="value5"
                label="水果（value + option 插槽）"
                :options="starredOptions"
                placeholder="选择"
            >
                <template #value="{option, label}">
                    <span class="custom-trigger">
                        <span v-if="option?.star">⭐ </span>
                        <span>{{ label || '请选择' }}</span>
                    </span>
                </template>
                <template #option="{option, selected}">
                    <span class="custom-option">
                        <span v-if="option.star">⭐ </span>
                        {{ option.label }}
                        <span v-if="selected" class="selected-badge">(当前)</span>
                    </span>
                </template>
            </CaomeiSelect>
        </div>
    </div>
</template>

<style scoped>
.demo-section {
    margin-bottom: 24px;
}

.demo-section h4 {
    margin: 0 0 12px;
    font-size: 14px;
    font-weight: 600;
    color: var(--caomei-color-text);
}

.demo-section .desc {
    margin: 0 0 12px;
    font-size: 13px;
    color: var(--caomei-color-text-muted);
}

.demo-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
}

.custom-trigger,
.custom-trigger-icon,
.custom-option {
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.star-icon {
    color: #f59e0b;
    font-size: 14px;
}

.selected-badge {
    font-size: 10px;
    padding: 1px 4px;
    background: var(--caomei-color-primary);
    color: var(--caomei-color-primary-foreground);
    border-radius: var(--caomei-radius-sm);
    margin-right: 4px;
}

.selected-tag {
    font-size: 12px;
    padding: 1px 6px;
    background: var(--caomei-color-success);
    color: white;
    border-radius: var(--caomei-radius-sm);
    margin-right: 4px;
}

.placeholder-tag {
    font-size: 12px;
    color: var(--caomei-color-text-muted);
}

.option-id {
    font-size: 11px;
    color: var(--caomei-color-text-muted);
    margin-left: 4px;
}
</style>
