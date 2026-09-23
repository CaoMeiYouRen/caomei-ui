import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref, type Component } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { CaomeiTagsInput } from './index'

/**
 * `modelValue` 由 `defineModel` 承载、不在 `TagsInputProps` 中，
 * 故与 MultiSelect 测试同法退化为通用组件类型（否则传 `modelValue` 会被判为多余属性）。
 */
const TagsInput = CaomeiTagsInput as unknown as Component

type TagsInputWrapper = ReturnType<typeof mountTags>

function mountTags(props: Record<string, unknown> = {}) {
    return mount(TagsInput, { props })
}

/** 字段内的输入框 */
function inputOf(wrapper: TagsInputWrapper) {
    return wrapper.get('.caomei-tags-input__input')
}

/** 当前渲染的标签文本 */
function tagTexts(wrapper: TagsInputWrapper): string[] {
    return wrapper.findAll('.caomei-tags-input__tag-label').map((node) => node.text())
}

/** 在输入框中键入文本并回车提交（VTU 的 setValue 不带 event.data，故分隔符路径单独触发） */
async function typeAndEnter(wrapper: TagsInputWrapper, text: string): Promise<void> {
    const input = inputOf(wrapper)
    await input.setValue(text)
    await input.trigger('keydown', { key: 'Enter' })
}

describe('CaomeiTagsInput', () => {
    it('渲染既有标签与输入框，根元素保留消费方 class', () => {
        const wrapper = mount(TagsInput, {
            props: { modelValue: ['React', 'Vue'] },
            attrs: { class: 'my-tags' },
        })

        expect(tagTexts(wrapper)).toEqual(['React', 'Vue'])
        expect(inputOf(wrapper).element.tagName).toBe('INPUT')
        expect(wrapper.classes()).toContain('caomei-tags-input')
        expect(wrapper.classes()).toContain('my-tags')
        expect(wrapper.classes()).toContain('caomei-tags-input--md')
    })

    it('回车提交新增标签并抛出 update:modelValue / addTag', async () => {
        const wrapper = mountTags()

        await typeAndEnter(wrapper, 'React')

        expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toEqual(['React'])
        expect(wrapper.emitted('addTag')?.[0]?.[0]).toBe('React')
    })

    it('写入落到本地值并抛出 update:modelValue，外部 prop 变化覆盖本地值', async () => {
        const wrapper = mountTags({ modelValue: [] })

        await typeAndEnter(wrapper, 'React')

        expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toEqual(['React'])
        expect(tagTexts(wrapper)).toEqual(['React'])

        await wrapper.setProps({ modelValue: ['Vue'] })
        expect(tagTexts(wrapper)).toEqual(['Vue'])
    })

    it('键入分隔符即提交当前输入', () => {
        const wrapper = mountTags()
        const element = inputOf(wrapper).element as HTMLInputElement

        element.value = 'React'
        element.dispatchEvent(new InputEvent('input', { data: ',', bubbles: true }))

        expect(wrapper.emitted('addTag')?.[0]?.[0]).toBe('React')
    })

    it('粘贴默认按分隔符拆分批量新增', () => {
        const wrapper = mountTags()
        const input = inputOf(wrapper)

        // happy-dom 不提供 clipboardData：显式构造并派发带数据的事件
        const event = new Event('paste', { bubbles: true, cancelable: true }) as Event & {
            clipboardData?: { getData: (type: string) => string }
        }
        Object.defineProperty(event, 'clipboardData', {
            value: { getData: () => 'React,Vue,Angular' },
        })
        input.element.dispatchEvent(event)

        expect(wrapper.emitted('addTag')?.map((call) => call[0])).toEqual([
            'React',
            'Vue',
            'Angular',
        ])
    })

    it('点击标签删除按钮移除该标签并抛出 removeTag', async () => {
        const wrapper = mountTags({ modelValue: ['React', 'Vue'] })

        await wrapper.findAll('.caomei-tags-input__tag-remove')[0].trigger('click')

        expect(wrapper.emitted('removeTag')?.[0]?.[0]).toBe('React')
        expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toEqual(['Vue'])
    })

    it('Backspace 先选中末位标签、再次按下删除', async () => {
        const wrapper = mountTags({ modelValue: ['React', 'Vue'] })
        // Reka 的 CollectionSlot 在 watch（异步 flush）中赋值 collectionRef，
        // 挂载后立即触发依赖 collection 的键盘交互会因 getItems() 为空而静默无效
        await nextTick()
        const input = inputOf(wrapper)

        ;(input.element as HTMLInputElement).setSelectionRange(0, 0)
        await input.trigger('keydown', { key: 'Backspace' })
        expect(wrapper.emitted('removeTag')).toBeUndefined()
        expect(wrapper.findAll('.caomei-tags-input__tag')[1].attributes('data-state')).toBe('active')

        await input.trigger('keydown', { key: 'Backspace' })
        expect(wrapper.emitted('removeTag')?.[0]?.[0]).toBe('Vue')
    })

    it('默认拒绝重复标签并抛出 invalidInput', async () => {
        const wrapper = mountTags({ modelValue: ['React'] })

        await typeAndEnter(wrapper, 'React')

        expect(wrapper.emitted('addTag')).toBeUndefined()
        expect(wrapper.emitted('invalidInput')?.[0]?.[0]).toBe('React')
    })

    it('allowDuplicate 为 true 时允许重复标签', async () => {
        const wrapper = mountTags({ modelValue: ['React'], allowDuplicate: true })

        await typeAndEnter(wrapper, 'React')

        expect(wrapper.emitted('addTag')?.[0]?.[0]).toBe('React')
        expect(wrapper.emitted('invalidInput')).toBeUndefined()
    })

    it('max 达到上限后拒绝新增并抛出 invalidInput', async () => {
        const wrapper = mountTags({ modelValue: ['React', 'Vue'], max: 2 })

        await typeAndEnter(wrapper, 'Angular')

        expect(wrapper.emitted('addTag')).toBeUndefined()
        expect(wrapper.emitted('invalidInput')?.[0]?.[0]).toBe('Angular')
    })

    it('invalid 映射 aria-invalid，缺省不输出该属性', async () => {
        const wrapper = mountTags()
        expect(inputOf(wrapper).attributes('aria-invalid')).toBeUndefined()

        await wrapper.setProps({ invalid: true })
        expect(inputOf(wrapper).attributes('aria-invalid')).toBe('true')
        expect(wrapper.classes()).toContain('caomei-tags-input--invalid')
    })

    it('disabled 透传到输入框并输出禁用态 class', () => {
        const wrapper = mountTags({ disabled: true })

        expect(inputOf(wrapper).attributes('disabled')).toBeDefined()
        expect(wrapper.classes()).toContain('caomei-tags-input--disabled')
    })

    it('size 输出档位 class', async () => {
        const wrapper = mountTags({ size: 'sm' })
        expect(wrapper.classes()).toContain('caomei-tags-input--sm')

        await wrapper.setProps({ size: 'lg' })
        expect(wrapper.classes()).toContain('caomei-tags-input--lg')
    })

    it('label 映射输入框可访问名，缺省不输出', async () => {
        const wrapper = mountTags()
        expect(inputOf(wrapper).attributes('aria-label')).toBeUndefined()

        await wrapper.setProps({ label: '标签' })
        expect(inputOf(wrapper).attributes('aria-label')).toBe('标签')
    })

    it('删除按钮具备可访问名（Reka 经 aria-labelledby 指向标签文本）', () => {
        const wrapper = mountTags({ modelValue: ['React'] })
        const remove = wrapper.get('.caomei-tags-input__tag-remove')
        const labelledby = remove.attributes('aria-labelledby')

        expect(labelledby).toBeTruthy()
        expect(wrapper.get(`#${labelledby}`).text()).toBe('React')
        expect(remove.element.tagName).toBe('BUTTON')
        expect(remove.attributes('type')).toBe('button')
    })

    it('placeholder 透传到输入框', () => {
        const wrapper = mountTags({ placeholder: '回车添加标签' })
        expect(inputOf(wrapper).attributes('placeholder')).toBe('回车添加标签')
    })

    it('id 透传到输入框，供外部 label 关联', () => {
        const wrapper = mountTags({ id: 'tags-field' })
        expect(inputOf(wrapper).attributes('id')).toBe('tags-field')
    })

    it('表单内提供 name / required 时生成隐藏控件供原生校验', () => {
        const Form = defineComponent({
            setup: () => () => h('form', null, [
                h(TagsInput, { name: 'tags', required: true, modelValue: ['React'] }),
            ]),
        })
        const wrapper = mount(Form)
        // Reka 的 VisuallyHiddenInput 对数组值展开为 name[index]
        const hidden = wrapper.get('input[name="tags[0]"]')

        expect(hidden.attributes('name')).toBe('tags[0]')
        expect(hidden.attributes('required')).toBeDefined()
        expect(hidden.attributes('value')).toBe('React')
    })

    it('模型更新后标签数量与文本同步（v-model 回写用法）', async () => {
        const value = ref<string[]>([])
        const Host = defineComponent({
            setup() {
                function onUpdate(next: string[]) {
                    value.value = next
                }
                return () => h(TagsInput, { modelValue: value.value, 'onUpdate:modelValue': onUpdate })
            },
        })
        const wrapper = mount(Host)
        const input = wrapper.get('.caomei-tags-input__input')

        await input.setValue('React')
        await input.trigger('keydown', { key: 'Enter' })
        await nextTick()
        await input.setValue('Vue')
        await input.trigger('keydown', { key: 'Enter' })

        expect(wrapper.findAll('.caomei-tags-input__tag-label').map((node) => node.text())).toEqual([
            'React',
            'Vue',
        ])
    })

    it('既有标签顺序与模型一致', () => {
        const wrapper = mountTags({ modelValue: ['C', 'A', 'B'] })
        expect(tagTexts(wrapper)).toEqual(['C', 'A', 'B'])
    })

    it('addTag 载荷为字符串', async () => {
        const onAdd = vi.fn()
        const wrapper = mountTags({ modelValue: [], onAddTag: onAdd })

        await typeAndEnter(wrapper, 'React')

        expect(onAdd).toHaveBeenCalledWith('React')
        expect(typeof onAdd.mock.calls[0][0]).toBe('string')
    })

    it('有标签时输出 data-filled，清空后移除（FloatLabel 上浮契约）', async () => {
        const wrapper = mountTags({ modelValue: ['React'] })
        expect(wrapper.attributes('data-filled')).toBe('true')

        await wrapper.findAll('.caomei-tags-input__tag-remove')[0].trigger('click')
        expect(wrapper.attributes('data-filled')).toBeUndefined()
    })

    it('showClear 显示清空按钮，点击清空模型并抛出 update:modelValue', async () => {
        const wrapper = mountTags({ modelValue: ['React', 'Vue'], showClear: true })
        const clear = wrapper.get('.caomei-tags-input__clear')

        expect(clear.attributes('aria-label')).toBe('清空')

        await clear.trigger('click')

        expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toEqual([])
        expect(wrapper.find('.caomei-tags-input__clear').exists()).toBe(false)
    })

    it('showClear 缺省不渲染清空按钮', () => {
        const wrapper = mountTags({ modelValue: ['React'] })
        expect(wrapper.find('.caomei-tags-input__clear').exists()).toBe(false)
    })

    it('addOnPaste 为 false 时不拆分粘贴内容', () => {
        const wrapper = mountTags({ addOnPaste: false })
        const element = inputOf(wrapper).element as HTMLInputElement

        const event = new Event('paste', { bubbles: true, cancelable: true }) as Event & {
            clipboardData?: { getData: (type: string) => string }
        }
        Object.defineProperty(event, 'clipboardData', { value: { getData: () => 'React,Vue' } })
        element.dispatchEvent(event)

        expect(wrapper.emitted('addTag')).toBeUndefined()
    })

    it('delimiter 支持正则', () => {
        const wrapper = mountTags({ delimiter: /[,\s]/ })
        const element = inputOf(wrapper).element as HTMLInputElement

        element.value = 'React'
        element.dispatchEvent(new InputEvent('input', { data: ' ', bubbles: true }))

        expect(wrapper.emitted('addTag')?.[0]?.[0]).toBe('React')
    })

    it('addOnTab 为 true 时 Tab 提交当前输入', async () => {
        const wrapper = mountTags({ addOnTab: true })
        const input = inputOf(wrapper)

        await input.setValue('React')
        await input.trigger('keydown', { key: 'Tab' })

        expect(wrapper.emitted('addTag')?.[0]?.[0]).toBe('React')
    })

    it('addOnBlur 为 true 时失焦提交当前输入', async () => {
        const wrapper = mountTags({ addOnBlur: true })
        const input = inputOf(wrapper)

        await input.setValue('React')
        await input.trigger('blur')

        expect(wrapper.emitted('addTag')?.[0]?.[0]).toBe('React')
    })

    it('max 缺省不限（连续新增不触发 invalidInput）', async () => {
        const wrapper = mountTags()

        for (const tag of ['A', 'B', 'C', 'D', 'E']) {
            await typeAndEnter(wrapper, tag)
        }

        expect(wrapper.emitted('addTag')?.map((call) => call[0])).toEqual(['A', 'B', 'C', 'D', 'E'])
        expect(wrapper.emitted('invalidInput')).toBeUndefined()
    })
})
