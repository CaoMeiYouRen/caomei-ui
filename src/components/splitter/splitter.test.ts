import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CaomeiSplitter, CaomeiSplitterPanel, CaomeiSplitterResizeHandle } from './index'

const wrappers: ReturnType<typeof mount>[] = []

function mountSplitter(props: Record<string, unknown> = {}) {
    const Host = defineComponent({
        components: { CaomeiSplitter, CaomeiSplitterPanel, CaomeiSplitterResizeHandle },
        setup: () => ({ splitterProps: props }),
        template: `
            <CaomeiSplitter v-bind="splitterProps">
                <CaomeiSplitterPanel :default-size="30"><span>左</span></CaomeiSplitterPanel>
                <CaomeiSplitterResizeHandle />
                <CaomeiSplitterPanel :default-size="70"><span>右</span></CaomeiSplitterPanel>
            </CaomeiSplitter>
        `,
    })
    const wrapper = mount(Host, { attachTo: document.body })
    wrappers.push(wrapper as unknown as ReturnType<typeof mount>)
    return wrapper
}

async function flush(): Promise<void> {
    for (let index = 0; index < 8; index++) {
        await nextTick()
    }
}

afterEach(() => {
    for (const wrapper of wrappers.splice(0)) {
        wrapper.unmount()
    }
    document.body.innerHTML = ''
    vi.restoreAllMocks()
})

describe('CaomeiSplitter', () => {
    it('按方向渲染面板与分隔条，提供默认可访问名', async () => {
        mountSplitter()
        await flush()

        expect(document.querySelectorAll('.caomei-splitter')).toHaveLength(1)
        expect(document.querySelectorAll('.caomei-splitter__panel')).toHaveLength(2)
        const handle = document.querySelector('.caomei-splitter__handle')
        expect(handle).not.toBeNull()
        expect(handle?.getAttribute('aria-label')).toBe('调整面板大小')
        expect(handle?.getAttribute('role')).toBe('separator')
        expect(handle?.getAttribute('tabindex')).toBe('0')
    })

    it('垂直方向用 --vertical 类表达', async () => {
        mountSplitter({ direction: 'vertical' })
        await flush()
        expect(document.querySelector('.caomei-splitter')?.classList.contains('caomei-splitter--vertical')).toBe(true)
    })

    it('受控 layout 在挂载后应用到各面板', async () => {
        mountSplitter({ layout: [25, 75] })
        await flush()

        const panels = [...document.querySelectorAll<HTMLElement>('.caomei-splitter__panel')]
        expect(Number.parseFloat(panels[0]?.style.flexGrow ?? '')).toBeCloseTo(25, 1)
        expect(Number.parseFloat(panels[1]?.style.flexGrow ?? '')).toBeCloseTo(75, 1)
    })

    it('外部更新 layout 时重新应用', async () => {
        const layout = ref([30, 70])
        const Host = defineComponent({
            components: { CaomeiSplitter, CaomeiSplitterPanel, CaomeiSplitterResizeHandle },
            setup: () => ({ layout }),
            template: `
                <CaomeiSplitter v-model:layout="layout">
                    <CaomeiSplitterPanel><span>左</span></CaomeiSplitterPanel>
                    <CaomeiSplitterResizeHandle />
                    <CaomeiSplitterPanel><span>右</span></CaomeiSplitterPanel>
                </CaomeiSplitter>
            `,
        })
        const wrapper = mount(Host, { attachTo: document.body })
        wrappers.push(wrapper as unknown as ReturnType<typeof mount>)
        await flush()

        layout.value = [40, 60]
        await flush()

        const panels = [...document.querySelectorAll<HTMLElement>('.caomei-splitter__panel')]
        expect(Number.parseFloat(panels[0]?.style.flexGrow ?? '')).toBeCloseTo(40, 1)
        expect(Number.parseFloat(panels[1]?.style.flexGrow ?? '')).toBeCloseTo(60, 1)
    })

    it('受控越界值被 min/max 钳制后回写模型', async () => {
        const layout = ref([10, 90])
        const Host = defineComponent({
            components: { CaomeiSplitter, CaomeiSplitterPanel, CaomeiSplitterResizeHandle },
            setup: () => ({ layout }),
            template: `
                <CaomeiSplitter v-model:layout="layout">
                    <CaomeiSplitterPanel :min-size="20"><span>左</span></CaomeiSplitterPanel>
                    <CaomeiSplitterResizeHandle />
                    <CaomeiSplitterPanel :min-size="20"><span>右</span></CaomeiSplitterPanel>
                </CaomeiSplitter>
            `,
        })
        const wrapper = mount(Host, { attachTo: document.body })
        wrappers.push(wrapper as unknown as ReturnType<typeof mount>)
        await flush()

        expect(layout.value[0], '越界值应被钳制并回写').toBeGreaterThanOrEqual(20)
        const panels = [...document.querySelectorAll<HTMLElement>('.caomei-splitter__panel')]
        expect(Number.parseFloat(panels[0]?.style.flexGrow ?? '')).toBeCloseTo(layout.value[0], 0)
    })

    it('动态新增面板后受控模型跟随实际布局', async () => {
        const layout = ref([50, 50])
        const showThird = ref(false)
        const Host = defineComponent({
            components: { CaomeiSplitter, CaomeiSplitterPanel, CaomeiSplitterResizeHandle },
            setup: () => ({ layout, showThird }),
            template: `
                <CaomeiSplitter v-model:layout="layout">
                    <CaomeiSplitterPanel><span>一</span></CaomeiSplitterPanel>
                    <CaomeiSplitterResizeHandle />
                    <CaomeiSplitterPanel><span>二</span></CaomeiSplitterPanel>
                    <template v-if="showThird">
                        <CaomeiSplitterResizeHandle />
                        <CaomeiSplitterPanel><span>三</span></CaomeiSplitterPanel>
                    </template>
                </CaomeiSplitter>
            `,
        })
        const wrapper = mount(Host, { attachTo: document.body })
        wrappers.push(wrapper as unknown as ReturnType<typeof mount>)
        await flush()

        showThird.value = true
        await flush()

        expect(layout.value, '新增面板后模型应收敛到实际布局').toHaveLength(3)
    })

    it('collapsible 面板 Enter 折叠后模型跟随实际布局', async () => {
        const layout = ref([50, 50])
        const events: number[][] = []
        const Host = defineComponent({
            components: { CaomeiSplitter, CaomeiSplitterPanel, CaomeiSplitterResizeHandle },
            setup: () => ({
                layout,
                events,
                onLayout: (sizes: number[]) => {
                    events.push(sizes)
                },
            }),
            template: `
                <CaomeiSplitter v-model:layout="layout" @layout="onLayout">
                    <CaomeiSplitterPanel collapsible :collapsed-size="0"><span>左</span></CaomeiSplitterPanel>
                    <CaomeiSplitterResizeHandle />
                    <CaomeiSplitterPanel collapsible :collapsed-size="0"><span>右</span></CaomeiSplitterPanel>
                </CaomeiSplitter>
            `,
        })
        const wrapper = mount(Host, { attachTo: document.body })
        wrappers.push(wrapper as unknown as ReturnType<typeof mount>)
        await flush()

        const handle = document.querySelector<HTMLElement>('.caomei-splitter__handle')
        handle?.focus()
        handle?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }))
        await new Promise((resolve) => {
            setTimeout(resolve, 250)
        })
        await flush()

        const panels = [...document.querySelectorAll<HTMLElement>('.caomei-splitter__panel')]
        const rendered = panels.map((panel) => Number.parseFloat(panel.style.flexGrow || '0'))
        expect(rendered[0], '折叠后首个面板应收缩到 0').toBeCloseTo(0, 0)
        expect(rendered[1], '折叠后第二个面板应占满').toBeCloseTo(100, 0)
        expect(layout.value[0], '折叠后模型应镜像实际布局').toBeCloseTo(rendered[0], 0)
        expect(events.length, '折叠也应抛出 layout 事件').toBeGreaterThan(0)
    })

    it('autoSaveId 与受控初值并用时以受控值为准', async () => {
        localStorage.clear()
        // 预置一份与受控初值冲突的存档：受控值必须胜出
        localStorage.setItem('reka:splitter-test', JSON.stringify({ layout: [20, 80] }))
        const layout = ref([35, 65])
        const Host = defineComponent({
            components: { CaomeiSplitter, CaomeiSplitterPanel, CaomeiSplitterResizeHandle },
            setup: () => ({ layout }),
            template: `
                <CaomeiSplitter v-model:layout="layout" auto-save-id="splitter-test">
                    <CaomeiSplitterPanel><span>左</span></CaomeiSplitterPanel>
                    <CaomeiSplitterResizeHandle />
                    <CaomeiSplitterPanel><span>右</span></CaomeiSplitterPanel>
                </CaomeiSplitter>
            `,
        })
        const wrapper = mount(Host, { attachTo: document.body })
        wrappers.push(wrapper as unknown as ReturnType<typeof mount>)
        await flush()

        expect(layout.value).toEqual([35, 65])
        const panels = [...document.querySelectorAll<HTMLElement>('.caomei-splitter__panel')]
        expect(Number.parseFloat(panels[0]?.style.flexGrow ?? '')).toBeCloseTo(35, 0)
    })

    it('键盘调整抛出 layout 事件并回写模型', async () => {
        const layout = ref([50, 50])
        const Host = defineComponent({
            components: { CaomeiSplitter, CaomeiSplitterPanel, CaomeiSplitterResizeHandle },
            setup: () => ({ layout }),
            template: `
                <CaomeiSplitter v-model:layout="layout">
                    <CaomeiSplitterPanel><span>左</span></CaomeiSplitterPanel>
                    <CaomeiSplitterResizeHandle />
                    <CaomeiSplitterPanel><span>右</span></CaomeiSplitterPanel>
                </CaomeiSplitter>
            `,
        })
        const wrapper = mount(Host, { attachTo: document.body })
        wrappers.push(wrapper as unknown as ReturnType<typeof mount>)
        await flush()

        const handle = document.querySelector<HTMLElement>('.caomei-splitter__handle')
        handle?.focus()
        handle?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }))
        await flush()

        expect(layout.value[0]).toBeGreaterThan(50)
        expect(layout.value[0] + layout.value[1]).toBeCloseTo(100, 1)
    })

    it('自定义可访问名与禁用态', async () => {
        const Host = defineComponent({
            components: { CaomeiSplitter, CaomeiSplitterPanel, CaomeiSplitterResizeHandle },
            template: `
                <CaomeiSplitter>
                    <CaomeiSplitterPanel><span>左</span></CaomeiSplitterPanel>
                    <CaomeiSplitterResizeHandle label="调整编辑器宽度" disabled />
                    <CaomeiSplitterPanel><span>右</span></CaomeiSplitterPanel>
                </CaomeiSplitter>
            `,
        })
        const wrapper = mount(Host, { attachTo: document.body })
        wrappers.push(wrapper as unknown as ReturnType<typeof mount>)
        await flush()

        const handle = document.querySelector('.caomei-splitter__handle')
        expect(handle?.getAttribute('aria-label')).toBe('调整编辑器宽度')
        expect(handle?.getAttribute('data-disabled')).not.toBeNull()
        expect(handle?.getAttribute('tabindex')).toBe('-1')
        expect(handle?.getAttribute('aria-orientation'), '水平分栏的分隔线为 vertical').toBe('vertical')
    })
})
