<script setup lang="ts">
import { ref } from 'vue'
import {
    CaomeiEditable,
    CaomeiEditableArea,
    CaomeiEditableInput,
    CaomeiEditablePreview,
} from '@/components/editable'

const title = ref('季度经营分析')
</script>

<template>
    <div class="editable-demo">
        <p class="editable-demo__label">
            文档标题
        </p>
        <CaomeiEditable
            v-model="title"
            placeholder="点击输入标题"
        >
            <CaomeiEditableArea>
                <CaomeiEditablePreview />
                <CaomeiEditableInput label="文档标题" />
            </CaomeiEditableArea>
        </CaomeiEditable>
        <p class="editable-demo__hint">
            聚焦预览区即可编辑，回车提交、Esc 回退。
        </p>
    </div>
</template>

<style scoped>
.editable-demo {
    display: flex;
    flex-direction: column;
    gap: var(--caomei-space-2);
}

.editable-demo__label {
    margin: 0;
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-sm);
}

.editable-demo__hint {
    margin: 0;
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-sm);
}
</style>
