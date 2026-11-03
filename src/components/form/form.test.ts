import { mount } from '@vue/test-utils'
import { createSSRApp, defineComponent, h, nextTick, type Component } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CaomeiAutoComplete } from '../auto-complete'
import { CaomeiCheckbox } from '../checkbox'
import { CaomeiCheckboxGroup } from '../checkbox-group'
import { CaomeiInput } from '../input'
import { CaomeiInputNumber } from '../input-number'
import { CaomeiMultiSelect } from '../multi-select'
import { CaomeiRadioGroup } from '../radio-group'
import { CaomeiSelect } from '../select'
import { CaomeiSelectButton } from '../select-button'
import { CaomeiSwitch } from '../switch'
import { CaomeiTagsInput } from '../tags-input'
import { CaomeiTextarea } from '../textarea'
import type { FormExposed, FormItemSlotProps } from './types'
import { CaomeiForm, CaomeiFormItem } from './index'

afterEach(() => {
    document.body.innerHTML = ''
    vi.restoreAllMocks()
})

const options = [
    { label: '甲', value: 'a' },
    { label: '乙', value: 'b' },
]

interface FieldCase {
    name: string
    component: Component
    props?: Record<string, unknown>
    /** `Switch` 没有校验状态通道，不绑定 `invalid` */
    bindInvalid?: boolean
}

/** `FieldProps` + `FieldIdentityProps`（7 个输入类控件） */
const FIELD_PROPS_CASES: FieldCase[] = [
    { name: 'AutoComplete', component: CaomeiAutoComplete as unknown as Component, props: { options } },
    { name: 'Input', component: CaomeiInput as unknown as Component },
    { name: 'InputNumber', component: CaomeiInputNumber as unknown as Component },
    { name: 'MultiSelect', component: CaomeiMultiSelect as unknown as Component, props: { options } },
    { name: 'Select', component: CaomeiSelect as unknown as Component, props: { options } },
    { name: 'TagsInput', component: CaomeiTagsInput as unknown as Component },
    { name: 'Textarea', component: CaomeiTextarea as unknown as Component },
]

/** `FieldStateProps` + `FieldIdentityProps`（4 个状态型控件） */
const FIELD_STATE_CASES: FieldCase[] = [
    { name: 'Checkbox', component: CaomeiCheckbox as unknown as Component },
    { name: 'CheckboxGroup', component: CaomeiCheckboxGroup as unknown as Component, props: { options } },
    { name: 'RadioGroup', component: CaomeiRadioGroup as unknown as Component, props: { options } },
    { name: 'SelectButton', component: CaomeiSelectButton as unknown as Component, props: { options, modelValue: 'a' } },
]

/** 仅 `FieldIdentityProps`（`Switch` 例外） */
const IDENTITY_ONLY_CASE: FieldCase = {
    name: 'Switch',
    component: CaomeiSwitch as unknown as Component,
    bindInvalid: false,
}

/**
 * 用 `CaomeiFormItem` 的插槽作用域绑定一个字段组件，返回作用域与挂载结果。
 *
 * `error` 与 `hint` 同时提供，用于同时验证两条 `aria-describedby` 引用。
 */
async function mountBoundField(field: FieldCase) {
    let scope: FormItemSlotProps | undefined

    const Host = defineComponent({
        name: 'FormFieldHost',
        render() {
            return h(
                CaomeiFormItem,
                {
                    label: '字段',
                    name: 'field',
                    hint: '提示',
                    error: '错误',
                    required: true,
                },
                {
                    default: (slotProps: FormItemSlotProps) => {
                        scope = slotProps
                        const bindings: Record<string, unknown> = {
                            id: slotProps.id,
                            name: slotProps.name,
                            'aria-labelledby': slotProps['aria-labelledby'],
                            'aria-describedby': slotProps['aria-describedby'],
                        }
                        if (field.bindInvalid !== false) {
                            bindings.invalid = slotProps.invalid
                        }
                        return h(field.component, { ...field.props, ...bindings })
                    },
                },
            )
        },
    })

    const wrapper = mount(Host)
    await nextTick()
    if (!scope) {
        throw new Error(`${field.name}: 默认插槽未被调用`)
    }
    return { wrapper, scope }
}

function expectBoundField(wrapper: ReturnType<typeof mount>, scope: FormItemSlotProps, field: FieldCase): void {
    expect(scope.name, `${field.name}: name 应原样传给插槽`).toBe('field')
    expect(scope['aria-labelledby'], `${field.name}: 应有 label 引用`).toBeTruthy()
    expect(scope['aria-describedby'], `${field.name}: 应有 hint / error 引用`).toBeTruthy()
    expect(scope.invalid, `${field.name}: error 非空应为 invalid`).toBe(true)

    const labelled = wrapper.find(`[aria-labelledby="${scope['aria-labelledby']}"]`)
    expect(labelled.exists(), `${field.name}: 未找到 aria-labelledby 落点`).toBe(true)
    const labelText = wrapper.find(`[id="${scope['aria-labelledby']}"]`).text()
    expect(labelText.replace(/\s+/gu, ''), `${field.name}: aria-labelledby 未解析到可见标签`).toBe('字段*')
    // 可访问名必须落在可交互控件或组根上，而不是无角色的包装层
    expect(
        ['INPUT', 'TEXTAREA', 'BUTTON'].includes(labelled.element.tagName)
        || labelled.attributes('role') !== undefined,
        `${field.name}: aria-labelledby 落点不是可访问控件`,
    ).toBe(true)

    const describedIds = scope['aria-describedby']?.split(' ') ?? []
    expect(describedIds, `${field.name}: aria-describedby 应同时包含 hint 与 error`).toHaveLength(2)
    expect(
        describedIds.map((id) => wrapper.find(`[id="${id}"]`).text()),
        `${field.name}: aria-describedby 未解析到 hint / error 文本`,
    ).toEqual(['提示', '错误'])
    expect(wrapper.find(`[aria-describedby="${scope['aria-describedby']}"]`).exists(), `${field.name}: 未找到 aria-describedby 落点`).toBe(true)

    expect(wrapper.find(`[id="${scope.id}"]`).exists(), `${field.name}: 控件 id 未渲染`).toBe(true)

    if (field.bindInvalid === false) {
        expect(wrapper.find('[aria-invalid]').exists(), `${field.name}: 不应输出 aria-invalid`).toBe(false)
    } else {
        const invalidElement = wrapper.find('[aria-invalid="true"]')
        expect(invalidElement.exists(), `${field.name}: 未输出 aria-invalid`).toBe(true)
        expect(invalidElement.element, `${field.name}: aria-invalid 未落在可访问控件上`).toBe(labelled.element)
    }
}

describe('CaomeiForm', () => {
    it('渲染原生 form 并阻止默认提交后抛出 submit', async () => {
        const wrapper = mount(CaomeiForm, {
            slots: { default: '<button type="submit">提交</button>' },
        })
        const form = wrapper.get('form')
        const event = new Event('submit', { bubbles: true, cancelable: true })

        form.element.dispatchEvent(event)
        await nextTick()

        expect(event.defaultPrevented).toBe(true)
        expect(wrapper.emitted('submit')).toHaveLength(1)
        expect(wrapper.emitted('submit')?.[0]?.[0]).toBe(event)
    })

    it('novalidate 为 true 时输出原生属性', () => {
        const wrapper = mount(CaomeiForm, { props: { novalidate: true } })

        expect(wrapper.get('form').attributes()).toHaveProperty('novalidate')
    })

    it('缺省不输出 novalidate', () => {
        const wrapper = mount(CaomeiForm)

        expect(wrapper.get('form').attributes()).not.toHaveProperty('novalidate')
    })

    it('暴露 submit() 并经原生 requestSubmit 触发', () => {
        const wrapper = mount(CaomeiForm)
        const form = wrapper.get('form').element as HTMLFormElement
        const requestSubmit = vi.fn()
        form.requestSubmit = requestSubmit

        ;(wrapper.vm as unknown as FormExposed).submit()

        expect(requestSubmit).toHaveBeenCalledTimes(1)
    })

    it('暴露根 form 元素', () => {
        const wrapper = mount(CaomeiForm)

        expect((wrapper.vm as unknown as FormExposed).form).toBe(wrapper.get('form').element)
    })

    it('submit() 走原生 requestSubmit 链路并触发 submit', async () => {
        const wrapper = mount(CaomeiForm)

        ;(wrapper.vm as unknown as FormExposed).submit()
        await nextTick()

        expect(wrapper.emitted('submit')).toHaveLength(1)
    })

    it('渲染插槽内容', () => {
        const wrapper = mount(CaomeiForm, {
            slots: { default: '<p>内容</p>' },
        })

        expect(wrapper.get('.caomei-form').text()).toContain('内容')
    })
})

describe('CaomeiFormItem', () => {
    it('渲染 label / hint / error 并生成对应 id', async () => {
        let scope: FormItemSlotProps | undefined
        const wrapper = mount(CaomeiFormItem, {
            props: {
                label: '名称',
                name: 'name',
                hint: '请输入名称',
                error: '名称不能为空',
                required: true,
            },
            slots: {
                default: (slotProps: FormItemSlotProps) => {
                    scope = slotProps
                    return h('input', { id: slotProps.id })
                },
            },
        })
        await nextTick()

        expect(scope).toBeDefined()
        expect(Object.keys(scope ?? {}).sort()).toEqual([
            'aria-describedby',
            'aria-labelledby',
            'id',
            'invalid',
            'name',
        ])
        expect(scope?.name).toBe('name')
        expect(scope?.invalid).toBe(true)
        expect(scope?.['aria-labelledby']).toBeTruthy()
        expect(scope?.['aria-describedby']).toContain(' ')
        expect(wrapper.get('.caomei-form-item__label').text()).toContain('名称')
        expect(wrapper.get('.caomei-form-item__required').text()).toBe('*')
        expect(wrapper.get('.caomei-form-item__hint').text()).toBe('请输入名称')
        expect(wrapper.get('.caomei-form-item__error').text()).toBe('名称不能为空')
        expect(wrapper.get('.caomei-form-item__error').attributes('role')).toBe('alert')
        expect(wrapper.get('.caomei-form-item').classes()).toContain('caomei-form-item--invalid')
    })

    it('error 非空时即使 invalid 为 false 也按失败态处理', async () => {
        let scope: FormItemSlotProps | undefined
        mount(CaomeiFormItem, {
            props: { error: '错误', invalid: false },
            slots: {
                default: (slotProps: FormItemSlotProps) => {
                    scope = slotProps
                    return h('input')
                },
            },
        })
        await nextTick()

        expect(scope?.invalid).toBe(true)
    })

    it('无 label / hint / error 时对应引用为 undefined', async () => {
        let scope: FormItemSlotProps | undefined
        mount(CaomeiFormItem, {
            slots: {
                default: (slotProps: FormItemSlotProps) => {
                    scope = slotProps
                    return h('input')
                },
            },
        })
        await nextTick()

        expect(scope?.['aria-labelledby']).toBeUndefined()
        expect(scope?.['aria-describedby']).toBeUndefined()
        expect(scope?.invalid).toBe(false)
    })

    it('显式 id 覆盖生成 id，且两个实例默认 id 不重复', async () => {
        const explicit: string[] = []
        const generated: string[] = []
        const Host = defineComponent({
            render() {
                return h('div', [
                    h(CaomeiFormItem, { label: 'A', id: 'custom-control' }, {
                        default: (slotProps: FormItemSlotProps) => {
                            explicit.push(slotProps.id)
                            return h('input', { id: slotProps.id })
                        },
                    }),
                    h(CaomeiFormItem, { label: 'B' }, {
                        default: (slotProps: FormItemSlotProps) => {
                            generated.push(slotProps.id)
                            return h('input', { id: slotProps.id })
                        },
                    }),
                    h(CaomeiFormItem, { label: 'C' }, {
                        default: (slotProps: FormItemSlotProps) => {
                            generated.push(slotProps.id)
                            return h('input', { id: slotProps.id })
                        },
                    }),
                ])
            },
        })
        mount(Host)
        await nextTick()

        expect(explicit).toEqual(['custom-control'])
        expect(generated).toHaveLength(2)
        expect(generated[0]).not.toBe(generated[1])
    })

    it('SSR 渲染无警告且输出 label / describedby 引用', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
        const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)

        const app = createSSRApp({
            render: () => h(CaomeiForm, null, {
                default: () => h(CaomeiFormItem, {
                    label: '名称',
                    name: 'name',
                    hint: '提示',
                }, {
                    default: (slotProps: FormItemSlotProps) => h(CaomeiInput, {
                        id: slotProps.id,
                        name: slotProps.name,
                        'aria-labelledby': slotProps['aria-labelledby'],
                        'aria-describedby': slotProps['aria-describedby'],
                        invalid: slotProps.invalid,
                    }),
                }),
            }),
        })

        const html = await renderToString(app)

        expect(html).toContain('caomei-form')
        expect(html).toContain('caomei-form-item')
        expect(html).toContain('aria-labelledby')
        expect(html).toContain('aria-describedby')
        expect(warn).not.toHaveBeenCalled()
        expect(error).not.toHaveBeenCalled()
    })
})

describe('字段继承面逐项绑定', () => {
    it('FieldProps + 身份：7 个输入类控件承接 id / name / aria-* / invalid', async () => {
        for (const field of FIELD_PROPS_CASES) {
            const { wrapper, scope } = await mountBoundField(field)
            expectBoundField(wrapper, scope, field)
            wrapper.unmount()
        }
    })

    it('FieldStateProps + 身份：4 个状态型控件承接 id / name / aria-* / invalid', async () => {
        for (const field of FIELD_STATE_CASES) {
            const { wrapper, scope } = await mountBoundField(field)
            expectBoundField(wrapper, scope, field)
            wrapper.unmount()
        }
    })

    it('Switch 仅承接身份与 aria 引用，不绑定校验态', async () => {
        const { wrapper, scope } = await mountBoundField(IDENTITY_ONLY_CASE)

        expectBoundField(wrapper, scope, IDENTITY_ONLY_CASE)
        // Switch 没有 invalid 通道：不传 invalid 时不应出现 aria-invalid
        expect(wrapper.find('[aria-invalid]').exists()).toBe(false)
        wrapper.unmount()
    })
})
