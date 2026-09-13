import { enableAutoUnmount, mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
    CaomeiTabContent,
    CaomeiTabList,
    CaomeiTabTrigger,
    CaomeiTabs,
} from './index'

enableAutoUnmount(afterEach)

afterEach(() => {
    document.body.innerHTML = ''
})

function createSlots() {
    return {
        default: () => [
            h(CaomeiTabList, { 'aria-label': '示例标签' }, {
                default: () => [
                    h(CaomeiTabTrigger, { value: 'a' }, { default: () => '账户' }),
                    h(CaomeiTabTrigger, { value: 'b' }, { default: () => '密码' }),
                    h(CaomeiTabTrigger, { value: 'c', disabled: true }, { default: () => '禁用' }),
                ],
            }),
            h(CaomeiTabContent, { value: 'a' }, { default: () => '内容 A' }),
            h(CaomeiTabContent, { value: 'b' }, { default: () => '内容 B' }),
            h(CaomeiTabContent, { value: 'c' }, { default: () => '内容 C' }),
        ],
    }
}

function mountTabs(
    props: Record<string, unknown> = {},
    options: Record<string, unknown> = {},
) {
    return mount(CaomeiTabs, {
        props,
        slots: createSlots(),
        ...options,
    })
}

function getTabs(wrapper: ReturnType<typeof mountTabs>) {
    return wrapper.findAll('[role="tab"]')
}

function getActivePanel(wrapper: ReturnType<typeof mountTabs>) {
    return wrapper.get('[role="tabpanel"][data-state="active"]')
}

/** Reka 的焦点/注册行为跨多个 tick 生效，等待两轮微任务后再断言 */
async function flush() {
    await nextTick()
    await nextTick()
}

function focusTab(wrapper: ReturnType<typeof mountTabs>, index: number) {
    (getTabs(wrapper)[index].element as HTMLElement).focus()
}

function createSimpleSlots(options: { loop?: boolean, forceMountB?: boolean } = {}) {
    return {
        default: () => [
            h(CaomeiTabList, { loop: options.loop }, {
                default: () => [
                    h(CaomeiTabTrigger, { value: 'a' }, { default: () => '甲' }),
                    h(CaomeiTabTrigger, { value: 'b' }, { default: () => '乙' }),
                ],
            }),
            h(CaomeiTabContent, { value: 'a' }, { default: () => '面板甲' }),
            h(CaomeiTabContent, { value: 'b', forceMount: options.forceMountB }, { default: () => '面板乙' }),
        ],
    }
}

describe('CaomeiTabs', () => {
    it('渲染 tablist / tab / tabpanel 并建立 ARIA 关联', async () => {
        const wrapper = mountTabs({ defaultValue: 'a' })
        await flush()

        const list = wrapper.get('[role="tablist"]')
        expect(list.attributes('aria-label')).toBe('示例标签')
        expect(list.attributes('aria-orientation')).toBe('horizontal')

        const tabs = getTabs(wrapper)
        expect(tabs).toHaveLength(3)
        expect(tabs[0].attributes('aria-selected')).toBe('true')
        expect(tabs[1].attributes('aria-selected')).toBe('false')
        expect(tabs[0].attributes('data-state')).toBe('active')

        const panels = wrapper.findAll('[role="tabpanel"]')
        expect(panels).toHaveLength(3)
        expect(getActivePanel(wrapper).text()).toBe('内容 A')
        expect(tabs[0].attributes('aria-controls')).toBe(getActivePanel(wrapper).attributes('id'))
        expect(getActivePanel(wrapper).attributes('aria-labelledby')).toBe(tabs[0].attributes('id'))
    })

    it('defaultValue 决定非受控初始激活项', () => {
        const wrapper = mountTabs({ defaultValue: 'b' })

        expect(getTabs(wrapper)[1].attributes('aria-selected')).toBe('true')
        expect(getActivePanel(wrapper).text()).toBe('内容 B')
    })

    it('受控时点击抛出 update:modelValue 且不自行切换', async () => {
        const wrapper = mountTabs({
            modelValue: 'a',
            'onUpdate:modelValue': vi.fn(),
        })
        await flush()

        await getTabs(wrapper)[1].trigger('mousedown')
        await flush()

        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['b'])
        expect(getTabs(wrapper)[1].attributes('aria-selected')).toBe('false')
        expect(getActivePanel(wrapper).text()).toBe('内容 A')
    })

    it('非受控时点击切换面板', async () => {
        const wrapper = mountTabs({ defaultValue: 'a' })

        await getTabs(wrapper)[1].trigger('mousedown')
        await flush()

        expect(getTabs(wrapper)[1].attributes('aria-selected')).toBe('true')
        expect(getActivePanel(wrapper).text()).toBe('内容 B')
    })

    it('外部更新 modelValue 同步激活项', async () => {
        const wrapper = mountTabs({ modelValue: 'a' })
        await flush()

        await wrapper.setProps({ modelValue: 'b' })
        await flush()

        expect(getTabs(wrapper)[1].attributes('aria-selected')).toBe('true')
        expect(getActivePanel(wrapper).text()).toBe('内容 B')
    })

    it('禁用项不可激活', async () => {
        const wrapper = mountTabs({ defaultValue: 'a' })

        const disabled = getTabs(wrapper)[2]
        expect(disabled.attributes('disabled')).toBeDefined()
        expect(disabled.attributes('data-disabled')).toBeDefined()

        await disabled.trigger('mousedown')
        await nextTick()

        expect(disabled.attributes('aria-selected')).toBe('false')
        expect(getActivePanel(wrapper).text()).toBe('内容 A')
    })

    it('键盘方向键切换并激活（自动激活模式）', async () => {
        const wrapper = mountTabs({ defaultValue: 'a' }, { attachTo: document.body })

        focusTab(wrapper, 0)
        await nextTick()
        await getTabs(wrapper)[0].trigger('keydown', { key: 'ArrowRight' })
        await flush()

        expect(getTabs(wrapper)[1].attributes('aria-selected')).toBe('true')
        expect(document.activeElement).toBe(getTabs(wrapper)[1].element)
    })

    it('键盘 Home / End 跳到首个 / 末个可用项（跳过禁用项）', async () => {
        const wrapper = mountTabs({ defaultValue: 'b' }, { attachTo: document.body })

        focusTab(wrapper, 0)
        await nextTick()
        await getTabs(wrapper)[0].trigger('keydown', { key: 'End' })
        await flush()
        expect(getTabs(wrapper)[1].attributes('aria-selected')).toBe('true')
        expect(getTabs(wrapper)[2].attributes('aria-selected')).toBe('false')

        await getTabs(wrapper)[1].trigger('keydown', { key: 'Home' })
        await flush()
        expect(getTabs(wrapper)[0].attributes('aria-selected')).toBe('true')
    })

    it('manual 模式下聚焦不激活，回车才激活', async () => {
        const wrapper = mountTabs(
            { defaultValue: 'a', activationMode: 'manual' },
            { attachTo: document.body },
        )

        focusTab(wrapper, 1)
        await nextTick()
        expect(getTabs(wrapper)[1].attributes('aria-selected')).toBe('false')

        await getTabs(wrapper)[1].trigger('keydown', { key: 'Enter' })
        await flush()
        expect(getTabs(wrapper)[1].attributes('aria-selected')).toBe('true')
    })

    it('vertical 方向使用上下键导航', async () => {
        const wrapper = mountTabs(
            { defaultValue: 'a', orientation: 'vertical' },
            { attachTo: document.body },
        )

        const root = wrapper.get('.caomei-tabs')
        expect(root.classes()).toContain('caomei-tabs--vertical')
        expect(wrapper.get('[role="tablist"]').attributes('aria-orientation')).toBe('vertical')

        focusTab(wrapper, 0)
        await nextTick()
        await getTabs(wrapper)[0].trigger('keydown', { key: 'ArrowDown' })
        await flush()
        expect(getTabs(wrapper)[1].attributes('aria-selected')).toBe('true')
    })

    it('loop 为 false 时末项方向键不循环', async () => {
        const wrapper = mountTabs(
            { defaultValue: 'b' },
            { slots: createSimpleSlots({ loop: false }), attachTo: document.body },
        )

        focusTab(wrapper, 1)
        await nextTick()
        await getTabs(wrapper)[1].trigger('keydown', { key: 'ArrowRight' })
        await flush()

        expect(getTabs(wrapper)[1].attributes('aria-selected')).toBe('true')
    })

    it('dir 为 rtl 时左右方向键语义翻转', async () => {
        const wrapper = mountTabs({ defaultValue: 'a', dir: 'rtl' }, { attachTo: document.body })

        focusTab(wrapper, 0)
        await nextTick()
        await getTabs(wrapper)[0].trigger('keydown', { key: 'ArrowLeft' })
        await flush()

        expect(getTabs(wrapper)[1].attributes('aria-selected')).toBe('true')
    })

    it('forceMount 使非激活面板内容保持挂载', () => {
        const wrapper = mount(CaomeiTabs, {
            props: { defaultValue: 'a' },
            slots: createSimpleSlots({ forceMountB: true }),
        })

        expect(wrapper.get('[role="tabpanel"][data-state="inactive"]').text()).toBe('面板乙')
    })

    it('默认卸载非激活面板内容，unmountOnHide 为 false 时保留', () => {
        const unmounted = mountTabs({ defaultValue: 'a' })
        const unmountedHidden = unmounted.get('[role="tabpanel"][data-state="inactive"]')
        expect(unmountedHidden.attributes('hidden')).toBeDefined()
        expect(unmountedHidden.text()).toBe('')

        const kept = mountTabs({ defaultValue: 'a', unmountOnHide: false })
        const keptHidden = kept.get('[role="tabpanel"][data-state="inactive"]')
        expect(keptHidden.attributes('hidden')).toBeDefined()
        expect(keptHidden.text()).toBe('内容 B')
    })

    it('class 透传到根元素', () => {
        const wrapper = mountTabs({ class: 'custom-tabs' })

        expect(wrapper.get('.caomei-tabs').classes()).toContain('custom-tabs')
    })
})
