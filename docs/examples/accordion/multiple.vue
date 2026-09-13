<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiAccordion, CaomeiAccordionItem } from '@/components/accordion'

const open = ref<string[]>(['account'])
</script>

<template>
    <CaomeiAccordion v-model="open" type="multiple">
        <CaomeiAccordionItem value="account" title="账户信息">
            <p class="demo-text">
                维护昵称、头像与联系方式。
            </p>
        </CaomeiAccordionItem>
        <CaomeiAccordionItem value="security" title="安全设置">
            <p class="demo-text">
                管理登录设备与两步验证。
            </p>
        </CaomeiAccordionItem>
        <CaomeiAccordionItem value="notice" title="通知偏好">
            <p class="demo-text">
                设置站内信与邮件的接收范围。
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
