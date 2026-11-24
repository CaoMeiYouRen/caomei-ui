import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { CaomeiTreeSelect } from './index'

interface Item {
    id: string
    label: string
    disabled?: boolean
    children?: Item[]
    [key: string]: unknown
}

const tree: Item[] = [
    { id: 'basic', label: '基础', children: [{ id: 'button', label: '按钮' }, { id: 'input', label: '输入框' }] },
    { id: 'display', label: '数据展示' },
    { id: 'off', label: '停用项', disabled: true },
]

async function flush(): Promise<void> {
    await nextTick()
    await nextTick()
}

function field(): HTMLButtonElement {
    return document.querySelector('.caomei-tree-select__field') as HTMLButtonElement
}

function panel(): HTMLElement | null {
    return document.querySelector('.caomei-tree-select__panel')
}

function clearButton(): HTMLButtonElement | null {
    return document.querySelector('.caomei-tree-select__clear')
}

function itemByText(text: string): HTMLElement {
    const element = [...document.querySelectorAll<HTMLElement>('[role="treeitem"]')]
        .find((node) => node.textContent?.trim() === text)
    if (!element) {
        throw new Error(`找不到节点：${text}`)
    }
    return element
}

const mounted: ReturnType<typeof mount>[] = []

function mountSelect(props: Record<string, unknown> = {}) {
    const wrapper = mount(CaomeiTreeSelect, {
        props: { items: tree, label: '所属模块', ...props },
        attachTo: document.body,
    })
    mounted.push(wrapper)
    return wrapper
}

afterEach(() => {
    for (const wrapper of mounted.splice(0)) {
        wrapper.unmount()
    }
    document.body.innerHTML = ''
})

describe('CaomeiTreeSelect', () => {
    it('默认显示占位文案，字段为原生 button 且带可访问名', () => {
        mountSelect({ placeholder: '请选择模块' })

        expect(field().textContent).toContain('请选择模块')
        expect(field().getAttribute('aria-label')).toBe('所属模块')
        expect(field().type).toBe('button')
        expect(panel()).toBeNull()
    })

    it('点击展开面板并渲染树；选中后回显并收起（单选）', async () => {
        const wrapper = mountSelect()
        field().click()
        await flush()

        expect(panel()).not.toBeNull()
        expect(itemByText('基础')).toBeTruthy()

        itemByText('基础').click()
        await flush()

        expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual(['basic'])
        expect(field().textContent).toContain('基础')
        // 单选选中后收起面板
        expect(panel()).toBeNull()
    })

    it('受控回显：多选按逗号拼接已选标签', async () => {
        mountSelect({ multiple: true, modelValue: ['button', 'display'] })
        await flush()

        expect(field().textContent).toContain('按钮, 数据展示')
    })

    it('多选：选中后面板保持展开', async () => {
        const wrapper = mountSelect({ multiple: true, modelValue: [] })
        field().click()
        await flush()

        itemByText('数据展示').click()
        await flush()

        expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual(['display'])
        expect(panel()).not.toBeNull()
    })

    it('清空按钮仅在 clearable 且有值时出现，点击回写空数组', async () => {
        const wrapper = mountSelect({ clearable: true, modelValue: ['display'] })
        await flush()

        expect(clearButton()).not.toBeNull()
        expect(clearButton()?.getAttribute('aria-label')).toBe('清除')

        clearButton()?.click()
        await flush()
        expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual([])
    })

    it('非受控：先选中再清空，回显回到占位且按钮消失', async () => {
        mountSelect({ clearable: true, placeholder: '请选择模块' })
        field().click()
        await flush()
        itemByText('数据展示').click()
        await flush()
        expect(field().textContent).toContain('数据展示')

        clearButton()?.click()
        await flush()
        expect(field().textContent).toContain('请选择模块')
        expect(clearButton()).toBeNull()
    })

    it('禁用时即使有值也不渲染清空按钮', () => {
        mountSelect({ clearable: true, disabled: true, modelValue: ['display'] })
        expect(clearButton()).toBeNull()
    })

    it('未开启 clearable 时不渲染清空按钮', async () => {
        mountSelect({ modelValue: ['display'] })
        await flush()
        expect(clearButton()).toBeNull()
    })

    it('禁用时字段禁用且不展开面板', async () => {
        mountSelect({ disabled: true })
        await flush()

        expect(field().disabled).toBe(true)
        field().click()
        await flush()
        expect(panel()).toBeNull()
    })

    it('空数据渲染空态文案', async () => {
        mountSelect({ items: [], emptyText: '暂无节点' })
        field().click()
        await flush()

        expect(panel()?.textContent).toContain('暂无节点')
    })

    it('itemKey / labelKey / childrenKey 可改名', async () => {
        const custom = [{ key: 'a', name: '自定义', nodes: [{ key: 'a-1', name: '子项' }] }]
        const wrapper = mount(CaomeiTreeSelect, {
            props: {
                items: custom,
                itemKey: 'key',
                labelKey: 'name',
                childrenKey: 'nodes',
                modelValue: ['a-1'],
            },
            attachTo: document.body,
        })
        mounted.push(wrapper)
        await flush()

        expect(field().textContent).toContain('子项')
    })
})
