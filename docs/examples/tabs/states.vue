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
            <CaomeiTabList aria-label="受控示例">
                <CaomeiTabTrigger value="a">
                    可用
                </CaomeiTabTrigger>
                <CaomeiTabTrigger value="b" disabled>
                    禁用
                </CaomeiTabTrigger>
            </CaomeiTabList>
            <CaomeiTabContent value="a">
                <p class="demo-text">
                    当前值：{{ controlled }}
                </p>
            </CaomeiTabContent>
            <CaomeiTabContent value="b">
                <p class="demo-text">
                    禁用项无法通过键盘或指针激活。
                </p>
            </CaomeiTabContent>
        </CaomeiTabs>

        <CaomeiTabs
            default-value="x"
            activation-mode="manual"
        >
            <CaomeiTabList aria-label="手动激活示例">
                <CaomeiTabTrigger value="x">
                    手动
                </CaomeiTabTrigger>
                <CaomeiTabTrigger value="y">
                    激活
                </CaomeiTabTrigger>
            </CaomeiTabList>
            <CaomeiTabContent value="x">
                <p class="demo-text">
                    手动模式下，聚焦不会切换，需点击或按 Enter / 空格。
                </p>
            </CaomeiTabContent>
            <CaomeiTabContent value="y">
                <p class="demo-text">
                    方向键仅移动焦点，不改变内容。
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
