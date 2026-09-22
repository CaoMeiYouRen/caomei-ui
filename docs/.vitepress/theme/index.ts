import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import ComponentApi from './components/component-api.vue'
import ShowcaseGrid from './components/showcase-grid.vue'
import Layout from './layout.vue'
import '../../../src/styles/index.css'
import './motion.css'
import './caomei-demo.css'

export default {
    extends: DefaultTheme,
    Layout,
    enhanceApp({ app }): void {
        app.component('ComponentApi', ComponentApi)
        app.component('ShowcaseGrid', ShowcaseGrid)
    },
} satisfies Theme
