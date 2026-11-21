import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import type { CascaderValue } from './types'
import { CaomeiCascader } from './index'

const options = [
    {
        label: '浙江',
        value: 'zhejiang',
        children: [
            {
                label: '杭州',
                value: 'hangzhou',
                children: [{ label: '西湖', value: 'xihu' }],
            },
            { label: '宁波', value: 'ningbo' },
        ],
    },
    {
        label: '江苏',
        value: 'jiangsu',
        children: [{ label: '南京', value: 'nanjing' }],
    },
]

afterEach(() => {
    document.body.innerHTML = ''
})

function mountCascader(initial: CascaderValue[] = [], extra: Record<string, unknown> = {}) {
    const model = ref<CascaderValue[] | null>(initial)
    const wrapper = mount(defineComponent({
        setup() {
            return () => h(CaomeiCascader, {
                modelValue: model.value,
                'onUpdate:modelValue': (value: CascaderValue[] | null) => {
                    model.value = value
                },
                options,
                ...extra,
            })
        },
    }), { attachTo: document.body })
    return { wrapper, model }
}

async function open(wrapper: ReturnType<typeof mountCascader>['wrapper']): Promise<void> {
    await wrapper.get('.caomei-cascader__trigger').trigger('click')
    await nextTick()
    await nextTick()
}

describe('CaomeiCascader', () => {
    it('逐级展开并在叶子节点提交完整路径', async () => {
        const { wrapper, model } = mountCascader()
        await open(wrapper)

        const items = document.querySelectorAll<HTMLElement>('.caomei-cascader__option')
        items[0].click()
        await nextTick()

        const secondLevel = document.querySelectorAll<HTMLElement>('.caomei-cascader__column')[1]
        ;(secondLevel.querySelectorAll('.caomei-cascader__option')[0] as HTMLElement).click()
        await nextTick()

        const thirdLevel = document.querySelectorAll<HTMLElement>('.caomei-cascader__column')[2]
        ;(thirdLevel.querySelectorAll('.caomei-cascader__option')[0] as HTMLElement).click()
        await nextTick()

        expect(model.value).toEqual(['zhejiang', 'hangzhou', 'xihu'])
        expect(wrapper.get('.caomei-cascader__text').text()).toBe('浙江 / 杭州 / 西湖')
    })

    it('changeOnSelect 时点击父级立即提交', async () => {
        const { wrapper, model } = mountCascader([], { changeOnSelect: true })
        await open(wrapper)

        ;(document.querySelectorAll<HTMLElement>('.caomei-cascader__option')[0]).click()
        await nextTick()

        expect(model.value).toEqual(['zhejiang'])
    })

    it('清除按钮清空模型与展示', async () => {
        const { wrapper, model } = mountCascader(['jiangsu', 'nanjing'])

        expect(wrapper.get('.caomei-cascader__text').text()).toBe('江苏 / 南京')

        await wrapper.get('.caomei-cascader__clear').trigger('click')
        await nextTick()

        expect(model.value).toEqual([])
        expect(wrapper.get('.caomei-cascader__text').attributes('data-empty')).toBe('true')
    })

    it('禁用时触发器不可用', () => {
        const { wrapper } = mountCascader([], { disabled: true })

        expect(wrapper.get('.caomei-cascader__trigger').attributes('disabled')).toBeDefined()
    })
})

describe('CaomeiCascader 边界', () => {
    it('模型路径含缺失层级时按未选择展示', () => {
        const { wrapper } = mountCascader(['missing', 'leaf'])

        expect(wrapper.get('.caomei-cascader__text').attributes('data-empty')).toBe('true')
    })

    it('Enter / Space 可选择节点', async () => {
        const { wrapper, model } = mountCascader()
        await open(wrapper)

        const first = document.querySelectorAll<HTMLElement>('.caomei-cascader__option')[0]
        first.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
        await nextTick()

        const leaf = document.querySelectorAll<HTMLElement>('.caomei-cascader__column')[1]
            .querySelectorAll<HTMLElement>('.caomei-cascader__option')[1]
        leaf.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }))
        await nextTick()

        expect(model.value).toEqual(['zhejiang', 'ningbo'])
    })

    it('空选项渲染空态文案', async () => {
        const { wrapper } = mountCascader([], { options: [] })
        await open(wrapper)

        expect(document.body.textContent).toContain('暂无数据')
    })
})
