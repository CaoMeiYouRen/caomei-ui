import { mount } from '@vue/test-utils'
import { computed, defineComponent, h, inject, nextTick, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CaomeiConfigProvider } from '../components/config-provider'
import {
    PRE_REGISTERED_LOCALES,
    caomeiLocales,
    defaultLocaleMessages,
    registerLocale,
    type CaomeiLocale,
} from '../locale'
import deDE from '../locale/de-de'
import esES from '../locale/es-es'
import frFR from '../locale/fr-fr'
import jaJP from '../locale/ja-jp'
import koKR from '../locale/ko-kr'
import ptBR from '../locale/pt-br'
import ruRU from '../locale/ru-ru'
import zhTW from '../locale/zh-tw'

/** 空实现：替代内联空箭头，避免 `no-empty-function` 告警。 */
const noop = (): undefined => undefined
import {
    caomeiLocaleCodeKey,
    caomeiLocaleKey,
    mergeLocaleMessages,
    provideLocale,
    resolveLocaleCode,
    resolveLocaleMessages,
    useLocale,
    useLocaleCode,
} from './use-locale'

/** 按需引入语言对象（默认未注册，与消费方经子路径引入后的用法一致）。 */
const ON_DEMAND_LOCALES = {
    'zh-TW': zhTW,
    'ja-JP': jaJP,
    'ko-KR': koKR,
    'es-ES': esES,
    'fr-FR': frFR,
    'de-DE': deDE,
    'ru-RU': ruRU,
    'pt-BR': ptBR,
} as const

/** 在测试内注册按需语言，并在用例结束后恢复注册表初值。 */
function withOnDemandLocales(codes: (keyof typeof ON_DEMAND_LOCALES)[]): void {
    for (const code of codes) {
        registerLocale(code, ON_DEMAND_LOCALES[code])
    }
}

afterEach(() => {
    for (const code of Object.keys(ON_DEMAND_LOCALES) as (keyof typeof ON_DEMAND_LOCALES)[]) {
        if (!(PRE_REGISTERED_LOCALES as readonly string[]).includes(code)) {
            delete caomeiLocales[code]
        }
    }
    vi.restoreAllMocks()
})

// 未注册语言会走开发期告警（真实行为）：默认静音以保持用例输出可读，
// 断言告警的用例再显式检查 console.warn 的调用。
beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(noop)
})

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

/** 通过 useLocaleCode 读取语言标识的探针组件 */
const CodeProbe = defineComponent({
    name: 'LocaleCodeProbe',
    setup() {
        const code = useLocaleCode()
        return () => h('span', code.value)
    },
})

/** 直接读取语言标识注入键的探针组件 */
const CodeKeyProbe = defineComponent({
    name: 'LocaleCodeKeyProbe',
    setup() {
        const code = inject(caomeiLocaleCodeKey)
        return () => h('span', code ? code.value : 'missing')
    },
})

describe('resolveLocaleMessages', () => {
    it('未指定语言时回退默认语言文案', () => {
        expect(resolveLocaleMessages()).toBe(defaultLocaleMessages)
    })

    it('按语言标识选择内建文案，未知语言回退默认', () => {
        expect(resolveLocaleMessages('en-US').input.clear).toBe('Clear')
        expect(resolveLocaleMessages('it-IT' as CaomeiLocale)).toBe(defaultLocaleMessages)
    })

    it('按需引入的语种注册后按自身文案解析', () => {
        withOnDemandLocales(['zh-TW', 'ja-JP', 'ko-KR'])
        // 断言钉住的是内建译文原文：人工复核改动译文时需同步更新
        expect(resolveLocaleMessages('zh-TW').pagination.label).toBe('分頁')
        expect(resolveLocaleMessages('ja-JP').input.clear).toBe('クリア')
        expect(resolveLocaleMessages('ko-KR').input.clear).toBe('지우기')
    })

    it('一期新增 5 语注册后按自身文案解析', () => {
        withOnDemandLocales(['es-ES', 'fr-FR', 'de-DE', 'ru-RU', 'pt-BR'])
        expect(resolveLocaleMessages('es-ES').input.clear).toBe('Borrar')
        expect(resolveLocaleMessages('fr-FR').input.clear).toBe('Effacer')
        expect(resolveLocaleMessages('de-DE').input.clear).toBe('Löschen')
        expect(resolveLocaleMessages('ru-RU').input.clear).toBe('Очистить')
        expect(resolveLocaleMessages('pt-BR').input.clear).toBe('Limpar')
    })

    it('未注册的按需语种回落默认文案', () => {
        expect(resolveLocaleMessages('ja-JP')).toBe(defaultLocaleMessages)
    })

    it('注册表初值只含预注册语言（按需语种不随包根注册）', () => {
        expect(Object.keys(caomeiLocales)).toEqual([...PRE_REGISTERED_LOCALES])
        expect([...PRE_REGISTERED_LOCALES]).toEqual(['zh-CN', 'en-US'])
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

describe('resolveLocaleCode', () => {
    it('未指定语言时回退默认语言标识', () => {
        expect(resolveLocaleCode()).toBe('zh-CN')
    })

    it('预注册语言原样返回，未注册与未知语言（含原型链键）回退默认', () => {
        expect(resolveLocaleCode('en-US')).toBe('en-US')
        expect(resolveLocaleCode('ja-JP')).toBe('zh-CN')
        expect(resolveLocaleCode('it-IT' as CaomeiLocale)).toBe('zh-CN')
        expect(resolveLocaleCode('constructor' as CaomeiLocale)).toBe('zh-CN')
        expect(resolveLocaleCode('toString' as CaomeiLocale)).toBe('zh-CN')
    })

    it('已注册的按需语言原样返回', () => {
        withOnDemandLocales(['ja-JP'])
        expect(resolveLocaleCode('ja-JP')).toBe('ja-JP')
    })
})

describe('未注册语言的开发期告警', () => {
    it('未注册语言触发一条可操作告警（含子路径与注册示例）', () => {
        resolveLocaleCode('ja-JP')
        const warn = vi.mocked(console.warn)
        expect(warn).toHaveBeenCalledTimes(1)
        const message = String(warn.mock.calls[0][0])
        expect(message).toContain('语言 \'ja-JP\' 未注册')
        expect(message).toContain('caomei-ui/locale/ja-jp')
        expect(message).toContain('registerLocale')
    })

    it('预注册语言与未指定语言不告警', () => {
        resolveLocaleCode('en-US')
        resolveLocaleCode()
        expect(vi.mocked(console.warn)).not.toHaveBeenCalled()
    })

    it('按需语言注册后不再告警', () => {
        withOnDemandLocales(['ko-KR'])
        resolveLocaleCode('ko-KR')
        expect(vi.mocked(console.warn)).not.toHaveBeenCalled()
    })
})

describe('未注册语言的告警粒度', () => {
    it('provideLocale 解析未注册语言时只告警一次（两个注入值共用一次解析）', () => {
        const Root = defineComponent({
            setup() {
                provideLocale({ locale: 'ja-JP' })
                // 后代同时消费文案与语言标识（两处 inject）也不应重复告警
                return () => h('div', [h(CodeProbe), h(KeyProbe), h(Probe)])
            },
        })
        const wrapper = mount(Root)
        expect(wrapper.text()).toContain('zh-CN')
        expect(vi.mocked(console.warn)).toHaveBeenCalledTimes(1)
        wrapper.unmount()
    })
})

describe('registerLocale 时序契约', () => {
    /** 在 setup 中以 props 驱动的 provider 探针（语言切换经 computed 传播）。 */
    const ProviderProbe = defineComponent({
        name: 'LocaleProviderProbe',
        props: { locale: { type: String, required: true } },
        setup(props) {
            const messages = provideLocale({ locale: computed(() => props.locale as CaomeiLocale) })
            return () => h('span', messages.value.input.clear)
        },
    })

    it('先注册后 provider 时按注册文案生效', () => {
        withOnDemandLocales(['ja-JP'])
        expect(mount(ProviderProbe, { props: { locale: 'ja-JP' } }).text()).toBe('クリア')
    })

    it('先 provider 后注册不回溯生效（时序约束已在文档声明）', async () => {
        const wrapper = mount(ProviderProbe, { props: { locale: 'ja-JP' } })
        expect(wrapper.text()).toBe('清除')

        withOnDemandLocales(['ja-JP'])
        await nextTick()
        // 注册表为非响应式对象：已完成解析的 provider 不因后续注册而重算。
        expect(wrapper.text()).toBe('清除')
    })

    it('provider 语言后续切换仍按注册表解析', async () => {
        withOnDemandLocales(['ja-JP'])
        const wrapper = mount(ProviderProbe, { props: { locale: 'en-US' } })
        expect(wrapper.text()).toBe('Clear')

        await wrapper.setProps({ locale: 'ja-JP' })
        expect(wrapper.text()).toBe('クリア')
    })
})

describe('useLocaleCode', () => {
    it('无 provider 时回退默认语言标识', () => {
        expect(mount(CodeProbe).text()).toBe('zh-CN')
    })

    it('读取 provideLocale 提供的语言标识', () => {
        // 按需语种须先注册：未注册时会回落默认语言（见「未注册语言的开发期告警」）
        withOnDemandLocales(['ko-KR'])
        const Root = defineComponent({
            setup() {
                provideLocale({ locale: 'ko-KR' })
                return () => h(CodeProbe)
            },
        })

        expect(mount(Root).text()).toBe('ko-KR')
    })

    it('provider 语言变化时响应式更新', async () => {
        const locale = ref<CaomeiLocale>('zh-CN')
        const Root = defineComponent({
            setup() {
                provideLocale({ locale })
                return () => h(CodeProbe)
            },
        })

        const wrapper = mount(Root)
        expect(wrapper.text()).toBe('zh-CN')

        locale.value = 'en-US'
        await nextTick()
        expect(wrapper.text()).toBe('en-US')
    })

    it('CaomeiConfigProvider 向后代提供语言标识', async () => {
        withOnDemandLocales(['ja-JP', 'zh-TW'])
        const wrapper = mount(CaomeiConfigProvider, {
            props: { locale: 'ja-JP' },
            slots: { default: () => h(CodeProbe) },
        })

        expect(wrapper.text()).toBe('ja-JP')

        await wrapper.setProps({ locale: 'zh-TW' })
        expect(wrapper.text()).toBe('zh-TW')
    })

    it('语言标识注入键在后代中可读取', () => {
        const wrapper = mount(CaomeiConfigProvider, {
            props: { locale: 'en-US' },
            slots: { default: () => h(CodeKeyProbe) },
        })

        expect(wrapper.text()).toBe('en-US')
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
