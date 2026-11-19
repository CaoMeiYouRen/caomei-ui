import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref, type Component, type Ref } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { __resetIsolationForTest } from '../../_shared/open-state-inert'
import { useOpenStateIsolation } from './use-open-state-isolation'

afterEach(() => {
    document.body.innerHTML = ''
    __resetIsolationForTest()
})

/** 打开态由组件自持的载体：`field` 是保留根，`outside` 是应被隔离的背景 */
function createOpenHarness(): { Comp: Component, open: Ref<boolean> } {
    const open = ref(false)
    const contentRef: Ref<{ $el?: unknown } | null> = ref(null)
    const fieldRef: Ref<HTMLElement | null> = ref(null)
    const Comp = defineComponent({
        setup() {
            useOpenStateIsolation(contentRef, () => [fieldRef.value], () => open.value)
            return () => h('div', { class: 'host' }, [
                h('button', {
                    class: 'field',
                    ref: (element) => {
                        fieldRef.value = element as HTMLElement | null
                    },
                }, 'field'),
                h('div', { class: 'outside' }, 'outside'),
                open.value
                    ? h('div', {
                        class: 'panel',
                        ref: (element) => {
                            contentRef.value = { $el: element }
                        },
                    })
                    : null,
            ])
        },
    })
    return { Comp, open }
}

/** 无组件开合状态的载体：以内容根 `data-state` 为准 */
function createDataStateHarness(): { Comp: Component, state: Ref<string> } {
    const state = ref('closed')
    const contentRef: Ref<{ $el?: unknown } | null> = ref(null)
    const Comp = defineComponent({
        setup() {
            useOpenStateIsolation(contentRef)
            return () => h('div', { class: 'host' }, [
                h('div', { class: 'outside' }, 'outside'),
                h('div', {
                    class: 'panel',
                    'data-state': state.value,
                    ref: (element) => {
                        contentRef.value = { $el: element }
                    },
                }),
            ])
        },
    })
    return { Comp, state }
}

describe('useOpenStateIsolation', () => {
    it('自持打开态：挂载即展开时也隔离背景并保留额外根', async () => {
        const { Comp, open } = createOpenHarness()
        open.value = true
        const wrapper = mount(Comp, { attachTo: document.body })
        const outside = wrapper.get('.outside').element as HTMLElement
        const field = wrapper.get('.field').element as HTMLElement
        const panel = wrapper.get('.panel').element as HTMLElement

        await nextTick()
        await nextTick()

        expect(outside.hasAttribute('inert')).toBe(true)
        expect(field.hasAttribute('inert')).toBe(false)
        expect(panel.hasAttribute('inert')).toBe(false)

        wrapper.unmount()
    })

    it('自持打开态：打开后隔离背景并保留额外根，关闭时同步回退', async () => {
        const { Comp, open } = createOpenHarness()
        const wrapper = mount(Comp, { attachTo: document.body })
        const outside = wrapper.get('.outside').element as HTMLElement
        const field = wrapper.get('.field').element as HTMLElement

        open.value = true
        await nextTick()
        await nextTick()

        const panel = wrapper.get('.panel').element as HTMLElement
        expect(outside.hasAttribute('inert')).toBe(true)
        expect(field.hasAttribute('inert')).toBe(false)
        expect(panel.hasAttribute('inert')).toBe(false)

        open.value = false
        // 同步回退：焦点归还发生在同一刷新内，等 tick 才能观察到就会晚于归还
        expect(outside.hasAttribute('inert')).toBe(false)

        wrapper.unmount()
    })

    it('无自持打开态：跟随内容根 data-state 隔离与回退', async () => {
        const { Comp, state } = createDataStateHarness()
        const wrapper = mount(Comp, { attachTo: document.body })
        const outside = wrapper.get('.outside').element as HTMLElement
        const panel = wrapper.get('.panel').element as HTMLElement

        state.value = 'open'
        await nextTick()
        await nextTick()
        expect(outside.hasAttribute('inert')).toBe(true)
        expect(panel.hasAttribute('inert')).toBe(false)

        state.value = 'closed'
        await nextTick()
        expect(outside.hasAttribute('inert')).toBe(false)

        wrapper.unmount()
    })
})
