import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/**
 * Button `iconOnly` 示例形态契约。
 *
 * 契约：`iconOnly` 模式**不渲染默认插槽**（组件模板以 `v-else-if="iconOnly && $slots.icon"` 渲染图标），
 * 故示例中的纯图标按钮必须把图标放进 `#icon` 插槽；沿用默认插槽会渲染成空白方块。
 * 本契约守护文档站示例（`docs/examples/button/icon-only.vue`，中英页共用同一示例源）。
 *
 * 真实渲染由文档站真实 Chromium 实测取证（V 阶段）。
 */

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const ICON_ONLY_EXAMPLE = join(REPO_ROOT, 'docs', 'examples', 'button', 'icon-only.vue')
/** 受检面下界：示例至少包含 20 个纯图标按钮（防止示例被静默清空/改写后守卫空转） */
const MIN_ICON_ONLY_BUTTONS = 20

export interface IconOnlyExampleIssue {
    reason: string
}

/**
 * 校验 `iconOnly` 示例的图标落点。
 *
 * @param source `icon-only.vue` 文本
 * @returns 违约项（空数组即通过）
 */
export function checkIconOnlyExample(source: string): IconOnlyExampleIssue[] {
    const issues: IconOnlyExampleIssue[] = []
    const blocks = [...source.matchAll(/<CaomeiButton\b[^>]*\bicon-only\b[^>]*>([\s\S]*?)<\/CaomeiButton>/g)]
    if (blocks.length < MIN_ICON_ONLY_BUTTONS) {
        issues.push({ reason: `纯图标按钮数量 ${blocks.length} 低于受检面下界 ${MIN_ICON_ONLY_BUTTONS}` })
    }
    blocks.forEach((match, index) => {
        const inner = match[1]
        if (!/<template\s+(?:#icon|v-slot:icon)\b/.test(inner)) {
            issues.push({ reason: `第 ${index + 1} 个纯图标按钮缺少 \`#icon\` 插槽（默认插槽不渲染）` })
        }
        const leftover = inner.replace(/<template\s+(?:#icon|v-slot:icon)\b[^>]*>[\s\S]*?<\/template>/g, '').trim()
        if (leftover.length > 0) {
            issues.push({ reason: `第 ${index + 1} 个纯图标按钮在 \`#icon\` 之外仍有内容（不会被渲染）` })
        }
    })
    return issues
}

describe('Button iconOnly 示例契约（判定函数）', () => {
    const good = '<CaomeiButton icon-only label="a">\n  <template #icon>\n    <Plus />\n  </template>\n</CaomeiButton>'
    const many = Array.from({ length: MIN_ICON_ONLY_BUTTONS }, () => good).join('\n')
    const cases: { name: string, source: string, issues: number }[] = [
        { name: '全部走 #icon 插槽 → 通过', source: many, issues: 0 },
        {
            name: '存在默认插槽图标 → 违约',
            source: `${many}\n<CaomeiButton icon-only label="b"><Plus /></CaomeiButton>`,
            issues: 2,
        },
        {
            name: '存在 #icon 之外的残留内容 → 违约',
            source: many.replace('<template #icon>\n    <Plus />\n  </template>', '<template #icon>\n    <Plus />\n  </template>\n  文本'),
            issues: 1,
        },
        {
            name: '按钮数量低于下界 → 违约（防受检面收窄）',
            source: good,
            issues: 1,
        },
    ]

    it.each(cases)('$name', ({ source, issues }) => {
        expect(checkIconOnlyExample(source)).toHaveLength(issues)
    })
})

describe('Button iconOnly 示例契约（仓库现状）', () => {
    it('icon-only.vue 的纯图标按钮均使用 #icon 插槽', () => {
        expect(checkIconOnlyExample(readFileSync(ICON_ONLY_EXAMPLE, 'utf8'))).toEqual([])
    })
})
