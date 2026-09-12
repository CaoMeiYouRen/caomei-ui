import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const dirname = path.dirname(fileURLToPath(import.meta.url))

// 开发/演示环境：仅用于本地调试组件，库产物由 tsdown 构建。
export default defineConfig({
    root: 'playground',
    plugins: [vue()],
    server: {
        port: 4400,
        open: true,
    },
    resolve: {
        alias: {
            '@': path.resolve(dirname, 'src'),
        },
    },
})
