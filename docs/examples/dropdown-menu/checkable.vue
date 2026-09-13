<script setup lang="ts">
import { ref } from 'vue'
import {
    CaomeiDropdownMenu,
    CaomeiDropdownMenuCheckboxItem,
    CaomeiDropdownMenuContent,
    CaomeiDropdownMenuGroup,
    CaomeiDropdownMenuLabel,
    CaomeiDropdownMenuRadioGroup,
    CaomeiDropdownMenuRadioItem,
    CaomeiDropdownMenuSeparator,
    CaomeiDropdownMenuTrigger,
} from '@/components/dropdown-menu'

const showHidden = ref(false)
const wrapLines = ref(true)
const density = ref<string | number>('comfortable')
</script>

<template>
    <div class="demo-column">
        <CaomeiDropdownMenu>
            <CaomeiDropdownMenuTrigger>视图设置</CaomeiDropdownMenuTrigger>
            <CaomeiDropdownMenuContent>
                <CaomeiDropdownMenuLabel>显示</CaomeiDropdownMenuLabel>
                <CaomeiDropdownMenuGroup>
                    <CaomeiDropdownMenuCheckboxItem
                        v-model="showHidden"
                        @select.prevent
                    >
                        显示隐藏项
                    </CaomeiDropdownMenuCheckboxItem>
                    <CaomeiDropdownMenuCheckboxItem
                        v-model="wrapLines"
                        @select.prevent
                    >
                        自动换行
                    </CaomeiDropdownMenuCheckboxItem>
                </CaomeiDropdownMenuGroup>
                <CaomeiDropdownMenuSeparator />
                <CaomeiDropdownMenuLabel>密度</CaomeiDropdownMenuLabel>
                <CaomeiDropdownMenuRadioGroup v-model="density">
                    <CaomeiDropdownMenuRadioItem value="compact">
                        紧凑
                    </CaomeiDropdownMenuRadioItem>
                    <CaomeiDropdownMenuRadioItem value="comfortable">
                        标准
                    </CaomeiDropdownMenuRadioItem>
                    <CaomeiDropdownMenuRadioItem value="loose">
                        宽松
                    </CaomeiDropdownMenuRadioItem>
                </CaomeiDropdownMenuRadioGroup>
            </CaomeiDropdownMenuContent>
        </CaomeiDropdownMenu>

        <p class="demo-state">
            显示隐藏项：{{ showHidden ? '开' : '关' }} · 自动换行：{{ wrapLines ? '开' : '关' }} · 密度：{{ density }}
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

.demo-state {
    margin: 0;
    color: var(--vp-c-text-2);
    font-size: 13px;
}
</style>
