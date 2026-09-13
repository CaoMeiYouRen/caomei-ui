<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiAccordion, CaomeiAccordionItem } from '@/components/accordion'

const open = ref<string | string[] | undefined>('shipping')
</script>

<template>
    <CaomeiAccordion v-model="open" collapsible>
        <CaomeiAccordionItem value="shipping" title="Shipping">
            <p class="demo-text">
                Standard and express shipping are available; orders ship within 48 hours by default.
            </p>
        </CaomeiAccordionItem>
        <CaomeiAccordionItem value="payment" title="Payment">
            <p class="demo-text">
                Credit cards, Alipay and WeChat Pay are supported.
            </p>
        </CaomeiAccordionItem>
        <CaomeiAccordionItem value="refund" title="Refund policy">
            <p class="demo-text">
                A no-questions-asked refund can be requested within 7 days of delivery.
            </p>
        </CaomeiAccordionItem>
    </CaomeiAccordion>
</template>

<style scoped>
.demo-text {
    margin: 0;
    color: var(--vp-c-text-2);
    font-size: 14px;
}
</style>
