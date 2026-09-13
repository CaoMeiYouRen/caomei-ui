<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiAccordion, CaomeiAccordionItem } from '@/components/accordion'

const open = ref<string[]>(['account'])
</script>

<template>
    <CaomeiAccordion v-model="open" type="multiple">
        <CaomeiAccordionItem value="account" title="Account">
            <p class="demo-text">
                Maintain your nickname, avatar and contact details.
            </p>
        </CaomeiAccordionItem>
        <CaomeiAccordionItem value="security" title="Security">
            <p class="demo-text">
                Manage signed-in devices and two-factor authentication.
            </p>
        </CaomeiAccordionItem>
        <CaomeiAccordionItem value="notice" title="Notifications">
            <p class="demo-text">
                Set the scope of in-app and email notifications.
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
