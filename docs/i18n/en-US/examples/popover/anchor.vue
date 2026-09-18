<script setup lang="ts">
import { Bell } from '@lucide/vue'
import { CaomeiButton } from '@/components/button'
import { CaomeiIcon } from '@/icons'
import {
    CaomeiPopover,
    CaomeiPopoverContent,
    CaomeiPopoverTrigger,
} from '@/components/popover'

const notices = ['A new member joined the project', 'Build #128 finished', 'A dependency update needs review']
</script>

<template>
    <!-- as-child + unstyled: reuse a custom button as the trigger without the built-in skin -->
    <CaomeiPopover>
        <CaomeiPopoverTrigger as-child unstyled>
            <CaomeiButton variant="ghost" label="Notifications">
                <template #icon>
                    <CaomeiIcon :icon="Bell" />
                </template>
            </CaomeiButton>
        </CaomeiPopoverTrigger>
        <CaomeiPopoverContent>
            <ul class="demo-notices">
                <li
                    v-for="notice in notices"
                    :key="notice"
                >
                    {{ notice }}
                </li>
            </ul>
        </CaomeiPopoverContent>
    </CaomeiPopover>
</template>

<style scoped>
.demo-notices {
    margin: 0;
    padding-left: 18px;
    line-height: 1.8;
}
</style>
