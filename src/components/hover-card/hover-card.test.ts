import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { expectSettled } from '../../../test/helpers/settle'
import {
    CaomeiHoverCard,
    CaomeiHoverCardArrow,
    CaomeiHoverCardContent,
    CaomeiHoverCardTrigger,
} from './index'

const wrappers: ReturnType<typeof mount>[] = []

function mountHoverCard(props: Record<string, unknown> = {}) {
    const Host = defineComponent({
        components: { CaomeiHoverCard, CaomeiHoverCardArrow, CaomeiHoverCardContent, CaomeiHoverCardTrigger },
        setup: () => ({ cardProps: props }),
        template: `
            <CaomeiHoverCard v-bind="cardProps">
                <CaomeiHoverCardTrigger>悬停查看</CaomeiHoverCardTrigger>
                <CaomeiHoverCardContent>
                    卡片的说明内容
                    <CaomeiHoverCardArrow />
                </CaomeiHoverCardContent>
            </CaomeiHoverCard>
        `,
    })
    const wrapper = mount(Host, { attachTo: document.body })
    wrappers.push(wrapper as unknown as ReturnType<typeof mount>)
    return wrapper
}

function trigger(): HTMLElement {
    const element = document.querySelector<HTMLElement>('.caomei-hover-card__trigger')
    if (!element) {
        throw new Error('未渲染触发器')
    }
    return element
}

function content(): HTMLElement | null {
    return document.body.querySelector<HTMLElement>('.caomei-hover-card__content')
}

async function flush(): Promise<void> {
    await nextTick()
    await nextTick()
}

afterEach(() => {
    for (const wrapper of wrappers.splice(0)) {
        wrapper.unmount()
    }
    document.body.innerHTML = ''
})

describe('CaomeiHoverCard', () => {
    it('默认不渲染内容，触发器为按钮', async () => {
        mountHoverCard()
        await flush()

        expect(trigger().tagName).toBe('BUTTON')
        expect(content()).toBeNull()
    })

    it('悬停后按延迟打开', async () => {
        const wrapper = mountHoverCard({ openDelay: 0, closeDelay: 0 })
        await flush()

        trigger().dispatchEvent(new PointerEvent('pointerenter', { bubbles: false }))
        await expectSettled(() => {
            expect(content()).not.toBeNull()
        })
        expect(content()?.textContent).toContain('卡片的说明内容')
        expect((wrapper.element as HTMLElement).contains(content())).toBe(false)
    })

    it('打开延迟生效', async () => {
        mountHoverCard({ openDelay: 1200, closeDelay: 0 })
        await flush()

        trigger().dispatchEvent(new PointerEvent('pointerenter', { bubbles: false, pointerType: 'mouse' }))
        await new Promise((resolve) => {
            setTimeout(resolve, 900)
        })
        expect(content()).toBeNull()

        await expectSettled(() => {
            expect(content()).not.toBeNull()
        }, 3000)
    })

    it('关闭延迟生效', async () => {
        mountHoverCard({ openDelay: 0, closeDelay: 1200 })
        await flush()

        trigger().focus()
        await expectSettled(() => {
            expect(content()).not.toBeNull()
        })

        trigger().blur()
        await new Promise((resolve) => {
            setTimeout(resolve, 500)
        })
        expect(content()).not.toBeNull()

        await expectSettled(() => {
            expect(content()).toBeNull()
        }, 3000)
    })

    it('聚焦触发器同样打开', async () => {
        mountHoverCard({ openDelay: 0, closeDelay: 0 })
        await flush()

        trigger().focus()
        await expectSettled(() => {
            expect(content()).not.toBeNull()
        })
    })

    it('Escape 关闭内容', async () => {
        mountHoverCard({ open: true })
        await expectSettled(() => {
            expect(content()).not.toBeNull()
        })

        const panel = content()
        panel?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
        await expectSettled(() => {
            expect(content()).toBeNull()
        })
    })

    it('受控 open 变化时开合', async () => {
        const Host = defineComponent({
            components: { CaomeiHoverCard, CaomeiHoverCardContent, CaomeiHoverCardTrigger },
            setup: () => ({ open: ref(false) }),
            template: `
                <CaomeiHoverCard v-model:open="open">
                    <CaomeiHoverCardTrigger>悬停查看</CaomeiHoverCardTrigger>
                    <CaomeiHoverCardContent>卡片的说明内容</CaomeiHoverCardContent>
                </CaomeiHoverCard>
            `,
        })
        const wrapper = mount(Host, { attachTo: document.body })
        wrappers.push(wrapper as unknown as ReturnType<typeof mount>)
        await flush()

        expect(content()).toBeNull()
        ;(wrapper.vm as unknown as { open: boolean }).open = true
        await expectSettled(() => {
            expect(content()).not.toBeNull()
        })
    })

    it('禁用触发器悬停不展开', async () => {
        const Host = defineComponent({
            components: { CaomeiHoverCard, CaomeiHoverCardContent, CaomeiHoverCardTrigger },
            setup: () => ({}),
            template: `
                <CaomeiHoverCard :open-delay="0" :close-delay="0">
                    <CaomeiHoverCardTrigger disabled>悬停查看</CaomeiHoverCardTrigger>
                    <CaomeiHoverCardContent>卡片的说明内容</CaomeiHoverCardContent>
                </CaomeiHoverCard>
            `,
        })
        const wrapper = mount(Host, { attachTo: document.body })
        wrappers.push(wrapper as unknown as ReturnType<typeof mount>)
        await flush()

        expect((trigger() as HTMLButtonElement).disabled).toBe(true)
        trigger().dispatchEvent(new PointerEvent('pointerenter', { bubbles: false, pointerType: 'mouse' }))
        await new Promise((resolve) => {
            setTimeout(resolve, 30)
        })
        expect(content()).toBeNull()
    })
})
