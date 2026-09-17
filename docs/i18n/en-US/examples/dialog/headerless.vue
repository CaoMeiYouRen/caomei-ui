<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiButton } from '@/components/button'
import { CaomeiDialog } from '@/components/dialog'

const open = ref(false)
const hideCount = ref(0)
</script>

<template>
    <div class="demo-row">
        <CaomeiButton @click="open = true">
            Headerless dialog
        </CaomeiButton>
        <span class="demo-hint">Closed {{ hideCount }} times</span>

        <CaomeiDialog
            v-model:open="open"
            title="Search"
            :show-header="false"
            @hide="hideCount += 1"
        >
            <p class="demo-text">
                With showHeader false the title area and close button are not rendered; title is kept as a
                visually hidden accessible name. Closing via the overlay or Esc emits hide.
            </p>
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

.demo-text {
    margin: 0;
}

.demo-hint {
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-sm);
}
</style>
