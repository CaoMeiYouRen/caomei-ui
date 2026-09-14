import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { StepperExposed } from './types'
import {
    CaomeiStepper,
    CaomeiStepperDescription,
    CaomeiStepperIndicator,
    CaomeiStepperItem,
    CaomeiStepperList,
    CaomeiStepperSeparator,
    CaomeiStepperTitle,
    CaomeiStepperTrigger,
} from './index'

enableAutoUnmount(afterEach)

const LABELS = ['账户', '资料', '完成']

interface SlotOptions {
    disabled?: number[]
    completed?: number[]
}

function createSlots(options: SlotOptions = {}) {
    return {
        default: () => [
            h(CaomeiStepperList, null, {
                default: () =>
                    LABELS.map((label, index) => {
                        const step = index + 1
                        return h(
                            CaomeiStepperItem,
                            {
                                step,
                                disabled: options.disabled?.includes(step),
                                completed: options.completed?.includes(step),
                            },
                            {
                                default: () => [
                                    h(CaomeiStepperTrigger, null, {
                                        default: () => [
                                            h(CaomeiStepperIndicator, null, {
                                                default: ({ step: current }: { step: number }) =>
                                                    String(current),
                                            }),
                                            h('div', null, [
                                                h(CaomeiStepperTitle, null, {
                                                    default: () => label,
                                                }),
                                                h(CaomeiStepperDescription, null, {
                                                    default: () => `描述 ${step}`,
                                                }),
                                            ]),
                                        ],
                                    }),
                                    step < LABELS.length ? h(CaomeiStepperSeparator) : null,
                                ],
                            },
                        )
                    }),
            }),
        ],
    }
}

function mountStepper(
    props: Record<string, unknown> = {},
    options: SlotOptions & { attachTo?: boolean } = {},
) {
    return mount(CaomeiStepper, {
        props,
        slots: createSlots(options),
        ...(options.attachTo ? { attachTo: document.body } : {}),
    })
}

function getItems(wrapper: ReturnType<typeof mountStepper>) {
    return wrapper.findAll('.caomei-stepper__item')
}

function getTriggers(wrapper: ReturnType<typeof mountStepper>) {
    return wrapper.findAll('.caomei-stepper__trigger')
}

async function flush() {
    await nextTick()
    await nextTick()
}

describe('CaomeiStepper', () => {
    it('渲染根容器、步骤项与指示器', () => {
        const wrapper = mountStepper({ defaultValue: 1 })

        expect(wrapper.get('.caomei-stepper').attributes('data-orientation')).toBe('horizontal')
        expect(wrapper.get('.caomei-stepper').attributes('role')).toBe('group')
        expect(getItems(wrapper)).toHaveLength(3)
        expect(getTriggers(wrapper)).toHaveLength(3)

        const indicators = wrapper.findAll('.caomei-stepper__indicator')
        expect(indicators.map((item) => item.text())).toEqual(['1', '2', '3'])
        expect(wrapper.findAll('.caomei-stepper__separator')).toHaveLength(2)
    })

    it('defaultValue 决定非受控初始激活项及步骤状态', () => {
        const wrapper = mountStepper({ defaultValue: 2 })

        const items = getItems(wrapper)
        expect(items[0].attributes('data-state')).toBe('completed')
        expect(items[1].attributes('data-state')).toBe('active')
        expect(items[2].attributes('data-state')).toBe('inactive')
        expect(items[1].attributes('aria-current')).toBe('true')
    })

    it('受控时点击触发器抛出 update:modelValue 且不自行切换', async () => {
        const wrapper = mountStepper(
            { modelValue: 1, 'onUpdate:modelValue': vi.fn() },
            { attachTo: true },
        )

        await getTriggers(wrapper)[1].trigger('mousedown')
        await flush()

        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([2])
        expect(getItems(wrapper)[0].attributes('data-state')).toBe('active')
    })

    it('非受控时点击触发器切换当前步骤', async () => {
        const wrapper = mountStepper({ defaultValue: 1 }, { attachTo: true })

        await getTriggers(wrapper)[1].trigger('mousedown')
        await flush()

        expect(getItems(wrapper)[1].attributes('data-state')).toBe('active')
    })

    it('linear 为 true 时不能跳步，为 false 时可跳转', async () => {
        const linear = mountStepper(
            { modelValue: 1, 'onUpdate:modelValue': vi.fn() },
            { attachTo: true },
        )
        await getTriggers(linear)[2].trigger('mousedown')
        await flush()
        expect(linear.emitted('update:modelValue')).toBeUndefined()

        const free = mountStepper(
            { modelValue: 1, linear: false, 'onUpdate:modelValue': vi.fn() },
            { attachTo: true },
        )
        await getTriggers(free)[2].trigger('mousedown')
        await flush()
        expect(free.emitted('update:modelValue')?.[0]).toEqual([3])
    })

    it('禁用步骤输出禁用标记且不可激活', async () => {
        const wrapper = mountStepper(
            { modelValue: 1, 'onUpdate:modelValue': vi.fn() },
            { disabled: [2], attachTo: true },
        )

        const disabledTrigger = getTriggers(wrapper)[1]
        expect(disabledTrigger.attributes('data-disabled')).toBeDefined()
        expect(disabledTrigger.attributes('disabled')).toBeDefined()

        await disabledTrigger.trigger('mousedown')
        await flush()
        expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    })

    it('completed 标记覆盖步骤状态', () => {
        const wrapper = mountStepper({ defaultValue: 1 }, { completed: [3] })

        expect(getItems(wrapper)[2].attributes('data-state')).toBe('completed')
        expect(getItems(wrapper)[0].attributes('data-state')).toBe('active')
    })

    it('vertical 方向切换根类与 data 属性', () => {
        const wrapper = mountStepper({ orientation: 'vertical' })

        const root = wrapper.get('.caomei-stepper')
        expect(root.classes()).toContain('caomei-stepper--vertical')
        expect(root.attributes('data-orientation')).toBe('vertical')
    })

    it('指示器插槽接收当前步骤序号', () => {
        const wrapper = mountStepper({ defaultValue: 2 })

        expect(wrapper.findAll('.caomei-stepper__indicator')[1].text()).toBe('2')
    })

    it('defineExpose 暴露 goToStep / nextStep / prevStep', async () => {
        const wrapper = mountStepper({ defaultValue: 1, linear: false }, { attachTo: true })
        const vm = wrapper.vm as unknown as StepperExposed

        vm.goToStep(3)
        await flush()
        expect(getItems(wrapper)[2].attributes('data-state')).toBe('active')

        vm.prevStep()
        await flush()
        expect(getItems(wrapper)[1].attributes('data-state')).toBe('active')

        vm.nextStep()
        await flush()
        expect(getItems(wrapper)[2].attributes('data-state')).toBe('active')
    })

    it('独立使用 item 时透传 class 与原生属性', () => {
        const wrapper = mount(CaomeiStepper, {
            props: { defaultValue: 1 },
            attrs: { class: 'custom-stepper', 'aria-label': '结账流程' },
            slots: createSlots(),
        })

        expect(wrapper.get('.caomei-stepper').classes()).toContain('custom-stepper')
        expect(wrapper.get('.caomei-stepper').attributes('aria-label')).toBe('结账流程')
    })

    it('无子项时仍可渲染根容器', () => {
        const wrapper = mount(CaomeiStepper)
        expect(wrapper.find('.caomei-stepper').exists()).toBe(true)
        expect(wrapper.findAll('.caomei-stepper__item')).toHaveLength(0)
    })

    it('默认输出本地化 aria-label，可被 label 覆盖', () => {
        const fallback = mount(CaomeiStepper, { slots: createSlots() })
        expect(fallback.get('.caomei-stepper').attributes('aria-label')).toBe('步骤')

        const custom = mount(CaomeiStepper, {
            props: { label: '安装进度' },
            slots: createSlots(),
        })
        expect(custom.get('.caomei-stepper').attributes('aria-label')).toBe('安装进度')
    })

    it('flushPromises 后结构保持稳定（回归）', async () => {
        const wrapper = mountStepper({ defaultValue: 1 })
        await flushPromises()
        expect(getItems(wrapper)).toHaveLength(3)
    })
})
