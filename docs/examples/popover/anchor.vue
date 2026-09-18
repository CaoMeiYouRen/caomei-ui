<script setup lang="ts">
import { Bell } from '@lucide/vue'
import { CaomeiButton } from '@/components/button'
import { CaomeiIcon } from '@/icons'
import {
    CaomeiPopover,
    CaomeiPopoverContent,
    CaomeiPopoverTrigger,
} from '@/components/popover'

const notices = ['有新成员加入项目', '构建 #128 已完成', '依赖更新待确认']
</script>

<template>
    <!-- as-child + unstyled：复用自定义按钮作为触发器，不继承浮层触发器的内建外观 -->
    <CaomeiPopover>
        <CaomeiPopoverTrigger as-child unstyled>
            <CaomeiButton variant="ghost" label="通知">
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
