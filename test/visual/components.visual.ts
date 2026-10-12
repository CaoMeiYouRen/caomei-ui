import { expect, test } from '@playwright/test'

/**
 * 视觉回归基线首批（代表组件抽样 × 亮 / 暗 × 单视口）。
 *
 * 依据 docs/design/governance/2026-10-08-m7-1-visual-regression-baseline-evaluation.md §7（MVP 形态）。
 * 事实源 = 本文件的**受检面登记表**（`SAMPLE_SECTIONS`）——新增 / 移除组件须同批更新基线与登记表；
 * 下界守卫（`MIN_SECTIONS`）保证登记表被静默收窄时失败。
 *
 * 抽样原则：取**静态、确定性**的默认态（不含日期 / 时间 / 随机内容），避免时间漂移造成假阳性；
 * 日期类组件（Calendar / DatePicker）不在首批（见记录 §「未纳入面」）。
 *
 * 负向对照：`VISUAL_NEGATIVE_CONTROL=1 pnpm test:visual` 注入结构性覆盖，应使全部用例报差异，
 * 用于自证比对具判别力（不留常驻）。
 */

/** 受检面登记（首批 8 个核心静态组件默认态 + 字体路径扩面 3 段）。 */
const SAMPLE_SECTIONS = [
    { id: 'ds-button-default', name: 'button' },
    { id: 'ds-tag-default', name: 'tag' },
    { id: 'ds-checkbox-default', name: 'checkbox' },
    { id: 'ds-switch-default', name: 'switch' },
    { id: 'ds-radio-button-default', name: 'radio-button' },
    { id: 'ds-input-default', name: 'input' },
    { id: 'ds-select-default', name: 'select' },
    { id: 'ds-slider-default', name: 'slider' },
    { id: 'ds-font-latin', name: 'font-latin-button' },
    { id: 'ds-font-latin-input', name: 'font-latin-input' },
    { id: 'ds-font-mixed', name: 'font-mixed-button' },
] as const

/**
 * 字体路径受检面（拉丁字形 / 跨字体回退）：首批受检面文本全为 CJK，该路径此前零覆盖。
 * 单独登记并在下方断言其仍在 `SAMPLE_SECTIONS` 内，防止「只保下界、悄悄删掉字体面」。
 */
const FONT_PATH_SECTIONS = ['ds-font-latin', 'ds-font-latin-input', 'ds-font-mixed'] as const

/** 受检面下界守卫：登记表被静默收窄即失败。 */
const MIN_SECTIONS = 11

const THEMES = ['light', 'dark'] as const

/** 负向对照开关（仅用于判别力自证，非常驻）。 */
const NEGATIVE_CONTROL = process.env.VISUAL_NEGATIVE_CONTROL === '1'

/**
 * 常驻负向对照的注入样式（三类目标各一条规则，缺一则对应面**不会**报差异）：
 * - `.fixture__state`：组件面与视口 / 预设轴面（`#app` 内）；
 * - `#calendar-inline`：日期轴面（该段为 `fixture__case`，不含 `.fixture__state`）；
 * - `.caomei-dialog__content`：浮层轴面（portal 挂 `document.body`，在 `#app` 之外）。
 */
const NEGATIVE_CONTROL_CSS = [
    '#app .fixture__state { padding: 24px !important; }',
    '#calendar-inline { padding: 24px !important; }',
    '.caomei-dialog__content { padding: 0 !important; }',
].join('\n')

/**
 * 形态轴扩面（见 `docs/design/governance/2026-10-13-phase23-m1-2-visual-form-axis-expansion.md`）：
 * 视口 / 预设 / 日期 / 浮层四条**形态轴**，各自独立重冻结基线。
 *
 * 门槛（与治理记录同口径）：① 渲染结果可确定化（无实时日期 / 无随机 / 无网络）；② 覆盖既有
 * 面未覆盖的渲染路径；③ 每批 ≤ 8 张新基线。未纳入的形态（其余视口 / `caomei` 预设 / 日期
 * 面板与其余浮层组件）在记录中显式登记触发条件，不静默省略。
 *
 * - `viewport`：`#ds-viewport-row`（宽 100% + 折行行）在 768×800 下渲染（窄视口比例布局与折行路径；
 *   用例内断言该视口下**确实折行**，否则该面无判别力）；
 * - `preset`：`ds-button-default` 在 `data-preset="momei"` 下渲染（非缺省预设的 token 路径）；
 * - `clock`：`#calendar-inline` 在**固定时钟**（2026-01-15）下渲染（日历网格 + 「今日」高亮）；
 * - `dialog`：`#dialog-open` 点击后的 `.caomei-dialog__content`（portal 浮层合成路径）。
 */
const FORM_AXIS_CASES = [
    { key: 'viewport-768-wrap-row', label: '折行行@768 视口', target: '#ds-viewport-row', setup: 'viewport' },
    { key: 'preset-momei-button', label: 'button@momei 预设', target: '#ds-button-default', setup: 'preset' },
    { key: 'date-calendar-fixed', label: 'calendar@固定时钟', target: '#calendar-inline', setup: 'clock' },
    { key: 'overlay-dialog-open', label: 'dialog@打开态', target: '.caomei-dialog__content', setup: 'dialog' },
] as const

/** 形态轴面下界守卫：轴面被静默移除即失败。 */
const MIN_FORM_AXIS = 4

/** 固定时钟（日期轴确定化）：月 / 日 / 「今日」高亮均由该时刻派生。 */
const FIXED_CLOCK = new Date('2026-01-15T09:30:00+08:00')

/** 窄视口（视口轴）：与主视口 1280×800 区分，覆盖换行 / 折行布局路径。 */
const NARROW_VIEWPORT = { width: 768, height: 800 }

/** 非缺省预设（预设轴）：缺省为 `minimal`（不设 `data-preset`）。 */
const NON_DEFAULT_PRESET = 'momei'

async function prepareFormAxis(page: import('@playwright/test').Page, setup: string, theme: string): Promise<void> {
    if (setup === 'clock') {
        await page.clock.setFixedTime(FIXED_CLOCK)
    }
    await page.goto('/')
    if (setup === 'viewport') {
        await page.setViewportSize(NARROW_VIEWPORT)
        // 前置守卫：768 下必须确实折行（≥2 行），否则该面对视口宽度无判别力
        const lines = await page.locator('#ds-viewport-row > *').evaluateAll((els) =>
            new Set(els.map((el) => Math.round(el.getBoundingClientRect().top))).size)
        expect(lines).toBeGreaterThanOrEqual(2)
    }
    if (setup === 'preset') {
        await page.evaluate((preset) => {
            document.documentElement.setAttribute('data-preset', preset)
        }, NON_DEFAULT_PRESET)
    }
    if (setup === 'dialog') {
        await page.click('#dialog-open')
        await page.waitForSelector('.caomei-dialog__content')
    }
    if (theme === 'dark') {
        await page.evaluate(() => {
            document.documentElement.setAttribute('data-theme', 'dark')
        })
    }
    if (NEGATIVE_CONTROL) {
        await page.addStyleTag({ content: NEGATIVE_CONTROL_CSS })
    }
}

test.describe('视觉回归基线（代表组件 × 亮暗）', () => {
    test('受检面登记未收窄', () => {
        expect(SAMPLE_SECTIONS.length).toBeGreaterThanOrEqual(MIN_SECTIONS)
    })

    test('字体路径受检面仍在登记表内', () => {
        const registered = new Set(SAMPLE_SECTIONS.map((section) => section.id))
        for (const id of FONT_PATH_SECTIONS) {
            expect(registered.has(id)).toBe(true)
        }
    })

    test('形态轴受检面未收窄', () => {
        expect(FORM_AXIS_CASES.length).toBeGreaterThanOrEqual(MIN_FORM_AXIS)
    })

    for (const theme of THEMES) {
        for (const { id, name } of SAMPLE_SECTIONS) {
            test(`${name}（${theme}）`, async ({ page }) => {
                await page.goto('/')
                await page.waitForSelector(`#${id}`)
                if (theme === 'dark') {
                    await page.evaluate(() => {
                        document.documentElement.setAttribute('data-theme', 'dark')
                    })
                }
                if (NEGATIVE_CONTROL) {
                    await page.addStyleTag({ content: NEGATIVE_CONTROL_CSS })
                }
                await expect(page.locator(`#${id}`)).toHaveScreenshot(`${name}-${theme}.png`)
            })
        }
    }
})

test.describe('形态轴扩面（视口 / 预设 / 日期 / 浮层）', () => {
    for (const theme of THEMES) {
        for (const { key, label, target, setup } of FORM_AXIS_CASES) {
            test(`${label}（${theme}）`, async ({ page }) => {
                await prepareFormAxis(page, setup, theme)
                await expect(page.locator(target)).toHaveScreenshot(`${key}-${theme}.png`)
            })
        }
    }
})
