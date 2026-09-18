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
    { label: 'Edit', icon: Pencil, command: (): void => { result.value = 'Edit' } },
    { label: 'Duplicate', icon: Copy, command: (): void => { result.value = 'Duplicate' } },
    { separator: true },
    { label: 'Delete', icon: Trash, command: (): void => { result.value = 'Delete' } },
]
</script>

<template>
    <div class="demo-row">
        <CaomeiDropdownMenu>
            <CaomeiDropdownMenuTrigger as-child unstyled>
                <CaomeiButton variant="secondary">
                    Actions
                </CaomeiButton>
            </CaomeiDropdownMenuTrigger>
            <CaomeiDropdownMenuContent :model="items" />
        </CaomeiDropdownMenu>
        <span class="demo-result">Result: {{ result }}</span>
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
