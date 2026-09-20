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
 * unplugin-vue-components resolver：把组件名映射到包根（命名导入），并注入基础层样式入口。
 *
 * 组件样式随各自模块自带（构建产物保留逐模块 CSS import），消费方按需引入时
 * 由打包器 tree-shaking 丢弃未使用组件的 CSS；此处只负责补齐**基础层**
 * （tokens + 暗色 + `.caomei-root` + 品牌预设），它与包根入口引用同一模块，
 * 打包器会去重，不会重复注入。
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
                sideEffects: 'caomei-ui/theme.css',
            }
        },
    }
}
