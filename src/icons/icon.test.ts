import { mount } from '@vue/test-utils'
import { computed, createSSRApp, defineComponent, h, nextTick, provide, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { describe, expect, it, vi } from 'vitest'
import CaomeiIcon from './icon.vue'
import { caomeiIconRegistryKey, provideIconRegistry } from './registry'

const DummyIcon = defineComponent({
    name: 'DummyIcon',
    props: {
        size: { type: [Number, String], default: undefined },
        strokeWidth: { type: [Number, String], default: undefined },
    },
    template: '<svg data-dummy="icon" :data-size="size" :data-stroke="strokeWidth" />',
})

const AltIcon = defineComponent({
    name: 'AltIcon',
    template: '<svg data-alt="icon" />',
})

describe('CaomeiIcon 三态解析', () => {
    it('icon 组件直接渲染，默认 size 为 1em', () => {
        const wrapper = mount(CaomeiIcon, { props: { icon: DummyIcon } })
        const icon = wrapper.find('[data-dummy="icon"]')
        expect(icon.exists()).toBe(true)
        expect(icon.attributes('data-size')).toBe('1em')
        expect(icon.classes()).toContain('caomei-icon')
    })

    it('name 经 provideIconRegistry 解析', () => {
        const wrapper = mount(defineComponent({
            setup() {
                provideIconRegistry({ star: AltIcon })
                return () => h(CaomeiIcon, { name: 'star' })
            },
        }))
        expect(wrapper.find('[data-alt="icon"]').exists()).toBe(true)
    })

    it('icon 优先于 name', () => {
        const wrapper = mount(defineComponent({
            setup() {
                provideIconRegistry({ star: AltIcon })
                return () => h(CaomeiIcon, { icon: DummyIcon, name: 'star' })
            },
        }))
        expect(wrapper.find('[data-dummy="icon"]').exists()).toBe(true)
        expect(wrapper.find('[data-alt="icon"]').exists()).toBe(false)
    })

    it('注册表变化响应式生效', async () => {
        const registry = ref({ star: AltIcon })
        const wrapper = mount(defineComponent({
            setup() {
                provideIconRegistry(registry)
                return () => h(CaomeiIcon, { name: 'star' })
            },
        }))
        expect(wrapper.find('[data-alt="icon"]').exists()).toBe(true)
        registry.value = { star: DummyIcon }
        await nextTick()
        expect(wrapper.find('[data-dummy="icon"]').exists()).toBe(true)
    })

    it('size / strokeWidth 传递给图标组件', () => {
        const wrapper = mount(CaomeiIcon, { props: { icon: DummyIcon, size: 16, strokeWidth: 1.5 } })
        const icon = wrapper.find('[data-dummy="icon"]')
        expect(icon.attributes('data-size')).toBe('16')
        expect(icon.attributes('data-stroke')).toBe('1.5')
    })

    it('缺少 icon / name 时渲染空占位并告警', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
        const wrapper = mount(CaomeiIcon)
        expect(wrapper.find('[data-caomei-icon-missing]').exists()).toBe(true)
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('需要 icon 或 name'))
        warn.mockRestore()
    })

    it('name 未注册时告警', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
        const wrapper = mount(CaomeiIcon, { props: { name: 'missing' } })
        expect(wrapper.find('[data-caomei-icon-missing]').exists()).toBe(true)
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('未在图标注册表中找到 "missing"'))
        warn.mockRestore()
    })
})

describe('CaomeiIcon 可访问名优先级', () => {
    it('无标注时默认 aria-hidden="true"', () => {
        const wrapper = mount(CaomeiIcon, { props: { icon: DummyIcon } })
        expect(wrapper.find('svg').attributes('aria-hidden')).toBe('true')
    })

    it('label 输出 role="img" + aria-label，且覆盖透传 aria-label', () => {
        const wrapper = mount(CaomeiIcon, {
            props: { icon: DummyIcon, label: '关闭' },
            attrs: { 'aria-label': '外部标签' },
        })
        const icon = wrapper.find('svg')
        expect(icon.attributes('role')).toBe('img')
        expect(icon.attributes('aria-label')).toBe('关闭')
        expect(icon.attributes('aria-hidden')).toBeUndefined()
    })

    it('透传 aria-* 时不加 aria-hidden', () => {
        const wrapper = mount(CaomeiIcon, {
            props: { icon: DummyIcon },
            attrs: { 'aria-label': '装饰说明' },
        })
        const icon = wrapper.find('svg')
        expect(icon.attributes('aria-label')).toBe('装饰说明')
        expect(icon.attributes('aria-hidden')).toBeUndefined()
    })

    it('label 覆盖透传的 aria-hidden', () => {
        const wrapper = mount(CaomeiIcon, {
            props: { icon: DummyIcon, label: '关闭' },
            attrs: { 'aria-hidden': 'true' },
        })
        const icon = wrapper.find('svg')
        expect(icon.attributes('aria-label')).toBe('关闭')
        expect(icon.attributes('aria-hidden')).toBeUndefined()
    })

    it('挂载后新增 aria-label 时移除默认 aria-hidden', async () => {
        const extraAttrs = ref<Record<string, string>>({})
        const wrapper = mount(defineComponent({
            setup() {
                return () => h(CaomeiIcon, { icon: DummyIcon, ...extraAttrs.value })
            },
        }))
        expect(wrapper.find('svg').attributes('aria-hidden')).toBe('true')
        extraAttrs.value = { 'aria-label': '后到的标签' }
        await nextTick()
        expect(wrapper.find('svg').attributes('aria-label')).toBe('后到的标签')
        expect(wrapper.find('svg').attributes('aria-hidden')).toBeUndefined()
    })

    it('透传 role / title 时不加 aria-hidden', () => {
        const withRole = mount(CaomeiIcon, { props: { icon: DummyIcon }, attrs: { role: 'img' } })
        expect(withRole.find('svg').attributes('aria-hidden')).toBeUndefined()

        const withTitle = mount(CaomeiIcon, { props: { icon: DummyIcon }, attrs: { title: '提示' } })
        expect(withTitle.find('svg').attributes('aria-hidden')).toBeUndefined()
    })
})

describe('CaomeiIcon SSR 隔离', () => {
    it('不同请求的注册表互不泄漏', async () => {
        const IconA = defineComponent({ template: '<svg data-icon-a />' })
        const IconB = defineComponent({ template: '<svg data-icon-b />' })

        const appA = createSSRApp({
            setup() {
                provideIconRegistry({ star: IconA })
                return () => h(CaomeiIcon, { name: 'star' })
            },
        })
        const appB = createSSRApp({
            setup() {
                provideIconRegistry({ star: IconB })
                return () => h(CaomeiIcon, { name: 'star' })
            },
        })

        const htmlA = await renderToString(appA)
        const htmlB = await renderToString(appB)
        expect(htmlA).toContain('data-icon-a')
        expect(htmlA).not.toContain('data-icon-b')
        expect(htmlB).toContain('data-icon-b')
        expect(htmlB).not.toContain('data-icon-a')
    })

    it('无 provider 时回退空注册表', async () => {
        const app = createSSRApp({
            setup() {
                return () => h(CaomeiIcon, { name: 'star' })
            },
        })
        const html = await renderToString(app)
        expect(html).toContain('data-caomei-icon-missing')
    })

    it('导出注入键可供高级用法手写 provide', () => {
        const wrapper = mount(defineComponent({
            setup() {
                provide(caomeiIconRegistryKey, computed(() => ({ star: AltIcon })))
                return () => h(CaomeiIcon, { name: 'star' })
            },
        }))
        expect(wrapper.find('[data-alt="icon"]').exists()).toBe(true)
    })
})
