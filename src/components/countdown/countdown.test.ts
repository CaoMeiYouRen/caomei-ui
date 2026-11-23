import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { CaomeiCountdown } from './index'

const NOW = new Date('2026-11-23T10:00:00.000Z').getTime()

describe('CaomeiCountdown', () => {
    beforeEach(() => {
        vi.useFakeTimers()
        vi.setSystemTime(NOW)
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('按默认 HH:mm:ss 渲染剩余时间并每秒递减', async () => {
        const wrapper = mount(CaomeiCountdown, { props: { target: NOW + 3661 * 1000 } })

        expect(wrapper.text()).toBe('01:01:01')

        vi.advanceTimersByTime(1000)
        await nextTick()
        expect(wrapper.text()).toBe('01:01:00')
    })

    it('累计小时超过 24 时 HH 可大于 24，含 DD 时 HH 取当日小时', async () => {
        const wrapper = mount(CaomeiCountdown, { props: { target: NOW + (26 * 3600 + 61) * 1000 } })

        expect(wrapper.text()).toBe('26:01:01')

        await wrapper.setProps({ format: 'DD HH:mm:ss' })
        expect(wrapper.text()).toBe('01 02:01:01')
    })

    it('自定义格式支持 DD / mm / ss / SSS', async () => {
        const wrapper = mount(CaomeiCountdown, {
            props: { target: NOW + 90_500, format: 'mm:ss.SSS', interval: 250 },
        })

        expect(wrapper.text()).toBe('01:30.500')

        vi.advanceTimersByTime(250)
        await nextTick()
        expect(wrapper.text()).toBe('01:30.250')
    })

    it('到点后按格式渲染零值并只触发一次 finish', async () => {
        const wrapper = mount(CaomeiCountdown, { props: { target: NOW + 2000 } })

        expect(wrapper.emitted('finish')).toBeUndefined()

        vi.advanceTimersByTime(2000)
        await nextTick()
        expect(wrapper.text()).toBe('00:00:00')
        expect(wrapper.attributes('data-finished')).toBe('')
        expect(wrapper.emitted('finish')).toHaveLength(1)

        vi.advanceTimersByTime(5000)
        await nextTick()
        expect(wrapper.emitted('finish')).toHaveLength(1)
        expect(vi.getTimerCount()).toBe(0)
    })

    it('finishText 在到点后替代零值', async () => {
        const wrapper = mount(CaomeiCountdown, { props: { target: NOW + 1000, finishText: '已结束' } })

        vi.advanceTimersByTime(1000)
        await nextTick()
        expect(wrapper.text()).toBe('已结束')
    })

    it('autoStart 为 false 时不启动计时，但仍渲染初始剩余', async () => {
        const wrapper = mount(CaomeiCountdown, {
            props: { target: NOW + 10_000, autoStart: false },
        })

        expect(wrapper.text()).toBe('00:00:10')
        expect(vi.getTimerCount()).toBe(0)

        vi.advanceTimersByTime(5000)
        await nextTick()
        expect(wrapper.text()).toBe('00:00:10')
    })

    it('切换 target 后重新计时并再次触发 finish', async () => {
        const wrapper = mount(CaomeiCountdown, { props: { target: NOW + 1000 } })

        vi.advanceTimersByTime(1000)
        await nextTick()
        expect(wrapper.emitted('finish')).toHaveLength(1)

        await wrapper.setProps({ target: NOW + 4000 })
        expect(wrapper.text()).toBe('00:00:03')

        vi.advanceTimersByTime(3000)
        await nextTick()
        expect(wrapper.emitted('finish')).toHaveLength(2)
    })

    it('目标已过期时立即到点并触发 finish', () => {
        const wrapper = mount(CaomeiCountdown, { props: { target: NOW - 5000 } })

        expect(wrapper.text()).toBe('00:00:00')
        expect(wrapper.emitted('finish')).toHaveLength(1)
        expect(vi.getTimerCount()).toBe(0)
    })

    it('无效 target 渲染零值且不启动计时', async () => {
        const wrapper = mount(CaomeiCountdown, { props: { target: '不是时间' } })

        expect(wrapper.text()).toBe('00:00:00')
        expect(vi.getTimerCount()).toBe(0)
        expect(wrapper.emitted('finish')).toBeUndefined()

        await wrapper.setProps({ target: '' })
        expect(wrapper.text()).toBe('00:00:00')
    })

    it('Date 与 ISO 字符串目标等价', () => {
        const wrapper = mount(CaomeiCountdown, {
            props: { target: new Date(NOW + 5000) },
        })
        const iso = mount(CaomeiCountdown, {
            props: { target: new Date(NOW + 5000).toISOString() },
        })

        expect(wrapper.text()).toBe('00:00:05')
        expect(iso.text()).toBe('00:00:05')
    })

    it('非法 interval 回退到 1000ms', async () => {
        const wrapper = mount(CaomeiCountdown, {
            props: { target: NOW + 5000, interval: Number.NaN },
        })

        vi.advanceTimersByTime(1000)
        await nextTick()
        expect(wrapper.text()).toBe('00:00:04')
    })


    it('到点前系统时间回拨时剩余时间增大，仍能正常到点且只触发一次', async () => {
        const wrapper = mount(CaomeiCountdown, { props: { target: NOW + 3000 } })

        expect(wrapper.text()).toBe('00:00:03')

        vi.setSystemTime(NOW - 2000)
        vi.advanceTimersByTime(1000)
        await nextTick()
        expect(wrapper.text()).toBe('00:00:04')

        vi.setSystemTime(NOW + 3000)
        vi.advanceTimersByTime(1000)
        await nextTick()
        expect(wrapper.text()).toBe('00:00:00')
        expect(wrapper.emitted('finish')).toHaveLength(1)
    })

    it('到点后系统时间回拨不恢复计时（到点即冻结）', async () => {
        const wrapper = mount(CaomeiCountdown, { props: { target: NOW + 1000 } })

        vi.advanceTimersByTime(1000)
        await nextTick()
        expect(wrapper.emitted('finish')).toHaveLength(1)
        expect(vi.getTimerCount()).toBe(0)

        vi.setSystemTime(NOW - 60_000)
        vi.advanceTimersByTime(5000)
        await nextTick()
        expect(wrapper.text()).toBe('00:00:00')
        expect(vi.getTimerCount()).toBe(0)
        expect(wrapper.emitted('finish')).toHaveLength(1)
    })

    it('同一目标下改 interval 或 autoStart 不重复触发 finish', async () => {
        const wrapper = mount(CaomeiCountdown, { props: { target: NOW + 1000 } })

        vi.advanceTimersByTime(1000)
        await nextTick()
        expect(wrapper.emitted('finish')).toHaveLength(1)

        await wrapper.setProps({ interval: 2000 })
        expect(wrapper.emitted('finish')).toHaveLength(1)

        await wrapper.setProps({ autoStart: false })
        await wrapper.setProps({ autoStart: true })
        expect(wrapper.emitted('finish')).toHaveLength(1)
    })

    it('autoStart 切换可停表与起表', async () => {
        const wrapper = mount(CaomeiCountdown, { props: { target: NOW + 10_000 } })
        expect(vi.getTimerCount()).toBe(1)

        await wrapper.setProps({ autoStart: false })
        expect(vi.getTimerCount()).toBe(0)

        await wrapper.setProps({ autoStart: true })
        expect(vi.getTimerCount()).toBe(1)

        vi.advanceTimersByTime(1000)
        await nextTick()
        expect(wrapper.text()).toBe('00:00:09')
    })

    it('运行中把 target 改为无效值会停表且不再触发 finish', async () => {
        const wrapper = mount(CaomeiCountdown, { props: { target: NOW + 2000 } })

        await wrapper.setProps({ target: '不是时间' })
        expect(vi.getTimerCount()).toBe(0)
        expect(wrapper.text()).toBe('00:00:00')

        vi.advanceTimersByTime(5000)
        await nextTick()
        expect(wrapper.emitted('finish')).toBeUndefined()
    })

    it('亚秒剩余显示零值但不等于到点态', async () => {
        const wrapper = mount(CaomeiCountdown, { props: { target: NOW + 500 } })

        expect(wrapper.text()).toBe('00:00:00')
        expect(wrapper.attributes('data-finished')).toBeUndefined()
        expect(wrapper.emitted('finish')).toBeUndefined()

        vi.advanceTimersByTime(1000)
        await nextTick()
        expect(wrapper.attributes('data-finished')).toBe('')
        expect(wrapper.emitted('finish')).toHaveLength(1)
    })

    it('未知格式 token 原样保留，interval 为 0 时回退 1000ms', async () => {
        const wrapper = mount(CaomeiCountdown, {
            props: { target: NOW + 5000, format: 'HH:mm:ss [剩余]', interval: 0 },
        })

        expect(wrapper.text()).toBe('00:00:05 [剩余]')

        vi.advanceTimersByTime(1000)
        await nextTick()
        expect(wrapper.text()).toBe('00:00:04 [剩余]')
    })


    it('更换 target 后再切回已到点的目标会重新通知', async () => {
        const wrapper = mount(CaomeiCountdown, { props: { target: NOW + 1000 } })

        vi.advanceTimersByTime(1000)
        await nextTick()
        expect(wrapper.emitted('finish')).toHaveLength(1)

        await wrapper.setProps({ target: NOW + 20_000 })
        vi.advanceTimersByTime(1000)
        await nextTick()
        expect(wrapper.text()).toBe('00:00:18')

        await wrapper.setProps({ target: NOW + 1000 })
        expect(wrapper.emitted('finish')).toHaveLength(2)
    })

    it('同一时间戳的新 Date 实例不重复通知，且不起表', async () => {
        const wrapper = mount(CaomeiCountdown, { props: { target: NOW + 1000 } })

        vi.advanceTimersByTime(1000)
        await nextTick()
        expect(wrapper.emitted('finish')).toHaveLength(1)

        await wrapper.setProps({ target: new Date(NOW + 1000) })
        expect(wrapper.emitted('finish')).toHaveLength(1)
        expect(vi.getTimerCount()).toBe(0)
        expect(wrapper.text()).toBe('00:00:00')
    })

    it('到点后系统时间回拨并改动 interval 仍保持冻结', async () => {
        const wrapper = mount(CaomeiCountdown, { props: { target: NOW + 1000 } })

        vi.advanceTimersByTime(1000)
        await nextTick()

        vi.setSystemTime(NOW - 30_000)
        await wrapper.setProps({ interval: 500 })
        expect(wrapper.text()).toBe('00:00:00')
        expect(vi.getTimerCount()).toBe(0)
        expect(wrapper.emitted('finish')).toHaveLength(1)
    })

    it('卸载时清理定时器', () => {
        const wrapper = mount(CaomeiCountdown, { props: { target: NOW + 60_000 } })

        expect(vi.getTimerCount()).toBe(1)

        wrapper.unmount()
        expect(vi.getTimerCount()).toBe(0)
    })

    it('role="timer" 允许命名，未传 label 时不输出 aria-label', async () => {
        const wrapper = mount(CaomeiCountdown, {
            props: { target: NOW + 1000, label: '距离结束' },
        })

        expect(wrapper.attributes('role')).toBe('timer')
        expect(wrapper.attributes('aria-label')).toBe('距离结束')

        await wrapper.setProps({ label: '' })
        expect(wrapper.attributes('aria-label')).toBeUndefined()
    })
})
