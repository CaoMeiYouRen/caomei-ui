<script setup lang="ts">
import { Settings } from '@lucide/vue'
import { CaomeiAccordion, CaomeiAccordionItem } from '@/components/accordion'
import { CaomeiIcon } from '@/icons'
</script>

<template>
    <div class="demo-column">
        <CaomeiAccordion default-value="a" collapsible>
            <CaomeiAccordionItem value="a" title="默认展开">
                <p class="demo-text">
                    通过 defaultValue 指定初始展开项。
                </p>
            </CaomeiAccordionItem>
            <CaomeiAccordionItem
                value="b"
                title="禁用条目"
                disabled
            >
                <p class="demo-text">
                    禁用条目无法展开，也不参与键盘导航。
                </p>
            </CaomeiAccordionItem>
        </CaomeiAccordion>

        <CaomeiAccordion>
            <CaomeiAccordionItem value="custom">
                <template #trigger>
                    <CaomeiIcon :icon="Settings" />
                    自定义触发器
                </template>
                <p class="demo-text">
                    通过 <code>#trigger</code> 插槽可放置图标等富内容。
                </p>
            </CaomeiAccordionItem>
        </CaomeiAccordion>
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
