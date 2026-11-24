<script setup lang="ts">
import { CaomeiButton } from '@/components/button'
</script>

<template>
    <div class="demo-section">
        <h4>窄容器下的长标签</h4>
        <p class="demo-hint">
            默认单行截断：ja / ko 长标签被省略号收尾。开启 wrap 后按可用宽度折行、高度自适应。
        </p>
        <div class="demo-row">
            <div class="demo-cell">
                <CaomeiButton class="demo-narrow">
                    アカウントの設定を開く
                </CaomeiButton>
                <span class="demo-caption">默认（单行截断）</span>
            </div>
            <div class="demo-cell">
                <CaomeiButton
                    class="demo-narrow"
                    wrap
                >
                    アカウントの設定を開く
                </CaomeiButton>
                <span class="demo-caption">wrap（折行）</span>
            </div>
            <div class="demo-cell">
                <CaomeiButton
                    class="demo-narrow"
                    variant="secondary"
                    wrap
                >
                    계정 설정을 열어 계속 진행하기
                </CaomeiButton>
                <span class="demo-caption">wrap（韩文）</span>
            </div>
        </div>
    </div>
</template>

<style scoped>
.demo-section {
    margin-bottom: 24px;
}

.demo-section h4 {
    margin: 0 0 8px;
    font-size: 14px;
    font-weight: 600;
    color: var(--caomei-color-text);
}

.demo-hint {
    margin: 0 0 12px;
    font-size: 13px;
    color: var(--caomei-color-text-muted);
}

.demo-row {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 16px;
}

/* 窄宽由容器给出；`.demo-narrow` 是父级 scoped 规则直接命中按钮根的演示。 */
.demo-cell {
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-width: 13rem;
}

.demo-narrow {
    width: 100%;
}

.demo-caption {
    font-size: 12px;
    color: var(--caomei-color-text-muted);
}
</style>
