import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { internalIcons } from '../../icons'
import { CaomeiEmpty } from './index'

describe('CaomeiEmpty', () => {
    it('默认渲染标题、说明与默认图标', () => {
        const wrapper = mount(CaomeiEmpty, { props: { description: '换个条件试试' } })

        const root = wrapper.get('.caomei-empty')
        expect(root.element.tagName).toBe('DIV')
        expect(root.classes()).toContain('caomei-empty--md')
        expect(wrapper.get('.caomei-empty__title').text()).toBe('暂无数据')
        expect(wrapper.get('.caomei-empty__description').text()).toBe('换个条件试试')
        expect(wrapper.find('.caomei-empty__icon--default').exists()).toBe(true)
    })

    it('提供的 icon 替代默认图标', () => {
        const wrapper = mount(CaomeiEmpty, { props: { icon: internalIcons.dismiss } })

        expect(wrapper.find('.caomei-empty__icon--default').exists()).toBe(false)
        expect(wrapper.get('.caomei-empty__icon').html()).toContain('svg')
    })

    it('image 优先于 icon 并输出 alt', () => {
        const wrapper = mount(CaomeiEmpty, {
            props: { icon: internalIcons.dismiss, image: '/demo/placeholder.svg', imageAlt: '空文件夹' },
        })

        const image = wrapper.get('img.caomei-empty__image')
        expect(image.attributes('src')).toBe('/demo/placeholder.svg')
        expect(image.attributes('alt')).toBe('空文件夹')
        expect(wrapper.find('svg.caomei-empty__icon').exists()).toBe(false)
    })

    it('image 插槽优先于 image 属性', () => {
        const wrapper = mount(CaomeiEmpty, {
            props: { image: '/demo/placeholder.svg' },
            slots: { image: '<span data-test="image-slot">自定义图</span>' },
        })

        expect(wrapper.find('[data-test="image-slot"]').exists()).toBe(true)
        expect(wrapper.find('img').exists()).toBe(false)
    })

    it('尺寸档切换样式类', () => {
        const wrapper = mount(CaomeiEmpty, { props: { size: 'lg' } })

        expect(wrapper.get('.caomei-empty').classes()).toContain('caomei-empty--lg')
    })

    it('as 指定根元素标签', () => {
        const wrapper = mount(CaomeiEmpty, { props: { as: 'section' } })

        expect(wrapper.get('.caomei-empty').element.tagName).toBe('SECTION')
    })

    it('标题与说明插槽覆盖属性文案', () => {
        const wrapper = mount(CaomeiEmpty, {
            props: { title: '属性标题', description: '属性说明' },
            slots: {
                title: '<span data-test="title">插槽标题</span>',
                description: '<span data-test="description">插槽说明</span>',
            },
        })

        expect(wrapper.get('.caomei-empty__title').text()).toBe('插槽标题')
        expect(wrapper.get('.caomei-empty__description').text()).toBe('插槽说明')
    })

    it('action 插槽渲染操作区', () => {
        const wrapper = mount(CaomeiEmpty, {
            slots: { action: '<button data-test="action">新建</button>' },
        })

        expect(wrapper.get('.caomei-empty__action').find('[data-test="action"]').exists()).toBe(true)
    })

    it('无说明与操作插槽时不渲染对应节点', () => {
        const wrapper = mount(CaomeiEmpty)

        expect(wrapper.find('.caomei-empty__description').exists()).toBe(false)
        expect(wrapper.find('.caomei-empty__action').exists()).toBe(false)
    })
})
