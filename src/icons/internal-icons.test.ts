import { mount } from '@vue/test-utils'
import { createSSRApp, defineComponent, h, nextTick, ref, type Component } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { describe, expect, it } from 'vitest'
import CaomeiIcon from './icon.vue'
import { internalIcons, provideIconOverrides, useInternalIcons, type InternalIconMap } from './internal-icons'

const OverrideIcon = defineComponent({ template: '<svg data-override="icon" />' })
const AltOverrideIcon = defineComponent({ template: '<svg data-alt-override="icon" />' })

const EXPECTED_KEYS = [
    'calendar',
    'check',
    'chevronDown',
    'chevronLeft',
    'chevronRight',
    'chevronsLeft',
    'chevronsRight',
    'chevronUp',
    'danger',
    'dismiss',
    'error',
    'eye',
    'eyeOff',
    'imageOff',
    'info',
    'loading',
    'minus',
    'plus',
    'radio',
    'success',
    'upload',
    'warning',
] as const

describe('内置图标映射表', () => {
    it('22 个语义键齐全', () => {
        expect(Object.keys(internalIcons).sort()).toEqual([...EXPECTED_KEYS].sort())
    })

    it('Message error 与 Toast danger 不合并', () => {
        expect(internalIcons.error).toBeDefined()
        expect(internalIcons.danger).toBeDefined()
        expect(internalIcons.error).not.toBe(internalIcons.danger)
    })
})

describe('provideIconOverrides', () => {
    it('只覆盖传入的键，其余保持默认', () => {
        let icons: ReturnType<typeof useInternalIcons> | undefined
        const Child = defineComponent({
            setup() {
                icons = useInternalIcons()
                return () => h('div')
            },
        })
        mount(defineComponent({
            setup() {
                provideIconOverrides({ dismiss: OverrideIcon })
                return () => h(Child)
            },
        }))
        expect(icons?.value.dismiss).toBe(OverrideIcon)
        expect(icons?.value.check).toBe(internalIcons.check)
    })

    it('ref 覆盖响应式生效', async () => {
        const overrides = ref<Partial<InternalIconMap>>({})
        let icons: ReturnType<typeof useInternalIcons> | undefined
        const Child = defineComponent({
            setup() {
                icons = useInternalIcons()
                return () => h('div')
            },
        })
        mount(defineComponent({
            setup() {
                provideIconOverrides(overrides)
                return () => h(Child)
            },
        }))
        expect(icons?.value.dismiss).toBe(internalIcons.dismiss)
        overrides.value = { dismiss: OverrideIcon }
        await nextTick()
        expect((icons?.value.dismiss as { template?: string }).template).toBe('<svg data-override="icon" />')
    })

    it('覆盖后的图标经 CaomeiIcon 渲染', () => {
        const Probe = defineComponent({
            setup() {
                const icons = useInternalIcons()
                return () => h(CaomeiIcon, { icon: icons.value.dismiss })
            },
        })
        const wrapper = mount(defineComponent({
            setup() {
                provideIconOverrides({ dismiss: OverrideIcon })
                return () => h(Probe)
            },
        }))
        expect(wrapper.find('[data-override="icon"]').exists()).toBe(true)
    })

    it('SSR 下不同请求的覆盖互不泄漏', async () => {
        const makeApp = (icon: Component) => createSSRApp({
            setup() {
                provideIconOverrides({ dismiss: icon })
                return () => h(defineComponent({
                    setup() {
                        const icons = useInternalIcons()
                        return () => h(CaomeiIcon, { icon: icons.value.dismiss })
                    },
                }))
            },
        })
        const htmlA = await renderToString(makeApp(OverrideIcon))
        const htmlB = await renderToString(makeApp(AltOverrideIcon))
        expect(htmlA).toContain('data-override="icon"')
        expect(htmlA).not.toContain('data-alt-override')
        expect(htmlB).toContain('data-alt-override="icon"')
        expect(htmlB).not.toContain('data-override="icon"')
    })
})
