import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * 组件分区登记表（[文档与演示站 §11]）的解析与读取。
 *
 * §11 的分组表是**组件成员集合的唯一事实源**：侧栏（`docs:check:structure`）、组件总览页
 * （`check-components-overview`）、画廊登记表（`check-showcase-registry`）与组件设计清单
 * （`check-design-catalog`）都从它派生，避免各自维护一份成员表。
 *
 * 解析口径：取 `## 11.` 到下一个 `##` 之间的表格行，每行 `| 分组 | Sidebar group | 组件（、分隔） |`；
 * 表头与分隔行跳过；组件单元格按 `、` 拆分。分组数 / 成员数下界由调用方各自守卫。
 *
 * 本模块只做解析，不做判定——判定与错误文案留在各守卫内，便于单测按需构造语料。
 */

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
export const DESIGN_DOC_PATH = join(REPO_ROOT, 'docs', 'design', 'documentation-site.md')

/**
 * 解析 §11 分组登记表。
 *
 * @param {string} markdown `docs/design/documentation-site.md` 全文
 * @returns {{ zh: string, en: string, components: string[] }[]} 分组列表（按表内顺序）
 */
export function parseSection11Groups(markdown) {
    const groups = []
    const lines = markdown.split(/\r?\n/)
    const start = lines.findIndex((line) => /^##\s+11\.\s/.test(line))
    if (start === -1) {
        return groups
    }
    const rest = lines.slice(start + 1)
    const end = rest.findIndex((line) => /^##\s/.test(line))
    const section = (end === -1 ? rest : rest.slice(0, end)).join('\n')

    for (const line of section.split(/\r?\n/)) {
        const match = line.match(/^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|$/)
        if (!match) {
            continue
        }
        const [, zh, en, list] = match
        if (/^:?-{2,}/.test(zh) || zh === '分组' || zh === 'Group') {
            continue
        }
        const components = list
            .split('、')
            .map((name) => name.trim())
            .filter((name) => name.length > 0)
        if (components.length === 0) {
            continue
        }
        groups.push({ zh: zh.trim(), en: en.trim(), components })
    }
    return groups
}

/**
 * 读取仓库内的 §11 分组登记表。
 *
 * @param {string} [filepath] 覆盖路径（单测用）
 * @returns {{ zh: string, en: string, components: string[] }[]}
 */
export function readSection11Groups(filepath = DESIGN_DOC_PATH) {
    return parseSection11Groups(readFileSync(filepath, 'utf-8'))
}

/**
 * §11 登记的组件成员全集。
 *
 * @param {{ components: string[] }[]} groups
 * @returns {Set<string>}
 */
export function registeredComponentsOf(groups) {
    return new Set(groups.flatMap((group) => group.components))
}
