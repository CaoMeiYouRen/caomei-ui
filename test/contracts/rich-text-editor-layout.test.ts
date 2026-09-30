import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/**
 * 富文本编辑器包裹层的布局契约守卫。
 *
 * 契约：`.caomei-rich-text-editor` 根类必须同时声明 `width: 100%` 与 `min-width: 0`。
 * 理由：编辑器内核（`md-editor-v3`）的工具栏为 `nowrap`，其 min-content 宽度远大于移动端视口；
 * 组件被放进 grid / flex 父容器时，默认 `min-width: auto` 会让网格项按 min-content 撑开，
 * 从而把**整页**宽度顶出视口（真实 Chromium 实测：390 视口下 `documentElement.scrollWidth`
 * 为 1034、834 视口为 1083）。归零后组件收缩到父容器宽度，溢出交由内核工具栏自身横向滚动处理。
 *
 * happy-dom 无布局引擎、也不算 scoped CSS，故此处只守**声明**层面；真实几何由
 * `@ui-validator` 的浏览器验证承担（记录见 docs/design/governance）。
 */

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const COMPONENT_FILE = join(REPO_ROOT, 'src', 'components', 'rich-text-editor', 'rich-text-editor.vue')

/** 根类规则块（`\.caomei-rich-text-editor {` 到其配对的 `}`），不匹配 `__` / `--` 修饰类与 `:deep()` */
const ROOT_RULE_RE = /\.caomei-rich-text-editor\s*\{([^}]*)\}/

describe('RichTextEditor 布局契约', () => {
    it('根类同时声明 width: 100% 与 min-width: 0', () => {
        const source = readFileSync(COMPONENT_FILE, 'utf8')
        const match = ROOT_RULE_RE.exec(source)

        expect(match, '未找到 .caomei-rich-text-editor 根类规则').not.toBeNull()
        const body = match?.[1] ?? ''

        expect(body, '根类缺少 width: 100%').toMatch(/(?:^|[;{\s])width:\s*100%/)
        expect(body, '根类缺少 min-width: 0（窄屏会被内核工具栏 min-content 撑破父容器）').toMatch(
            /(?:^|[;{\s])min-width:\s*0\b/,
        )
    })
})
