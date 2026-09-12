<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiButton } from '@/components/button'
import { CaomeiDialog } from '@/components/dialog'

const small = ref(false)
const medium = ref(false)
const large = ref(false)
</script>

<template>
    <div class="demo-row">
        <CaomeiButton variant="secondary" @click="small = true">
            sm
        </CaomeiButton>
        <CaomeiButton variant="secondary" @click="medium = true">
            md（默认）
        </CaomeiButton>
        <CaomeiButton variant="secondary" @click="large = true">
            lg
        </CaomeiButton>

        <CaomeiDialog
            v-model:open="small"
            size="sm"
            title="小尺寸"
            description="宽度上限 360px。"
        >
            内容
        </CaomeiDialog>
        <CaomeiDialog
            v-model:open="medium"
            size="md"
            title="中尺寸"
            description="宽度上限 480px。"
        >
            内容
        </CaomeiDialog>
        <CaomeiDialog
            v-model:open="large"
            size="lg"
            title="大尺寸"
            description="宽度上限 640px。"
        >
            内容
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
