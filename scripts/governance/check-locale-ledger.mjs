#!/usr/bin/env node
/**
 * check-locale-ledger：内置文案台账 + 语言清单机检对账
 *
 * 三个维度：
 * 1. `docs/components/locale.md` 的「命名空间 → 文案键」索引表 ↔ `src/locale/types.ts` 接口定义
 * 2. `docs/i18n/en-US/components/locale.md`（英文版）同上
 * 3. 中英文档的「预注册 / 按需引入」语言表与子路径表 ↔ `src/locale/index.ts` 的
 *    `CaomeiLocale` 联合 + `PRE_REGISTERED_LOCALES`
 *
 * 规则：
 * - 台账表中的命名空间集合必须与 types.ts 接口字段完全一致（不漏、不多）
 * - 台账表中每个命名空间的键集合必须与 types.ts 对应接口字段完全一致
 * - 台账表中每个命名空间的「消费组件」列应非空（防静默收窄）
 * - 文档的预注册集合 / 按需集合 / 子路径映射必须与代码完全一致（双向）
 * - 受检面下界：命名空间数、预注册数、按需语言数、子路径行数不得低于常量
 *
 * 本脚本只校验结构、完整性与清单对齐，**不校验译文质量**。
 *
 * 用法：
 *   node scripts/governance/check-locale-ledger.mjs   # 有问题 exit 1
 *
 * 维护：
 * - 新增组件文案时，需同步更新 `docs/components/locale.md` 与英文页
 * - 新增语言时，需同步更新中英文档的「按需引入语言」两张表
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDirectExecution } from '../shared/cli.mjs'
import { parseLocaleRegistry } from './check-locale-keys.mjs'

const REPO_ROOT = join(fileURLToPath(import.meta.url), '..', '..', '..')

const LOCALE_MD_ZH = 'docs/components/locale.md'
const LOCALE_MD_EN = 'docs/i18n/en-US/components/locale.md'
const LOCALE_TYPES = 'src/locale/types.ts'
const LOCALE_INDEX = 'src/locale/index.ts'

/** 受检面下界：命名空间数（防台账受检面被静默收窄）。 */
export const MIN_NAMESPACES = 28

/** 受检面下界：文档预注册语言数。 */
export const MIN_PRE_REGISTERED_LOCALES = 2

/** 受检面下界：文档按需语言数。 */
export const MIN_ON_DEMAND_LOCALES = 8

/** 受检面下界：文档子路径表行数。 */
export const MIN_SUBPATH_ROWS = 8

const LEDGER_HEADER_RE = /^\|\s*命名空间\s*\|\s*文案键\s*\|\s*消费组件\s*\|$/
const LEDGER_HEADER_RE_EN = /^\|\s*Namespace\s*\|\s*Keys\s*\|\s*Consuming component\s*\|$/
const LANG_HEADER_RE = /^\|\s*类别\s*\|\s*语言\s*\|\s*取用方式\s*\|$/
const LANG_HEADER_RE_EN = /^\|\s*Group\s*\|\s*Locales\s*\|\s*How to use\s*\|$/
const SUBPATH_HEADER_RE = /^\|\s*语言标识\s*\|\s*子路径\s*\|$/
const SUBPATH_HEADER_RE_EN = /^\|\s*Locale id\s*\|\s*Subpath\s*\|$/
const SEPARATOR_RE = /^\|\s*:?-{2,}.*\|$/
const INLINE_CODE_RE = /`([^`]+)`/g

/**
 * 解析 Markdown 表格：从匹配 `headers` 的表头行开始，读到空行或非表格行为止。
 *
 * @returns {string[][] | null} 每行的单元格文本；表头不存在时返回 null。
 */
function parseTable(content, headers) {
    const lines = content.split(/\r?\n/)
    const rows = []
    let inTable = false

    for (const line of lines) {
        if (!inTable) {
            if (headers.some((header) => header.test(line))) {
                inTable = true
            }
            continue
        }

        if (line.trim() === '' || !line.startsWith('|')) {
            break
        }
        if (SEPARATOR_RE.test(line)) {
            continue
        }
        if (!line.endsWith('|')) {
            continue
        }
        rows.push(line.slice(1, -1).split('|').map((cell) => cell.trim()))
    }

    return inTable ? rows : null
}

/** 从单元格中提取反引号包裹的字面量；无反引号时按中英文逗号 / 顿号拆分。 */
function extractCodes(cell) {
    const codes = [...cell.matchAll(INLINE_CODE_RE)].map((match) => match[1].trim()).filter(Boolean)
    if (codes.length > 0) {
        return codes
    }
    return cell
        .split(/[、,，]/)
        .map((item) => item.trim())
        .filter(Boolean)
}

/** 解析「命名空间 → 文案键 → 消费组件」台账表。 */
export function parseLocaleLedger(content) {
    const rows = parseTable(content, [LEDGER_HEADER_RE, LEDGER_HEADER_RE_EN])
    if (!rows) {
        return null
    }

    const result = {}
    for (const cells of rows) {
        if (cells.length < 3) {
            continue
        }
        const namespace = cells[0].replace(/`/g, '').trim()
        if (!namespace || namespace === '命名空间' || namespace === 'Namespace') {
            continue
        }
        const keys = cells[1]
            .split(/[,，\s]+/)
            .map((key) => key.replace(/`/g, '').trim())
            .filter(Boolean)
        const components = cells[2]
            .split(/[,，\s]+/)
            .map((component) => component.replace(/`/g, '').trim())
            .filter(Boolean)
        result[namespace] = { keys, components }
    }
    return result
}

/** 解析 `CaomeiLocaleMessages` 接口，返回 `{ namespace: string[] }`。 */
export function parseLocaleTypes(content) {
    const interfaceMatch = content.match(/export interface CaomeiLocaleMessages \{([\s\S]*?)\n\}/)
    if (!interfaceMatch) {
        throw new Error('未找到 CaomeiLocaleMessages 接口定义')
    }

    const result = {}
    let currentNamespace = null
    for (const rawLine of interfaceMatch[1].split(/\r?\n/)) {
        const line = rawLine.trim()
        if (!line || line.startsWith('//')) {
            continue
        }
        const namespaceMatch = line.match(/^([A-Za-z][A-Za-z0-9]*): \{/)
        if (namespaceMatch) {
            currentNamespace = namespaceMatch[1]
            result[currentNamespace] = []
            continue
        }
        const keyMatch = line.match(/^([A-Za-z][A-Za-z0-9]*): string/)
        if (keyMatch && currentNamespace) {
            result[currentNamespace].push(keyMatch[1])
            continue
        }
        if (line === '}' || line === '},' || line === '};') {
            currentNamespace = null
        }
    }
    return result
}

/**
 * 解析「预注册 / 按需引入」语言表与子路径表。
 *
 * @returns {{
 *   preRegistered: string[],
 *   onDemand: string[],
 *   subpaths: Map<string, string>,
 *   errors: string[],
 * }}
 */
export function parseLocaleLanguageTables(content) {
    const errors = []
    const preRegistered = []
    const onDemand = []
    const subpaths = new Map()

    const languageRows = parseTable(content, [LANG_HEADER_RE, LANG_HEADER_RE_EN])
    if (!languageRows) {
        errors.push('未找到「预注册 / 按需引入」语言表')
    } else {
        let sawPreRegistered = false
        let sawOnDemand = false
        for (const cells of languageRows) {
            if (cells.length < 3) {
                continue
            }
            const category = cells[0]
            const codes = extractCodes(cells[1])
            if (/预注册|Pre-registered/i.test(category)) {
                sawPreRegistered = true
                preRegistered.push(...codes)
            } else if (/按需|On-demand/i.test(category)) {
                sawOnDemand = true
                onDemand.push(...codes)
            } else {
                errors.push(`语言表存在未识别类别行：${category}`)
            }
        }
        if (!sawPreRegistered) {
            errors.push('语言表缺少「预注册」行')
        }
        if (!sawOnDemand) {
            errors.push('语言表缺少「按需引入」行')
        }
    }

    const subpathRows = parseTable(content, [SUBPATH_HEADER_RE, SUBPATH_HEADER_RE_EN])
    if (!subpathRows) {
        errors.push('未找到语言子路径表')
    } else {
        for (const cells of subpathRows) {
            if (cells.length < 2) {
                continue
            }
            const localeId = extractCodes(cells[0])[0]
            const subpath = extractCodes(cells[1])[0]
            if (!localeId || !subpath) {
                errors.push(`子路径表存在无法解析的行：${cells.join(' | ')}`)
                continue
            }
            if (subpaths.has(localeId)) {
                errors.push(`子路径表存在重复语言标识：${localeId}`)
                continue
            }
            subpaths.set(localeId, subpath)
        }
    }

    return { preRegistered, onDemand, subpaths, errors }
}

/** 比较两个字符串列表，返回缺失 / 多出的错误。 */
function compareLists(actual, expected, label) {
    const errors = []
    const missing = expected.filter((item) => !actual.includes(item))
    const extra = actual.filter((item) => !expected.includes(item))
    if (missing.length > 0) {
        errors.push(`${label}缺少 ${missing.join(' / ')}`)
    }
    if (extra.length > 0) {
        errors.push(`${label}多出 ${extra.join(' / ')}`)
    }
    return errors
}

/** 比较台账表与 types.ts 的命名空间 / 键集合。 */
function compareLedgerWithTypes(ledger, types, label) {
    const errors = []
    const ledgerNamespaces = Object.keys(ledger).sort()
    const typesNamespaces = Object.keys(types).sort()

    for (const namespace of typesNamespaces.filter((name) => !ledgerNamespaces.includes(name))) {
        errors.push(`${label} 缺少命名空间 ${namespace}（types.ts 中有、台账表中无）`)
    }
    for (const namespace of ledgerNamespaces.filter((name) => !typesNamespaces.includes(name))) {
        errors.push(`${label} 多出命名空间 ${namespace}（台账表中有、types.ts 中无）`)
    }

    for (const namespace of typesNamespaces.filter((name) => ledgerNamespaces.includes(name))) {
        const expectedKeys = [...types[namespace]].sort()
        const actualKeys = [...ledger[namespace].keys].sort()

        for (const key of expectedKeys.filter((item) => !actualKeys.includes(item))) {
            errors.push(`${label} 命名空间 ${namespace} 缺少键 ${key}`)
        }
        for (const key of actualKeys.filter((item) => !expectedKeys.includes(item))) {
            errors.push(`${label} 命名空间 ${namespace} 多出键 ${key}`)
        }
        if (ledger[namespace].components.length === 0) {
            errors.push(`${label} 命名空间 ${namespace} 的消费组件为空`)
        }
    }

    return errors
}

/** 比较文档语言清单与代码注册面。 */
function compareLanguageTables(tables, registry, label) {
    const errors = [...tables.errors]
    const expectedOnDemand = registry.union.filter((id) => !registry.preRegistered.includes(id))
    const expectedSubpaths = new Map(
        expectedOnDemand.map((id) => [id, `caomei-ui/locale/${id.toLowerCase()}`]),
    )

    errors.push(...compareLists(tables.preRegistered, registry.preRegistered, `${label} 预注册集合`))
    errors.push(...compareLists(tables.onDemand, expectedOnDemand, `${label} 按需引入集合`))

    for (const [localeId, expectedSubpath] of expectedSubpaths) {
        const actualSubpath = tables.subpaths.get(localeId)
        if (!actualSubpath) {
            errors.push(`${label} 子路径表缺少 ${localeId}`)
        } else if (actualSubpath !== expectedSubpath) {
            errors.push(`${label} 子路径表 ${localeId} 指向 ${actualSubpath}，应为 ${expectedSubpath}`)
        }
    }
    for (const [localeId, subpath] of tables.subpaths) {
        if (!expectedSubpaths.has(localeId)) {
            errors.push(`${label} 子路径表多出 ${localeId}（${subpath}）`)
        }
    }

    return errors
}

/**
 * 执行台账 + 语言清单对账。
 *
 * @param {string} [root] 仓库根（测试可传入夹具目录）
 * @param {object} [options] 受检面下界覆盖（仅供测试）
 */
export function checkLocaleLedger(root = REPO_ROOT, options = {}) {
    const {
        minNamespaces = MIN_NAMESPACES,
        minPreRegistered = MIN_PRE_REGISTERED_LOCALES,
        minOnDemand = MIN_ON_DEMAND_LOCALES,
        minSubpaths = MIN_SUBPATH_ROWS,
    } = options
    const errors = []
    const details = {}

    const read = (relativePath) => readFileSync(join(root, relativePath), 'utf8')

    let types
    let registry
    let languagesZh
    let languagesEn

    try {
        types = parseLocaleTypes(read(LOCALE_TYPES))
    } catch (error) {
        return {
            ok: false,
            errors: [`读取 ${LOCALE_TYPES} 失败：${error instanceof Error ? error.message : String(error)}`],
            details,
        }
    }

    try {
        registry = parseLocaleRegistry(read(LOCALE_INDEX), LOCALE_INDEX)
    } catch (error) {
        return {
            ok: false,
            errors: [`读取 ${LOCALE_INDEX} 失败：${error instanceof Error ? error.message : String(error)}`],
            details,
        }
    }

    const docs = [
        { label: '中文台账表', path: LOCALE_MD_ZH },
        { label: '英文台账表', path: LOCALE_MD_EN },
    ]
    const parsedDocs = []
    for (const doc of docs) {
        let content
        try {
            content = read(doc.path)
        } catch (error) {
            return {
                ok: false,
                errors: [`读取${doc.label}失败：${error instanceof Error ? error.message : String(error)}`],
                details,
            }
        }
        const ledger = parseLocaleLedger(content)
        if (!ledger) {
            errors.push(`${doc.label}未找到「命名空间 / 文案键 / 消费组件」索引表`)
            continue
        }
        if (Object.keys(ledger).length === 0) {
            errors.push(`${doc.label}「命名空间 / 文案键 / 消费组件」索引表为空`)
            continue
        }
        parsedDocs.push({ ...doc, ledger })
    }

    for (const doc of parsedDocs) {
        errors.push(...compareLedgerWithTypes(doc.ledger, types, doc.label))
    }

    const languageDocs = [
        { label: '中文文档', path: LOCALE_MD_ZH },
        { label: '英文文档', path: LOCALE_MD_EN },
    ]
    for (const doc of languageDocs) {
        let content
        try {
            content = read(doc.path)
        } catch (error) {
            return {
                ok: false,
                errors: [`读取${doc.label}失败：${error instanceof Error ? error.message : String(error)}`],
                details,
            }
        }
        const tables = parseLocaleLanguageTables(content)
        if (doc.label === '中文文档') {
            languagesZh = tables
        } else {
            languagesEn = tables
        }
        errors.push(...compareLanguageTables(tables, registry, doc.label))
    }

    const namespaceCount = Object.keys(types).length
    if (namespaceCount < minNamespaces) {
        errors.push(`types.ts 命名空间数 ${namespaceCount} 低于下界 ${minNamespaces}：怀疑受检面被静默收窄`)
    }

    const expectedOnDemand = registry.union.filter((id) => !registry.preRegistered.includes(id))
    const expectedSubpaths = expectedOnDemand.map((id) => `caomei-ui/locale/${id.toLowerCase()}`)
    details.namespaces = namespaceCount
    details.preRegistered = registry.preRegistered
    details.onDemand = expectedOnDemand
    details.subpaths = expectedSubpaths
    details.docs = {
        zh: languagesZh,
        en: languagesEn,
    }

    if (languagesZh) {
        if (languagesZh.preRegistered.length < minPreRegistered) {
            errors.push(`中文文档预注册语言仅 ${languagesZh.preRegistered.length} 项，低于下界 ${minPreRegistered}`)
        }
        if (languagesZh.onDemand.length < minOnDemand) {
            errors.push(`中文文档按需语言仅 ${languagesZh.onDemand.length} 项，低于下界 ${minOnDemand}`)
        }
        if (languagesZh.subpaths.size < minSubpaths) {
            errors.push(`中文文档子路径表仅 ${languagesZh.subpaths.size} 行，低于下界 ${minSubpaths}`)
        }
    }
    if (languagesEn) {
        if (languagesEn.preRegistered.length < minPreRegistered) {
            errors.push(`英文文档预注册语言仅 ${languagesEn.preRegistered.length} 项，低于下界 ${minPreRegistered}`)
        }
        if (languagesEn.onDemand.length < minOnDemand) {
            errors.push(`英文文档按需语言仅 ${languagesEn.onDemand.length} 项，低于下界 ${minOnDemand}`)
        }
        if (languagesEn.subpaths.size < minSubpaths) {
            errors.push(`英文文档子路径表仅 ${languagesEn.subpaths.size} 行，低于下界 ${minSubpaths}`)
        }
    }

    return { ok: errors.length === 0, errors, details }
}

if (isDirectExecution(import.meta.url)) {
    const result = checkLocaleLedger()
    if (result.ok) {
        console.info(
            `[check-locale-ledger] 通过：${result.details.namespaces} 个命名空间；`
            + `预注册 ${result.details.preRegistered.join(' / ')}；`
            + `按需 ${result.details.onDemand.length} 语 / ${result.details.subpaths.length} 条子路径`,
        )
        process.exit(0)
    }
    for (const error of result.errors) {
        console.error(`[check-locale-ledger][error] ${error}`)
    }
    process.exit(1)
}
