import { enableAutoUnmount, mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CaomeiAccordion, CaomeiAccordionItem } from './index'

enableAutoUnmount(afterEach)

afterEach(() => {
    document.body.innerHTML = ''
})

function createSlots() {
    return {
        default: () => [
            h(CaomeiAccordionItem, { value: 'a', title: '第一项' }, { default: () => '内容 A' }),
            h(CaomeiAccordionItem, { value: 'b', title: '第二项' }, { default: () => '内容 B' }),
            h(CaomeiAccordionItem, { value: 'c', title: '第三项', disabled: true }, { default: () => '内容 C' }),
        ],
    }
}

function mountAccordion(
    props: Record<string, unknown> = {},
    options: Record<string, unknown> = {},
) {
    return mount(CaomeiAccordion, {
        props,
        slots: createSlots(),
        ...options,
    })
}

function getTriggers(wrapper: ReturnType<typeof mountAccordion>) {
    return wrapper.findAll('.caomei-accordion__trigger')
}

function getRegions(wrapper: ReturnType<typeof mountAccordion>) {
    return wrapper.findAll('[role="region"]')
}

function focusTrigger(wrapper: ReturnType<typeof mountAccordion>, index: number) {
    (getTriggers(wrapper)[index].element as HTMLElement).focus()
}

describe('CaomeiAccordion', () => {
    it('渲染 header / trigger / region 并建立 ARIA 关联', () => {
        const wrapper = mountAccordion()

        expect(wrapper.find('.caomei-accordion').exists()).toBe(true)
        expect(wrapper.findAll('.caomei-accordion__item')).toHaveLength(3)

        const headers = wrapper.findAll('h3.caomei-accordion__header')
        expect(headers).toHaveLength(3)

        const triggers = getTriggers(wrapper)
        expect(triggers).toHaveLength(3)
        expect(triggers[0].element.tagName).toBe('BUTTON')
        expect(triggers[0].attributes('aria-expanded')).toBe('false')

        const regions = getRegions(wrapper)
        expect(regions).toHaveLength(3)
        expect(regions[0].attributes('aria-labelledby')).toBe(triggers[0].attributes('id'))
        expect(regions[0].attributes('hidden')).toBeDefined()
    })

    it('单开模式下点击展开并在条目间切换', async () => {
        const wrapper = mountAccordion()
        const triggers = getTriggers(wrapper)
        const regions = getRegions(wrapper)

        await triggers[0].trigger('click')
        await nextTick()
        expect(triggers[0].attributes('aria-expanded')).toBe('true')
        expect(regions[0].attributes('hidden')).toBeUndefined()
        expect(regions[0].text()).toBe('内容 A')

        await triggers[1].trigger('click')
        await nextTick()
        expect(triggers[0].attributes('aria-expanded')).toBe('false')
        expect(triggers[1].attributes('aria-expanded')).toBe('true')
        expect(regions[1].text()).toBe('内容 B')
    })

    it('collapsible 控制单开模式下能否收起', async () => {
        const strict = mountAccordion()
        await getTriggers(strict)[0].trigger('click')
        await getTriggers(strict)[0].trigger('click')
        await nextTick()
        expect(getTriggers(strict)[0].attributes('aria-expanded')).toBe('true')

        const collapsible = mountAccordion({ collapsible: true })
        await getTriggers(collapsible)[0].trigger('click')
        await getTriggers(collapsible)[0].trigger('click')
        await nextTick()
        expect(getTriggers(collapsible)[0].attributes('aria-expanded')).toBe('false')
    })

    it('multiple 模式可同时展开多项', async () => {
        const wrapper = mountAccordion({ type: 'multiple' })

        await getTriggers(wrapper)[0].trigger('click')
        await getTriggers(wrapper)[1].trigger('click')
        await nextTick()

        expect(getTriggers(wrapper)[0].attributes('aria-expanded')).toBe('true')
        expect(getTriggers(wrapper)[1].attributes('aria-expanded')).toBe('true')
        expect(getTriggers(wrapper)[2].attributes('aria-expanded')).toBe('false')
    })

    it('defaultValue 决定初始展开项', async () => {
        const single = mountAccordion({ defaultValue: 'b' })
        await nextTick()
        expect(getTriggers(single)[1].attributes('aria-expanded')).toBe('true')
        expect(getRegions(single)[1].text()).toBe('内容 B')

        const multiple = mountAccordion({ type: 'multiple', defaultValue: ['a', 'b'] })
        await nextTick()
        expect(getTriggers(multiple)[0].attributes('aria-expanded')).toBe('true')
        expect(getTriggers(multiple)[1].attributes('aria-expanded')).toBe('true')
    })

    it('受控时点击抛出 update:modelValue 且不自行切换', async () => {
        const wrapper = mountAccordion({
            modelValue: 'a',
            'onUpdate:modelValue': vi.fn(),
        })

        await getTriggers(wrapper)[1].trigger('click')
        await nextTick()

        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['b'])
        expect(getTriggers(wrapper)[0].attributes('aria-expanded')).toBe('true')
        expect(getTriggers(wrapper)[1].attributes('aria-expanded')).toBe('false')
    })

    it('禁用项不可展开', async () => {
        const wrapper = mountAccordion()
        const disabled = getTriggers(wrapper)[2]

        expect(disabled.attributes('disabled')).toBeDefined()
        expect(disabled.attributes('data-disabled')).toBeDefined()

        await disabled.trigger('click')
        await nextTick()
        expect(disabled.attributes('aria-expanded')).toBe('false')
    })

    it('根 disabled 禁用全部条目', () => {
        const wrapper = mountAccordion({ disabled: true })

        for (const trigger of getTriggers(wrapper)) {
            expect(trigger.attributes('disabled')).toBeDefined()
            expect(trigger.attributes('aria-disabled')).toBe('true')
        }
    })

    it('外部更新 modelValue 同步展开项', async () => {
        const wrapper = mountAccordion({ modelValue: 'a' })
        await nextTick()

        await wrapper.setProps({ modelValue: 'b' })
        await nextTick()

        expect(getTriggers(wrapper)[0].attributes('aria-expanded')).toBe('false')
        expect(getTriggers(wrapper)[1].attributes('aria-expanded')).toBe('true')
    })

    it('键盘 Home / End 跳到首个 / 末个条目', async () => {
        const wrapper = mountAccordion({}, {
            attachTo: document.body,
            slots: {
                default: () => [
                    h(CaomeiAccordionItem, { value: 'a', title: '一' }, { default: () => '内容 A' }),
                    h(CaomeiAccordionItem, { value: 'b', title: '二' }, { default: () => '内容 B' }),
                    h(CaomeiAccordionItem, { value: 'c', title: '三' }, { default: () => '内容 C' }),
                ],
            },
        })

        focusTrigger(wrapper, 0)
        await nextTick()
        await getTriggers(wrapper)[0].trigger('keydown', { key: 'End' })
        await nextTick()
        expect(document.activeElement).toBe(getTriggers(wrapper)[2].element)

        await getTriggers(wrapper)[2].trigger('keydown', { key: 'Home' })
        await nextTick()
        expect(document.activeElement).toBe(getTriggers(wrapper)[0].element)
    })

    it('键盘上下键在触发器间移动焦点', async () => {
        const wrapper = mountAccordion({}, { attachTo: document.body })

        focusTrigger(wrapper, 0)
        await nextTick()
        await getTriggers(wrapper)[0].trigger('keydown', { key: 'ArrowDown' })
        await nextTick()

        expect(document.activeElement).toBe(getTriggers(wrapper)[1].element)

        await getTriggers(wrapper)[1].trigger('keydown', { key: 'ArrowUp' })
        await nextTick()
        expect(document.activeElement).toBe(getTriggers(wrapper)[0].element)
    })

    it('trigger 插槽可自定义触发器内容', () => {
        const wrapper = mountAccordion({}, {
            slots: {
                default: () => [
                    h(CaomeiAccordionItem, { value: 'x' }, {
                        trigger: () => '自定义触发器',
                        default: () => '内容 X',
                    }),
                ],
            },
        })

        expect(getTriggers(wrapper)[0].text()).toContain('自定义触发器')
    })

    it('unmountOnHide 为 false 时收起内容仍保留', () => {
        const unmounted = mountAccordion()
        expect(getRegions(unmounted)[1].text()).toBe('')

        const kept = mountAccordion({ unmountOnHide: false })
        expect(getRegions(kept)[1].text()).toBe('内容 B')
    })

    it('class 透传到根元素', () => {
        const wrapper = mountAccordion({ class: 'custom-accordion' })

        expect(wrapper.get('.caomei-accordion').classes()).toContain('custom-accordion')
    })
})
