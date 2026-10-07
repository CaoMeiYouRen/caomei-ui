import { expect, test as base, type Page } from '@playwright/test'

/**
 * 浮层交互常驻回归：Dialog / ConfirmDialog 的**焦点落位**与**滚动锁复位**（设计规范 §6 / 可访问性）。
 *
 * 判定口径（确定性优先，避免链式滚动 / 滚动锁存等不稳定断言）：
 * 1. **焦点落位**：打开后 `document.activeElement` 必须落在面板内容内；关闭后焦点回到触发元素。
 *    断言用 `expect.poll` 等待跨微任务 / 宏任务的焦点迁移，不依赖固定 tick。
 * 2. **滚动锁**：打开后 `document.body.style.overflow === 'hidden'`（Reka `useBodyScrollLock` 的
 *    可观测值）；关闭后复位为**打开前**的取值。**不断言滚动位置 / padding 补偿**——只断言样式开关，
 *    与滚动条宽度、视口无关。
 *
 * 判别力前置守卫：打开前先断言 `body.style.overflow !== 'hidden'`，避免夹具 / 环境默认即锁定导致假通过。
 *
 * 与既有 E2E 去重：`overlay-stacking.e2e.ts` 负责模态内浮层层级（z-index / 命中测试）、
 * `drawer-convergence.e2e.ts` 负责 Drawer 档位收敛，本规格只覆盖焦点与滚动锁，不重复。
 *
 * 每个用例在 mobile / tablet / desktop 三 project 下各跑一遍（见 `playwright.config.ts`）。
 */

const DIALOG_CONTENT = '.caomei-dialog__content'
const CONFIRM_CONTENT = '.caomei-confirm-dialog__content'
const DIALOG_TRIGGER = '#dialog-open'
const CONFIRM_TRIGGER = '#confirm-open'

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

/** 当前焦点是否落在给定选择器命中的元素内部。 */
async function focusInside(page: Page, selector: string): Promise<boolean> {
    return page.evaluate((target) => {
        const root = document.querySelector(target)
        const active = document.activeElement
        if (!root || !active) {
            return false
        }
        return root.contains(active)
    }, selector)
}

async function bodyOverflow(page: Page): Promise<string> {
    return page.evaluate(() => document.body.style.overflow)
}

/** 通用流程：打开 → 焦点落位 + 滚动锁；关闭 → 焦点归还 + 滚动锁复位。 */
async function assertOverlayInteraction(
    page: Page,
    options: { trigger: string, content: string, label: string, close: () => Promise<void> },
): Promise<void> {
    const { trigger, content, label, close } = options
    const initialOverflow = await bodyOverflow(page)

    // 前置守卫：打开前不得处于滚动锁状态（否则断言失去判别力）
    expect(initialOverflow, `${label} 打开前不应处于滚动锁状态`).not.toBe('hidden')

    await page.locator(trigger).click()
    await expect(page.locator(content), `${label} 打开后应可见`).toBeVisible()

    await expect.poll(() => focusInside(page, content), { message: `${label} 打开后焦点应落在面板内` }).toBe(true)
    await expect.poll(() => bodyOverflow(page), { message: `${label} 打开后应锁定 body 滚动` }).toBe('hidden')

    await close()
    await expect(page.locator(content), `${label} 关闭后应移除`).toHaveCount(0)

    await expect.poll(
        () => page.evaluate((target) => document.activeElement === document.querySelector(target), trigger),
        { message: `${label} 关闭后焦点应归还触发元素` },
    ).toBe(true)
    await expect.poll(() => bodyOverflow(page), { message: `${label} 关闭后应复位 body 滚动锁` }).toBe(initialOverflow)
}

test.describe('浮层交互：焦点落位与滚动锁复位', () => {
    test('Dialog：打开焦点入面板 / 锁滚动，关闭焦点归还 / 复位', async ({ page }) => {
        await assertOverlayInteraction(page, {
            trigger: DIALOG_TRIGGER,
            content: DIALOG_CONTENT,
            label: 'Dialog',
            close: async () => page.keyboard.press('Escape'),
        })
    })

    test('ConfirmDialog：打开焦点入面板 / 锁滚动，关闭焦点归还 / 复位', async ({ page }) => {
        await assertOverlayInteraction(page, {
            trigger: CONFIRM_TRIGGER,
            content: CONFIRM_CONTENT,
            label: 'ConfirmDialog',
            // ConfirmDialog 经「取消」按钮关闭（AlertDialog 点遮罩不关闭；Esc 亦以「取消」语义关闭，
            // 本规格固定用按钮路径，避免依赖 Esc 语义）
            close: async () => {
                await page.locator(`${CONFIRM_CONTENT} .caomei-button--secondary`).first().click()
            },
        })
    })
})
