<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import {
    CaomeiButton,
    CaomeiDialog,
    CaomeiIcon,
    CaomeiInput,
    CaomeiInputNumber,
    CaomeiSwitch,
    CaomeiTextarea,
    useTheme,
} from '@/index'
import { Check, Settings } from '@lucide/vue'

const open = ref(false)
const checked = ref(true)
const loading = ref(false)
const keyword = ref('')
const remark = ref('')
const quantity = ref<number | null>(2)
const invalidValue = ref('')
const { mode, isDark, setMode } = useTheme('light')

watchEffect(() => {
    document.documentElement.classList.toggle('dark', isDark.value)
})

async function triggerLoading(): Promise<void> {
    loading.value = true
    await new Promise((resolve) => setTimeout(resolve, 1200))
    loading.value = false
}
</script>

<template>
    <main class="playground">
        <h1>caomei-ui playground</h1>

        <section class="playground__section">
            <h2>变体</h2>
            <div class="playground__row">
                <CaomeiButton variant="primary">
                    Primary
                </CaomeiButton>
                <CaomeiButton variant="secondary">
                    Secondary
                </CaomeiButton>
                <CaomeiButton variant="ghost">
                    Ghost
                </CaomeiButton>
            </div>
        </section>

        <section class="playground__section">
            <h2>尺寸</h2>
            <div class="playground__row">
                <CaomeiButton size="sm">
                    Small
                </CaomeiButton>
                <CaomeiButton size="md">
                    Medium
                </CaomeiButton>
                <CaomeiButton size="lg">
                    Large
                </CaomeiButton>
            </div>
        </section>

        <section class="playground__section">
            <h2>状态</h2>
            <div class="playground__row">
                <CaomeiButton disabled>
                    Disabled
                </CaomeiButton>
                <CaomeiButton :loading="loading" @click="triggerLoading">
                    {{ loading ? '加载中' : '点击加载' }}
                </CaomeiButton>
                <CaomeiButton variant="secondary" @click="setMode(isDark ? 'light' : 'dark')">
                    <template #icon>
                        <CaomeiIcon :icon="Settings" />
                    </template>
                    {{ mode }}
                </CaomeiButton>
            </div>
        </section>

        <section class="playground__section">
            <h2>输入框</h2>
            <div class="playground__column">
                <CaomeiInput
                    v-model="keyword"
                    clearable
                    placeholder="请输入内容"
                />
                <CaomeiInput
                    v-model="keyword"
                    size="sm"
                    placeholder="小尺寸"
                />
                <CaomeiInput
                    v-model="keyword"
                    size="lg"
                    disabled
                    placeholder="禁用"
                />
                <CaomeiInput
                    v-model="invalidValue"
                    invalid
                    placeholder="校验失败"
                />
            </div>
        </section>

        <section class="playground__section">
            <h2>多行输入</h2>
            <div class="playground__column">
                <CaomeiTextarea
                    v-model="remark"
                    :rows="3"
                    placeholder="请输入备注"
                />
                <CaomeiTextarea
                    v-model="remark"
                    :rows="2"
                    size="sm"
                    invalid
                    placeholder="校验失败"
                />
            </div>
        </section>

        <section class="playground__section">
            <h2>数字输入</h2>
            <div class="playground__column">
                <CaomeiInputNumber
                    v-model="quantity"
                    :min="0"
                    :max="10"
                />
                <CaomeiInputNumber
                    v-model="quantity"
                    size="sm"
                    :step="0.1"
                    :precision="1"
                    invalid
                />
            </div>
        </section>

        <section class="playground__section">
            <h2>其他</h2>
            <div class="playground__row">
                <CaomeiButton variant="secondary" @click="open = true">
                    <template #icon>
                        <CaomeiIcon :icon="Check" />
                    </template>
                    打开对话框
                </CaomeiButton>
                <CaomeiSwitch v-model="checked" />
            </div>
            <CaomeiButton block>
                Block Button
            </CaomeiButton>
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
    min-height: 100vh;
    padding: var(--caomei-space-4);
    background: var(--caomei-color-bg);
    color: var(--caomei-color-text);
}

.playground__section {
    display: flex;
    flex-direction: column;
    gap: var(--caomei-space-2);
}

.playground__section h2 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
}

.playground__row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--caomei-space-3);
}

.playground__column {
    display: flex;
    flex-direction: column;
    gap: var(--caomei-space-2);
    max-width: 320px;
}
</style>
