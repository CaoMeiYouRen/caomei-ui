import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { CaomeiTimePicker } from '../../src/components/time-picker'

/**
 * TimePicker 属性透传契约守卫。
 *
 * 契约：`class` / `style` / `data-*` / 未声明监听器落在组件根 `.caomei-time-picker` 上。
 * 组件根被 Reka `PopoverRoot` 包裹后会变成 Fragment（`PopperRoot` 为 `inheritAttrs: false`），
 * 因此必须显式 `inheritAttrs: false` + `v-bind="$attrs"`；三种 `mode` 都不例外。
 */

const MODES = ['input', 'wheel', 'both'] as const

describe('TimePicker 属性透传契约', () => {
    for (const mode of MODES) {
        it(`mode=${mode} 时 class / style / data-* / 监听器落在根元素`, async () => {
            const onClick = vi.fn()
            const wrapper = mount(CaomeiTimePicker, {
                props: {
                    label: '时间',
                    mode,
                    modelValue: new Date(2026, 0, 1, 9, 30, 0),
                },
                attrs: {
                    class: 'outer-class',
                    style: 'width: 30rem',
                    'data-testid': 'time-picker-root',
                    onClick,
                },
                attachTo: document.body,
            })
            const root = wrapper.get('.caomei-time-picker')
            expect(root.classes()).toContain('outer-class')
            expect(root.attributes('style')).toContain('width: 30rem')
            expect(root.attributes('data-testid')).toBe('time-picker-root')

            await root.trigger('click')
            expect(onClick).toHaveBeenCalledTimes(1)
            wrapper.unmount()
        })
    }
})
