import { mount } from '@vue/test-utils'
import { computed } from 'vue'
import { describe, expect, it } from 'vitest'
import { caomeiLocaleKey } from '../../composables/use-locale'
import { caomeiLocales } from '../../locale'
import { CaomeiProgressBar } from './index'

function getRoot(wrapper: ReturnType<typeof mount>) {
    return wrapper.get('.caomei-progress-bar')
}

function getIndicator(wrapper: ReturnType<typeof mount>) {
    return wrapper.get('.caomei-progress-bar__indicator')
}

describe('CaomeiProgressBar', () => {
    it('确定进度输出数值与百分比宽度', () => {
        const wrapper = mount(CaomeiProgressBar, { props: { value: 30 } })

        const root = getRoot(wrapper)
        expect(root.attributes('role')).toBe('progressbar')
        expect(root.attributes('aria-valuemin')).toBe('0')
        expect(root.attributes('aria-valuenow')).toBe('30')
        expect(root.attributes('aria-valuemax')).toBe('100')
        expect(root.attributes('data-state')).toBe('loading')
        expect(getIndicator(wrapper).attributes('style')).toContain('width: 30%')
    })

    it('值等于最大值时为完成态', () => {
        const wrapper = mount(CaomeiProgressBar, { props: { value: 100 } })

        expect(getRoot(wrapper).attributes('data-state')).toBe('complete')
        expect(getIndicator(wrapper).attributes('style')).toContain('width: 100%')
    })

    it('值为 null 时为不确定进度', () => {
        const wrapper = mount(CaomeiProgressBar, { props: { value: null } })

        const root = getRoot(wrapper)
        expect(root.attributes('data-state')).toBe('indeterminate')
        expect(root.attributes('aria-valuenow')).toBeUndefined()
        expect(getIndicator(wrapper).attributes('style')).toBeUndefined()
    })

    it('未传 value 时默认不确定进度', () => {
        const wrapper = mount(CaomeiProgressBar)

        expect(getRoot(wrapper).attributes('data-state')).toBe('indeterminate')
    })

    it('自定义 max 按比例换算', () => {
        const wrapper = mount(CaomeiProgressBar, { props: { value: 1, max: 4 } })

        expect(getRoot(wrapper).attributes('aria-valuemax')).toBe('4')
        expect(getIndicator(wrapper).attributes('style')).toContain('width: 25%')
    })

    it('越界值收窄到合法区间', () => {
        const over = mount(CaomeiProgressBar, { props: { value: 150 } })
        expect(getRoot(over).attributes('aria-valuenow')).toBe('100')
        expect(getRoot(over).attributes('data-state')).toBe('complete')

        const under = mount(CaomeiProgressBar, { props: { value: -10 } })
        expect(getRoot(under).attributes('aria-valuenow')).toBe('0')
    })

    it('非有限值按不确定进度处理', () => {
        expect(getRoot(mount(CaomeiProgressBar, { props: { value: Number.NaN } })).attributes('data-state')).toBe('indeterminate')
        expect(getRoot(mount(CaomeiProgressBar, { props: { value: Number.POSITIVE_INFINITY } })).attributes('data-state')).toBe('indeterminate')
    })

    it.each([0, -1, Number.POSITIVE_INFINITY])('非法 max（%s）回退为默认值', (max) => {
        const wrapper = mount(CaomeiProgressBar, { props: { value: 50, max } })

        const root = getRoot(wrapper)
        expect(root.attributes('aria-valuemax')).toBe('100')
        expect(root.attributes('data-state')).toBe('loading')
        expect(getIndicator(wrapper).attributes('style')).toContain('width: 50%')
    })

    it('非整除量程的百分比为有限小数', () => {
        const wrapper = mount(CaomeiProgressBar, { props: { value: 1, max: 3 } })

        expect(getIndicator(wrapper).attributes('style')).toContain('width: 33.3333%')
    })

    it('默认可访问名取内建文案', () => {
        const wrapper = mount(CaomeiProgressBar, { props: { value: 30 } })

        expect(getRoot(wrapper).attributes('aria-label')).toBe('进度')
    })

    it('label 覆盖可访问名', () => {
        const wrapper = mount(CaomeiProgressBar, { props: { value: 30, label: '上传进度' } })

        expect(getRoot(wrapper).attributes('aria-label')).toBe('上传进度')
    })

    it('label 优先于透传的 aria-label，缺省时透传值优先于内建文案', () => {
        const explicit = mount(CaomeiProgressBar, {
            props: { value: 30, label: '显式名' },
            attrs: { 'aria-label': '透传名' },
        })
        expect(getRoot(explicit).attributes('aria-label')).toBe('显式名')

        const forwarded = mount(CaomeiProgressBar, {
            props: { value: 30 },
            attrs: { 'aria-label': '透传名' },
        })
        expect(getRoot(forwarded).attributes('aria-label')).toBe('透传名')
    })

    it.each(['sm', 'md', 'lg'] as const)('应用尺寸类 %s', (size) => {
        const wrapper = mount(CaomeiProgressBar, { props: { value: 30, size } })

        expect(getRoot(wrapper).classes()).toContain(`caomei-progress-bar--${size}`)
    })

    it('class 留在根元素', () => {
        const wrapper = mount(CaomeiProgressBar, { props: { value: 30 }, attrs: { class: 'custom' } })

        expect(getRoot(wrapper).classes()).toContain('custom')
    })

    it('可访问名使用注入 locale 的文案', () => {
        const wrapper = mount(CaomeiProgressBar, {
            props: { value: 30 },
            global: {
                provide: { [caomeiLocaleKey]: computed(() => caomeiLocales['en-US']) },
            },
        })

        expect(getRoot(wrapper).attributes('aria-label')).toBe('Progress')
    })
})
