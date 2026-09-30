import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import CaomeiRichTextEditor from './rich-text-editor.vue'

/**
 * 可选 peer 缺失 / 内核加载失败时的降级路径。
 *
 * 独立成文件并只替换 `loadEditor`（令其 reject），避免将抛错型模块工厂带入成功路径的模块图。
 */
vi.mock('./editor-language', async (importOriginal) => {
    const actual = await importOriginal<typeof import('./editor-language')>()
    return {
        ...actual,
        loadEditor: vi.fn().mockRejectedValue(new Error('md-editor-v3 is not installed')),
    }
})

describe('CaomeiRichTextEditor 内核加载失败', () => {
    it('渲染失败占位并带 role="alert"，且不抛出', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
        const wrapper = mount(CaomeiRichTextEditor)

        expect(wrapper.find('.caomei-rich-text-editor__status').attributes('role')).toBe('status')

        await flushPromises()

        const status = wrapper.find('.caomei-rich-text-editor__status')
        expect(status.attributes('role')).toBe('alert')
        expect(status.text()).toBe('编辑器加载失败，请确认已安装 md-editor-v3')
        expect(wrapper.find('.md-editor-stub').exists()).toBe(false)

        warn.mockRestore()
    })
})
