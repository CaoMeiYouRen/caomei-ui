import { defineConfig } from 'tsdown'
import Vue from 'unplugin-vue/rolldown'

/**
 * tsdown 库构建配置：编译 Vue SFC、external 化 vue/reka-ui、
 * 抽取 CSS 到 styles.css、生成类型声明，并输出 index/resolver/nuxt 多入口。
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
    dts: {
        vue: true,
    },
    css: {
        fileName: 'styles.css',
    },
    deps: {
        neverBundle: ['vue', 'reka-ui', '@tanstack/vue-table', '@nuxt/kit', '@nuxt/schema'],
    },
    plugins: [
        Vue({ isProduction: true }),
    ],
})
