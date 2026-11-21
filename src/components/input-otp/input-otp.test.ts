import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { CaomeiInputOtp } from './index'

function mountOtp(props: Record<string, unknown> = {}, options: Record<string, unknown> = {}) {
    return mount(CaomeiInputOtp, {
        props,
        attachTo: document.body,
        ...options,
    })
}

function cellsOf(wrapper: ReturnType<typeof mountOtp>) {
    return wrapper.findAll('.caomei-input-otp__cell')
}

function cell(wrapper: ReturnType<typeof mountOtp>, index: number) {
    return cellsOf(wrapper)[index]
}

async function typeCell(wrapper: ReturnType<typeof mountOtp>, index: number, value: string): Promise<void> {
    await cell(wrapper, index).setValue(value)
}

describe('CaomeiInputOtp', () => {
    it('按 length 渲染输入格并输出分组可访问名与逐格可访问名', () => {
        const wrapper = mountOtp({ length: 4, label: '验证码' })

        const cells = cellsOf(wrapper)
        expect(cells).toHaveLength(4)
        expect(wrapper.attributes('role')).toBe('group')
        expect(wrapper.attributes('aria-label')).toBe('验证码')
        expect(cells[0].attributes('aria-label')).toBe('验证码第 1 位，共 4 位')
        expect(cells[3].attributes('aria-label')).toBe('验证码第 4 位，共 4 位')
        expect(cells[0].attributes('autocomplete')).toBe('one-time-code')
        expect(cells[0].attributes('inputmode')).toBe('numeric')
    })

    it('逐格输入时抛出 update:modelValue，填满后抛出 complete', async () => {
        const wrapper = mountOtp({ length: 4 })

        await typeCell(wrapper, 0, '1')
        await typeCell(wrapper, 1, '2')
        await typeCell(wrapper, 2, '3')
        expect(wrapper.emitted('complete')).toBeUndefined()

        await typeCell(wrapper, 3, '4')

        expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe('1234')
        expect(wrapper.emitted('complete')?.[0]?.[0]).toBe('1234')
    })

    it('受控值回显，清空后再次填满会重新抛出 complete', async () => {
        const wrapper = mountOtp({ modelValue: '1234', length: 4 })
        await nextTick()

        expect(cellsOf(wrapper).map((node) => (node.element as HTMLInputElement).value)).toEqual(['1', '2', '3', '4'])

        await typeCell(wrapper, 0, '')
        expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe('234')
        expect(wrapper.emitted('complete')).toBeUndefined()

        await wrapper.setProps({ modelValue: '' })
        await typeCell(wrapper, 0, '9')
        await typeCell(wrapper, 1, '8')
        await typeCell(wrapper, 2, '7')
        await typeCell(wrapper, 3, '6')

        expect(wrapper.emitted('complete')?.at(-1)?.[0]).toBe('9876')
    })

    it('粘贴整串验证码时分发到各格', async () => {
        const wrapper = mountOtp({ length: 4 })
        const event = new Event('paste', { bubbles: true, cancelable: true }) as Event & {
            clipboardData?: { getData: (type: string) => string }
        }
        Object.defineProperty(event, 'clipboardData', {
            value: { getData: () => '12 34' },
        })

        cell(wrapper, 0).element.dispatchEvent(event)
        await nextTick()

        expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe('1234')
        expect(wrapper.emitted('complete')?.[0]?.[0]).toBe('1234')
    })

    it('numeric 过滤非数字，alphanumeric 接受字母', async () => {
        const numeric = mountOtp({ length: 4 })
        await typeCell(numeric, 0, 'a')
        expect((cell(numeric, 0).element as HTMLInputElement).value).toBe('')
        expect(numeric.emitted('update:modelValue')).toBeUndefined()

        const alpha = mountOtp({ length: 4, type: 'alphanumeric' })
        await typeCell(alpha, 0, 'A')
        expect(alpha.emitted('update:modelValue')?.at(-1)?.[0]).toBe('A')
        expect(cell(alpha, 0).attributes('inputmode')).toBe('text')
    })

    it('mask 以密码形态渲染，disabled / readonly 落到每个输入格', () => {
        const wrapper = mountOtp({ length: 3, mask: true, disabled: true, readonly: true })

        for (const node of cellsOf(wrapper)) {
            expect(node.attributes('type')).toBe('password')
            expect(node.attributes('disabled')).toBeDefined()
            expect(node.attributes('readonly')).toBeDefined()
        }
        expect(wrapper.classes()).toContain('caomei-input-otp--disabled')
        expect(wrapper.classes()).toContain('caomei-input-otp--readonly')
        expect(wrapper.attributes('aria-disabled')).toBe('true')
    })

    it('invalid 与 size 映射到类名', () => {
        const wrapper = mountOtp({ length: 3, invalid: true, size: 'lg' })

        expect(wrapper.classes()).toContain('caomei-input-otp--invalid')
        expect(wrapper.classes()).toContain('caomei-input-otp--lg')
        expect(wrapper.attributes('aria-invalid')).toBe('true')
    })

    it('受控用法下父级回写同值不清空内部空位', async () => {
        const Controlled = defineComponent({
            setup() {
                const value = ref('1234')
                return { value }
            },
            render() {
                return h(CaomeiInputOtp, {
                    length: 4,
                    modelValue: this.value,
                    'onUpdate:modelValue': (next: string) => {
                        this.value = next
                    },
                })
            },
        })
        const wrapper = mount(Controlled, { attachTo: document.body })
        await nextTick()

        const inputs = wrapper.findAll('.caomei-input-otp__cell')
        await inputs[1].setValue('')

        expect((inputs[0].element as HTMLInputElement).value).toBe('1')
        expect((inputs[1].element as HTMLInputElement).value).toBe('')
        expect((inputs[2].element as HTMLInputElement).value).toBe('3')
        expect((wrapper.vm as unknown as { value: string }).value).toBe('134')
    })
})
