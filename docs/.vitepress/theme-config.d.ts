import type {} from 'vitepress'

declare module 'vitepress' {
    namespace DefaultTheme {
        interface Config {
            /**
             * 已翻译路由表：语言标识 → 该语言已存在的路由路径（源语言中文全量、无需列出）。
             * 由 `config.ts` 扫描 `docs/i18n/<locale>/` 生成，供语言菜单判断能否回切对应页。
             */
            routingPages?: Record<string, string[]>
        }
    }
}
