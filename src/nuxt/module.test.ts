import { addComponent, addImports, addTemplate, setGlobalHead } from '@nuxt/kit'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { caomeiComponents } from './components'
import { CAOMEI_UI_PACKAGE_NAME, caomeiUiNuxtModule, type CaomeiUiNuxtOptions } from './module'

vi.mock('@nuxt/kit', () => {
    const addComponentMock = vi.fn()
    const addImportsMock = vi.fn()
    const addTemplateMock = vi.fn(() => ({ dst: '/virtual/caomei-theme.css' }))
    const setGlobalHeadMock = vi.fn()

    const defineNuxtModule = (definition: {
        defaults?: Record<string, unknown>
        setup: (options: Record<string, unknown>, nuxt: unknown) => void
    }) => (inlineOptions: Record<string, unknown>, nuxt: unknown) => {
        definition.setup({ ...definition.defaults, ...inlineOptions }, nuxt)
    }

    return {
        addComponent: addComponentMock,
        addImports: addImportsMock,
        addTemplate: addTemplateMock,
        setGlobalHead: setGlobalHeadMock,
        defineNuxtModule,
    }
})

type ModuleRunner = (options: CaomeiUiNuxtOptions, nuxt: unknown) => unknown

interface FakeNuxt {
    options: { css: string[] }
}

function runModule(options: CaomeiUiNuxtOptions = {}): FakeNuxt {
    const nuxt: FakeNuxt = { options: { css: [] } }
    ;(caomeiUiNuxtModule as unknown as ModuleRunner)(options, nuxt)
    return nuxt
}

beforeEach(() => {
    vi.clearAllMocks()
})

describe('caomeiUiNuxtModule setup', () => {
    it('按默认前缀注册全部组件', () => {
        runModule()

        expect(CAOMEI_UI_PACKAGE_NAME).toBe('caomei-ui')
        expect(addComponent).toHaveBeenCalledTimes(caomeiComponents.length)
        expect(addComponent).toHaveBeenCalledWith({
            name: 'CaomeiButton',
            export: 'CaomeiButton',
            filePath: 'caomei-ui',
        })
        expect(addComponent).toHaveBeenCalledWith({
            name: 'CaomeiDataTable',
            export: 'CaomeiDataTable',
            filePath: 'caomei-ui',
        })
    })

    it('自定义前缀仅改写自动导入名', () => {
        runModule({ prefix: 'Ui' })

        expect(addComponent).toHaveBeenCalledWith({
            name: 'UiButton',
            export: 'CaomeiButton',
            filePath: 'caomei-ui',
        })
    })

    it('自动导入 composables', () => {
        runModule()

        expect(addImports).toHaveBeenCalledTimes(1)
        expect(addImports).toHaveBeenCalledWith([
            { name: 'provideLocale', from: 'caomei-ui' },
            { name: 'useConfirm', from: 'caomei-ui' },
            { name: 'useLocale', from: 'caomei-ui' },
            { name: 'useTheme', from: 'caomei-ui' },
            { name: 'useToast', from: 'caomei-ui' },
        ])
    })

    it('injectStyles 默认注入样式，关闭后不注入', () => {
        expect(runModule().options.css).toEqual(['caomei-ui/theme.css'])

        vi.clearAllMocks()
        expect(runModule({ injectStyles: false }).options.css).toEqual([])
    })

    it('theme 生成模板并追加到 css，空主题不生成', () => {
        const nuxt = runModule({ theme: { primary: '#123456' } })

        expect(addTemplate).toHaveBeenCalledWith({
            filename: 'caomei-theme.css',
            getContents: expect.any(Function) as () => string,
        })
        expect(nuxt.options.css).toEqual(['caomei-ui/theme.css', '/virtual/caomei-theme.css'])

        vi.clearAllMocks()
        expect(runModule().options.css).toEqual(['caomei-ui/theme.css'])
        expect(addTemplate).not.toHaveBeenCalled()
    })

    it('darkMode: media 写入 data-scheme，class / false 不写', () => {
        runModule({ darkMode: 'media' })
        expect(setGlobalHead).toHaveBeenCalledWith({ htmlAttrs: { 'data-scheme': 'auto' } })

        vi.clearAllMocks()
        runModule({ darkMode: 'class' })
        runModule({ darkMode: false })
        expect(setGlobalHead).not.toHaveBeenCalled()
    })
})
