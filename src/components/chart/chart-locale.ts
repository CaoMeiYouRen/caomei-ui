import type { CaomeiLocale } from '../../locale'

/**
 * 图表语言与宿主 locale 的映射、以及扩展语言的按需注册。
 *
 * `echarts/core` 已内置 `EN` / `ZH` 两套语言（`lib/core/locale.js` 内部注册），其余语言由
 * `echarts/i18n/lang<XX>` 以**副作用导入**方式注册——故本模块只对「未内置」的语种做动态导入，
 * 且不静态引用 `echarts` 的类型（可选 peer 约束，见 `chart-loader.ts`）。
 */

/** 本库 locale → ECharts `locale` 键。 */
export const CHART_LOCALE_BY_LOCALE: Record<CaomeiLocale, string> = {
    'zh-CN': 'ZH',
    // ECharts 未提供繁体语言包：`zh-TW` 回落简体 `ZH`（已知差异，见组件页）
    'zh-TW': 'ZH',
    'en-US': 'EN',
    'ja-JP': 'JA',
    'ko-KR': 'KO',
}

/**
 * 内置语言（`echarts/core` 自带，无需注册）。
 *
 * **实现以 `EXTRA_LOCALE_LOADERS` 为唯一事实源**：本常量当前只供测试引用；新增语种时应同时确认它
 * 是否仍属「内置」——若属扩展则须在 loader 表中登记，不在本表出现。
 */
export const CHART_BUILTIN_LOCALES = ['EN', 'ZH'] as const

/** 未内置语言的语言包加载器（副作用注册）。 */
const EXTRA_LOCALE_LOADERS: Partial<Record<string, () => Promise<unknown>>> = {
    JA: () => import('echarts/i18n/langJA'),
    KO: () => import('echarts/i18n/langKO'),
}

/**
 * 解析 ECharts 语言键。
 *
 * 映射对 `CaomeiLocale` 是全函数：`useLocaleCode()` 已在 `resolveLocaleCode` 中完成「未登记值回落
 * 默认语言」的归一化，故此处不再重复兜底。
 */
export function resolveChartLocale(locale: CaomeiLocale): string {
    return CHART_LOCALE_BY_LOCALE[locale]
}

/**
 * 按需注册语言包（幂等：同语言重复调用复用模块缓存）。
 *
 * @throws 语言包缺失时抛出，由调用方捕获并回落内置语言（不阻断图表渲染）。
 */
export async function registerChartLocale(localeKey: string): Promise<string> {
    const loader = EXTRA_LOCALE_LOADERS[localeKey]
    if (!loader) {
        return localeKey
    }
    await loader()
    return localeKey
}
