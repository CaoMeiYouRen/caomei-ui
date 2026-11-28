import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { ResizeObserverStub, resetResizeObserverStub } from '../../../test/helpers/resize-observer'
import type { TreeNode } from '../tree/types'
import { CaomeiTreeVirtualizer } from './index'

/**
 * 虚拟树的行为契约。
 *
 * happy-dom 没有布局引擎：`clientHeight` 恒为 0，虚拟化器会算不出可视区间。因此用例给滚动容器
 * 覆写 `clientHeight`，并用 `ResizeObserver` 替身触发测量——这与真实浏览器里「容器有高度」等价。
 *
 * 判定：
 * - **只渲染可视区**：总节点数远大于渲染节点数，且渲染数不超过「可视行数 + overscan × 2」的上界；
 * - **高度正确**：虚拟层的 `height` = 展开节点数 × `itemHeight`（展开 / 折叠后同步变化）；
 * - 键盘导航（方向键 / 展开折叠）由真实浏览器用例覆盖（happy-dom 无 RovingFocus 布局）。
 */

const VIEWPORT_HEIGHT = 300
const ITEM_HEIGHT = 28
const OVERSCAN = 2
const WINDOW_UPPER_BOUND = Math.ceil(VIEWPORT_HEIGHT / ITEM_HEIGHT) + OVERSCAN * 2 + 2

/** 生成两层大列表：`roots` 个根节点，每个 `children` 个子节点。 */
function buildItems(roots: number, children: number): TreeNode[] {
    return Array.from({ length: roots }, (_, index) => ({
        id: `root-${index}`,
        label: `节点 ${index}`,
        children: Array.from({ length: children }, (_unused, childIndex) => ({
            id: `root-${index}-${childIndex}`,
            label: `子节点 ${index}-${childIndex}`,
        })),
    }))
}

const mountedWrappers: { unmount: () => void }[] = []

beforeEach(() => {
    resetResizeObserverStub()
    vi.stubGlobal('ResizeObserver', ResizeObserverStub)
})

afterEach(() => {
    vi.unstubAllGlobals()
    for (const wrapper of mountedWrappers.splice(0)) {
        wrapper.unmount()
    }
    document.body.innerHTML = ''
})

async function settle(): Promise<void> {
    await nextTick()
    await nextTick()
    await nextTick()
}

/** 给滚动容器一个可视高度并触发一次测量（等价于真实浏览器里的容器尺寸）。 */
async function measure(wrapper: ReturnType<typeof mount>): Promise<void> {
    const root = wrapper.find('.caomei-tree-virtualizer').element
    Object.defineProperty(root, 'clientHeight', { configurable: true, value: VIEWPORT_HEIGHT })
    Object.defineProperty(root, 'offsetHeight', { configurable: true, value: VIEWPORT_HEIGHT })
    for (const observer of ResizeObserverStub.instances) {
        observer.trigger()
    }
    await settle()
}

function mountTreeVirtualizer(items: TreeNode[], options: { expanded?: string[], onExpandedChange?: (keys: string[]) => void } = {}) {
    const expanded = ref<string[]>(options.expanded ?? [])
    const Host = defineComponent({
        setup: () => () => h(
            CaomeiTreeVirtualizer,
            {
                items,
                expanded: expanded.value,
                itemHeight: ITEM_HEIGHT,
                overscan: OVERSCAN,
                height: `${VIEWPORT_HEIGHT}px`,
                label: '虚拟树',
                'onUpdate:expanded': (keys: string[]) => {
                    expanded.value = keys
                    options.onExpandedChange?.(keys)
                },
            },
            { label: ({ item }: { item: TreeNode }) => h('span', null, String(item.label)) },
        ),
    })
    const wrapper = mount(Host, { attachTo: document.body })
    mountedWrappers.push(wrapper)
    return { wrapper, expanded }
}

describe('CaomeiTreeVirtualizer 渲染窗口', () => {
    it('大列表只渲染可视区附近的行', async () => {
        const { wrapper } = mountTreeVirtualizer(buildItems(50, 10))
        await measure(wrapper)

        const rendered = wrapper.findAll('.caomei-tree-virtualizer__item')
        expect(rendered.length, '必须真实渲染出可视行').toBeGreaterThan(0)
        expect(rendered.length, '渲染行数不得超过可视区上界').toBeLessThanOrEqual(WINDOW_UPPER_BOUND)
        // 折叠态下总节点 50 个：窗口远小于它，证明虚拟化生效
        expect(rendered.length).toBeLessThan(50)
    })

    it('虚拟层高度 = 展开节点数 × 行高（折叠态）', async () => {
        const { wrapper } = mountTreeVirtualizer(buildItems(50, 10))
        await measure(wrapper)

        const layer = wrapper.find('[data-reka-virtualizer]').element as HTMLElement
        expect(layer.style.height).toBe(`${50 * ITEM_HEIGHT}px`)
    })

    it('展开后虚拟层高度按新增可见行增长，渲染窗口仍受限', async () => {
        const { wrapper, expanded } = mountTreeVirtualizer(buildItems(50, 10))
        await measure(wrapper)

        expanded.value = ['root-0']
        await measure(wrapper)

        const layer = wrapper.find('[data-reka-virtualizer]').element as HTMLElement
        // 展开 root-0 增加 10 个子节点
        expect(layer.style.height).toBe(`${(50 + 10) * ITEM_HEIGHT}px`)
        expect(wrapper.findAll('.caomei-tree-virtualizer__item').length).toBeLessThanOrEqual(WINDOW_UPPER_BOUND)
    })

    it('折叠回去后高度回落', async () => {
        const { wrapper, expanded } = mountTreeVirtualizer(buildItems(50, 10), { expanded: ['root-0'] })
        await measure(wrapper)

        const layer = wrapper.find('[data-reka-virtualizer]').element as HTMLElement
        expect(layer.style.height).toBe(`${(50 + 10) * ITEM_HEIGHT}px`)

        expanded.value = []
        await measure(wrapper)
        expect((wrapper.find('[data-reka-virtualizer]').element as HTMLElement).style.height).toBe(`${50 * ITEM_HEIGHT}px`)
    })
})

describe('CaomeiTreeVirtualizer 选择', () => {
    it('点击节点写回选中的键（单选只保留一项）', async () => {
        const items = buildItems(3, 0)
        const selected = ref<string[]>([])
        const Host = defineComponent({
            setup: () => () => h(CaomeiTreeVirtualizer, {
                items,
                itemHeight: ITEM_HEIGHT,
                height: `${VIEWPORT_HEIGHT}px`,
                modelValue: selected.value,
                'onUpdate:modelValue': (keys: string[]) => {
                    selected.value = keys
                },
            }),
        })
        const wrapper = mount(Host, { attachTo: document.body })
        mountedWrappers.push(wrapper)
        await measure(wrapper as unknown as ReturnType<typeof mount>)

        await wrapper.findAll('.caomei-tree-virtualizer__item')[1].trigger('click')
        await settle()
        expect(selected.value).toEqual(['root-1'])

        await wrapper.findAll('.caomei-tree-virtualizer__item')[2].trigger('click')
        await settle()
        expect(selected.value, '单选覆盖前一项').toEqual(['root-2'])
    })
})
