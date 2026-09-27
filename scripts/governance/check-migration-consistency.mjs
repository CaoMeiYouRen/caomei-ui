#!/usr/bin/env node
/**
 * check-migration-consistency：迁移口径一致性守卫（简化版）
 *
 * 对账两类来源：
 * 1. 组件页迁移节（`docs/components/*.md` 的「迁移映射」/「从 PrimeVue 迁移」段）
 * 2. 设计规范 §7（`docs/design/design-spec.md` 的各组件迁移映射条目）
 *
 * 规则（简化，不宣称穷尽 prop-by-prop 对比）：
 * - §7 为单一事实源（权威归属）
 * - §7 中已登记的组件，其组件页必须存在迁移节（防静默收窄）
 * - 组件页迁移节必须包含最小必要关键词（"迁移映射"、"PrimeVue"、"→" 或 "->" 等映射标记）
 * - §7 中有"已知差异（有意）"的组件，组件页迁移节应声明已知差异
 * - 受检面下界校验（防静默收窄）
 *
 * 用法：
 *   node scripts/governance/check-migration-consistency.mjs   # 有问题 exit 1
 */

import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDirectExecution } from '../shared/cli.mjs'

const REPO_ROOT = join(fileURLToPath(import.meta.url), '..', '..', '..')
const COMPONENTS_DIR = join(REPO_ROOT, 'docs', 'components')
const DESIGN_DOC = join(REPO_ROOT, 'docs', 'design', 'design-spec.md')

// 解析 §7 的迁移映射条目（提取组件名）
function parseSection7Components(markdown) {
    const components = []
    const lines = markdown.split(/\r?\n/)

    const start = lines.findIndex((line) => /^##\s+7\.\s+迁移映射/.test(line))
    if (start === -1) {
        return components
    }

    for (let i = start + 1; i < lines.length; i++) {
        const line = lines[i]
        if (/^##\s+\d+/.test(line)) {
            break
        }

        const compMatch = line.match(/^>\s*([A-Z][A-Za-z0-9]*)\s+迁移映射/)
        if (compMatch) {
            components.push(compMatch[1])
        }
    }

    return components
}

// 检查组件页是否有迁移节
function hasMigrationSection(filepath) {
    const content = readFileSync(filepath, 'utf-8')
    return (
        />\s*迁移映射[（(]?PrimeVue/.test(content)
        || />\s*迁移映射\s*[→-]/.test(content)
        || /^##\s+从 PrimeVue 迁移/m.test(content)
        || /^##\s+迁移映射/m.test(content)
    )
}

// 检查组件页迁移节是否包含映射标记
function hasMappingMarkers(filepath) {
    const content = readFileSync(filepath, 'utf-8')
    // 寻找迁移节内容（从"迁移映射"或"从 PrimeVue 迁移"开始到下一个标题）
    const lines = content.split(/\r?\n/)
    let inMigration = false
    let hasMarker = false

    for (const line of lines) {
        if (/>迁移映射[（(]?PrimeVue/.test(line) || />迁移映射\s*[→-]/.test(line) || /^##\s+从 PrimeVue 迁移/.test(line) || /^##\s+迁移映射/.test(line)) {
            inMigration = true
            continue
        }
        if (inMigration && /^##?\s+/.test(line)) {
            break
        }
        if (inMigration) {
            // 显式映射标记
            if (/(?:→|->|映射|对应)/.test(line)) {
                hasMarker = true
            }
            // 表格式映射：包含 "PrimeVue" 和 "本组件" 列的表格
            if (/\|.*PrimeVue.*\|.*本组件.*\|/.test(line) || /\|.*PrimeVue.*\|.*caomei-ui.*\|/i.test(line)) {
                hasMarker = true
            }
        }
    }

    return hasMarker
}

// 检查 §7 中组件是否有"已知差异/有意差异/语义差异"
// 正确作用域：从该组件的标题行开始，到下一个组件标题行结束
function section7HasKnownDiffs(componentName, designDoc) {
    const lines = designDoc.split(/\r?\n/)
    const section7Start = lines.findIndex((line) => /^##\s+7\.\s+迁移映射/.test(line))
    if (section7Start === -1) {
        return false
    }

    // 先找到该组件的起始行
    let compStart = -1
    for (let i = section7Start + 1; i < lines.length; i++) {
        const line = lines[i]
        if (/^##\s+\d+/.test(line)) {
            break
        }
        const compMatch = line.match(/^>\s*([A-Z][A-Za-z0-9]*)\s+迁移映射/)
        if (compMatch && compMatch[1] === componentName) {
            compStart = i
            break
        }
    }
    if (compStart === -1) {
        return false
    }

    // 先检查标题行本身（长行内包含差异标记）
    const headerLine = lines[compStart]
    if (/\*\*(?:已知行为差异|有意差异|已知差异（有意）|语义差异（有意）|默认值分歧且为有意|默认相反|载荷差异属有意|属有意差异)\*\*/.test(headerLine)) {
        return true
    }

    // 从组件起始行向后扫描，直到下一个组件或 §8
    for (let i = compStart + 1; i < lines.length; i++) {
        const line = lines[i]
        if (/^##\s+\d+/.test(line)) {
            break
        }
        // 下一个组件标题（支持多词组件名如 Calendar / DatePicker）
        if (/^>\s*[A-Z][A-Za-z0-9]*([\s/][A-Za-z0-9]+)*\s+迁移映射/.test(line)) {
            break
        }
        // 差异标记（兼容 blockquote 前缀 > 和空白）
        if (/(?:^>|^\s*)\s*\*\*(?:已知行为差异|有意差异|已知差异（有意）|语义差异（有意）|默认值分歧且为有意|默认相反|载荷差异属有意|属有意差异)\*\*/.test(line)) {
            return true
        }
    }
    return false
}

// 检查组件页迁移节是否声明已知差异
function componentPageHasKnownDiffs(filepath) {
    const content = readFileSync(filepath, 'utf-8')
    return /\*\*已知差异（有意）\*\*/.test(content)
}

function checkMigrationConsistency() {
    const errors = []

    // 1. 读取 §7 权威迁移映射的组件列表
    const designDoc = readFileSync(DESIGN_DOC, 'utf-8')
    const section7Components = parseSection7Components(designDoc)

    if (section7Components.length === 0) {
        errors.push('未从设计规范 §7 解析到任何迁移映射条目')
        return { ok: false, errors }
    }

    // 2. 扫描组件页
    const componentFiles = readdirSync(COMPONENTS_DIR)
        .filter((f) => f.endsWith('.md') && !['index.md', 'showcase.md', 'locale.md', 'composables.md', 'icons.md'].includes(f))

    const stats = {
        section7Total: section7Components.length,
        hasMigrationSection: 0,
        hasMappingMarkers: 0,
        section7KnownDiffs: 0,
        pageHasKnownDiffs: 0,
        missingMigration: [],
        missingMarkers: [],
        missingKnownDiffs: [],
    }

    for (const file of componentFiles) {
        const filepath = join(COMPONENTS_DIR, file)
        const componentName = file.replace(/\.md$/, '')
            .split('-')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join('')

        // 只检查 §7 中有登记的组件
        if (!section7Components.includes(componentName)) {
            continue
        }

        // 检查是否有迁移节
        if (hasMigrationSection(filepath)) {
            stats.hasMigrationSection++

            // 检查是否有映射标记
            if (hasMappingMarkers(filepath)) {
                stats.hasMappingMarkers++
            } else {
                stats.missingMarkers.push(file)
            }

            // 检查已知差异同步
            if (section7HasKnownDiffs(componentName, designDoc)) {
                stats.section7KnownDiffs++
                if (componentPageHasKnownDiffs(filepath)) {
                    stats.pageHasKnownDiffs++
                } else {
                    stats.missingKnownDiffs.push({ componentName, file })
                }
            }
        } else {
            stats.missingMigration.push({ componentName, file })
        }
    }

    // 3. 报错：缺少迁移节
    for (const m of stats.missingMigration) {
        errors.push(`组件 "${m.componentName}" 在 §7 有迁移映射登记，但 ${m.file} 缺少迁移节（需包含"迁移映射"或"从 PrimeVue 迁移"段）`)
    }

    // 4. 报错：迁移节无映射标记
    for (const file of stats.missingMarkers) {
        errors.push(`${file} 有迁移节但未包含映射标记（如 →、->、映射、对应），需补充关键映射`)
    }

    // 5. 报错：已知差异未同步声明
    for (const m of stats.missingKnownDiffs) {
        errors.push(`${m.file}（${m.componentName}）：§7 有"已知差异（有意）"登记，但组件页迁移节未同步声明`)
    }

    // 6. 受检面下界校验（防静默收窄）
    const MIN_SECTION7_COMPONENTS = 30
    if (section7Components.length < MIN_SECTION7_COMPONENTS) {
        errors.push(`§7 迁移映射组件数 ${section7Components.length} 低于下界 ${MIN_SECTION7_COMPONENTS}：怀疑受检面被静默收窄`)
    }
    if (stats.hasMigrationSection < MIN_SECTION7_COMPONENTS) {
        errors.push(`有迁移节的组件页 ${stats.hasMigrationSection} 低于下界 ${MIN_SECTION7_COMPONENTS}：怀疑受检面被静默收窄`)
    }

    // 7. 汇总信息
    console.info(`[check-migration-consistency] §7组件: ${stats.section7Total} | 有迁移节: ${stats.hasMigrationSection} | 有映射标记: ${stats.hasMappingMarkers} | §7已知差异: ${stats.section7KnownDiffs} | 页声明差异: ${stats.pageHasKnownDiffs}`)

    return { ok: errors.length === 0, errors }
}

if (isDirectExecution(import.meta.url)) {
    const result = checkMigrationConsistency()
    if (result.ok) {
        console.info('[check-migration-consistency] 通过：组件页迁移节覆盖 §7 登记，口径基本一致')
        process.exit(0)
    }
    for (const error of result.errors) {
        console.error(`[check-migration-consistency][error] ${error}`)
    }
    process.exit(1)
}
