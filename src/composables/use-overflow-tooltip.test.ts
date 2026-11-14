import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { resetResizeObserverStub, ResizeObserverStub, setElementMetrics } from '../../test/helpers/resize-observer'
import { useOverflowTooltip } from './use-overflow-tooltip'

/** 最小宿主：把 composable 的可观察状态与元素挂到真实 DOM 上 */
function mountProbe(options: { disabled?: boolean, tolerance?: number } = {}) {
    const disabled = ref(options.disabled ?? false)
    const target = ref<HTMLElement | null>(null)
    const state = { overflowing: false }

    const wrapper = mount(defineComponent({
        setup() {
            const result = useOverflowTooltip(target, {
                disabled: () => disabled.value,
                tolerance: options.tolerance,
            })
            return () => {
                state.overflowing = result.overflowing.value
                return h('span', { ref: target, class: 'probe' }, '文本')
            }
        },
    }), { attachTo: document.body })

    return { wrapper, disabled, state }
}

function probeElement(): HTMLElement {
    const element = document.querySelector('.probe')
    if (!element) {
        throw new Error('未渲染探测元素')
    }
    return element as HTMLElement
}

function triggerObserver(index = 0): void {
    const observer = ResizeObserverStub.instances.at(index)
    if (!observer) {
        throw new Error('未创建 ResizeObserver')
    }
    observer.trigger()
}

beforeEach(() => {
    resetResizeObserverStub()
    vi.stubGlobal('ResizeObserver', ResizeObserverStub)
})

afterEach(() => {
    document.body.innerHTML = ''
    vi.unstubAllGlobals()
})

describe('useOverflowTooltip', () => {
    it('挂载时按几何读数判定，未溢出为 false', async () => {
        const { wrapper, state } = mountProbe()
        await nextTick()

        expect(state.overflowing).toBe(false)

        setElementMetrics(probeElement(), 120, 120)
        triggerObserver()
        await nextTick()
        expect(state.overflowing).toBe(false)

        wrapper.unmount()
    })

    it('容差边界：差值等于 tolerance 仍为未溢出', async () => {
        const { wrapper, state } = mountProbe()
        await nextTick()

        setElementMetrics(probeElement(), 121, 120)
        triggerObserver()
        await nextTick()
        expect(state.overflowing).toBe(false)

        setElementMetrics(probeElement(), 122, 120)
        triggerObserver()
        await nextTick()
        expect(state.overflowing).toBe(true)

        wrapper.unmount()
    })

    it('自定义 tolerance 生效', async () => {
        const { wrapper, state } = mountProbe({ tolerance: 4 })
        await nextTick()

        setElementMetrics(probeElement(), 124, 120)
        triggerObserver()
        await nextTick()
        expect(state.overflowing).toBe(false)

        setElementMetrics(probeElement(), 125, 120)
        triggerObserver()
        await nextTick()
        expect(state.overflowing).toBe(true)

        wrapper.unmount()
    })

    it('停用期间恒为未溢出，恢复启用后立即重测（无需等待 resize）', async () => {
        const { wrapper, disabled, state } = mountProbe({ disabled: true })
        await nextTick()

        setElementMetrics(probeElement(), 320, 120)
        triggerObserver()
        await nextTick()
        expect(state.overflowing).toBe(false)

        disabled.value = false
        await nextTick()
        await nextTick()
        expect(state.overflowing).toBe(true)

        disabled.value = true
        await nextTick()
        await nextTick()
        expect(state.overflowing).toBe(false)

        wrapper.unmount()
    })

    it('卸载时断开观察者', async () => {
        const { wrapper } = mountProbe()
        await nextTick()

        const observer = ResizeObserverStub.instances[0]
        expect(observer.targets.size).toBe(1)

        wrapper.unmount()
        expect(observer.targets.size).toBe(0)
    })
})
