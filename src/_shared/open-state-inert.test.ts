import { afterEach, describe, expect, it } from 'vitest'
import { suppressOutside } from './open-state-inert'

afterEach(() => {
    document.body.innerHTML = ''
})

/** 还原 `body` 下的固定结构：外层兄弟 + 带 context 的浮层宿主 */
function buildTree(): { outside: HTMLElement, context: HTMLElement, floating: HTMLElement } {
    document.body.innerHTML = ''
    const outside = document.createElement('div')
    outside.id = 'outside'
    const button = document.createElement('button')
    button.textContent = '背景按钮'
    outside.append(button)

    const context = document.createElement('div')
    context.id = 'context'
    const floating = document.createElement('div')
    floating.id = 'floating'
    const item = document.createElement('button')
    item.textContent = '浮层选项'
    floating.append(item)
    context.append(floating)

    document.body.append(outside, context)
    return { outside, context, floating }
}

describe('suppressOutside', () => {
    it('隔离浮层外的兄弟节点，保留浮层子树与宿主链', () => {
        const { outside, context, floating } = buildTree()

        const restore = suppressOutside(floating)

        expect(outside.hasAttribute('inert')).toBe(true)
        expect(context.hasAttribute('inert')).toBe(false)
        expect(floating.hasAttribute('inert')).toBe(false)
        expect(floating.querySelector('button')?.closest('[inert]')).toBeNull()

        restore()
        expect(outside.hasAttribute('inert')).toBe(false)
    })

    it('撤销只移除自身写入的 inert，保留外部已置位的节点', () => {
        const { outside } = buildTree()
        outside.setAttribute('inert', '')
        const floating = document.querySelector('#floating') as HTMLElement

        const restore = suppressOutside(floating)
        expect(outside.hasAttribute('inert')).toBe(true)

        restore()
        // 外部写入的 inert 不归本函数管理，撤销后仍在
        expect(outside.hasAttribute('inert')).toBe(true)
    })

    it('live region 整棵子树保留（与 aria-hidden 对目标节点不再下钻一致）', () => {
        const { outside, floating } = buildTree()
        const live = document.createElement('div')
        live.setAttribute('aria-live', 'polite')
        const toastText = document.createElement('span')
        toastText.textContent = '已保存'
        const closeButton = document.createElement('button')
        live.append(toastText, closeButton)
        const plainSibling = document.createElement('p')
        outside.append(live, plainSibling)

        const restore = suppressOutside(floating)

        expect(live.hasAttribute('inert')).toBe(false)
        expect(toastText.hasAttribute('inert')).toBe(false)
        expect(closeButton.hasAttribute('inert')).toBe(false)
        expect(plainSibling.hasAttribute('inert')).toBe(true)

        restore()
        expect(plainSibling.hasAttribute('inert')).toBe(false)
    })

    it('焦点哨兵保持可聚焦，不参与隔离', () => {
        const { floating } = buildTree()
        const guard = document.createElement('span')
        guard.setAttribute('data-reka-focus-guard', '')
        guard.tabIndex = 0
        document.body.append(guard)

        const restore = suppressOutside(floating)

        expect(guard.hasAttribute('inert')).toBe(false)
        restore()
    })

    it('嵌套结构下只隔离与浮层无关的分支', () => {
        document.body.innerHTML = ''
        const outer = document.createElement('div')
        const banner = document.createElement('p')
        banner.textContent = '页头'
        const inner = document.createElement('div')
        const floating = document.createElement('div')
        inner.append(floating)
        outer.append(banner, inner)
        document.body.append(outer)

        const restore = suppressOutside(floating)

        expect(banner.hasAttribute('inert')).toBe(true)
        expect(inner.hasAttribute('inert')).toBe(false)
        expect(outer.hasAttribute('inert')).toBe(false)

        restore()
        expect(banner.hasAttribute('inert')).toBe(false)
    })

    it('浮层不在文档内时不做任何隔离', () => {
        const { outside } = buildTree()
        const detached = document.createElement('div')

        const restore = suppressOutside(detached)

        expect(outside.hasAttribute('inert')).toBe(false)
        restore()
        expect(outside.hasAttribute('inert')).toBe(false)
    })
})
