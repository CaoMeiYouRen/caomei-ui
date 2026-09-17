import { mount } from '@vue/test-utils'
import { computed } from 'vue'
import { describe, expect, it } from 'vitest'
import { caomeiLocaleKey } from '../../composables/use-locale'
import { caomeiLocales } from '../../locale'
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

    it('label 优先于透传的 aria-label', () => {
        const wrapper = mount(CaomeiProgressSpinner, {
            props: { label: '显式名' },
            attrs: { 'aria-label': '透传名' },
        })
        expect(getRoot(wrapper).attributes('aria-label')).toBe('显式名')
    })

    it('label 为空串时不输出空属性，透传值保留', () => {
        const wrapper = mount(CaomeiProgressSpinner, {
            props: { label: '' },
            attrs: { 'aria-label': '透传名' },
        })
        expect(getRoot(wrapper).attributes('aria-label')).toBe('透传名')
    })

    it('未提供 label 时透传 aria-label 优先于语言默认文案', () => {
        const wrapper = mount(CaomeiProgressSpinner, {
            attrs: { 'aria-label': '正在同步' },
        })
        expect(getRoot(wrapper).attributes('aria-label')).toBe('正在同步')
    })

    it('可访问名使用注入 locale 的文案', () => {
        const wrapper = mount(CaomeiProgressSpinner, {
            global: {
                provide: { [caomeiLocaleKey]: computed(() => caomeiLocales['en-US']) },
            },
        })

        expect(getRoot(wrapper).attributes('aria-label')).toBe('Loading')
    })
})
