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
            md (default)
        </CaomeiButton>
        <CaomeiButton variant="secondary" @click="large = true">
            lg
        </CaomeiButton>

        <CaomeiDialog
            v-model:open="small"
            size="sm"
            title="Small"
            description="Max width 360px."
        >
            Content
        </CaomeiDialog>
        <CaomeiDialog
            v-model:open="medium"
            size="md"
            title="Medium"
            description="Max width 480px."
        >
            Content
        </CaomeiDialog>
        <CaomeiDialog
            v-model:open="large"
            size="lg"
            title="Large"
            description="Max width 640px."
        >
            Content
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
