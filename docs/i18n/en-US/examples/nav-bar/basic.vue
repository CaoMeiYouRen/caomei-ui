<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiButton } from '@/components/button'
import { CaomeiNavBar } from '@/components/nav-bar'

const title = ref('Project settings')
const backCount = ref(0)

function onBack(): void {
    backCount.value += 1
}
</script>

<template>
    <div class="demo-column">
        <CaomeiNavBar
            :title="title"
            label="Project settings navigation"
            @back="onBack"
        >
            <template #end>
                <CaomeiButton
                    size="sm"
                    variant="ghost"
                >
                    Save
                </CaomeiButton>
            </template>
        </CaomeiNavBar>
        <CaomeiNavBar
            title="No back button"
            label="No-back example"
            :back="false"
            :safe-area="false"
        />
        <p class="demo-hint">
            Back count: {{ backCount }}
        </p>
    </div>
</template>

<style scoped>
.demo-column {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
    max-width: 420px;
}

.demo-hint {
    margin: 0;
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-sm);
}
</style>
