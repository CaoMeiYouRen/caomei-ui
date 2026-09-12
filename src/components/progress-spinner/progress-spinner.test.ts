import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { CaomeiProgressSpinner } from './index'

function getRoot(wrapper: ReturnType<typeof mount>) {
    return wrapper.get('.caomei-progress-spinner')
}

describe('CaomeiProgressSpinner', () => {
    it('渲染为不确定进度条并带可访问名', () => {
        const wrapper = mount(CaomeiProgressSpinner)

        const root = getRoot(wrapper)
        expect(root.attributes('role')).toBe('progressbar')
        expect(root.attributes('aria-label')).toBe('加载中')
        expect(root.attributes('data-state')).toBe('indeterminate')
        expect(root.attributes('aria-valuenow')).toBeUndefined()
        expect(root.classes()).toContain('caomei-progress-spinner--md')
    })

    it('渲染指示器元素', () => {
        const wrapper = mount(CaomeiProgressSpinner)

        expect(wrapper.get('.caomei-progress-spinner__indicator').element.tagName).toBe('SPAN')
    })

    it.each(['sm', 'md', 'lg'] as const)('应用尺寸类 %s', (size) => {
        const wrapper = mount(CaomeiProgressSpinner, { props: { size } })

        expect(getRoot(wrapper).classes()).toContain(`caomei-progress-spinner--${size}`)
    })

    it('label 可覆盖', () => {
        const wrapper = mount(CaomeiProgressSpinner, { props: { label: '正在提交' } })

        expect(getRoot(wrapper).attributes('aria-label')).toBe('正在提交')
    })

    it('class 与其余属性透传到根元素', () => {
        const wrapper = mount(CaomeiProgressSpinner, {
            attrs: { class: 'custom', 'data-test': 'spinner' },
        })

        const root = getRoot(wrapper)
        expect(root.classes()).toContain('custom')
        expect(root.attributes('data-test')).toBe('spinner')
    })
})
