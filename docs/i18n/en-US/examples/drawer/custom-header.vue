<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiButton } from '@/components/button'
import { CaomeiDrawer } from '@/components/drawer'

const open = ref(false)
const customWidthOpen = ref(false)
</script>

<template>
    <div class="demo-row">
        <CaomeiButton variant="secondary" @click="open = true">
            Custom header
        </CaomeiButton>
        <CaomeiButton variant="secondary" @click="customWidthOpen = true">
            Custom width
        </CaomeiButton>

        <CaomeiDrawer
            v-model:open="open"
            title="Sessions"
            description="The header slot replaces the title area; the close button stays."
        >
            <template #header>
                <div class="demo-header">
                    <span class="demo-header__title">Sessions</span>
                    <span class="demo-header__badge">3</span>
                </div>
            </template>
            List content
        </CaomeiDrawer>

        <CaomeiDrawer
            v-model:open="customWidthOpen"
            title="Custom width"
            description="Width overridden to 600px via style."
            :style="{width: '600px'}"
        >
            Content
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

.demo-header {
    display: flex;
    align-items: center;
    gap: 8px;
}

.demo-header__title {
    font-weight: 600;
}

.demo-header__badge {
    padding: 0 6px;
    border-radius: var(--caomei-radius-full);
    background: color-mix(in srgb, var(--caomei-color-primary) 12%, transparent);
    color: var(--caomei-color-primary);
    font-size: var(--caomei-font-size-sm);
}
</style>
