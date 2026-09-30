#!/usr/bin/env node
/**
 * check-locale-ledger：内置文案台账机检对账
 *
 * 以 zh-CN 为基准，对比两个维度：
 * 1. docs/components/locale.md 的「命名空间 → 文案键」索引表 ↔ src/locale/types.ts 接口定义
 * 2. docs/i18n/en-US/components/locale.md（英文版）索引表 ↔ src/locale/types.ts 接口定义
 *
 * 规则：
 * - 台账表中的命名空间集合必须与 types.ts 接口字段完全一致（不漏、不多）
 * - 台账表中每个命名空间的键集合必须与 types.ts 对应接口字段完全一致
 * - 台账表中每个命名空间的「消费组件」列应非空（防静默收窄）
 * - 反向校验：types.ts 中定义的所有命名空间必须在台账表中出现（允许名单反向校验）
 *
 * 用法：
 *   node scripts/governance/check-locale-ledger.mjs   # 有问题 exit 1
 *
 * 维护：
 * - 新增组件文案时，需同步更新 docs/components/locale.md 与 docs/i18n/en-US/components/locale.md
 * - 本脚本只校验结构与完整性，**不校验译文质量**
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDirectExecution } from '../shared/cli.mjs'

const REPO_ROOT = join(fileURLToPath(import.meta.url), '..', '..', '..')
const LOCALE_MD_ZH = join(REPO_ROOT, 'docs', 'components', 'locale.md')
const LOCALE_MD_EN = join(REPO_ROOT, 'docs', 'i18n', 'en-US', 'components', 'locale.md')
const LOCALE_TYPES = join(REPO_ROOT, 'src', 'locale', 'types.ts')

const MD_TABLE_ROW_RE = /^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|$/
const HEADER_ROW_RE = /^\|\s*命名空间\s*\|\s*文案键\s*\|\s*消费组件\s*\|$/
const HEADER_ROW_RE_EN = /^\|\s*Namespace\s*\|\s*Keys\s*\|\s*Consuming component\s*\|$/
const SEPARATOR_RE = /^\|\s*:?-{2,}.*\|$/

/**
 * 解析 locale.md 的索引表，返回 { namespace -> { keys: string[], components: string[] } }
 */
function parseLocaleLedger(filepath) {
    const content = readFileSync(filepath, 'utf-8')
    const lines = content.split(/\r?\n/)
    const result = {}
    let inTable = false

    for (const line of lines) {
        if (HEADER_ROW_RE.test(line) || HEADER_ROW_RE_EN.test(line)) {
            inTable = true
            continue
        }
        if (!inTable) {
            continue
        }
        if (SEPARATOR_RE.test(line)) {
            continue
        }
        if (!line.startsWith('|')) {
            // 表格结束
            break
        }
        const match = line.match(MD_TABLE_ROW_RE)
        if (!match) {
            continue
        }
        const [, namespace, keys, components] = match
        const ns = namespace.trim().replace(/`/g, '')
        if (ns === '命名空间' || ns === 'Namespace' || ns.startsWith(':') || ns.startsWith('-')) {
            continue
        }
        // 解析键集合（支持反引号包裹、空格/逗号分隔）
        const keyList = keys
            .split(/[,，\s]+/)
            .map((k) => k.replace(/`/g, '').trim())
            .filter((k) => k.length > 0)
        const compList = components
            .split(/[,，\s]+/)
            .map((c) => c.replace(/`/g, '').trim())
            .filter((c) => c.length > 0)
        result[ns] = { keys: keyList, components: compList }
    }

    return result
}

/**
 * 解析 types.ts 的 CaomeiLocaleMessages 接口，返回 { namespace -> string[] }
 */
function parseLocaleTypes(filepath) {
    const content = readFileSync(filepath, 'utf-8')
    const result = {}

    // 找到 export interface CaomeiLocaleMessages { ... } 的内容
    const interfaceMatch = content.match(/export interface CaomeiLocaleMessages \{([\s\S]*?)\n\}/)
    if (!interfaceMatch) {
        throw new Error(`${filepath} 未找到 CaomeiLocaleMessages 接口定义`)
    }

    const interfaceBody = interfaceMatch[1]
    const lines = interfaceBody.split(/\r?\n/)

    let currentNamespace = null
    for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('//')) {
            continue
        }
        // 匹配命名空间：`    autoComplete: {`
        const nsMatch = trimmed.match(/^([A-Za-z][A-Za-z0-9]*): \{/)
        if (nsMatch) {
            currentNamespace = nsMatch[1]
            result[currentNamespace] = []
            continue
        }
        // 匹配键：`        empty: string`
        const keyMatch = trimmed.match(/^([A-Za-z][A-Za-z0-9]*): string/)
        if (keyMatch && currentNamespace) {
            result[currentNamespace].push(keyMatch[1])
            continue
        }
        // 匹配命名空间结束：`    }`
        if (trimmed === '}' || trimmed === '},') {
            currentNamespace = null
            continue
        }
        // 兼容单行结束
        if (trimmed === '};') {
            currentNamespace = null
        }
    }

    return result
}

function compareLedgerWithTypes(ledger, types, label) {
    const errors = []
    const ledgerNamespaces = Object.keys(ledger).sort()
    const typesNamespaces = Object.keys(types).sort()

    // 检查命名空间是否一致
    for (const ns of typesNamespaces.filter((n) => !ledgerNamespaces.includes(n))) {
        errors.push(`${label} 缺少命名空间 ${ns}（types.ts 中有、台账表中无）`)
    }
    for (const ns of ledgerNamespaces.filter((n) => !typesNamespaces.includes(n))) {
        errors.push(`${label} 多出命名空间 ${ns}（台账表中有、types.ts 中无）`)
    }

    // 检查每个命名空间的键集合
    for (const ns of typesNamespaces.filter((n) => ledgerNamespaces.includes(n))) {
        const expectedKeys = types[ns].sort()
        const actualKeys = ledger[ns].keys.sort()

        for (const key of expectedKeys.filter((k) => !actualKeys.includes(k))) {
            errors.push(`${label} 命名空间 ${ns} 缺少键 ${key}`)
        }
        for (const key of actualKeys.filter((k) => !expectedKeys.includes(k))) {
            errors.push(`${label} 命名空间 ${ns} 多出键 ${key}`)
        }

        // 消费组件非空校验（防静默收窄）
        if (!ledger[ns].components || ledger[ns].components.length === 0) {
            errors.push(`${label} 命名空间 ${ns} 的消费组件为空`)
        }
    }

    return errors
}

export function checkLocaleLedger(root = REPO_ROOT) {
    const errors = []

    // 读取台账表（中文）
    let ledgerZh
    try {
        ledgerZh = parseLocaleLedger(LOCALE_MD_ZH)
    } catch (error) {
        return {
            ok: false,
            errors: [`读取中文台账表失败：${error instanceof Error ? error.message : String(error)}`],
        }
    }

    // 读取台账表（英文）
    let ledgerEn
    try {
        ledgerEn = parseLocaleLedger(LOCALE_MD_EN)
    } catch (error) {
        return {
            ok: false,
            errors: [`读取英文台账表失败：${error instanceof Error ? error.message : String(error)}`],
        }
    }

    // 读取 types.ts 定义
    let types
    try {
        types = parseLocaleTypes(LOCALE_TYPES)
    } catch (error) {
        return {
            ok: false,
            errors: [`读取 types.ts 失败：${error instanceof Error ? error.message : String(error)}`],
        }
    }

    // 对账：中文台账表
    errors.push(...compareLedgerWithTypes(ledgerZh, types, '中文台账表'))

    // 对账：英文台账表
    errors.push(...compareLedgerWithTypes(ledgerEn, types, '英文台账表'))

    // 受检面下界校验（防静默收窄）
    const MIN_NAMESPACES = 25 // 下界（防止受检面被静默收窄）；当前实际 27 个命名空间
    if (Object.keys(types).length < MIN_NAMESPACES) {
        errors.push(`types.ts 命名空间数 ${Object.keys(types).length} 低于下界 ${MIN_NAMESPACES}：怀疑受检面被静默收窄`)
    }

    return { ok: errors.length === 0, errors }
}

if (isDirectExecution(import.meta.url)) {
    const result = checkLocaleLedger()
    if (result.ok) {
        console.info('[check-locale-ledger] 通过：台账表与 types.ts 结构一致')
        process.exit(0)
    }
    for (const error of result.errors) {
        console.error(`[check-locale-ledger][error] ${error}`)
    }
    process.exit(1)
}
