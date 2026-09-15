<script setup lang="ts">
import { computed, ref } from 'vue'
import { CaomeiButton } from '@/components/button'
import { CaomeiDataView } from '@/components/data-view'

type State = 'ready' | 'loading' | 'empty'

interface Member {
    id: number
    name: string
}

const state = ref<State>('ready')

const members: Member[] = [
    { id: 1, name: '张三' },
    { id: 2, name: '李四' },
    { id: 3, name: '王五' },
]

const value = computed(() => (state.value === 'ready' ? members : []))
const loading = computed(() => state.value === 'loading')
</script>

<template>
    <div class="demo-column">
        <div class="demo-row">
            <CaomeiButton size="sm" @click="state = 'ready'">
                有数据
            </CaomeiButton>
            <CaomeiButton size="sm" @click="state = 'loading'">
                加载中
            </CaomeiButton>
            <CaomeiButton size="sm" @click="state = 'empty'">
                空数据
            </CaomeiButton>
        </div>

        <CaomeiDataView
            :value="value"
            :loading="loading"
        >
            <template #list="{items}">
                <ul class="demo-list">
                    <li
                        v-for="item in items"
                        :key="item.id"
                    >
                        {{ item.name }}
                    </li>
                </ul>
            </template>
            <template #empty>
                <span class="demo-empty">还没有成员，先邀请一位吧</span>
            </template>
        </CaomeiDataView>
    </div>
</template>

<style scoped>
.demo-column {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.demo-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.demo-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 0;
    padding: 0;
    list-style: none;
}

.demo-list li {
    margin: 0;
    padding: 8px 12px;
    border: 1px solid var(--caomei-color-border);
    border-radius: var(--caomei-radius-md);
}

.demo-empty {
    color: var(--caomei-color-primary);
}
</style>
