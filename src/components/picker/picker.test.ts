import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { WHEEL_SETTLE_MS } from '../_shared/use-wheel-column'
import type { PickerColumn } from './types'
import { CaomeiPicker } from './index'

/**
 * 滚轮选择器契约：单列 / 多列、`v-model`、循环、吸附（动量收敛）、边界与键盘。
 *
 * happy-dom 没有布局：行高走 `itemHeight` 兜底（默认 36），滚动吸附通过「写 `scrollTop` +
 * 派发 scroll + 推进计时器」断言，等价于真实浏览器里动量停止后的落点判定。
 */

const COLUMNS: PickerColumn[] = [
    {
        label: '省份',
        options: [
            { label: '浙江', value: 'zj' },
            { label: '江苏', value: 'js' },
            { label: '广东', value: 'gd' },
        ],
    },
    {
        label: '城市',
        options: [
            { label: '杭州', value: 'hz' },
            { label: '南京', value: 'nj' },
        ],
    },
]

const mountedWrappers: { unmount: () => void }[] = []

beforeEach(() => {
    vi.useFakeTimers()
})

afterEach(() => {
    vi.useRealTimers()
    for (const wrapper of mountedWrappers.splice(0)) {
        wrapper.unmount()
    }
    document.body.innerHTML = ''
})

async function settle(): Promise<void> {
    await nextTick()
    await nextTick()
}

function mountPicker(options: { columns?: PickerColumn[], initial?: (string | number)[], loop?: boolean, disabled?: boolean, readonly?: boolean } = {}) {
    const model = ref<(string | number)[]>(options.initial ?? [])
    const Host = defineComponent({
        setup: () => () => h(CaomeiPicker, {
            columns: options.columns ?? COLUMNS,
            modelValue: model.value,
            loop: options.loop ?? false,
            disabled: options.disabled ?? false,
            readonly: options.readonly ?? false,
            label: '地区选择',
            'onUpdate:modelValue': (value: (string | number)[]) => {
                model.value = value
            },
        }),
    })
    const wrapper = mount(Host, { attachTo: document.body })
    mountedWrappers.push(wrapper)
    return {
        wrapper,
        model,
        columns: () => wrapper.findAll('.caomei-picker__column'),
        optionsIn: (index: number) => wrapper.findAll('.caomei-picker__column')[index].findAll('.caomei-picker__option'),
    }
}

describe('CaomeiPicker 渲染与模型', () => {
    it('单列与多列分别渲染对应数量的滚轮列与选项', async () => {
        const single = mountPicker({ columns: [COLUMNS[0]] })
        await settle()
        expect(single.columns()).toHaveLength(1)
        expect(single.optionsIn(0)).toHaveLength(3)

        const multiple = mountPicker()
        await settle()
        expect(multiple.columns()).toHaveLength(2)
        expect(multiple.optionsIn(1)).toHaveLength(2)
    })

    it('首项在模型为空时即为选中态（隐式默认不写入模型）', async () => {
        const { model, optionsIn } = mountPicker()
        await settle()

        expect(model.value).toEqual([])
        expect(optionsIn(0)[0].attributes('aria-selected')).toBe('true')
        expect(optionsIn(0)[1].attributes('aria-selected')).toBe('false')
    })

    it('点击某列选项只更新该列，其余列保持原值', async () => {
        const { model, optionsIn } = mountPicker({ initial: ['zj', 'hz'] })
        await settle()

        await optionsIn(1)[1].trigger('click')
        await settle()

        expect(model.value).toEqual(['zj', 'nj'])
    })

    it('容器带可访问名与 group 角色', async () => {
        const { wrapper } = mountPicker()
        await settle()
        const group = wrapper.find('.caomei-picker')
        expect(group.attributes('role')).toBe('group')
        expect(group.attributes('aria-label')).toBe('地区选择')
    })
})

describe('CaomeiPicker 键盘与循环', () => {
    it('方向键在列内移动并回写模型', async () => {
        const { model, columns } = mountPicker({ initial: ['zj', 'hz'] })
        await settle()

        await columns()[0].trigger('keydown', { key: 'ArrowDown' })
        await settle()
        expect(model.value[0]).toBe('js')

        await columns()[0].trigger('keydown', { key: 'ArrowUp' })
        await settle()
        expect(model.value[0]).toBe('zj')
    })

    it('未开启 loop 时在边界停住', async () => {
        const { model, columns } = mountPicker({ initial: ['zj', 'hz'] })
        await settle()

        await columns()[0].trigger('keydown', { key: 'ArrowUp' })
        await settle()
        expect(model.value[0], '首项再上移仍为首项').toBe('zj')

        model.value = ['gd', 'hz']
        await settle()
        await columns()[0].trigger('keydown', { key: 'ArrowDown' })
        await settle()
        expect(model.value[0], '末项再下移仍为末项').toBe('gd')
    })

    it('开启 loop 时首尾相接', async () => {
        const { model, columns } = mountPicker({ initial: ['zj', 'hz'], loop: true })
        await settle()

        await columns()[0].trigger('keydown', { key: 'ArrowUp' })
        await settle()
        expect(model.value[0], '首项上移回绕到末项').toBe('gd')

        await columns()[0].trigger('keydown', { key: 'ArrowDown' })
        await settle()
        expect(model.value[0], '末项下移回绕到首项').toBe('zj')
    })

    it('Home / End 跳到首末项', async () => {
        const { model, columns } = mountPicker({ initial: ['js', 'hz'] })
        await settle()

        await columns()[0].trigger('keydown', { key: 'End' })
        await settle()
        expect(model.value[0]).toBe('gd')

        await columns()[0].trigger('keydown', { key: 'Home' })
        await settle()
        expect(model.value[0]).toBe('zj')
    })
})

describe('CaomeiPicker 吸附与禁用', () => {
    it('滚动停止后吸附到最近项（动量收敛到四舍五入的落点）', async () => {
        const { model, columns } = mountPicker({ initial: ['zj', 'hz'] })
        await settle()

        // 越过挂载期的程序化对齐忽略窗口（200ms）
        vi.advanceTimersByTime(210)
        const column = columns()[0].element
        // 行高 36：滚过 2 行多一点 → 最近项是第 2 项（下标 2）
        Object.defineProperty(column, 'scrollTop', { configurable: true, writable: true, value: 2 * 36 + 10 })
        await columns()[0].trigger('scroll')
        vi.advanceTimersByTime(WHEEL_SETTLE_MS + 10)
        await settle()

        expect(model.value[0]).toBe('gd')
    })

    it('程序化对齐后的滚动事件不写入模型（忽略窗口内）', async () => {
        const { model, columns } = mountPicker({ initial: ['zj', 'hz'] })
        await settle()

        // 挂载后组件会做一次程序化对齐（scrollTop = 0），此刻派发 scroll 应被忽略
        const column = columns()[0].element
        Object.defineProperty(column, 'scrollTop', { configurable: true, writable: true, value: 36 })
        await columns()[0].trigger('scroll')
        vi.advanceTimersByTime(WHEEL_SETTLE_MS + 10)
        await settle()

        expect(model.value).toEqual(['zj', 'hz'])
    })

    it('禁用与只读时不响应键盘与点击', async () => {
        for (const flag of ['disabled', 'readonly'] as const) {
            const { model, columns, optionsIn } = mountPicker({ initial: ['zj', 'hz'], [flag]: true })
            await settle()

            await columns()[0].trigger('keydown', { key: 'ArrowDown' })
            await optionsIn(0)[2].trigger('click')
            await settle()

            expect(model.value, `${flag} 状态不写回`).toEqual(['zj', 'hz'])
        }
    })
})
