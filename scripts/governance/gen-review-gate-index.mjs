#!/usr/bin/env node
/**
 * Review Gate 证据留存索引生成器
 *
 * 扫描 artifacts/review-gate/ 目录下的 .md 记录文件，
 * 解析前置元数据，生成 index.json 供 CI/门禁/人工检索引用。
 *
 * 用法：node scripts/governance/gen-review-gate-index.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../..')
const REVIEW_GATE_DIR = path.join(ROOT, 'artifacts/review-gate')
const INDEX_PATH = path.join(REVIEW_GATE_DIR, 'index.json')

function parseRecord(filepath) {
    const content = fs.readFileSync(filepath, 'utf-8')
    const filename = path.basename(filepath, '.md')

    const lines = content.split('\n')

    // 默认值
    let phase = 'Unknown'
    let milestone = 'Unknown'
    let title = 'Unknown'
    let conclusion = 'Pass'
    let auditDepth = 'standard'
    let filesChanged = 0
    let linesAdded = 0
    let linesRemoved = 0
    const verification = { lint: false, typecheck: false, test: false, browser: false }
    const findings = { blocker: 0, warning: 0, suggest: 0 }

    // 从内容中提取信息
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]

        // 标题行
        if (line.startsWith('# Review Gate — ')) {
            const match = line.match(/# Review Gate — (.+)/)
            if (match) {
                title = match[1].trim()
            }
        }

        // 范围行：`- 范围：git diff（3 文件 / +24 −9）`
        const scopeMatch = line.match(/范围.*?(\d+)\s*文件\s*\/\s*\+(\d+)\s*[−-](\d+)/)
        if (scopeMatch) {
            filesChanged = parseInt(scopeMatch[1], 10)
            linesAdded = parseInt(scopeMatch[2], 10)
            linesRemoved = parseInt(scopeMatch[3], 10)
        }

        // 关联 Todo
        const todoMatch = line.match(/关联 Todo：.*?([A-Z]\d+(?:-\d+)?)/)
        if (todoMatch) {
            milestone = todoMatch[1]
        }

        // audit-depth
        const depthMatch = line.match(/audit-depth[：:]\s*`?(\w+)`?/)
        if (depthMatch) {
            const d = depthMatch[1].toLowerCase()
            if (['quick', 'standard', 'deep'].includes(d)) {
                auditDepth = d
            }
        }

        // Review Gate 结论
        const conclusionMatch = line.match(/结论[：:]\s*\*\*?(Pass|Reject)\**?/)
        if (conclusionMatch) {
            conclusion = conclusionMatch[1]
        }

        // Findings 统计 - 查找 #### blocker/warning/suggest 后的内容
        if (line.startsWith('#### blocker')) {
            let count = 0
            for (let j = i + 1; j < lines.length; j++) {
                if (lines[j].startsWith('####') || lines[j].startsWith('###') || lines[j].startsWith('##')) {
                    break
                }
                if (lines[j].match(/^\s*\d+\./)) {
                    count++
                }
                if (lines[j].includes('（无）') || lines[j].trim() === '') {
                    count = 0
                    break
                }
            }
            findings.blocker = count
        }
        if (line.startsWith('#### warning')) {
            let count = 0
            for (let j = i + 1; j < lines.length; j++) {
                if (lines[j].startsWith('####') || lines[j].startsWith('###') || lines[j].startsWith('##')) {
                    break
                }
                if (lines[j].match(/^\s*\d+\./)) {
                    count++
                }
                if (lines[j].includes('（无）') || lines[j].trim() === '') {
                    count = 0
                    break
                }
            }
            findings.warning = count
        }
        if (line.startsWith('#### suggest')) {
            let count = 0
            for (let j = i + 1; j < lines.length; j++) {
                if (lines[j].startsWith('####') || lines[j].startsWith('###') || lines[j].startsWith('##')) {
                    break
                }
                if (lines[j].match(/^\s*\d+\./)) {
                    count++
                }
                if (lines[j].includes('（无）') || lines[j].trim() === '') {
                    count = 0
                    break
                }
            }
            findings.suggest = count
        }

        // 验证矩阵行
        if (line.includes('lint') && line.includes('typecheck') && (line.includes('测试') || line.includes('test'))) {
            verification.lint = line.includes('lint')
            verification.typecheck = line.includes('typecheck')
            verification.test = line.includes('测试') || line.includes('test')
            verification.browser = line.includes('浏览器') || line.includes('Chromium') || line.includes('browser')
        }
    }

    // 从文件名推断 date 和 phase
    const dateMatch = filename.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/)
    if (dateMatch) {
        const date = dateMatch[1]
        const rest = dateMatch[2]
        const phaseMatch = rest.match(/^(phase\d+|recurring|backlog)/i)
        if (phaseMatch) {
            phase = phaseMatch[1].charAt(0).toUpperCase() + phaseMatch[1].slice(1)
            milestone = rest.slice(phaseMatch[0].length + 1)
        } else {
            phase = 'Unknown'
            milestone = rest
        }
        return {
            id: filename,
            date,
            phase,
            milestone,
            title,
            conclusion,
            auditDepth,
            filesChanged,
            linesAdded,
            linesRemoved,
            verification,
            findings,
            path: `artifacts/review-gate/${filename}.md`,
        }
    }

    return null
}

function main() {
    if (!fs.existsSync(REVIEW_GATE_DIR)) {
        console.error(`目录不存在: ${REVIEW_GATE_DIR}`)
        process.exit(1)
    }

    const files = fs.readdirSync(REVIEW_GATE_DIR)
        .filter((f) => f.endsWith('.md') && !f.startsWith('index'))
        .sort()

    const records = []
    for (const file of files) {
        const filepath = path.join(REVIEW_GATE_DIR, file)
        const parsed = parseRecord(filepath)
        if (parsed) {
            records.push(parsed)
        } else {
            console.warn(`无法解析: ${file}`)
        }
    }

    // 按日期倒序排序
    records.sort((a, b) => b.date.localeCompare(a.date))

    const index = {
        $schema: 'https://json-schema.org/draft/2020-12/schema',
        description: 'Review Gate 证据留存索引 - 所有审计记录的可机读索引，供 CI/门禁/人工检索引用',
        version: '1.0.0',
        generatedAt: new Date().toISOString(),
        totalRecords: records.length,
        records,
    }

    fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2))
    console.info(`✅ 生成索引: ${INDEX_PATH}`)
    console.info(`   记录数: ${records.length}`)
    console.info(`   最新: ${records[0]?.id || '无'}`)
}

main()
