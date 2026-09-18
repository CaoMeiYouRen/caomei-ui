import { mount } from '@vue/test-utils'
import { computed } from 'vue'
import { describe, expect, it } from 'vitest'
import { caomeiLocaleKey } from '../../composables/use-locale'
import { caomeiLocales } from '../../locale'
import { CaomeiProgressSpinner } from './index'

function getRoot(wrapper: ReturnType<typeof mount>) {
    return wrapper.get('.caomei-progress-spinner')
}

/** 读取根元素内联样式里的轨道宽度变量（未提供时为 ''） */
function strokeVar(wrapper: ReturnType<typeof mount>): string {
    return (getRoot(wrapper).element as HTMLElement).style.getPropertyValue('--caomei-progress-spinner-stroke')
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

    it('未传 strokeWidth 时不写内联变量（回退档位默认）', () => {
        const wrapper = mount(CaomeiProgressSpinner)

        expect(strokeVar(wrapper)).toBe('')
        expect(getRoot(wrapper).attributes('style')).toBeUndefined()
    })

    it('数字 strokeWidth 按 px 写入内联变量', () => {
        const wrapper = mount(CaomeiProgressSpinner, { props: { strokeWidth: 4 } })

        expect(strokeVar(wrapper)).toBe('4px')
    })

    it('0 是合法宽度', () => {
        const wrapper = mount(CaomeiProgressSpinner, { props: { strokeWidth: 0 } })

        expect(strokeVar(wrapper)).toBe('0px')
    })

    it('字符串 strokeWidth（合法 CSS 长度）原样使用并去首尾空白', () => {
        const wrapper = mount(CaomeiProgressSpinner, { props: { strokeWidth: ' 0.25rem ' } })

        expect(strokeVar(wrapper)).toBe('0.25rem')
    })

    it('纯数字字符串按 px 处理（对齐 PrimeVue 的 strokeWidth 写法）', () => {
        const wrapper = mount(CaomeiProgressSpinner, { props: { strokeWidth: '2' } })

        expect(strokeVar(wrapper)).toBe('2px')
    })

    it.each(['thin', 'medium', 'thick'])('border-width 关键字 %s 可用', (value) => {
        const wrapper = mount(CaomeiProgressSpinner, { props: { strokeWidth: value } })

        expect(strokeVar(wrapper)).toBe(value)
    })

    it.each([
        ['空串', ''],
        ['纯空白', '   '],
        ['负数', -1],
        ['非有限数', Number.POSITIVE_INFINITY],
        ['超出范围', 1001],
        ['分号注入', '2px; color: red'],
        ['花括号注入', '2px}'],
        ['超长值', 'x'.repeat(33)],
        // 语义非法：写入 border 简写会触发 invalid at computed-value time，令整条边框声明被丢弃
        ['带单位后跟多余字符', '2px2'],
        ['非长度关键字', 'abc'],
        ['百分比（对 border-width 非法）', '50%'],
        ['负长度', '-1px'],
        ['复合值', '2px solid red'],
        ['颜色关键字', 'red'],
        ['未闭合函数', 'calc('],
    ])('非法 strokeWidth（%s）回退档位默认', (_label, value) => {
        const wrapper = mount(CaomeiProgressSpinner, { props: { strokeWidth: value } })

        expect(strokeVar(wrapper)).toBe('')
        expect(getRoot(wrapper).attributes('style')).toBeUndefined()
    })

    it('提供 strokeWidth 时写入内联变量且档位类保留（覆盖档位默认由浏览器实测验证）', () => {
        const wrapper = mount(CaomeiProgressSpinner, { props: { size: 'lg', strokeWidth: 1 } })

        expect(getRoot(wrapper).classes()).toContain('caomei-progress-spinner--lg')
        expect(strokeVar(wrapper)).toBe('1px')
    })

    it('strokeWidth 与透传 style 中的同名变量冲突时以 prop 为准', () => {
        const wrapper = mount(CaomeiProgressSpinner, {
            props: { strokeWidth: 5 },
            attrs: { style: '--caomei-progress-spinner-stroke: 9px' },
        })

        expect(strokeVar(wrapper)).toBe('5px')
    })

    it('strokeWidth 与透传的 style 合并，双方均保留', () => {
        const wrapper = mount(CaomeiProgressSpinner, {
            props: { strokeWidth: 5 },
            attrs: { style: 'color: red' },
        })

        expect(strokeVar(wrapper)).toBe('5px')
        expect((getRoot(wrapper).element as HTMLElement).style.color).toBe('red')
    })
})
