import type { InjectionKey } from 'vue'

/**
 * 标记「上层已存在 `CaomeiTooltipProvider`」的注入键。
 *
 * Reka 的 `TooltipRoot` 在缺 `TooltipProvider` 时直接抛错，而组件库内建提示（如 Button 的
 * `tooltip`）由组件自身渲染，无法假定使用方已在应用根部放置 Provider。`CaomeiTooltip` 借本键
 * 判断是否需要内建兜底 Provider：存在时完全沿用上层配置（含跨提示的延迟共享），不存在时以默认
 * 配置兜底，避免「未放 Provider 的存量应用升级后直接崩溃」。
 *
 * 只用于**存在性判定**，不承载配置值——配置仍由 Reka 自身的 Provider 上下文传递。
 */
export const CAOMEI_TOOLTIP_PROVIDER_KEY: InjectionKey<true> = Symbol('caomei-tooltip-provider')
