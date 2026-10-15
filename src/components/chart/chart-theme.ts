/**
 * 图表主题：由宿主语义 token 生成 ECharts 主题对象。
 *
 * 纯函数 + 注入式读取（`ReadToken`）：深色 / 预设 / 主题切换的**取值来源是 CSS 计算值**，故把
 * token 读取做成入参，既便于单测覆盖各档配色，也便于 SSR 场景传入固定值。
 */

/** 系列默认配色取用的 token（顺序即配色顺序）。 */
export const CHART_SERIES_TOKEN_KEYS = [
    '--caomei-color-primary',
    '--caomei-color-success',
    '--caomei-color-warning',
    '--caomei-color-danger',
    '--caomei-color-text-muted',
] as const

/*
 * 前 4 色为语义色（随暗色自适应），第 5 色取**次级文本色**而非 `--caomei-color-neutral-solid`：
 * 后者不随暗色调整（恒为 #52525b），在暗色底 #0b0b0d 上非文本对比度不足 3:1；次级文本色在亮 / 暗
 * 两档分别为 #6b7280 / #a1a1aa，两档均达标。
 */

/** 主题其余取色与字体。 */
export const CHART_THEME_TOKEN_KEYS = {
    text: '--caomei-color-text',
    textMuted: '--caomei-color-text-muted',
    border: '--caomei-color-border',
    surface: '--caomei-color-bg-elevated',
    fontFamily: '--caomei-font-sans',
} as const

/** 读取 token 计算值的函数形态。 */
export type ReadToken = (name: string) => string

/** 生成主题所需的全部取值。 */
export interface ChartThemeTokens {
    series: string[]
    text: string
    textMuted: string
    border: string
    surface: string
    fontFamily: string
}

/** 读取 token 集合；空值（如未定义的基础层）按缺省回退为空串，由 `buildChartTheme` 兜底过滤。 */
export function readChartThemeTokens(read: ReadToken): ChartThemeTokens {
    return {
        series: CHART_SERIES_TOKEN_KEYS.map((key) => read(key)).filter(Boolean),
        text: read(CHART_THEME_TOKEN_KEYS.text),
        textMuted: read(CHART_THEME_TOKEN_KEYS.textMuted),
        border: read(CHART_THEME_TOKEN_KEYS.border),
        surface: read(CHART_THEME_TOKEN_KEYS.surface),
        fontFamily: read(CHART_THEME_TOKEN_KEYS.fontFamily),
    }
}

/** 从元素的计算样式读取 token 集合（浏览器侧用）。 */
export function readChartThemeTokensFromElement(element: Element): ChartThemeTokens {
    const style = getComputedStyle(element)
    return readChartThemeTokens((name) => style.getPropertyValue(name).trim())
}

/**
 * 生成 ECharts 主题对象。
 *
 * 覆盖面：配色、字体与文字色、标题 / 图例 / 提示框，以及四类坐标轴的轴线、刻度、标签与分割线。
 * **背景保持透明**：图表容器落在宿主背景之上，不引入自有底色。
 */
export function buildChartTheme(tokens: ChartThemeTokens): Record<string, unknown> {
    const textStyle = { fontFamily: tokens.fontFamily, color: tokens.text }
    const axis = {
        axisLine: { lineStyle: { color: tokens.border } },
        axisTick: { lineStyle: { color: tokens.border } },
        axisLabel: { color: tokens.textMuted },
        splitLine: { lineStyle: { color: tokens.border } },
        nameTextStyle: { color: tokens.textMuted },
    }

    return {
        color: tokens.series,
        backgroundColor: 'transparent',
        textStyle,
        title: {
            textStyle: { color: tokens.text },
            subtextStyle: { color: tokens.textMuted },
        },
        legend: {
            textStyle: { color: tokens.text },
        },
        tooltip: {
            backgroundColor: tokens.surface,
            borderColor: tokens.border,
            textStyle: { color: tokens.text },
        },
        categoryAxis: axis,
        valueAxis: axis,
        logAxis: axis,
        timeAxis: axis,
    }
}
