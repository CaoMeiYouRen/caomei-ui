import type { ComputedRef, InjectionKey } from 'vue'
import type { TabbarValue } from './types'

/** 标签栏上下文：条目读取当前值并上报选择（不接路由，选择由使用方消费）。 */
export interface TabbarContext {
    /** 当前选中值 */
    value: ComputedRef<TabbarValue | undefined>
    /** 上报选择 */
    select: (value: TabbarValue) => void
}

export const caomeiTabbarContextKey: InjectionKey<TabbarContext> = Symbol('caomei-tabbar')
