import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { expectSettled } from '../../../test/helpers/settle'
import {
    CaomeiMenubar,
    CaomeiMenubarContent,
    CaomeiMenubarItem,
    CaomeiMenubarMenu,
    CaomeiMenubarTrigger,
} from './index'

const wrappers: ReturnType<typeof mount>[] = []

function mountMenubar(initialModel?: string) {
    const Host = defineComponent({
        components: { CaomeiMenubar, CaomeiMenubarContent, CaomeiMenubarItem, CaomeiMenubarMenu, CaomeiMenubarTrigger },
        setup: () => ({ model: ref<string | undefined>(initialModel) }),
        template: `
            <CaomeiMenubar v-model:model-value="model">
                <CaomeiMenubarMenu value="file">
                    <CaomeiMenubarTrigger>文件</CaomeiMenubarTrigger>
                    <CaomeiMenubarContent>
                        <CaomeiMenubarItem shortcut="⌘N">新建</CaomeiMenubarItem>
                        <CaomeiMenubarItem disabled>删除</CaomeiMenubarItem>
                    </CaomeiMenubarContent>
                </CaomeiMenubarMenu>
                <CaomeiMenubarMenu value="edit">
                    <CaomeiMenubarTrigger>编辑</CaomeiMenubarTrigger>
                    <CaomeiMenubarContent>
                        <CaomeiMenubarItem>撤销</CaomeiMenubarItem>
                    </CaomeiMenubarContent>
                </CaomeiMenubarMenu>
            </CaomeiMenubar>
        `,
    })
    const wrapper = mount(Host, { attachTo: document.body })
    wrappers.push(wrapper as unknown as ReturnType<typeof mount>)
    return wrapper
}

const model = (wrapper: ReturnType<typeof mountMenubar>) => (wrapper.vm as unknown as { model: string | undefined }).model

function triggers(): HTMLElement[] {
    return Array.from(document.querySelectorAll<HTMLElement>('.caomei-menubar__trigger'))
}

function content(): HTMLElement | null {
    return document.body.querySelector<HTMLElement>('.caomei-menubar__content')
}

async function flush(): Promise<void> {
    await nextTick()
    await nextTick()
}

/** Reka 的 MenubarTrigger 在 pointerdown（主键、非 Ctrl）时展开菜单 */
function press(trigger: HTMLElement | undefined): void {
    trigger?.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, button: 0 }))
}

afterEach(() => {
    for (const wrapper of wrappers.splice(0)) {
        wrapper.unmount()
    }
    document.body.innerHTML = ''
})

describe('CaomeiMenubar', () => {
    it('渲染菜单栏与触发器语义', async () => {
        mountMenubar()
        await flush()

        const bar = document.querySelector('.caomei-menubar')
        expect(bar?.getAttribute('role')).toBe('menubar')
        expect(triggers()).toHaveLength(2)
        for (const trigger of triggers()) {
            expect(trigger.getAttribute('aria-haspopup')).toBe('menu')
        }
    })

    it('点击触发器打开菜单并回写受控值', async () => {
        const wrapper = mountMenubar()
        await flush()

        press(triggers()[0])
        await expectSettled(() => {
            expect(content()).not.toBeNull()
        })
        expect(content()?.getAttribute('role')).toBe('menu')
        expect(model(wrapper)).toBe('file')
    })

    it('受控值变化时打开对应菜单', async () => {
        mountMenubar('edit')
        await expectSettled(() => {
            expect(content()?.textContent).toContain('撤销')
        })
        expect(triggers()[1]?.getAttribute('data-state')).toBe('open')
    })

    it('Escape 关闭菜单并把焦点还给触发器', async () => {
        const wrapper = mountMenubar()
        await flush()

        triggers()[0]?.focus()
        press(triggers()[0])
        await expectSettled(() => {
            expect(content()).not.toBeNull()
        })

        content()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
        await expectSettled(() => {
            expect(content()).toBeNull()
        })
        // Reka 在关闭时把受控值置为空字符串
        expect(Boolean(model(wrapper))).toBe(false)
        expect(document.activeElement).toBe(triggers()[0])
    })

    it('方向键在触发器之间移动焦点', async () => {
        mountMenubar()
        await flush()

        const first = triggers()[0]
        first?.focus()
        first?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
        await expectSettled(() => {
            expect(document.activeElement).toBe(triggers()[1])
        })
    })

    it('Home / End 跳到首末触发器，左方向键按 loop 绕回', async () => {
        mountMenubar()
        await flush()

        triggers()[0]?.focus()
        triggers()[0]?.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }))
        await expectSettled(() => {
            expect(document.activeElement).toBe(triggers()[1])
        })

        triggers()[1]?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }))
        await expectSettled(() => {
            expect(document.activeElement).toBe(triggers()[0])
        })

        triggers()[0]?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))
        await expectSettled(() => {
            expect(document.activeElement).toBe(triggers()[1])
        })
    })

    it('打开时不做整页隔离（非模态浮层）', async () => {
        mountMenubar()
        await flush()

        press(triggers()[0])
        await expectSettled(() => {
            expect(content()).not.toBeNull()
        })

        const inert = [...document.body.children].filter((node) => node.hasAttribute('inert'))
        expect(inert).toEqual([])
    })

    it('禁用条目带 data-disabled 且点击不关闭菜单', async () => {
        mountMenubar()
        await flush()

        press(triggers()[0])
        await expectSettled(() => {
            expect(content()).not.toBeNull()
        })
        await flush()

        const items = Array.from(document.querySelectorAll<HTMLElement>('.caomei-menubar__item'))
        const disabled = items.find((item) => item.textContent?.includes('删除'))
        expect(disabled?.hasAttribute('data-disabled')).toBe(true)

        disabled?.click()
        await flush()
        expect(content()).not.toBeNull()
    })
})
