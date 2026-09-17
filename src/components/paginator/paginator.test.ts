import { mount } from '@vue/test-utils'
import { computed, nextTick, ref } from 'vue'
import { describe, expect, it } from 'vitest'
import { caomeiLocaleKey } from '../../composables/use-locale'
import { caomeiLocales } from '../../locale'
import { CaomeiPaginator } from './index'

function getRoot(wrapper: ReturnType<typeof mount>) {
    return wrapper.get('.caomei-paginator')
}

function pageButtons(wrapper: ReturnType<typeof mount>) {
    return wrapper.findAll('.caomei-paginator__control[data-type="page"]')
}

/** 打开每页条数选择器（Reka Select 以 Enter 打开面板） */
async function openRowsPerPage(wrapper: ReturnType<typeof mount>): Promise<void> {
    await wrapper.get('.caomei-select').trigger('keydown', { key: 'Enter' })
    await nextTick()
}

/** 选中已打开面板中的第 index 个候选项（Reka SelectItem 以 pointerup 提交选中） */
async function selectRowOption(index: number): Promise<void> {
    const option = document.querySelectorAll<HTMLElement>('[role="option"]')[index]
    option.dispatchEvent(new Event('pointerup', { bubbles: true }))
    await nextTick()
    await nextTick()
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

    it('label 优先于透传的 aria-label', () => {
        const wrapper = mount(CaomeiPaginator, {
            props: { total: 50, label: '显式名' },
            attrs: { 'aria-label': '透传名' },
        })
        expect(getRoot(wrapper).attributes('aria-label')).toBe('显式名')
    })

    it('label 为空串时不输出空属性，透传值保留', () => {
        const wrapper = mount(CaomeiPaginator, {
            props: { total: 50, label: '' },
            attrs: { 'aria-label': '透传名' },
        })
        expect(getRoot(wrapper).attributes('aria-label')).toBe('透传名')
    })

    it('未提供 label 时透传 aria-label 优先于语言默认文案', () => {
        const wrapper = mount(CaomeiPaginator, {
            props: { total: 50 },
            attrs: { 'aria-label': '订单列表分页' },
        })
        expect(getRoot(wrapper).attributes('aria-label')).toBe('订单列表分页')
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

    it('内建可访问名使用注入 locale 的文案', () => {
        const wrapper = mount(CaomeiPaginator, {
            props: { total: 50, showEdges: true },
            global: {
                provide: { [caomeiLocaleKey]: computed(() => caomeiLocales['en-US']) },
            },
        })

        expect(getRoot(wrapper).attributes('aria-label')).toBe('Pagination')
        expect(wrapper.find('[aria-label="First page"]').exists()).toBe(true)
        expect(wrapper.find('[aria-label="Previous page"]').exists()).toBe(true)
        expect(wrapper.find('[aria-label="Next page"]').exists()).toBe(true)
        expect(wrapper.find('[aria-label="Last page"]').exists()).toBe(true)
        expect(pageButtons(wrapper)[0].attributes('aria-label')).toBe('Page 1')
    })

    it('注入 locale 变化时可访问名响应式更新', async () => {
        const locale = ref(caomeiLocales['zh-CN'])
        const wrapper = mount(CaomeiPaginator, {
            props: { total: 50 },
            global: {
                provide: { [caomeiLocaleKey]: computed(() => locale.value) },
            },
        })

        expect(getRoot(wrapper).attributes('aria-label')).toBe('分页')

        locale.value = caomeiLocales['en-US']
        await nextTick()

        expect(getRoot(wrapper).attributes('aria-label')).toBe('Pagination')
        expect(wrapper.find('[aria-label="Previous page"]').exists()).toBe(true)
        expect(pageButtons(wrapper)[0].attributes('aria-label')).toBe('Page 1')
    })

    it('未提供 rowsPerPageOptions 时不渲染每页条数选择器', () => {
        const wrapper = mount(CaomeiPaginator, { props: { total: 50 } })

        expect(wrapper.find('.caomei-paginator__rows-per-page').exists()).toBe(false)
    })

    it('提供 rowsPerPageOptions 时渲染选择器并显示当前每页条数', () => {
        const wrapper = mount(CaomeiPaginator, {
            props: { total: 50, itemsPerPage: 20, rowsPerPageOptions: [10, 20, 50] },
        })

        expect(wrapper.get('.caomei-paginator__rows-per-page').get('.caomei-select').text()).toBe(
            '20',
        )
    })

    it('切换每页条数时按首行偏移重新推导页码，而非无条件回到第 1 页', async () => {
        // 第 3 页 / 每页 10 → 首行偏移 20；切到每页 20 → floor(20 / 20) + 1 = 第 2 页
        const wrapper = mount(CaomeiPaginator, {
            props: { total: 100, page: 3, itemsPerPage: 10, rowsPerPageOptions: [10, 20, 50] },
            attachTo: document.body,
        })

        await openRowsPerPage(wrapper)
        await selectRowOption(1)

        expect(wrapper.emitted('update:itemsPerPage')?.at(-1)).toEqual([20])
        expect(wrapper.emitted('update:page')?.at(-1)).toEqual([2])

        wrapper.unmount()
    })

    it('首行偏移不足一页时页码回到第 1 页', async () => {
        // 首行偏移 20；切到每页 50 → floor(20 / 50) + 1 = 第 1 页
        const wrapper = mount(CaomeiPaginator, {
            props: { total: 100, page: 3, itemsPerPage: 10, rowsPerPageOptions: [10, 20, 50] },
            attachTo: document.body,
        })

        await openRowsPerPage(wrapper)
        await selectRowOption(2)

        expect(wrapper.emitted('update:itemsPerPage')?.at(-1)).toEqual([50])
        expect(wrapper.emitted('update:page')?.at(-1)).toEqual([1])

        wrapper.unmount()
    })

    it('disabled 时每页条数选择器同样禁用', () => {
        const wrapper = mount(CaomeiPaginator, {
            props: { total: 50, disabled: true, rowsPerPageOptions: [10, 20] },
        })

        expect(wrapper.get('.caomei-select').attributes('disabled')).toBeDefined()
    })

    it('每页条数选择器可访问名默认本地化，可被 rowsPerPageLabel 覆盖', () => {
        const byLocale = mount(CaomeiPaginator, {
            props: { total: 50, rowsPerPageOptions: [10, 20] },
        })
        expect(byLocale.get('.caomei-select').attributes('aria-label')).toBe('每页条数')

        const byProp = mount(CaomeiPaginator, {
            props: { total: 50, rowsPerPageOptions: [10, 20], rowsPerPageLabel: '每页显示' },
        })
        expect(byProp.get('.caomei-select').attributes('aria-label')).toBe('每页显示')
    })
})
