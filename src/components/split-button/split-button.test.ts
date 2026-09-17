import { DOMWrapper, mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { computed, nextTick, ref } from 'vue'
import { caomeiLocaleKey } from '../../composables/use-locale'
import { caomeiLocales } from '../../locale'
import type { SplitButtonMenuItem } from './types'
import { CaomeiSplitButton } from './index'

afterEach(() => {
    document.body.innerHTML = ''
})

async function flush() {
    await nextTick()
    await nextTick()
}

function mountSplit(
    props: Record<string, unknown> = {},
    slots: Record<string, string | (() => unknown)> = {},
): VueWrapper {
    return mount(CaomeiSplitButton, {
        props,
        slots,
        attachTo: document.body,
    })
}

function mainButton(wrapper: VueWrapper) {
    return wrapper.get('.caomei-split-button__main')
}

function menuButton(wrapper: VueWrapper) {
    return wrapper.get('.caomei-split-button__menu')
}

async function openMenu(wrapper: VueWrapper) {
    await menuButton(wrapper).trigger('click')
    await flush()
}

function menuItems() {
    return Array.from(document.body.querySelectorAll<HTMLElement>('.caomei-dropdown-menu__item'))
}

async function clickElement(element: Element) {
    await new DOMWrapper(element).trigger('click')
}

describe('CaomeiSplitButton', () => {
    it('渲染主按钮与下拉按钮两个 button', () => {
        const wrapper = mountSplit({}, { default: '保存' })

        expect(wrapper.findAll('button')).toHaveLength(2)
        expect(mainButton(wrapper).element.tagName).toBe('BUTTON')
        expect(menuButton(wrapper).element.tagName).toBe('BUTTON')
    })

    it('默认插槽渲染为主按钮可见文本', () => {
        const wrapper = mountSplit({}, { default: '保存' })

        expect(mainButton(wrapper).text()).toBe('保存')
    })

    it('label 作为主按钮可访问名而非可见文本', () => {
        const wrapper = mountSplit({ label: '保存' })

        expect(mainButton(wrapper).attributes('aria-label')).toBe('保存')
        expect(mainButton(wrapper).text()).toBe('')
    })

    it('主按钮可访问名：label 优先于透传 aria-label，缺省时取透传值', () => {
        const explicit = mount(CaomeiSplitButton, {
            props: { label: '保存' },
            attrs: { 'aria-label': '透传名' },
            attachTo: document.body,
        })
        expect(mainButton(explicit).attributes('aria-label')).toBe('保存')

        const forwarded = mount(CaomeiSplitButton, {
            attrs: { 'aria-label': '透传名' },
            attachTo: document.body,
        })
        expect(mainButton(forwarded).attributes('aria-label')).toBe('透传名')
    })

    it('渲染 icon 插槽到主按钮', () => {
        const wrapper = mountSplit({}, { icon: '<svg data-test="icon" />' })

        expect(mainButton(wrapper).find('[data-test="icon"]').exists()).toBe(true)
    })

    it('点击主按钮抛出 click', async () => {
        const wrapper = mountSplit({}, { default: '保存' })

        await mainButton(wrapper).trigger('click')

        expect(wrapper.emitted('click')).toHaveLength(1)
    })

    it('下拉按钮默认可访问名取内建文案', () => {
        const wrapper = mountSplit()

        expect(menuButton(wrapper).attributes('aria-label')).toBe('更多操作')
    })

    it('menuLabel 可覆盖下拉按钮可访问名', () => {
        const wrapper = mountSplit({ menuLabel: '打开菜单' })

        expect(menuButton(wrapper).attributes('aria-label')).toBe('打开菜单')
    })

    it('下拉按钮使用注入 locale 的文案', () => {
        const localized = mount(CaomeiSplitButton, {
            attachTo: document.body,
            global: { provide: { [caomeiLocaleKey]: computed(() => caomeiLocales['en-US']) } },
        })

        expect(menuButton(localized).attributes('aria-label')).toBe('More actions')
    })

    it('注入 locale 运行时切换生效', async () => {
        const messages = ref(caomeiLocales['zh-CN'])
        const wrapper = mount(CaomeiSplitButton, {
            attachTo: document.body,
            global: { provide: { [caomeiLocaleKey]: computed(() => messages.value) } },
        })

        expect(menuButton(wrapper).attributes('aria-label')).toBe('更多操作')

        messages.value = caomeiLocales['en-US']
        await nextTick()

        expect(menuButton(wrapper).attributes('aria-label')).toBe('More actions')
    })

    it('打开菜单后渲染 model 项', async () => {
        const wrapper = mountSplit({
            model: [{ label: '另存为' }, { label: '导出' }],
        })

        await openMenu(wrapper)

        const items = menuItems()
        expect(items).toHaveLength(2)
        expect(items[0]?.textContent).toContain('另存为')
        expect(items[1]?.textContent).toContain('导出')
    })

    it('点击菜单项调用 command 并传入 item 与 originalEvent', async () => {
        const command = vi.fn()
        const model: SplitButtonMenuItem[] = [{ label: '另存为', command }]
        const wrapper = mountSplit({ model })

        await openMenu(wrapper)
        await clickElement(menuItems()[0] as Element)

        expect(command).toHaveBeenCalledTimes(1)
        const payload = command.mock.calls[0]?.[0] as { item: SplitButtonMenuItem, originalEvent: Event }
        expect(payload.item).toEqual(model[0])
        expect(payload.originalEvent).toBeInstanceOf(Event)
    })

    it('键盘（Enter）选中菜单项触发 command', async () => {
        const command = vi.fn()
        const wrapper = mountSplit({ model: [{ label: '另存为', command }] })

        await openMenu(wrapper)
        const item = menuItems()[0]
        expect(item).toBeDefined()
        ;(item as HTMLElement).focus()
        await new DOMWrapper(item as Element).trigger('keydown', { key: 'Enter' })
        await flush()

        expect(command).toHaveBeenCalledTimes(1)
    })

    it('separator 项渲染为分隔线而不渲染为可点击项', async () => {
        const wrapper = mountSplit({
            model: [{ label: '另存为' }, { separator: true }, { label: '导出' }],
        })

        await openMenu(wrapper)

        expect(menuItems()).toHaveLength(2)
        expect(document.body.querySelector('.caomei-dropdown-menu__separator')).not.toBeNull()
    })

    it('禁用的菜单项不触发 command', async () => {
        const command = vi.fn()
        const wrapper = mountSplit({ model: [{ label: '删除', command, disabled: true }] })

        await openMenu(wrapper)
        await clickElement(menuItems()[0] as Element)

        expect(command).not.toHaveBeenCalled()
    })

    it('disabled 时两个按钮均禁用', () => {
        const wrapper = mountSplit({ disabled: true })

        expect(mainButton(wrapper).attributes('disabled')).toBeDefined()
        expect(menuButton(wrapper).attributes('disabled')).toBeDefined()
    })

    it('loading 时主按钮处于加载态', () => {
        const wrapper = mountSplit({ loading: true })

        expect(mainButton(wrapper).classes()).toContain('caomei-button--loading')
        expect(mainButton(wrapper).attributes('disabled')).toBeDefined()
    })

    it.each(['primary', 'secondary', 'ghost'] as const)('variant=%s 透传到两个按钮', (variant) => {
        const wrapper = mountSplit({ variant })

        for (const button of [mainButton(wrapper), menuButton(wrapper)]) {
            expect(button.classes()).toContain(`caomei-button--${variant}`)
        }
    })

    it('tone / size / rounded 透传到两个按钮', () => {
        const wrapper = mountSplit({ tone: 'danger', size: 'lg', rounded: true })

        for (const button of [mainButton(wrapper), menuButton(wrapper)]) {
            expect(button.classes()).toContain('caomei-button--tone-danger')
            expect(button.classes()).toContain('caomei-button--lg')
            expect(button.classes()).toContain('caomei-button--rounded')
        }
    })

    it.each([
        ['top', 'start'],
        ['bottom', 'end'],
    ] as const)('menuSide=%s / menuAlign=%s 透传到菜单', async (side, align) => {
        const wrapper = mountSplit({ menuSide: side, menuAlign: align, model: [{ label: '项' }] })

        await openMenu(wrapper)

        const content = document.body.querySelector('.caomei-dropdown-menu__content')
        expect(content?.getAttribute('data-side')).toBe(side)
        expect(content?.getAttribute('data-align')).toBe(align)
    })

    it('透传原生属性到根元素', () => {
        const wrapper = mountSplit({ id: 'split-1' })

        expect(wrapper.get('.caomei-split-button').attributes('id')).toBe('split-1')
    })
})
