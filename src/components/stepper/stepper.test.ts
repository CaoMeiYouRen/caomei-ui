import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { computed, createSSRApp, h, nextTick, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { caomeiLocaleKey } from '../../composables/use-locale'
import { caomeiLocales } from '../../locale'
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

    it('无描述步骤不输出悬空 aria-describedby，有描述时指向描述元素', async () => {
        const wrapper = mount(CaomeiStepper, {
            props: { defaultValue: 1 },
            attachTo: document.body,
            slots: {
                default: () => [
                    h(CaomeiStepperList, null, {
                        default: () => [
                            h(CaomeiStepperItem, { step: 1 }, {
                                default: () => h(CaomeiStepperTrigger, null, {
                                    default: () => [
                                        h(CaomeiStepperIndicator, null, { default: () => '1' }),
                                        h(CaomeiStepperTitle, null, { default: () => '账户' }),
                                    ],
                                }),
                            }),
                            h(CaomeiStepperItem, { step: 2 }, {
                                default: () => h(CaomeiStepperTrigger, null, {
                                    default: () => [
                                        h(CaomeiStepperIndicator, null, { default: () => '2' }),
                                        h(CaomeiStepperTitle, null, { default: () => '资料' }),
                                        h(CaomeiStepperDescription, null, { default: () => '补充资料' }),
                                    ],
                                }),
                            }),
                        ],
                    }),
                ],
            },
        })
        await flush()

        const triggers = wrapper.findAll('.caomei-stepper__trigger')
        expect(triggers[0].attributes('aria-describedby')).toBeUndefined()

        const describedBy = triggers[1].attributes('aria-describedby')
        expect(describedBy).toBeTruthy()
        expect(document.getElementById(describedBy as string)?.textContent).toContain('补充资料')
    })

    it('无标题步骤不输出悬空 aria-labelledby，有标题时指向标题元素', async () => {
        const wrapper = mount(CaomeiStepper, {
            props: { defaultValue: 1 },
            attachTo: document.body,
            slots: {
                default: () => [
                    h(CaomeiStepperList, null, {
                        default: () => [
                            h(CaomeiStepperItem, { step: 1 }, {
                                default: () => h(CaomeiStepperTrigger, null, {
                                    default: () => [
                                        h(CaomeiStepperIndicator, null, { default: () => '1' }),
                                        h(CaomeiStepperDescription, null, { default: () => '仅描述' }),
                                    ],
                                }),
                            }),
                            h(CaomeiStepperItem, { step: 2 }, {
                                default: () => h(CaomeiStepperTrigger, null, {
                                    default: () => [
                                        h(CaomeiStepperIndicator, null, { default: () => '2' }),
                                        h(CaomeiStepperTitle, null, { default: () => '资料' }),
                                    ],
                                }),
                            }),
                        ],
                    }),
                ],
            },
        })
        await flush()

        const triggers = wrapper.findAll('.caomei-stepper__trigger')
        expect(triggers[0].attributes('aria-labelledby')).toBeUndefined()
        expect(triggers[0].attributes('aria-describedby')).toBeTruthy()

        const labelledBy = triggers[1].attributes('aria-labelledby')
        expect(labelledBy).toBeTruthy()
        expect(document.getElementById(labelledBy as string)?.textContent).toContain('资料')
        expect(triggers[1].attributes('aria-describedby')).toBeUndefined()
    })

    it('使用方显式提供的非空 aria-describedby 优先于条件输出', async () => {
        const wrapper = mount(CaomeiStepper, {
            props: { defaultValue: 1 },
            slots: {
                default: () => [
                    h(CaomeiStepperList, null, {
                        default: () => [
                            h(CaomeiStepperItem, { step: 1 }, {
                                default: () => h(CaomeiStepperTrigger, { 'aria-describedby': 'external-hint' }, {
                                    default: () => [
                                        h(CaomeiStepperIndicator, null, { default: () => '1' }),
                                        h(CaomeiStepperTitle, null, { default: () => '账户' }),
                                        h(CaomeiStepperDescription, null, { default: () => '描述' }),
                                    ],
                                }),
                            }),
                        ],
                    }),
                ],
            },
        })
        await flush()

        expect(wrapper.findAll('.caomei-stepper__trigger')[0].attributes('aria-describedby')).toBe('external-hint')
    })

    it('运行时增删描述时 aria-describedby 随之出现与消失', async () => {
        const showDescription = ref(true)
        const wrapper = mount(CaomeiStepper, {
            props: { defaultValue: 1 },
            attachTo: document.body,
            slots: {
                default: () => [
                    h(CaomeiStepperList, null, {
                        default: () => [
                            h(CaomeiStepperItem, { step: 1 }, {
                                default: () => h(CaomeiStepperTrigger, null, {
                                    default: () => [
                                        h(CaomeiStepperIndicator, null, { default: () => '1' }),
                                        h(CaomeiStepperTitle, null, { default: () => '账户' }),
                                        showDescription.value
                                            ? h(CaomeiStepperDescription, null, { default: () => '描述' })
                                            : null,
                                    ],
                                }),
                            }),
                        ],
                    }),
                ],
            },
        })
        await flush()

        const trigger = () => wrapper.findAll('.caomei-stepper__trigger')[0]
        expect(trigger().attributes('aria-describedby')).toBeTruthy()

        showDescription.value = false
        await flush()
        expect(trigger().attributes('aria-describedby')).toBeUndefined()

        showDescription.value = true
        await flush()
        expect(trigger().attributes('aria-describedby')).toBeTruthy()
    })

    it('SSR 直出不带引用型属性（水合后建立，服务端 HTML 无悬空引用）', async () => {
        const app = createSSRApp({
            render: () => h(CaomeiStepper, { defaultValue: 1 }, {
                default: () => h(CaomeiStepperList, null, {
                    default: () => h(CaomeiStepperItem, { step: 1 }, {
                        default: () => h(CaomeiStepperTrigger, null, {
                            default: () => [
                                h(CaomeiStepperIndicator, null, { default: () => '1' }),
                                h(CaomeiStepperTitle, null, { default: () => '账户' }),
                                h(CaomeiStepperDescription, null, { default: () => '补充资料' }),
                            ],
                        }),
                    }),
                }),
            }),
        })
        const html = await renderToString(app)

        // 已知取舍：在位计数在挂载期登记，服务端 HTML 不带引用型属性（关联水合后建立）；
        // 描述内容本身在触发器内可读，且服务端 HTML 永不产生悬空引用
        expect(html).not.toContain('aria-describedby')
        expect(html).not.toContain('aria-labelledby')
        expect(html).toContain('补充资料')
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

    it('label 优先于透传的 aria-label', () => {
        const wrapper = mount(CaomeiStepper, {
            props: { label: '安装进度' },
            attrs: { 'aria-label': '透传名' },
            slots: createSlots(),
        })

        expect(wrapper.get('.caomei-stepper').attributes('aria-label')).toBe('安装进度')
    })

    it('aria-label 使用注入 locale 的文案，透传 aria-label 仍优先', () => {
        const translated = mount(CaomeiStepper, {
            slots: createSlots(),
            global: {
                provide: { [caomeiLocaleKey]: computed(() => caomeiLocales['en-US']) },
            },
        })
        expect(translated.get('.caomei-stepper').attributes('aria-label')).toBe('Steps')

        const custom = mount(CaomeiStepper, {
            attrs: { 'aria-label': '结账流程' },
            slots: createSlots(),
            global: {
                provide: { [caomeiLocaleKey]: computed(() => caomeiLocales['en-US']) },
            },
        })
        expect(custom.get('.caomei-stepper').attributes('aria-label')).toBe('结账流程')
    })

    it('flushPromises 后结构保持稳定（回归）', async () => {
        const wrapper = mountStepper({ defaultValue: 1 })
        await flushPromises()
        expect(getItems(wrapper)).toHaveLength(3)
    })
})
