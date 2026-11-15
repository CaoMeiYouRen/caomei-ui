<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiButton, CaomeiDialog, CaomeiDrawer, useConfirm } from '@/index'

/**
 * 嵌套遮罩协作夹具（见 `test/e2e/overlay-collaboration.e2e.ts` 的 C6）。
 *
 * 必须挂在 `CaomeiConfirmDialog` 之内才能 `useConfirm()`；两条链路：
 * ① 详情 Dialog → 二次确认（AlertDialog）；
 * ② 抽屉 → 对话框。
 * 断言口径以嵌套遮罩层级评估的记录结论为准（`docs/design/governance/2026-11-15-phase34-m2-1-nested-overlay-layering.md`）：
 * **固定档位**（overlay 1000 / content 1001 / 面板 1050 / 提示 1060），断言不得假定 z-index 逐层递增。
 */
const confirm = useConfirm()
const detailOpen = ref(false)
const drawerOpen = ref(false)
const drawerDialogOpen = ref(false)
/** 二次确认的结算结果（true = 确认，false = 取消） */
const confirmResult = ref<string>('未触发')

async function askConfirm(): Promise<void> {
    const accepted = await confirm.open({
        title: '确认删除',
        description: '嵌套确认框用于验证 Esc 只关最上层。',
        tone: 'danger',
    })
    confirmResult.value = accepted ? '已确认' : '已取消'
}
</script>

<template>
    <div class="fixture__collab-nested">
        <CaomeiButton
            id="collab-nested-open-dialog"
            @click="detailOpen = true"
        >
            打开详情对话框
        </CaomeiButton>
        <CaomeiButton
            id="collab-nested-open-drawer"
            @click="drawerOpen = true"
        >
            打开详情抽屉
        </CaomeiButton>
        <span id="collab-nested-confirm-result">{{ confirmResult }}</span>

        <CaomeiDialog
            id="collab-nested-dialog"
            v-model:open="detailOpen"
            title="详情对话框"
            description="嵌套二次确认的父层。"
        >
            <CaomeiButton
                id="collab-nested-confirm"
                @click="askConfirm"
            >
                二次确认
            </CaomeiButton>
        </CaomeiDialog>

        <CaomeiDrawer
            id="collab-nested-drawer"
            v-model:open="drawerOpen"
            position="right"
            size="lg"
            title="详情抽屉"
        >
            <CaomeiButton
                id="collab-nested-drawer-open-dialog"
                @click="drawerDialogOpen = true"
            >
                打开抽屉内对话框
            </CaomeiButton>
            <CaomeiDialog
                id="collab-nested-inner-dialog"
                v-model:open="drawerDialogOpen"
                title="抽屉内对话框"
                description="抽屉之上的第二层。"
            >
                <p>抽屉内对话框内容</p>
            </CaomeiDialog>
        </CaomeiDrawer>
    </div>
</template>

<style scoped>
.fixture__collab-nested {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--caomei-space-2);
}
</style>
