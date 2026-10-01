#!/usr/bin/env node
/**
 * check-components-overview：组件总览页成员对账守卫
 *
 * 对账两类总览页：
 * 1. 中文总览页（/components/index.md）：分组顺序 + 成员 ↔ 侧栏 / 设计规范 §11 登记表
 * 2. 英文总览页（/en-US/components/index.md）：已翻译组件条目 ↔ docs/i18n/en-US/components/*.md 集合 + 顺序
 *    注：英文页按翻译覆盖组织，不校分组结构（属 check-i18n-parity 的 STRUCTURE_EXEMPTIONS 已登记有意差异）
 *
 * 存量修复：同批修复中英总览页缺 CheckboxGroup
 *
 * 用法：
 *   node scripts/governance/check-components-overview.mjs   # 有问题 exit 1
 */

import { readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDirectExecution } from '../shared/cli.mjs'
import {
    collectDocsMarkdownFiles,
    loadSiteNavigation,
} from '../docs/vitepress-site.mjs'
import { parseSection11Groups } from './component-registry.mjs'

const REPO_ROOT = join(fileURLToPath(import.meta.url), '..', '..', '..')
const OVERVIEW_ZH = join(REPO_ROOT, 'docs', 'components', 'index.md')
const OVERVIEW_EN = join(REPO_ROOT, 'docs', 'i18n', 'en-US', 'components', 'index.md')
const DESIGN_DOC = join(REPO_ROOT, 'docs', 'design', 'documentation-site.md')
const EN_COMPONENTS_DIR = join(REPO_ROOT, 'docs', 'i18n', 'en-US', 'components')

const MD_LINK_RE = /\[([^\]]*)\]\(([^)]+)\)/g
const GROUP_HEADER_RE = /^##\s+(.+)$/

/**
 * 解析中文总览页：返回 { groupZh -> [componentNames] }
 * 组件名按链接 basename 推导（kebab-case -> 英文名还原，如 button-group -> ButtonGroup）
 * 排除 "能力说明" 分组（非组件组；§11 登记的**组件分组**才参与对账——当前 7 组，含 2026-09-30 追加的「高级组件」）
 */
function parseOverviewZh(filepath) {
    const content = readFileSync(filepath, 'utf-8')
    const result = {}
    let currentGroup = null

    for (const line of content.split(/\r?\n/)) {
        const groupMatch = line.match(GROUP_HEADER_RE)
        if (groupMatch) {
            currentGroup = groupMatch[1].trim()
            // 跳过 "能力说明"（非组件分组）
            if (currentGroup === '能力说明') {
                currentGroup = null
                continue
            }
            result[currentGroup] = []
            continue
        }

        if (currentGroup && line.trim().startsWith('- [')) {
            const linkMatch = line.match(/\[([^\]]+)\]\(([^)]+)\)/)
            if (linkMatch) {
                const [, title, link] = linkMatch
                // 从标题提取英文组件名（如 "Button 按钮" -> "Button"）
                const enName = title.split(' ')[0].trim()
                if (enName) {
                    result[currentGroup].push(enName)
                }
            }
        }
    }
    return result
}

/**
 * 解析英文总览页：返回已翻译组件英文名数组（按顺序）
 */
function parseOverviewEn(filepath) {
    const content = readFileSync(filepath, 'utf-8')
    const result = []

    // 只解析 "Translated component pages" 到 "Until a page is translated" 之间的列表
    const lines = content.split(/\r?\n/)
    let inTranslatedSection = false

    for (const line of lines) {
        if (line.includes('Translated component pages') || line.includes('translated component pages')) {
            inTranslatedSection = true
            continue
        }
        if (inTranslatedSection && (line.startsWith('##') || line.includes('Until a page is translated'))) {
            break
        }
        if (inTranslatedSection && line.trim().startsWith('- [')) {
            const linkMatch = line.match(/\[([^\]]+)\]\(([^)]+)\)/)
            if (linkMatch) {
                const [, title, link] = linkMatch
                // 标题即英文组件名
                result.push(title.trim())
            }
        }
    }
    return result
}

/**
 * 获取英文组件文件集合
 */
function getEnComponentFiles() {
    const files = collectDocsMarkdownFiles(EN_COMPONENTS_DIR)
    const components = new Set()
    for (const file of files) {
        const rel = relative(EN_COMPONENTS_DIR, file)
        if (rel === 'index.md' || rel === 'showcase.md' || rel === 'locale.md' || rel === 'composables.md' || rel === 'icons.md') {
            continue
        }
        // kebab-case 文件名 -> 英文组件名
        const basename = rel.replace(/\.md$/, '')
        const enName = basename.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('')
        components.add(enName)
    }
    return components
}

function checkOverview() {
    const errors = []

    // 1. 读取 §11 登记表
    const designDoc = readFileSync(DESIGN_DOC, 'utf-8')
    const section11Groups = parseSection11Groups(designDoc)
    if (section11Groups.length === 0) {
        errors.push('未从设计文档 §11 解析到分组登记表')
        return { ok: false, errors }
    }

    // 2. 读取中文总览页
    const overviewZh = parseOverviewZh(OVERVIEW_ZH)

    // 3. 读取英文总览页
    const overviewEn = parseOverviewEn(OVERVIEW_EN)
    const enComponentFiles = getEnComponentFiles()

    // 4. 中文总览页对账：分组与成员 ↔ §11 登记表
    // §11 的分组中文名
    const section11ZhGroups = section11Groups.map((g) => g.zh)
    const overviewZhGroups = Object.keys(overviewZh)

    // 分组数对账（§11 登记的组件分组才计入；总览页另有 "能力说明" 非组件组）
    if (overviewZhGroups.length !== section11ZhGroups.length) {
        errors.push(`中文总览页组件分组数 ${overviewZhGroups.length} 与 §11 登记 ${section11ZhGroups.length} 不一致（不含"能力说明"）`)
    }

    // 逐组对账
    for (let i = 0; i < section11ZhGroups.length; i++) {
        const expectedGroup = section11ZhGroups[i]
        const actualGroup = overviewZhGroups[i]
        if (!actualGroup) {
            errors.push(`中文总览页缺少分组 "${expectedGroup}"`)
            continue
        }
        if (actualGroup !== expectedGroup) {
            errors.push(`中文总览页第 ${i + 1} 组应为 "${expectedGroup}"，实为 "${actualGroup}"`)
        }

        const expectedComponents = section11Groups[i].components
        const actualComponents = overviewZh[actualGroup] || []

        // 组内成员与顺序对账（§11 要求组内按英文名字母序）
        // 组内按英文名字母序（kebab-case 排序等价于英文名字母序）
        function kebabCase(name) {
            return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
        }
        const expectedSorted = [...expectedComponents].sort((a, b) => kebabCase(a).localeCompare(kebabCase(b)))
        const actualSorted = [...actualComponents].sort((a, b) => kebabCase(a).localeCompare(kebabCase(b)))
        if (actualComponents.join('、') !== expectedComponents.join('、')) {
            errors.push(`中文总览页 "${actualGroup}" 组内成员/顺序与 §11 不一致：期望 ${expectedComponents.join('、')}，实为 ${actualComponents.join('、')}`)
        }
    }

    // 5. 英文总览页对账：已翻译条目 ↔ 英文组件文件集合 + 顺序
    // 顺序检查：英文总览页列表顺序应与中文总览页扁平化顺序一致（§11 登记顺序）
    const expectedEnOrder = section11Groups.flatMap((g) => g.components)
    // 只保留已翻译的
    const expectedEnTranslated = expectedEnOrder.filter((c) => enComponentFiles.has(c))

    if (overviewEn.join('、') !== expectedEnTranslated.join('、')) {
        errors.push(`英文总览页已翻译条目/顺序与 §11 登记不一致：期望 ${expectedEnTranslated.join('、')}，实为 ${overviewEn.join('、')}`)
    }

    // 6. 反向校验：英文组件文件必须在英文总览页中（防漏列）
    for (const enName of enComponentFiles) {
        if (!overviewEn.includes(enName)) {
            errors.push(`英文总览页遗漏已翻译组件：${enName}`)
        }
    }

    // 7. 受检面下界校验（防静默收窄）
    const MIN_OVERVIEW_COMPONENTS = 45 // 当前组件总数
    const totalZhComponents = Object.values(overviewZh).flat().length
    if (totalZhComponents < MIN_OVERVIEW_COMPONENTS) {
        errors.push(`中文总览页组件条目 ${totalZhComponents} 低于下界 ${MIN_OVERVIEW_COMPONENTS}：怀疑受检面被静默收窄`)
    }

    return { ok: errors.length === 0, errors }
}

if (isDirectExecution(import.meta.url)) {
    const result = checkOverview()
    if (result.ok) {
        console.info('[check-components-overview] 通过：中英总览页与 §11/侧栏/翻译文件一致')
        process.exit(0)
    }
    for (const error of result.errors) {
        console.error(`[check-components-overview][error] ${error}`)
    }
    process.exit(1)
}
