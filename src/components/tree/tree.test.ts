import { mount, type VueWrapper } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import { CaomeiTree } from './index'

/** 测试用节点形状（与 `TreeNode` 同形，此处内联避免类型导入触发 lint 插件的已知崩溃） */
interface Item {
    id: string
    label: string
    disabled?: boolean
    children?: Item[]
    [key: string]: unknown
}

const tree: Item[] = [
    {
        id: 'a',
        label: '基础',
        children: [
            { id: 'a-1', label: '按钮' },
            { id: 'a-2', label: '输入框', children: [{ id: 'a-2-1', label: '数字输入' }] },
        ],
    },
    { id: 'b', label: '数据展示' },
    { id: 'c', label: '禁用组', disabled: true, children: [{ id: 'c-1', label: '禁用子项' }] },
]

/** 受控宿主：同时观察 selection 与 expanded 的回写 */
function mountControlled(initial: { selected?: string[], expanded?: string[] } = {}) {
    const selected = ref<string[]>(initial.selected ?? [])
    const expanded = ref<string[]>(initial.expanded ?? [])
    const multiple = ref(false)
    const wrapper = mount({
        components: { CaomeiTree },
        setup: () => ({ tree, selected, expanded, multiple }),
        template: `<CaomeiTree v-model="selected" v-model:expanded="expanded" :items="tree" :multiple="multiple" label="组件目录" />`,
    })
    return { wrapper, selected, expanded, multiple }
}

async function flush(): Promise<void> {
    await nextTick()
    await nextTick()
}

function itemElements(wrapper: VueWrapper): Element[] {
    const root = wrapper.element as Element
    return [...root.querySelectorAll('[role="treeitem"]')]
}

function itemByText(wrapper: VueWrapper, text: string): HTMLElement {
    const element = itemElements(wrapper).find((node) => node.textContent?.trim() === text)
    if (!element) {
        throw new Error(`找不到节点：${text}`)
    }
    return element as HTMLElement
}

describe('CaomeiTree', () => {
    it('依赖的 Reka Tree primitive 契约仍在位（升级回归）', async () => {
        const { TreeItem, TreeRoot } = await import('reka-ui')
        const rootProps = Object.keys((TreeRoot as unknown as { props?: Record<string, unknown> }).props ?? {})
        const itemProps = Object.keys((TreeItem as unknown as { props?: Record<string, unknown> }).props ?? {})

        // 本封装依赖的入参面：根需 items / getKey / expanded / modelValue，条目需 value / level
        expect(rootProps).toEqual(expect.arrayContaining(['items', 'getKey', 'expanded', 'modelValue']))
        expect(itemProps).toEqual(expect.arrayContaining(['value', 'level']))
    })

    it('渲染 tree 角色、层级、可访问名与初始收起态', () => {
        const wrapper = mount(CaomeiTree, { props: { items: tree, label: '组件目录' } })
        const root = wrapper.element as HTMLElement

        expect(root.tagName).toBe('UL')
        expect(root.getAttribute('role')).toBe('tree')
        expect(root.getAttribute('aria-label')).toBe('组件目录')
        // 收起态只渲染根级三项
        expect(itemElements(wrapper)).toHaveLength(3)
        const first = itemByText(wrapper, '基础')
        expect(first.getAttribute('aria-level')).toBe('1')
        expect(first.getAttribute('aria-expanded')).toBe('false')
        expect(first.getAttribute('aria-setsize')).toBe('3')
        expect(first.getAttribute('aria-posinset')).toBe('1')
    })

    it('展开父节点后渲染子层级并维护 aria-level / aria-expanded', async () => {
        const { wrapper, expanded } = mountControlled({ expanded: ['a'] })
        await flush()

        const parent = itemByText(wrapper, '基础')
        expect(parent.getAttribute('aria-expanded')).toBe('true')
        const children = itemElements(wrapper).filter((node) => node.getAttribute('aria-level') === '2')
        expect(children).toHaveLength(2)
        expect(expanded.value).toEqual(['a'])
    })

    it('单选：点击后回写单个键，再点其它节点替换选择', async () => {
        const { wrapper, selected } = mountControlled()
        itemByText(wrapper, '数据展示').click()
        await flush()

        expect(selected.value).toEqual(['b'])
        expect(itemByText(wrapper, '数据展示').getAttribute('aria-selected')).toBe('true')

        itemByText(wrapper, '基础').click()
        await flush()
        expect(selected.value).toEqual(['a'])
        expect(itemByText(wrapper, '数据展示').getAttribute('aria-selected')).toBe('false')

        // 再点已选节点：单选 toggle 到空（primitive 回写 undefined）
        itemByText(wrapper, '基础').click()
        await flush()
        expect(selected.value).toEqual([])
        expect(itemByText(wrapper, '基础').getAttribute('aria-selected')).toBe('false')
    })

    it('多选：累加与取消选择', async () => {
        const { wrapper, selected, multiple } = mountControlled({ selected: ['a'] })
        multiple.value = true
        await flush()

        itemByText(wrapper, '数据展示').click()
        await flush()
        expect(selected.value).toEqual(['a', 'b'])

        itemByText(wrapper, '数据展示').click()
        await flush()
        expect(selected.value).toEqual(['a'])
    })

    it('禁用节点不可选中，也不触发展开', async () => {
        const { wrapper, selected, expanded } = mountControlled()
        const disabled = itemByText(wrapper, '禁用组')

        expect(disabled.getAttribute('aria-disabled')).toBe('true')
        disabled.click()
        await flush()
        expect(selected.value).toEqual([])
        expect(expanded.value).toEqual([])
    })

    it('受控回写：父级改 selection / expanded 后渲染跟随', async () => {
        const { wrapper, selected, expanded } = mountControlled()
        selected.value = ['a-1']
        expanded.value = ['a']
        await flush()

        expect(itemByText(wrapper, '按钮').getAttribute('aria-selected')).toBe('true')
        expect(itemElements(wrapper)).toHaveLength(5)
    })

    it('非受控：未绑定 v-model 时自持展开态并按 defaultExpanded 初始化', async () => {
        const wrapper = mount(CaomeiTree, { props: { items: tree, defaultExpanded: ['a'] } })
        await flush()

        expect(itemByText(wrapper, '基础').getAttribute('aria-expanded')).toBe('true')
        itemByText(wrapper, '输入框').click()
        await flush()
        expect(itemByText(wrapper, '输入框').getAttribute('aria-expanded')).toBe('true')
    })

    it('label 插槽拿到节点上下文并按自定义内容渲染', () => {
        const wrapper = mount(CaomeiTree, {
            props: { items: tree },
            slots: {
                label: `<template #label="{ item, level }"><b data-level="">{{ level }}</b>:{{ item.label }}</template>`,
            },
        })

        const first = itemByText(wrapper, '1:基础')
        expect(first.querySelector('b')?.textContent).toBe('1')
    })

    it('itemKey / labelKey / childrenKey 可改名', () => {
        const custom = [{ key: 'x', name: '自定义', nodes: [{ key: 'x-1', name: '子项' }] }]
        const wrapper = mount(CaomeiTree, {
            props: {
                items: custom,
                itemKey: 'key',
                labelKey: 'name',
                childrenKey: 'nodes',
                defaultExpanded: ['x'],
            },
        })

        expect(itemByText(wrapper, '自定义')).toBeTruthy()
        expect(itemByText(wrapper, '子项').getAttribute('aria-level')).toBe('2')
    })

    it('空 children 不渲染为「可展开但为空」的节点', () => {
        const wrapper = mount(CaomeiTree, { props: { items: [{ id: 'empty', label: '空组', children: [] }, { id: 'b', label: '数据展示' }] } })
        const empty = itemByText(wrapper, '空组')

        expect(empty.getAttribute('aria-expanded')).toBeNull()
        expect(empty.querySelector('.caomei-tree__toggle svg')).toBeNull()
    })

    it('单选模式只采用首个键，避免多键输入让槽与 aria 不一致', () => {
        const wrapper = mount(CaomeiTree, { props: { items: tree, modelValue: ['a', 'b'] } })
        const selected = itemElements(wrapper).filter((node) => node.getAttribute('aria-selected') === 'true')

        expect(selected).toHaveLength(1)
        expect(selected[0]?.textContent?.trim()).toBe('基础')
    })

    it('节点缺少键时输出开发期告警', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
        mount(CaomeiTree, { props: { items: [{ label: '无键节点' }] } })

        expect(warn).toHaveBeenCalledWith(expect.stringContaining('节点缺少键'))
        warn.mockRestore()
    })

    it('空树不渲染任何节点，也不报错', () => {
        const wrapper = mount(CaomeiTree, { props: { items: [] } })
        expect((wrapper.element as Element).getAttribute('role')).toBe('tree')
        expect(itemElements(wrapper)).toHaveLength(0)
    })

    it('全禁用树：无节点可选中', async () => {
        const disabledTree = tree.map((item) => ({ ...item, disabled: true }))
        const wrapper = mount(CaomeiTree, { props: { items: disabledTree } })

        for (const node of itemElements(wrapper)) {
            expect(node.getAttribute('aria-disabled')).toBe('true')
        }
        itemByText(wrapper, '基础').click()
        await flush()
        expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    })

    it('整体 disabled 时节点均标记禁用', () => {
        const wrapper = mount(CaomeiTree, { props: { items: tree, disabled: true } })
        expect(itemElements(wrapper).every((node) => node.getAttribute('aria-disabled') === 'true')).toBe(true)
    })
})
