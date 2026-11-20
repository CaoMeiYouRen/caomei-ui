import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/**
 * TimePicker 宽度契约守卫。
 *
 * 契约：字段宽度上限与选择器家族同源——默认回退 `--caomei-select-max-width`（20rem），
 * 需要撑满时由 `--caomei-time-picker-max-width: none` 放开。此前字段在宽容器中被父级
 * `align-items: stretch` 拉到整行，与 Select / DatePicker 的宽度观感不一致。
 *
 * happy-dom 无布局引擎，故这里守住**声明**层面；真实几何由
 * `test/e2e/time-picker.e2e.ts` 的宽容器用例承担（视觉基线的夹具 section 窄于 20rem，
 * 对该宽度面无判别力）。
 */

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const SFC = join(REPO_ROOT, 'src', 'components', 'time-picker', 'time-picker.vue')
const FIELD_RULE_RE = /\.caomei-time-picker__field\s*\{([^}]*)\}/

describe('TimePicker 宽度契约', () => {
    it('字段声明 100% 宽度并以选择器家族 token 封顶', () => {
        const rule = FIELD_RULE_RE.exec(readFileSync(SFC, 'utf8'))?.[1] ?? ''
        expect(rule).toMatch(/(?:^|[;\s])width:\s*100%/)
        expect(rule).toMatch(/max-width:\s*var\(--caomei-time-picker-max-width,\s*var\(--caomei-select-max-width\)\)/)
    })
})
