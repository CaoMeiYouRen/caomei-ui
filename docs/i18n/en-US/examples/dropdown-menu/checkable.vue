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
            <CaomeiDropdownMenuTrigger>View settings</CaomeiDropdownMenuTrigger>
            <CaomeiDropdownMenuContent>
                <CaomeiDropdownMenuLabel>Display</CaomeiDropdownMenuLabel>
                <CaomeiDropdownMenuGroup>
                    <CaomeiDropdownMenuCheckboxItem
                        v-model="showHidden"
                        @select.prevent
                    >
                        Show hidden items
                    </CaomeiDropdownMenuCheckboxItem>
                    <CaomeiDropdownMenuCheckboxItem
                        v-model="wrapLines"
                        @select.prevent
                    >
                        Wrap lines
                    </CaomeiDropdownMenuCheckboxItem>
                </CaomeiDropdownMenuGroup>
                <CaomeiDropdownMenuSeparator />
                <CaomeiDropdownMenuLabel>Density</CaomeiDropdownMenuLabel>
                <CaomeiDropdownMenuRadioGroup v-model="density">
                    <CaomeiDropdownMenuRadioItem value="compact">
                        Compact
                    </CaomeiDropdownMenuRadioItem>
                    <CaomeiDropdownMenuRadioItem value="comfortable">
                        Standard
                    </CaomeiDropdownMenuRadioItem>
                    <CaomeiDropdownMenuRadioItem value="loose">
                        Loose
                    </CaomeiDropdownMenuRadioItem>
                </CaomeiDropdownMenuRadioGroup>
            </CaomeiDropdownMenuContent>
        </CaomeiDropdownMenu>

        <p class="demo-state">
            Show hidden items: {{ showHidden ? 'On' : 'Off' }} · Wrap lines: {{ wrapLines ? 'On' : 'Off' }} · Density: {{ density }}
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
