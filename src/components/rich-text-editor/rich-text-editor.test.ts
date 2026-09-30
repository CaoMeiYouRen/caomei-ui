import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CaomeiConfigProvider } from '../config-provider'
import CaomeiRichTextEditor from './rich-text-editor.vue'

/**
 * 仅替换 `loadEditor`（把可选 peer 的内核换成本地桩），其余语言映射逻辑走真实实现，
 * 避免在单测里加载真实 `md-editor-v3`（其默认配置会在 happy-dom 中尝试拉取 CDN 资源）。
 */
const mocks = vi.hoisted(() => ({
    loadEditor: vi.fn(),
    config: vi.fn(),
}))

vi.mock('./editor-language', async (importOriginal) => {
    const actual = await importOriginal<typeof import('./editor-language')>()
    return { ...actual, loadEditor: mocks.loadEditor }
})

vi.mock('@vavt/cm-extension/dist/locale/zh-TW.js', () => ({ default: { id: 'zh-TW-stub' } }))
vi.mock('@vavt/cm-extension/dist/locale/jp-JP.js', () => ({ default: { id: 'jp-JP-stub' } }))
vi.mock('@vavt/cm-extension/dist/locale/ko-KR.js', () => ({ default: { id: 'ko-KR-stub' } }))

const MdEditorStub = defineComponent({
    name: 'MdEditorStub',
    props: {
        modelValue: { type: String, default: '' },
        theme: { type: String, default: 'light' },
        language: { type: String, default: 'zh-CN' },
        placeholder: { type: String, default: undefined },
        readOnly: { type: Boolean, default: false },
        disabled: { type: Boolean, default: false },
        preview: { type: Boolean, default: true },
        toolbars: { type: Array, default: undefined },
        noUploadImg: { type: Boolean, default: false },
        autoFocus: { type: Boolean, default: false },
        maxLength: { type: Number, default: undefined },
        onChange: { type: Function, default: undefined },
        onUploadImg: { type: Function, default: undefined },
    },
    emits: ['update:modelValue'],
    setup(props, { emit }) {
        return () => h('div', {
            class: 'md-editor-stub',
            'data-theme': props.theme,
            'data-language': props.language,
        }, h('textarea', {
            class: 'md-editor-stub__input',
            value: props.modelValue,
            onInput: (event: Event) => {
                emit('update:modelValue', (event.target as HTMLTextAreaElement).value)
            },
        }))
    },
})

function editorOf(wrapper: ReturnType<typeof mount>) {
    return wrapper.findComponent({ name: 'MdEditorStub' })
}

async function mountReady(props: Record<string, unknown> = {}, options: Record<string, unknown> = {}) {
    const wrapper = mount(CaomeiRichTextEditor, { props, ...options })
    await flushPromises()
    return wrapper
}

beforeEach(() => {
    mocks.config.mockClear()
    mocks.loadEditor.mockReset()
    mocks.loadEditor.mockResolvedValue({ MdEditor: MdEditorStub, config: mocks.config })
    document.documentElement.className = ''
    delete document.documentElement.dataset.theme
    delete document.documentElement.dataset.scheme
})

afterEach(() => {
    document.documentElement.className = ''
    delete document.documentElement.dataset.theme
    delete document.documentElement.dataset.scheme
})

describe('CaomeiRichTextEditor 加载与降级', () => {
    it('挂载前渲染加载占位，加载完成后渲染编辑器', async () => {
        const wrapper = mount(CaomeiRichTextEditor)
        expect(wrapper.find('.caomei-rich-text-editor__status').attributes('role')).toBe('status')
        expect(wrapper.find('.caomei-rich-text-editor__status').text()).toBe('正在加载编辑器…')

        await flushPromises()
        expect(wrapper.find('.md-editor-stub').exists()).toBe(true)
        expect(wrapper.find('.caomei-rich-text-editor__status').exists()).toBe(false)
    })
})

describe('CaomeiRichTextEditor 透传', () => {
    it('透传 placeholder / readonly / disabled / preview / toolbars / noUploadImg / autoFocus / maxLength', async () => {
        const wrapper = await mountReady({
            placeholder: '输入正文',
            readonly: true,
            disabled: true,
            preview: false,
            toolbars: ['bold', 'preview'],
            noUploadImg: true,
            autoFocus: true,
            maxLength: 100,
        })
        const editor = editorOf(wrapper)
        expect(editor.props('placeholder')).toBe('输入正文')
        expect(editor.props('readOnly')).toBe(true)
        expect(editor.props('disabled')).toBe(true)
        expect(editor.props('preview')).toBe(false)
        expect(editor.props('toolbars')).toEqual(['bold', 'preview'])
        expect(editor.props('noUploadImg')).toBe(true)
        expect(editor.props('autoFocus')).toBe(true)
        expect(editor.props('maxLength')).toBe(100)
    })

    it('缺省 preview 使用编辑器默认（true）', async () => {
        const wrapper = await mountReady()
        expect(editorOf(wrapper).props('preview')).toBe(true)
    })

    it('height 落到编辑器 style', async () => {
        const wrapper = await mountReady({ height: '20rem' })
        expect(wrapper.find('.md-editor-stub').attributes('style')).toContain('height: 20rem')
    })

    it('class / style 落在组件根，其余属性透传到编辑器', async () => {
        const wrapper = await mountReady({}, { attrs: { class: 'my-editor', 'data-test': 'x' } })
        const root = wrapper.find('.caomei-rich-text-editor')
        expect(root.classes()).toContain('my-editor')
        expect(editorOf(wrapper).attributes('data-test')).toBe('x')
    })

    it('label 渲染为根 role="group" 与 aria-label', async () => {
        const wrapper = await mountReady({ label: '正文编辑器' })
        const root = wrapper.find('.caomei-rich-text-editor')
        expect(root.attributes('role')).toBe('group')
        expect(root.attributes('aria-label')).toBe('正文编辑器')
    })
})

describe('CaomeiRichTextEditor v-model 与事件', () => {
    it('v-model 双向绑定', async () => {
        const wrapper = await mountReady({ modelValue: '# 标题' })
        const input = editorOf(wrapper).find('.md-editor-stub__input')
        expect((input.element as HTMLTextAreaElement).value).toBe('# 标题')

        await input.setValue('# 新标题')
        expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['# 新标题'])
    })

    it('编辑器 change 事件转发为组件 change 事件', async () => {
        const wrapper = await mountReady()
        const onChange = editorOf(wrapper).props('onChange') as (value: string) => void
        onChange('# 变化')
        expect(wrapper.emitted('change')?.at(-1)).toEqual(['# 变化'])
    })
})

describe('CaomeiRichTextEditor 暗色联动', () => {
    it('根元素挂 .dark 时 theme 为 dark，切换为 .light 时跟随', async () => {
        const wrapper = await mountReady()
        expect(editorOf(wrapper).props('theme')).toBe('light')

        document.documentElement.classList.add('dark')
        await nextTick()
        await flushPromises()
        expect(editorOf(wrapper).props('theme')).toBe('dark')

        document.documentElement.classList.remove('dark')
        document.documentElement.classList.add('light')
        await nextTick()
        await flushPromises()
        expect(editorOf(wrapper).props('theme')).toBe('light')
    })

    it('data-theme="dark" 与 data-scheme="auto" 均被识别', async () => {
        const wrapper = await mountReady()
        document.documentElement.dataset.theme = 'dark'
        await nextTick()
        await flushPromises()
        expect(editorOf(wrapper).props('theme')).toBe('dark')

        delete document.documentElement.dataset.theme
        document.documentElement.dataset.scheme = 'auto'
        await nextTick()
        await flushPromises()
        // 测试环境 prefers-color-scheme 默认非暗色
        expect(editorOf(wrapper).props('theme')).toBe('light')
    })

    it('theme prop 作为逃生舱覆盖派生值', async () => {
        document.documentElement.classList.add('dark')
        const wrapper = await mountReady({ theme: 'light' })
        expect(editorOf(wrapper).props('theme')).toBe('light')
    })
})

describe('CaomeiRichTextEditor 国际化联动', () => {
    it('缺省使用 zh-CN，不触发扩展语言注册', async () => {
        const wrapper = await mountReady()
        expect(editorOf(wrapper).props('language')).toBe('zh-CN')
        expect(mocks.config).not.toHaveBeenCalled()
    })

    it('en-US 直接使用内置语言，不触发扩展语言注册', async () => {
        const host = mount(CaomeiConfigProvider, {
            props: { locale: 'en-US' },
            slots: { default: () => h(CaomeiRichTextEditor) },
        })
        await flushPromises()
        expect(host.findComponent({ name: 'MdEditorStub' }).props('language')).toBe('en-US')
        expect(mocks.config).not.toHaveBeenCalled()
    })

    it('ja-JP 映射为 jp-JP 并按需注册扩展语言', async () => {
        const host = mount(CaomeiConfigProvider, {
            props: { locale: 'ja-JP' },
            slots: { default: () => h(CaomeiRichTextEditor) },
        })
        await flushPromises()
        expect(host.findComponent({ name: 'MdEditorStub' }).props('language')).toBe('jp-JP')
        expect(mocks.config).toHaveBeenCalledWith({
            editorConfig: { languageUserDefined: { 'jp-JP': { id: 'jp-JP-stub' } } },
        })
    })

    it('zh-TW / ko-KR 注册对应扩展语言', async () => {
        for (const [locale, key, stub] of [
            ['zh-TW', 'zh-TW', 'zh-TW-stub'],
            ['ko-KR', 'ko-KR', 'ko-KR-stub'],
        ] as const) {
            mocks.config.mockClear()
            const host = mount(CaomeiConfigProvider, {
                props: { locale },
                slots: { default: () => h(CaomeiRichTextEditor) },
            })
            await flushPromises()
            expect(host.findComponent({ name: 'MdEditorStub' }).props('language')).toBe(key)
            expect(mocks.config).toHaveBeenCalledWith({
                editorConfig: { languageUserDefined: { [key]: { id: stub } } },
            })
            host.unmount()
        }
    })

    it('连续快速切换 locale 时以最后一次为准', async () => {
        const host = mount(CaomeiConfigProvider, {
            props: { locale: 'zh-CN' },
            slots: { default: () => h(CaomeiRichTextEditor) },
        })
        await flushPromises()

        await host.setProps({ locale: 'zh-TW' })
        await host.setProps({ locale: 'ko-KR' })
        await flushPromises()

        expect(host.findComponent({ name: 'MdEditorStub' }).props('language')).toBe('ko-KR')
    })

    it('locale 运行期切换时更新语言并重新注册', async () => {
        const host = mount(CaomeiConfigProvider, {
            props: { locale: 'zh-CN' },
            slots: { default: () => h(CaomeiRichTextEditor) },
        })
        await flushPromises()
        expect(host.findComponent({ name: 'MdEditorStub' }).props('language')).toBe('zh-CN')

        await host.setProps({ locale: 'ko-KR' })
        await flushPromises()
        expect(host.findComponent({ name: 'MdEditorStub' }).props('language')).toBe('ko-KR')
        expect(mocks.config).toHaveBeenCalledWith({
            editorConfig: { languageUserDefined: { 'ko-KR': { id: 'ko-KR-stub' } } },
        })
    })
})

describe('CaomeiRichTextEditor 上传能力', () => {
    it('提供 uploader 时接入编辑器上传回调并回传 URL', async () => {
        const uploader = vi.fn().mockResolvedValue(['https://cdn.example.com/a.png'])
        const wrapper = await mountReady({ uploader })
        const onUploadImg = editorOf(wrapper).props('onUploadImg') as (
            files: File[],
            cb: (urls: string[]) => void,
        ) => void

        const callBack = vi.fn()
        const file = new File(['x'], 'a.png', { type: 'image/png' })
        onUploadImg([file], callBack)
        await flushPromises()

        expect(uploader).toHaveBeenCalledWith([file])
        expect(callBack).toHaveBeenCalledWith(['https://cdn.example.com/a.png'])
    })

    it('uploader 拒绝时回传空列表而不抛出', async () => {
        const uploader = vi.fn().mockRejectedValue(new Error('boom'))
        const wrapper = await mountReady({ uploader })
        const onUploadImg = editorOf(wrapper).props('onUploadImg') as (
            files: File[],
            cb: (urls: string[]) => void,
        ) => void

        const callBack = vi.fn()
        onUploadImg([new File(['x'], 'a.png')], callBack)
        await flushPromises()

        expect(callBack).toHaveBeenCalledWith([])
    })

    it('未提供 uploader 时不注入上传回调（交由编辑器内建行为）', async () => {
        const wrapper = await mountReady()
        expect(editorOf(wrapper).props('onUploadImg')).toBeUndefined()
    })
})
