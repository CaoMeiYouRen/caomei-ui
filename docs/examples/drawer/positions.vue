<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiButton } from '@/components/button'
import { CaomeiDrawer } from '@/components/drawer'

const positions = ['left', 'right', 'top', 'bottom'] as const

const open = ref<Record<(typeof positions)[number], boolean>>({
    left: false,
    right: false,
    top: false,
    bottom: false,
})
</script>

<template>
    <div class="demo-row">
        <CaomeiButton
            v-for="position in positions"
            :key="position"
            variant="secondary"
            @click="open[position] = true"
        >
            {{ position }}
        </CaomeiButton>

        <CaomeiDrawer
            v-for="position in positions"
            :key="position"
            v-model:open="open[position]"
            :position="position"
            :title="`方向：${position}`"
            description="四个方向均可滑出；left / right 为宽、top / bottom 为高。"
        >
            内容
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
