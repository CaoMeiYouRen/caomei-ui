import { defineConfig } from 'tsdown'
import Vue from 'unplugin-vue/rolldown'

/**
 * tsdown 库构建配置：编译 Vue SFC、external 化 vue/reka-ui、
 * 逐模块产出 ESM 与 CSS（`css.inject` 保留 CSS import，供消费方按需 tree-shaking）、
 * 生成类型声明，并输出 index/resolver/nuxt 多入口。
 *
 * 形态依据见 docs/design/governance/2026-09-20-m1-1-build-path-poc.md 与
 * 2026-09-20-m1-2-entry-semantics-and-dts-verification.md（构建路径 POC 与入口语义验证）。
 */
export default defineConfig({
    entry: {
        index: 'src/index.ts',
        resolver: 'src/resolver/index.ts',
        nuxt: 'src/nuxt/module.ts',
    },
    format: ['esm'],
    platform: 'neutral',
    target: 'es2020',
    outDir: 'dist',
    clean: true,
    unbundle: true,
    dts: {
        vue: true,
    },
    // unbundle 模式下 css.splitting 默认为 true，不再产出单体 styles.css；
    // 基础层落 dist/styles/index.css，经 `caomei-ui/theme.css` 子路径导出。
    css: {
        inject: true,
    },
    deps: {
        neverBundle: [
            'vue',
            'reka-ui',
            '@tanstack/vue-table',
            '@internationalized/date',
            '@nuxt/kit',
            '@nuxt/schema',
        ],
    },
    plugins: [
        Vue({ isProduction: true }),
    ],
})
