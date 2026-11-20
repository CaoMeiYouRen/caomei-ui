import { mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { CaomeiActionSheet } from './index'

const mounted: VueWrapper[] = []

function mountTracked(component: Parameters<typeof mount>[0], options?: Parameters<typeof mount>[1]): VueWrapper {
    const wrapper = mount(component, options) as VueWrapper
    mounted.push(wrapper)
    return wrapper
}

function sheet(): HTMLElement | null {
    return document.querySelector('.caomei-action-sheet')
}

afterEach(() => {
    while (mounted.length > 0) {
        mounted.pop()?.unmount()
    }
    document.body.innerHTML = ''
})

const groups = [
    {
        label: '文件',
        items: [
            { label: '重命名', value: 'rename' },
            { label: '删除', value: 'delete', danger: true, description: '不可撤销' },
        ],
    },
]

describe('CaomeiActionSheet', () => {
    it('打开时以底部抽屉渲染标题、说明与分组条目', async () => {
        mountTracked(CaomeiActionSheet, {
            props: {
                open: true,
                title: '更多操作',
                description: '请选择',
                groups,
            },
        })
        await nextTick()

        const panel = sheet()
        expect(panel).not.toBeNull()
        expect(panel?.classList.contains('caomei-drawer__content'), '动作面板类名必须落在 Drawer 的面板根元素上').toBe(true)
        expect(panel?.getAttribute('data-position')).toBe('bottom')
        expect(panel?.textContent).toContain('更多操作')
        expect(panel?.textContent).toContain('请选择')
        expect(panel?.textContent).toContain('文件')
        expect(panel?.querySelectorAll('.caomei-action-sheet__item')).toHaveLength(2)
    })

    it('危险项带危险样式类，说明渲染在条目内', async () => {
        mountTracked(CaomeiActionSheet, { props: { open: true, groups } })
        await nextTick()

        const items = document.querySelectorAll('.caomei-action-sheet__item')
        expect(items[1].classList.contains('caomei-action-sheet__item--danger')).toBe(true)
        expect(items[1].textContent).toContain('不可撤销')
    })

    it('选择条目后抛出 select 并关闭面板', async () => {
        const wrapper = mountTracked(CaomeiActionSheet, { props: { open: true, groups } })
        await nextTick()

        const item = document.querySelector<HTMLButtonElement>('.caomei-action-sheet__item')
        item?.click()
        await nextTick()

        expect(wrapper.emitted('select')?.[0]).toEqual(['rename', groups[0].items[0]])
        expect(wrapper.emitted('update:open')?.at(-1)).toEqual([false])
    })

    it('closeOnSelect=false 时选择后保持打开', async () => {
        const wrapper = mountTracked(CaomeiActionSheet, {
            props: { open: true, groups, closeOnSelect: false },
        })
        await nextTick()

        document.querySelector<HTMLButtonElement>('.caomei-action-sheet__item')?.click()
        await nextTick()

        expect(wrapper.emitted('select')).toHaveLength(1)
        expect(wrapper.emitted('update:open')).toBeUndefined()
    })

    it('禁用条目不抛出 select', async () => {
        const wrapper = mountTracked(CaomeiActionSheet, {
            props: {
                open: true,
                groups: [{ items: [{ label: '不可用', value: 'x', disabled: true }] }],
            },
        })
        await nextTick()

        const item = document.querySelector<HTMLButtonElement>('.caomei-action-sheet__item')
        expect(item?.disabled).toBe(true)
        item?.click()
        await nextTick()

        expect(wrapper.emitted('select')).toBeUndefined()
    })

    it('取消项使用语言兜底文案并关闭面板', async () => {
        const wrapper = mountTracked(CaomeiActionSheet, { props: { open: true, groups } })
        await nextTick()

        const cancel = document.querySelector<HTMLButtonElement>('.caomei-action-sheet__cancel')
        expect(cancel?.textContent?.trim()).toBe('取消')
        cancel?.click()
        await nextTick()

        expect(wrapper.emitted('cancel')).toHaveLength(1)
        expect(wrapper.emitted('update:open')?.at(-1)).toEqual([false])
    })

    it('cancelLabel 覆盖取消项文案', async () => {
        mountTracked(CaomeiActionSheet, {
            props: { open: true, groups, cancelLabel: '关闭' },
        })
        await nextTick()

        expect(document.querySelector('.caomei-action-sheet__cancel')?.textContent?.trim()).toBe('关闭')
    })

    it('默认插槽替换分组内容', async () => {
        mountTracked(CaomeiActionSheet, {
            props: { open: true, groups },
            slots: { default: '<div data-test="custom">自定义内容</div>' },
        })
        await nextTick()

        expect(document.querySelector('[data-test="custom"]')).not.toBeNull()
        expect(document.querySelectorAll('.caomei-action-sheet__item')).toHaveLength(0)
    })

    it('无标题与说明时头部不占布局但保留可访问名', async () => {
        mountTracked(CaomeiActionSheet, { props: { open: true, groups } })
        await nextTick()

        const panel = sheet()
        expect(panel?.classList.contains('caomei-action-sheet--headerless')).toBe(true)
        const labelledby = panel?.getAttribute('aria-labelledby')
        expect(document.getElementById(labelledby as string)?.textContent).toBe('操作面板')
    })
})
