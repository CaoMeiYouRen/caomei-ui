export interface CaomeiUiResolverOptions {
    /** 组件前缀，默认 `Caomei` */
    prefix?: string
}

export interface CaomeiUiResolverResult {
    name: string
    from: string
    sideEffects?: string
}

/** resolver 实例：`type` 固定为 `component`，`resolve` 把组件名映射到来源包 */
export interface CaomeiUiResolverInstance {
    type: 'component'
    resolve: (name: string) => CaomeiUiResolverResult | undefined
}

/**
 * unplugin-vue-components resolver 的占位实现。
 * 后续将按组件映射到子路径导出，避免整包引入。
 */
export function CaomeiUiResolver(options: CaomeiUiResolverOptions = {}): CaomeiUiResolverInstance {
    const prefix = options.prefix ?? 'Caomei'

    return {
        type: 'component' as const,
        resolve(name: string): CaomeiUiResolverResult | undefined {
            if (!name.startsWith(prefix) || name.length === prefix.length) {
                return undefined
            }
            return {
                name,
                from: 'caomei-ui',
                sideEffects: 'caomei-ui/styles.css',
            }
        },
    }
}
