<script setup lang="ts">
import { Save } from '@lucide/vue'
import { ref } from 'vue'
import { CaomeiIcon } from '@/icons'
import { CaomeiSplitButton } from '@/components/split-button'
import type { SplitButtonMenuItem } from '@/components/split-button'

const lastAction = ref('')

const items: SplitButtonMenuItem[] = [
    { label: '另存为', command: () => (lastAction.value = '另存为') },
    { label: '导出', command: () => (lastAction.value = '导出') },
    { separator: true },
    { label: '删除（禁用）', disabled: true },
]
</script>

<template>
    <div class="demo-column">
        <CaomeiSplitButton
            :model="items"
            @click="lastAction = '保存（主按钮）'"
        >
            保存
            <template #icon>
                <CaomeiIcon :icon="Save" />
            </template>
        </CaomeiSplitButton>
        <p class="demo-text">
            {{ lastAction ? `最近操作：${lastAction}` : '点击主按钮或下拉菜单' }}
        </p>
    </div>
</template>

<style scoped>
.demo-column {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
}

.demo-text {
    margin: 0;
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-sm);
}
</style>
