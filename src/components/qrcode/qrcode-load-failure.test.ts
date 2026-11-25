import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { expectSettled } from '../../../test/helpers/settle'
import { CaomeiQRCode } from './index'

/**
 * 缺失可选 peer `qrcode` 时的降级路径。
 *
 * 与「编码失败」分开验证：这里让加载器本身 reject（模拟 `import('qrcode')` 失败），
 * 覆盖「内核未安装 / 无法加载」而不是「内核已加载但内容不可编码」。
 */
vi.mock('./qrcode-loader', () => ({
    loadQRCode: () => Promise.reject(new Error('Cannot find module qrcode')),
}))

const wrappers: ReturnType<typeof mount>[] = []

afterEach(() => {
    for (const wrapper of wrappers.splice(0)) {
        wrapper.unmount()
    }
    document.body.innerHTML = ''
    vi.restoreAllMocks()
})

describe('CaomeiQRCode 缺失内核', () => {
    it('渲染失败提示、不渲染图片且不抛未捕获异常', async () => {
        const wrapper = mount(CaomeiQRCode, {
            props: { value: 'https://example.com' },
            attachTo: document.body,
        })
        wrappers.push(wrapper)

        await expectSettled(() => {
            expect(document.querySelector('.caomei-qrcode__status')?.textContent).toContain('二维码生成失败')
        })
        expect(document.querySelector('.caomei-qrcode__image')).toBeNull()
        expect(document.querySelector('.caomei-qrcode__status')?.getAttribute('role')).toBe('alert')
    })
})
