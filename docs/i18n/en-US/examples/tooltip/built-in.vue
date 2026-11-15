<script setup lang="ts">
import { Bold, Italic, Save, Underline } from '@lucide/vue'
import { ref } from 'vue'
import { CaomeiButton } from '@/components/button'
import { CaomeiDialog } from '@/components/dialog'
import { CaomeiDrawer } from '@/components/drawer'
import { CaomeiPaginator } from '@/components/paginator'
import { CaomeiSplitButton } from '@/components/split-button'
import type { SplitButtonMenuItem } from '@/components/split-button'
import { CaomeiToolbar, CaomeiToolbarButton, CaomeiToolbarSeparator } from '@/components/toolbar'
import { CaomeiIcon } from '@/icons'

const page = ref(3)
const dialogOpen = ref(false)
const drawerOpen = ref(false)

const menuItems: SplitButtonMenuItem[] = [
    { label: 'Save as' },
    { label: 'Export' },
]
</script>

<template>
    <div class="demo-section">
        <h4>Toolbar: icon buttons are on by default</h4>
        <p class="demo-hint">
            Icon buttons have no visible text, so the tooltip is on by default and takes the label (the accessible name) as content; the accessible name itself is unchanged.
        </p>
        <CaomeiToolbar label="Text formatting">
            <CaomeiToolbarButton label="Bold">
                <CaomeiIcon :icon="Bold" />
            </CaomeiToolbarButton>
            <CaomeiToolbarButton label="Italic">
                <CaomeiIcon :icon="Italic" />
            </CaomeiToolbarButton>
            <CaomeiToolbarSeparator />
            <CaomeiToolbarButton label="Underline">
                <CaomeiIcon :icon="Underline" />
            </CaomeiToolbarButton>
        </CaomeiToolbar>
    </div>

    <div class="demo-section">
        <h4>Paginator: the four page navigation buttons</h4>
        <p class="demo-hint">
            First / previous / next / last carry a tooltip by default, with each button's accessible name as content; pass <code>:tooltip="false"</code> to turn all of them off.
        </p>
        <CaomeiPaginator
            v-model:page="page"
            :total="100"
            :items-per-page="10"
            show-edges
        />
    </div>

    <div class="demo-section">
        <h4>SplitButton: the dropdown button</h4>
        <p class="demo-hint">
            The dropdown (icon) button carries a tooltip by default, with menuLabel as content; the main button has visible text and gets no tooltip.
        </p>
        <CaomeiSplitButton
            :model="menuItems"
            menu-label="More actions"
        >
            Save
            <template #icon>
                <CaomeiIcon :icon="Save" />
            </template>
        </CaomeiSplitButton>
    </div>

    <div class="demo-section">
        <h4>Dialog / Drawer: the close button</h4>
        <p class="demo-hint">
            The close button carries a tooltip by default. Opening the panel focuses it programmatically, and the tooltip deliberately ignores that focus so it does not pop up on open.
        </p>
        <div class="demo-row">
            <CaomeiButton @click="dialogOpen = true">
                Open dialog
            </CaomeiButton>
            <CaomeiButton @click="drawerOpen = true">
                Open drawer
            </CaomeiButton>
        </div>
        <CaomeiDialog
            v-model:open="dialogOpen"
            title="Dialog title"
            description="Hover the close button in the top-right corner to see the tooltip."
        >
            <p class="demo-text">
                Dialog body content.
            </p>
        </CaomeiDialog>
        <CaomeiDrawer
            v-model:open="drawerOpen"
            title="Drawer title"
            description="Hover the close button to see the tooltip."
        >
            <p class="demo-text">
                Drawer body content.
            </p>
        </CaomeiDrawer>
    </div>
</template>

<style scoped>
.demo-section {
    margin-bottom: 24px;
}

.demo-section h4 {
    margin: 0 0 8px;
    font-size: 14px;
    font-weight: 600;
    color: var(--caomei-color-text);
}

.demo-hint {
    margin: 0 0 12px;
    font-size: 13px;
    color: var(--caomei-color-text-muted);
}

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
