import path from 'node:path'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const repo = path.resolve(dirname, '..', '..', '..')
/** 组件源码目录：默认工作区 `src`；`CAOMEI_SRC` 可指向 `HEAD` worktree，用于采集改动前基线（A/B）。 */
const srcDir = process.env.CAOMEI_SRC ? path.resolve(process.env.CAOMEI_SRC) : path.join(repo, 'src')

/**
 * 计算样式等价夹具的独立 Vite 配置。
 *
 * 被测对象是 `src/` 源码（而非构建产物或文档站），因此采样随源码改动即时生效；
 * 端口避开 playground（4400）、常驻 E2E（4501）与文档站预览（4173）。
 * 用 `.mjs` 而非 `.ts`：本文件运行在 Vite / Node 上下文，不进入 `tsconfig` 的应用侧程序。
 */
export default defineConfig({
    root: dirname,
    plugins: [vue()],
    resolve: {
        alias: {
            '@': srcDir,
        },
    },
    server: {
        host: '127.0.0.1',
        port: 4521,
        strictPort: true,
        fs: {
            // `CAOMEI_SRC` 指向 worktree（仓库外）时需显式放行
            allow: [dirname, repo, srcDir],
        },
    },
    clearScreen: false,
})
