<script setup lang="ts">
import { CaomeiButton, useToast } from '@/index'

/**
 * Toast 语气对比度夹具驱动：点击后按 5 种语气各入队一条常驻提示（`duration: 0`），
 * 供 `toast-tone-contrast.e2e.ts` 在亮 / 暗两档测量文本对比度。
 */
const tones = ['neutral', 'primary', 'success', 'warning', 'danger'] as const
const toast = useToast()

function show(): void {
    tones.forEach((tone) => {
        toast.show({ tone, title: tone, duration: 0 })
    })
}
</script>

<template>
    <CaomeiButton
        id="toast-show"
        @click="show"
    >
        显示提示
    </CaomeiButton>
</template>
