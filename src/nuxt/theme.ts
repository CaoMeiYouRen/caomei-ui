/**
 * Nuxt 模块的主题 token 解析。
 *
 * `theme` 的键支持两类：
 * 1. 语义别名（如 `primary` / `radius`），映射到对应 `--caomei-*` 变量；
 * 2. 完整 CSS 变量名（以 `--` 开头），原样使用。
 *
 * token 清单以 `src/styles/theme.css` 为准，本文件只维护别名映射。
 */
export const CAOMEI_THEME_ALIASES: Record<string, string> = {
    primary: '--caomei-color-primary',
    'primary-solid': '--caomei-color-primary-solid',
    danger: '--caomei-color-danger',
    'danger-solid': '--caomei-color-danger-solid',
    success: '--caomei-color-success',
    'success-solid': '--caomei-color-success-solid',
    warning: '--caomei-color-warning',
    'warning-solid': '--caomei-color-warning-solid',
    neutral: '--caomei-color-neutral-solid',
    'on-solid': '--caomei-color-on-solid',
    bg: '--caomei-color-bg',
    'bg-elevated': '--caomei-color-bg-elevated',
    text: '--caomei-color-text',
    'text-muted': '--caomei-color-text-muted',
    border: '--caomei-color-border',
    radius: '--caomei-radius-md',
    'radius-sm': '--caomei-radius-sm',
    'radius-lg': '--caomei-radius-lg',
    'radius-full': '--caomei-radius-full',
    font: '--caomei-font-sans',
}

export interface CaomeiThemeVariable {
    /** 目标 CSS 变量名，如 `--caomei-color-primary` */
    name: string
    value: string
}

/** 解析主题配置为 CSS 变量列表；未知别名抛出明确错误。 */
export function resolveThemeVariables(theme: Record<string, string> = {}): CaomeiThemeVariable[] {
    const variables: CaomeiThemeVariable[] = []

    for (const [key, value] of Object.entries(theme)) {
        if (key.startsWith('--')) {
            variables.push({ name: key, value })
            continue
        }

        const name = CAOMEI_THEME_ALIASES[key]
        if (!name) {
            throw new Error(
                `[caomei-ui] 未知的主题 token：${key}。`
                + `请使用语义别名（${Object.keys(CAOMEI_THEME_ALIASES).join(' / ')}）`
                + '，或以 `--` 开头的完整 CSS 变量名。',
            )
        }

        variables.push({ name, value })
    }

    return variables
}

/** 将主题配置渲染为 `:root { ... }` CSS；无配置时返回空字符串。 */
export function renderThemeCss(theme: Record<string, string> = {}): string {
    const variables = resolveThemeVariables(theme)
    if (variables.length === 0) {
        return ''
    }

    const declarations = variables
        .map(({ name, value }) => `    ${name}: ${value};`)
        .join('\n')

    return `:root {\n${declarations}\n}\n`
}
