import { expect, test, type Page } from '@playwright/test'
import { findMissingGlyphs, openTestFonts } from './font-coverage'

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
    { id: 'form', name: 'form' },
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
const MIN_SECTIONS = 12

/**
 * 会渲染 `value` 文本的 input 类型。`hidden` / `checkbox` / `radio` / `range` / `color` /
 * `file` 的 value 不进入屏幕文本；`password` 单独按掩码字符处理。
 */
const TEXT_INPUT_TYPES = new Set([
    'date',
    'datetime-local',
    'email',
    'month',
    'number',
    'search',
    'tel',
    'text',
    'time',
    'url',
    'week',
])

const THEMES = ['light', 'dark'] as const

/** 负向对照开关（仅用于判别力自证，非常驻）。 */
const NEGATIVE_CONTROL = process.env.VISUAL_NEGATIVE_CONTROL === '1'

/**
 * 常驻负向对照的注入样式（六类目标各一条规则，缺一则对应面**不会**报差异）：
 * - `.fixture__state`：组件面与视口 / 预设轴面（`#app` 内）；
 * - `#calendar-inline`：日期轴面（该段为 `fixture__case`，不含 `.fixture__state`）；
 * - `.caomei-dialog__content`：浮层轴面（portal 挂 `document.body`，在 `#app` 之外）；
 * - `#hit-target`：P0 命中区轴面（多值字段折行）；
 * - `#form`：表单组合层面；
 * - `.caomei-date-picker__content`：区间面板轴面（portal 挂 `document.body`）。
 */
const NEGATIVE_CONTROL_CSS = [
    '#app .fixture__state { padding: 24px !important; }',
    '#calendar-inline { padding: 24px !important; }',
    '.caomei-dialog__content { padding: 0 !important; }',
    '#hit-target { padding: 24px !important; }',
    '#form { padding: 24px !important; }',
    '.caomei-date-picker__content { padding: 0 !important; }',
].join('\n')

/**
 * 形态轴扩面（见 `docs/design/governance/2026-10-13-phase23-m1-2-visual-form-axis-expansion.md`）：
 * 视口 / 预设 / 日期 / 浮层 / P0 命中区 / 区间面板六条**形态轴**，各自独立重冻结基线。
 *
 * 门槛（与治理记录同口径）：① 渲染结果可确定化（无实时日期 / 无随机 / 无网络）；② 覆盖既有
 * 面未覆盖的渲染路径；③ 每批 ≤ 8 张新基线。未纳入的形态（其余视口 / `caomei` 预设 / 日期
 * 面板与其余浮层组件）在记录中显式登记触发条件，不静默省略。
 *
 * - `viewport`：`#ds-viewport-row`（宽 100% + 折行行）在 768×800 下渲染（窄视口比例布局与折行路径；
 *   用例内断言该视口下**确实折行**，否则该面无判别力）；
 * - `preset`：`ds-button-default` 在 `data-preset="momei"` 下渲染（非缺省预设的 token 路径）；
 * - `clock`：`#calendar-inline` 在**固定时钟**（2026-01-15）下渲染（日历网格 + 「今日」高亮）；
 * - `dialog`：`#dialog-open` 点击后的 `.caomei-dialog__content`（portal 浮层合成路径）；
 * - `hit-target`：`#hit-target` 在 390×844 下渲染（三个多值字段折行后的值片与 P0 命中区；
 *   用例内断言三个字段均**确实折行**，否则多行行距面失去判别力）。
 */
const FORM_AXIS_CASES = [
    { key: 'viewport-768-wrap-row', label: '折行行@768 视口', target: '#ds-viewport-row', setup: 'viewport' },
    { key: 'preset-momei-button', label: 'button@momei 预设', target: '#ds-button-default', setup: 'preset' },
    { key: 'date-calendar-fixed', label: 'calendar@固定时钟', target: '#calendar-inline', setup: 'clock' },
    { key: 'overlay-dialog-open', label: 'dialog@打开态', target: '.caomei-dialog__content', setup: 'dialog' },
    { key: 'hit-target-390', label: 'P0 命中区@390 视口', target: '#hit-target', setup: 'hit-target' },
    { key: 'date-range-picker', label: 'date-picker 区间面板', target: '.caomei-date-picker__content', setup: 'range-picker' },
] as const

/** 形态轴面下界守卫：轴面被静默移除即失败。 */
const MIN_FORM_AXIS = 6

/** 固定时钟（日期轴确定化）：月 / 日 / 「今日」高亮均由该时刻派生。 */
const FIXED_CLOCK = new Date('2026-01-15T09:30:00+08:00')

/** 窄视口（视口轴）：与主视口 1280×800 区分，覆盖换行 / 折行布局路径。 */
const NARROW_VIEWPORT = { width: 768, height: 800 }

/** P0 命中区的手机档视口（响应式设计 §4 的 mobile 档）：多值字段必须折行。 */
const HIT_TARGET_VIEWPORT = { width: 390, height: 844 }

/** 非缺省预设（预设轴）：缺省为 `minimal`（不设 `data-preset`）。 */
const NON_DEFAULT_PRESET = 'momei'

/**
 * 视觉测试专用入口：启用仓库内测试字体（`visual-fonts.css`），并等待字体加载完成。
 *
 * 组件默认字体栈依赖系统 CJK 回退，本地与 CI runner 可能不同；视觉基线不能建立在这种
 * 环境差异上。`?visual=1` 只影响视觉夹具，E2E 夹具仍走默认系统字体。
 */
async function gotoVisual(page: Page): Promise<void> {
    await page.goto('/?visual=1')
    await page.evaluate(async () => {
        await Promise.all([
            document.fonts.load('16px "CaomeiTestLatin"'),
            document.fonts.load('16px "CaomeiTestCJK"'),
        ])
        await document.fonts.ready
    })
}

async function prepareFormAxis(page: Page, setup: string, theme: string): Promise<void> {
    if (setup === 'clock') {
        await page.clock.setFixedTime(FIXED_CLOCK)
    }
    await gotoVisual(page)
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
    if (setup === 'hit-target') {
        await page.setViewportSize(HIT_TARGET_VIEWPORT)
        // 前置守卫：三个多值字段都必须折行（≥2 行），否则多行行距与命中区间距面失去判别力
        const fields = [
            ['#hit-tags', '.caomei-tags-input__tag'],
            ['#hit-multi', '.caomei-multi-select__tag'],
            ['#hit-auto', '.caomei-auto-complete__tag'],
        ] as const
        for (const [section, member] of fields) {
            const lines = await page.locator(`${section} ${member}`).evaluateAll((elements) =>
                new Set(elements.map((element) => Math.round(element.getBoundingClientRect().top))).size)
            expect(lines, `${section} 在 ${HIT_TARGET_VIEWPORT.width} 视口下应折行（≥2 行）`).toBeGreaterThanOrEqual(2)
        }
    }
    if (setup === 'dialog') {
        await page.click('#dialog-open')
        await page.waitForSelector('.caomei-dialog__content')
    }
    if (setup === 'range-picker') {
        await page.click('#panel-date-picker-range .caomei-date-picker')
        await page.waitForSelector('.caomei-date-picker__content')
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

    test('视觉测试字体已加载且覆盖受检面文本', async ({ page }) => {
        await page.clock.setFixedTime(FIXED_CLOCK)
        await gotoVisual(page)
        const loadedFamilies = await page.evaluate(async () => {
            const faces = await Promise.all([
                document.fonts.load('16px "CaomeiTestLatin"'),
                document.fonts.load('16px "CaomeiTestCJK"'),
            ])
            await document.fonts.ready
            return faces.flat().map((face) => face.family)
        })
        expect(loadedFamilies.some((family) => family.includes('CaomeiTestLatin')), 'CaomeiTestLatin face 未注册').toBe(true)
        expect(loadedFamilies.some((family) => family.includes('CaomeiTestCJK')), 'CaomeiTestCJK face 未注册').toBe(true)
        await page.click('#dialog-open')
        await page.waitForSelector('.caomei-dialog__content')
        const selectors = [
            ...SAMPLE_SECTIONS.map(({ id }) => `#${id}`),
            ...FORM_AXIS_CASES.map(({ target }) => target),
        ]
        const text = await page.evaluate(({ targets, textInputTypes }) => {
            const allowedInputTypes = new Set(textInputTypes)
            const chunks: string[] = []
            for (const selector of targets) {
                const node = document.querySelector(selector)
                if (!node) {
                    continue
                }
                chunks.push(node.textContent)
                for (const field of node.querySelectorAll('input, textarea, [placeholder]')) {
                    const placeholder = field.getAttribute('placeholder')
                    if (placeholder) {
                        chunks.push(placeholder)
                    }
                    if (field instanceof HTMLTextAreaElement) {
                        chunks.push(field.value)
                    } else if (field instanceof HTMLInputElement) {
                        if (field.type === 'password') {
                            chunks.push('•'.repeat(field.value.length))
                        } else if (allowedInputTypes.has(field.type)) {
                            chunks.push(field.value)
                        }
                    }
                }
            }
            return chunks.join('')
        }, { targets: selectors, textInputTypes: [...TEXT_INPUT_TYPES] })
        const fonts = await openTestFonts()
        const missing = findMissingGlyphs(text, fonts)
        expect(missing, `字体子集缺少字符：${missing.map((codePoint) => `U+${codePoint.toString(16).toUpperCase()}`).join(', ')}`).toEqual([])
        const family = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--caomei-font-sans'))
        expect(family).toContain('CaomeiTestLatin')
        expect(family).toContain('CaomeiTestCJK')
        // 自检：cmap 检查必须能识别子集外字形（私用区码点不在两个子集中）。
        expect(findMissingGlyphs('\uE000', fonts)).toEqual([0xE000])
    })

    for (const theme of THEMES) {
        for (const { id, name } of SAMPLE_SECTIONS) {
            test(`${name}（${theme}）`, async ({ page }) => {
                await gotoVisual(page)
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

test.describe('形态轴扩面（视口 / 预设 / 日期 / 浮层 / P0 命中区 / 区间面板）', () => {
    for (const theme of THEMES) {
        for (const { key, label, target, setup } of FORM_AXIS_CASES) {
            test(`${label}（${theme}）`, async ({ page }) => {
                await prepareFormAxis(page, setup, theme)
                await expect(page.locator(target)).toHaveScreenshot(`${key}-${theme}.png`)
            })
        }
    }
})
