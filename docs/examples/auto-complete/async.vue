<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiAutoComplete } from '@/components/auto-complete'

interface Fruit {
    label: string
    value: string
}

const ALL_FRUITS: Fruit[] = [
    { label: 'Apple 苹果', value: 'apple' },
    { label: 'Banana 香蕉', value: 'banana' },
    { label: 'Cherry 樱桃', value: 'cherry' },
    { label: 'Blueberry 蓝莓', value: 'blueberry' },
    { label: 'Blackberry 黑莓', value: 'blackberry' },
]

const value = ref('')
const options = ref<Fruit[]>([])
const loading = ref(false)

function onComplete(query: string): void {
    loading.value = true
    // 模拟异步请求：真实场景请在此调用后端接口
    window.setTimeout(() => {
        const keyword = query.trim().toLowerCase()
        options.value = keyword
            ? ALL_FRUITS.filter((fruit) => fruit.label.toLowerCase().includes(keyword))
            : ALL_FRUITS
        loading.value = false
    }, 400)
}
</script>

<template>
    <div class="demo-column">
        <CaomeiAutoComplete
            v-model="value"
            :options="options"
            :loading="loading"
            :debounce="300"
            placeholder="输入关键字搜索水果"
            label="水果搜索"
            dropdown
            @complete="onComplete"
        />
        <span class="demo-text">
            输入停顿 300ms 后触发 complete 事件，示例以 400ms 模拟异步返回。
        </span>
    </div>
</template>

<style scoped>
.demo-column {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
}

.demo-text {
    color: var(--vp-c-text-2);
    font-size: 13px;
}
</style>
