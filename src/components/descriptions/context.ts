import type { InjectionKey } from 'vue'
import type { DescriptionsContext } from './types'

/** 描述列表上下文注入键。 */
export const descriptionsContextKey: InjectionKey<DescriptionsContext> = Symbol('caomei-descriptions')
