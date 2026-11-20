<template>
    <div class="safe-area-demo">
        <div class="safe-area-demo__frame">
            <div class="caomei-safe-area-top caomei-safe-area-x safe-area-demo__zone">
                <span class="safe-area-demo__label">顶部安全区 34px</span>
            </div>
            <div class="caomei-safe-area-x safe-area-demo__zone safe-area-demo__zone--grow">
                <span class="safe-area-demo__label">内容区</span>
            </div>
            <div class="caomei-safe-area-bottom caomei-safe-area-x safe-area-demo__zone">
                <span class="safe-area-demo__label">底部操作栏：安全区 34px</span>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* 真机上这组 token 取自 env()；演示固定 34px / 16px 以便观察。 */
.safe-area-demo__frame {
    --caomei-safe-area-top: 34px;
    --caomei-safe-area-right: 16px;
    --caomei-safe-area-bottom: 34px;
    --caomei-safe-area-left: 16px;

    display: flex;
    flex-direction: column;
    width: min(280px, 100%);
    height: 260px;
    overflow: hidden;

    /* 安全区带用 primary 浅混色染出，与白色内容区分开。 */
    background: color-mix(in srgb, var(--caomei-color-primary) 10%, var(--caomei-color-bg));
    border: 1px solid var(--caomei-color-border);
    border-radius: var(--caomei-radius-lg);
}

/* `content-box` 裁切：内边距区域透明，露出外框底色，安全区宽度可见。 */
.safe-area-demo__zone {
    display: flex;
    background-color: var(--caomei-color-bg);
    background-clip: content-box;
    border-bottom: 1px dashed var(--caomei-color-border);
}

.safe-area-demo__zone--grow {
    flex: 1;
}

.safe-area-demo__label {
    margin: auto;
    padding: var(--caomei-space-1) var(--caomei-space-2);
    font-size: var(--caomei-font-size-sm);
    color: var(--caomei-color-text);
    background: var(--caomei-color-bg);
    border: 1px solid var(--caomei-color-border);
    border-radius: var(--caomei-radius-sm);
}
</style>
