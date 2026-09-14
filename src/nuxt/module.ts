import { addComponent, addImports, addTemplate, defineNuxtModule, setGlobalHead } from '@nuxt/kit'
import type { NuxtModule } from '@nuxt/schema'
import { caomeiComponents, resolveComponentName } from './components'
import { renderThemeCss } from './theme'

/** `caomei-ui/nuxt` 模块选项。 */
export interface CaomeiUiNuxtOptions {
    /** 组件自动导入前缀，默认 `Caomei`；仅影响自动导入名，导出名不变 */
    prefix?: string
    /** 暗色模式策略：`class` 由应用切换 `.dark`；`media` 由模块写入 `data-scheme="auto"` 跟随系统；`false` 不处理 */
    darkMode?: 'class' | 'media' | false
    /** 是否自动注入 `caomei-ui/styles.css`，默认 `true` */
    injectStyles?: boolean
    /** 覆盖主题 token：语义别名（如 `primary` / `radius`）或 `--caomei-*` 变量名 */
    theme?: Record<string, string>
}

/** 包名，同时作为组件 / composables 的导入来源。 */
export const CAOMEI_UI_PACKAGE_NAME = 'caomei-ui'

/**
 * caomei-ui 的 Nuxt 模块。
 *
 * 职责：组件自动导入、composables 自动导入、样式注入、主题 token 覆盖、暗色策略。
 * 组件与样式均由包内 `caomei-ui` / `caomei-ui/styles.css` 提供，模块不复制运行时文件。
 */
export const caomeiUiNuxtModule: NuxtModule<CaomeiUiNuxtOptions> = defineNuxtModule<CaomeiUiNuxtOptions>({
    meta: {
        name: CAOMEI_UI_PACKAGE_NAME,
        configKey: 'caomeiUI',
        compatibility: {
            nuxt: '>=4.0.0',
        },
    },
    defaults: {
        prefix: 'Caomei',
        darkMode: 'class',
        injectStyles: true,
        theme: {},
    },
    setup(options, nuxt) {
        const prefix = options.prefix ?? 'Caomei'

        for (const exportName of caomeiComponents) {
            addComponent({
                name: resolveComponentName(prefix, exportName),
                export: exportName,
                filePath: CAOMEI_UI_PACKAGE_NAME,
            })
        }

        addImports([
            { name: 'useConfirm', from: CAOMEI_UI_PACKAGE_NAME },
            { name: 'useTheme', from: CAOMEI_UI_PACKAGE_NAME },
            { name: 'useToast', from: CAOMEI_UI_PACKAGE_NAME },
        ])

        if (options.injectStyles) {
            nuxt.options.css.push(`${CAOMEI_UI_PACKAGE_NAME}/styles.css`)
        }

        const themeCss = renderThemeCss(options.theme)
        if (themeCss) {
            const themeTemplate = addTemplate({
                filename: 'caomei-theme.css',
                getContents: () => themeCss,
            })
            nuxt.options.css.push(themeTemplate.dst)
        }

        if (options.darkMode === 'media') {
            setGlobalHead({
                htmlAttrs: {
                    'data-scheme': 'auto',
                },
            })
        }
    },
})

export default caomeiUiNuxtModule
