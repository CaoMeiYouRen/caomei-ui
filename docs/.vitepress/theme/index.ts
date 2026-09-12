import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import ComponentApi from './components/component-api.vue'
import '../../../src/styles/index.css'

export default {
    extends: DefaultTheme,
    enhanceApp({ app }) {
        app.component('ComponentApi', ComponentApi)
    },
} satisfies Theme
