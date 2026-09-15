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
            Hide close button
        </CaomeiButton>
        <CaomeiButton variant="secondary" @click="persist = true">
            Overlay and Esc do not close
        </CaomeiButton>
        <CaomeiButton variant="secondary" @click="nonModal = true">
            Non-modal
        </CaomeiButton>

        <CaomeiDrawer
            v-model:open="noClose"
            position="right"
            title="Cannot close from the top-right"
            description="Close via the footer button."
            :closable="false"
        >
            <template #footer>
                <CaomeiButton @click="noClose = false">
                    Got it
                </CaomeiButton>
            </template>
        </CaomeiDrawer>

        <CaomeiDrawer
            v-model:open="persist"
            position="right"
            title="Forced choice"
            description="Clicking the overlay or pressing Esc will not close."
            :close-on-overlay="false"
            :close-on-esc="false"
        >
            <template #footer>
                <CaomeiButton @click="persist = false">
                    Close
                </CaomeiButton>
            </template>
        </CaomeiDrawer>

        <CaomeiDrawer
            v-model:open="nonModal"
            position="right"
            title="Non-modal drawer"
            description="No overlay, background stays interactive, page scroll is not locked."
            :modal="false"
        >
            <template #footer>
                <CaomeiButton @click="nonModal = false">
                    Close
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
