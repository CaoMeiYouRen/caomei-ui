<script setup lang="ts">
import { useData } from 'vitepress'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { CaomeiButton } from '../../../../src/components/button'
import { CaomeiDrawer } from '../../../../src/components/drawer'

/**
 * 文档站设备预览（P1 整页 iframe）。
 *
 * 打开当前文档页的 iframe 副本并切换设备档：iframe 内的 `@media` 按 iframe 自身视口求值，
 * 因此移动端布局是真实断点结果，不是把容器缩窄。主站不刷新；iframe 通过同源 `localStorage`
 * 读取 VitePress 的主题偏好，并在加载后按当前预览态校正 `dark` / `data-theme`。
 *
 * 在 iframe 内（`?device-preview=1`）不渲染入口，避免递归。
 */

const DEVICES = [
    { width: 390, label: '手机 390' },
    { width: 768, label: '平板 768' },
    { width: 1024, label: '小桌面 1024' },
    { width: 1280, label: '桌面 1280' },
] as const

const { isDark, lang } = useData()

const mounted = ref(false)
const isPreviewPage = ref(false)
const open = ref(false)
const width = ref<number>(390)
const dark = ref(false)
const src = ref('')
const frameKey = ref(0)
const iframe = ref<HTMLIFrameElement | null>(null)

const copy = computed(() => (lang.value === 'en-US'
    ? {
            trigger: 'Device preview',
            title: 'Device preview',
            description: 'The page inside a real viewport; media queries use the iframe width.',
            theme: 'Theme',
            light: 'Light',
            dark: 'Dark',
            reload: 'Reload',
            frameTitle: 'Documentation page in a device viewport',
        }
    : {
            trigger: '设备预览',
            title: '设备预览',
            description: '在真实视口中查看当前页；媒体查询按 iframe 宽度求值。',
            theme: '主题',
            light: '亮色',
            dark: '暗色',
            reload: '刷新',
            frameTitle: '设备视口中的文档页',
        }))

onMounted(() => {
    mounted.value = true
    isPreviewPage.value = new URLSearchParams(window.location.search).has('device-preview')
    dark.value = isDark.value
})

/** 当前页的 iframe 地址：保留路径、查询参数与 hash，只追加预览标记。 */
function buildSrc(): string {
    const url = new URL(window.location.href)
    url.searchParams.set('device-preview', '1')
    return `${url.pathname}${url.search}${url.hash}`
}

function openPreview(): void {
    src.value = buildSrc()
    dark.value = isDark.value
    open.value = true
    void nextTick(applyTheme)
}

function reload(): void {
    src.value = buildSrc()
    frameKey.value += 1
}

function applyTheme(): void {
    const frame = iframe.value
    if (!frame) {
        return
    }
    const documentElement = frame.contentWindow?.document.documentElement
    if (!documentElement) {
        return
    }
    documentElement.classList.toggle('dark', dark.value)
    documentElement.setAttribute('data-theme', dark.value ? 'dark' : 'light')
}

watch(isDark, (value) => {
    dark.value = value
    void nextTick(applyTheme)
})

watch(dark, () => {
    void nextTick(applyTheme)
})
</script>

<template>
    <div
        v-if="mounted && !isPreviewPage"
        class="device-preview"
    >
        <CaomeiButton
            variant="ghost"
            size="sm"
            @click="openPreview"
        >
            {{ copy.trigger }}
        </CaomeiButton>
        <CaomeiDrawer
            v-model:open="open"
            position="right"
            :title="copy.title"
            :description="copy.description"
            :style="{'--caomei-drawer-size': 'min(96vw, 1400px)'}"
        >
            <div class="device-preview__toolbar">
                <div
                    class="device-preview__devices"
                    role="group"
                    :aria-label="copy.trigger"
                >
                    <button
                        v-for="device in DEVICES"
                        :key="device.width"
                        type="button"
                        class="device-preview__option"
                        :aria-pressed="width === device.width"
                        @click="width = device.width"
                    >
                        {{ device.label }}
                    </button>
                </div>
                <div class="device-preview__actions">
                    <div
                        class="device-preview__devices"
                        role="group"
                        :aria-label="copy.theme"
                    >
                        <button
                            type="button"
                            class="device-preview__option"
                            :aria-pressed="!dark"
                            @click="dark = false"
                        >
                            {{ copy.light }}
                        </button>
                        <button
                            type="button"
                            class="device-preview__option"
                            :aria-pressed="dark"
                            @click="dark = true"
                        >
                            {{ copy.dark }}
                        </button>
                    </div>
                    <CaomeiButton
                        variant="secondary"
                        size="sm"
                        @click="reload"
                    >
                        {{ copy.reload }}
                    </CaomeiButton>
                </div>
            </div>
            <div class="device-preview__stage">
                <iframe
                    v-if="open && src"
                    :key="frameKey"
                    ref="iframe"
                    class="device-preview__frame"
                    :src="src"
                    :title="copy.frameTitle"
                    :style="{width: `${width}px`}"
                    @load="applyTheme"
                />
            </div>
        </CaomeiDrawer>
    </div>
</template>

<style scoped>
.device-preview {
    display: inline-flex;
    align-items: center;
}

.device-preview__toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: var(--caomei-space-2);
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--caomei-space-3);
}

.device-preview__devices {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 2px;
    padding: 2px;
    border: 1px solid var(--caomei-color-border);
    border-radius: var(--caomei-radius-md);
    background: var(--caomei-color-bg-elevated);
}

.device-preview__option {
    padding: 4px 10px;
    border: 0;
    border-radius: var(--caomei-radius-sm);
    background: transparent;
    color: var(--caomei-color-text-muted);
    font: inherit;
    font-size: var(--caomei-font-size-sm);
    cursor: pointer;
}

.device-preview__option:hover {
    color: var(--caomei-color-text);
}

.device-preview__option:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 1px;
}

.device-preview__option[aria-pressed='true'] {
    /* 自适应 `primary` 作实底时，前景必须用配套的 `primary-foreground`；
       `primary-text` 是「柔和底上的蓝字」语义（暗色下等于 primary 本身），用在实底上不可读。
       注意 `-solid` 实底不走这条配对（见 `src/styles/theme.css` 文件头的 token 禁令）。 */
    background: var(--caomei-color-primary);
    color: var(--caomei-color-primary-foreground);
}

.device-preview__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--caomei-space-2);
    align-items: center;
}

.device-preview__stage {
    display: flex;
    height: 100%;
    min-height: 60vh;
    justify-content: center;
    overflow: auto;
    border: 1px solid var(--caomei-color-border);
    border-radius: var(--caomei-radius-md);
    background: var(--caomei-color-bg);
}

.device-preview__frame {
    max-width: 100%;
    height: 100%;
    min-height: 60vh;
    border: 0;
    background: var(--caomei-color-bg);
}
</style>
