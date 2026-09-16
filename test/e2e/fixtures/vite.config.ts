import path from 'node:path'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * E2E 夹具的独立 Vite 配置。
 *
 * 被测对象是 `src/` 源码（而非 playground 或文档站产物），从而：
 * - 常驻用例随源码改动即时生效，无需先 `pnpm build`；
 * - 组件 scoped 样式带真实 `data-v-*`，布局断言在真实浏览器中成立
 *   （happy-dom 无布局引擎，几何断言不写单测，见测试规范 §5）。
 *
 * 端口 / host 固定供 `playwright.config.ts` 的 webServer 探活。
 */
export default defineConfig({
    root: dirname,
    plugins: [vue()],
    resolve: {
        alias: {
            '@': path.resolve(dirname, '../../../src'),
        },
    },
    server: {
        host: '127.0.0.1',
        port: 4501,
        strictPort: true,
    },
    clearScreen: false,
})
