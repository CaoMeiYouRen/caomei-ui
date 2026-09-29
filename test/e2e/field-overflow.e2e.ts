import { expect, test as base, type Locator } from '@playwright/test'

/**
 * 字段族「内容越出自身边框」溢出扫描（常驻回归）。
 *
 * 背景：共享字段外壳 `.caomei-field` 的 `height` 是**单行控件**契约；内容高度可超过单行的
 * 字段组件必须在自身根规则覆盖，否则内部内容会画到边框之外（Textarea 曾因此让折行内容与
 * 滚动条越出圆角）。本套用例把该口径扩到整个字段族：以「压力内容」驱动各组件，
 * 断言组件边框内不存在越界的 in-flow 后代。
 *
 * 判定口径：
 * - 只审查**在流内容**（`position: absolute / fixed` 的浮层、装饰、清除按钮等允许越界）；
 * - 祖先声明了 `overflow` 非 `visible`（省略号截断、滚动容器）时，其子树视为被裁切、不再下探；
 * - 容差 1px（吸收子像素取整与负外边距拼接，如 InputGroup 的 `-1px` 边框重叠）。
 *
 * **判定边界**：只判「内容越出组件边框」，不判「内容被组件自身 `overflow` 裁掉而丢失」——
 * 后者属内容完整性，不在本装置判定面。
 *
 * 多行档位额外断言字段高度大于单行档位高度，证明高度确实随内容增长而非沿用固定值。
 * 每个用例在 mobile / tablet / desktop 三个 project 下各跑一遍（见 `playwright.config.ts`）。
 */

/** 几何容差：吸收子像素取整与 1px 拼接 */
const TOLERANCE = 1
/** 单行档位高度（`--caomei-control-height-md`）；多行档位必须超过它 */
const SINGLE_LINE_HEIGHT = 36

interface FieldCase {
    name: string
    selector: string
    /** 内容高度是否可超过单行（true 时必须随内容增长） */
    multiline: boolean
}

/**
 * 受检字段族清单（本表即受检范围的事实源）。
 *
 * `test/e2e/fixtures/app.vue` 的 `#field-overflow` / `#textarea-layout` 段提供夹具；
 * 新增「内容可超过单行」的字段组件时必须加入本表，否则字段壳层契约失去覆盖。
 */
const FIELD_CASES: FieldCase[] = [
    { name: 'textarea 折行溢出', selector: '#textarea-overflow .caomei-textarea', multiline: true },
    { name: 'multi-select 多标签换行', selector: '#field-multiselect .caomei-multi-select', multiline: true },
    { name: 'auto-complete 多选换行', selector: '#field-autocomplete .caomei-auto-complete', multiline: true },
    { name: 'tags-input 多标签换行', selector: '#field-tags-input .caomei-tags-input', multiline: true },
    { name: 'input-group 横向混合', selector: '#field-input-group .caomei-input-group', multiline: true },
    { name: 'select 超长选中项截断', selector: '#field-select-long .caomei-select__field', multiline: false },
    { name: 'input 超长文本', selector: '#field-input-long .caomei-input', multiline: false },
]

/** 受检面下界：防止清单被静默收窄后「0 越界」变成空真 */
const MIN_FIELD_CASES = 7

/** 每个用例独立收集 console error / page error，并统一导航（与 `responsive.e2e.ts` 同构）。 */
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

/**
 * 收集根元素边框盒之外的「在流」后代。
 *
 * 与组件无关的通用判定：绝对 / 固定定位后代允许越界；祖先已有非 `visible` 的 `overflow`
 * 时其子树被裁切，不再下探（省略号截断正是靠这一条与真实越界区分开）。
 */
async function inFlowOverflowOf(root: Locator) {
    return root.evaluate((element) => {
        const tolerance = 1
        const clipAxes = (node: Element): boolean => {
            const style = getComputedStyle(node)
            return style.overflowX !== 'visible' || style.overflowY !== 'visible'
        }
        const rootRect = element.getBoundingClientRect()
        const violations: { selector: string, deltaBottom: number, deltaTop: number, deltaRight: number, deltaLeft: number }[] = []

        const walk = (current: Element): void => {
            for (const child of Array.from(current.children)) {
                const style = getComputedStyle(child)
                if (style.position === 'absolute' || style.position === 'fixed') {
                    continue
                }
                const rect = child.getBoundingClientRect()
                if (rect.width === 0 && rect.height === 0) {
                    continue
                }
                const deltaBottom = rect.bottom - rootRect.bottom
                const deltaTop = rootRect.top - rect.top
                const deltaRight = rect.right - rootRect.right
                const deltaLeft = rootRect.left - rect.left
                if (deltaBottom > tolerance || deltaTop > tolerance || deltaRight > tolerance || deltaLeft > tolerance) {
                    violations.push({
                        selector: `${child.tagName.toLowerCase()}.${String(child.className).split(' ').filter(Boolean).slice(0, 2).join('.')}`,
                        deltaBottom: Number(deltaBottom.toFixed(1)),
                        deltaTop: Number(deltaTop.toFixed(1)),
                        deltaRight: Number(deltaRight.toFixed(1)),
                        deltaLeft: Number(deltaLeft.toFixed(1)),
                    })
                }
                if (!clipAxes(child)) {
                    walk(child)
                }
            }
        }

        walk(element)
        return violations
    })
}

test('受检字段族清单未被静默收窄', () => {
    expect(FIELD_CASES.length, '字段族受检清单数量不足').toBeGreaterThanOrEqual(MIN_FIELD_CASES)
    expect(new Set(FIELD_CASES.map((item) => item.name)).size, '用例名不得重复').toBe(FIELD_CASES.length)
})

for (const item of FIELD_CASES) {
    test(`${item.name}：边框内无越界的在流内容`, async ({ page }) => {
        const root = page.locator(item.selector).first()
        await expect(root).toBeVisible()

        expect(await inFlowOverflowOf(root), `${item.name} 出现越界内容`).toEqual([])

        const height = await root.evaluate((element) => Number(element.getBoundingClientRect().height.toFixed(1)))
        if (item.multiline) {
            // 高度若固定为单行档位，压力内容就会越界；此断言证明字段确实随内容增长
            expect(height, `${item.name} 未随内容增长`).toBeGreaterThan(SINGLE_LINE_HEIGHT + TOLERANCE)
        } else {
            expect(Math.abs(height - SINGLE_LINE_HEIGHT), `${item.name} 单行档位高度异常`).toBeLessThanOrEqual(TOLERANCE)
        }
    })
}
