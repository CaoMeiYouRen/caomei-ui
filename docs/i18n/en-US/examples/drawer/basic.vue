<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiButton } from '@/components/button'
import { CaomeiDrawer } from '@/components/drawer'

const open = ref(false)
</script>

<template>
    <div class="demo-row">
        <CaomeiButton @click="open = true">
            Open drawer
        </CaomeiButton>
        <CaomeiDrawer
            v-model:open="open"
            title="Drawer title"
            description="Slides in from the left by default, for secondary content or a settings panel."
        >
            <p class="demo-text">
                Drawer body content; put a form or any content here.
            </p>
            <template #footer>
                <CaomeiButton variant="secondary" @click="open = false">
                    Cancel
                </CaomeiButton>
                <CaomeiButton @click="open = false">
                    Confirm
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

.demo-text {
    margin: 0;
}
</style>
