import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import {
    TOUR_FALLBACK_CARD_SIZE,
    centerTourCard,
    computeTourPosition,
    computeTourSpotlight,
    oppositePlacement,
} from './position'
import type { TourRect, TourStep } from './types'
import { CaomeiTour } from './index'

const wrappers: ReturnType<typeof mount>[] = []

/** 等待挂载 → 遮罩 → 位置计算的连续微任务收敛 */
async function flush(): Promise<void> {
    await nextTick()
    await nextTick()
    await nextTick()
}

function mountTour(props: Record<string, unknown> = {}, slots: Record<string, () => unknown> = {}) {
    const wrapper = mount(CaomeiTour, {
        props: {
            steps: [{ title: '第一步' }],
            ...props,
        },
        slots,
        attachTo: document.body,
    })
    wrappers.push(wrapper)
    return wrapper
}

function overlay(): HTMLElement | null {
    return document.querySelector('.caomei-tour')
}

function card(): HTMLElement | null {
    return document.querySelector('.caomei-tour__card')
}

function title(): string | null | undefined {
    return document.querySelector('.caomei-tour__title')?.textContent?.trim()
}

function actionButton(text: string): HTMLButtonElement | undefined {
    return [...document.querySelectorAll<HTMLButtonElement>('.caomei-tour__actions button')]
        .find((button) => button.textContent?.trim() === text)
}

function clickAction(text: string): void {
    const button = actionButton(text)
    if (!button) {
        throw new Error(`未找到操作按钮：${text}`)
    }
    button.click()
}

/** 造一个带固定矩形的目标元素：happy-dom 的 `getBoundingClientRect` 恒为 0，需逐元素桩 */
function makeTarget(rect: Partial<TourRect>): HTMLElement {
    const element = document.createElement('div')
    const full: TourRect = { top: 0, left: 0, width: 0, height: 0, ...rect }
    element.getBoundingClientRect = () => ({
        ...full,
        x: full.left,
        y: full.top,
        right: full.left + full.width,
        bottom: full.top + full.height,
        toJSON: () => full,
    }) as DOMRect
    document.body.append(element)
    return element
}

afterEach(() => {
    for (const wrapper of wrappers.splice(0)) {
        wrapper.unmount()
    }
    document.body.innerHTML = ''
})

describe('CaomeiTour 步骤流', () => {
    it('默认从首步渲染，进度与按钮文案就绪', async () => {
        mountTour({ steps: [{ title: 'A' }, { title: 'B' }] })
        await flush()

        expect(overlay()?.getAttribute('aria-label')).toBe('产品引导')
        expect(overlay()?.getAttribute('aria-modal')).toBe('true')
        expect(overlay()?.getAttribute('role')).toBe('dialog')
        expect(title()).toBe('A')
        expect(document.querySelector('.caomei-tour__progress')?.textContent?.trim()).toBe('1 / 2')
        expect(actionButton('上一步')?.disabled, '首步的上一步应为禁用态').toBe(true)
        expect(actionButton('下一步')).not.toBeUndefined()
    })

    it('下一步推进索引并 emit 当前步骤', async () => {
        const steps: TourStep[] = [{ title: 'A' }, { title: 'B' }]
        const wrapper = mountTour({ steps })
        await flush()

        clickAction('下一步')
        await flush()

        expect(title()).toBe('B')
        expect(wrapper.emitted('next')).toEqual([[{ title: 'A' }, 0]])
        expect(wrapper.emitted('update:current')?.at(-1)).toEqual([1])
    })

    it('上一步回退索引且末步按钮文案切换为完成', async () => {
        const steps: TourStep[] = [{ title: 'A' }, { title: 'B' }]
        mountTour({ steps })
        await flush()

        clickAction('下一步')
        await flush()
        expect(actionButton('完成'), '末步应显示完成').not.toBeUndefined()

        clickAction('上一步')
        await flush()
        expect(title()).toBe('A')
        expect(document.querySelector('.caomei-tour__progress')?.textContent?.trim()).toBe('1 / 2')
    })

    it('末步点击完成只 emit finish，不重复 emit next，并关闭引导', async () => {
        const wrapper = mountTour({ steps: [{ title: 'A' }] })
        await flush()

        clickAction('完成')
        await flush()

        expect(wrapper.emitted('finish')).toEqual([[{ title: 'A' }, 0]])
        expect(wrapper.emitted('next')).toBeUndefined()
        expect(wrapper.emitted('update:open')?.at(-1)).toEqual([false])
        expect(overlay(), '关闭后浮层应卸载').toBeNull()
    })

    it('跳过按钮 emit skip 一次并关闭', async () => {
        const wrapper = mountTour({ steps: [{ title: 'A' }, { title: 'B' }] })
        await flush()

        clickAction('跳过')
        await flush()

        expect(wrapper.emitted('skip')).toEqual([[{ title: 'A' }, 0]])
        expect(wrapper.emitted('update:open')?.at(-1)).toEqual([false])
        expect(overlay()).toBeNull()
    })

    it('受控 current：初始索引生效，回退写回 update:current', async () => {
        const wrapper = mountTour({
            steps: [{ title: 'A' }, { title: 'B' }],
            current: 1,
        })
        await flush()

        expect(title()).toBe('B')
        clickAction('上一步')
        await flush()

        expect(wrapper.emitted('update:current')?.at(-1)).toEqual([0])
        expect(title()).toBe('A')
    })

    it('越界 current 钳位到有效区间末尾并写回父级', async () => {
        const wrapper = mountTour({ steps: [{ title: 'A' }, { title: 'B' }], current: 9 })
        await flush()

        expect(title()).toBe('B')
        expect(document.querySelector('.caomei-tour__progress')?.textContent?.trim()).toBe('2 / 2')
        expect(wrapper.emitted('update:current')?.at(-1), '钳位后应写回受控状态').toEqual([1])
    })

    it('非整数 current 截断到整数索引', async () => {
        mountTour({ steps: [{ title: 'A' }, { title: 'B' }], current: 1.7 })
        await flush()

        expect(title()).toBe('B')
    })

    it('open 为 false 或步骤为空时不渲染', async () => {
        mountTour({ open: false })
        await flush()
        expect(overlay()).toBeNull()

        const wrapper = mountTour({ steps: [] })
        await flush()
        expect(overlay()).toBeNull()
        wrapper.unmount()
    })

    it('插槽覆盖默认描述', async () => {
        const wrapper = mountTour(
            { steps: [{ title: 'A', description: '默认正文' }] },
            { default: () => h('p', { class: 'custom-body' }, '自定义正文') },
        )
        await flush()

        expect(document.querySelector('.custom-body')?.textContent).toBe('自定义正文')
        expect(document.querySelector('.caomei-tour__description'), '插槽存在时不渲染默认描述').toBeNull()
        wrapper.unmount()
    })
})

describe('CaomeiTour 遮罩、定位与焦点', () => {
    it('目标存在时挖空并贴在目标下方', async () => {
        const target = makeTarget({ top: 100, left: 100, width: 50, height: 40 })
        mountTour({ steps: [{ target }] })
        await flush()

        const spotlight = document.querySelector<HTMLElement>('.caomei-tour__spotlight')
        expect(spotlight, '有目标时应绘制挖空高亮').not.toBeNull()
        expect(spotlight?.style.top).toBe('94px')
        expect(spotlight?.style.left).toBe('94px')
        expect(spotlight?.style.width).toBe('62px')
        expect(spotlight?.style.height).toBe('52px')

        expect(document.querySelector('.caomei-tour__mask'), '挖空形态不再叠加整屏底色').toBeNull()
        expect(overlay()?.dataset.placement).toBe('bottom')
        expect(card()?.style.top).toBe('152px')
        expect(card()?.style.left, '左侧越界应钳位到视口留白').toBe('8px')
    })

    it('padding 控制挖空外扩距离', async () => {
        const target = makeTarget({ top: 100, left: 100, width: 50, height: 40 })
        mountTour({ steps: [{ target }], padding: 10 })
        await flush()

        const spotlight = document.querySelector<HTMLElement>('.caomei-tour__spotlight')
        expect(spotlight?.style.top).toBe('90px')
        expect(spotlight?.style.width).toBe('70px')
    })

    it('选择器目标与函数目标均可解析', async () => {
        const selected = makeTarget({ top: 60, left: 20, width: 30, height: 30 })
        selected.id = 'tour-selector-target'
        const computed = makeTarget({ top: 200, left: 300, width: 40, height: 40 })

        const bySelector = mountTour({ steps: [{ target: '#tour-selector-target' }] })
        await flush()
        expect(card()?.style.top).toBe('102px')
        bySelector.unmount()

        const byFunction = mountTour({ steps: [{ target: () => computed }] })
        await flush()
        expect(card()?.style.top).toBe('252px')
        byFunction.unmount()
    })

    it('窗口 resize 与任意滚动容器滚动后重算位置', async () => {
        const target = makeTarget({ top: 100, left: 100, width: 50, height: 40 })
        mountTour({ steps: [{ target }] })
        await flush()
        expect(card()?.style.top).toBe('152px')

        const rect = { top: 300, left: 100, width: 50, height: 40 }
        target.getBoundingClientRect = () => ({
            ...rect,
            x: rect.left,
            y: rect.top,
            right: rect.left + rect.width,
            bottom: rect.top + rect.height,
            toJSON: () => rect,
        }) as DOMRect

        window.dispatchEvent(new Event('resize'))
        await flush()
        expect(card()?.style.top, 'resize 后应重算').toBe('352px')

        const scroller = document.createElement('div')
        document.body.append(scroller)
        const moved = { ...rect, top: 400 }
        target.getBoundingClientRect = () => ({
            ...moved,
            x: moved.left,
            y: moved.top,
            right: moved.left + moved.width,
            bottom: moved.top + moved.height,
            toJSON: () => moved,
        }) as DOMRect

        scroller.dispatchEvent(new Event('scroll', { bubbles: true }))
        await flush()
        expect(card()?.style.top, '滚动容器滚动应重算').toBe('452px')
    })

    it('目标缺失时降级为居中卡片与整屏遮罩', async () => {
        mountTour({ steps: [{ target: '#tour-missing-target', title: 'A' }] })
        await flush()

        expect(document.querySelector('.caomei-tour__spotlight')).toBeNull()
        expect(document.querySelector('.caomei-tour__mask')).not.toBeNull()
        expect(overlay()?.dataset.centered).toBe('true')

        const expected = centerTourCard(
            { width: window.innerWidth, height: window.innerHeight },
            TOUR_FALLBACK_CARD_SIZE,
        )
        expect(card()?.style.top).toBe(`${expected.top}px`)
        expect(card()?.style.left).toBe(`${expected.left}px`)
    })

    it('非法选择器按目标缺失处理，不抛异常', async () => {
        expect(() => mountTour({ steps: [{ target: '#1-invalid!' }] })).not.toThrow()
        await flush()
        expect(overlay()?.dataset.centered).toBe('true')
    })

    it('Escape 关闭并把焦点归还触发元素', async () => {
        const trigger = document.createElement('button')
        document.body.append(trigger)
        trigger.focus()
        expect(document.activeElement).toBe(trigger)

        const wrapper = mountTour({ steps: [{ title: 'A' }] })
        await flush()
        expect(document.activeElement, '打开后焦点进入卡片').toBe(card())

        card()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
        await flush()

        expect(wrapper.emitted('skip')).toHaveLength(1)
        expect(overlay()).toBeNull()
        expect(document.activeElement, '关闭后焦点归还').toBe(trigger)
    })

    it('closable 关闭后不渲染跳过按钮且 Escape 不关闭', async () => {
        const wrapper = mountTour({ steps: [{ title: 'A' }], closable: false })
        await flush()

        expect(actionButton('跳过')).toBeUndefined()
        card()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
        await flush()

        expect(overlay(), '不可跳过时 Escape 不应关闭').not.toBeNull()
        expect(wrapper.emitted('skip')).toBeUndefined()
    })

    it('mask 关闭时不绘制遮罩且不标记为模态', async () => {
        mountTour({ steps: [{ title: 'A' }], mask: false })
        await flush()

        expect(document.querySelector('.caomei-tour__mask')).toBeNull()
        expect(document.querySelector('.caomei-tour__spotlight')).toBeNull()
        expect(overlay()?.dataset.unmasked).toBe('true')
        expect(overlay()?.getAttribute('aria-modal'), '非模态不输出 aria-modal').toBeNull()
        expect(overlay()?.getAttribute('role')).toBe('region')
    })

    it('Tab 焦点在卡片内循环', async () => {
        mountTour({ steps: [{ title: 'A' }] })
        await flush()

        const buttons = [...document.querySelectorAll<HTMLButtonElement>('.caomei-tour__actions button')]
        const last = buttons[buttons.length - 1]
        last.focus()
        expect(document.activeElement).toBe(last)

        card()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }))
        await nextTick()
        expect(document.activeElement, '末位 Tab 应折回首个可聚焦元素').toBe(buttons[0])

        card()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }))
        await nextTick()
        expect(document.activeElement, '首位 Shift+Tab 应折回末位').toBe(last)
    })

    it('非模态形态不拦截 Tab：键盘用户可离开卡片', async () => {
        mountTour({ steps: [{ title: 'A' }], mask: false })
        await flush()

        const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
        card()?.dispatchEvent(event)
        expect(event.defaultPrevented, '非模态不得形成键盘陷阱').toBe(false)
    })

    it('遮罩形态拦截越界 Tab', async () => {
        mountTour({ steps: [{ title: 'A' }] })
        await flush()

        const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
        card()?.dispatchEvent(event)
        expect(event.defaultPrevented, '模态形态焦点必须留在层内').toBe(true)
    })

    it('卡片以步骤标题为可访问名，label 覆盖浮层名', async () => {
        mountTour({ steps: [{ title: '定位说明', description: '正文' }], label: '新手引导' })
        await flush()

        expect(overlay()?.getAttribute('aria-label')).toBe('新手引导')
        expect(card()?.getAttribute('role')).toBe('group')
        expect(card()?.getAttribute('aria-label')).toBe('定位说明')
    })

    it('目标在视口外时退回整屏遮罩', async () => {
        const target = makeTarget({ top: -5000, left: 10, width: 20, height: 20 })
        mountTour({ steps: [{ target }] })
        await flush()

        expect(document.querySelector('.caomei-tour__spotlight'), '目标不在视口内不挖空').toBeNull()
        expect(document.querySelector('.caomei-tour__mask'), '应退回整屏遮罩').not.toBeNull()
    })

    it('打开状态下卸载：解除滚动锁与背景隔离并归还焦点', async () => {
        const trigger = document.createElement('button')
        document.body.append(trigger)
        trigger.focus()
        const sibling = document.createElement('div')
        document.body.append(sibling)

        const wrapper = mountTour({ steps: [{ title: 'A' }] })
        await flush()
        expect(document.documentElement.style.overflow, '模态形态应锁页面滚动').toBe('hidden')
        expect(sibling.hasAttribute('inert'), '背景应被隔离').toBe(true)

        wrapper.unmount()
        expect(document.documentElement.style.overflow, '卸载应解除滚动锁').toBe('')
        expect(sibling.hasAttribute('inert'), '卸载应解除背景隔离').toBe(false)
        expect(document.activeElement).toBe(trigger)
    })

    it('关闭后重新打开会重新捕获焦点', async () => {
        const first = document.createElement('button')
        document.body.append(first)
        first.focus()

        const opened = ref(true)
        const Host = defineComponent({
            setup: () => () => h(CaomeiTour, {
                steps: [{ title: 'A' }],
                open: opened.value,
                'onUpdate:open': (value: boolean) => {
                    opened.value = value
                },
            }),
        })
        const wrapper = mount(Host, { attachTo: document.body })
        wrappers.push(wrapper)
        await flush()

        clickAction('跳过')
        await flush()
        expect(document.activeElement).toBe(first)

        const second = document.createElement('button')
        document.body.append(second)
        second.focus()

        opened.value = true
        await flush()
        expect(document.activeElement, '重开时焦点进入卡片').toBe(card())

        card()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
        await flush()
        expect(document.activeElement, '关闭时归还到重开前的焦点').toBe(second)
    })

    it('steps 收缩时索引钳位并写回', async () => {
        const wrapper = mountTour({
            steps: [{ title: 'A' }, { title: 'B' }, { title: 'C' }],
            current: 2,
        })
        await flush()
        expect(title()).toBe('C')

        await wrapper.setProps({ steps: [{ title: 'A' }] })
        await flush()

        expect(title()).toBe('A')
        expect(wrapper.emitted('update:current')?.at(-1)).toEqual([0])
    })

    /*
      非模态形态用于验证「不抢焦点」：遮罩形态下背景处于 `inert`，消费者的聚焦本就要等隔离解除后
      才生效（时序归消费者），拿它做断言只能得到恒真的空转用例。
    */
    it('消费者在 finish 中接管焦点时不被抢回', async () => {
        const trigger = document.createElement('button')
        document.body.append(trigger)
        trigger.focus()

        const other = document.createElement('button')
        document.body.append(other)

        const Parent = defineComponent({
            setup: () => () => h(CaomeiTour, {
                steps: [{ title: 'A' }],
                mask: false,
                onFinish: () => {
                    other.focus()
                },
            }),
        })
        const wrapper = mount(Parent, { attachTo: document.body })
        wrappers.push(wrapper)
        await flush()

        clickAction('完成')
        await flush()

        expect(document.activeElement, '消费者的聚焦意图优先').toBe(other)
    })
})

describe('tour 定位算法', () => {
    const viewport = { width: 1024, height: 768 }
    const cardSize = { width: 320, height: 160 }

    it('方位翻转：下方空间不足时翻到上方', () => {
        const result = computeTourPosition({ top: 700, left: 100, width: 40, height: 40 }, viewport, cardSize, 'bottom', 12)
        expect(result.placement).toBe('top')
        expect(result.top).toBe(528)
    })

    it('方位翻转：左右互翻', () => {
        expect(oppositePlacement('left')).toBe('right')
        expect(oppositePlacement('right')).toBe('left')
        expect(oppositePlacement('top')).toBe('bottom')
        expect(oppositePlacement('bottom')).toBe('top')

        const result = computeTourPosition({ top: 100, left: 1000, width: 20, height: 20 }, viewport, cardSize, 'right', 12)
        expect(result.placement).toBe('left')
        expect(result.left).toBe(668)
    })

    it('两侧空间都不足时选择空间更大的一侧', () => {
        const result = computeTourPosition(
            { top: 100, left: 100, width: 40, height: 40 },
            { width: 1024, height: 300 },
            cardSize,
            'bottom',
            12,
        )
        expect(result.placement, '下方 160 > 上方 100，保持下方').toBe('bottom')
        expect(result.top, '贴住视口下留白').toBe(132)
    })

    it('坐标钳位在视口留白内', () => {
        const result = computeTourPosition(
            { top: 10, left: 10, width: 10, height: 10 },
            { width: 200, height: 100 },
            cardSize,
            'bottom',
            12,
        )
        expect(result.placement, '两侧都不足时保留空间更大的下方').toBe('bottom')
        expect(result.top, '卡片高于视口时钳位到上留白').toBe(8)
        expect(result.left, '卡片宽于视口时钳位到左留白').toBe(8)
    })

    it('挖空区按外扩距离展开', () => {
        expect(computeTourSpotlight({ top: 10, left: 20, width: 30, height: 40 }, 6)).toEqual({
            top: 4,
            left: 14,
            width: 42,
            height: 52,
        })
    })

    it('居中对齐视口中心', () => {
        expect(centerTourCard(viewport, cardSize)).toEqual({ top: 304, left: 352 })
    })
})
