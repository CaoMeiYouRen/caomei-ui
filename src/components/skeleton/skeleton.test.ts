import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { CaomeiSkeleton } from './index'

describe('CaomeiSkeleton', () => {
    it('默认渲染单行 text 占位并标记装饰性', () => {
        const wrapper = mount(CaomeiSkeleton)

        const root = wrapper.get('.caomei-skeleton')
        expect(root.element.tagName).toBe('SPAN')
        expect(root.classes()).toContain('caomei-skeleton--text')
        expect(root.classes()).toContain('caomei-skeleton--pulse')
        expect(root.attributes('aria-hidden')).toBe('true')
        expect(wrapper.findAll('.caomei-skeleton__line')).toHaveLength(1)
    })

    it('lines 控制 text 行数且末行收窄', () => {
        const wrapper = mount(CaomeiSkeleton, { props: { lines: 3 } })

        const lines = wrapper.findAll('.caomei-skeleton__line')
        expect(lines).toHaveLength(3)
        expect(lines[0].attributes('style')).toBeUndefined()
        expect(lines[2].attributes('style')).toContain('--caomei-skeleton-last-line-width')
    })

    it('lines 小于 1 时按 1 行处理', () => {
        const wrapper = mount(CaomeiSkeleton, { props: { lines: 0 } })

        expect(wrapper.findAll('.caomei-skeleton__line')).toHaveLength(1)
    })

    it.each([Number.NaN, Number.POSITIVE_INFINITY, -2])('非有限或非正 lines（%s）按 1 行处理', (lines) => {
        const wrapper = mount(CaomeiSkeleton, { props: { lines } })

        expect(wrapper.findAll('.caomei-skeleton__line')).toHaveLength(1)
    })

    it('circular 与 rectangular 变体各渲染单个形状', () => {
        const circular = mount(CaomeiSkeleton, { props: { variant: 'circular', lines: 3 } })
        expect(circular.get('.caomei-skeleton').classes()).toContain('caomei-skeleton--circular')
        expect(circular.findAll('.caomei-skeleton__line')).toHaveLength(1)

        const rectangular = mount(CaomeiSkeleton, { props: { variant: 'rectangular' } })
        expect(rectangular.get('.caomei-skeleton').classes()).toContain('caomei-skeleton--rectangular')
    })

    it.each(['pulse', 'wave', 'none'] as const)('应用动画类 %s', (animation) => {
        const wrapper = mount(CaomeiSkeleton, { props: { animation } })

        expect(wrapper.get('.caomei-skeleton').classes()).toContain(`caomei-skeleton--${animation}`)
    })

    it('数字尺寸按 px 输出 CSS 变量', () => {
        const wrapper = mount(CaomeiSkeleton, { props: { width: 120, height: 16 } })

        const style = wrapper.get('.caomei-skeleton').attributes('style') ?? ''
        expect(style).toContain('--caomei-skeleton-width: 120px')
        expect(style).toContain('--caomei-skeleton-height: 16px')
    })

    it('字符串尺寸原样输出', () => {
        const wrapper = mount(CaomeiSkeleton, { props: { width: '50%', height: '2rem' } })

        const style = wrapper.get('.caomei-skeleton').attributes('style') ?? ''
        expect(style).toContain('--caomei-skeleton-width: 50%')
        expect(style).toContain('--caomei-skeleton-height: 2rem')
    })

    it('未提供尺寸时不输出对应 CSS 变量', () => {
        const wrapper = mount(CaomeiSkeleton)

        expect(wrapper.get('.caomei-skeleton').attributes('style')).toBeUndefined()
    })

    it('class 透传到根元素', () => {
        const wrapper = mount(CaomeiSkeleton, { attrs: { class: 'custom' } })

        expect(wrapper.get('.caomei-skeleton').classes()).toContain('custom')
    })
})
