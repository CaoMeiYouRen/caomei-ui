import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { CaomeiStatistic } from './index'

describe('CaomeiStatistic', () => {
    it('默认按千分位渲染整数并带尺寸档类名', () => {
        const wrapper = mount(CaomeiStatistic, { props: { value: 1234567 } })

        const root = wrapper.get('.caomei-statistic')
        expect(root.element.tagName).toBe('DIV')
        expect(root.classes()).toContain('caomei-statistic--md')
        expect(wrapper.get('.caomei-statistic__number').text()).toBe('1,234,567')
        expect(wrapper.find('.caomei-statistic__label').exists()).toBe(false)
    })

    it('precision 固定小数位并按 decimalSeparator 输出', () => {
        const wrapper = mount(CaomeiStatistic, {
            props: { value: 1234.5, precision: 2, decimalSeparator: ',' },
        })

        expect(wrapper.get('.caomei-statistic__number').text()).toBe('1,234,50')
    })

    it('进位跨越千分位时保持分组', () => {
        const wrapper = mount(CaomeiStatistic, { props: { value: 999.995, precision: 2 } })

        expect(wrapper.get('.caomei-statistic__number').text()).toBe('1,000.00')
    })

    it('precision 为 0 时输出整数且不带小数点', () => {
        const rounded = mount(CaomeiStatistic, { props: { value: 2.5, precision: 0 } })
        const truncated = mount(CaomeiStatistic, { props: { value: 2.4, precision: 0 } })

        expect(rounded.get('.caomei-statistic__number').text()).toBe('3')
        expect(truncated.get('.caomei-statistic__number').text()).toBe('2')
        expect(rounded.text()).not.toContain('.')
    })

    it('负数保留符号并对整数部分分组', () => {
        const wrapper = mount(CaomeiStatistic, { props: { value: -1234567.25 } })

        expect(wrapper.get('.caomei-statistic__number').text()).toBe('-1,234,567.25')
    })

    it('零与小于一的数值正常渲染', () => {
        const zero = mount(CaomeiStatistic, { props: { value: 0 } })
        const small = mount(CaomeiStatistic, { props: { value: 0.125 } })

        expect(zero.get('.caomei-statistic__number').text()).toBe('0')
        expect(zero.classes()).not.toContain('caomei-statistic--empty')
        expect(small.get('.caomei-statistic__number').text()).toBe('0.125')
    })

    it('数字字符串按数值渲染，空串与非数字串降级为占位', () => {
        const numeric = mount(CaomeiStatistic, { props: { value: '98765.5' } })
        const empty = mount(CaomeiStatistic, { props: { value: '' } })
        const invalid = mount(CaomeiStatistic, { props: { value: '十二万' } })
        const missing = mount(CaomeiStatistic)

        expect(numeric.get('.caomei-statistic__number').text()).toBe('98,765.5')
        expect(empty.get('.caomei-statistic__number').text()).toBe('--')
        expect(empty.classes()).toContain('caomei-statistic--empty')
        expect(invalid.get('.caomei-statistic__number').text()).toBe('--')
        expect(missing.get('.caomei-statistic__number').text()).toBe('--')
    })

    it('placeholder 与 groupSeparator 可覆盖', () => {
        const wrapper = mount(CaomeiStatistic, {
            props: { value: null, placeholder: '暂无', groupSeparator: ' ' },
        })
        const spaced = mount(CaomeiStatistic, { props: { value: 1234567, groupSeparator: ' ' } })

        expect(wrapper.get('.caomei-statistic__number').text()).toBe('暂无')
        expect(spaced.get('.caomei-statistic__number').text()).toBe('1 234 567')
    })

    it('groupSeparator 传空串关闭分组，无限值按空值处理', () => {
        const wrapper = mount(CaomeiStatistic, { props: { value: 1234567, groupSeparator: '' } })
        const infinite = mount(CaomeiStatistic, { props: { value: Number.POSITIVE_INFINITY } })
        const nan = mount(CaomeiStatistic, { props: { value: Number.NaN } })

        expect(wrapper.get('.caomei-statistic__number').text()).toBe('1234567')
        expect(infinite.classes()).toContain('caomei-statistic--empty')
        expect(nan.classes()).toContain('caomei-statistic--empty')
    })

    it('precision 越界或非整数时忽略，保留数值自身小数位', () => {
        const tooLarge = mount(CaomeiStatistic, { props: { value: 1.23456, precision: 21 } })
        const negative = mount(CaomeiStatistic, { props: { value: 1.23456, precision: -1 } })

        expect(tooLarge.get('.caomei-statistic__number').text()).toBe('1.23456')
        expect(negative.get('.caomei-statistic__number').text()).toBe('1.23456')
    })

    it('prefix / suffix 与 label 渲染，label 作为数值区可访问名', () => {
        const wrapper = mount(CaomeiStatistic, {
            props: { value: 42, prefix: '¥', suffix: '元', label: '本周收入' },
        })

        const label = wrapper.get('.caomei-statistic__label')
        const value = wrapper.get('.caomei-statistic__value')
        expect(label.text()).toBe('本周收入')
        expect(value.attributes('aria-labelledby')).toBe(label.attributes('id'))
        expect(wrapper.get('.caomei-statistic__prefix').text()).toBe('¥')
        expect(wrapper.get('.caomei-statistic__suffix').text()).toBe('元')
        expect(value.text()).toContain('42')
    })

    it('无 label 时不输出 aria-labelledby，数值区可命名但不是 landmark', () => {
        const wrapper = mount(CaomeiStatistic, { props: { value: 1 } })

        const value = wrapper.get('.caomei-statistic__value')
        expect(value.attributes('aria-labelledby')).toBeUndefined()
        expect(value.attributes('role')).toBe('group')
        expect(wrapper.get('.caomei-statistic').attributes('role')).toBeUndefined()
    })

    it('分隔符按字面量插入，不解释为替换模式', () => {
        const wrapper = mount(CaomeiStatistic, { props: { value: 1234567, groupSeparator: '$1' } })

        expect(wrapper.get('.caomei-statistic__number').text()).toBe('1$1234$1567')
    })

    it('label / prefix / suffix 插槽覆盖属性值', () => {
        const wrapper = mount(CaomeiStatistic, {
            props: { value: 7, label: '属性标签', prefix: '¥', suffix: '元' },
            slots: { label: '插槽标签', prefix: 'A', suffix: 'B' },
        })

        expect(wrapper.get('.caomei-statistic__label').text()).toBe('插槽标签')
        expect(wrapper.get('.caomei-statistic__prefix').text()).toBe('A')
        expect(wrapper.get('.caomei-statistic__suffix').text()).toBe('B')
    })

    it('sm 尺寸档输出对应类名', () => {
        const wrapper = mount(CaomeiStatistic, { props: { value: 1, size: 'sm' } })

        expect(wrapper.classes()).toContain('caomei-statistic--sm')
    })

    it('loading 隐藏数值、输出骨架并标记 aria-busy', () => {
        const wrapper = mount(CaomeiStatistic, { props: { value: 42, loading: true } })

        const value = wrapper.get('.caomei-statistic__value')
        expect(value.attributes('aria-busy')).toBe('true')
        expect(value.attributes('role')).toBe('group')
        expect(wrapper.find('.caomei-statistic__number').exists()).toBe(false)
        expect(wrapper.get('.caomei-statistic__skeleton').attributes('aria-hidden')).toBe('true')
        expect(wrapper.classes()).toContain('caomei-statistic--loading')
    })

    it('as 与 size 可切换根标签与尺寸档', () => {
        const wrapper = mount(CaomeiStatistic, { props: { value: 1, as: 'span', size: 'lg' } })

        expect(wrapper.get('.caomei-statistic').element.tagName).toBe('SPAN')
        expect(wrapper.classes()).toContain('caomei-statistic--lg')
    })
})
