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
            title="Low disk space"
            closable
            @close="visible = false"
        >
            Less than 10% left; please clean up soon.
        </CaomeiMessage>
        <CaomeiMessage
            tone="danger"
            title="Sync failed"
            closable
        >
            <template #actions>
                <button
                    type="button"
                    class="demo-action"
                >
                    Retry
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
