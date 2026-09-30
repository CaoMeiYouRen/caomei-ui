<script setup lang="ts">
import { computed, onMounted, ref, shallowRef, watch, type Component } from 'vue'
import { useLocale, useLocaleCode } from '../../composables/use-locale'
import type { CaomeiLocale } from '../../locale'
import { useAttrForwarding } from '../_shared/use-attr-forwarding'
import { labelAttrs } from '../_shared/use-label-attrs'
import {
    EDITOR_FALLBACK_LANGUAGE,
    loadEditor,
    registerEditorLanguage,
    type EditorModule,
} from './editor-language'
import type { RichTextEditorProps } from './types'
import { useEditorTheme } from './use-editor-theme'

defineOptions({ name: 'CaomeiRichTextEditor', inheritAttrs: false })

const props = withDefaults(defineProps<RichTextEditorProps>(), {
    // 显式声明默认值：Boolean prop 传 `undefined` 会被 Vue 归一为 false，无法回落到编辑器默认（true）
    preview: true,
})
const model = defineModel<string>({ default: '' })
const emit = defineEmits<{ change: [value: string] }>()

const locale = useLocale()
const localeCode = useLocaleCode()
const { rootAttrs, controlAttrs } = useAttrForwarding()
const isDark = useEditorTheme()

/**
 * 暗色 / 国际化联动：
 * - `theme` 缺省由宿主暗色状态派生（`props.theme` 仅作逃生舱）；
 * - `language` 由宿主 locale 派生，扩展语言在需要时按需加载。
 */
const editorTheme = computed(() => props.theme ?? (isDark.value ? 'dark' : 'light'))
const editorStyle = computed(() => (props.height ? { height: props.height } : undefined))
const statusStyle = computed(() => (props.height ? { minHeight: props.height } : undefined))

const status = ref<'loading' | 'ready' | 'failed'>('loading')
const editorModule = shallowRef<EditorModule | null>(null)
const editorComponent = computed<Component | null>(() => editorModule.value?.MdEditor ?? null)
const activeLanguage = ref(EDITOR_FALLBACK_LANGUAGE)

/** 语言登记序号：快速连续切换时只采纳最后一次请求的结果，避免后到先写。 */
let languageRequest = 0

async function applyLanguage(module: EditorModule, code: CaomeiLocale): Promise<void> {
    const request = ++languageRequest
    const language = await registerEditorLanguage(module, code, devWarn)
    if (request === languageRequest) {
        activeLanguage.value = language
    }
}

function devWarn(message: string): void {
    // 逐级可选访问：兼容消费者注入「不含 env 的 process shim」，保证告警路径自身不抛错。
    // 代价是无法依赖打包器静态替换 process.env.NODE_ENV 做生产裁剪——消费者未定义
    // globalThis.process 时按非生产处理、照常输出（仅用于故障诊断）。
    const env = (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env
    if (env?.NODE_ENV === 'production') {
        return
    }
    console.warn(message)
}

function handleChange(value: string): void {
    emit('change', value)
}

function handleUploadImg(files: File[], callBack: (urls: string[]) => void): void {
    const uploader = props.uploader
    if (!uploader) {
        callBack([])
        return
    }
    Promise.resolve(uploader(files))
        .then((urls) => {
            callBack(urls)
        })
        .catch((error: unknown) => {
            devWarn(`[CaomeiRichTextEditor] 图片上传失败：${String(error)}`)
            callBack([])
        })
}

onMounted(async () => {
    try {
        const module = await loadEditor()
        editorModule.value = module
        await applyLanguage(module, localeCode.value)
        status.value = 'ready'
    } catch (error) {
        status.value = 'failed'
        devWarn(
            `[CaomeiRichTextEditor] 富文本编辑器加载失败，请确认已安装可选依赖 md-editor-v3。${String(error)}`,
        )
    }
})

// locale 运行期切换时重新登记扩展语言；内置语言无需重新注册
watch(localeCode, async (code) => {
    const module = editorModule.value
    if (!module) {
        return
    }
    await applyLanguage(module, code)
})
</script>

<template>
    <div
        class="caomei-rich-text-editor"
        :class="rootAttrs.class"
        :style="rootAttrs.style"
        :role="props.label ? 'group' : undefined"
        v-bind="labelAttrs(props.label)"
    >
        <component
            :is="editorComponent"
            v-if="editorComponent"
            v-model="model"
            class="caomei-rich-text-editor__editor"
            :theme="editorTheme"
            :language="activeLanguage"
            :placeholder="props.placeholder"
            :read-only="props.readonly"
            :disabled="props.disabled"
            :preview="props.preview"
            :toolbars="props.toolbars"
            :no-upload-img="props.noUploadImg"
            :auto-focus="props.autoFocus"
            :max-length="props.maxLength"
            :style="editorStyle"
            :on-change="handleChange"
            :on-upload-img="props.uploader ? handleUploadImg : undefined"
            v-bind="controlAttrs"
        />
        <div
            v-else
            class="caomei-rich-text-editor__status"
            :style="statusStyle"
            :role="status === 'failed' ? 'alert' : 'status'"
        >
            {{ status === 'failed' ? locale.richTextEditor.loadFailed : locale.richTextEditor.loading }}
        </div>
    </div>
</template>

<style scoped>
.caomei-rich-text-editor {
    /* `min-width: 0` 是承重声明：编辑器内核的工具栏为 nowrap，min-content 宽度远大于视口；
       若不归零，本组件作为 grid / flex 项时会被 min-content 撑破父容器，在窄屏下单点抬高整页宽度
       （真实 Chromium 实测：390 视口下页宽 1034）。改由内核工具栏自身横向滚动。
       声明级守卫见 test/contracts/rich-text-editor-layout.test.ts。 */
    box-sizing: border-box;
    min-width: 0;
    width: 100%;
}

.caomei-rich-text-editor__status {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: var(--caomei-rich-text-editor-min-height, 12rem);
    padding: var(--caomei-space-4);
    border: 1px dashed var(--caomei-color-border);
    border-radius: var(--caomei-radius-md);
    background: var(--caomei-color-bg);
    color: var(--caomei-color-text-muted);
    font-family: var(--caomei-font-sans);
    font-size: var(--caomei-font-size-sm);
}

/* 编辑器内核外部化，样式由 md-editor-v3 自带；此处仅约束容器与可选高度覆盖钩子 */
.caomei-rich-text-editor :deep(.md-editor) {
    border-radius: var(--caomei-rich-text-editor-radius, var(--caomei-radius-md));
    border-color: var(--caomei-color-border);
}
</style>
