<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiRadioButton, CaomeiRadioGroup } from '@/components/radio-group'

const plan = ref('standard')
</script>

<template>
    <div class="demo-col">
        <CaomeiRadioGroup
            v-model="plan"
            label="订阅方案"
        >
            <CaomeiRadioButton
                value="free"
                text="免费版"
            />
            <CaomeiRadioButton
                value="standard"
                text="标准版"
            />
            <CaomeiRadioButton
                value="pro"
                text="专业版"
            />
        </CaomeiRadioGroup>
        <p class="demo-state">
            当前方案：{{ plan }}
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
