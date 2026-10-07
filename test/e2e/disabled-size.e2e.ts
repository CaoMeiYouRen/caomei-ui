import { expect, test as base, type Locator } from '@playwright/test'
import { boxOf, TOLERANCE } from './helpers/layout'

/**
 * 禁用态尺寸不变 / Button 角标外扩的常驻几何回归（设计规范 §6「所有组件」行）。
 *
 * 契约：
 * 1. **禁用态不改变布局尺寸**——同档位、同内容、同宿主的默认态与禁用态，其外盒几何
 *    必须逐值相等（`disabled` 只影响配色 / 光标）；
 * 2. **Button 角标以右上角外扩叠加、不参与布局**——带角标与不带角标的按钮外盒几何相等，
 *    且角标盒越出按钮外盒（确为例外的叠加元素），`pointer-events: none`。
 *
 * 受检面：首批 7 个代表组件（Button / 字段族 / Checkbox / Switch）；本规格扩面到其余具
 * 明确禁用标记的组件（SelectButton / RadioButton / ToggleButton / Slider / Tag / MultiSelect /
 * AutoComplete / TagsInput / DatePicker / Password / FileUpload）。
 *
 * 判别力保障：每对用例先断言禁用态**确有**禁用标记（`[disabled]` / `[aria-disabled]` /
 * `[data-disabled]` / `--disabled` 类），默认态**不得**出现禁用标记，避免夹具漂移让「禁用态
 * == 默认态」因两侧相同而假通过；另有受检面下界守卫防止成对数被静默收窄。
 *
 * 本套 E2E 全局以 `reducedMotion: 'reduce'` 运行（见 `playwright.config.ts`），几何测量确定性。
 * 每个用例在 mobile / tablet / desktop 三 project 下各跑一遍。
 */

interface DisabledPair {
    name: string
    selector: string
}

const DISABLED_PAIRS: DisabledPair[] = [
    { name: 'button', selector: '.caomei-button' },
    { name: 'input', selector: '.caomei-input' },
    { name: 'select', selector: '.caomei-select' },
    { name: 'textarea', selector: '.caomei-textarea' },
    { name: 'input-number', selector: '.caomei-input-number' },
    { name: 'checkbox', selector: '.caomei-checkbox' },
    { name: 'switch', selector: '.caomei-switch' },
    // 扩面：其余具明确禁用标记的组件（静态成对、同内容同宿主）
    { name: 'select-button', selector: '.caomei-select-button' },
    { name: 'radio-button', selector: '.caomei-radio-button[value="a"]' },
    { name: 'toggle-button', selector: '.caomei-toggle-button' },
    { name: 'slider', selector: '.caomei-slider' },
    { name: 'tag', selector: '.caomei-tag' },
    { name: 'multi-select', selector: '.caomei-multi-select' },
    { name: 'auto-complete', selector: '.caomei-auto-complete' },
    { name: 'tags-input', selector: '.caomei-tags-input' },
    { name: 'date-picker', selector: '.caomei-date-picker' },
    { name: 'password', selector: '.caomei-password' },
    { name: 'file-upload', selector: '.caomei-file-upload' },
]

/** 受检面下界：默认 / 禁用成对数不得被静默收窄。 */
const MIN_DISABLED_PAIRS = 18

/** 禁用标记：任一存在即视为禁用态成立（不同组件形态不一）。 */
const DISABLED_MARKER = '[disabled], [aria-disabled="true"], [data-disabled], [class*="--disabled"]'

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

/** 断言两盒宽度 / 高度逐值相等（含容差），并排除 0×0 假通过。 */
function expectSameBoxSize(actual: Awaited<ReturnType<typeof boxOf>>, expected: Awaited<ReturnType<typeof boxOf>>, label: string): void {
    expect(actual.width, `${label} 宽度不应为 0（称量目标错位？）`).toBeGreaterThan(0)
    expect(actual.height, `${label} 高度不应为 0（称量目标错位？）`).toBeGreaterThan(0)
    expect(Math.abs(actual.width - expected.width), `${label} 宽度变化：${expected.width} → ${actual.width}`).toBeLessThanOrEqual(TOLERANCE)
    expect(Math.abs(actual.height - expected.height), `${label} 高度变化：${expected.height} → ${actual.height}`).toBeLessThanOrEqual(TOLERANCE)
}

/** 禁用标记前置守卫：禁用态组件内必须存在禁用标记。 */
async function expectDisabledMarker(wrapper: Locator, label: string): Promise<void> {
    const found = await wrapper.evaluate((element, marker) => element.querySelector(marker) !== null, DISABLED_MARKER)
    expect(found, `${label} 未检出禁用标记，夹具可能未真正置为禁用态`).toBe(true)
}

/** 默认侧反向守卫：默认态组件内**不得**出现禁用标记，避免两侧同态假通过。 */
async function expectNoDisabledMarker(wrapper: Locator, label: string): Promise<void> {
    const found = await wrapper.evaluate((element, marker) => element.querySelector(marker) !== null, DISABLED_MARKER)
    expect(found, `${label} 默认态出现禁用标记，夹具两侧同态`).toBe(false)
}

test.describe('禁用态不改变布局尺寸', () => {
    test('受检面下界守卫：默认 / 禁用成对数不得被静默收窄', () => {
        expect(DISABLED_PAIRS.length, '禁用态几何成对数低于下界（受检面被收窄？）').toBeGreaterThanOrEqual(MIN_DISABLED_PAIRS)
    })

    for (const pair of DISABLED_PAIRS) {
        test(`${pair.name}：默认态与禁用态外盒几何相等`, async ({ page }) => {
            const defaultWrapper = page.locator(`#ds-${pair.name}-default`)
            await expectNoDisabledMarker(defaultWrapper, pair.name)
            const defaultBox = await boxOf(defaultWrapper.locator(pair.selector))
            const disabledWrapper = page.locator(`#ds-${pair.name}-disabled`)
            await expectDisabledMarker(disabledWrapper, pair.name)
            const disabledBox = await boxOf(disabledWrapper.locator(pair.selector))
            expectSameBoxSize(disabledBox, defaultBox, pair.name)
        })
    }
})

test.describe('Button 角标外扩不参与布局', () => {
    test('带角标与不带角标的按钮外盒几何相等', async ({ page }) => {
        await expect(page.locator('#badge-plain .caomei-button__badge'), '默认侧不应有角标').toHaveCount(0)
        const plain = await boxOf(page.locator('#badge-plain .caomei-button'))
        const badged = await boxOf(page.locator('#badge-badged .caomei-button'))
        expectSameBoxSize(badged, plain, 'Button 角标')
    })

    test('角标越出按钮外盒且不拦截指针', async ({ page }) => {
        const button = await boxOf(page.locator('#badge-badged .caomei-button'))
        const badge = page.locator('#badge-badged .caomei-button__badge')
        await expect(badge).toBeVisible()
        const badgeBox = await boxOf(badge)

        const extendsOutside = badgeBox.x < button.x
            || badgeBox.y < button.y
            || badgeBox.x + badgeBox.width > button.x + button.width
            || badgeBox.y + badgeBox.height > button.y + button.height
        expect(extendsOutside, '角标应外扩越出按钮外盒（右上角叠加）').toBe(true)

        const pointerEvents = await badge.evaluate((element) => getComputedStyle(element).pointerEvents)
        expect(pointerEvents, '角标不得拦截指针事件').toBe('none')
    })
})
