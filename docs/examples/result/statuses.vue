<script setup lang="ts">
import { CaomeiResult } from '@/components/result'
</script>

<template>
    <div class="result-statuses">
        <CaomeiResult
            status="403"
            title="没有访问权限"
            description="请联系管理员开通权限后再试。"
        />
        <CaomeiResult
            status="404"
            title="页面不存在"
            description="链接可能已失效，请返回上一页。"
        />
        <CaomeiResult
            status="500"
            title="服务暂时不可用"
            description="请稍后重试；问题持续时请联系支持。"
        />
    </div>
</template>

<style scoped>
.result-statuses {
    display: grid;
    gap: var(--caomei-space-4);
    grid-template-columns: repeat(auto-fit, minmax(min(16rem, 100%), 1fr));
}
</style>
