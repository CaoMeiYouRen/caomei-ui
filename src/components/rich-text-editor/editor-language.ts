import type { Component } from 'vue'
import type { CaomeiLocale } from '../../locale'

/**
 * 编辑器语言与宿主 locale 的映射、以及扩展语言的按需加载。
 *
 * 本模块刻意**不静态引用** `md-editor-v3` / `@vavt/cm-extension` 的类型或运行时值：
 * 两者是可选 peer，未安装时既不能阻断构建，也不能让包根 `.d.ts` 因缺类型而无法解析。
 * 所有访问都经动态 `import()`，并在包装组件内做失败降级。
 */

/** 本库 locale → 编辑器 `language` 键。 */
export const EDITOR_LANGUAGE_BY_LOCALE: Record<CaomeiLocale, string> = {
    'zh-CN': 'zh-CN',
    'en-US': 'en-US',
    'zh-TW': 'zh-TW',
    // 扩展包使用 `jp-JP` 键名，与本库的 `ja-JP` 不同，须显式转换
    'ja-JP': 'jp-JP',
    'ko-KR': 'ko-KR',
}

/** 未登记语种的回退语言键。 */
export const EDITOR_FALLBACK_LANGUAGE = 'zh-CN'

/**
 * 解析编辑器语言键；未登记的 locale 回退 `zh-CN`。
 *
 * @param locale 宿主 locale
 * @param warn 未登记时的告警回调（注入以便单测断言，缺省不告警）
 */
export function resolveEditorLanguage(
    locale: CaomeiLocale,
    warn?: (message: string) => void,
): string {
    const language = EDITOR_LANGUAGE_BY_LOCALE[locale]
    if (language) {
        return language
    }
    warn?.(`[CaomeiRichTextEditor] 未登记的语言 "${String(locale)}"，回退 ${EDITOR_FALLBACK_LANGUAGE}`)
    return EDITOR_FALLBACK_LANGUAGE
}

interface LocaleModule {
    default: unknown
}

/** 需要经 `@vavt/cm-extension` 补充的内置语言（其余由 `md-editor-v3` 内置提供）。 */
const EXTENSION_LOCALE_LOADERS: Partial<Record<CaomeiLocale, () => Promise<LocaleModule>>> = {
    'zh-TW': () => import('@vavt/cm-extension/dist/locale/zh-TW.js'),
    'ja-JP': () => import('@vavt/cm-extension/dist/locale/jp-JP.js'),
    'ko-KR': () => import('@vavt/cm-extension/dist/locale/ko-KR.js'),
}

/** 该 locale 是否依赖扩展包提供文案。 */
export function hasExtensionLocale(locale: CaomeiLocale): boolean {
    return Object.prototype.hasOwnProperty.call(EXTENSION_LOCALE_LOADERS, locale)
}

/**
 * 按需加载扩展语言文案；不依赖扩展包的 locale 返回 `undefined`。
 * 扩展包未安装时由调用方捕获并降级。
 */
export async function loadExtensionLocale(locale: CaomeiLocale): Promise<unknown> {
    const loader = EXTENSION_LOCALE_LOADERS[locale]
    if (!loader) {
        return undefined
    }
    const module = await loader()
    return module.default
}

/** 编辑器模块中包装层实际使用到的最小接口。 */
export interface EditorModule {
    /** 编辑器组件（`MdEditor`） */
    MdEditor: Component
    /** 注册自定义语言等全局配置 */
    config: (options: EditorConfigOptions) => void
}

/** `config()` 的最小入参形态（仅覆盖包装层需要写入的部分）。 */
export interface EditorConfigOptions {
    editorConfig: {
        languageUserDefined: Record<string, unknown>
    }
}

/**
 * 按需加载编辑器内核与样式（先样式后内核，避免首帧无样式闪烁）。
 *
 * @throws 可选 peer `md-editor-v3` 未安装或加载失败时抛出，由包装组件降级为占位。
 */
export async function loadEditor(): Promise<EditorModule> {
    await import('md-editor-v3/lib/style.css')
    const module = await import('md-editor-v3')
    return {
        MdEditor: module.MdEditor as unknown as Component,
        config: module.config as unknown as EditorModule['config'],
    }
}

/**
 * 注册指定 locale 所需的编辑器语言，返回最终应传给编辑器的 `language` 键。
 *
 * 内置语言（`zh-CN` / `en-US`）无需注册，直接返回键名；扩展语言在扩展包缺失或加载失败时
 * 回退 `zh-CN` 并告警。
 */
export async function registerEditorLanguage(
    module: EditorModule,
    locale: CaomeiLocale,
    warn?: (message: string) => void,
): Promise<string> {
    const language = resolveEditorLanguage(locale, warn)
    if (!hasExtensionLocale(locale)) {
        return language
    }
    try {
        const text = await loadExtensionLocale(locale)
        module.config({ editorConfig: { languageUserDefined: { [language]: text } } })
        return language
    } catch (error) {
        warn?.(`[CaomeiRichTextEditor] 语言扩展加载失败，回退 ${EDITOR_FALLBACK_LANGUAGE}：${String(error)}`)
        return EDITOR_FALLBACK_LANGUAGE
    }
}
