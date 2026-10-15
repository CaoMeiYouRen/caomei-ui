import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick, ref } from 'vue'
import { CaomeiBreadcrumb, CaomeiBreadcrumbItem } from './index'

/**
 * 组合场景用模板挂载：`CaomeiBreadcrumbItem` 依赖祖先 `provide`（分隔符文本），
 * 单独挂载无法覆盖「首项无分隔符 / 后续项有分隔符」这一核心契约。
 */
function mountBreadcrumb(
    props: Record<string, unknown> = {},
    items = '<CaomeiBreadcrumbItem href="/">首页</CaomeiBreadcrumbItem>'
        + '<CaomeiBreadcrumbItem href="/docs">文档</CaomeiBreadcrumbItem>'
        + '<CaomeiBreadcrumbItem current>当前页</CaomeiBreadcrumbItem>',
) {
    return mount({
        components: { CaomeiBreadcrumb, CaomeiBreadcrumbItem },
        props: ['label', 'separator'],
        template: `<CaomeiBreadcrumb :label="label" :separator="separator">${items}</CaomeiBreadcrumb>`,
    }, { props, attachTo: document.body })
}

afterEach(() => {
    document.body.innerHTML = ''
})

describe('CaomeiBreadcrumb', () => {
    it('渲染导航容器与列表语义', () => {
        const wrapper = mountBreadcrumb({ label: '面包屑' })

        expect(wrapper.get('.caomei-breadcrumb').element.tagName).toBe('NAV')
        expect(wrapper.get('.caomei-breadcrumb').attributes('aria-label')).toBe('面包屑')
        expect(wrapper.get('.caomei-breadcrumb__list').element.tagName).toBe('OL')

        wrapper.unmount()
    })

    it('未传 label 时不渲染 aria-label', () => {
        const wrapper = mountBreadcrumb()

        expect(wrapper.get('.caomei-breadcrumb').attributes('aria-label')).toBeUndefined()

        wrapper.unmount()
    })
})

describe('CaomeiBreadcrumbItem', () => {
    it('每项各渲染一个分隔符装饰元素（首项的隐藏由容器 CSS 按渲染位置处理）', () => {
        const wrapper = mountBreadcrumb()

        const items = wrapper.findAll('ol > li')
        expect(items).toHaveLength(3)
        // 每项恰好一个分隔符、且位于项内首位；不出现项外分隔符（位置无关，见下条动态项集用例）
        expect(wrapper.findAll('ol > li > .caomei-breadcrumb__separator')).toHaveLength(3)
        expect(wrapper.findAll('ol > .caomei-breadcrumb__separator')).toHaveLength(0)
        expect(wrapper.findAll('ol > li > .caomei-breadcrumb__separator')[0]?.text()).toBe('/')

        wrapper.unmount()
    })

    it('动态项集（v-for + :key 换键 / 删首项）下分隔符数量与位置仍与项一一对应', async () => {
        const items = ref([
            { key: 'home', label: '首页', href: '/' },
            { key: 'docs', label: '文档', href: '/docs' },
            { key: 'page', label: '当前页', href: '' },
        ])
        const wrapper = mount({
            components: { CaomeiBreadcrumb, CaomeiBreadcrumbItem },
            setup: () => ({ items }),
            template: `<CaomeiBreadcrumb label="面包屑">
                <CaomeiBreadcrumbItem v-for="item in items" :key="item.key" :href="item.href || undefined" :current="item.href === ''">
                    {{ item.label }}
                </CaomeiBreadcrumbItem>
            </CaomeiBreadcrumb>`,
        }, { attachTo: document.body })

        const shape = () => ({
            items: wrapper.findAll('ol > li').length,
            separators: wrapper.findAll('ol > li > .caomei-breadcrumb__separator').length,
            stray: wrapper.findAll('ol > .caomei-breadcrumb__separator').length,
            firstChildIsSeparator: wrapper.findAll('ol > li')[0]?.element.firstElementChild?.classList.contains('caomei-breadcrumb__separator'),
        })

        expect(shape()).toEqual({ items: 3, separators: 3, stray: 0, firstChildIsSeparator: true })

        // 换键（整体替换项集）后仍应一一对应——序号式实现在此会产出前置分隔符
        items.value = [
            { key: 'x', label: '新首页', href: '/' },
            { key: 'y', label: '新页', href: '' },
        ]
        await nextTick()
        expect(shape()).toEqual({ items: 2, separators: 2, stray: 0, firstChildIsSeparator: true })

        // 删首项
        items.value = items.value.slice(1)
        await nextTick()
        expect(shape()).toEqual({ items: 1, separators: 1, stray: 0, firstChildIsSeparator: true })

        wrapper.unmount()
    })

    it('分隔符可由 separator 定制', () => {
        const wrapper = mountBreadcrumb({ separator: '>' })

        expect(wrapper.findAll('.caomei-breadcrumb__separator')[0]?.text()).toBe('>')

        wrapper.unmount()
    })

    it('分隔符为装饰元素（aria-hidden），不进入可访问名', () => {
        const wrapper = mountBreadcrumb()

        expect(wrapper.get('.caomei-breadcrumb__separator').attributes('aria-hidden')).toBe('true')

        wrapper.unmount()
    })

    it('提供 href 渲染链接；末级当前页渲染纯文本并带 aria-current=page', () => {
        const wrapper = mountBreadcrumb()

        const links = wrapper.findAll('a.caomei-breadcrumb__link')
        expect(links).toHaveLength(2)
        expect(links[0]?.attributes('href')).toBe('/')

        const current = wrapper.get('[aria-current="page"]')
        expect(current.element.tagName).toBe('SPAN')
        expect(current.text()).toBe('当前页')

        wrapper.unmount()
    })

    it('current 只标记声明的项（链接亦可为当前页）', () => {
        const wrapper = mountBreadcrumb({}, '<CaomeiBreadcrumbItem href="/">首页</CaomeiBreadcrumbItem>'
            + '<CaomeiBreadcrumbItem href="/docs" current>文档</CaomeiBreadcrumbItem>')

        const current = wrapper.findAll('[aria-current="page"]')
        expect(current).toHaveLength(1)
        expect(current[0]?.element.tagName).toBe('A')

        wrapper.unmount()
    })

    it('未声明 current 时不渲染 aria-current', () => {
        const wrapper = mountBreadcrumb({}, '<CaomeiBreadcrumbItem href="/">首页</CaomeiBreadcrumbItem>')

        expect(wrapper.find('[aria-current]').exists()).toBe(false)

        wrapper.unmount()
    })
})
