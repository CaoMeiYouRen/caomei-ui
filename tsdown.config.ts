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
        // 语言子路径入口：产出 `dist/locale/<code>.js` 与同名 `.d.ts`，
        // 经 `package.json` 的 `./locale/<code>` 子路径导出，供按需引入语言包。
        // 预注册语言（`PRE_REGISTERED_LOCALES`）由 `src/locale/index.ts` 静态引入，
        // 不在此登记；此处只登记需按需引入的内建语言。
        'locale/zh-tw': 'src/locale/zh-tw.ts',
        'locale/ja-jp': 'src/locale/ja-jp.ts',
        'locale/ko-kr': 'src/locale/ko-kr.ts',
        'locale/es-es': 'src/locale/es-es.ts',
        'locale/fr-fr': 'src/locale/fr-fr.ts',
        'locale/de-de': 'src/locale/de-de.ts',
        'locale/ru-ru': 'src/locale/ru-ru.ts',
        'locale/pt-br': 'src/locale/pt-br.ts',
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
            // 富文本编辑器为可选 peer：始终 external，未安装时由包装组件运行期降级
            'md-editor-v3',
            '@vavt/cm-extension',
        ],
    },
    plugins: [
        Vue({ isProduction: true }),
    ],
})
