import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CaomeiConfigProvider } from '../config-provider'
import CaomeiRichTextEditor from './rich-text-editor.vue'

/**
 * 语言登记乱序守卫的判别性用例。
 *
 * 独立成文件：把 `registerEditorLanguage` 换成**受测试控制的 deferred**，使「后发起者先完成」
 * 成立，从而区分实现里是否真的存在 `languageRequest` 序号守卫——近同步的 mock 无法判别
 * （完成顺序恒等于发起顺序）。
 */
const mocks = vi.hoisted(() => ({
    pending: [] as { code: string, resolve: (language: string) => void }[],
}))

vi.mock('./editor-language', async (importOriginal) => {
    const actual = await importOriginal<typeof import('./editor-language')>()
    const MdEditorStub = defineComponent({
        name: 'MdEditorStub',
        props: {
            language: { type: String, default: '' },
        },
        setup(stubProps) {
            return () => h('div', { class: 'md-editor-stub', 'data-language': stubProps.language })
        },
    })
    return {
        ...actual,
        loadEditor: () => Promise.resolve({ MdEditor: MdEditorStub, config: () => undefined }),
        registerEditorLanguage: (_module: unknown, code: string) =>
            new Promise<string>((resolve) => {
                mocks.pending.push({ code, resolve })
            }),
    }
})

beforeEach(() => {
    mocks.pending.length = 0
})

describe('CaomeiRichTextEditor 语言登记乱序守卫', () => {
    it('快速连续切换 locale 时采纳最后发起者，而非最后完成者', async () => {
        const host = mount(CaomeiConfigProvider, {
            props: { locale: 'zh-CN' },
            slots: { default: () => h(CaomeiRichTextEditor) },
        })
        await flushPromises()
        expect(mocks.pending.map((item) => item.code)).toEqual(['zh-CN'])

        await host.setProps({ locale: 'ko-KR' })
        await flushPromises()
        expect(mocks.pending.map((item) => item.code)).toEqual(['zh-CN', 'ko-KR'])

        // 先完成「后发起」的 ko-KR，再完成「先发起」的 zh-CN：无序号守卫时结果会退回 zh-CN
        mocks.pending[1].resolve('ko-KR')
        await flushPromises()
        mocks.pending[0].resolve('zh-CN')
        await flushPromises()

        expect(host.findComponent({ name: 'MdEditorStub' }).props('language')).toBe('ko-KR')
    })
})
