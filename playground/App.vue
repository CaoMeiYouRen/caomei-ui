<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiButton, CaomeiDialog, CaomeiIcon, CaomeiSwitch, useTheme } from '@/index'
import { Settings } from '@lucide/vue'

const open = ref(false)
const checked = ref(true)
const { mode, isDark, setMode } = useTheme('light')
</script>

<template>
    <main class="playground">
        <h1>caomei-ui playground</h1>

        <section class="playground__row">
            <CaomeiButton @click="open = true">
                打开对话框
            </CaomeiButton>
            <CaomeiButton variant="secondary" @click="setMode(isDark ? 'light' : 'dark')">
                <CaomeiIcon :icon="Settings" />
                {{ mode }}
            </CaomeiButton>
            <CaomeiSwitch v-model="checked" />
        </section>

        <CaomeiDialog
            v-model:open="open"
            title="示例对话框"
            description="用于验证 Portal 与 Teleport 行为。"
        >
            对话框内容
        </CaomeiDialog>
    </main>
</template>

<style scoped>
.playground {
    display: flex;
    flex-direction: column;
    gap: var(--caomei-space-4);
    padding: var(--caomei-space-4);
}

.playground__row {
    display: flex;
    align-items: center;
    gap: var(--caomei-space-3);
}
</style>
