import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { CaomeiPopconfirm } from './index'

async function flush(): Promise<void> {
    await nextTick()
    await nextTick()
}

const mounted: ReturnType<typeof mount>[] = []

function mountPopconfirm(props: Record<string, unknown> = {}, slots: Record<string, () => unknown> = {}) {
    const wrapper = mount(CaomeiPopconfirm, {
        props: {
            title: '删除该文件？',
            description: '删除后无法恢复。',
            ...props,
        },
        slots: {
            trigger: () => '删除',
            ...slots,
        },
        attachTo: document.body,
    })
    mounted.push(wrapper)
    return wrapper
}

function triggerButton(): HTMLButtonElement {
    return document.querySelector('.caomei-popover__trigger') as HTMLButtonElement
}

function panel(): HTMLElement | null {
    return document.querySelector('.caomei-popover__content')
}

afterEach(() => {
    for (const wrapper of mounted.splice(0)) {
        wrapper.unmount()
    }
    document.body.innerHTML = ''
})

describe('CaomeiPopconfirm', () => {
    it('点击触发按钮展开面板并渲染标题、描述与按钮文案', async () => {
        mountPopconfirm()
        await flush()

        expect(triggerButton()).not.toBeNull()
        expect(triggerButton().textContent).toContain('删除')

        triggerButton().click()
        await flush()

        const content = panel()
        expect(content).not.toBeNull()
        expect(content?.getAttribute('role')).toBe('dialog')
        expect(content?.querySelector('.caomei-popconfirm__title')?.textContent).toContain('删除该文件？')
        expect(content?.querySelector('.caomei-popconfirm__description')?.textContent).toContain('删除后无法恢复。')
        const buttons = content?.querySelectorAll('.caomei-button') ?? []
        expect([...buttons].map((node) => node.textContent?.trim())).toEqual(['取消', '确定'])
    })

    it('点击确认抛出 confirm，关闭面板并归还焦点', async () => {
        const wrapper = mountPopconfirm()
        await flush()
        triggerButton().click()
        await flush()

        const confirm = [...document.querySelectorAll<HTMLButtonElement>('.caomei-popover__content .caomei-button')].at(-1)
        confirm?.click()
        await flush()

        expect(wrapper.emitted('confirm')).toHaveLength(1)
        expect(wrapper.emitted('update:open')?.at(-1)?.[0]).toBe(false)
        await new Promise((resolve) => {
            setTimeout(resolve, 0)
        })
        expect(document.activeElement).toBe(triggerButton())
    })

    it('点击取消抛出 cancel 并关闭面板', async () => {
        const wrapper = mountPopconfirm()
        await flush()
        triggerButton().click()
        await flush()

        const cancel = document.querySelector<HTMLButtonElement>('.caomei-popover__content .caomei-button')
        cancel?.click()
        await flush()

        expect(wrapper.emitted('cancel')).toHaveLength(1)
        expect(panel()).toBeNull()
    })

    it('按 Esc 关闭时抛出 cancel', async () => {
        const wrapper = mountPopconfirm()
        await flush()
        triggerButton().click()
        await flush()
        expect(panel()).not.toBeNull()

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
        await flush()

        expect(wrapper.emitted('cancel')).toHaveLength(1)
    })

    it('外部点击关闭时抛出 cancel', async () => {
        const wrapper = mountPopconfirm()
        const outside = document.createElement('button')
        document.body.append(outside)
        await flush()
        triggerButton().click()
        await flush()
        await new Promise((resolve) => {
            setTimeout(resolve, 0)
        })

        document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }))
        await new Promise((resolve) => {
            setTimeout(resolve, 0)
        })
        await flush()

        expect(wrapper.emitted('cancel')).toHaveLength(1)
    })

    it('受控 open：外部值为真时直接展开，确认只抛 update:open', async () => {
        const wrapper = mountPopconfirm({ open: true })
        await flush()

        expect(panel()).not.toBeNull()

        const confirm = [...document.querySelectorAll<HTMLButtonElement>('.caomei-popover__content .caomei-button')].at(-1)
        confirm?.click()
        await flush()

        expect(wrapper.emitted('confirm')).toHaveLength(1)
        expect(wrapper.emitted('update:open')?.at(-1)?.[0]).toBe(false)
        expect(wrapper.emitted('cancel')).toBeUndefined()
    })

    it('loading 时确认按钮进入加载态且两枚按钮禁用', async () => {
        const wrapper = mountPopconfirm({ loading: true, open: true })
        await flush()

        const buttons = [...document.querySelectorAll<HTMLButtonElement>('.caomei-popover__content .caomei-button')]
        expect(buttons.every((button) => button.disabled)).toBe(true)
        expect(buttons.at(-1)?.classList.contains('caomei-button--loading')).toBe(true)

        buttons.at(-1)?.click()
        await flush()
        expect(wrapper.emitted('confirm')).toBeUndefined()
    })

    it('展开时触发器的 aria-controls 指向面板 id', async () => {
        mountPopconfirm({ open: true })
        await flush()

        // 定位：本用例是 a11y 例外「引用目标确实存在」的证据，不是根形态回归锁
        const trigger = triggerButton()
        const content = panel()
        expect(content).not.toBeNull()
        expect(trigger.getAttribute('aria-haspopup')).toBe('dialog')
        expect(trigger.getAttribute('aria-controls')).toBe(content?.id)
    })

    it('打开态：as-child 复用的按钮触发器不在隔离面内', async () => {
        mountPopconfirm({ open: true })
        await flush()

        const trigger = triggerButton()
        // 触发器根元素可解析后成为隔离保留根，其祖先链不再整片 inert
        expect(trigger.getAttribute('data-state')).toBe('open')
        expect(trigger.closest('[inert]')).toBeNull()
    })

    it('disabled 禁用触发按钮且不展开', async () => {
        mountPopconfirm({ disabled: true })
        await flush()

        expect(triggerButton().disabled).toBe(true)
        triggerButton().click()
        await flush()
        expect(panel()).toBeNull()
    })

    it('tone=danger 使用危险色确认按钮与警告图标', async () => {
        mountPopconfirm({ tone: 'danger', open: true })
        await flush()

        const confirm = [...document.querySelectorAll<HTMLButtonElement>('.caomei-popover__content .caomei-button')].at(-1)
        expect(confirm?.classList.contains('caomei-button--tone-danger')).toBe(true)
        expect(document.querySelector('.caomei-popconfirm__icon--danger')).not.toBeNull()
    })

    it('受控父级回写 open=false 后关闭面板', async () => {
        const Parent = defineComponent({
            setup() {
                const open = ref(true)
                return { open }
            },
            render() {
                return h(CaomeiPopconfirm, {
                    title: '确认',
                    open: this.open,
                    'onUpdate:open': (value: boolean) => {
                        this.open = value
                    },
                }, { trigger: () => '操作' })
            },
        })
        const wrapper = mount(Parent, { attachTo: document.body })
        await flush()
        expect(panel()).not.toBeNull()

        ;(wrapper.vm as unknown as { open: boolean }).open = false
        await flush()
        expect(panel()).toBeNull()
    })
})
