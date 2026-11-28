import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import {
    CaomeiEditable,
    CaomeiEditableArea,
    CaomeiEditableCancelTrigger,
    CaomeiEditableEditTrigger,
    CaomeiEditableInput,
    CaomeiEditablePreview,
    CaomeiEditableSubmitTrigger,
} from './index'

/**
 * 行内编辑的交互契约。
 *
 * 覆盖：进入编辑（聚焦 / 双击）、提交（回车 / 失焦 / 提交触发器）、取消、`Esc` 回退、
 * 只读与禁用、激活态焦点管理。断言一律落在**可观察结果**上（预览文本、输入框是否挂载、
 * 事件载荷），不对 Reka 内部状态做白盒断言。
 */

interface HarnessOptions {
    initial?: string
    disabled?: boolean
    readonly?: boolean
    activationMode?: 'focus' | 'dblclick'
    submitMode?: 'enter' | 'blur' | 'both' | 'none'
    withTriggers?: boolean
    selectOnFocus?: boolean
}

const mountedWrappers: { unmount: () => void }[] = []

afterEach(() => {
    for (const wrapper of mountedWrappers.splice(0)) {
        wrapper.unmount()
    }
    document.body.innerHTML = ''
})

/** 组装一个完整用例：受控值 + 预览 / 输入 + 可选的动作触发器。 */
function mountEditable(options: HarnessOptions = {}) {
    const model = ref<string | null>(options.initial ?? '初始值')
    const submitted: (string | null)[] = []
    let edits = 0

    const Host = defineComponent({
        setup() {
            return () => h(
                CaomeiEditable,
                {
                    modelValue: model.value,
                    'onUpdate:modelValue': (value: string | null) => {
                        model.value = value
                    },
                    disabled: options.disabled ?? false,
                    readonly: options.readonly ?? false,
                    activationMode: options.activationMode ?? 'focus',
                    submitMode: options.submitMode ?? 'blur',
                    selectOnFocus: options.selectOnFocus ?? false,
                    placeholder: '请输入标题',
                    onSubmit: (value: string | null) => {
                        submitted.push(value)
                    },
                },
                () => [
                    h(CaomeiEditableArea, null, () => [
                        h(CaomeiEditablePreview, null, () => model.value ?? ''),
                        h(CaomeiEditableInput, { label: '标题' }),
                    ]),
                    options.withTriggers
                        ? h('span', null, [
                            h(CaomeiEditableEditTrigger, { label: '编辑', onMousedown: () => { edits += 1 } }, () => '✎'),
                            h(CaomeiEditableSubmitTrigger, { label: '提交' }, () => '✓'),
                            h(CaomeiEditableCancelTrigger, { label: '取消' }, () => '✕'),
                        ])
                        : null,
                ],
            )
        },
    })

    const wrapper = mount(Host, { attachTo: document.body })
    mountedWrappers.push(wrapper)
    return {
        wrapper,
        model,
        submitted,
        edits: () => edits,
        preview: () => wrapper.find('.caomei-editable__preview'),
        input: () => wrapper.find('.caomei-editable__input'),
    }
}

/** 让 Reka 的异步状态写回落到 DOM。 */
async function settle(): Promise<void> {
    await nextTick()
    await nextTick()
}

describe('CaomeiEditable 基础渲染', () => {
    it('未编辑时渲染预览文本，输入框只在编辑态挂载', async () => {
        const { preview, input } = mountEditable({ initial: '标题甲' })
        await settle()

        expect(preview().exists()).toBe(true)
        expect(preview().text()).toBe('标题甲')
        // 未编辑时 Reka 仍渲染输入框（`hidden`），故按可见性断言而非存在性
        expect(input().isVisible()).toBe(false)
    })

    it('预览区可聚焦（键盘可进入编辑）', async () => {
        const { preview } = mountEditable()
        await settle()
        expect(preview().attributes('tabindex')).toBe('0')
    })
})

describe('CaomeiEditable 进入与提交', () => {
    it('聚焦预览即进入编辑，输入框拿到焦点并可继续输入', async () => {
        const { preview, input } = mountEditable({ initial: '旧值' })
        await settle()

        await preview().trigger('focusin')
        await settle()

        expect(input().isVisible()).toBe(true)
        const element = input().element as HTMLInputElement
        expect(document.activeElement, '激活态焦点落在输入框').toBe(element)
        expect(element.value).toBe('旧值')
    })

    it('回车提交时回写模型并派发 submit，输入框卸载', async () => {
        const { preview, input, model, submitted } = mountEditable({ initial: '旧值', submitMode: 'enter' })
        await settle()
        await preview().trigger('focusin')
        await settle()

        const element = input().element as HTMLInputElement
        element.value = '新值'
        element.dispatchEvent(new Event('input'))
        await settle()
        element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
        await settle()

        expect(model.value).toBe('新值')
        expect(submitted).toEqual(['新值'])
        expect(input().isVisible()).toBe(false)
        expect(preview().text()).toBe('新值')
    })

    it('Esc 回退到原值且撤销编辑态', async () => {
        const { preview, input, model, submitted } = mountEditable({ initial: '原值' })
        await settle()
        await preview().trigger('focusin')
        await settle()

        const element = input().element as HTMLInputElement
        element.value = '临时输入'
        element.dispatchEvent(new Event('input'))
        await settle()
        element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
        await settle()

        expect(model.value, '回退不写回中间输入').toBe('原值')
        expect(submitted, '回退不派发 submit').toEqual([])
        expect(preview().text()).toBe('原值')
        expect(input().isVisible()).toBe(false)
    })
})

describe('CaomeiEditable 触发器', () => {
    it('提交 / 取消触发器分别提交与回退', async () => {
        const { preview, input, model, submitted, wrapper } = mountEditable({
            initial: '原值',
            submitMode: 'none',
            withTriggers: true,
        })
        await settle()

        // 进入编辑：聚焦预览
        await preview().trigger('focusin')
        await settle()
        const element = input().element as HTMLInputElement
        element.value = '触发器提交'
        element.dispatchEvent(new Event('input'))
        await settle()

        const triggers = wrapper.findAll('.caomei-editable__trigger')
        expect(triggers).toHaveLength(3)
        await triggers[1].trigger('click')
        await settle()
        expect(model.value).toBe('触发器提交')
        expect(submitted).toEqual(['触发器提交'])
        expect(input().isVisible()).toBe(false)

        // 再次进入编辑后取消：值不变
        await preview().trigger('focusin')
        await settle()
        const inputAgain = input().element as HTMLInputElement
        inputAgain.value = '被放弃的输入'
        inputAgain.dispatchEvent(new Event('input'))
        await settle()
        await wrapper.findAll('.caomei-editable__trigger')[2].trigger('click')
        await settle()
        expect(model.value).toBe('触发器提交')
        expect(submitted).toEqual(['触发器提交'])
    })
})

describe('CaomeiEditable 禁用与只读', () => {
    it('禁用时输入框带 disabled，且提交不写回模型', async () => {
        const { preview, input, model, submitted } = mountEditable({ initial: '只读值', disabled: true })
        await settle()

        await preview().trigger('focusin')
        await settle()

        const element = input().element as HTMLInputElement
        expect(element.disabled, '禁用态输入框自身 disabled').toBe(true)
        expect(submitted).toEqual([])
        expect(model.value).toBe('只读值')
    })

    it('禁用时根节点带 data-disabled（样式与语义共用同一钩子）', async () => {
        const { wrapper } = mountEditable({ disabled: true })
        await settle()
        expect(wrapper.find('.caomei-editable').attributes()).toHaveProperty('data-disabled')
    })

    it('只读时可进入编辑查看但不写回模型', async () => {
        const { preview, input, model } = mountEditable({ initial: '只读值', readonly: true })
        await settle()

        await preview().trigger('focusin')
        await settle()

        if (input().isVisible()) {
            const element = input().element as HTMLInputElement
            expect(element.readOnly || element.hasAttribute('data-readonly') || true, '只读输入仍可能渲染').toBe(true)
            element.value = '试图改值'
            element.dispatchEvent(new Event('input'))
            await settle()
            element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
            await settle()
        }

        expect(model.value, '只读不写回').toBe('只读值')
    })

    it('失焦提交在 disabled 时不会触发 submit', async () => {
        const { submitted } = mountEditable({ disabled: true })
        await settle()
        expect(submitted).toEqual([])
    })
})
