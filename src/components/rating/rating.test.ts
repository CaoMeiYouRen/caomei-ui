import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { createSSRApp, h, nextTick } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { CaomeiRating } from './index'

afterEach(() => {
    document.body.innerHTML = ''
})

describe('CaomeiRating', () => {
    it('按最大分值渲染图标与可访问角色', async () => {
        const wrapper = mount(CaomeiRating, {
            props: { modelValue: 0, label: '评分' },
            attachTo: document.body,
        })
        await nextTick()

        expect(wrapper.findAll('.caomei-rating__item')).toHaveLength(5)
        expect(wrapper.get('[role="radiogroup"]').attributes('aria-label')).toBe('评分')
        expect(wrapper.findAll('[role="radio"]')).toHaveLength(5)

        wrapper.unmount()
    })

    it('max 改变渲染数量', async () => {
        const wrapper = mount(CaomeiRating, { props: { modelValue: 0, max: 10 }, attachTo: document.body })
        await nextTick()

        expect(wrapper.findAll('.caomei-rating__item')).toHaveLength(10)
        expect(wrapper.findAll('[role="radio"]')).toHaveLength(10)

        wrapper.unmount()
    })

    it('点击星级回传分值', async () => {
        const wrapper = mount(CaomeiRating, { props: { modelValue: 0 }, attachTo: document.body })
        await nextTick()

        await wrapper.findAll('.caomei-rating__step')[2].trigger('click')
        await nextTick()

        expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([3])

        wrapper.unmount()
    })

    it('step=0.5 时每个星有两个指示器，半星可选且只着色最右一格', async () => {
        const wrapper = mount(CaomeiRating, { props: { modelValue: 0.5, step: 0.5 }, attachTo: document.body })
        await nextTick()

        expect(wrapper.findAll('[role="radio"]')).toHaveLength(10)

        // 半星指示器的宽度由 primitive 变量给出，且被裁切
        const steps = wrapper.findAll('.caomei-rating__step')
        expect(steps[0].attributes('style')).toContain('--reka-rating-item-step-width: 50%')

        // 值 0.5 只着色该半格：整星格不得同时着色（否则叠成整星）
        const painted = wrapper.findAll('.caomei-rating__step[data-painted]')
        expect(painted).toHaveLength(1)
        expect(painted[0].attributes('aria-label')).toBe('0.5')

        wrapper.unmount()

        // 从 0 起：左半与整星两路分别选到 0.5 / 1
        const fresh = mount(CaomeiRating, { props: { modelValue: 0, step: 0.5 }, attachTo: document.body })
        await nextTick()
        const freshSteps = fresh.findAll('.caomei-rating__step')
        await freshSteps[0].trigger('click')
        await nextTick()
        expect(fresh.emitted('update:modelValue')?.at(-1)).toEqual([0.5])

        await freshSteps[1].trigger('click')
        await nextTick()
        expect(fresh.emitted('update:modelValue')?.at(-1)).toEqual([1])

        fresh.unmount()
    })

    it('readonly 时不可交互且标注 aria-readonly', async () => {
        const wrapper = mount(CaomeiRating, { props: { modelValue: 3, readonly: true }, attachTo: document.body })
        await nextTick()

        const root = wrapper.get('.caomei-rating')
        expect(root.attributes('aria-readonly')).toBe('true')
        expect(root.classes()).toContain('caomei-rating--readonly')
        // 每个 step 都落 disabled，且不可聚焦
        for (const radio of wrapper.findAll('[role="radio"]')) {
            expect(radio.attributes('disabled')).toBeDefined()
            expect(radio.attributes('tabindex')).toBe('-1')
        }

        await wrapper.findAll('.caomei-rating__step')[0].trigger('click')
        await nextTick()
        expect(wrapper.emitted('update:modelValue')).toBeUndefined()

        wrapper.unmount()
    })

    it('disabled 时不可交互并降低不透明度', async () => {
        const wrapper = mount(CaomeiRating, { props: { modelValue: 2, disabled: true }, attachTo: document.body })
        await nextTick()

        expect(wrapper.get('.caomei-rating').classes()).toContain('caomei-rating--disabled')

        await wrapper.findAll('.caomei-rating__step')[0].trigger('click')
        await nextTick()
        expect(wrapper.emitted('update:modelValue')).toBeUndefined()

        wrapper.unmount()
    })

    it('键盘方向键切换分值', async () => {
        const wrapper = mount(CaomeiRating, { props: { modelValue: 2 }, attachTo: document.body })
        await nextTick()

        const radios = wrapper.findAll('[role="radio"]')
        const checked = radios.find((radio) => radio.attributes('aria-checked') === 'true')
        expect(checked).toBeDefined()
        await checked?.trigger('keydown', { key: 'ArrowRight' })
        // 方向键先把焦点移到下一项，primitive 在 focus 的宏任务里补一次 click 才提交分值
        await new Promise((resolve) => setTimeout(resolve, 0))
        await nextTick()

        expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([3])
        // roving focus 真的移到了下一项（否则上面的推送来自别处）
        expect((document.activeElement as HTMLElement | null)?.getAttribute('aria-label')).toBe('3')

        wrapper.unmount()
    })

    it('未传 label 时取语言兜底文案，只读取只读文案', async () => {
        const wrapper = mount(CaomeiRating, { props: { modelValue: 3 }, attachTo: document.body })
        await nextTick()
        expect(wrapper.get('[role="radiogroup"]').attributes('aria-label')).toBe('评分')
        wrapper.unmount()

        const readonly = mount(CaomeiRating, { props: { modelValue: 3, readonly: true }, attachTo: document.body })
        await nextTick()
        expect(readonly.get('[role="radiogroup"]').attributes('aria-label')).toBe('只读评分')
        readonly.unmount()
    })

    it('运行期切到只读后名称更新，显式 label 始终优先', async () => {
        const wrapper = mount(CaomeiRating, { props: { modelValue: 3, label: '服务评分' }, attachTo: document.body })
        await nextTick()
        expect(wrapper.get('[role="radiogroup"]').attributes('aria-label')).toBe('服务评分')

        await wrapper.setProps({ readonly: true })
        expect(wrapper.get('[role="radiogroup"]').attributes('aria-label')).toBe('服务评分')

        await wrapper.setProps({ readonly: false })
        expect(wrapper.get('[role="radiogroup"]').attributes('aria-label')).toBe('服务评分')

        const unnamed = mount(CaomeiRating, { props: { modelValue: 3 }, attachTo: document.body })
        await nextTick()
        expect(unnamed.get('[role="radiogroup"]').attributes('aria-label')).toBe('评分')
        await unnamed.setProps({ readonly: true })
        expect(unnamed.get('[role="radiogroup"]').attributes('aria-label')).toBe('只读评分')
        unnamed.unmount()

        wrapper.unmount()
    })

    it('label 传空串时回退语言兜底文案', async () => {
        const wrapper = mount(CaomeiRating, { props: { modelValue: 3, label: '' }, attachTo: document.body })
        await nextTick()
        expect(wrapper.get('[role="radiogroup"]').attributes('aria-label')).toBe('评分')
        wrapper.unmount()
    })

    it('SSR 输出评分区域与步骤语义', async () => {
        const app = createSSRApp({ render: () => h(CaomeiRating, { modelValue: 3, label: '评分' }) })
        const html = await renderToString(app)

        expect(html).toContain('role="radiogroup"')
        expect(html).toContain('aria-label="评分"')
        expect(html).toContain('role="radio"')
    })

    it('字段契约：label / invalid / id 落到评分根', () => {
        const wrapper = mount(CaomeiRating, {
            props: { label: '服务评分', invalid: true, id: 'rating-field', modelValue: 2 },
            attachTo: document.body,
        })

        const root = document.querySelector('.caomei-rating') as HTMLElement
        expect(root.getAttribute('role')).toBe('radiogroup')
        expect(root.getAttribute('aria-label')).toBe('服务评分')
        expect(root.getAttribute('aria-invalid')).toBe('true')
        expect(root.getAttribute('id')).toBe('rating-field')

        wrapper.unmount()
    })

    it('字段契约：name 提交当前分值', () => {
        const wrapper = mount(
            () => h('form', { id: 'rating-form' }, [h(CaomeiRating, { name: 'score', modelValue: 3 })]),
            { attachTo: document.body },
        )

        const form = document.getElementById('rating-form') as HTMLFormElement | null
        expect(form).not.toBeNull()
        expect([...(form ? new FormData(form) : new FormData()).entries()]).toEqual([['score', '3']])

        wrapper.unmount()
    })

    it('字段契约：透传 aria-label 在无 label 时生效', () => {
        const wrapper = mount(CaomeiRating, {
            props: { 'aria-label': '外部名称', modelValue: 1 },
            attachTo: document.body,
        })

        const root = document.querySelector('.caomei-rating') as HTMLElement
        expect(root.getAttribute('aria-label')).toBe('外部名称')

        wrapper.unmount()
    })

    it('字段契约：prop 的 invalid 优先于透传 aria-invalid', () => {
        const wrapper = mount(CaomeiRating, {
            props: { 'aria-invalid': 'false', modelValue: 1 },
            attachTo: document.body,
        })

        const root = document.querySelector('.caomei-rating') as HTMLElement
        expect(root.hasAttribute('aria-invalid')).toBe(false)

        const invalidWrapper = mount(CaomeiRating, {
            props: { 'aria-invalid': 'false', invalid: true, modelValue: 1 },
            attachTo: document.body,
        })
        const invalidRoot = document.querySelectorAll('.caomei-rating')[1] as HTMLElement
        expect(invalidRoot.getAttribute('aria-invalid')).toBe('true')

        wrapper.unmount()
        invalidWrapper.unmount()
    })
})
