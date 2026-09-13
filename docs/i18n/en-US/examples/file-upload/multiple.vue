<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiFileUpload } from '@/components/file-upload'

const files = ref<File[]>([])
</script>

<template>
    <div class="demo-column">
        <CaomeiFileUpload
            v-model="files"
            multiple
            accept="image/*"
        />
        <p class="demo-state">
            {{ files.length }} image(s) selected (only image/* accepted)
        </p>
    </div>
</template>

<style scoped>
.demo-column {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-width: 420px;
}

.demo-state {
    margin: 0;
    color: var(--vp-c-text-2);
    font-size: 13px;
}
</style>
