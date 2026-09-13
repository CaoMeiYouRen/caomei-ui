<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiAccordion, CaomeiAccordionItem } from '@/components/accordion'

const open = ref<string | string[] | undefined>('shipping')
</script>

<template>
    <CaomeiAccordion v-model="open" collapsible>
        <CaomeiAccordionItem value="shipping" title="配送方式">
            <p class="demo-text">
                支持标准配送与加急配送，默认 48 小时内发货。
            </p>
        </CaomeiAccordionItem>
        <CaomeiAccordionItem value="payment" title="支付方式">
            <p class="demo-text">
                支持信用卡、支付宝与微信支付。
            </p>
        </CaomeiAccordionItem>
        <CaomeiAccordionItem value="refund" title="退款政策">
            <p class="demo-text">
                签收后 7 天内可申请无理由退款。
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
