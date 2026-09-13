<script setup lang="ts">
import { ref } from 'vue'
import {
    CaomeiTabContent,
    CaomeiTabList,
    CaomeiTabTrigger,
    CaomeiTabs,
} from '@/components/tabs'

const controlled = ref<string | number>('a')
</script>

<template>
    <div class="demo-column">
        <CaomeiTabs v-model="controlled">
            <CaomeiTabList aria-label="Controlled example">
                <CaomeiTabTrigger value="a">
                    Available
                </CaomeiTabTrigger>
                <CaomeiTabTrigger value="b" disabled>
                    Disabled
                </CaomeiTabTrigger>
            </CaomeiTabList>
            <CaomeiTabContent value="a">
                <p class="demo-text">
                    Current value: {{ controlled }}
                </p>
            </CaomeiTabContent>
            <CaomeiTabContent value="b">
                <p class="demo-text">
                    A disabled item cannot be activated by keyboard or pointer.
                </p>
            </CaomeiTabContent>
        </CaomeiTabs>

        <CaomeiTabs
            default-value="x"
            activation-mode="manual"
        >
            <CaomeiTabList aria-label="Manual activation example">
                <CaomeiTabTrigger value="x">
                    Manual
                </CaomeiTabTrigger>
                <CaomeiTabTrigger value="y">
                    Activate
                </CaomeiTabTrigger>
            </CaomeiTabList>
            <CaomeiTabContent value="x">
                <p class="demo-text">
                    In manual mode, focus does not switch; click or press Enter / Space.
                </p>
            </CaomeiTabContent>
            <CaomeiTabContent value="y">
                <p class="demo-text">
                    Arrow keys only move focus and do not change the content.
                </p>
            </CaomeiTabContent>
        </CaomeiTabs>
    </div>
</template>

<style scoped>
.demo-column {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.demo-text {
    margin: 0;
    color: var(--vp-c-text-2);
    font-size: 14px;
}
</style>
