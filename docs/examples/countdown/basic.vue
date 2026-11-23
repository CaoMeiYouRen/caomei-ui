<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiButton } from '@/components/button'
import { CaomeiCountdown } from '@/components/countdown'

/** 距离演示结束的目标时间：每次点按顺延 65.5 秒，便于反复观察。 */
const deadline = ref(Date.now() + 65_500)
const finished = ref(false)

function restart(): void {
    deadline.value = Date.now() + 65_500
    finished.value = false
}
</script>

<template>
    <div class="demo-column">
        <CaomeiCountdown
            :target="deadline"
            label="距离结束"
            @finish="finished = true"
        />
        <CaomeiCountdown
            :target="deadline"
            format="DD 天 HH 时 mm 分 ss 秒"
        />
        <p class="demo-hint">
            状态：{{ finished ? '已结束' : '进行中' }}（每次点击顺延 65.5 秒）
        </p>
        <CaomeiButton
            variant="secondary"
            @click="restart"
        >
            重新计时
        </CaomeiButton>
    </div>
</template>

<style scoped>
.demo-column {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
    width: 100%;
}

.demo-hint {
    margin: 0;
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-sm);
}
</style>
