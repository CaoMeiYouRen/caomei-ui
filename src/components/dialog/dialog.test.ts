import { mount } from '@vue/test-utils'
import { DialogContent } from 'reka-ui'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { computed, nextTick } from 'vue'
import { caomeiLocaleKey } from '../../composables/use-locale'
import { caomeiLocales } from '../../locale'
import { CaomeiDialog } from './index'

function getDialog(): HTMLElement | null {
    return document.querySelector('[role="dialog"]')
}

afterEach(() => {
    document.body.innerHTML = ''
})

describe('CaomeiDialog', () => {
    it('关闭时不渲染对话框，触发插槽仍渲染', () => {
        const wrapper = mount(CaomeiDialog, {
            props: { title: '标题' },
            slots: {
                trigger: '<button data-test="trigger">打开</button>',
                default: '内容',
            },
        })

        expect(getDialog()).toBeNull()
        expect(wrapper.find('[data-test="trigger"]').exists()).toBe(true)
    })

    it('点击 trigger 抛出 update:open=true', async () => {
        const wrapper = mount(CaomeiDialog, {
            props: { title: '标题' },
            slots: { trigger: '<button data-test="trigger">打开</button>' },
        })

        await wrapper.get('[data-test="trigger"]').trigger('click')
        await nextTick()

        expect(wrapper.emitted('update:open')?.[0]).toEqual([true])
    })

    it('打开时渲染标题、描述与关闭按钮并建立 aria 关联', async () => {
        mount(CaomeiDialog, {
            props: { title: '标题', description: '描述', open: true },
            slots: { default: '正文' },
        })
        await nextTick()

        const dialog = getDialog()
        expect(dialog).not.toBeNull()
        expect(dialog?.textContent).toContain('标题')
        expect(dialog?.textContent).toContain('描述')
        expect(dialog?.textContent).toContain('正文')

        const labelledby = dialog?.getAttribute('aria-labelledby')
        const describedby = dialog?.getAttribute('aria-describedby')
        expect(labelledby).toBeTruthy()
        expect(document.getElementById(labelledby as string)?.textContent).toBe('标题')
        expect(document.getElementById(describedby as string)?.textContent).toBe('描述')
        expect(dialog?.getAttribute('aria-modal')).toBe('true')
    })

    it('modal 为 false 时不标注 aria-modal', async () => {
        mount(CaomeiDialog, { props: { title: '标题', open: true, modal: false } })
        await nextTick()

        expect(getDialog()?.getAttribute('aria-modal')).toBeNull()
    })

    it('closable 为 false 时不渲染关闭按钮', async () => {
        mount(CaomeiDialog, { props: { title: '标题', open: true, closable: false } })
        await nextTick()

        expect(document.querySelector('.caomei-dialog__close')).toBeNull()
    })

    it('关闭按钮可访问标签可被覆盖', async () => {
        mount(CaomeiDialog, {
            props: { title: '标题', open: true, closeLabel: '关闭对话框' },
        })
        await nextTick()

        expect(document.querySelector('.caomei-dialog__close')?.getAttribute('aria-label')).toBe(
            '关闭对话框',
        )
    })

    it('关闭按钮默认可访问名取内建文案', async () => {
        mount(CaomeiDialog, { props: { title: '标题', open: true } })
        await nextTick()

        expect(document.querySelector('.caomei-dialog__close')?.getAttribute('aria-label')).toBe(
            '关闭',
        )
    })

    it.each(['sm', 'md', 'lg'] as const)('应用尺寸样式 %s', async (size) => {
        mount(CaomeiDialog, { props: { title: '标题', open: true, size } })
        await nextTick()

        expect(getDialog()?.classList.contains(`caomei-dialog__content--${size}`)).toBe(true)
    })

    it('点击关闭按钮抛出 update:open=false', async () => {
        const wrapper = mount(CaomeiDialog, { props: { title: '标题', open: true } })
        await nextTick()

        ;(document.querySelector('.caomei-dialog__close') as HTMLElement).click()
        await nextTick()

        expect(wrapper.emitted('update:open')?.[0]).toEqual([false])
    })

    it('渲染 footer 插槽', async () => {
        mount(CaomeiDialog, {
            props: { title: '标题', open: true },
            slots: { footer: '<button data-test="confirm">确定</button>' },
        })
        await nextTick()

        expect(document.querySelector('[data-test="confirm"]')).not.toBeNull()
    })

    it('透传原生属性到对话框内容', async () => {
        mount(CaomeiDialog, {
            props: { title: '标题', open: true },
            attrs: { 'data-test': 'dialog' },
        })
        await nextTick()

        expect(getDialog()?.getAttribute('data-test')).toBe('dialog')
    })

    it('modal 为 false 时不渲染遮罩', async () => {
        mount(CaomeiDialog, { props: { title: '标题', open: true, modal: false } })
        await nextTick()

        expect(document.querySelector('.caomei-dialog__overlay')).toBeNull()
    })

    it('关闭按钮使用注入 locale 的文案', async () => {
        mount(CaomeiDialog, {
            props: { title: '标题', open: true },
            global: {
                provide: { [caomeiLocaleKey]: computed(() => caomeiLocales['en-US']) },
            },
        })
        await nextTick()

        expect(document.querySelector('.caomei-dialog__close')?.getAttribute('aria-label')).toBe(
            'Close',
        )
    })

    it.each([
        [true, false],
        [false, true],
    ] as const)('closeOnEsc=%s 时 preventDefault 调用=%s', async (closeOnEsc, prevented) => {
        const wrapper = mount(CaomeiDialog, { props: { title: '标题', open: true, closeOnEsc } })
        await nextTick()

        const event = { preventDefault: vi.fn() }
        wrapper.findComponent(DialogContent).vm.$emit('escapeKeyDown', event)

        expect(event.preventDefault).toHaveBeenCalledTimes(prevented ? 1 : 0)
    })

    it.each([
        [true, false],
        [false, true],
    ] as const)(
        'closeOnOverlay=%s 时 preventDefault 调用=%s',
        async (closeOnOverlay, prevented) => {
            const wrapper = mount(CaomeiDialog, {
                props: { title: '标题', open: true, closeOnOverlay },
            })
            await nextTick()

            const event = { preventDefault: vi.fn() }
            wrapper.findComponent(DialogContent).vm.$emit('pointerDownOutside', event)

            expect(event.preventDefault).toHaveBeenCalledTimes(prevented ? 1 : 0)
        },
    )

    it('title 缺省时回退内建文案作为不可见可访问名，不产生空标题', async () => {
        mount(CaomeiDialog, { props: { open: true } })
        await nextTick()

        const dialog = getDialog()
        const labelledby = dialog?.getAttribute('aria-labelledby')
        const titleElement = document.getElementById(labelledby as string)
        expect(titleElement?.textContent).toBe('对话框')
        expect(titleElement?.classList.contains('caomei-dialog__title--hidden')).toBe(true)
    })

    it('title 缺省时使用注入 locale 的可访问名文案', async () => {
        mount(CaomeiDialog, {
            props: { open: true },
            global: {
                provide: { [caomeiLocaleKey]: computed(() => caomeiLocales['en-US']) },
            },
        })
        await nextTick()

        const labelledby = getDialog()?.getAttribute('aria-labelledby')
        expect(document.getElementById(labelledby as string)?.textContent).toBe('Dialog')
    })

    it('showHeader=false 时不渲染头部与关闭按钮，标题转为不可见可访问名', async () => {
        mount(CaomeiDialog, {
            props: { title: '标题', description: '描述', open: true, showHeader: false },
        })
        await nextTick()

        const dialog = getDialog()
        expect(document.querySelector('.caomei-dialog__header')).toBeNull()
        expect(document.querySelector('.caomei-dialog__close')).toBeNull()

        const labelledby = dialog?.getAttribute('aria-labelledby')
        const titleElement = document.getElementById(labelledby as string)
        expect(titleElement?.textContent).toBe('标题')
        expect(titleElement?.classList.contains('caomei-dialog__title--hidden')).toBe(true)

        const describedby = dialog?.getAttribute('aria-describedby')
        expect(document.getElementById(describedby as string)?.textContent).toBe('描述')
    })

    it('open 由真转假时抛出 hide，初始与打开时不触发', async () => {
        const wrapper = mount(CaomeiDialog, { props: { title: '标题', open: false } })
        await nextTick()
        expect(wrapper.emitted('hide')).toBeUndefined()

        await wrapper.setProps({ open: true })
        await nextTick()
        expect(wrapper.emitted('hide')).toBeUndefined()

        await wrapper.setProps({ open: false })
        await nextTick()
        expect(wrapper.emitted('hide')).toEqual([[]])
    })

    it('点击关闭按钮同时抛出 update:open=false 与 hide', async () => {
        const wrapper = mount(CaomeiDialog, { props: { title: '标题', open: true } })
        await nextTick()

        ;(document.querySelector('.caomei-dialog__close') as HTMLElement).click()
        await nextTick()

        expect(wrapper.emitted('update:open')?.[0]).toEqual([false])
        expect(wrapper.emitted('hide')).toEqual([[]])
    })

    it('未提供 breakpoints 时不注入断点样式', async () => {
        mount(CaomeiDialog, { props: { title: '标题', open: true } })
        await nextTick()

        const dialog = getDialog()
        expect(dialog?.hasAttribute('data-caomei-dialog-breakpoint')).toBe(false)
        expect(dialog?.querySelector('style')).toBeNull()
    })

    it('提供 breakpoints 时按实例选择器注入媒体查询，窄档在后', async () => {
        mount(CaomeiDialog, {
            props: {
                title: '标题',
                open: true,
                breakpoints: { '1199px': '85vw', '575px': '95vw' },
            },
        })
        await nextTick()

        const dialog = getDialog()
        const id = dialog?.getAttribute('data-caomei-dialog-breakpoint')
        expect(id).toBeTruthy()

        const css = dialog?.querySelector('style')?.textContent ?? ''
        expect(css).toContain(`.caomei-dialog__content[data-caomei-dialog-breakpoint="${id}"]`)
        expect(css).toContain('@media (width <= 1199px)')
        expect(css).toContain('@media (width <= 575px)')
        expect(css).toContain('width: 85vw;')
        expect(css).toContain('width: 95vw;')
        expect(css.indexOf('575px')).toBeGreaterThan(css.indexOf('1199px'))
    })

    it('提供 title 时标题不隐藏', async () => {
        mount(CaomeiDialog, { props: { title: '标题', open: true } })
        await nextTick()

        const titleElement = document.querySelector('.caomei-dialog__title')
        expect(titleElement?.textContent).toBe('标题')
        expect(titleElement?.classList.contains('caomei-dialog__title--hidden')).toBe(false)
    })

    it('非法断点条目被忽略，全部非法时不注入样式', async () => {
        const partial = mount(CaomeiDialog, {
            props: {
                title: '标题',
                open: true,
                breakpoints: { '1199px': '85vw', small: '90vw', '640px': 'expression(alert(1))' },
            },
        })
        await nextTick()

        const css = getDialog()?.querySelector('style')?.textContent ?? ''
        expect(css).toContain('@media (width <= 1199px)')
        expect(css).not.toContain('640px')
        expect(css).not.toContain('small')
        partial.unmount()

        mount(CaomeiDialog, {
            props: { title: '标题', open: true, breakpoints: { small: '90vw' } },
        })
        await nextTick()

        const dialog = getDialog()
        expect(dialog?.hasAttribute('data-caomei-dialog-breakpoint')).toBe(false)
        expect(dialog?.querySelector('style')).toBeNull()
    })

    it('breakpoints 变更后实例属性与样式同步增删', async () => {
        const wrapper = mount(CaomeiDialog, { props: { title: '标题', open: true } })
        await nextTick()
        expect(getDialog()?.querySelector('style')).toBeNull()

        await wrapper.setProps({ breakpoints: { '640px': '100vw' } })
        await nextTick()
        expect(getDialog()?.querySelector('style')?.textContent).toContain(
            '@media (width <= 640px)',
        )

        await wrapper.setProps({ breakpoints: { '768px': '90vw' } })
        await nextTick()
        const updated = getDialog()?.querySelector('style')?.textContent ?? ''
        expect(updated).toContain('@media (width <= 768px)')
        expect(updated).not.toContain('640px')

        await wrapper.setProps({ breakpoints: {} })
        await nextTick()
        expect(getDialog()?.hasAttribute('data-caomei-dialog-breakpoint')).toBe(false)
        expect(getDialog()?.querySelector('style')).toBeNull()
    })
})
