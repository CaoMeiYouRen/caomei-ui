<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiButton } from '@/components/button'
import { CaomeiDialog } from '@/components/dialog'

const noClose = ref(false)
const persist = ref(false)
const nonModal = ref(false)
</script>

<template>
    <div class="demo-row">
        <CaomeiButton variant="secondary" @click="noClose = true">
            隐藏关闭按钮
        </CaomeiButton>
        <CaomeiButton variant="secondary" @click="persist = true">
            遮罩与 Esc 不关闭
        </CaomeiButton>
        <CaomeiButton variant="secondary" @click="nonModal = true">
            非模态
        </CaomeiButton>

        <CaomeiDialog
            v-model:open="noClose"
            title="不可点右上角关闭"
            description="需通过底部按钮关闭。"
            :closable="false"
        >
            <template #footer>
                <CaomeiButton @click="noClose = false">
                    知道了
                </CaomeiButton>
            </template>
        </CaomeiDialog>

        <CaomeiDialog
            v-model:open="persist"
            title="强制选择"
            description="点击遮罩或按 Esc 不会关闭。"
            :close-on-overlay="false"
            :close-on-esc="false"
        >
            <template #footer>
                <CaomeiButton @click="persist = false">
                    关闭
                </CaomeiButton>
            </template>
        </CaomeiDialog>

        <CaomeiDialog
            v-model:open="nonModal"
            title="非模态对话框"
            description="无遮罩、背景可交互、不锁定页面滚动。"
            :modal="false"
        >
            <template #footer>
                <CaomeiButton @click="nonModal = false">
                    关闭
                </CaomeiButton>
            </template>
        </CaomeiDialog>
    </div>
</template>

<style scoped>
.demo-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
}
</style>
