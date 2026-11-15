<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiButton, CaomeiDialog, useToast } from '@/index'

/**
 * Toast × Dialog 层叠协作夹具（见 `test/e2e/overlay-collaboration.e2e.ts` 的 C7）。
 *
 * 必须挂在 `CaomeiToastProvider` 之内才能 `useToast()`；提示触发键放在对话框**内部**，
 * 因为模态打开后页面其余部分已被 `pointer-events: none` 拦截，外部按键无法用真实指针点击。
 * 提示统一 `duration: 0`（常驻），由用例显式关闭，避免自动消失让断言时序不确定。
 */
const toast = useToast()
const open = ref(false)

function showOne(): void {
    toast.show({ title: '协作提示', duration: 0 })
}

function showTwo(): void {
    toast.show({ title: '协作提示 A', duration: 0 })
    toast.show({ title: '协作提示 B', duration: 0 })
}
</script>

<template>
    <CaomeiButton
        id="collab-toast-open-dialog"
        @click="open = true"
    >
        打开提示对话框
    </CaomeiButton>
    <span id="collab-toast-dialog-open">{{ open }}</span>
    <CaomeiDialog
        id="collab-toast-dialog"
        v-model:open="open"
        title="提示对话框"
        description="用于验证 Toast 与 Dialog 的层叠协作。"
    >
        <div class="fixture__collab-toast-actions">
            <CaomeiButton
                id="collab-toast-show"
                @click="showOne"
            >
                显示协作提示
            </CaomeiButton>
            <CaomeiButton
                id="collab-toast-show-two"
                @click="showTwo"
            >
                显示两条提示
            </CaomeiButton>
        </div>
    </CaomeiDialog>
</template>

<style scoped>
.fixture__collab-toast-actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--caomei-space-2);
}
</style>
