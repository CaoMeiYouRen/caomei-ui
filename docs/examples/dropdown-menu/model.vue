<script setup lang="ts">
import { Copy, Pencil, Trash } from '@lucide/vue'
import { ref } from 'vue'
import { CaomeiButton } from '@/components/button'
import {
    CaomeiDropdownMenu,
    CaomeiDropdownMenuContent,
    CaomeiDropdownMenuTrigger,
    type DropdownMenuModelItem,
} from '@/components/dropdown-menu'

const result = ref('—')

const items: DropdownMenuModelItem[] = [
    { label: '编辑', icon: Pencil, command: (): void => { result.value = '编辑' } },
    { label: '复制', icon: Copy, command: (): void => { result.value = '复制' } },
    { separator: true },
    { label: '删除', icon: Trash, command: (): void => { result.value = '删除' } },
]
</script>

<template>
    <div class="demo-row">
        <CaomeiDropdownMenu>
            <CaomeiDropdownMenuTrigger as-child unstyled>
                <CaomeiButton variant="secondary">
                    操作
                </CaomeiButton>
            </CaomeiDropdownMenuTrigger>
            <CaomeiDropdownMenuContent :model="items" />
        </CaomeiDropdownMenu>
        <span class="demo-result">结果：{{ result }}</span>
    </div>
</template>

<style scoped>
.demo-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
}

.demo-result {
    color: var(--vp-c-text-2);
    font-size: 13px;
}
</style>
