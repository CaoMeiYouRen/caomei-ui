import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { CaomeiPaginator } from './index'

function getRoot(wrapper: ReturnType<typeof mount>) {
    return wrapper.get('.caomei-paginator')
}

function pageButtons(wrapper: ReturnType<typeof mount>) {
    return wrapper.findAll('.caomei-paginator__control[data-type="page"]')
}

describe('CaomeiPaginator', () => {
    it('默认渲染页码与翻页按钮', () => {
        const wrapper = mount(CaomeiPaginator, { props: { total: 50, itemsPerPage: 10 } })

        expect(getRoot(wrapper).element.tagName).toBe('NAV')
        expect(pageButtons(wrapper).map((button) => button.text())).toEqual([
            '1',
            '2',
            '3',
            '4',
            '5',
        ])
        expect(wrapper.find('[aria-label="上一页"]').exists()).toBe(true)
        expect(wrapper.find('[aria-label="下一页"]').exists()).toBe(true)
    })

    it('根节点默认提供可访问名，label 可覆盖', () => {
        const wrapper = mount(CaomeiPaginator, { props: { total: 50 } })
        expect(getRoot(wrapper).attributes('aria-label')).toBe('分页')

        const custom = mount(CaomeiPaginator, { props: { total: 50, label: '结果分页' } })
        expect(getRoot(custom).attributes('aria-label')).toBe('结果分页')
    })

    it('itemsPerPage 缺省为 10', () => {
        const wrapper = mount(CaomeiPaginator, { props: { total: 25 } })

        expect(pageButtons(wrapper).map((button) => button.text())).toEqual(['1', '2', '3'])
    })

    it('当前页标记 data-selected 与 aria-current', () => {
        const wrapper = mount(CaomeiPaginator, {
            props: { total: 50, itemsPerPage: 10, page: 2 },
        })

        const current = wrapper.get('.caomei-paginator__control[data-selected="true"]')
        expect(current.text()).toBe('2')
        expect(current.attributes('aria-current')).toBe('page')
    })

    it('点击页码抛出 update:page', async () => {
        const wrapper = mount(CaomeiPaginator, {
            props: { total: 50, itemsPerPage: 10, page: 1 },
        })

        await pageButtons(wrapper)[2].trigger('click')

        expect(wrapper.emitted('update:page')?.[0]).toEqual([3])
    })

    it('首页时上一页禁用，末页时下一页禁用', () => {
        const first = mount(CaomeiPaginator, { props: { total: 20, itemsPerPage: 10, page: 1 } })
        expect(first.get('[aria-label="上一页"]').attributes('disabled')).toBeDefined()
        expect(first.get('[aria-label="下一页"]').attributes('disabled')).toBeUndefined()

        const last = mount(CaomeiPaginator, { props: { total: 20, itemsPerPage: 10, page: 2 } })
        expect(last.get('[aria-label="下一页"]').attributes('disabled')).toBeDefined()
    })

    it('showEdges 渲染首页 / 末页按钮', () => {
        const wrapper = mount(CaomeiPaginator, {
            props: { total: 100, itemsPerPage: 10, showEdges: true },
        })

        expect(wrapper.find('[aria-label="首页"]').exists()).toBe(true)
        expect(wrapper.find('[aria-label="末页"]').exists()).toBe(true)
    })

    it('showEdges 且页数较多时渲染省略号', () => {
        const wrapper = mount(CaomeiPaginator, {
            props: { total: 100, itemsPerPage: 10, page: 6, showEdges: true },
        })

        expect(wrapper.find('.caomei-paginator__ellipsis').exists()).toBe(true)
    })

    it('未开启 showEdges 时不渲染首页 / 末页与省略号', () => {
        const wrapper = mount(CaomeiPaginator, {
            props: { total: 100, itemsPerPage: 10, page: 6 },
        })

        expect(wrapper.find('[aria-label="首页"]').exists()).toBe(false)
        expect(wrapper.find('[aria-label="末页"]').exists()).toBe(false)
        expect(wrapper.find('.caomei-paginator__ellipsis').exists()).toBe(false)
    })

    it('siblingCount 控制当前页两侧页码数量', () => {
        const wrapper = mount(CaomeiPaginator, {
            props: { total: 100, itemsPerPage: 10, page: 6, siblingCount: 1 },
        })

        expect(pageButtons(wrapper).map((button) => button.text())).toEqual(['5', '6', '7'])
    })

    it('受控页码更新后同步选中态', async () => {
        const wrapper = mount(CaomeiPaginator, {
            props: { total: 50, itemsPerPage: 10, page: 1 },
        })

        await wrapper.setProps({ page: 3 })

        expect(wrapper.get('.caomei-paginator__control[data-selected="true"]').text()).toBe('3')
    })

    it('页码可访问名使用模板', () => {
        const wrapper = mount(CaomeiPaginator, { props: { total: 50, itemsPerPage: 10 } })

        expect(pageButtons(wrapper)[0].attributes('aria-label')).toBe('第 1 页')
    })

    it('pageLabel 模板可覆盖', () => {
        const wrapper = mount(CaomeiPaginator, {
            props: { total: 50, itemsPerPage: 10, pageLabel: 'Go to {page}' },
        })

        expect(pageButtons(wrapper)[2].attributes('aria-label')).toBe('Go to 3')
    })

    it('翻页按钮可访问名可覆盖', () => {
        const wrapper = mount(CaomeiPaginator, {
            props: {
                total: 50,
                itemsPerPage: 10,
                previousLabel: 'Prev',
                nextLabel: 'Next',
            },
        })

        expect(wrapper.find('[aria-label="上一页"]').exists()).toBe(false)
        expect(wrapper.find('[aria-label="Prev"]').exists()).toBe(true)
        expect(wrapper.find('[aria-label="Next"]').exists()).toBe(true)
    })

    it('没有上一页时点击不抛出 update:page', async () => {
        const wrapper = mount(CaomeiPaginator, {
            props: { total: 20, itemsPerPage: 10, page: 1 },
        })

        await wrapper.get('[aria-label="上一页"]').trigger('click')

        expect(wrapper.emitted('update:page')).toBeUndefined()
    })

    it('disabled 时全部控件禁用且点击不切换', async () => {
        const wrapper = mount(CaomeiPaginator, {
            props: { total: 50, itemsPerPage: 10, disabled: true },
        })

        expect(wrapper.find('[aria-label="下一页"]').attributes('disabled')).toBeDefined()

        await pageButtons(wrapper)[1].trigger('click')

        expect(wrapper.emitted('update:page')).toBeUndefined()
    })

    it('total 为 0 时仅渲染第 1 页且翻页禁用', () => {
        const wrapper = mount(CaomeiPaginator, { props: { total: 0 } })

        expect(pageButtons(wrapper).map((button) => button.text())).toEqual(['1'])
        expect(wrapper.get('[aria-label="上一页"]').attributes('disabled')).toBeDefined()
        expect(wrapper.get('[aria-label="下一页"]').attributes('disabled')).toBeDefined()
    })

    it('class 与其余属性透传到根元素', () => {
        const wrapper = mount(CaomeiPaginator, {
            props: { total: 50 },
            attrs: { class: 'custom', 'data-test': 'paginator' },
        })

        const root = getRoot(wrapper)
        expect(root.classes()).toContain('custom')
        expect(root.attributes('data-test')).toBe('paginator')
    })
})
