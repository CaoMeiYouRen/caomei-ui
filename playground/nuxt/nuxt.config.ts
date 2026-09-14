/**
 * caomei-ui/nuxt 最小消费冒烟 fixture。
 *
 * 由 `pnpm check:nuxt`（scripts/release/check-nuxt.mjs）驱动：
 * 冒烟前脚本会把 `caomei-ui` 链接到本目录的 node_modules，模拟下游消费构建产物。
 */
export default defineNuxtConfig({
    compatibilityDate: '2025-01-01',
    ssr: true,
    modules: ['caomei-ui/nuxt'],
    caomeiUI: {
        prefix: 'Caomei',
        darkMode: 'media',
        injectStyles: true,
        theme: { primary: '#123456' },
    },
    app: {
        head: {
            htmlAttrs: {
                'data-preset': 'caomei',
            },
        },
    },
})
