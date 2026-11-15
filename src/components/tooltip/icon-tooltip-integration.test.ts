import { mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { CaomeiAlert } from '../alert'
import { CaomeiAutoComplete } from '../auto-complete'
import { CaomeiCalendar } from '../calendar'
import { CaomeiColorPicker } from '../color-picker'
import CaomeiColorPickerPanel from '../color-picker/color-picker-panel.vue'
import { CaomeiDatePicker } from '../date-picker'
import { CaomeiFileUpload } from '../file-upload'
import { CaomeiImage } from '../image'
import { CaomeiInputNumber } from '../input-number'
import { CaomeiMessage } from '../message'
import { CaomeiMultiSelect } from '../multi-select'
import { CaomeiPassword } from '../password'
import { CaomeiSelect } from '../select'
import { CaomeiTagsInput } from '../tags-input'
import { CaomeiTooltipProvider } from './index'

/**
 * 图标触发器内建提示的集成用例（表单控件与面板 / 容器内的图标触发器）。
 *
 * 各触发面共用内部 `CaomeiIconTooltip`，故集中在一个文件覆盖：各自的可访问名 → 提示内容、
 * 停用时不挂载、以及提示开合不改变宿主几何（后者由 `capture:styles` 与真实浏览器探针承载）。
 * 分两个 `describe`：表单控件内的清除 / 步进 / 显隐按钮，与面板 / 容器内的日历导航、弹层触发器、关闭按钮。
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

describe('图标触发器内建提示集成：表单控件', () => {
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

describe('图标触发器内建提示集成：面板与容器', () => {
    it('Calendar 上月 / 下月按钮：提示取导航文案', async () => {
        mountFast(CaomeiCalendar, {})
        await nextTick()

        const navs = Array.from(document.querySelectorAll('.caomei-calendar__nav'))
        expect(navs).toHaveLength(2)
        const labels = ['上个月', '下个月']
        for (const [index, label] of labels.entries()) {
            expect(navs[index].getAttribute('aria-label')).toBe(label)
            expect(navs[index].hasAttribute('data-state')).toBe(true)
            expect(await openTooltip(navs[index])).toBe(label)
        }
    })

    it('DatePicker 触发器图标：提示取触发器可访问名', async () => {
        mountFast(CaomeiDatePicker, { modelValue: null })
        await nextTick()

        const icon = document.querySelector('.caomei-date-picker__icon') as SVGElement
        expect(icon).not.toBeNull()
        expect(icon.hasAttribute('data-state')).toBe(true)
        expect(await openTooltip(icon)).toBe('日期')
    })

    it('FileUpload 移除按钮：提示带文件名', async () => {
        mountFast(CaomeiFileUpload, { modelValue: [new File(['x'], 'a.txt')] })
        await nextTick()

        const remove = document.querySelector('.caomei-file-upload__remove') as HTMLElement
        expect(remove.getAttribute('aria-label')).toBe('移除 a.txt')
        expect(await openTooltip(remove)).toBe('移除 a.txt')
    })

    it('ColorPicker 触发器色块：提示取触发器可访问名', async () => {
        mountFast(CaomeiColorPicker, { modelValue: '#112233' })
        await nextTick()

        const swatch = document.querySelector('.caomei-color-picker__trigger .caomei-color-picker__swatch') as HTMLElement
        expect(swatch).not.toBeNull()
        expect(swatch.hasAttribute('data-state')).toBe(true)
        expect(await openTooltip(swatch)).toBe('颜色')
    })

    it('ColorPicker 面板色板：提示取色值，且色板可访问名不变', async () => {
        mountFast(CaomeiColorPickerPanel, { modelValue: '#112233', swatches: ['#e63946', '#f59e0b'] })
        await nextTick()

        const chips = document.querySelectorAll('.caomei-color-picker__swatches .caomei-color-picker__swatch') as NodeListOf<HTMLElement>
        expect(chips).toHaveLength(2)
        expect(chips[0].getAttribute('role')).toBe('radio')
        expect(chips[0].getAttribute('aria-label')).toBe('#e63946')
        expect(chips[0].hasAttribute('data-state')).toBe(true)
        expect(await openTooltip(chips[0])).toBe('#e63946')
    })

    it('Image 预览入口与关闭按钮：各自显示提示', async () => {
        const wrapper = mountFast(CaomeiImage, { src: 'a.png', alt: '示例', preview: true })
        await nextTick()
        wrapper.get('img').element.dispatchEvent(new Event('load'))
        await nextTick()

        const icon = document.querySelector('.caomei-image__preview-icon') as HTMLElement
        expect(icon).not.toBeNull()
        expect(icon.hasAttribute('data-state')).toBe(true)

        // 打开遮罩后关闭按钮存在；「程序化聚焦不自动弹提示」依赖 :focus-visible，
        // happy-dom 无该语义，由真实浏览器探针承载
        ;(document.querySelector('.caomei-image__preview-trigger') as HTMLElement).click()
        await vi.waitFor(() => {
            expect(document.querySelector('.caomei-image__preview-close')).not.toBeNull()
        })

        const close = document.querySelector('.caomei-image__preview-close') as HTMLElement
        expect(close.getAttribute('aria-label')).toBe('关闭')
        expect(await openTooltip(close)).toBe('关闭')

        // 遮罩内的提示打开后，预览入口仍保留接线（关闭遮罩后悬停可再次提示）
        expect(await openTooltip(icon)).toBe('预览图片')
    })

    it('停用的触发器不挂载提示（DatePicker 图标 / ColorPicker 触发器与面板色板）', async () => {
        mountFast(CaomeiDatePicker, { modelValue: null, disabled: true })
        mountFast(CaomeiColorPicker, { modelValue: '#112233', disabled: true })
        mountFast(CaomeiColorPickerPanel, { modelValue: '#112233', swatches: ['#e63946'], disabled: true })
        await nextTick()

        const targets = [
            document.querySelector('.caomei-date-picker__icon'),
            document.querySelector('.caomei-color-picker__trigger .caomei-color-picker__swatch'),
            document.querySelector('.caomei-color-picker__swatches .caomei-color-picker__swatch'),
        ]
        for (const target of targets) {
            expect(target).not.toBeNull()
            expect(target?.hasAttribute('data-state')).toBe(false)
        }
    })

    it('Message / Alert 关闭按钮：提示取关闭文案', async () => {
        mountFast(CaomeiMessage, { title: '标题', closable: true })
        await nextTick()
        const messageClose = document.querySelector('.caomei-message__close') as HTMLElement
        expect(messageClose.getAttribute('aria-label')).toBe('关闭')
        expect(await openTooltip(messageClose)).toBe('关闭')

        mountFast(CaomeiAlert, { title: '标题', closable: true })
        await nextTick()
        const alertClose = document.querySelector('.caomei-alert .caomei-message__close') as HTMLElement
        expect(alertClose.getAttribute('aria-label')).toBe('关闭')
        expect(await openTooltip(alertClose)).toBe('关闭')
    })
})
