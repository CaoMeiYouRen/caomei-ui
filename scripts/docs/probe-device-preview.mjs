#!/usr/bin/env node
/**
 * probe-device-preview：文档站设备预览（P1 整页 iframe）的一次性探针。
 *
 * 验证面：同源 iframe、加载的仍是当前文档页、`?device-preview=1` 内不递归渲染入口、
 * iframe 内 `@media` 按 iframe 自身宽度求值、暗色校正生效、无 CSP meta 阻断、主站 URL 不变。
 *
 * 用法（需先 `pnpm docs:build` 并启动 `pnpm docs:preview --port 4173`）：
 *   BASE_URL=http://127.0.0.1:4173 node scripts/docs/probe-device-preview.mjs
 */
import { chromium } from '@playwright/test'

const BASE_URL = process.env.BASE_URL ?? 'http://127.0.0.1:4173'
const PAGE = '/components/button'

function assert(condition, message) {
    if (!condition) {
        throw new Error(`[probe-device-preview] ${message}`)
    }
}

const browser = await chromium.launch({
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--no-zygote'],
})
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })

try {
    await page.goto(`${BASE_URL}${PAGE}`, { waitUntil: 'networkidle' })

    const cspMeta = await page.locator('meta[http-equiv="Content-Security-Policy"]').count()
    assert(cspMeta === 0, `站点不得用 CSP meta 阻断同源 iframe（实际 ${cspMeta} 条）`)

    const mainUrl = page.url()
    await page.locator('.device-preview button').first().click()
    await page.locator('.device-preview__frame').waitFor({ state: 'visible' })

    const frameElement = page.locator('.device-preview__frame')
    const src = await frameElement.getAttribute('src')
    assert(src?.includes('device-preview=1'), `iframe src 缺少预览标记：${src}`)
    assert(src?.startsWith('/'), `iframe 应使用同源相对路径：${src}`)

    const frame = page.frameLocator('.device-preview__frame')
    await frame.locator('.VPContent').waitFor()

    assert(await frame.locator('.device-preview').count() === 0, 'iframe 内不得递归渲染设备预览入口')
    assert(await frame.locator('.VPContent').count() > 0, 'iframe 应加载文档页内容')

    const media390 = await frame.locator('body').evaluate(() => matchMedia('(max-width: 640px)').matches)
    assert(media390, '390 档 iframe 内媒体查询应命中移动断点')

    await page.getByRole('button', { name: '桌面 1280' }).click()
    const media1280 = await frame.locator('body').evaluate(() => matchMedia('(max-width: 640px)').matches)
    assert(!media1280, '1280 档 iframe 内媒体查询不应命中移动断点')

    await page.locator('.device-preview__option', { hasText: '暗色' }).click()
    const isDark = await frame.locator('html').evaluate((element) => element.classList.contains('dark') || element.getAttribute('data-theme') === 'dark')
    assert(isDark, '暗色预览应把 dark / data-theme 写入 iframe 根元素')

    assert(page.url() === mainUrl, `主站 URL 不得因预览改变：${page.url()}`)
    console.info('[probe-device-preview] 通过：同源 / 不递归 / 媒体查询 / 暗色 / 主站不跳转')
} finally {
    await browser.close()
}
