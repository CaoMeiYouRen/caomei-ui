<script setup lang="ts">
import { ref } from 'vue'
import {
    CaomeiTabContent,
    CaomeiTabList,
    CaomeiTabTrigger,
    CaomeiTabs,
} from '@/components/tabs'

const active = ref<string | number>('account')
</script>

<template>
    <CaomeiTabs v-model="active">
        <CaomeiTabList aria-label="Account settings">
            <CaomeiTabTrigger value="account">
                Account
            </CaomeiTabTrigger>
            <CaomeiTabTrigger value="password">
                Password
            </CaomeiTabTrigger>
            <CaomeiTabTrigger value="team">
                Team
            </CaomeiTabTrigger>
        </CaomeiTabList>
        <CaomeiTabContent value="account">
            <p class="demo-text">
                Update your account details and click save when done.
            </p>
        </CaomeiTabContent>
        <CaomeiTabContent value="password">
            <p class="demo-text">
                Change your password regularly to keep your account secure.
            </p>
        </CaomeiTabContent>
        <CaomeiTabContent value="team">
            <p class="demo-text">
                Invite members to collaborate and assign the right permissions.
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
