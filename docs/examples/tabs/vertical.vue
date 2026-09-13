<script setup lang="ts">
import { ref } from 'vue'
import {
    CaomeiTabContent,
    CaomeiTabList,
    CaomeiTabTrigger,
    CaomeiTabs,
} from '@/components/tabs'

const active = ref<string | number>('profile')
</script>

<template>
    <CaomeiTabs
        v-model="active"
        orientation="vertical"
    >
        <CaomeiTabList aria-label="账号面板">
            <CaomeiTabTrigger value="profile">
                个人资料
            </CaomeiTabTrigger>
            <CaomeiTabTrigger value="security">
                安全设置
            </CaomeiTabTrigger>
            <CaomeiTabTrigger value="notice">
                通知偏好
            </CaomeiTabTrigger>
        </CaomeiTabList>
        <CaomeiTabContent value="profile">
            <p class="demo-text">
                维护头像、昵称与联系方式。
            </p>
        </CaomeiTabContent>
        <CaomeiTabContent value="security">
            <p class="demo-text">
                管理登录设备、密码与两步验证。
            </p>
        </CaomeiTabContent>
        <CaomeiTabContent value="notice">
            <p class="demo-text">
                设置站内信与邮件的接收范围。
            </p>
        </CaomeiTabContent>
    </CaomeiTabs>
</template>

<style scoped>
.demo-text {
    margin: 0;
    color: var(--vp-c-text-2);
    font-size: 14px;
}
</style>
