import enUS from './en-us'
import jaJP from './ja-jp'
import koKR from './ko-kr'
import zhCN from './zh-cn'
import zhTW from './zh-tw'
import type { CaomeiLocaleMessages } from './types'

export type { CaomeiLocaleMessageOverrides, CaomeiLocaleMessages } from './types'

export const caomeiLocales = {
    'zh-CN': zhCN,
    'en-US': enUS,
    'zh-TW': zhTW,
    'ja-JP': jaJP,
    'ko-KR': koKR,
} as const

export type CaomeiLocale = keyof typeof caomeiLocales

export const defaultLocale: CaomeiLocale = 'zh-CN'

export const defaultLocaleMessages: CaomeiLocaleMessages = zhCN
