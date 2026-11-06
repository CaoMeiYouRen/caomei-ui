import { createApp } from 'vue'
import App from './app.vue'
import './visual-fonts.css'

// 视觉回归专用字体只在 `?visual=1` 时启用；E2E 夹具的字体 / 几何保持不变。
if (new URLSearchParams(location.search).get('visual') === '1') {
    document.documentElement.setAttribute('data-visual', '1')
}

createApp(App).mount('#app')
