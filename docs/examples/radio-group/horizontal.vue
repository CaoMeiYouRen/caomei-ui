<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiRadioButton, CaomeiRadioGroup } from '@/components/radio-group'

const align = ref<string | number>('left')
</script>

<template>
    <div class="demo-col">
        <CaomeiRadioGroup
            v-model="align"
            orientation="horizontal"
            label="文本对齐"
        >
            <CaomeiRadioButton
                value="left"
                text="左对齐"
            />
            <CaomeiRadioButton
                value="center"
                text="居中"
            />
            <CaomeiRadioButton
                value="right"
                text="右对齐"
            />
        </CaomeiRadioGroup>
        <p class="demo-state">
            当前值：{{ align }}
        </p>
    </div>
</template>

<style scoped>
.demo-col {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.demo-state {
    margin: 0;
    color: var(--caomei-color-text-muted);
    font-size: 14px;
}
</style>
