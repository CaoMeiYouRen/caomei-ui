import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { CaomeiAutoComplete } from './index'

enableAutoUnmount(afterEach)

afterEach(() => {
    vi.useRealTimers()
})

const options = [
    { label: '苹果', value: 'apple' },
    { label: '香蕉', value: 'banana' },
    { label: '樱桃', value: 'cherry', disabled: true },
]

async function open(wrapper: ReturnType<typeof mount>): Promise<void> {
    await wrapper.get('.caomei-auto-complete__trigger').trigger('click')
    await flushPromises()
    await nextTick()
}

function optionElements(): NodeListOf<HTMLElement> {
    return document.querySelectorAll<HTMLElement>('[role="option"]')
}

describe('CaomeiAutoComplete', () => {
    it('渲染根类与尺寸档位', () => {
        const wrapper = mount(CaomeiAutoComplete, { props: { options, size: 'lg' } })

        const root = wrapper.get('.caomei-auto-complete')
        expect(root.classes()).toContain('caomei-auto-complete--lg')
        expect(wrapper.find('input').exists()).toBe(true)
    })

    it('字符串选项视作 label 与 value 相同', async () => {
        const wrapper = mount(CaomeiAutoComplete, {
            props: { options: ['苹果', '香蕉'], dropdown: true },
            attachTo: document.body,
        })

        await open(wrapper)

        const rendered = optionElements()
        expect(rendered).toHaveLength(2)
        expect(rendered[0].textContent).toContain('苹果')
        expect(rendered[0].getAttribute('role')).toBe('option')
    })

    it('单选输入自由文本后回车提交为 modelValue 并触发 select', async () => {
        const wrapper = mount(CaomeiAutoComplete, {
            props: { options, modelValue: '', 'onUpdate:modelValue': vi.fn() },
        })

        await wrapper.get('input').setValue('自定义值')
        await wrapper.get('input').trigger('keydown', { key: 'Enter' })

        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['自定义值'])
        expect(wrapper.emitted('select')?.[0]).toEqual(['自定义值'])
    })

    it('单选失焦时提交自由文本', async () => {
        const wrapper = mount(CaomeiAutoComplete, {
            props: { options, modelValue: '', 'onUpdate:modelValue': vi.fn() },
        })

        await wrapper.get('input').setValue('失焦值')
        await wrapper.get('input').trigger('blur')

        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['失焦值'])
    })

    it('选中建议项时提交其 value 并把输入框回显为 label', async () => {
        const wrapper = mount(CaomeiAutoComplete, {
            props: { options, dropdown: true },
            attachTo: document.body,
        })

        await open(wrapper)
        optionElements()[0].click()
        await flushPromises()
        await nextTick()

        expect(wrapper.emitted('select')?.[0]).toEqual(['apple'])
        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['apple'])
        expect((wrapper.get('input').element as HTMLInputElement).value).toBe('苹果')
    })

    it('单选失焦时输入等于已选值的 label 不改写 modelValue', async () => {
        const wrapper = mount(CaomeiAutoComplete, {
            props: { options, modelValue: 'apple', 'onUpdate:modelValue': vi.fn() },
        })

        const input = wrapper.get('input')
        await input.setValue('苹果')
        await input.trigger('blur')

        expect(wrapper.emitted('update:modelValue')).toBeUndefined()
        expect(wrapper.emitted('select')).toBeUndefined()
    })

    it('选中建议后再次失焦不会把回显 label 当作自由文本提交', async () => {
        const wrapper = mount(CaomeiAutoComplete, {
            props: { options, dropdown: true, 'onUpdate:modelValue': vi.fn() },
            attachTo: document.body,
        })

        await open(wrapper)
        optionElements()[0].click()
        await flushPromises()
        await nextTick()

        const updateCount = wrapper.emitted('update:modelValue')?.length ?? 0
        const selectCount = wrapper.emitted('select')?.length ?? 0

        await wrapper.get('input').trigger('blur')
        await nextTick()

        expect(wrapper.emitted('update:modelValue')?.length ?? 0).toBe(updateCount)
        expect(wrapper.emitted('select')?.length ?? 0).toBe(selectCount)
    })

    it('点击禁用建议项不提交', async () => {
        const wrapper = mount(CaomeiAutoComplete, {
            props: { options, modelValue: '', 'onUpdate:modelValue': vi.fn(), dropdown: true },
            attachTo: document.body,
        })

        await open(wrapper)
        optionElements()[2].click()
        await flushPromises()

        expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    })

    it('complete 事件在 debounce 后触发且连续输入只触发一次', async () => {
        vi.useFakeTimers()
        const wrapper = mount(CaomeiAutoComplete, { props: { options, debounce: 300 } })

        const input = wrapper.get('input')
        await input.setValue('a')
        await input.setValue('ap')
        await input.setValue('app')

        expect(wrapper.emitted('complete')).toBeUndefined()

        vi.advanceTimersByTime(300)
        await nextTick()

        const emitted = wrapper.emitted('complete')
        expect(emitted).toHaveLength(1)
        expect(emitted?.[0]).toEqual(['app'])
    })

    it('debounce 为 0 时尽快触发 complete', async () => {
        vi.useFakeTimers()
        const wrapper = mount(CaomeiAutoComplete, { props: { options, debounce: 0 } })

        await wrapper.get('input').setValue('q')
        vi.advanceTimersByTime(0)
        await nextTick()

        expect(wrapper.emitted('complete')?.[0]).toEqual(['q'])
    })

    it('多选模式渲染已选标签并可逐个移除', async () => {
        const wrapper = mount(CaomeiAutoComplete, {
            props: { options, multiple: true, modelValue: ['apple', 'banana'] },
        })

        const tags = wrapper.findAll('.caomei-auto-complete__tag')
        expect(tags).toHaveLength(2)
        expect(tags[0].text()).toContain('苹果')

        await tags[0].get('.caomei-auto-complete__tag-remove').trigger('click')
        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['banana']])
    })

    it('多选模式点击建议项追加选中值', async () => {
        const wrapper = mount(CaomeiAutoComplete, {
            props: {
                options,
                multiple: true,
                modelValue: ['apple'],
                'onUpdate:modelValue': vi.fn(),
                dropdown: true,
            },
            attachTo: document.body,
        })

        await open(wrapper)
        optionElements()[1].click()
        await flushPromises()

        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['apple', 'banana']])
    })

    it('多选模式下无标签时显示占位文本，有标签时隐藏', async () => {
        const empty = mount(CaomeiAutoComplete, {
            props: { options, multiple: true, modelValue: [], placeholder: '请输入' },
        })
        expect(empty.get('input').attributes('placeholder')).toBe('请输入')

        const filled = mount(CaomeiAutoComplete, {
            props: { options, multiple: true, modelValue: ['apple'], placeholder: '请输入' },
        })
        expect(filled.get('input').attributes('placeholder')).toBeUndefined()
    })

    it('单选有值时输出 data-filled，清空后移除', async () => {
        const wrapper = mount(CaomeiAutoComplete, { props: { options, modelValue: '' } })

        expect(wrapper.get('.caomei-auto-complete').attributes('data-filled')).toBeUndefined()

        await wrapper.setProps({ modelValue: 'apple' })
        expect(wrapper.get('.caomei-auto-complete').attributes('data-filled')).toBe('true')

        await wrapper.setProps({ modelValue: '' })
        expect(wrapper.get('.caomei-auto-complete').attributes('data-filled')).toBeUndefined()
    })

    it('多选有值时输出 data-filled', () => {
        const empty = mount(CaomeiAutoComplete, { props: { options, multiple: true, modelValue: [] } })
        expect(empty.get('.caomei-auto-complete').attributes('data-filled')).toBeUndefined()

        const filled = mount(CaomeiAutoComplete, {
            props: { options, multiple: true, modelValue: ['apple'] },
        })
        expect(filled.get('.caomei-auto-complete').attributes('data-filled')).toBe('true')
    })

    it('placeholder 非空时输出 data-has-placeholder', () => {
        const wrapper = mount(CaomeiAutoComplete, { props: { options, placeholder: '搜索' } })
        expect(wrapper.get('.caomei-auto-complete').attributes('data-has-placeholder')).toBe('true')

        const without = mount(CaomeiAutoComplete, { props: { options } })
        expect(without.get('.caomei-auto-complete').attributes('data-has-placeholder')).toBeUndefined()
    })

    it('disabled 时禁用输入与触发器', () => {
        const wrapper = mount(CaomeiAutoComplete, {
            props: { options, disabled: true, dropdown: true },
        })

        expect(wrapper.get('input').attributes('disabled')).toBeDefined()
        expect(wrapper.get('.caomei-auto-complete__trigger').attributes('disabled')).toBeDefined()
        expect(wrapper.get('.caomei-auto-complete').classes()).toContain(
            'caomei-auto-complete--disabled',
        )
    })

    it('invalid 时标注 aria-invalid 并应用错误样式', () => {
        const wrapper = mount(CaomeiAutoComplete, { props: { options, invalid: true } })

        expect(wrapper.get('input').attributes('aria-invalid')).toBe('true')
        expect(wrapper.get('.caomei-auto-complete').classes()).toContain(
            'caomei-auto-complete--invalid',
        )
    })

    it('单选有值时渲染清除按钮，点击清空并触发 clear', async () => {
        const wrapper = mount(CaomeiAutoComplete, {
            props: { options, modelValue: 'apple', 'onUpdate:modelValue': vi.fn() },
        })

        const clear = wrapper.get('.caomei-auto-complete__clear')
        await clear.trigger('click')

        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([''])
        expect(wrapper.emitted('clear')).toHaveLength(1)
    })

    it('clearable 为 false 时不渲染清除按钮', () => {
        const wrapper = mount(CaomeiAutoComplete, {
            props: { options, modelValue: 'apple', clearable: false },
        })
        expect(wrapper.find('.caomei-auto-complete__clear').exists()).toBe(false)
    })

    it('多选模式不渲染清除按钮', () => {
        const wrapper = mount(CaomeiAutoComplete, {
            props: { options, multiple: true, modelValue: ['apple'] },
        })
        expect(wrapper.find('.caomei-auto-complete__clear').exists()).toBe(false)
    })

    it('loading 时渲染加载指示', () => {
        const wrapper = mount(CaomeiAutoComplete, {
            props: { options, loading: true, dropdown: true },
        })

        const spinner = wrapper.get('.caomei-auto-complete__spinner')
        expect(spinner.attributes('role')).toBe('status')
        expect(wrapper.find('.caomei-auto-complete__clear').exists()).toBe(false)
        expect(wrapper.find('.caomei-auto-complete__trigger').exists()).toBe(true)
    })

    it('无匹配建议时显示空提示且文案可覆盖', async () => {
        const wrapper = mount(CaomeiAutoComplete, {
            props: { options, dropdown: true },
            attachTo: document.body,
        })

        await open(wrapper)
        await wrapper.get('input').setValue('不存在')
        await flushPromises()
        await nextTick()

        expect(document.querySelector('.caomei-auto-complete__empty')?.textContent?.trim()).toBe(
            '无匹配建议',
        )

        const custom = mount(CaomeiAutoComplete, {
            props: { options, dropdown: true, emptyLabel: '没有建议' },
            attachTo: document.body,
        })
        await open(custom)
        await custom.get('input').setValue('不存在')
        await flushPromises()
        await nextTick()

        expect(document.querySelector('.caomei-auto-complete__empty')?.textContent?.trim()).toBe(
            '没有建议',
        )
    })

    it('label 映射为输入框 aria-label，id 落在输入框', () => {
        const wrapper = mount(CaomeiAutoComplete, {
            props: { options, label: '水果', id: 'fruit-input' },
        })

        const input = wrapper.get('input')
        expect(input.attributes('aria-label')).toBe('水果')
        expect(input.attributes('id')).toBe('fruit-input')
    })

    it('展开触发器与清除按钮使用本地化可访问名', () => {
        const wrapper = mount(CaomeiAutoComplete, {
            props: { options, dropdown: true, modelValue: 'apple' },
        })

        expect(wrapper.get('.caomei-auto-complete__trigger').attributes('aria-label')).toBe(
            '展开建议',
        )
        expect(wrapper.get('.caomei-auto-complete__clear').attributes('aria-label')).toBe('清除')

        const custom = mount(CaomeiAutoComplete, {
            props: { options, dropdown: true, openLabel: '打开列表', clearLabel: '重置' },
        })
        expect(custom.get('.caomei-auto-complete__trigger').attributes('aria-label')).toBe('打开列表')
    })

    it('class 落在根元素，其余原生属性透传到输入框', () => {
        const wrapper = mount(CaomeiAutoComplete, {
            props: { options },
            attrs: {
                class: 'custom-auto',
                'data-test': 'auto',
                maxlength: 10,
                'aria-describedby': 'hint',
            },
        })

        const root = wrapper.get('.caomei-auto-complete')
        const input = wrapper.get('input')
        expect(root.classes()).toContain('custom-auto')
        expect(root.attributes('data-test')).toBeUndefined()
        expect(input.attributes('data-test')).toBe('auto')
        expect(input.attributes('maxlength')).toBe('10')
        expect(input.attributes('aria-describedby')).toBe('hint')
    })

    it('多选模式下输入框不回显模型值（由标签展示）', () => {
        const wrapper = mount(CaomeiAutoComplete, {
            props: { options, multiple: true, modelValue: ['apple', 'banana'] },
        })

        expect((wrapper.get('input').element as HTMLInputElement).value).toBe('')
    })

    it('ignoreFilter 为 true 时不按 label 过滤建议', async () => {
        const filtered = mount(CaomeiAutoComplete, {
            props: { options, dropdown: true },
            attachTo: document.body,
        })

        await open(filtered)
        await filtered.get('input').setValue('zzz')
        await flushPromises()
        await nextTick()

        expect(optionElements()).toHaveLength(0)

        filtered.unmount()

        const unfiltered = mount(CaomeiAutoComplete, {
            props: { options, dropdown: true, ignoreFilter: true },
            attachTo: document.body,
        })

        await open(unfiltered)
        await unfiltered.get('input').setValue('zzz')
        await flushPromises()
        await nextTick()

        expect(optionElements()).toHaveLength(options.length)
    })
})
