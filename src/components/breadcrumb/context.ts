import type { ComputedRef, InjectionKey } from 'vue'

/** 面包屑上下文：仅承载分隔符文本（分隔符的显隐由容器按**渲染位置**决定）。 */
export interface CaomeiBreadcrumbContext {
    separator: ComputedRef<string>
}

export const caomeiBreadcrumbContextKey: InjectionKey<CaomeiBreadcrumbContext> = Symbol('caomei-breadcrumb')
