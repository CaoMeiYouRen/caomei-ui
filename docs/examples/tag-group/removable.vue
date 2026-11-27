<script setup lang="ts">
import { ref } from 'vue'
import { X } from '@lucide/vue'
import { CaomeiIcon } from '@/icons'
import {
    CaomeiTagGroup,
    CaomeiTagGroupItem,
    CaomeiTagGroupItemDelete,
    CaomeiTagGroupItemText,
} from '@/components/tag-group'

const filters = ref(['近一周', '未读', '含附件'])

function onRemove(value: string): void {
    filters.value = filters.value.filter((item) => item !== value)
}
</script>

<template>
    <div class="tag-group-demo">
        <CaomeiTagGroup
            :model-value="filters"
            aria-label="已启用的筛选条件"
            @remove="onRemove"
        >
            <CaomeiTagGroupItem
                v-for="filter in filters"
                :key="filter"
                :value="filter"
            >
                <CaomeiTagGroupItemText>{{ filter }}</CaomeiTagGroupItemText>
                <CaomeiTagGroupItemDelete :label="`移除 ${filter}`">
                    <CaomeiIcon :icon="X" />
                </CaomeiTagGroupItemDelete>
            </CaomeiTagGroupItem>
        </CaomeiTagGroup>
        <p class="tag-group-demo__hint">
            {{ filters.length ? `剩余 ${filters.length} 个筛选条件` : '筛选条件已清空' }}
        </p>
    </div>
</template>

<style scoped>
.tag-group-demo {
    display: flex;
    flex-direction: column;
    gap: var(--caomei-space-2);
}

.tag-group-demo__hint {
    margin: 0;
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-sm);
}
</style>
