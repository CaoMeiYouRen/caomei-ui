<script setup lang="ts">
import { Settings } from '@lucide/vue'
import { CaomeiAccordion, CaomeiAccordionItem } from '@/components/accordion'
import { CaomeiIcon } from '@/icons'
</script>

<template>
    <div class="demo-column">
        <CaomeiAccordion default-value="a" collapsible>
            <CaomeiAccordionItem value="a" title="Expanded by default">
                <p class="demo-text">
                    The initial expanded item is set via defaultValue.
                </p>
            </CaomeiAccordionItem>
            <CaomeiAccordionItem
                value="b"
                title="Disabled item"
                disabled
            >
                <p class="demo-text">
                    A disabled item cannot be expanded and is excluded from keyboard navigation.
                </p>
            </CaomeiAccordionItem>
        </CaomeiAccordion>

        <CaomeiAccordion>
            <CaomeiAccordionItem value="custom">
                <template #trigger>
                    <CaomeiIcon :icon="Settings" />
                    Custom trigger
                </template>
                <p class="demo-text">
                    The <code>#trigger</code> slot can hold rich content such as icons.
                </p>
            </CaomeiAccordionItem>
        </CaomeiAccordion>
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
