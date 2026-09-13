<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiRadioButton, CaomeiRadioGroup } from '@/components/radio-group'

const partial = ref<string | number>('a')
const allDisabled = ref<string | number>('b')
const invalid = ref<string | number>()
</script>

<template>
    <div class="demo-col">
        <div>
            <p class="demo-label">
                禁用单项
            </p>
            <CaomeiRadioGroup
                v-model="partial"
                label="含禁用项"
            >
                <CaomeiRadioButton
                    value="a"
                    text="可用项"
                />
                <CaomeiRadioButton
                    value="b"
                    text="禁用项"
                    disabled
                />
            </CaomeiRadioGroup>
        </div>
        <div>
            <p class="demo-label">
                整组禁用
            </p>
            <CaomeiRadioGroup
                v-model="allDisabled"
                disabled
                label="整组禁用"
            >
                <CaomeiRadioButton
                    value="a"
                    text="选项 A"
                />
                <CaomeiRadioButton
                    value="b"
                    text="选项 B"
                />
            </CaomeiRadioGroup>
        </div>
        <div>
            <p class="demo-label">
                校验失败
            </p>
            <CaomeiRadioGroup
                v-model="invalid"
                invalid
                label="校验失败"
            >
                <CaomeiRadioButton
                    value="a"
                    text="选项 A"
                />
                <CaomeiRadioButton
                    value="b"
                    text="选项 B"
                />
            </CaomeiRadioGroup>
        </div>
    </div>
</template>

<style scoped>
.demo-col {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.demo-label {
    margin: 0 0 8px;
    color: var(--caomei-color-text-muted);
    font-size: 13px;
}
</style>
