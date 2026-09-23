<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiFloatLabel } from '@/components/float-label'
import { CaomeiTagsInput } from '@/components/tags-input'

const requiredTags = ref<string[]>(['重要'])
const invalidTags = ref<string[]>(['待修正'])
</script>

<template>
    <form
        class="demo-stack"
        @submit.prevent
    >
        <CaomeiFloatLabel>
            <CaomeiTagsInput
                id="tags-required"
                v-model="requiredTags"
                name="tags"
                required
            />
            <label for="tags-required">关注标签（必填，有值上浮）</label>
        </CaomeiFloatLabel>
        <CaomeiTagsInput
            v-model="invalidTags"
            label="校验失败与禁用"
            invalid
            disabled
            size="sm"
        />
    </form>
</template>

<style scoped>
.demo-stack {
    display: grid;
    gap: 16px;
    max-width: 320px;
}
</style>
