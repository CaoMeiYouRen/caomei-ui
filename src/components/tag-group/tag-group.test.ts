import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import {
    CaomeiTagGroup,
    CaomeiTagGroupItem,
    CaomeiTagGroupItemDelete,
    CaomeiTagGroupItemText,
} from './index'

/**
 * 标签组的交互契约：选择 / 多选、方向键移动、Delete 移除、禁用项与整组禁用、`v-model`。
 *
 * 断言落在可观察结果（`aria-selected` / `data-state` / 模型值 / 移除事件 / 活动元素），
 * 不对 Reka 内部状态做白盒断言。
 */

const mountedWrappers: { unmount: () => void }[] = []

afterEach(() => {
    for (const wrapper of mountedWrappers.splice(0)) {
        wrapper.unmount()
    }
    document.body.innerHTML = ''
})

interface HarnessOptions {
    selectionMode?: 'none' | 'single' | 'multiple'
    initial?: string | string[] | null
    disabled?: boolean
    disabledItem?: string
    removable?: boolean
    disallowEmptySelection?: boolean
}

function mountGroup(options: HarnessOptions = {}) {
    const model = ref<string | string[] | null>(options.initial ?? null)
    const removed: string[] = []
    const tags = ['前端', '后端', '设计']

    const Host = defineComponent({
        setup() {
            return () => h(
                CaomeiTagGroup,
                {
                    modelValue: model.value,
                    selectionMode: options.selectionMode ?? 'multiple',
                    disabled: options.disabled ?? false,
                    disallowEmptySelection: options.disallowEmptySelection ?? false,
                    'onUpdate:modelValue': (value?: string | string[] | null) => {
                        model.value = value ?? null
                    },
                    onRemove: (value: string) => {
                        removed.push(value)
                    },
                },
                () => tags.map((tag) => h(
                    CaomeiTagGroupItem,
                    { value: tag, disabled: options.disabledItem === tag },
                    () => [
                        h(CaomeiTagGroupItemText, null, () => tag),
                        options.removable
                            ? h(CaomeiTagGroupItemDelete, null, () => '×')
                            : null,
                    ],
                )),
            )
        },
    })

    const wrapper = mount(Host, { attachTo: document.body })
    mountedWrappers.push(wrapper)
    return {
        wrapper,
        model,
        removed,
        items: () => wrapper.findAll('.caomei-tag-group__item'),
    }
}

async function settle(): Promise<void> {
    await nextTick()
    await nextTick()
}

describe('CaomeiTagGroup 选择行为', () => {
    it('multiple 模式点击切换选中并把值写回模型', async () => {
        const { items, model } = mountGroup({ initial: [] })
        await settle()

        await items()[0].trigger('click')
        await settle()
        expect(model.value).toEqual(['前端'])
        expect(items()[0].attributes('data-state')).toBe('checked')

        await items()[1].trigger('click')
        await settle()
        expect(model.value).toEqual(['前端', '后端'])

        await items()[0].trigger('click')
        await settle()
        expect(model.value).toEqual(['后端'])
        expect(items()[0].attributes('data-state')).toBe('unchecked')
    })

    it('single 模式同时只保留一个值', async () => {
        const { items, model } = mountGroup({ selectionMode: 'single', initial: '' })
        await settle()

        await items()[0].trigger('click')
        await settle()
        await items()[2].trigger('click')
        await settle()

        expect(model.value).toBe('设计')
        expect(items()[2].attributes('aria-selected')).toBe('true')
        expect(items()[0].attributes('aria-selected')).toBe('false')
    })

    it('selectionMode=none 时点击不改变模型', async () => {
        const { items, model } = mountGroup({ selectionMode: 'none', initial: null })
        await settle()

        await items()[0].trigger('click')
        await settle()
        expect(model.value).toBeNull()
        expect(items()[0].attributes('data-state')).toBeUndefined()
    })

    it('disallowEmptySelection 时不允许取消最后一项', async () => {
        const { items, model } = mountGroup({ initial: ['前端'], disallowEmptySelection: true })
        await settle()

        await items()[0].trigger('click')
        await settle()
        expect(model.value).toEqual(['前端'])
    })
})

describe('CaomeiTagGroup 键盘与移除', () => {
    it('方向键在同一组的标签之间移动焦点', async () => {
        const { items } = mountGroup()
        await settle()

        ;(items()[0].element as HTMLElement).focus()
        await items()[0].trigger('keydown', { key: 'ArrowRight' })
        await settle()

        expect(document.activeElement, '焦点移到下一个标签').toBe(items()[1].element)
    })

    it('删除触发器把该值从模型移除并派发 remove', async () => {
        const { items, model, removed } = mountGroup({ initial: ['前端', '后端'], removable: true })
        await settle()

        const deleteButton = items()[0].find('.caomei-tag-group__delete')
        await deleteButton.trigger('click')
        await settle()

        expect(removed).toEqual(['前端'])
        expect(model.value).toEqual(['后端'])
    })

    it('禁用项不可选中，也不可移除', async () => {
        const { items, model } = mountGroup({
            initial: [],
            disabledItem: '后端',
            removable: true,
        })
        await settle()

        await items()[1].trigger('click')
        await settle()
        expect(model.value, '禁用项点击不写入模型').toEqual([])

        await items()[0].trigger('click')
        await settle()
        expect(model.value).toEqual(['前端'])
    })

    it('整组禁用时点击不改变模型', async () => {
        const { items, model } = mountGroup({ initial: [], disabled: true })
        await settle()

        await items()[0].trigger('click')
        await settle()
        expect(model.value).toEqual([])
    })
})
