<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { warnDev } from '../../_shared/dev-warn'
import { useLocale } from '../../composables/use-locale'
import { loadQRCode } from './qrcode-loader'
import type { QRCodeProps, QRCodeSlotProps } from './types'

defineOptions({ name: 'CaomeiQRCode' })

const props = withDefaults(defineProps<QRCodeProps>(), {
    size: 160,
    level: 'M',
    margin: 2,
    color: '#000000',
    background: '#ffffff',
    icon: undefined,
    iconSize: 0.2,
    label: undefined,
})

const messages = useLocale()
const locale = computed(() => messages.value.qrcode)

const status = ref<'loading' | 'ready' | 'failed'>('loading')
const dataUrl = ref('')
/** 渲染请求序号：异步编码回来时只接受最新一次，避免快速改值时旧结果覆盖新值 */
let requestId = 0

/** 可访问名：显式 `label`（含空串 = 装饰性图片）优先，否则取当前语言文案 */
const accessibleLabel = computed(() => props.label ?? locale.value.label)

/** 尺寸兜底：非有限数 / 非正数回退默认值，避免写出 `NaNpx` 与无效编码宽度 */
const edge = computed(() => {
    const size = props.size
    return Number.isFinite(size) && size > 0 ? size : 160
})

const safeMargin = computed(() => {
    const margin = props.margin
    return Number.isFinite(margin) && margin >= 0 ? margin : 0
})

const iconRatio = computed(() => {
    const ratio = props.iconSize
    return Number.isFinite(ratio) ? Math.min(Math.max(ratio, 0), 0.3) : 0.2
})
const iconPixels = computed(() => Math.round(edge.value * iconRatio.value))

const rootStyle = computed(() => ({ width: `${edge.value}px` }))
/**
 * 正方形 stage：就绪态固定为边长并裁剪圆角；加载 / 失败态允许按文案撑高，
 * 避免小尺寸（如 64px）下的失败文案被拦腰截断。
 */
const stageStyle = computed(() => ({
    width: `${edge.value}px`,
    ...(dataUrl.value ? { height: `${edge.value}px` } : { minHeight: `${edge.value}px` }),
    background: props.background,
}))

const iconStyle = computed(() => ({
    width: `${iconPixels.value}px`,
    height: `${iconPixels.value}px`,
    padding: `${Math.max(Math.round(iconPixels.value * 0.1), 2)}px`,
    background: props.background,
}))

/**
 * 生成二维码图片。
 *
 * 内核为可选 peer，按需加载；加载或编码失败时**清空旧图**并给出失败文案
 * （保留旧图会让用户扫到与当前 `value` 不一致的内容），不抛未捕获异常。
 */
async function render(): Promise<void> {
    const current = ++requestId
    try {
        const { toDataURL } = await loadQRCode()
        const url = await toDataURL(props.value, {
            width: edge.value,
            margin: safeMargin.value,
            errorCorrectionLevel: props.level,
            color: { dark: props.color, light: props.background },
        })
        if (current !== requestId) {
            return
        }
        dataUrl.value = url
        status.value = 'ready'
    } catch (error) {
        if (current !== requestId) {
            return
        }
        dataUrl.value = ''
        status.value = 'failed'
        warnDev(
            `[CaomeiQRCode] 二维码生成失败，请确认已安装可选依赖 qrcode 且内容可编码。${String(error)}`,
        )
    }
}

onMounted(render)

onUnmounted(() => {
    // 使在飞请求失效，卸载后不再写状态
    requestId++
})

watch(
    () => [props.value, props.size, props.margin, props.level, props.color, props.background],
    () => {
        void render()
    },
)

defineSlots<{
    /** 自定义居中图标内容；提供时忽略 `icon` prop */
    icon?: (props: QRCodeSlotProps) => unknown
    /** 二维码下方的补充内容（说明 / 文本），在流内占据高度 */
    default?: (props: QRCodeSlotProps) => unknown
}>()
</script>

<template>
    <div
        class="caomei-qrcode"
        :style="rootStyle"
    >
        <div
            class="caomei-qrcode__stage"
            :class="{'caomei-qrcode__stage--ready': dataUrl}"
            :style="stageStyle"
        >
            <img
                v-if="dataUrl"
                class="caomei-qrcode__image"
                :src="dataUrl"
                :alt="accessibleLabel"
            >
            <span
                v-else
                class="caomei-qrcode__status"
                :role="status === 'failed' ? 'alert' : 'status'"
            >
                {{ status === 'failed' ? locale.loadFailed : locale.loading }}
            </span>
            <span
                v-if="dataUrl && ($slots.icon || icon)"
                class="caomei-qrcode__icon"
                :style="iconStyle"
            >
                <slot
                    name="icon"
                    :status="status"
                    :value="value"
                >
                    <img
                        class="caomei-qrcode__icon-image"
                        :src="icon"
                        alt=""
                        aria-hidden="true"
                    >
                </slot>
            </span>
        </div>
        <div
            v-if="$slots.default"
            class="caomei-qrcode__caption"
        >
            <slot
                :status="status"
                :value="value"
            />
        </div>
    </div>
</template>

<style scoped>
.caomei-qrcode {
    display: inline-flex;
    flex-direction: column;
    flex-shrink: 0;
    align-items: stretch;
    box-sizing: border-box;
    color: var(--caomei-color-text-muted);
    font-family: var(--caomei-font-sans);
    font-size: var(--caomei-font-size-sm);
    line-height: 1.4;
}

.caomei-qrcode__stage {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    border-radius: var(--caomei-qrcode-radius, var(--caomei-radius-sm));
}

.caomei-qrcode__stage--ready {
    overflow: hidden;
}

.caomei-qrcode__image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.caomei-qrcode__status {
    padding: var(--caomei-space-2);
    text-align: center;
}

.caomei-qrcode__icon {
    position: absolute;
    top: 50%;
    left: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    border-radius: var(--caomei-qrcode-icon-radius, var(--caomei-radius-sm));
    transform: translate(-50%, -50%);
}

.caomei-qrcode__icon-image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.caomei-qrcode__caption {
    margin-top: var(--caomei-space-1);
    color: var(--caomei-color-text-muted);
    text-align: center;
}
</style>
