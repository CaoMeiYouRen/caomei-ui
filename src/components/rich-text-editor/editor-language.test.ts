import { describe, expect, it, vi } from 'vitest'
import {
    EDITOR_FALLBACK_LANGUAGE,
    EDITOR_LANGUAGE_BY_LOCALE,
    hasExtensionLocale,
    loadExtensionLocale,
    resolveEditorLanguage,
} from './editor-language'

describe('EDITOR_LANGUAGE_BY_LOCALE', () => {
    it('覆盖本库全部 5 语种，且 ja-JP 映射到扩展包的 jp-JP 键名', () => {
        expect(EDITOR_LANGUAGE_BY_LOCALE).toEqual({
            'zh-CN': 'zh-CN',
            'en-US': 'en-US',
            'zh-TW': 'zh-TW',
            'ja-JP': 'jp-JP',
            'ko-KR': 'ko-KR',
        })
    })
})

describe('resolveEditorLanguage', () => {
    it('已登记语种返回对应语言键，且不告警', () => {
        const warn = vi.fn()
        expect(resolveEditorLanguage('zh-TW', warn)).toBe('zh-TW')
        expect(resolveEditorLanguage('ja-JP', warn)).toBe('jp-JP')
        expect(warn).not.toHaveBeenCalled()
    })

    it('未登记语种回退 zh-CN 并告警', () => {
        const warn = vi.fn()
        // 类型外取值（模拟运行期传入未知 locale）
        expect(resolveEditorLanguage('fr-FR' as never, warn)).toBe(EDITOR_FALLBACK_LANGUAGE)
        expect(warn).toHaveBeenCalledTimes(1)
        expect(warn.mock.calls[0][0]).toContain('fr-FR')
    })
})

describe('hasExtensionLocale', () => {
    it('仅 zh-TW / ja-JP / ko-KR 依赖扩展包', () => {
        expect(hasExtensionLocale('zh-CN')).toBe(false)
        expect(hasExtensionLocale('en-US')).toBe(false)
        expect(hasExtensionLocale('zh-TW')).toBe(true)
        expect(hasExtensionLocale('ja-JP')).toBe(true)
        expect(hasExtensionLocale('ko-KR')).toBe(true)
    })
})

describe('loadExtensionLocale', () => {
    it('内置语种返回 undefined（无需加载）', async () => {
        await expect(loadExtensionLocale('zh-CN')).resolves.toBeUndefined()
        await expect(loadExtensionLocale('en-US')).resolves.toBeUndefined()
    })
})
