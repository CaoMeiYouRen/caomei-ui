import { mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, type DefineComponent } from 'vue'
import { resetResizeObserverStub, ResizeObserverStub, setElementMetrics } from '../../../test/helpers/resize-observer'
import { CaomeiBreadcrumb, CaomeiBreadcrumbItem } from '../breadcrumb'
import { CaomeiDataTable } from '../data-table'
import type { DataTableColumn, DataTableProps } from '../data-table/types'
import { CaomeiMenu, CaomeiMenuItem, CaomeiSubMenu } from '../menu'
import { CaomeiTag } from '../tag'
import { CaomeiTooltipProvider } from './index'

/**
 * 长文本溢出面的集成用例（Tag / Breadcrumb / Menu / DataTable）。
 *
 * 四个面都复用 `CaomeiTooltipText` 的 `auto` 模式：**溢出才挂提示**。几何读数由
 * ResizeObserver 桩驱动（happy-dom 无布局引擎）；「未溢出静默」以「无面板 + 无 `aria-describedby`」
 * 判定——面板经 Presence 卸载，只看面板查不出「已挂载未打开」。真实截断外观由真实浏览器探针承载。
 *
 * 提示触发器的落点是**不可聚焦的文本盒**：指针悬停是唯一交互路径，宿主元素（链接 / 菜单项）获得
 * 焦点不会弹出提示。用例因此用 `pointermove` 打开，并单独断言宿主聚焦不打开。
 */
const mounted: VueWrapper[] = []

const LONG = '超长文本用于验证截断与悬停提示是否生效的示例内容'

function mountIn(render: () => unknown): VueWrapper {
    const wrapper = mount(defineComponent({
        render: () => h(CaomeiTooltipProvider, { delayDuration: 0 }, { default: render }),
    }), { attachTo: document.body }) as VueWrapper
    mounted.push(wrapper)
    return wrapper
}

/** 覆写几何读数并驱动已登记的观察者（各面的文本元素各自建一个观察者） */
function markOverflowing(element: Element | null, overflowing: boolean): void {
    if (!element) {
        throw new Error('未渲染文本元素')
    }
    setElementMetrics(element, overflowing ? 320 : 120, 120)
    for (const observer of ResizeObserverStub.instances) {
        observer.trigger()
    }
}

/** 提示面板的可访问描述元素：面板里还有一份同文的隐藏描述，取该节点避免重复计数 */
function panelText(): string | null {
    return document.querySelector('.caomei-tooltip__content [role="tooltip"]')?.textContent?.trim() ?? null
}

/** 指针进入触发器即打开（Provider 延迟已归零） */
async function openByPointer(element: Element): Promise<void> {
    element.dispatchEvent(new MouseEvent('pointermove', { bubbles: true }))
    await vi.waitFor(() => {
        expect(document.querySelector('.caomei-tooltip__content[data-state*="open"]')).not.toBeNull()
    })
}

/** 菜单树的构造放在顶层：`it` 内再套三层 `h` 回调会越过 lint 的嵌套上限 */
function plainMenuTree(): ReturnType<typeof h> {
    return h(CaomeiMenu, {}, { default: () => [h(CaomeiMenuItem, {}, { default: () => LONG })] })
}

function subMenuTree(): ReturnType<typeof h> {
    return h(CaomeiMenu, {}, {
        default: () => [
            h(CaomeiSubMenu, { label: LONG }, {
                default: () => [h(CaomeiMenuItem, {}, { default: () => '子项' })],
            }),
        ],
    })
}

beforeEach(() => {
    resetResizeObserverStub()
    vi.stubGlobal('ResizeObserver', ResizeObserverStub)
})

afterEach(() => {
    while (mounted.length > 0) {
        mounted.pop()?.unmount()
    }
    document.body.innerHTML = ''
    vi.unstubAllGlobals()
})

describe('长文本溢出提示：Tag', () => {
    it('未溢出时不挂载提示，溢出后悬停显示全文', async () => {
        mountIn(() => h(CaomeiTag, {}, () => LONG))
        await nextTick()

        const label = document.querySelector('.caomei-tag__label') as HTMLElement
        expect(label.classList.contains('caomei-tooltip-text')).toBe(true)

        markOverflowing(label, false)
        await nextTick()
        await openByPointer(label).catch(() => undefined)
        expect(panelText()).toBeNull()
        expect(label.hasAttribute('aria-describedby')).toBe(false)

        markOverflowing(label, true)
        await nextTick()
        await openByPointer(label)
        expect(panelText()).toBe(LONG)
        expect(label.getAttribute('aria-describedby')).not.toBeNull()
    })

    it('可关闭标签的关闭按钮可访问名不受影响', async () => {
        mountIn(() => h(CaomeiTag, { closable: true }, () => LONG))
        await nextTick()

        const close = document.querySelector('.caomei-tag__close') as HTMLElement
        expect(close.getAttribute('aria-label')).toBe('删除')
    })
})

describe('长文本溢出提示：Breadcrumb', () => {
    it('链接项与文本项各自按溢出挂载提示', async () => {
        mountIn(() => h(CaomeiBreadcrumb, {}, {
            default: () => [
                h(CaomeiBreadcrumbItem, { href: '#a' }, () => LONG),
                h(CaomeiBreadcrumbItem, { current: true }, () => LONG),
            ],
        }))
        await nextTick()

        const labels = Array.from(document.querySelectorAll('.caomei-breadcrumb__label'))
        expect(labels).toHaveLength(2)
        for (const label of labels) {
            expect(label.classList.contains('caomei-tooltip-text')).toBe(true)
            markOverflowing(label, true)
        }
        await nextTick()

        await openByPointer(labels[0])
        expect(panelText()).toBe(LONG)

        await openByPointer(labels[1])
        expect(panelText()).toBe(LONG)
    })

    it('未溢出时静默，且宿主链接获得焦点不打开提示', async () => {
        mountIn(() => h(CaomeiBreadcrumb, {}, {
            default: () => [h(CaomeiBreadcrumbItem, { href: '#a' }, () => LONG)],
        }))
        await nextTick()

        const label = document.querySelector('.caomei-breadcrumb__label') as HTMLElement
        const link = document.querySelector('.caomei-breadcrumb__link') as HTMLElement
        markOverflowing(label, false)
        await nextTick()

        link.focus()
        await nextTick()
        expect(panelText()).toBeNull()
        expect(label.hasAttribute('aria-describedby')).toBe(false)
    })

    it('链接项的可访问名保持为可见文本', async () => {
        mountIn(() => h(CaomeiBreadcrumb, {}, {
            default: () => [h(CaomeiBreadcrumbItem, { href: '#a', current: true }, () => '首页')],
        }))
        await nextTick()

        const link = document.querySelector('.caomei-breadcrumb__link') as HTMLElement
        expect(link.getAttribute('aria-current')).toBe('page')
        expect(link.querySelector('.caomei-tooltip-text')?.textContent).toBe('首页')
    })
})

describe('长文本溢出提示：Menu', () => {
    it('普通项溢出时显示全文，未溢出时静默', async () => {
        mountIn(plainMenuTree)
        await nextTick()

        const text = document.querySelector('.caomei-menu__item-text') as HTMLElement
        expect(text.classList.contains('caomei-tooltip-text')).toBe(true)

        markOverflowing(text, false)
        await nextTick()
        expect(text.hasAttribute('aria-describedby')).toBe(false)
        expect(panelText()).toBeNull()

        markOverflowing(text, true)
        await nextTick()
        await openByPointer(text)
        expect(panelText()).toBe(LONG)
    })

    it('子菜单触发器标签溢出时显示全文，指示器仍为装饰', async () => {
        mountIn(subMenuTree)
        await nextTick()

        const text = document.querySelector('.caomei-menu__submenu-trigger .caomei-menu__item-text') as HTMLElement
        expect(text.textContent?.trim()).toBe(LONG)

        markOverflowing(text, true)
        await nextTick()
        await openByPointer(text)
        expect(panelText()).toBe(LONG)

        const indicator = document.querySelector('.caomei-menu__submenu-indicator') as Element
        expect(indicator.getAttribute('aria-hidden')).toBe('true')
    })
})

describe('长文本溢出提示：DataTable', () => {
    interface Row {
        name: string
    }

    /** VTU 无法从 props 推断泛型组件参数，测试内具体化行类型 */
    const DataTable = CaomeiDataTable as unknown as DefineComponent<DataTableProps<Row>>
    const data: Row[] = [{ name: LONG }]

    function columnsWith(width?: string): DataTableColumn<Row>[] {
        return [{ key: 'name', header: LONG, width }]
    }

    it('绝对长度列宽：表头与默认单元格按溢出挂载提示', async () => {
        mountIn(() => h(DataTable, { columns: columnsWith('120px'), data, rowKey: 'name' }))
        await nextTick()

        const header = document.querySelector('thead .caomei-data-table__text') as HTMLElement
        const cell = document.querySelector('tbody .caomei-data-table__text') as HTMLElement
        expect(header.classList.contains('caomei-data-table__text--truncate')).toBe(true)
        expect(cell.classList.contains('caomei-data-table__text--truncate')).toBe(true)

        markOverflowing(header, false)
        await nextTick()
        expect(header.hasAttribute('aria-describedby')).toBe(false)

        markOverflowing(header, true)
        await nextTick()
        await openByPointer(header)
        expect(panelText()).toBe(LONG)

        markOverflowing(cell, true)
        await nextTick()
        await openByPointer(cell)
        expect(panelText()).toBe(LONG)
    })

    it('百分比与关键字列宽不加截断配方：短文本不会被误截断', async () => {
        mountIn(() => h(DataTable, { columns: columnsWith('20%'), data, rowKey: 'name' }))
        await nextTick()

        const header = document.querySelector('thead .caomei-data-table__text') as HTMLElement
        const cell = document.querySelector('tbody .caomei-data-table__text') as HTMLElement
        for (const element of [header, cell]) {
            expect(element.classList.contains('caomei-data-table__text--truncate')).toBe(false)
            expect(element.style.maxWidth).toBe('')
            expect(element.hasAttribute('aria-describedby')).toBe(false)
        }
    })

    it('未设列宽的默认单元格保持既有换行行为，不挂截断配方', async () => {
        mountIn(() => h(DataTable, { columns: columnsWith(), data, rowKey: 'name' }))
        await nextTick()

        const cell = document.querySelector('tbody .caomei-data-table__text') as HTMLElement
        expect(cell.classList.contains('caomei-data-table__text--truncate')).toBe(false)
        expect(cell.textContent).toBe(LONG)
        expect(cell.hasAttribute('aria-describedby')).toBe(false)
    })

    it('自定义 cell 渲染结果不包裹提示接线', async () => {
        mountIn(() => h(DataTable, {
            columns: [{ key: 'name', header: '名称', cell: () => h('strong', LONG) }],
            data,
            rowKey: 'name',
        }))
        await nextTick()

        const strong = document.querySelector('tbody strong')
        expect(strong?.textContent).toBe(LONG)
        expect(strong?.classList.contains('caomei-tooltip-text')).toBe(false)
        expect(strong?.querySelector('.caomei-tooltip-text')).toBeNull()
    })
})
