#!/usr/bin/env node

/**
 * 构建「免启动」的动效审查页：输出单文件 HTML，可直接双击用浏览器打开（file://）。
 *
 * 为什么需要它：`pnpm review:motion` 依赖 Vite 开发服务器；评审若只想看动效，多一步启动就会
 * 把「动画被浏览器/系统偏好压平」与「页面没起来」混在一起。此处用 Vite 的 IIFE 库模式打包
 * 一个自包含 HTML（JS / CSS 全部内联），不依赖模块加载，file:// 下可直接运行。
 *
 * 输出：`artifacts/motion-review/site/motion-review.html`（gitignored，本地取证用）。
 *
 * 用法：
 *   node scripts/review/build-motion-review.mjs
 */
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { build } from 'vite'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const outDir = path.join(projectRoot, 'artifacts', 'motion-review', 'site')

await mkdir(outDir, { recursive: true })

await build({
    root: path.join(projectRoot, 'playground'),
    configFile: false,
    base: './',
    logLevel: 'warn',
    define: {
        'process.env.NODE_ENV': JSON.stringify('production'),
        __CAOMEI_REVIEW_FORCE_MOTION__: 'true',
        __VUE_OPTIONS_API__: 'true',
        __VUE_PROD_DEVTOOLS__: 'false',
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false',
    },
    plugins: [vue()],
    resolve: {
        alias: {
            '@': path.join(projectRoot, 'src'),
        },
    },
    build: {
        outDir,
        emptyOutDir: true,
        cssCodeSplit: false,
        target: 'es2020',
        lib: {
            entry: path.join(projectRoot, 'playground', 'motion.ts'),
            formats: ['iife'],
            name: 'CaomeiMotionReview',
            fileName: () => 'motion-review.js',
        },

    },
})

const entries = (await readdir(outDir, { withFileTypes: true })).filter((entry) => entry.isFile()).map((entry) => entry.name)
const jsFile = entries.find((entry) => entry.endsWith('.js'))
const cssFile = entries.find((entry) => entry.endsWith('.css'))
if (!jsFile) {
    throw new Error('构建产物缺少 JS 文件')
}

const script = await readFile(path.join(outDir, jsFile), 'utf8')
const style = cssFile ? await readFile(path.join(outDir, cssFile), 'utf8') : ''

/**
 * 移除 `@media (prefers-reduced-motion: reduce)` 块：审查单文件需要**始终**展示动效，
 * 否则系统开启减少动效时页面仍然是静态的。真实 reduce 行为由开发态页面与自动测试覆盖。
 *
 * @param {string} css 原始 CSS
 * @returns {string} 移除 reduce 块后的 CSS
 */
function stripReducedMotion(css) {
    // 构建产物经过压缩，媒体查询可能没有空格：`@media (prefers-reduced-motion:reduce)`
    const markerRe = /@media\s*\(prefers-reduced-motion:\s*reduce\)/
    let output = css
    let match = markerRe.exec(output)
    while (match) {
        const index = match.index
        const open = output.indexOf('{', index + match[0].length)
        if (open === -1) {
            break
        }
        let depth = 0
        let end = open
        for (; end < output.length; end += 1) {
            if (output[end] === '{') {
                depth += 1
            } else if (output[end] === '}') {
                depth -= 1
                if (depth === 0) {
                    break
                }
            }
        }
        output = output.slice(0, index) + output.slice(end + 1)
        match = markerRe.exec(output)
    }
    return output
}

const motionStyle = stripReducedMotion(style)
const html = `<!doctype html>
<html lang="zh-CN">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>动效审查 · caomei-ui</title>
        <style>${motionStyle.replaceAll('</style', '<\\/style')}</style>
    </head>
    <body>
        <div id="app"></div>
        <script>${script.replaceAll('</script', '<\\/script')}</script>
    </body>
</html>
`
// 单文件不变量：不得出现模块脚本、外链资源或未替换的 process 引用
for (const forbidden of ['type="module"', 'src="./', 'href="./', 'process.']) {
    if (html.includes(forbidden)) {
        throw new Error(`单文件产物包含不允许的片段：${forbidden}`)
    }
}

const target = path.join(outDir, 'motion-review.html')
await writeFile(target, html, 'utf8')

// 单文件交付：清掉中间产物，避免误双击未内联的 index
for (const entry of entries) {
    if (entry !== 'motion-review.html') {
        await rm(path.join(outDir, entry), { force: true })
    }
}

console.info(`[review:build] 已生成 ${path.relative(projectRoot, target)}（${(html.length / 1024).toFixed(0)} KB）`)
