<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiButton } from '@/components/button'
import { CaomeiDrawer } from '@/components/drawer'

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

        <CaomeiDrawer
            v-model:open="noClose"
            position="right"
            title="不可点右上角关闭"
            description="需通过底部按钮关闭。"
            :closable="false"
        >
            <template #footer>
                <CaomeiButton @click="noClose = false">
                    知道了
                </CaomeiButton>
            </template>
        </CaomeiDrawer>

        <CaomeiDrawer
            v-model:open="persist"
            position="right"
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
        </CaomeiDrawer>

        <CaomeiDrawer
            v-model:open="nonModal"
            position="right"
            title="非模态抽屉"
            description="无遮罩、背景可交互、不锁定页面滚动。"
            :modal="false"
        >
            <template #footer>
                <CaomeiButton @click="nonModal = false">
                    关闭
                </CaomeiButton>
            </template>
        </CaomeiDrawer>
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
