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
        <CaomeiTabList aria-label="账户设置">
            <CaomeiTabTrigger value="account">
                账户
            </CaomeiTabTrigger>
            <CaomeiTabTrigger value="password">
                密码
            </CaomeiTabTrigger>
            <CaomeiTabTrigger value="team">
                团队
            </CaomeiTabTrigger>
        </CaomeiTabList>
        <CaomeiTabContent value="account">
            <p class="demo-text">
                修改账户信息，完成后点击保存。
            </p>
        </CaomeiTabContent>
        <CaomeiTabContent value="password">
            <p class="demo-text">
                定期更换密码可提升账户安全性。
            </p>
        </CaomeiTabContent>
        <CaomeiTabContent value="team">
            <p class="demo-text">
                邀请成员加入协作，并分配相应权限。
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
