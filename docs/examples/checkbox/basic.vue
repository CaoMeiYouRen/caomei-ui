<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiCheckbox } from '@/components/checkbox'

const agree = ref(false)
const subscribed = ref(true)
const ariaOnly = ref(false)
</script>

<template>
    <div class="demo-col">
        <CaomeiCheckbox v-model="agree" text="同意用户协议" />
        <CaomeiCheckbox v-model="subscribed">
            <span>
                订阅更新通知，详见
                <a href="#">服务条款</a>
            </span>
        </CaomeiCheckbox>
        <p class="demo-state">
            协议：{{ agree ? '已同意' : '未同意' }}；订阅：{{ subscribed ? '已开启' : '已关闭' }}
        </p>
        <div class="demo-inline">
            <span class="demo-hint">无可见文本时用 label 提供可访问名：</span>
            <CaomeiCheckbox v-model="ariaOnly" label="独立开关" />
        </div>
    </div>
</template>

<style scoped>
.demo-col {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.demo-inline {
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.demo-hint,
.demo-state {
    color: var(--caomei-color-text-muted);
    font-size: 14px;
}

.demo-state {
    margin: 0;
}
</style>
