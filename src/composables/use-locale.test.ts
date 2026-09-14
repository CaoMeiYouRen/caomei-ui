import { mount } from '@vue/test-utils'
import { computed, defineComponent, h, inject, nextTick, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { describe, expect, it } from 'vitest'
import { CaomeiConfigProvider } from '../components/config-provider'
import { defaultLocaleMessages, type CaomeiLocale } from '../locale'
import {
    caomeiLocaleKey,
    mergeLocaleMessages,
    provideLocale,
    resolveLocaleMessages,
    useLocale,
} from './use-locale'

/** 通过 useLocale 读取文案的探针组件 */
const Probe = defineComponent({
    name: 'LocaleProbe',
    setup() {
        const locale = useLocale()
        return () => h('span', locale.value.input.clear)
    },
})

/** 直接读取注入键的探针组件，验证与 useLocale 共享同一响应式对象 */
const KeyProbe = defineComponent({
    name: 'LocaleKeyProbe',
    setup() {
        const locale = inject(caomeiLocaleKey)
        return () => h('span', locale ? locale.value.input.clear : 'missing')
    },
})

describe('resolveLocaleMessages', () => {
    it('未指定语言时回退默认语言文案', () => {
        expect(resolveLocaleMessages()).toBe(defaultLocaleMessages)
    })

    it('按语言标识选择内建文案，未知语言回退默认', () => {
        expect(resolveLocaleMessages('en-US').input.clear).toBe('Clear')
        expect(resolveLocaleMessages('ja-JP' as CaomeiLocale)).toBe(defaultLocaleMessages)
    })

    it('原型链键不被当作内建语言', () => {
        expect(resolveLocaleMessages('constructor' as CaomeiLocale)).toBe(defaultLocaleMessages)
        expect(resolveLocaleMessages('toString' as CaomeiLocale)).toBe(defaultLocaleMessages)
    })

    it('覆盖文案按命名空间合并，未覆盖的命名空间保留基准文案', () => {
        const merged = resolveLocaleMessages('en-US', { input: { clear: 'Reset' } })

        expect(merged.input.clear).toBe('Reset')
        expect(merged.dialog.close).toBe('Close')
    })
})

describe('mergeLocaleMessages', () => {
    it('不修改基准文案对象', () => {
        const merged = mergeLocaleMessages(defaultLocaleMessages, { input: { clear: '清空' } })

        expect(merged.input.clear).toBe('清空')
        expect(defaultLocaleMessages.input.clear).toBe('清除')
    })

    it('未提供覆盖时原样返回基准文案', () => {
        expect(mergeLocaleMessages(defaultLocaleMessages)).toBe(defaultLocaleMessages)
    })
})

describe('useLocale', () => {
    it('无 provider 时回退默认语言文案', () => {
        const wrapper = mount(Probe)
        expect(wrapper.text()).toBe('清除')
    })

    it('读取 provideLocale 提供的语言与覆盖文案', () => {
        const Root = defineComponent({
            setup() {
                provideLocale({ locale: 'en-US', messages: { input: { clear: 'Wipe' } } })
                return () => h(Probe)
            },
        })

        expect(mount(Root).text()).toBe('Wipe')
    })

    it('provider 语言或覆盖变化时响应式更新', async () => {
        const locale = ref<CaomeiLocale>('zh-CN')
        const Root = defineComponent({
            setup() {
                provideLocale({
                    locale,
                    messages: computed(() => ({ input: { clear: `清空-${locale.value}` } })),
                })
                return () => h(Probe)
            },
        })

        const wrapper = mount(Root)
        expect(wrapper.text()).toBe('清空-zh-CN')

        locale.value = 'en-US'
        await nextTick()
        expect(wrapper.text()).toBe('清空-en-US')
    })
})

describe('CaomeiConfigProvider', () => {
    it('默认使用 zh-CN，并按 locale / messages 提供文案', () => {
        const fallback = mount(CaomeiConfigProvider, { slots: { default: () => h(Probe) } })
        expect(fallback.text()).toBe('清除')

        const english = mount(CaomeiConfigProvider, {
            props: { locale: 'en-US' },
            slots: { default: () => h(Probe) },
        })
        expect(english.text()).toBe('Clear')

        const overridden = mount(CaomeiConfigProvider, {
            props: { messages: { input: { clear: '重置' } } },
            slots: { default: () => h(Probe) },
        })
        expect(overridden.text()).toBe('重置')
    })

    it('locale 变化时向后代传播', async () => {
        const wrapper = mount(CaomeiConfigProvider, {
            props: { locale: 'en-US' },
            slots: { default: () => h(Probe) },
        })

        expect(wrapper.text()).toBe('Clear')

        await wrapper.setProps({ locale: 'zh-CN' })
        expect(wrapper.text()).toBe('清除')
    })

    it('messages 变化时向后代传播', async () => {
        const wrapper = mount(CaomeiConfigProvider, {
            props: { messages: { input: { clear: '清空' } } },
            slots: { default: () => h(Probe) },
        })

        expect(wrapper.text()).toBe('清空')

        await wrapper.setProps({ messages: { input: { clear: '重置' } } })
        expect(wrapper.text()).toBe('重置')
    })

    it('注入键在后代中可读取完整文案对象', () => {
        const Consumer = defineComponent({
            setup() {
                const locale = useLocale()
                return () => h('span', `${locale.value.input.clear}|${locale.value.toast.close}`)
            },
        })

        const wrapper = mount(CaomeiConfigProvider, {
            props: { locale: 'en-US' },
            slots: { default: () => h(Consumer) },
        })

        expect(wrapper.text()).toBe('Clear|Close')
        expect(mount(CaomeiConfigProvider, { slots: { default: () => h(KeyProbe) } }).text()).toBe('清除')
    })
})

describe('SSR', () => {
    it('服务端渲染注入文案，且多次渲染之间不串扰', async () => {
        const [english, chinese] = await Promise.all([
            renderToString(h(CaomeiConfigProvider, { locale: 'en-US' }, { default: () => h(Probe) })),
            renderToString(h(CaomeiConfigProvider, { locale: 'zh-CN' }, { default: () => h(Probe) })),
        ])

        expect(english).toContain('Clear')
        expect(chinese).toContain('清除')
    })

    it('无 provider 时服务端回退默认文案', async () => {
        expect(await renderToString(h(Probe))).toContain('清除')
    })
})
