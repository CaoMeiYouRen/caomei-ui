import { mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { CaomeiAutoComplete } from '../auto-complete'
import { CaomeiInputNumber } from '../input-number'
import { CaomeiMultiSelect } from '../multi-select'
import { CaomeiPassword } from '../password'
import { CaomeiSelect } from '../select'
import { CaomeiTagsInput } from '../tags-input'
import { CaomeiTooltipProvider } from './index'

/**
 * 图标触发器内建提示的集成用例（Select 族清除 / InputNumber 步进 / Password 显隐）。
 *
 * 六个触发面共用内部 `CaomeiIconTooltip`，故集中在一个文件覆盖：各自的可访问名 → 提示内容、
 * 停用时不挂载、以及提示开合不改变宿主几何（后者由 `capture:styles` 与真实浏览器探针承载）。
 */
const mounted: VueWrapper[] = []

function mountFast(component: unknown, props: object = {}): VueWrapper {
    const wrapper = mount(defineComponent({
        render: () => h(CaomeiTooltipProvider, { delayDuration: 0 }, {
            default: () => h(component as never, props),
        }),
    }), { attachTo: document.body }) as VueWrapper
    mounted.push(wrapper)
    return wrapper
}

/** 指针进入立即打开（延迟已归零），返回当前打开面板的文本 */
async function openTooltip(element: Element): Promise<string | null> {
    element.dispatchEvent(new MouseEvent('pointermove', { bubbles: true }))
    await vi.waitFor(() => {
        expect(document.querySelector('.caomei-tooltip__content[data-state*="open"]')).not.toBeNull()
    })
    return document.querySelector('.caomei-tooltip__content[data-state*="open"] [role="tooltip"]')?.textContent?.trim() ?? null
}

afterEach(() => {
    while (mounted.length > 0) {
        mounted.pop()?.unmount()
    }
    document.body.innerHTML = ''
    vi.unstubAllGlobals()
})

describe('图标触发器内建提示集成', () => {
    it('Select 清除按钮：提示取清除文案，可访问名不变', async () => {
        mountFast(CaomeiSelect, { options: [{ label: '甲', value: 1 }], modelValue: 1, showClear: true })
        await nextTick()

        const clear = document.querySelector('.caomei-select__clear') as HTMLElement
        expect(clear.getAttribute('aria-label')).toBe('清除')
        expect(clear.hasAttribute('data-state')).toBe(true)
        expect(await openTooltip(clear)).toBe('清除')
    })

    it('MultiSelect 清除按钮：提示取清除文案', async () => {
        mountFast(CaomeiMultiSelect, { options: [{ label: '甲', value: 1 }], modelValue: [1], showClear: true })
        await nextTick()

        const clear = document.querySelector('.caomei-multi-select__clear') as HTMLElement
        expect(clear.getAttribute('aria-label')).toBe('清除')
        expect(await openTooltip(clear)).toBe('清除')
    })

    it('AutoComplete 清除按钮：提示取清除文案', async () => {
        mountFast(CaomeiAutoComplete, { options: [], modelValue: '甲' })
        await nextTick()

        const clear = document.querySelector('.caomei-auto-complete__clear') as HTMLElement
        expect(clear.getAttribute('aria-label')).toBe('清除')
        expect(await openTooltip(clear)).toBe('清除')
    })

    it('TagsInput 清空按钮：提示取清空文案', async () => {
        mountFast(CaomeiTagsInput, { modelValue: ['甲'], showClear: true })
        await nextTick()

        const clear = document.querySelector('.caomei-tags-input__clear') as HTMLElement
        expect(clear.getAttribute('aria-label')).toBe('清空')
        expect(await openTooltip(clear)).toBe('清空')
    })

    it('InputNumber 步进按钮：两个方向各自显示提示', async () => {
        mountFast(CaomeiInputNumber, { modelValue: 5, min: 0, max: 10 })
        await nextTick()

        const buttons = document.querySelectorAll('.caomei-input-number__button')
        expect(buttons).toHaveLength(2)
        expect(buttons[0].hasAttribute('data-state')).toBe(true)
        expect(buttons[1].hasAttribute('data-state')).toBe(true)
        expect(await openTooltip(buttons[0])).toBe('减少')
        expect(await openTooltip(buttons[1])).toBe('增加')
    })

    it('InputNumber 到达边界时不再挂载对应提示', async () => {
        mountFast(CaomeiInputNumber, { modelValue: 10, min: 0, max: 10 })
        await nextTick()

        const buttons = document.querySelectorAll('.caomei-input-number__button')
        expect(await openTooltip(buttons[0])).toBe('减少')
        buttons[0].dispatchEvent(new MouseEvent('pointerleave', { bubbles: true }))

        // 增量方向已到上界：不挂载提示接线（触发器上不会有 data-state）
        expect(buttons[1].hasAttribute('data-state')).toBe(false)
    })

    it('Password 显隐按钮：提示随明暗状态切换', async () => {
        mountFast(CaomeiPassword, { modelValue: 'secret' })
        await nextTick()

        const toggle = document.querySelector('.caomei-password__toggle') as HTMLElement
        expect(toggle.getAttribute('aria-label')).toBe('显示密码')
        expect(await openTooltip(toggle)).toBe('显示密码')

        toggle.click()
        await vi.waitFor(() => {
            expect(document.querySelector('.caomei-tooltip__content')).toBeNull()
        })
        // 点击已关闭提示，但「指针仍在触发器上」的标记需先离开才能再次打开
        toggle.dispatchEvent(new MouseEvent('pointerleave', { bubbles: true }))

        expect(toggle.getAttribute('aria-label')).toBe('隐藏密码')
        expect(await openTooltip(toggle)).toBe('隐藏密码')
    })

    it('只读步进按钮不挂载提示', async () => {
        mountFast(CaomeiInputNumber, { modelValue: 5, readonly: true })
        await nextTick()

        const buttons = document.querySelectorAll('.caomei-input-number__button')
        expect(buttons).toHaveLength(2)
        for (const button of buttons) {
            expect(button.hasAttribute('data-state')).toBe(false)
        }
    })

    it('AutoComplete 加载态优先于清除态：不渲染清除按钮', async () => {
        mountFast(CaomeiAutoComplete, { options: [], modelValue: '甲', loading: true })
        await nextTick()

        expect(document.querySelector('.caomei-auto-complete__clear')).toBeNull()
    })

    it('停用时不挂载提示（Password / InputNumber）', async () => {
        mountFast(CaomeiPassword, { modelValue: 'secret', disabled: true })
        await nextTick()
        const toggle = document.querySelector('.caomei-password__toggle') as HTMLElement
        expect(toggle.hasAttribute('data-state')).toBe(false)

        mountFast(CaomeiInputNumber, { modelValue: 5, disabled: true })
        await nextTick()
        const buttons = document.querySelectorAll('.caomei-input-number__button')
        expect(buttons).toHaveLength(2)
        for (const button of buttons) {
            expect(button.hasAttribute('data-state')).toBe(false)
            button.dispatchEvent(new MouseEvent('pointermove', { bubbles: true }))
        }
        await vi.waitFor(() => {
            expect(document.querySelector('.caomei-tooltip__content')).toBeNull()
        })
    })
})
