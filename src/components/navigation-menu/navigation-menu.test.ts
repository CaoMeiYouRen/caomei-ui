import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { expectSettled } from '../../../test/helpers/settle'
import {
    CaomeiNavigationMenu,
    CaomeiNavigationMenuContent,
    CaomeiNavigationMenuLink,
    CaomeiNavigationMenuTrigger,
} from './index'

const wrappers: ReturnType<typeof mount>[] = []

function mountNavigationMenu(initialModel?: string, props: Record<string, unknown> = {}) {
    const Host = defineComponent({
        components: { CaomeiNavigationMenu, CaomeiNavigationMenuContent, CaomeiNavigationMenuLink, CaomeiNavigationMenuTrigger },
        setup: () => ({ model: ref<string | undefined>(initialModel), menuProps: props }),
        template: `
            <CaomeiNavigationMenu v-model="model" v-bind="menuProps" aria-label="主导航">
                <CaomeiNavigationMenuTrigger value="docs">
                    文档
                    <template #content>
                        <CaomeiNavigationMenuContent>
                            <CaomeiNavigationMenuLink href="#guide">快速上手</CaomeiNavigationMenuLink>
                            <CaomeiNavigationMenuLink href="#api">接口</CaomeiNavigationMenuLink>
                        </CaomeiNavigationMenuContent>
                    </template>
                </CaomeiNavigationMenuTrigger>
                <CaomeiNavigationMenuTrigger value="blog">
                    博客
                    <template #content>
                        <CaomeiNavigationMenuContent>
                            <CaomeiNavigationMenuLink href="#latest">最新</CaomeiNavigationMenuLink>
                        </CaomeiNavigationMenuContent>
                    </template>
                </CaomeiNavigationMenuTrigger>
            </CaomeiNavigationMenu>
        `,
    })
    const wrapper = mount(Host, { attachTo: document.body })
    wrappers.push(wrapper as unknown as ReturnType<typeof mount>)
    return wrapper
}

const model = (wrapper: ReturnType<typeof mountNavigationMenu>) => (wrapper.vm as unknown as { model: string | undefined }).model

function triggers(): HTMLElement[] {
    return Array.from(document.querySelectorAll<HTMLElement>('.caomei-navigation-menu__trigger'))
}

function content(): HTMLElement | null {
    return document.body.querySelector<HTMLElement>('.caomei-navigation-menu__content')
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

describe('CaomeiNavigationMenu', () => {
    it('渲染主导航与触发器语义', async () => {
        mountNavigationMenu()
        await flush()

        const root = document.querySelector('.caomei-navigation-menu')
        expect(root).not.toBeNull()
        expect(root?.getAttribute('aria-label')).toBe('主导航')
        expect(triggers()).toHaveLength(2)
        expect(triggers()[0]?.getAttribute('aria-expanded')).toBe('false')
    })

    it('点击触发器打开菜单并回写受控值', async () => {
        const wrapper = mountNavigationMenu()
        await flush()

        triggers()[0]?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        await expectSettled(() => {
            expect(content()).not.toBeNull()
        })
        expect(model(wrapper)).toBe('docs')
        expect(content()?.getAttribute('role')).toBe('group')
    })

    it('受控值变化时打开对应菜单', async () => {
        mountNavigationMenu('blog')
        await expectSettled(() => {
            expect(content()?.textContent).toContain('最新')
        })
        expect(triggers()[1]?.getAttribute('aria-expanded')).toBe('true')
    })

    it('Escape 关闭菜单', async () => {
        const wrapper = mountNavigationMenu('docs')
        await expectSettled(() => {
            expect(content()).not.toBeNull()
        })

        content()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
        await expectSettled(() => {
            expect(Boolean(model(wrapper))).toBe(false)
        })
    })

    it('指针离开后关闭', async () => {
        mountNavigationMenu(undefined, { delayDuration: 0 })
        await flush()

        triggers()[0]?.dispatchEvent(new PointerEvent('pointermove', { bubbles: false, pointerType: 'mouse' }))
        await expectSettled(() => {
            expect(content()).not.toBeNull()
        })

        triggers()[0]?.dispatchEvent(new PointerEvent('pointerleave', { bubbles: false, pointerType: 'mouse' }))
        await expectSettled(() => {
            expect(content()).toBeNull()
        })
    })

    it('菜单已展开时方向键进入内容并把焦点移到首个链接', async () => {
        mountNavigationMenu('docs')
        await expectSettled(() => {
            expect(content()).not.toBeNull()
        })

        const trigger = triggers()[0]
        trigger?.focus()
        trigger?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
        await expectSettled(() => {
            expect(document.activeElement?.textContent?.trim()).toBe('快速上手')
        })
    })

    it('鼠标悬停打开', async () => {
        mountNavigationMenu(undefined, { delayDuration: 0 })
        await flush()

        triggers()[0]?.dispatchEvent(new PointerEvent('pointermove', { bubbles: false, pointerType: 'mouse' }))
        await expectSettled(() => {
            expect(content()).not.toBeNull()
        })
    })

    it('Esc 关闭后焦点回到触发器', async () => {
        mountNavigationMenu('docs')
        await expectSettled(() => {
            expect(content()).not.toBeNull()
        })

        const trigger = triggers()[0]
        trigger?.focus()
        content()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
        await expectSettled(() => {
            expect(content()).toBeNull()
            expect(document.activeElement).toBe(trigger)
        })
    })

    it('当前页链接映射 aria-current', async () => {
        const Host = defineComponent({
            components: { CaomeiNavigationMenu, CaomeiNavigationMenuContent, CaomeiNavigationMenuLink, CaomeiNavigationMenuTrigger },
            setup: () => ({}),
            template: `
                <CaomeiNavigationMenu aria-label="主导航" model-value="docs">
                    <CaomeiNavigationMenuTrigger value="docs">
                        文档
                        <template #content>
                            <CaomeiNavigationMenuContent>
                                <CaomeiNavigationMenuLink href="#guide" active>快速上手</CaomeiNavigationMenuLink>
                            </CaomeiNavigationMenuContent>
                        </template>
                    </CaomeiNavigationMenuTrigger>
                </CaomeiNavigationMenu>
            `,
        })
        const wrapper = mount(Host, { attachTo: document.body })
        wrappers.push(wrapper as unknown as ReturnType<typeof mount>)

        await expectSettled(() => {
            const link = document.body.querySelector('.caomei-navigation-menu__link')
            expect(link?.getAttribute('aria-current')).toBe('page')
        })
    })
})
