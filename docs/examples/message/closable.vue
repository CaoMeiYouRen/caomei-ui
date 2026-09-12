<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiMessage } from '@/components/message'

const visible = ref(true)
</script>

<template>
    <div class="demo-col">
        <CaomeiMessage
            v-if="visible"
            tone="warning"
            title="磁盘空间不足"
            closable
            @close="visible = false"
        >
            剩余空间低于 10%，请及时清理。
        </CaomeiMessage>
        <CaomeiMessage
            tone="danger"
            title="同步失败"
            closable
        >
            <template #actions>
                <button
                    type="button"
                    class="demo-action"
                >
                    重试
                </button>
            </template>
        </CaomeiMessage>
    </div>
</template>

<style scoped>
.demo-col {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.demo-action {
    padding: 2px 10px;
    border: 1px solid currentcolor;
    border-radius: 4px;
    background: transparent;
    color: inherit;
    font: inherit;
    cursor: pointer;
}
</style>
