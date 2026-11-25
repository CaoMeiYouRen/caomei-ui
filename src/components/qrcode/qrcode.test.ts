import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { expectSettled } from '../../../test/helpers/settle'
import type { QRCodeRenderOptions } from './qrcode-loader'
import { CaomeiQRCode } from './index'

/** 内核桩：默认返回可预测的 data URL，并记录最后一次参数（`vi.hoisted` 供 mock 工厂提前引用） */
const { toDataURL } = vi.hoisted(() => ({
    toDataURL: vi.fn((text: string, _options: QRCodeRenderOptions) => Promise.resolve(`data:image/png;base64,stub-${text}`)),
}))

vi.mock('./qrcode-loader', () => ({
    loadQRCode: () => Promise.resolve({ toDataURL }),
}))

interface Deferred<T> {
    promise: Promise<T>
    resolve: (value: T) => void
    reject: (reason: unknown) => void
}

function deferred<T>(): Deferred<T> {
    let resolve!: (value: T) => void
    let reject!: (reason: unknown) => void
    const promise = new Promise<T>((res, rej) => {
        resolve = res
        reject = rej
    })
    return { promise, resolve, reject }
}

const wrappers: ReturnType<typeof mount>[] = []

function mountQRCode(props: Record<string, unknown> = {}, slots: Record<string, () => unknown> = {}) {
    const wrapper = mount(CaomeiQRCode, {
        props: { value: 'https://example.com', ...props },
        slots,
        attachTo: document.body,
    })
    wrappers.push(wrapper)
    return wrapper
}

function image(): HTMLImageElement | null {
    return document.querySelector<HTMLImageElement>('.caomei-qrcode__image')
}

beforeEach(() => {
    toDataURL.mockClear()
    toDataURL.mockImplementation((text: string) => Promise.resolve(`data:image/png;base64,stub-${text}`))
})

afterEach(() => {
    for (const wrapper of wrappers.splice(0)) {
        wrapper.unmount()
    }
    document.body.innerHTML = ''
    vi.restoreAllMocks()
})

describe('CaomeiQRCode 渲染', () => {
    it('挂载后按 value 生成图片并带可访问名', async () => {
        mountQRCode()

        await expectSettled(() => {
            expect(image()?.src).toContain('stub-https://example.com')
        })
        expect(image()?.alt).toBe('二维码')

        mountQRCode({ label: '订单二维码' })
        await expectSettled(() => {
            expect(document.querySelectorAll('.caomei-qrcode__image')).toHaveLength(2)
        })
        expect([...document.querySelectorAll<HTMLImageElement>('.caomei-qrcode__image')].map((item) => item.alt))
            .toContain('订单二维码')
    })

    it('空字符串 label 视为装饰性图片', async () => {
        mountQRCode({ label: '' })
        await expectSettled(() => {
            expect(image()).not.toBeNull()
        })
        expect(image()?.alt).toBe('')
    })

    it('尺寸、容错级别、静区与颜色映射到编码参数', async () => {
        mountQRCode({
            value: 'v',
            size: 200,
            level: 'H',
            margin: 4,
            color: '#112233',
            background: '#fafafa',
        })

        await expectSettled(() => {
            expect(toDataURL).toHaveBeenCalled()
        })
        expect(toDataURL).toHaveBeenLastCalledWith('v', {
            width: 200,
            margin: 4,
            errorCorrectionLevel: 'H',
            color: { dark: '#112233', light: '#fafafa' },
        })
        const root = document.querySelector<HTMLElement>('.caomei-qrcode')
        expect(root?.style.width).toBe('200px')
    })

    it('非法尺寸 / 负静区 / 越界图标比例按边界收敛', async () => {
        mountQRCode({ value: 'v', size: Number.NaN, margin: -3, icon: 'https://example.com/icon.png', iconSize: 5 })
        await expectSettled(() => {
            expect(toDataURL).toHaveBeenCalled()
        })

        expect(toDataURL).toHaveBeenLastCalledWith('v', expect.objectContaining({ width: 160, margin: 0 }))
        expect(document.querySelector<HTMLElement>('.caomei-qrcode')?.style.width).toBe('160px')
        // 图标比例上限 0.3：160 × 0.3 = 48px
        expect(document.querySelector<HTMLElement>('.caomei-qrcode__icon')?.style.width).toBe('48px')
    })

    it('值变化时重新编码', async () => {
        const wrapper = mountQRCode({ value: 'a' })
        await expectSettled(() => {
            expect(image()?.src).toContain('stub-a')
        })

        await wrapper.setProps({ value: 'b' })
        await expectSettled(() => {
            expect(image()?.src).toContain('stub-b')
        })
        expect(toDataURL).toHaveBeenCalledTimes(2)
    })

    it('乱序完成时只采用最新一次请求的结果', async () => {
        const first = deferred<string>()
        const second = deferred<string>()
        toDataURL.mockImplementationOnce(() => first.promise)
        toDataURL.mockImplementationOnce(() => second.promise)

        const wrapper = mountQRCode({ value: 'a' })
        await nextTick()

        await wrapper.setProps({ value: 'b' })
        await nextTick()

        second.resolve('data:image/png;base64,stub-b')
        await expectSettled(() => {
            expect(image()?.src).toContain('stub-b')
        })

        first.resolve('data:image/png;base64,stub-a')
        await nextTick()
        await nextTick()
        expect(image()?.src, '较早请求晚到时不得覆盖新结果').toContain('stub-b')
    })

    it('编码失败时清空旧图并给出失败提示', async () => {
        const wrapper = mountQRCode({ value: 'ok' })
        await expectSettled(() => {
            expect(image()).not.toBeNull()
        })

        toDataURL.mockImplementationOnce(() => Promise.reject(new Error('invalid content')))
        await wrapper.setProps({ value: 'bad' })

        await expectSettled(() => {
            expect(document.querySelector('.caomei-qrcode__status')?.textContent).toContain('二维码生成失败')
        })
        expect(image(), '失败后不得展示与当前值不一致的旧图').toBeNull()
        expect(document.querySelector('.caomei-qrcode__status')?.getAttribute('role')).toBe('alert')
        const stage = document.querySelector<HTMLElement>('.caomei-qrcode__stage')
        expect(stage?.style.height, '失败态不写死高度，文案可撑高').toBe('')
        expect(stage?.classList.contains('caomei-qrcode__stage--ready')).toBe(false)
    })

    it('图标按比例渲染，插槽可覆盖默认图标', async () => {
        mountQRCode({ icon: 'https://example.com/icon.png', size: 200, iconSize: 0.25 })
        await expectSettled(() => {
            expect(document.querySelector('.caomei-qrcode__icon')).not.toBeNull()
        })

        const icon = document.querySelector<HTMLElement>('.caomei-qrcode__icon')
        expect(icon?.style.width).toBe('50px')
        expect(icon?.style.height).toBe('50px')
        expect(document.querySelector('.caomei-qrcode__icon-image')?.getAttribute('aria-hidden')).toBe('true')

        const wrapper = mountQRCode({ icon: 'https://example.com/icon.png' }, {
            icon: () => '自定义图标',
        })
        await expectSettled(() => {
            expect(document.querySelectorAll('.caomei-qrcode__icon')).toHaveLength(2)
        })
        const slots = document.querySelectorAll('.caomei-qrcode__icon')
        expect(slots[1]?.textContent).toContain('自定义图标')
        wrapper.unmount()
    })

    it('默认插槽渲染在二维码之后的流内内容', async () => {
        mountQRCode({ value: 'v' }, { default: () => '扫码加入群聊' })
        await expectSettled(() => {
            expect(image()).not.toBeNull()
        })

        const root = document.querySelector<HTMLElement>('.caomei-qrcode')
        const stage = document.querySelector<HTMLElement>('.caomei-qrcode__stage')
        const caption = document.querySelector<HTMLElement>('.caomei-qrcode__caption')
        expect(stage?.classList.contains('caomei-qrcode__stage--ready')).toBe(true)
        expect(stage?.style.height).toBe('160px')
        expect(caption?.textContent).toContain('扫码加入群聊')
        expect(caption?.previousElementSibling, '说明应紧随二维码容器之后').toBe(stage)
        expect(root?.style.height, '根高度不得写死为边长').toBe('')
    })

    it('卸载后在飞请求不再写状态', async () => {
        const pending = deferred<string>()
        toDataURL.mockImplementationOnce(() => pending.promise)

        const wrapper = mountQRCode({ value: 'late' })
        await nextTick()
        wrapper.unmount()
        pending.resolve('data:image/png;base64,stub-late')
        await nextTick()
        await nextTick()

        expect(document.querySelector('.caomei-qrcode__image')).toBeNull()
    })
})
