<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiButton } from '@/components/button'
import { CaomeiNavBar } from '@/components/nav-bar'

const title = ref('项目设置')
const backCount = ref(0)

function onBack(): void {
    backCount.value += 1
}
</script>

<template>
    <div class="demo-column">
        <CaomeiNavBar
            :title="title"
            label="项目设置导航"
            @back="onBack"
        >
            <template #end>
                <CaomeiButton
                    size="sm"
                    variant="ghost"
                >
                    保存
                </CaomeiButton>
            </template>
        </CaomeiNavBar>
        <CaomeiNavBar
            title="无返回按钮"
            label="无返回按钮示例"
            :back="false"
            :safe-area="false"
        />
        <p class="demo-hint">
            返回次数：{{ backCount }}
        </p>
    </div>
</template>

<style scoped>
.demo-column {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
    max-width: 420px;
}

.demo-hint {
    margin: 0;
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-sm);
}
</style>
