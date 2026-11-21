import { mount } from '@vue/test-utils'
import { h } from 'vue'
import { describe, expect, it } from 'vitest'
import { CaomeiTimeline, CaomeiTimelineItem } from './index'

function mountTimeline(props: Record<string, unknown> = {}, items: Record<string, unknown>[] = []) {
    return mount(CaomeiTimeline, {
        props,
        slots: {
            default: () => items.map((item) => h(CaomeiTimelineItem, item)),
        },
    })
}

describe('CaomeiTimeline', () => {
    it('渲染节点、时间戳、正文与语气', () => {
        const wrapper = mountTimeline({ label: '发布记录' }, [
            { title: '1.0.0', content: '首个正式版本', timestamp: '2026-09-01', tone: 'success' },
            { title: '1.1.0', timestamp: '2026-11-06' },
        ])

        expect(wrapper.get('.caomei-timeline').attributes('aria-label')).toBe('发布记录')
        expect(wrapper.findAll('.caomei-timeline__item')).toHaveLength(2)
        expect(wrapper.get('.caomei-timeline__item').attributes('data-tone')).toBe('success')
        expect(wrapper.text()).toContain('首个正式版本')
        expect(wrapper.text()).toContain('2026-09-01')
    })

    it('mode 与 reverse 输出布局类', () => {
        const wrapper = mountTimeline({ mode: 'alternate', reverse: true }, [{ title: 'A' }])

        expect(wrapper.get('.caomei-timeline').classes()).toContain('caomei-timeline--alternate')
        expect(wrapper.get('.caomei-timeline').classes()).toContain('caomei-timeline--reverse')
    })

    it('默认插槽可自定义节点内容', () => {
        const wrapper = mount(CaomeiTimeline, {
            slots: {
                default: () => h(CaomeiTimelineItem, { title: '节点' }, () => '自定义内容'),
            },
        })

        expect(wrapper.text()).toContain('自定义内容')
    })
})
