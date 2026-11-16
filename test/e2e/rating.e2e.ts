import { expect, test } from '@playwright/test'

/**
 * Rating（常驻，三视口矩阵）：点击 / 键盘 / 只读 / 半星。
 *
 * 半星用真实坐标点击：第 4 颗星的左 1/4 处应落到 3.5（左半切片），整星点位落到 4。
 * 只读态只断言「不可交互」：step 全部 disabled 且点击不改变选中项。
 */
test.describe('Rating', () => {
    test('点击与键盘改值', async ({ page }) => {
        await page.goto('/')
        const rating = page.locator('#rating-interactive .caomei-rating')
        await expect(rating).toBeVisible()

        await rating.locator('.caomei-rating__step').nth(2).click()
        await expect(page.locator('#rating-value')).toHaveText('3')

        // 键盘：当前选中项获得焦点后按右方向键前进一格
        const checked = rating.locator('[role="radio"][aria-checked="true"]')
        await checked.focus()
        // 按住一小段时间再松开：primitive 在 focus 的宏任务里补 click，瞬发按键会错过该窗口
        await page.keyboard.down('ArrowRight')
        await page.waitForTimeout(80)
        await page.keyboard.up('ArrowRight')
        // 只前进一格（不因按住而产生重复步进）
        await expect(page.locator('#rating-value')).toHaveText('4')
        await expect(rating.locator('[role="radio"][aria-label="4"]')).toHaveAttribute('aria-checked', 'true')
    })

    test('只读态不可交互', async ({ page }) => {
        await page.goto('/')
        const rating = page.locator('#rating-readonly .caomei-rating')
        await expect(rating).toHaveAttribute('aria-readonly', 'true')

        const radios = rating.locator('[role="radio"]')
        const count = await radios.count()
        for (let index = 0; index < count; index++) {
            await expect(radios.nth(index)).toBeDisabled()
            await expect(radios.nth(index)).toHaveAttribute('tabindex', '-1')
        }

        // 当前选中项保持 3；强制点击与方向键都不改变选中项
        const selected = rating.locator('[role="radio"][aria-label="3"]')
        await expect(selected).toHaveAttribute('aria-checked', 'true')
        await rating.locator('.caomei-rating__step').first().click({ force: true })
        await page.keyboard.press('ArrowLeft')
        await expect(selected).toHaveAttribute('aria-checked', 'true')
    })

    test('半星：左半选 3.5，整星点位选 4', async ({ page }) => {
        await page.goto('/')
        const rating = page.locator('#rating-half .caomei-rating')
        await expect(rating).toBeVisible()

        const fourth = rating.locator('.caomei-rating__item').nth(3)
        await fourth.scrollIntoViewIfNeeded()
        const box = await fourth.boundingBox()
        expect(box).not.toBeNull()
        if (!box) {
            return
        }

        // 左半切片（x = 25% 处）
        await page.mouse.click(box.x + box.width * 0.25, box.y + box.height / 2)
        await expect(page.locator('#rating-half-value')).toHaveText('3.5')

        // 半星着色只占一格、宽度 50%
        const painted = rating.locator('.caomei-rating__step[data-painted]')
        await expect(painted).toHaveCount(4)
        const lastPainted = painted.last()
        await expect(lastPainted).toHaveAttribute('aria-label', '3.5')
        const width = await lastPainted.evaluate((element) => getComputedStyle(element).width)
        expect(Number.parseFloat(width)).toBeCloseTo(box.width / 2, 0)

        // 整星点位（同一颗星的右半）
        await page.mouse.click(box.x + box.width * 0.75, box.y + box.height / 2)
        await expect(page.locator('#rating-half-value')).toHaveText('4')
    })
})
