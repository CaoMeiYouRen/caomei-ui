import { expect, test as base, type Page } from '@playwright/test'
import { TOLERANCE } from './helpers/layout'

/**
 * Tab 激活指示条裁剪修复的常驻回归（设计规范 §6）。
 *
 * 守护对象：`overflow` 非 `visible` 时列表在**内边距盒**处裁剪，会把触发器越出内容盒的 1px 指示条
 * 削掉——表现为「1px 主色 + 下方仍是分隔线」，与设计意图「2px 主色、分隔线被盖住」不符。
 *
 * 断言分两层：
 * 1. **几何**：列表采用 `padding-bottom: 1px` + 内阴影分隔线（`border-bottom` 归零）；激活触发器
 *    的 2px 下边框越出内容盒 1px，且**不被裁剪**（越界落在内边距盒内）；
 * 2. **像素**（真实 Chromium 截图 → 浏览器 canvas 就地解码）：激活项下方连续 **2px** 为主色，
 *    其下无分隔线行（分隔线被指示条整行盖住）。
 *
 * 每个用例在 mobile / tablet / desktop 三 project 下各跑一遍（见 `playwright.config.ts`，全局
 * `reducedMotion: 'reduce'`）。
 */

const HORIZONTAL = '#tabs-horizontal'
const VERTICAL = '#tabs-vertical'
const ACTIVE = '.caomei-tabs__trigger[data-state="active"]'

const test = base.extend<{ pageErrors: string[] }>({
    pageErrors: [async ({ page }, use) => {
        const errors: string[] = []
        page.on('console', (message) => {
            if (message.type() === 'error') {
                errors.push(`console.error: ${message.text()}`)
            }
        })
        page.on('pageerror', (error) => {
            errors.push(`pageerror: ${error.message}`)
        })

        await page.goto('/')
        await use(errors)
    }, { auto: true }],
})

test.afterEach(({ pageErrors }) => {
    expect(pageErrors, '页面不得产生 console error').toEqual([])
})

interface IndicatorGeometry {
    paddingBottom: string
    borderBottomWidth: string
    boxShadow: string
    activeBorderBottomWidth: number
    activeBorderColor: string
    triggerOverflowPx: number
    triggerClippedPx: number
}

async function readGeometry(page: Page, section: string): Promise<IndicatorGeometry> {
    return page.evaluate((sel) => {
        const list = document.querySelector<HTMLElement>(`${sel} .caomei-tabs__list`)
        const trigger = document.querySelector<HTMLElement>(`${sel} .caomei-tabs__trigger[data-state="active"]`)
        if (!list || !trigger) {
            throw new Error(`缺少 TabList 或激活触发器：${sel}`)
        }
        list.scrollLeft = 0
        const listStyle = getComputedStyle(list)
        const triggerStyle = getComputedStyle(trigger)
        const listRect = list.getBoundingClientRect()
        const triggerRect = trigger.getBoundingClientRect()
        const padBottom = Number.parseFloat(listStyle.paddingBottom)
        const borderBottomWidth = Number.parseFloat(listStyle.borderBottomWidth)
        const contentBoxBottom = listRect.bottom - borderBottomWidth - padBottom
        const paddingBoxBottom = listRect.bottom - borderBottomWidth
        return {
            paddingBottom: listStyle.paddingBottom,
            borderBottomWidth: listStyle.borderBottomWidth,
            boxShadow: listStyle.boxShadow,
            activeBorderBottomWidth: Number.parseFloat(triggerStyle.borderBottomWidth),
            activeBorderColor: triggerStyle.borderBottomColor,
            triggerOverflowPx: triggerRect.bottom - contentBoxBottom,
            triggerClippedPx: triggerRect.bottom - paddingBoxBottom,
        }
    }, section)
}

/** 截图激活项**盒内**底部 3 行（指示条所在），用浏览器 canvas 就地解码，返回自上而下逐行颜色。 */
async function sampleIndicatorRows(page: Page, section: string): Promise<string[]> {
    const rect = await page.evaluate((sel) => {
        const trigger = document.querySelector<HTMLElement>(`${sel} .caomei-tabs__trigger[data-state="active"]`)
        if (!trigger) {
            throw new Error(`缺少激活触发器：${sel}`)
        }
        const r = trigger.getBoundingClientRect()
        return { x: Math.round(r.x), bottom: Math.round(r.bottom), width: Math.round(r.width) }
    }, section)
    const clip = {
        x: rect.x + 5,
        y: rect.bottom - 3,
        width: Math.max(10, Math.min(40, rect.width - 10)),
        height: 3,
    }
    const buffer = await page.screenshot({ clip })
    const dataUrl = `data:image/png;base64,${buffer.toString('base64')}`
    return page.evaluate(async (url) => {
        const image = new Image()
        image.src = url
        await image.decode()
        const canvas = document.createElement('canvas')
        canvas.width = image.width
        canvas.height = image.height
        const context = canvas.getContext('2d')
        if (!context) {
            throw new Error('无法获取 2D 上下文')
        }
        context.drawImage(image, 0, 0)
        // 截图按 deviceScaleFactor 放大：把 3 个 CSS 行映射到各自居中的设备行
        const ratio = window.devicePixelRatio || 1
        const rows: string[] = []
        for (let cssRow = 0; cssRow < 3; cssRow += 1) {
            const y = Math.min(image.height - 1, Math.max(0, Math.floor((cssRow + 0.5) * ratio)))
            const data = context.getImageData(0, y, image.width, 1).data
            rows.push(`rgb(${data[0]}, ${data[1]}, ${data[2]})`)
        }
        return rows
    }, dataUrl)
}

test.describe('Tab 激活指示条：2px 主色、分隔线被盖住', () => {
    test('横向：分隔线以内边距盒内阴影表达，指示条越界不被裁剪', async ({ page }) => {
        const list = page.locator(`${HORIZONTAL} .caomei-tabs__list`)
        await list.scrollIntoViewIfNeeded()
        await expect(page.locator(`${HORIZONTAL} ${ACTIVE}`)).toBeVisible()

        const geometry = await readGeometry(page, HORIZONTAL)
        expect(geometry.borderBottomWidth, '列表底边框须由 border-bottom 改为内阴影（避免与指示条错行）').toBe('0px')
        expect(geometry.paddingBottom, '分隔线所在的内边距盒底边须留 1px').toBe('1px')
        expect(geometry.boxShadow, '列表须有内阴影分隔线').toContain('inset')
        expect(geometry.activeBorderBottomWidth, '激活指示条为 2px').toBeCloseTo(2, 1)

        // 指示条越出内容盒 1px（用于盖住分隔线），且必须落在内边距盒内（不被裁剪）
        expect(geometry.triggerOverflowPx, '指示条须越出内容盒 1px').toBeGreaterThanOrEqual(1 - TOLERANCE)
        expect(
            geometry.triggerClippedPx,
            '指示条不得被裁剪（越界须落在内边距盒内）',
        ).toBeLessThanOrEqual(TOLERANCE)
    })

    test('横向：像素级——激活项下方连续 2px 主色，无分隔线行', async ({ page }) => {
        await page.locator(`${HORIZONTAL} .caomei-tabs__list`).scrollIntoViewIfNeeded()
        await page.locator(`${HORIZONTAL} ${ACTIVE}`).scrollIntoViewIfNeeded()
        await expect(page.locator(`${HORIZONTAL} ${ACTIVE}`)).toBeVisible()

        const geometry = await readGeometry(page, HORIZONTAL)
        const rows = await sampleIndicatorRows(page, HORIZONTAL)
        // 行序自上而下：指示条上方 → 指示条 2px（主色）
        expect(rows[1], `指示条首行应为主色（实测 ${rows[1]}）`).toBe(geometry.activeBorderColor)
        expect(rows[2], `指示条次行应为主色（实测 ${rows[2]}）`).toBe(geometry.activeBorderColor)
        expect(rows[0], `指示条上方不应为主色（指示条恰为 2px，实测 ${rows[0]}）`).not.toBe(geometry.activeBorderColor)
    })

    test('纵向：分隔线实现被重置，指示条越界保持可见', async ({ page }) => {
        const list = page.locator(`${VERTICAL} .caomei-tabs__list`)
        await list.scrollIntoViewIfNeeded()
        await expect(page.locator(`${VERTICAL} ${ACTIVE}`)).toBeVisible()

        const state = await list.evaluate((element) => {
            const style = getComputedStyle(element)
            return { overflow: style.overflow, paddingBottom: style.paddingBottom, boxShadow: style.boxShadow }
        })
        expect(state.overflow, '纵向列表须保持两轴 visible').toBe('visible')
        expect(state.paddingBottom, '纵向须重置横向的内边距分隔线').toBe('0px')
        expect(state.boxShadow, '纵向须重置横向的内阴影分隔线').toBe('none')
    })
})
