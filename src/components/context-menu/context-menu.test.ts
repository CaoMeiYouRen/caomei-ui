import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ContextMenuModelItem } from './types'
import {
    CaomeiContextMenu,
    CaomeiContextMenuContent,
    CaomeiContextMenuItem,
    CaomeiContextMenuSeparator,
    CaomeiContextMenuTrigger,
} from './index'

const wrappers: ReturnType<typeof mount>[] = []

/** 宿主：以 `v-model:open` 驱动，便于断言开合与受控路径 */
function mountContextMenu(model: ContextMenuModelItem[], initialOpen = false) {
    const Host = defineComponent({
        components: {
            CaomeiContextMenu,
            CaomeiContextMenuContent,
            CaomeiContextMenuItem,
            CaomeiContextMenuSeparator,
            CaomeiContextMenuTrigger,
        },
        setup() {
            const open = ref(initialOpen)
            return { open, model }
        },
        template: `
            <CaomeiContextMenu v-model:open="open">
                <CaomeiContextMenuTrigger>
                    <div id="cm-target">目标区域</div>
                </CaomeiContextMenuTrigger>
                <CaomeiContextMenuContent :model="model" />
            </CaomeiContextMenu>
        `,
    })
    const wrapper = mount(Host, { attachTo: document.body })
    wrappers.push(wrapper)
    return wrapper
}

function panel(): HTMLElement | null {
    return document.querySelector('.caomei-context-menu__content')
}

/** 稳定刷新：右键打开涉及锚点测量与 Presence 挂载，多等几个微任务再断言 */
async function flush(): Promise<void> {
    for (let index = 0; index < 10; index++) {
        await nextTick()
    }
}

async function openMenu(): Promise<void> {
    document.querySelector('#cm-target')?.dispatchEvent(
        new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 20, clientY: 20 }),
    )
    await flush()
}

afterEach(async () => {
    // 先按 Escape 关闭仍展开的菜单，再卸载、再清空 DOM，避免 Reka 的全局指针记账渗到下一个用例
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await nextTick()
    for (const wrapper of wrappers.splice(0)) {
        wrapper.unmount()
    }
    await nextTick()
    document.body.innerHTML = ''
})

describe('CaomeiContextMenu', () => {
    it('右键目标区域打开菜单并渲染数据条目', async () => {
        mountContextMenu([
            { label: '查看详情' },
            { label: '复制链接', shortcut: '⌘C' },
            { separator: true },
            { label: '删除', danger: true },
        ])
        await nextTick()
        await openMenu()

        const items = document.querySelectorAll('.caomei-context-menu__item')
        expect(items).toHaveLength(3)
        expect(items[1]?.textContent).toContain('⌘C')
        expect(items[2]?.classList.contains('caomei-context-menu__item--danger')).toBe(true)
        expect(document.querySelector('.caomei-context-menu__separator')).not.toBeNull()
    })

    it('选中条目触发 command 并关闭菜单', async () => {
        const command = vi.fn()
        mountContextMenu([{ label: '查看详情', command }])
        await nextTick()
        await openMenu()

        document.querySelector<HTMLElement>('.caomei-context-menu__item')?.click()
        await flush()
        expect(command).toHaveBeenCalledTimes(1)
        const payload = command.mock.calls[0]?.[0] as { item: ContextMenuModelItem } | undefined
        expect(payload?.item.label).toBe('查看详情')
        expect(panel()).toBeNull()
    })

    it('禁用条目不可触发 command', async () => {
        const command = vi.fn()
        mountContextMenu([{ label: '不可用', disabled: true, command }])
        await nextTick()
        await openMenu()

        const item = document.querySelector<HTMLElement>('.caomei-context-menu__item')
        expect(item?.getAttribute('data-disabled')).not.toBeNull()
        item?.click()
        await nextTick()
        expect(command).not.toHaveBeenCalled()
    })

    it('Escape 关闭菜单', async () => {
        mountContextMenu([{ label: '一' }])
        await nextTick()
        await openMenu()

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
        await flush()
        expect(panel()).toBeNull()
    })

    it('受控 open 打开时直接渲染菜单', async () => {
        mountContextMenu([{ label: '一' }], true)
        await flush()
        expect(panel()).not.toBeNull()
    })

    it('左键点击不打开菜单', async () => {
        mountContextMenu([{ label: '一' }])
        await nextTick()

        document.querySelector<HTMLElement>('#cm-target')?.click()
        await flush()
        expect(panel()).toBeNull()
    })

    it('受控 open：Escape 只抛出 update:open，不自行关闭', async () => {
        const updates: boolean[] = []
        const Host = defineComponent({
            components: { CaomeiContextMenu, CaomeiContextMenuContent, CaomeiContextMenuTrigger },
            setup: () => ({
                open: ref(true),
                onUpdate: (value: boolean) => {
                    updates.push(value)
                },
            }),
            template: `
                <CaomeiContextMenu :open="open" @update:open="onUpdate">
                    <CaomeiContextMenuTrigger><div id="cm-target">目标</div></CaomeiContextMenuTrigger>
                    <CaomeiContextMenuContent :model="[{ label: '一' }]" />
                </CaomeiContextMenu>
            `,
        })
        const wrapper = mount(Host, { attachTo: document.body })
        wrappers.push(wrapper as unknown as ReturnType<typeof mount>)
        await flush()
        expect(panel()).not.toBeNull()

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
        await flush()

        expect(updates).toContain(false)
        expect(panel(), '受控父级未回写时应保持打开').not.toBeNull()
    })

    it('Escape 关闭后把焦点归还打开前的元素', async () => {
        const Host = defineComponent({
            components: { CaomeiContextMenu, CaomeiContextMenuContent, CaomeiContextMenuTrigger },
            setup: () => ({ open: ref(false) }),
            template: `
                <div>
                    <button id="cm-before" type="button">先聚焦</button>
                    <CaomeiContextMenu v-model:open="open">
                        <CaomeiContextMenuTrigger><div id="cm-target">目标</div></CaomeiContextMenuTrigger>
                        <CaomeiContextMenuContent :model="[{ label: '一' }]" />
                    </CaomeiContextMenu>
                </div>
            `,
        })
        const wrapper = mount(Host, { attachTo: document.body })
        wrappers.push(wrapper as unknown as ReturnType<typeof mount>)
        await nextTick()

        const before = document.querySelector<HTMLElement>('#cm-before')
        before?.focus()
        expect(document.activeElement).toBe(before)

        await openMenu()
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
        await flush()
        await new Promise((resolve) => {
            setTimeout(resolve, 10)
        })

        expect(document.activeElement, '关闭后焦点应回到打开前的元素').toBe(before)
    })

    it('展开时隔离背景，关闭后还原', async () => {
        const Host = defineComponent({
            components: { CaomeiContextMenu, CaomeiContextMenuContent, CaomeiContextMenuTrigger },
            setup: () => ({ open: ref(false) }),
            template: `
                <div>
                    <CaomeiContextMenu v-model:open="open">
                        <CaomeiContextMenuTrigger><div id="cm-target">目标</div></CaomeiContextMenuTrigger>
                        <CaomeiContextMenuContent :model="[{ label: '一' }]" />
                    </CaomeiContextMenu>
                    <div id="cm-sibling">背景</div>
                </div>
            `,
        })
        const wrapper = mount(Host, { attachTo: document.body })
        wrappers.push(wrapper as unknown as ReturnType<typeof mount>)
        await nextTick()
        await openMenu()

        const sibling = document.querySelector<HTMLElement>('#cm-sibling')
        expect(sibling?.closest('[inert]'), '展开时应隔离背景').not.toBeNull()
        expect(document.querySelector('#cm-target')?.closest('[inert]'), '触发区不应被隔离').toBeNull()

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
        await flush()
        expect(sibling?.closest('[inert]'), '关闭后应解除隔离').toBeNull()
    })
})
