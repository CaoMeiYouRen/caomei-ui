<script setup lang="ts">
import { CaomeiDescriptions, CaomeiDescriptionsItem } from '@/components/descriptions'
</script>

<template>
    <div class="descriptions-demo">
        <CaomeiDescriptions
            bordered
            :columns="2"
        >
            <CaomeiDescriptionsItem label="项目名称">
                草梅 UI
            </CaomeiDescriptionsItem>
            <CaomeiDescriptionsItem label="版本">
                1.3.0
            </CaomeiDescriptionsItem>
            <CaomeiDescriptionsItem
                label="说明"
                :span="2"
            >
                带边框形态把每个条目渲染为表格单元，适合详情页的基础信息区。
            </CaomeiDescriptionsItem>
        </CaomeiDescriptions>

        <CaomeiDescriptions
            layout="vertical"
            :columns="3"
        >
            <CaomeiDescriptionsItem label="负责人">
                张三
            </CaomeiDescriptionsItem>
            <CaomeiDescriptionsItem label="联系方式">
                138-0000-0000
            </CaomeiDescriptionsItem>
            <CaomeiDescriptionsItem label="所属团队">
                平台组
            </CaomeiDescriptionsItem>
        </CaomeiDescriptions>
    </div>
</template>

<style scoped>
.descriptions-demo {
    display: flex;
    flex-direction: column;
    gap: var(--caomei-space-4);
}
</style>
