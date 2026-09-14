import { computed, type ComputedRef } from 'vue'
import { useData } from 'vitepress'

export interface LocaleLink {
    /** 目标语言的显示名 */
    text: string
    /** 目标链接：已翻译页回切对应路由，未翻译页回退目标 locale 首页 */
    link: string
}

export interface CurrentLang {
    label: string | undefined
    link: string
}

export interface UseLangsOptions {
    /** 是否生成「对应路由」链接；默认主题的桌面 / 平板 / 移动端语言菜单均传 true */
    correspondingLink?: boolean
}

export interface UseLangsReturn {
    localeLinks: ComputedRef<LocaleLink[]>
    currentLang: ComputedRef<CurrentLang>
}

/** 复刻 VitePress `ensureStartingSlash`：缺少前导斜杠时补上 */
function ensureStartingSlash(path: string): string {
    return path.startsWith('/') ? path : `/${path}`
}

/**
 * 复刻 VitePress 1.6 `normalizeLink` 的路径拼接（含 `cleanUrls` 的 `.html` 分支），
 * 保证与默认主题其余链接生成逻辑一致。
 */
function normalizeLink(link: string, addPath: boolean, path: string, addExt: boolean): string {
    return addPath
        ? link.replace(/\/$/, '')
        + ensureStartingSlash(
            path
                .replace(/(^|\/)index\.md$/, '$1')
                .replace(/\.md$/, addExt ? '.html' : ''),
        )
        : link
}

/**
 * 覆盖默认主题的 `useLangs`（见 `config.ts` 的 Vite alias）。
 *
 * 默认主题在 `themeConfig.i18nRouting: false` 下只能回 locale 首页；本站为「部分翻译」，
 * 因此按 `themeConfig.routingPages` 判断目标页是否存在：已翻译则回切对应路由，
 * 未翻译（或未登记的 locale）则回退目标 locale 首页，避免 404。
 *
 * 三个菜单消费者（`VPNavBarTranslations` / `VPNavBarExtra` / `VPNavScreenTranslations`）
 * 共用本实现，桌面、平板、移动端行为一致。
 */
export function useLangs({ correspondingLink = false }: UseLangsOptions = {}): UseLangsReturn {
    const { site, page, theme, localeIndex, hash } = useData()

    const currentLang = computed<CurrentLang>(() => {
        const index = localeIndex.value
        const locale = site.value.locales?.[index]
        return {
            label: locale?.label,
            link: locale?.link || (index === 'root' ? '/' : `/${index}/`),
        }
    })

    const localeLinks = computed<LocaleLink[]>(() => {
        const relativePath = page.value.relativePath.slice(currentLang.value.link.length - 1)
        const routePath = ensureStartingSlash(
            relativePath.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, ''),
        )
        const routingPages = theme.value.routingPages ?? {}

        return Object.entries(site.value.locales ?? {})
            .filter(([, value]) => value.label !== currentLang.value.label)
            .map(([key, value]) => {
                const targetLink = value.link || (key === 'root' ? '/' : `/${key}/`)
                // 中文（root）为源语言、全量存在；其他语言需显式登记且包含当前路由，
                // 未登记的 locale 保守回退首页（宁可丢位置，不可 404）
                const hasTranslation =
                    key === 'root' || (routingPages[key]?.includes(routePath) ?? false)
                const link = correspondingLink && hasTranslation
                    ? normalizeLink(targetLink, true, relativePath, !site.value.cleanUrls)
                    : targetLink
                return { text: value.label, link: link + hash.value }
            })
    })

    return { localeLinks, currentLang }
}
