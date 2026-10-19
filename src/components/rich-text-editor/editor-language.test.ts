import { describe, expect, it, vi } from 'vitest'
import {
    EDITOR_FALLBACK_LANGUAGE,
    EDITOR_LANGUAGE_BY_LOCALE,
    hasExtensionLocale,
    loadExtensionLocale,
    resolveEditorLanguage,
} from './editor-language'

describe('EDITOR_LANGUAGE_BY_LOCALE', () => {
    it('覆盖本库全部 10 语种，且 ja-JP / ru-RU 映射到扩展包键名', () => {
        expect(EDITOR_LANGUAGE_BY_LOCALE).toEqual({
            'zh-CN': 'zh-CN',
            'en-US': 'en-US',
            'zh-TW': 'zh-TW',
            'ja-JP': 'jp-JP',
            'ko-KR': 'ko-KR',
            'es-ES': 'es-ES',
            'fr-FR': 'fr-FR',
            'de-DE': 'de-DE',
            'ru-RU': 'ru',
            'pt-BR': 'pt-BR',
        })
    })
})

describe('resolveEditorLanguage', () => {
    it('已登记语种返回对应语言键，且不告警', () => {
        const warn = vi.fn()
        expect(resolveEditorLanguage('zh-TW', warn)).toBe('zh-TW')
        expect(resolveEditorLanguage('ja-JP', warn)).toBe('jp-JP')
        expect(resolveEditorLanguage('ru-RU', warn)).toBe('ru')
        expect(warn).not.toHaveBeenCalled()
    })

    it('未登记语种回退 zh-CN 并告警', () => {
        const warn = vi.fn()
        // 类型外取值（模拟运行期传入未知 locale）
        expect(resolveEditorLanguage('it-IT' as never, warn)).toBe(EDITOR_FALLBACK_LANGUAGE)
        expect(warn).toHaveBeenCalledTimes(1)
        expect(warn.mock.calls[0][0]).toContain('it-IT')
    })
})

describe('hasExtensionLocale', () => {
    it('仅预注册语言免加载扩展包，其余 8 门按需语言均依赖扩展包', () => {
        expect(hasExtensionLocale('zh-CN')).toBe(false)
        expect(hasExtensionLocale('en-US')).toBe(false)
        for (const code of ['zh-TW', 'ja-JP', 'ko-KR', 'es-ES', 'fr-FR', 'de-DE', 'ru-RU', 'pt-BR'] as const) {
            expect(hasExtensionLocale(code)).toBe(true)
        }
    })
})

describe('loadExtensionLocale', () => {
    it('内置语种返回 undefined（无需加载）', async () => {
        await expect(loadExtensionLocale('zh-CN')).resolves.toBeUndefined()
        await expect(loadExtensionLocale('en-US')).resolves.toBeUndefined()
    })

    it('按需语种从扩展包加载文案（ru-RU 走 ru 文件）', async () => {
        await expect(loadExtensionLocale('ru-RU')).resolves.toBeTruthy()
    })
})
