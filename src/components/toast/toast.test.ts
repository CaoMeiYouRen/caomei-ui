import { flushPromises, mount } from '@vue/test-utils'
import { computed, defineComponent, h, nextTick, ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useToast, type ToastApi } from '../../composables/use-toast'
import { caomeiLocaleKey } from '../../composables/use-locale'
import { caomeiLocales } from '../../locale'
import type { ToastProviderProps } from './types'
import { CaomeiToastProvider } from './index'

let api: ToastApi | undefined

const consumer = defineComponent({
    setup() {
        api = useToast()
        return () => h('div', { 'data-test': 'consumer' })
    },
})

const mounted: ReturnType<typeof mount>[] = []

function createHost(props: ToastProviderProps & Record<string, unknown> = {}) {
    return defineComponent({
        setup() {
            return () =>
                h('div', null, [
                    h(CaomeiToastProvider, props, { default: () => h(consumer) }),
                ])
        },
    })
}

async function mountProvider(
    props: ToastProviderProps & Record<string, unknown> = {},
): Promise<ReturnType<typeof mount>> {
    const wrapper = mount(createHost(props), { attachTo: document.body })
    mounted.push(wrapper)
    await flushPromises()
    return wrapper
}

/** 仅推进微任务队列，供冻结计时器的用例使用（flushPromises 依赖 setTimeout）。 */
async function flushTicks(times = 2): Promise<void> {
    for (let index = 0; index < times; index += 1) {
        await nextTick()
    }
}

function getToast(): HTMLElement | null {
    return document.querySelector('.caomei-toast')
}

afterEach(() => {
    api = undefined
    while (mounted.length > 0) {
        mounted.pop()?.unmount()
    }
    document.body.innerHTML = ''
})

describe('CaomeiToastProvider', () => {
    it('入队后渲染标题、描述与语气样式', async () => {
        await mountProvider()

        api?.success({ title: '保存成功', description: '数据已写入' })
        await flushPromises()

        const toast = getToast()
        expect(toast).not.toBeNull()
        expect(toast?.textContent).toContain('保存成功')
        expect(toast?.textContent).toContain('数据已写入')
        expect(toast?.classList.contains('caomei-toast--success')).toBe(true)
        expect(toast?.getAttribute('data-state')).toBe('open')
    })

    it('primary 语气应用对应强调类', async () => {
        await mountProvider()

        api?.show({ title: '主要提示', tone: 'primary' })
        await flushPromises()

        expect(getToast()?.classList.contains('caomei-toast--primary')).toBe(true)
    })

    it('type 透传到 ToastRoot', async () => {
        const wrapper = await mountProvider()

        api?.show({ title: '后台提示', type: 'background' })
        await flushPromises()

        const root = wrapper.findComponent({ name: 'ToastRoot' })
        expect(root.exists()).toBe(true)
        expect(root.props('type')).toBe('background')
    })

    it('提示项挂载在视口内，视口暴露区域语义与位置类', async () => {
        await mountProvider({ position: 'bottom-center' })

        const viewport = document.querySelector('.caomei-toast-viewport')
        expect(viewport?.tagName).toBe('OL')
        expect(viewport?.classList.contains('caomei-toast-viewport--bottom-center')).toBe(true)
        expect(document.querySelector('[role="region"]')?.getAttribute('aria-label')).toBe('通知 (F8)')

        api?.show('嵌套渲染')
        await flushPromises()

        expect(viewport?.querySelector('.caomei-toast')).not.toBeNull()
    })

    it('透传属性到视口元素', async () => {
        await mountProvider({ 'data-test': 'viewport' })

        expect(document.querySelector('.caomei-toast-viewport')?.getAttribute('data-test')).toBe(
            'viewport',
        )
    })

    it('视口与关闭按钮默认可访问名取内建文案', async () => {
        await mountProvider()

        api?.show('可关闭')
        await flushPromises()

        expect(document.querySelector('[role="region"]')?.getAttribute('aria-label')).toBe('通知 (F8)')
        expect(document.querySelector('.caomei-toast__close')?.getAttribute('aria-label')).toBe(
            '关闭',
        )
    })

    it('注入 locale 后视口与关闭按钮使用对应语言文案', async () => {
        const wrapper = mount(createHost(), {
            attachTo: document.body,
            global: {
                provide: { [caomeiLocaleKey]: computed(() => caomeiLocales['en-US']) },
            },
        })
        mounted.push(wrapper)
        await flushPromises()

        api?.show('本地化提示')
        await flushPromises()

        expect(document.querySelector('[role="region"]')?.getAttribute('aria-label')).toBe(
            'Notifications (F8)',
        )
        expect(document.querySelector('.caomei-toast__close')?.getAttribute('aria-label')).toBe(
            'Close',
        )
    })

    it('closable 为 false 时不渲染关闭按钮', async () => {
        await mountProvider()

        api?.show({ title: '不可关闭', closable: false })
        await flushPromises()

        expect(document.querySelector('.caomei-toast__close')).toBeNull()
    })

    it('点击关闭按钮移除提示', async () => {
        await mountProvider()

        api?.show('可关闭')
        await flushPromises()

        ;(document.querySelector('.caomei-toast__close') as HTMLElement).click()
        await flushPromises()

        expect(getToast()).toBeNull()
    })

    it('dismiss 按 id 移除指定提示', async () => {
        await mountProvider()

        const id = api?.show('待移除') as string
        api?.show('保留')
        await flushPromises()

        api?.dismiss(id)
        await flushPromises()

        const toasts = document.querySelectorAll('.caomei-toast')
        expect(toasts).toHaveLength(1)
        expect(toasts[0].textContent).toContain('保留')
    })

    it('超过 max 时丢弃最早的提示', async () => {
        await mountProvider({ max: 1 })

        api?.show('第一条')
        api?.show('第二条')
        await flushPromises()

        const toasts = document.querySelectorAll('.caomei-toast')
        expect(toasts).toHaveLength(1)
        expect(toasts[0].textContent).toContain('第二条')
    })

    it('max 调小后立即裁剪既有提示', async () => {
        const limit = ref(3)
        const host = defineComponent({
            setup() {
                return () =>
                    h('div', null, [
                        h(CaomeiToastProvider, { max: limit.value }, { default: () => h(consumer) }),
                    ])
            },
        })
        const wrapper = mount(host, { attachTo: document.body })
        mounted.push(wrapper)
        await flushPromises()

        api?.show('1')
        api?.show('2')
        api?.show('3')
        await flushPromises()
        expect(document.querySelectorAll('.caomei-toast')).toHaveLength(3)

        limit.value = 2
        await flushPromises()

        const toasts = document.querySelectorAll('.caomei-toast')
        expect(toasts).toHaveLength(2)
        expect(toasts[0].textContent).toContain('2')
    })

    it('到达 duration 后自动关闭', async () => {
        await mountProvider()
        vi.useFakeTimers()
        try {
            api?.show({ title: '自动关闭', duration: 20 })
            await flushTicks()
            expect(getToast()).not.toBeNull()

            vi.advanceTimersByTime(20)
            await flushTicks()

            expect(getToast()).toBeNull()
        } finally {
            vi.useRealTimers()
        }
    })

    it('duration 为 0 时不自动关闭', async () => {
        await mountProvider()
        vi.useFakeTimers()
        try {
            api?.show({ title: '常驻', duration: 0 })
            await flushTicks()
            expect(getToast()).not.toBeNull()

            vi.advanceTimersByTime(60_000)
            await flushTicks()

            expect(getToast()).not.toBeNull()
        } finally {
            vi.useRealTimers()
        }
    })

    it('操作按钮触发回调并关闭提示', async () => {
        await mountProvider()
        const onClick = vi.fn()

        api?.show({ title: '已删除', action: { label: '撤销', onClick } })
        await flushPromises()

        const action = document.querySelector('.caomei-toast__action') as HTMLElement
        expect(action.textContent?.trim()).toBe('撤销')

        action.click()
        await flushPromises()

        expect(onClick).toHaveBeenCalledTimes(1)
        expect(getToast()).toBeNull()
    })
})
