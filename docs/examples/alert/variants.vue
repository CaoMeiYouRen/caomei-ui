<script setup lang="ts">
import { CaomeiAlert } from '@/components/alert'
import { ref } from 'vue'

const visible = ref(true)
</script>

<template>
    <div class="demo-stack">
        <CaomeiAlert
            tone="primary"
            variant="soft"
            title="计划内维护"
            description="本周日 02:00–04:00 暂停写入。"
        />
        <CaomeiAlert
            tone="success"
            variant="solid"
            title="校验通过"
            description="全部依赖已同步至最新补丁版本。"
        />
        <CaomeiAlert
            v-if="visible"
            tone="danger"
            variant="outline"
            title="存在高危告警"
            description="3 个仓库有未修复的高危依赖漏洞。"
            closable
            @close="visible = false"
        />
    </div>
</template>

<style scoped>
.demo-stack {
    display: grid;
    gap: 12px;
}
</style>
