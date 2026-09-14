import { mount } from '@vue/test-utils'
import { computed, defineComponent, h, nextTick } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { caomeiLocaleKey } from '../../composables/use-locale'
import { caomeiLocales } from '../../locale'
import { CaomeiSlider, type SliderValue } from './index'

function getThumbs(wrapper: ReturnType<typeof mount>) {
    return wrapper.findAll('[role="slider"]')
}

/** 受控组件需同时提供 modelValue 与 update 监听，才会进入受控回环 */
function controlledProps(value: SliderValue, extra: Record<string, unknown> = {}) {
    return { modelValue: value, 'onUpdate:modelValue': vi.fn(), ...extra }
}

describe('CaomeiSlider', () => {
    it('渲染单个滑块并输出数值范围', async () => {
        const wrapper = mount(CaomeiSlider, { props: { modelValue: 20 } })
        await nextTick()

        const thumb = getThumbs(wrapper)[0]
        expect(thumb.attributes('role')).toBe('slider')
        expect(thumb.attributes('aria-valuenow')).toBe('20')
        expect(thumb.attributes('aria-valuemin')).toBe('0')
        expect(thumb.attributes('aria-valuemax')).toBe('100')
        expect(thumb.attributes('aria-orientation')).toBe('horizontal')
        expect(wrapper.get('.caomei-slider').classes()).toContain('caomei-slider--horizontal')
    })

    it('单滑块缺省可访问名为内建文案', () => {
        const wrapper = mount(CaomeiSlider, { props: { modelValue: 20 } })

        expect(getThumbs(wrapper)[0].attributes('aria-label')).toBe('滑块')
    })

    it('label 覆盖单滑块可访问名', () => {
        const wrapper = mount(CaomeiSlider, { props: { modelValue: 20, label: '音量' } })

        expect(getThumbs(wrapper)[0].attributes('aria-label')).toBe('音量')
    })

    it('受控时方向键按步进更新 v-model', async () => {
        const wrapper = mount(CaomeiSlider, { props: controlledProps(20) })

        await getThumbs(wrapper)[0].trigger('keydown', { key: 'ArrowRight' })

        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([21])
    })

    it('未绑定 v-model 时方向键切换内部值', async () => {
        const wrapper = mount(CaomeiSlider, { props: { defaultValue: 20 } })

        await getThumbs(wrapper)[0].trigger('keydown', { key: 'ArrowRight' })
        await nextTick()

        expect(getThumbs(wrapper)[0].attributes('aria-valuenow')).toBe('21')
    })

    it('min / max / step 生效且不越界', async () => {
        const wrapper = mount(CaomeiSlider, { props: controlledProps(95, { min: 10, max: 100, step: 10 }) })

        const thumb = getThumbs(wrapper)[0]
        expect(thumb.attributes('aria-valuemin')).toBe('10')
        expect(thumb.attributes('aria-valuemax')).toBe('100')

        await thumb.trigger('keydown', { key: 'ArrowRight' })
        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([100])
    })

    it('change 在交互结束时触发', async () => {
        const wrapper = mount(CaomeiSlider, { props: controlledProps(20) })

        await getThumbs(wrapper)[0].trigger('keydown', { key: 'ArrowRight' })

        expect(wrapper.emitted('change')?.[0]).toEqual([21])
    })

    it('数组值渲染范围滑块并输出双滑块可访问名', async () => {
        const wrapper = mount(CaomeiSlider, { props: { modelValue: [20, 80] } })
        await nextTick()

        const thumbs = getThumbs(wrapper)
        expect(thumbs).toHaveLength(2)
        expect(thumbs[0].attributes('aria-label')).toBe('最小值')
        expect(thumbs[1].attributes('aria-label')).toBe('最大值')
        expect(thumbs[0].attributes('aria-valuenow')).toBe('20')
        expect(thumbs[1].attributes('aria-valuenow')).toBe('80')
    })

    it('thumbLabels 覆盖范围滑块可访问名', () => {
        const wrapper = mount(CaomeiSlider, {
            props: { modelValue: [20, 80], thumbLabels: ['起始', '结束'] },
        })

        const thumbs = getThumbs(wrapper)
        expect(thumbs[0].attributes('aria-label')).toBe('起始')
        expect(thumbs[1].attributes('aria-label')).toBe('结束')
    })

    it('范围滑块更新回传数组', async () => {
        const wrapper = mount(CaomeiSlider, { props: controlledProps([20, 80]) })

        await getThumbs(wrapper)[0].trigger('keydown', { key: 'ArrowRight' })

        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([[21, 80]])
    })

    it('非受控 defaultValue 数组渲染范围滑块并回传数组', async () => {
        const wrapper = mount(CaomeiSlider, { props: { defaultValue: [30, 70] } })
        await nextTick()

        expect(getThumbs(wrapper)).toHaveLength(2)

        await getThumbs(wrapper)[0].trigger('keydown', { key: 'ArrowRight' })
        await nextTick()

        expect(getThumbs(wrapper)[0].attributes('aria-valuenow')).toBe('31')
        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([[31, 70]])
        expect(wrapper.emitted('change')?.[0]).toEqual([[31, 70]])
    })

    it('minStepsBetweenThumbs 约束范围滑块最小间隔', async () => {
        const wrapper = mount(CaomeiSlider, {
            props: controlledProps([20, 30], { minStepsBetweenThumbs: 20 }),
        })

        await getThumbs(wrapper)[0].trigger('keydown', { key: 'ArrowRight' })

        expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    })

    it('多滑块缺省可访问名带序号', () => {
        const wrapper = mount(CaomeiSlider, { props: { modelValue: [10, 50, 90] } })

        expect(getThumbs(wrapper).map((thumb) => thumb.attributes('aria-label'))).toEqual([
            '滑块 1',
            '滑块 2',
            '滑块 3',
        ])
    })

    it('aria-describedby 透传到滑块', () => {
        const wrapper = mount(CaomeiSlider, {
            props: { modelValue: 20 },
            attrs: { 'aria-describedby': 'volume-hint' },
        })

        expect(getThumbs(wrapper)[0].attributes('aria-describedby')).toBe('volume-hint')
    })

    it('vertical 输出方向属性与类', () => {
        const wrapper = mount(CaomeiSlider, { props: { modelValue: 20, orientation: 'vertical' } })

        expect(getThumbs(wrapper)[0].attributes('aria-orientation')).toBe('vertical')
        expect(wrapper.get('.caomei-slider').classes()).toContain('caomei-slider--vertical')
    })

    it('disabled 时不可聚焦且应用状态类', () => {
        const wrapper = mount(CaomeiSlider, { props: { modelValue: 20, disabled: true } })

        const thumb = getThumbs(wrapper)[0]
        expect(thumb.attributes('tabindex')).toBeUndefined()
        expect(wrapper.get('.caomei-slider').attributes('data-disabled')).toBeDefined()
        expect(wrapper.get('.caomei-slider').classes()).toContain('caomei-slider--disabled')
    })

    it('位于表单内时输出携带值的隐藏输入', () => {
        const wrapper = mount(defineComponent({
            setup() {
                return () => h('form', [
                    h(CaomeiSlider, { name: 'volume', required: true, modelValue: 20 }),
                ])
            },
        }))

        const input = wrapper.get('input[name="volume[0]"]')
        expect((input.element as HTMLInputElement).value).toBe('20')
        expect(input.attributes('required')).toBeDefined()
    })

    it('无 name 时不输出隐藏输入', () => {
        const wrapper = mount(defineComponent({
            setup() {
                return () => h('form', [h(CaomeiSlider, { modelValue: 20 })])
            },
        }))

        expect(wrapper.find('input').exists()).toBe(false)
    })

    it('class 透传到根元素', () => {
        const wrapper = mount(CaomeiSlider, { props: { modelValue: 20 }, attrs: { class: 'custom' } })

        expect(wrapper.get('.caomei-slider').classes()).toContain('custom')
    })

    it('滑块可访问名使用注入 locale 的文案', () => {
        const provide = { [caomeiLocaleKey]: computed(() => caomeiLocales['en-US']) }

        const single = mount(CaomeiSlider, {
            props: { modelValue: 20 },
            global: { provide },
        })
        expect(getThumbs(single)[0].attributes('aria-label')).toBe('Slider')

        const range = mount(CaomeiSlider, {
            props: { modelValue: [20, 80] },
            global: { provide },
        })
        const thumbs = getThumbs(range)
        expect(thumbs[0].attributes('aria-label')).toBe('Minimum')
        expect(thumbs[1].attributes('aria-label')).toBe('Maximum')
    })
})
