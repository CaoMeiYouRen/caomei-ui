import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/**
 * 下游兼容工作流的结构契约。
 *
 * 背景：`Downstream Compat` 的「关键流 / 视觉回归」是**按下游能力**逐仓登记的（`critical-command` /
 * `visual-command`，留空表示该仓不具备该能力）。留空必须与发布指南 §10 的「未覆盖 + 风险」登记
 * 同时出现，否则「没跑」会静默变成「已覆盖」。本契约把三件事变成可判定：
 * 1. 每个矩阵条目都声明了这两项（允许空串，但不允许缺字段）；
 * 2. 两个回 steps 存在且以 `matrix.*` 为条件（防「字段登记了但没人读」）；
 * 3. 文件头保留了「未覆盖 + 风险」登记段（防把未覆盖清单删掉后仍通过）。
 */

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const WORKFLOW = join(ROOT, '.github', 'workflows', 'downstream-compat.yml')

interface MatrixEntry {
    name: string
    fields: Record<string, string>
}

/** 极简 YAML 取值：只解析本契约关心的 `include` 条目字段（避免引入 YAML 依赖）。 */
function parseMatrixEntries(text: string): MatrixEntry[] {
    const entries: MatrixEntry[] = []
    const lines = text.split(/\r?\n/u)
    let inMatrix = false
    let current: MatrixEntry | null = null
    for (const line of lines) {
        if (/^\s{8}matrix:\s*$/u.test(line) || /^\s{6}matrix:\s*$/u.test(line)) {
            inMatrix = true
            continue
        }
        if (!inMatrix) {
            continue
        }
        const entryMatch = /^\s{10}- name:\s*(\S+)\s*$/u.exec(line)
        if (entryMatch) {
            current = { name: entryMatch[1] ?? '', fields: {} }
            entries.push(current)
            continue
        }
        if (current) {
            const fieldMatch = /^\s{12}([a-z-]+):\s*(.*)$/u.exec(line)
            if (fieldMatch) {
                current.fields[fieldMatch[1] ?? ''] = fieldMatch[2] ?? ''
            }
        }
        if (/^\s{6}steps:\s*$/u.test(line)) {
            inMatrix = false
        }
    }
    return entries
}

const workflow = readFileSync(WORKFLOW, 'utf8')
const entries = parseMatrixEntries(workflow)

describe('Downstream Compat 工作流契约', () => {
    it('解析到全部受检下游（受检面不为空）', () => {
        expect(entries.map((entry) => entry.name)).toEqual(
            expect.arrayContaining(['dependfix', 'caomei-auth', 'momei']),
        )
    })

    it('每个矩阵条目都声明 critical-command 与 visual-command（允许空串）', () => {
        for (const entry of entries) {
            expect(entry.fields, `${entry.name} 缺少回归命令字段`).toHaveProperty('critical-command')
            expect(entry.fields, `${entry.name} 缺少回归命令字段`).toHaveProperty('visual-command')
        }
    })

    it('两个回归步骤存在且以矩阵字段为条件', () => {
        expect(workflow).toContain('name: Critical flow regression (downstream)')
        expect(workflow).toContain('if: matrix.critical-command != \'\'')
        expect(workflow).toContain('name: Visual regression (downstream)')
        expect(workflow).toContain('if: matrix.visual-command != \'\'')
    })

    it('文件头保留「未覆盖 + 风险」登记段', () => {
        expect(workflow).toContain('未覆盖 + 风险（接入即登记，不得读成已覆盖）')
        expect(workflow).toContain('dependfix')
    })
})
