import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import ComponentApi from './components/component-api.vue'
import Layout from './layout.vue'
import '../../../src/styles/index.css'

export default {
    extends: DefaultTheme,
    Layout,
    enhanceApp({ app }) {
        app.component('ComponentApi', ComponentApi)
    },
} satisfies Theme
