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
        <CaomeiTabList aria-label="Account panels">
            <CaomeiTabTrigger value="profile">
                Profile
            </CaomeiTabTrigger>
            <CaomeiTabTrigger value="security">
                Security
            </CaomeiTabTrigger>
            <CaomeiTabTrigger value="notice">
                Notifications
            </CaomeiTabTrigger>
        </CaomeiTabList>
        <CaomeiTabContent value="profile">
            <p class="demo-text">
                Maintain your avatar, display name and contact details.
            </p>
        </CaomeiTabContent>
        <CaomeiTabContent value="security">
            <p class="demo-text">
                Manage signed-in devices, your password and two-factor authentication.
            </p>
        </CaomeiTabContent>
        <CaomeiTabContent value="notice">
            <p class="demo-text">
                Set the scope of in-app and email notifications.
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
