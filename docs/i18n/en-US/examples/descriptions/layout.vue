<script setup lang="ts">
import { CaomeiDescriptions, CaomeiDescriptionsItem } from '@/components/descriptions'
</script>

<template>
    <div class="descriptions-demo">
        <CaomeiDescriptions
            bordered
            :columns="2"
        >
            <CaomeiDescriptionsItem label="Project">
                caomei-ui
            </CaomeiDescriptionsItem>
            <CaomeiDescriptionsItem label="Version">
                1.3.0
            </CaomeiDescriptionsItem>
            <CaomeiDescriptionsItem
                label="Summary"
                :span="2"
            >
                The bordered look renders each entry as a table cell, fitting the basic info block of a detail page.
            </CaomeiDescriptionsItem>
        </CaomeiDescriptions>

        <CaomeiDescriptions
            layout="vertical"
            :columns="3"
        >
            <CaomeiDescriptionsItem label="Owner">
                Jane Doe
            </CaomeiDescriptionsItem>
            <CaomeiDescriptionsItem label="Phone">
                138-0000-0000
            </CaomeiDescriptionsItem>
            <CaomeiDescriptionsItem label="Team">
                Platform
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
