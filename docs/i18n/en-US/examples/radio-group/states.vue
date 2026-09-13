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
                Per-item disabled
            </p>
            <CaomeiRadioGroup
                v-model="partial"
                label="With a disabled item"
            >
                <CaomeiRadioButton
                    value="a"
                    text="Enabled"
                />
                <CaomeiRadioButton
                    value="b"
                    text="Disabled"
                    disabled
                />
            </CaomeiRadioGroup>
        </div>
        <div>
            <p class="demo-label">
                Whole group disabled
            </p>
            <CaomeiRadioGroup
                v-model="allDisabled"
                disabled
                label="Whole group disabled"
            >
                <CaomeiRadioButton
                    value="a"
                    text="Option A"
                />
                <CaomeiRadioButton
                    value="b"
                    text="Option B"
                />
            </CaomeiRadioGroup>
        </div>
        <div>
            <p class="demo-label">
                Invalid
            </p>
            <CaomeiRadioGroup
                v-model="invalid"
                invalid
                label="Invalid"
            >
                <CaomeiRadioButton
                    value="a"
                    text="Option A"
                />
                <CaomeiRadioButton
                    value="b"
                    text="Option B"
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
