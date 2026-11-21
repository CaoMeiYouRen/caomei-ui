import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/**
 * TimePicker / DatePicker 宽度契约守卫。
 *
 * 契约：时间与日期内容的长度可预见，默认宽度按内容档位封顶（含秒 / 12 小时制 / 含时间 / 区间），
 * 不再继承选择器家族的 `--caomei-select-max-width`（20rem）。需要与其它表单控件对齐时，
 * 把 `--caomei-time-picker-max-width` / `--caomei-date-picker-max-width` 覆盖为 `100%` 或 `none`。
 *
 * happy-dom 无布局引擎，故这里守住**声明**层面；真实几何由
 * `test/e2e/component-geometry.e2e.ts` 的浏览器用例承担。
 */

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const TIME_PICKER = join(REPO_ROOT, 'src', 'components', 'time-picker', 'time-picker.vue')
const DATE_PICKER = join(REPO_ROOT, 'src', 'components', 'date-picker', 'date-picker.vue')
const FIELD_RULE_RE = /\.caomei-time-picker__field\s*\{([^}]*)\}/

describe('TimePicker 宽度契约', () => {
    const sfc = readFileSync(TIME_PICKER, 'utf8')

    it('字段声明 100% 宽度并以时间内容档位封顶', () => {
        const rule = FIELD_RULE_RE.exec(sfc)?.[1] ?? ''
        expect(rule).toMatch(/(?:^|[;\s])width:\s*100%/)
        expect(rule).toMatch(/max-width:\s*var\(--caomei-time-picker-max-width,\s*var\(--caomei-time-picker-content-width\)\)/)
        expect(sfc, '默认值不得再回退选择器家族的 20rem 上限').not.toMatch(/--caomei-time-picker-max-width[^;]*--caomei-select-max-width/)
    })

    it('含秒 / 12 小时制分别声明更宽的内容档位', () => {
        expect(sfc).toMatch(/:where\(\.caomei-time-picker\)\s*\{\s*--caomei-time-picker-content-width:\s*8\.5rem/)
        expect(sfc).toMatch(/:where\(\.caomei-time-picker\[data-seconds='true'\]\)\s*\{\s*--caomei-time-picker-content-width:\s*11\.5rem/)
        expect(sfc).toMatch(/:where\(\.caomei-time-picker\[data-hour-format='12'\]\)\s*\{\s*--caomei-time-picker-content-width:\s*calc\(8\.5rem \+ 3\.75rem\)/)
    })
})

describe('DatePicker 宽度契约', () => {
    const sfc = readFileSync(DATE_PICKER, 'utf8')

    it('默认宽度按日期内容档位封顶，不再继承 20rem', () => {
        const rule = /\.caomei-date-picker\s*\{([^}]*)\}/.exec(sfc)?.[1] ?? ''
        expect(rule).toMatch(/max-width:\s*var\(--caomei-date-picker-max-width,\s*var\(--caomei-date-picker-default-width\)\)/)
        expect(sfc, '默认值不得再回退选择器家族的 20rem 上限').not.toMatch(/--caomei-date-picker-max-width[^;]*--caomei-select-max-width/)
        expect(sfc).toMatch(/--caomei-date-picker-default-width:\s*12rem/)
        expect(sfc).toMatch(/\[data-show-time\][^{]*\{[^}]*--caomei-date-picker-default-width:\s*15rem/)
        expect(sfc).toMatch(/\[data-range\][^{]*\{[^}]*--caomei-date-picker-default-width:\s*18rem/)
    })
})
