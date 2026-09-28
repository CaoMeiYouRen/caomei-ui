import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from '@playwright/test'

/**
 * 组件画廊浏览器回归（见 docs/design/governance/2026-09-28-m4-test-regression.md）。
 *
 * 把组件画廊 V 阶段的断言清单沉淀为常驻用例（依据见
 * `docs/design/governance/2026-09-22-m2-5-component-gallery.md` §4）：
 * 1. 登记项全部真实渲染（stage 非空）且非浮层组件的根类名存在；
 * 2. 四档视口无横向溢出、网格列数符合；
 * 3. 卡片链接 locale 前缀正确且 HTTP 200；
 * 4. Dialog 卡开启后面板出现且 Portal 到卡片之外（body）。
 *
 * 事实源为登记表（`showcase-registry.json`）——期望卡片数 / 根类名 / 分组标题均由其派生，
 * 避免在用例里另立清单。断言的是 `docs:build` 产物（配置见 `playwright.gallery.config.ts`）。
 */

interface RegistryEntry {
    name: string
    group: { zh: string, en: string }
    example: string
    description: { zh: string, en: string }
}

const entries = JSON.parse(
    readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../../docs/.vitepress/showcase-registry.json'), 'utf8'),
) as RegistryEntry[]

const LOCALES = {
    zh: { page: '/components/showcase', prefix: '', triggerLabel: '打开对话框' },
    en: { page: '/en-US/components/showcase', prefix: '/en-US', triggerLabel: 'Open dialog' },
} as const

/** 四档视口的期望网格列数（V 阶段实测：960px 起侧栏展开，2 列需 ≥576px 内容宽） */
const VIEWPORTS = [
    { width: 1440, height: 1000, columns: 2 },
    { width: 1024, height: 800, columns: 2 },
    { width: 768, height: 1000, columns: 2 },
    { width: 375, height: 812, columns: 1 },
] as const

const CARD = '.caomei-showcase__card'
const STAGE = '.caomei-showcase__stage'
const GRID = '.caomei-showcase__grid'
const CARD_LINK = '.caomei-showcase__name'
const GROUP_TITLE = '.caomei-showcase__group-title'
const DIALOG_CONTENT = '.caomei-dialog__content'

/** 未开启时 stage 内渲染的是触发按钮（非自身根类），由 Dialog 交互用例覆盖 */
const NON_ROOT_IN_STAGE = new Set(['Dialog'])

function toKebabCase(name: string): string {
    return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

/** 登记表的分组顺序（去重，保持登记顺序） */
const EXPECTED_GROUPS = {
    zh: [...new Set(entries.map((entry) => entry.group.zh))],
    en: [...new Set(entries.map((entry) => entry.group.en))],
} as const

async function openGallery(page: import('@playwright/test').Page, path: string): Promise<void> {
    await page.goto(path, { waitUntil: 'domcontentloaded' })
    await expect(page.locator(CARD)).toHaveCount(entries.length)
    // 等待异步组件挂载完成：所有 stage 均有子节点
    await expect
        .poll(async () => page.locator(`${STAGE}:empty`).count(), { message: '所有卡片 stage 应渲染出内容' })
        .toBe(0)
}

for (const [locale, config] of Object.entries(LOCALES)) {
    test.describe(`组件画廊（${locale}）`, () => {
        test('登记项全部真实渲染且根类名存在', async ({ page }) => {
            await openGallery(page, config.page)

            await expect(page.locator(GROUP_TITLE)).toHaveText(EXPECTED_GROUPS[locale as 'zh' | 'en'])

            for (const entry of entries) {
                const card = page.locator(CARD).filter({ has: page.getByRole('link', { name: entry.name, exact: true }) })
                await expect(card, `${entry.name} 卡应存在`).toHaveCount(1)
                await expect(card.locator(STAGE).first(), `${entry.name} stage 应非空`).not.toBeEmpty()
                if (NON_ROOT_IN_STAGE.has(entry.name)) {
                    continue
                }
                await expect(
                    card.locator(`.caomei-${toKebabCase(entry.name)}`).first(),
                    `${entry.name} 根类名应存在于 stage 内`,
                ).toHaveCount(1)
            }
        })

        test('四档视口无横向溢出且列数符合', async ({ page }) => {
            await openGallery(page, config.page)

            for (const viewport of VIEWPORTS) {
                await page.setViewportSize({ width: viewport.width, height: viewport.height })
                const metrics = await page.evaluate(() => ({
                    scrollWidth: document.documentElement.scrollWidth,
                    clientWidth: document.documentElement.clientWidth,
                }))
                expect(
                    metrics.scrollWidth,
                    `${viewport.width}px 横向溢出：${metrics.scrollWidth} > ${metrics.clientWidth}`,
                ).toBeLessThanOrEqual(metrics.clientWidth + 1)

                const columns = await page.locator(GRID).first().evaluate(
                    (element) => getComputedStyle(element).gridTemplateColumns.split(' ').filter(Boolean).length,
                )
                expect(columns, `${viewport.width}px 网格列数（实测 ${columns}）`).toBe(viewport.columns)
            }
        })

        test('卡片链接 locale 前缀正确且 HTTP 200', async ({ page }) => {
            await openGallery(page, config.page)

            const hrefs = await page.locator(CARD_LINK).evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''))
            expect(hrefs, '卡片链接数应与登记项一致').toHaveLength(entries.length)

            for (const href of hrefs) {
                expect(href, `链接应带 locale 前缀 ${config.prefix}`).toMatch(new RegExp(`^${config.prefix}/components/[a-z0-9-]+$`))
                const response = await page.request.get(href)
                expect(response.status(), `${href} 应返回 200`).toBe(200)
            }
        })

        test('Dialog 卡开启后面板出现且 Portal 到卡片之外', async ({ page }) => {
            await openGallery(page, config.page)

            await expect(page.locator(DIALOG_CONTENT), '初始不应渲染对话框面板').toHaveCount(0)

            const card = page.locator(CARD).filter({ has: page.getByRole('link', { name: 'Dialog', exact: true }) })
            await card.getByRole('button', { name: config.triggerLabel }).click()

            const content = page.locator(DIALOG_CONTENT)
            await expect(content, '开启后应渲染一个对话框面板').toHaveCount(1)
            await expect(content).toBeVisible()

            const portal = await content.evaluate((element) => ({
                inBody: document.body.contains(element),
                insideCard: element.closest('.caomei-showcase__card') !== null,
            }))
            expect(portal.inBody, '面板应挂在 body 下').toBe(true)
            expect(portal.insideCard, '面板应 Portal 到卡片之外').toBe(false)
        })
    })
}
