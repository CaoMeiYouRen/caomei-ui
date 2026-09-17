import { DOMWrapper, mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { computed, nextTick } from 'vue'
import { caomeiLocaleKey } from '../../composables/use-locale'
import { caomeiLocales } from '../../locale'
import { CaomeiColorPicker } from './index'

afterEach(() => {
    document.body.innerHTML = ''
})

async function flush() {
    await nextTick()
    await nextTick()
}

function mountPicker(
    props: Record<string, unknown> = {},
    options: Record<string, unknown> = {},
): VueWrapper {
    return mount(CaomeiColorPicker, {
        props,
        attachTo: document.body,
        ...options,
    })
}

function trigger(wrapper: VueWrapper) {
    return wrapper.get('.caomei-color-picker__trigger')
}

function swatchColor(wrapper: VueWrapper): string {
    return wrapper.get('.caomei-color-picker__swatch').attributes('style') ?? ''
}

async function openPanel(wrapper: VueWrapper) {
    await trigger(wrapper).trigger('click')
    await flush()
}

function panel() {
    return document.body.querySelector('.caomei-color-picker__panel')
}

describe('CaomeiColorPicker', () => {
    it('渲染触发按钮与当前色块', () => {
        const wrapper = mountPicker({ modelValue: '#00ff00' })

        expect(trigger(wrapper).element.tagName).toBe('BUTTON')
        expect(swatchColor(wrapper)).toContain('#00ff00')
    })

    it('触发按钮默认可访问名取内建文案', () => {
        const wrapper = mountPicker()

        expect(trigger(wrapper).attributes('aria-label')).toBe('颜色')
    })

    it('label 可覆盖触发按钮可访问名', () => {
        const wrapper = mountPicker({ label: '主题色' })

        expect(trigger(wrapper).attributes('aria-label')).toBe('主题色')
    })

    it('label 优先于透传的 aria-label，缺省时透传值优先于内建文案', () => {
        const explicit = mountPicker({ label: '显式名' }, { attrs: { 'aria-label': '透传名' } })
        expect(trigger(explicit).attributes('aria-label')).toBe('显式名')

        const forwarded = mountPicker({}, { attrs: { 'aria-label': '透传名' } })
        expect(trigger(forwarded).attributes('aria-label')).toBe('透传名')
    })

    it('触发按钮使用注入 locale 的文案', () => {
        const wrapper = mountPicker({}, {
            global: { provide: { [caomeiLocaleKey]: computed(() => caomeiLocales['en-US']) } },
        })

        expect(trigger(wrapper).attributes('aria-label')).toBe('Color')
    })

    it('空值或非法值回退 defaultColor', () => {
        expect(swatchColor(mountPicker())).toContain('#ff0000')
        expect(swatchColor(mountPicker({ modelValue: 'not-a-color' }))).toContain('#ff0000')
        expect(
            swatchColor(mountPicker({ modelValue: '', defaultColor: '#0000ff' })),
        ).toContain('#0000ff')
    })

    it('外部 modelValue 变化同步到色块', async () => {
        const wrapper = mountPicker({ modelValue: '#ff0000' })

        await wrapper.setProps({ modelValue: '#0000ff' })
        await nextTick()

        expect(swatchColor(wrapper)).toContain('#0000ff')
    })

    it('点击触发按钮打开面板并渲染区域 / 色相 / 输入框', async () => {
        const wrapper = mountPicker({ modelValue: '#ff0000' })

        await openPanel(wrapper)

        expect(panel()).not.toBeNull()
        expect(panel()?.querySelector('.caomei-color-picker__area')).not.toBeNull()
        expect(panel()?.querySelector('.caomei-color-picker__hue')).not.toBeNull()
        expect(panel()?.querySelector('.caomei-color-picker__input')).not.toBeNull()
    })

    it('showInput 为 false 时不渲染十六进制输入框', async () => {
        const wrapper = mountPicker({ showInput: false })

        await openPanel(wrapper)

        expect(panel()?.querySelector('.caomei-color-picker__input')).toBeNull()
    })

    it('十六进制输入框输入后按 format 抛出 update:modelValue', async () => {
        const wrapper = mountPicker({ modelValue: '#ff0000' })

        await openPanel(wrapper)
        const input = new DOMWrapper(panel()?.querySelector('.caomei-color-picker__input') as Element)
        await input.setValue('#00ff00')
        await input.trigger('blur')
        await flush()

        expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['#00ff00'])
    })

    it.each([
        ['hex', '#00ff00'],
        ['rgb', 'rgb(0, 255, 0)'],
        ['hsb', 'hsb(120, 100%, 100%)'],
    ] as const)('format=%s 时序列化为对应字符串', async (format, expected) => {
        const wrapper = mountPicker({ modelValue: '#ff0000', format, swatches: ['#00ff00'] })

        await openPanel(wrapper)
        await new DOMWrapper(panel()?.querySelector('.caomei-color-picker__swatch') as Element).trigger('click')
        await flush()

        const emitted = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as string
        expect(emitted).toBe(expected)
    })

    it('未提供 swatches 时不渲染色板', async () => {
        const wrapper = mountPicker({ modelValue: '#ff0000' })

        await openPanel(wrapper)

        expect(panel()?.querySelector('.caomei-color-picker__swatches')).toBeNull()
    })

    it('inline 模式直接渲染面板且不渲染触发按钮', () => {
        const wrapper = mountPicker({ inline: true })

        expect(wrapper.find('.caomei-color-picker__trigger').exists()).toBe(false)
        expect(wrapper.find('.caomei-color-picker__panel--inline').exists()).toBe(true)
        expect(wrapper.find('.caomei-color-picker__area').exists()).toBe(true)
    })

    it('disabled 传递到触发按钮与面板区域', () => {
        const inlineWrapper = mountPicker({ inline: true, disabled: true })
        expect(inlineWrapper.get('.caomei-color-picker__area-bg').attributes('aria-disabled')).toBe('true')

        const wrapper = mountPicker({ disabled: true })
        expect(trigger(wrapper).attributes('disabled')).toBeDefined()
    })

    it('invalid 时标注 aria-invalid 与校验样式', () => {
        const wrapper = mountPicker({ invalid: true })

        expect(trigger(wrapper).attributes('aria-invalid')).toBe('true')
        expect(trigger(wrapper).classes()).toContain('caomei-color-picker__trigger--invalid')
    })

    it('透传原生属性到根元素', () => {
        const wrapper = mountPicker({ id: 'picker-1' })

        expect(wrapper.get('.caomei-color-picker').attributes('id')).toBe('picker-1')
    })
    it('面板内区域 / 色相 / 输入框 / 色板均使用内建 locale 可访问名', async () => {
        const wrapper = mountPicker({ modelValue: '#ff0000', swatches: ['#00ff00'] })

        await openPanel(wrapper)

        const labels = await Promise.resolve({
            area: panel()?.querySelector('.caomei-color-picker__area-thumb')?.getAttribute('aria-label'),
            hue: panel()?.querySelector('.caomei-color-picker__hue-thumb')?.getAttribute('aria-label'),
            hex: panel()?.querySelector('.caomei-color-picker__input')?.getAttribute('aria-label'),
            swatches: panel()?.querySelector('.caomei-color-picker__swatches')?.getAttribute('aria-label'),
        })
        expect(labels.area).toBe('饱和度与明度')
        expect(labels.hue).toBe('色相')
        expect(labels.hex).toBe('十六进制颜色')
        expect(labels.swatches).toBe('预设颜色')
    })

    it('可访问名落在 role=slider 的 thumb 上（覆盖 Reka 内建英文名）', async () => {
        const wrapper = mountPicker({ modelValue: '#ff0000' })

        await openPanel(wrapper)

        const hueThumb = panel()?.querySelector('.caomei-color-picker__hue-thumb')
        const areaThumb = panel()?.querySelector('.caomei-color-picker__area-thumb')
        expect(hueThumb?.getAttribute('role')).toBe('slider')
        expect(areaThumb?.getAttribute('role')).toBe('slider')
        expect(hueThumb?.getAttribute('aria-label')).toBe('色相')
        expect(areaThumb?.getAttribute('aria-label')).toBe('饱和度与明度')
    })

    it('英文 locale 下面板可访问名同样本地化', async () => {
        const wrapper = mountPicker({ modelValue: '#ff0000' }, {
            global: { provide: { [caomeiLocaleKey]: computed(() => caomeiLocales['en-US']) } },
        })

        await openPanel(wrapper)

        expect(panel()?.querySelector('.caomei-color-picker__hue-thumb')?.getAttribute('aria-label')).toBe('Hue')
        expect(panel()?.querySelector('.caomei-color-picker__area-thumb')?.getAttribute('aria-label')).toBe('Saturation and brightness')
    })

    it('十六进制输入非法值时失焦回退显示（不压制 Reka 内部编辑态）', async () => {
        const wrapper = mountPicker({ modelValue: '#ff0000' })

        await openPanel(wrapper)
        const input = new DOMWrapper(panel()?.querySelector('.caomei-color-picker__input') as Element)
        await input.setValue('zzz')
        await input.trigger('blur')
        await flush()

        const el = panel()?.querySelector('.caomei-color-picker__input') as HTMLInputElement
        expect(el.value).toBe('#ff0000')
        expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    })

    it('色板支持缩写十六进制并归一到 6 位', async () => {
        const wrapper = mountPicker({ modelValue: '#00ff00', swatches: ['#0f0'] })

        await openPanel(wrapper)

        const item = panel()?.querySelector('.caomei-color-picker__swatch')
        expect(item?.getAttribute('aria-label')).toBe('#00ff00')
        expect(item?.getAttribute('aria-pressed')).toBe('true')
    })

    it('带 alpha 的输入被剥离为 6 位十六进制', () => {
        const wrapper = mountPicker({ modelValue: '#00ff0080' })

        expect(swatchColor(wrapper)).toContain('#00ff00')
    })
    it('区域 thumb 的 aria-valuetext 本地化（覆盖 Reka 英文通道名）', async () => {
        const wrapper = mountPicker({ modelValue: '#00ff00' })

        await openPanel(wrapper)

        const thumb = panel()?.querySelector('.caomei-color-picker__area-thumb')
        const valueText = thumb?.getAttribute('aria-valuetext') ?? ''
        expect(valueText).toContain('饱和度')
        expect(valueText).toContain('明度')
        expect(valueText).not.toContain('Saturation')
    })

    it('色板以按钮组呈现，可访问名与按下态来自当前模型', async () => {
        const wrapper = mountPicker({ modelValue: '#e63946', swatches: ['#e63946', '#22c55e'] })

        await openPanel(wrapper)

        const items = () => Array.from(panel()?.querySelectorAll('.caomei-color-picker__swatch') ?? [])
        expect(panel()?.querySelector('.caomei-color-picker__swatches')?.getAttribute('role')).toBe('group')
        expect(items()[0]?.tagName).toBe('BUTTON')
        expect(items()[0]?.getAttribute('aria-label')).toBe('#e63946')
        expect(items()[0]?.getAttribute('aria-pressed')).toBe('true')
        expect(items()[1]?.getAttribute('aria-pressed')).toBe('false')
    })
    it.each([
        ['#ffcccc', 20],
        ['#22c55e', 83],
    ] as const)('区域 thumb 的程序值 / 播报值 / 位置同源（%s）', async (color, expected) => {
        const wrapper = mountPicker({ modelValue: color })

        await openPanel(wrapper)

        const thumb = panel()?.querySelector('.caomei-color-picker__area-thumb') as HTMLElement
        expect(Number(thumb.getAttribute('aria-valuenow'))).toBe(expected)
        expect(thumb.getAttribute('aria-valuetext')).toContain(`饱和度 ${expected}`)
        expect(thumb.style.left).toBe(`${expected}%`)
    })
    it('区域 pointerdown 捕获阶段先让输入框失焦（避免 blur 旧值覆盖点击结果）', async () => {
        const wrapper = mountPicker({ modelValue: '#ff0000' })

        await openPanel(wrapper)

        const inputEl = panel()?.querySelector('.caomei-color-picker__input') as HTMLInputElement
        inputEl.focus()
        expect(document.activeElement).toBe(inputEl)

        let blurred = false
        inputEl.addEventListener('blur', () => {
            blurred = true
        })
        panel()
            ?.querySelector('.caomei-color-picker__area-bg')
            ?.dispatchEvent(new Event('pointerdown', { bubbles: true, cancelable: true }))
        await nextTick()

        expect(blurred).toBe(true)
        expect(document.activeElement).not.toBe(inputEl)
    })
    it('区域与 thumb 的 aria-roledescription 本地化（覆盖 Reka 英文）', async () => {
        const wrapper = mountPicker({ modelValue: '#ff0000' })

        await openPanel(wrapper)

        expect(panel()?.querySelector('.caomei-color-picker__area-bg')?.getAttribute('aria-roledescription')).toBe('颜色选择区域')
        expect(panel()?.querySelector('.caomei-color-picker__area-thumb')?.getAttribute('aria-roledescription')).toBe('颜色滑块')
    })

    it('区域 valuenow 与 valuetext 同源（均由模型派生且为整数）', async () => {
        // #ffcccc：HSL 100 / HSB 20 背离；低亮度下 Reka 指针值会与模型量化值差 ~2
        const wrapper = mountPicker({ modelValue: '#ffcccc' })

        await openPanel(wrapper)

        const thumb = panel()?.querySelector('.caomei-color-picker__area-thumb')
        expect(thumb?.getAttribute('aria-valuenow')).toBe('20')
        expect(thumb?.getAttribute('aria-valuetext')).toContain('饱和度 20')

        await wrapper.setProps({ modelValue: '#3b82f6' })
        await flush()

        const after = panel()?.querySelector('.caomei-color-picker__area-thumb')
        expect(after?.getAttribute('aria-valuenow')).toBe('76')
        expect(after?.getAttribute('aria-valuetext')).toContain('饱和度 76')
    })

    it('色板按下态随外部改色同步', async () => {
        const wrapper = mountPicker({ modelValue: '#e63946', swatches: ['#e63946', '#22c55e'] })

        await openPanel(wrapper)
        const items = () => Array.from(panel()?.querySelectorAll('.caomei-color-picker__swatch') ?? [])

        expect(items()[0]?.getAttribute('aria-pressed')).toBe('true')
        expect(items()[1]?.getAttribute('aria-pressed')).toBe('false')

        await wrapper.setProps({ modelValue: '#22c55e' })
        await flush()

        expect(items()[0]?.getAttribute('aria-pressed')).toBe('false')
        expect(items()[1]?.getAttribute('aria-pressed')).toBe('true')
    })
})
