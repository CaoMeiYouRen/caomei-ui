export interface CaomeiUiNuxtOptions {
    /** 组件前缀，默认 `Caomei` */
    prefix?: string
    /** 暗色模式策略 */
    darkMode?: 'class' | 'media' | false
    /** 是否自动注入样式 */
    injectStyles?: boolean
}

/**
 * `caomei-ui/nuxt` 的占位实现。
 * 真实的 @nuxt/kit 集成（组件/composables 自动导入、主题注入）在后续阶段落地。
 */
export function caomeiUiNuxtModule(options: CaomeiUiNuxtOptions = {}): CaomeiUiNuxtOptions {
    return {
        prefix: options.prefix ?? 'Caomei',
        darkMode: options.darkMode ?? 'class',
        injectStyles: options.injectStyles ?? true,
    }
}

export default caomeiUiNuxtModule
