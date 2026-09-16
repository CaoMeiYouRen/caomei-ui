import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { CaomeiTextarea } from './index'

describe('CaomeiTextarea', () => {
    it('渲染原生 textarea 并应用默认尺寸', () => {
        const wrapper = mount(CaomeiTextarea, {
            props: { placeholder: '请输入' },
        })

        const textarea = wrapper.get('textarea')
        expect(textarea.attributes('placeholder')).toBe('请输入')
        expect(wrapper.get('.caomei-textarea').classes()).toContain('caomei-textarea--md')
    })

    it.each(['sm', 'md', 'lg'] as const)('应用尺寸样式 %s', (size) => {
        const wrapper = mount(CaomeiTextarea, { props: { size } })
        expect(wrapper.get('.caomei-textarea').classes()).toContain(`caomei-textarea--${size}`)
    })

    it('透传 rows', () => {
        const wrapper = mount(CaomeiTextarea, { props: { rows: 6 } })
        expect(wrapper.get('textarea').attributes('rows')).toBe('6')
    })

    it('应用 resize 样式', () => {
        const wrapper = mount(CaomeiTextarea, { props: { resize: 'none' } })
        expect(wrapper.get('textarea').attributes('style')).toContain('resize: none')
    })

    it('输入时抛出 update:modelValue 事件', async () => {
        const wrapper = mount(CaomeiTextarea, { props: { modelValue: '' } })
        await wrapper.get('textarea').setValue('多行内容')

        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['多行内容'])
    })

    it('禁用时透传 disabled 并应用禁用样式', () => {
        const wrapper = mount(CaomeiTextarea, { props: { disabled: true } })

        expect(wrapper.get('textarea').attributes('disabled')).toBeDefined()
        expect(wrapper.get('.caomei-textarea').classes()).toContain('caomei-textarea--disabled')
    })

    it('只读时透传 readonly 并应用只读样式', () => {
        const wrapper = mount(CaomeiTextarea, { props: { readonly: true } })

        expect(wrapper.get('textarea').attributes('readonly')).toBeDefined()
        expect(wrapper.get('.caomei-textarea').classes()).toContain('caomei-textarea--readonly')
    })

    it('invalid 时标注 aria-invalid 并应用错误样式', () => {
        const wrapper = mount(CaomeiTextarea, { props: { invalid: true } })

        expect(wrapper.get('textarea').attributes('aria-invalid')).toBe('true')
        expect(wrapper.get('.caomei-textarea').classes()).toContain('caomei-textarea--invalid')
    })

    it('label 映射为 aria-label', () => {
        const wrapper = mount(CaomeiTextarea, { props: { label: '备注' } })
        expect(wrapper.get('textarea').attributes('aria-label')).toBe('备注')
    })

    it('透传 name / id / autocomplete 到原生 textarea', () => {
        const wrapper = mount(CaomeiTextarea, {
            props: { name: 'remark', id: 'remark-input', autocomplete: 'off' },
        })

        const textarea = wrapper.get('textarea')
        expect(textarea.attributes('name')).toBe('remark')
        expect(textarea.attributes('id')).toBe('remark-input')
        expect(textarea.attributes('autocomplete')).toBe('off')
    })

    it('invalid 为 false 时不输出 aria-invalid', () => {
        const wrapper = mount(CaomeiTextarea)
        expect(wrapper.get('textarea').attributes('aria-invalid')).toBeUndefined()
    })

    it('值变更后 change 事件被抛出', async () => {
        const wrapper = mount(CaomeiTextarea)

        await wrapper.get('textarea').setValue('内容')

        expect(wrapper.emitted('change')).toHaveLength(1)
    })

    it('style 落在根元素且不泄漏到内部 textarea', () => {
        const wrapper = mount(CaomeiTextarea, {
            attrs: { style: 'max-width: 320px' },
        })

        expect(wrapper.get('.caomei-textarea').attributes('style')).toContain('max-width: 320px')
        expect(wrapper.get('textarea').attributes('style')).not.toContain('max-width: 320px')
    })

    it('class 落在根元素，其余原生属性透传到 textarea', () => {
        const wrapper = mount(CaomeiTextarea, {
            attrs: {
                class: 'custom-textarea',
                'data-test': 'textarea',
                maxlength: 200,
                required: true,
            },
        })

        const root = wrapper.get('.caomei-textarea')
        const textarea = wrapper.get('textarea')
        expect(root.classes()).toContain('custom-textarea')
        expect(root.attributes('data-test')).toBeUndefined()
        expect(textarea.attributes('data-test')).toBe('textarea')
        expect(textarea.attributes('maxlength')).toBe('200')
        expect(textarea.attributes('required')).toBeDefined()
    })

    it('聚焦与失焦时抛出对应事件', async () => {
        const wrapper = mount(CaomeiTextarea)
        const textarea = wrapper.get('textarea')

        await textarea.trigger('focus')
        await textarea.trigger('blur')

        expect(wrapper.emitted('focus')).toHaveLength(1)
        expect(wrapper.emitted('blur')).toHaveLength(1)
    })

    it('暴露 focus / blur 方法', () => {
        const wrapper = mount(CaomeiTextarea, { attachTo: document.body })
        const textarea = wrapper.get('textarea').element as HTMLTextAreaElement

        wrapper.vm.focus()
        expect(document.activeElement).toBe(textarea)
        wrapper.vm.blur()
        expect(document.activeElement).not.toBe(textarea)

        wrapper.unmount()
    })

    describe('autoResize', () => {
        // happy-dom 无布局引擎，scrollHeight 恒为 0，需按用例注入测量值
        function mockScrollHeight(el: HTMLTextAreaElement): { set: (value: number) => void } {
            let value = 0
            Object.defineProperty(el, 'scrollHeight', {
                configurable: true,
                get: () => value,
            })

            return {
                set(next: number) {
                    value = next
                },
            }
        }

        it('默认不启用，也不写入内联高度', () => {
            const wrapper = mount(CaomeiTextarea, { attachTo: document.body })
            const textarea = wrapper.get('textarea').element as HTMLTextAreaElement

            expect(wrapper.get('.caomei-textarea').classes()).not.toContain('caomei-textarea--auto-resize')
            expect(textarea.style.height).toBe('')

            wrapper.unmount()
        })

        it('启用后内容变化即按 scrollHeight 写入高度', async () => {
            const wrapper = mount(CaomeiTextarea, {
                props: { autoResize: true },
                attachTo: document.body,
            })
            const textarea = wrapper.get('textarea').element as HTMLTextAreaElement
            const mock = mockScrollHeight(textarea)
            mock.set(72)

            await wrapper.get('textarea').setValue('第一行')
            expect(textarea.style.height).toBe('72px')

            wrapper.unmount()
        })

        it('内容增减时同步伸缩高度', async () => {
            const wrapper = mount(CaomeiTextarea, {
                props: { autoResize: true },
                attachTo: document.body,
            })
            const textarea = wrapper.get('textarea').element as HTMLTextAreaElement
            const mock = mockScrollHeight(textarea)

            mock.set(120)
            await wrapper.get('textarea').setValue('多行\n内容\n更多')
            expect(textarea.style.height).toBe('120px')

            mock.set(40)
            await wrapper.get('textarea').setValue('短')
            expect(textarea.style.height).toBe('40px')

            wrapper.unmount()
        })

        it('scrollHeight 为 0 时不写死高度，保留原生 rows', async () => {
            const wrapper = mount(CaomeiTextarea, {
                props: { autoResize: true, rows: 3 },
                attachTo: document.body,
            })
            const textarea = wrapper.get('textarea').element as HTMLTextAreaElement
            const mock = mockScrollHeight(textarea)
            mock.set(96)

            await wrapper.get('textarea').setValue('内容')
            expect(textarea.style.height).toBe('96px')

            mock.set(0)
            await wrapper.get('textarea').setValue('')
            expect(textarea.style.height).toBe('')

            wrapper.unmount()
        })

        it('关闭 autoResize 时清除内联高度', async () => {
            const wrapper = mount(CaomeiTextarea, {
                props: { autoResize: true },
                attachTo: document.body,
            })
            const textarea = wrapper.get('textarea').element as HTMLTextAreaElement
            const mock = mockScrollHeight(textarea)
            mock.set(88)

            await wrapper.setProps({ modelValue: '内容' })
            expect(textarea.style.height).toBe('88px')

            await wrapper.setProps({ autoResize: false })
            expect(textarea.style.height).toBe('')

            wrapper.unmount()
        })

        // 经值变化驱动模型 watcher；隐藏/恢复的 ResizeObserver 路径由下一条用例覆盖
        it('scrollHeight 为 0 时清空高度，恢复测量值后重新写入', async () => {
            const wrapper = mount(CaomeiTextarea, {
                props: { autoResize: true },
                attachTo: document.body,
            })
            const textarea = wrapper.get('textarea').element as HTMLTextAreaElement
            const mock = mockScrollHeight(textarea)

            mock.set(80)
            await wrapper.get('textarea').setValue('内容')
            expect(textarea.style.height).toBe('80px')

            // display:none 时 scrollHeight 为 0，清空内联高度而非写死 0
            mock.set(0)
            await wrapper.get('textarea').setValue('隐藏中')
            expect(textarea.style.height).toBe('')

            mock.set(120)
            await wrapper.get('textarea').setValue('恢复可见')
            expect(textarea.style.height).toBe('120px')

            wrapper.unmount()
        })

        it('仅在控件宽度变化时重新测量', () => {
            const callbacks: (() => void)[] = []
            const original = globalThis.ResizeObserver
            class FakeResizeObserver {
                constructor(callback: () => void) {
                    callbacks.push(callback)
                }

                observe(): void {
                    // 仅需存在，重测由用例手动触发回调
                }

                disconnect(): void {
                    // 无资源可释放
                }
            }

            globalThis.ResizeObserver = FakeResizeObserver as unknown as typeof ResizeObserver

            let wrapper: ReturnType<typeof mount> | undefined

            try {
                wrapper = mount(CaomeiTextarea, {
                    props: { autoResize: true },
                    attachTo: document.body,
                })
                const textarea = wrapper.get('textarea').element as HTMLTextAreaElement
                const mock = mockScrollHeight(textarea)
                let width = 0
                Object.defineProperty(textarea, 'clientWidth', {
                    configurable: true,
                    get: () => width,
                })

                expect(callbacks).toHaveLength(1)

                mock.set(100)
                width = 200
                callbacks[0]?.()
                expect(textarea.style.height).toBe('100px')

                // 宽度未变时不重测
                mock.set(150)
                callbacks[0]?.()
                expect(textarea.style.height).toBe('100px')

                width = 300
                callbacks[0]?.()
                expect(textarea.style.height).toBe('150px')
            } finally {
                wrapper?.unmount()
                globalThis.ResizeObserver = original
            }
        })

        it('自动增高时禁用手动调整尺寸，未启用时保持默认 resize', () => {
            const auto = mount(CaomeiTextarea, { props: { autoResize: true } })
            expect(auto.get('textarea').attributes('style')).toContain('resize: none')

            const manual = mount(CaomeiTextarea)
            expect(manual.get('textarea').attributes('style')).toContain('resize: vertical')
        })

        it('尺寸档位变化时重新测量', async () => {
            const wrapper = mount(CaomeiTextarea, {
                props: { autoResize: true, size: 'md' },
                attachTo: document.body,
            })
            const textarea = wrapper.get('textarea').element as HTMLTextAreaElement
            const mock = mockScrollHeight(textarea)

            mock.set(60)
            await wrapper.setProps({ modelValue: '内容' })
            expect(textarea.style.height).toBe('60px')

            mock.set(84)
            await wrapper.setProps({ size: 'lg' })
            expect(textarea.style.height).toBe('84px')

            wrapper.unmount()
        })
    })

    it('有值时输出 data-filled，清空后移除', async () => {
        const wrapper = mount(CaomeiTextarea)

        expect(wrapper.get('.caomei-textarea').attributes('data-filled')).toBeUndefined()

        await wrapper.setProps({ modelValue: '多行内容' })
        expect(wrapper.get('.caomei-textarea').attributes('data-filled')).toBe('true')

        await wrapper.setProps({ modelValue: '' })
        expect(wrapper.get('.caomei-textarea').attributes('data-filled')).toBeUndefined()
    })
})
