<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiButton } from '@/components/button'
import { CaomeiDialog } from '@/components/dialog'

const open = ref(false)
</script>

<template>
    <div class="demo-row">
        <CaomeiButton @click="open = true">
            Open dialog
        </CaomeiButton>
        <CaomeiDialog
            v-model:open="open"
            title="Dialog title"
            description="This is a description text used for accessibility."
        >
            <p class="demo-text">
                Dialog body content; put a form or any content here.
            </p>
            <template #footer>
                <CaomeiButton variant="secondary" @click="open = false">
                    Cancel
                </CaomeiButton>
                <CaomeiButton @click="open = false">
                    Confirm
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

.demo-text {
    margin: 0;
}
</style>
