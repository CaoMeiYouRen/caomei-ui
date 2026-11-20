<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiActionSheet, type ActionSheetGroup } from '@/components/action-sheet'
import { CaomeiButton } from '@/components/button'

const open = ref(false)
const selected = ref('')

const groups: ActionSheetGroup[] = [
    {
        items: [
            { label: 'Share with members', value: 'share' },
            { label: 'Copy link', value: 'copy' },
            { label: 'Delete project', value: 'delete', danger: true, description: 'This cannot be undone' },
        ],
    },
]
</script>

<template>
    <CaomeiButton @click="open = true">
        Open action sheet
    </CaomeiButton>
    <p class="demo-hint">
        Last selected: {{ selected || '—' }}
    </p>

    <CaomeiActionSheet
        v-model:open="open"
        title="More actions"
        description="Choose an action to run"
        :groups="groups"
        @select="(value) => {
            selected = String(value ?? '')
        }"
    />
</template>

<style scoped>
.demo-hint {
    margin: var(--caomei-space-2) 0 0;
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-sm);
}
</style>
