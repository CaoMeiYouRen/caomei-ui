import { afterEach, describe, expect, it } from 'vitest'
import { __resetIsolationForTest, __setHitTestForTest, suppressOutside } from './open-state-inert'

afterEach(() => {
    document.body.innerHTML = ''
    __resetIsolationForTest()
    __setHitTestForTest()
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
        expect(outside.getAttribute('aria-hidden')).toBe('true')
        expect(context.hasAttribute('inert')).toBe(false)
        expect(floating.hasAttribute('inert')).toBe(false)
        expect(floating.querySelector('button')?.closest('[inert]')).toBeNull()

        restore()
        expect(outside.hasAttribute('inert')).toBe(false)
        expect(outside.hasAttribute('aria-hidden')).toBe(false)
    })

    it('撤销只移除自身写入的 inert，保留外部已置位的节点', () => {
        const { outside } = buildTree()
        outside.setAttribute('inert', '')
        const floating = document.querySelector('#floating') as HTMLElement

        const restore = suppressOutside(floating)
        expect(outside.hasAttribute('inert')).toBe(true)
        // 外部已隔离的节点不接管，也不补 `aria-hidden`
        expect(outside.hasAttribute('aria-hidden')).toBe(false)

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

    it('script 整棵子树保留，其祖先链不参与隔离', () => {
        const { outside, floating } = buildTree()
        const script = document.createElement('script')
        script.textContent = 'window.__caomeiInertProbe = 1'
        outside.append(script)
        const plain = document.createElement('p')
        document.body.append(plain)

        const restore = suppressOutside(floating)

        expect(outside.hasAttribute('inert')).toBe(false)
        expect(script.hasAttribute('inert')).toBe(false)
        expect(plain.hasAttribute('inert')).toBe(true)

        restore()
        expect(plain.hasAttribute('inert')).toBe(false)
    })

    it('撤销幂等：重复调用不误删外部写入的 inert', () => {
        const { outside, floating } = buildTree()
        const external = document.createElement('aside')
        external.setAttribute('inert', '')
        document.body.append(external)

        const restore = suppressOutside(floating)
        expect(outside.hasAttribute('inert')).toBe(true)

        restore()
        restore()

        expect(outside.hasAttribute('inert')).toBe(false)
        expect(external.hasAttribute('inert')).toBe(true)
    })

    it('外部已有的 aria-hidden 不接管，撤销后保留', () => {
        const { outside, floating } = buildTree()
        outside.setAttribute('aria-hidden', 'true')

        const restore = suppressOutside(floating)
        expect(outside.hasAttribute('inert')).toBe(true)
        expect(outside.getAttribute('aria-hidden')).toBe('true')

        restore()
        expect(outside.hasAttribute('inert')).toBe(false)
        expect(outside.getAttribute('aria-hidden')).toBe('true')
    })

    it('多层浮层：先关者不提前解除，全部关闭后统一恢复', () => {
        document.body.innerHTML = ''
        const outside = document.createElement('div')
        const contextA = document.createElement('div')
        const floatingA = document.createElement('div')
        contextA.append(floatingA)
        const contextB = document.createElement('div')
        const floatingB = document.createElement('div')
        contextB.append(floatingB)
        document.body.append(outside, contextA, contextB)

        const releaseA = suppressOutside(floatingA)
        const releaseB = suppressOutside(floatingB)

        // 两层同时展开：两条宿主链都保留，背景隔离
        expect(outside.hasAttribute('inert')).toBe(true)
        expect(contextA.hasAttribute('inert')).toBe(false)
        expect(contextB.hasAttribute('inert')).toBe(false)

        releaseA()

        // A 关闭而 B 仍展开：背景必须保持隔离，A 的宿主链转为背景
        expect(outside.hasAttribute('inert')).toBe(true)
        expect(contextA.hasAttribute('inert')).toBe(true)
        expect(contextA.getAttribute('aria-hidden')).toBe('true')
        expect(contextB.hasAttribute('inert')).toBe(false)

        releaseB()
        expect(outside.hasAttribute('inert')).toBe(false)
        expect(contextA.hasAttribute('inert')).toBe(false)
        expect(contextB.hasAttribute('inert')).toBe(false)
    })

    it('多层浮层的关闭顺序相反时同样完整恢复', () => {
        document.body.innerHTML = ''
        const outside = document.createElement('div')
        const contextA = document.createElement('div')
        const floatingA = document.createElement('div')
        contextA.append(floatingA)
        const contextB = document.createElement('div')
        const floatingB = document.createElement('div')
        contextB.append(floatingB)
        document.body.append(outside, contextA, contextB)

        const releaseA = suppressOutside(floatingA)
        const releaseB = suppressOutside(floatingB)

        releaseB()

        // B 先关：A 仍展开，B 的宿主链转为背景
        expect(outside.hasAttribute('inert')).toBe(true)
        expect(contextB.hasAttribute('inert')).toBe(true)
        expect(contextA.hasAttribute('inert')).toBe(false)

        releaseA()
        expect(outside.hasAttribute('inert')).toBe(false)
        expect(contextA.hasAttribute('inert')).toBe(false)
        expect(contextB.hasAttribute('inert')).toBe(false)
    })

    it('不同文档的浮层按 body 分组，互不影响', () => {
        const { outside, floating } = buildTree()
        const otherDoc = document.implementation.createHTMLDocument('other')
        const outsideOther = otherDoc.createElement('div')
        const contextOther = otherDoc.createElement('div')
        const floatingOther = otherDoc.createElement('div')
        contextOther.append(floatingOther)
        otherDoc.body.append(outsideOther, contextOther)

        const releaseMain = suppressOutside(floating)
        const releaseOther = suppressOutside(floatingOther)

        expect(outside.hasAttribute('inert')).toBe(true)
        expect(outsideOther.hasAttribute('inert')).toBe(true)
        expect(contextOther.hasAttribute('inert')).toBe(false)

        releaseOther()

        // 关闭另一文档的层：该文档恢复，本文档隔离不受影响
        expect(outside.hasAttribute('inert')).toBe(true)
        expect(outsideOther.hasAttribute('inert')).toBe(false)
        expect(contextOther.hasAttribute('inert')).toBe(false)

        releaseMain()
        expect(outside.hasAttribute('inert')).toBe(false)
        expect(contextOther.hasAttribute('inert')).toBe(false)
    })

    it('root 为 body 本身时不做任何隔离', () => {
        buildTree()

        const restore = suppressOutside(document.body)

        expect(document.querySelector('#outside')?.hasAttribute('inert')).toBe(false)
        restore()
        expect(document.querySelector('#outside')?.hasAttribute('inert')).toBe(false)
    })

    it('打开期间外部移除 inert 时，下一次重算补写', () => {
        document.body.innerHTML = ''
        const outside = document.createElement('div')
        const contextA = document.createElement('div')
        const floatingA = document.createElement('div')
        contextA.append(floatingA)
        const contextB = document.createElement('div')
        const floatingB = document.createElement('div')
        contextB.append(floatingB)
        document.body.append(outside, contextA, contextB)

        const releaseA = suppressOutside(floatingA)
        expect(outside.hasAttribute('inert')).toBe(true)

        // 模拟外部误删：下一次重算（另一层打开）应补齐，而不是静默失效
        outside.removeAttribute('inert')
        const releaseB = suppressOutside(floatingB)
        expect(outside.hasAttribute('inert')).toBe(true)

        releaseB()
        releaseA()
        expect(outside.hasAttribute('inert')).toBe(false)
    })
})

describe('首击穿透（展开态点击背景）', () => {
    function buildClickable(): { button: HTMLButtonElement, outside: HTMLElement, floating: HTMLElement, clicks: () => number } {
        document.body.innerHTML = ''
        const outside = document.createElement('div')
        outside.id = 'outside'
        const button = document.createElement('button')
        button.textContent = '背景按钮'
        outside.append(button)

        const context = document.createElement('div')
        const floating = document.createElement('div')
        floating.id = 'floating'
        context.append(floating)
        document.body.append(outside, context)

        let count = 0
        button.addEventListener('click', () => {
            count += 1
        })
        return { button, outside, floating, clicks: () => count }
    }

    function pointerDown(button: number = 0, target: EventTarget = document.body): void {
        target.dispatchEvent(new MouseEvent('pointerdown', {
            bubbles: true,
            cancelable: true,
            button,
            clientX: 10,
            clientY: 10,
            view: window,
        }))
    }

    it('背景首击补派一次 click，使「关面板」与「激活控件」同一次点击完成', () => {
        const { button, outside, floating, clicks } = buildClickable()
        __setHitTestForTest(() => [button].filter((element) => !element.closest('[inert]')))
        const restore = suppressOutside(floating)

        expect(outside.hasAttribute('inert')).toBe(true)
        pointerDown()
        expect(clicks()).toBe(1)

        restore()
    })

    it('补派前已恢复 inert（原生点击不会二次落到底层控件）', () => {
        const { button, outside, floating, clicks } = buildClickable()
        let inertDuringHit = false
        __setHitTestForTest(() => {
            inertDuringHit = outside.hasAttribute('inert')
            return [button]
        })
        const restore = suppressOutside(floating)

        pointerDown()
        expect(inertDuringHit, '命中测试时临时解除隔离').toBe(false)
        expect(outside.hasAttribute('inert'), '补派前恢复隔离').toBe(true)
        expect(clicks()).toBe(1)

        restore()
    })

    it('指针落在浮层内时不补派', () => {
        const { button, floating, clicks } = buildClickable()
        __setHitTestForTest(() => [button])
        const restore = suppressOutside(floating)

        pointerDown(0, floating)
        expect(clicks()).toBe(0)
        restore()
    })

    it('浮层先于守卫关闭（目标已不在 inert 子树）时不补派，避免双触发', () => {
        const { button, floating, clicks } = buildClickable()
        __setHitTestForTest(() => [button])

        // 守卫挂在 window 捕获阶段的最晚注册位；模拟更早注册的外部监听先关闭浮层并解除隔离
        let restore = (): void => undefined
        const closeListener = (): void => {
            restore()
        }
        window.addEventListener('pointerdown', closeListener, { capture: true })
        restore = suppressOutside(floating)

        pointerDown()
        expect(clicks()).toBe(0)
        expect(button.closest('[inert]')).toBeNull()

        window.removeEventListener('pointerdown', closeListener, { capture: true })
        restore()
    })

    it('非主键（右键）不补派', () => {
        const { button, floating, clicks } = buildClickable()
        __setHitTestForTest(() => [button])
        const restore = suppressOutside(floating)

        pointerDown(2)
        expect(clicks()).toBe(0)
        restore()
    })

    it('无活动层时不装守卫：pointerdown 不产生任何补派', () => {
        const { button, clicks } = buildClickable()
        __setHitTestForTest(() => [button])
        pointerDown()
        expect(clicks()).toBe(0)
    })
})
