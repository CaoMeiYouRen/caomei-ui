#!/usr/bin/env node

/**
 * check-locale-keys：内建文案（`src/locale`）结构守卫。
 *
 * 以简体中文（zh-CN）为基准，校验全部已注册语种的结构一致性：
 * 1. 注册表 `caomeiLocales` 与 `src/locale/*.ts` 文案文件一一对应（不漏注册、不悬空注册），
 *    且注册项的语言标识与文案文件名同源（防 `'ja-JP': koKR` 一类错配）；
 * 2. 命名空间集合与基准一致；
 * 3. 每个命名空间的键集合与基准一致（缺键 / 多键即失败）；
 * 4. 每条文案的占位符集合与基准一致（`{page}` / `{hotkey}` 不得漏写或改名）；
 * 5. 文案值必须是非空白字符串（下游注入空白串会被 Reka 拒绝，内建文案同理）。
 *
 * 本脚本只校验结构与占位符，**不校验译文质量**——译文质量以人工复核结论为准。
 *
 * 用法：
 *   node scripts/governance/check-locale-keys.mjs   # 有问题 exit 1
 *
 * 维护：
 * - 新增组件文案时，需同步补齐全部已注册语种；漏译会被本脚本拦截。
 * - 文案模块允许使用**顶格（行首列 0）**的 `//` 行注释（如文件头说明）：解析器只忽略顶格 `//`，
 *   缩进 `//`、块注释与行尾注释都会被判为无法解析，属有意的响亮失败——改注释形态前须同步此处。
 * - `index.ts` / `types.ts` 与 `*.test.ts` / `*.spec.ts` 不参与注册检查。
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDirectExecution } from '../shared/cli.mjs'

export const REPO_ROOT = join(fileURLToPath(import.meta.url), '..', '..', '..')

/** 基准语种文件（键集合与占位符的比对基准）。 */
export const BASELINE_FILE = 'zh-cn.ts'

/** 不参与「已注册文案文件」检查的模块：注册表、类型定义与同目录测试。 */
const NON_LOCALE_FILE_RE = /^(?:index|types)\.ts$|\.(?:test|spec)\.ts$/

const NAMESPACE_RE = /^ {4}([A-Za-z][A-Za-z0-9]*): \{$/
const KEY_RE = /^ {8}([A-Za-z][A-Za-z0-9]*): '((?:[^'\\]|\\.)*)',$/
const NAMESPACE_END_RE = /^ {4}\},$/
const MESSAGES_HEADER_RE = /^const \w+: CaomeiLocaleMessages = \{$/
const IMPORT_RE = /^import\s+([A-Za-z_$][\w$]*)\s+from\s+'(\.\/[^']+)'$/gm
const REGISTRY_RE = /^export const caomeiLocales = \{([\s\S]*?)\n\} as const/m
const REGISTRY_ENTRY_RE = /^ {4}'([^']+)': ([A-Za-z_$][\w$]*),$/gm
const DEFAULT_LOCALE_RE = /^export const defaultLocale: CaomeiLocale = '([^']+)'$/m

/** 还原单引号字符串中的转义（`\'` / `\\`）。 */
function unescapeValue(value) {
    return value.replace(/\\(['\\])/g, '$1')
}

/**
 * 提取文案值中的占位符名称（`{name}`）。
 * 返回排序后的去重数组，便于跨语种直接比对。
 */
export function extractPlaceholders(value) {
    return [...new Set([...value.matchAll(/\{([A-Za-z][A-Za-z0-9]*)\}/g)].map((m) => m[1]))].sort()
}

/**
 * 解析单个语种文案模块，返回 `{ 命名空间: { 键: 值 } }`。
 *
 * 只接受仓库既定的格式化形态（4 / 8 空格缩进、单引号字符串）；
 * 遇到无法识别的行直接抛错，避免「静默漏解析 → 守卫假通过」。
 */
export function parseLocaleSource(text, file = 'locale.ts') {
    const namespaces = {}
    let current = null

    const lines = text.split(/\r?\n/)
    for (const [index, line] of lines.entries()) {
        if (line.trim() === '' || line.startsWith('//')) {
            continue
        }

        const namespaceMatch = line.match(NAMESPACE_RE)
        if (namespaceMatch) {
            current = namespaceMatch[1]
            namespaces[current] = {}
            continue
        }

        const keyMatch = line.match(KEY_RE)
        if (keyMatch && current !== null) {
            namespaces[current][keyMatch[1]] = unescapeValue(keyMatch[2])
            continue
        }

        if (line === '}') {
            // 文案对象结束；后续仅剩 `export default`。
            continue
        }

        if (NAMESPACE_END_RE.test(line)) {
            current = null
            continue
        }

        if (MESSAGES_HEADER_RE.test(line) || /^import\b/.test(line) || /^export default\b/.test(line)) {
            current = null
            continue
        }

        if (keyMatch && current === null) {
            throw new Error(`${file}:${index + 1} 文案键出现在命名空间之外：${line.trim()}`)
        }

        throw new Error(`${file}:${index + 1} 无法解析的文案行：${line}`)
    }

    return namespaces
}

/** 解析注册表：返回 `{ imports, locales }`，`locales` 为 `[{ id, file }]`（按注册顺序）。 */
export function parseLocaleRegistry(text, file = 'src/locale/index.ts') {
    const imports = new Map()
    for (const match of text.matchAll(IMPORT_RE)) {
        imports.set(match[1], match[2])
    }

    const block = text.match(REGISTRY_RE)
    if (!block) {
        throw new Error(`${file} 未找到 caomeiLocales 注册表`)
    }

    const locales = []
    for (const match of block[1].matchAll(REGISTRY_ENTRY_RE)) {
        const importPath = imports.get(match[2])
        if (!importPath) {
            throw new Error(`${file} 的注册项 '${match[1]}' 指向未知导入：${match[2]}`)
        }
        // 只接受 `./<file>` 形态：拒绝 `..` 穿越与子目录，避免读取 src/locale 之外的模块
        if (importPath.split('/').length !== 2 || importPath.includes('..')) {
            throw new Error(`${file} 的注册项 '${match[1]}' 导入路径非法：${importPath}`)
        }
        locales.push({ id: match[1], file: `${importPath.slice(2)}.ts` })
    }

    const defaultLocale = text.match(DEFAULT_LOCALE_RE)?.[1]
    if (!defaultLocale) {
        throw new Error(`${file} 未找到 defaultLocale 声明`)
    }

    return { locales, defaultLocale }
}

/** 比对单条文案的占位符，返回错误信息列表。 */
function comparePlaceholders(label, expected, actual) {
    const expectedPlaceholders = extractPlaceholders(expected)
    const actualPlaceholders = extractPlaceholders(actual)
    if (expectedPlaceholders.join(',') === actualPlaceholders.join(',')) {
        return []
    }

    const described = (list) => (list.length > 0 ? list.map((name) => `{${name}}`).join(' ') : '（无）')
    return [
        `${label} 占位符与基准不一致：期望 ${described(expectedPlaceholders)}，实际 ${described(actualPlaceholders)}`,
    ]
}

/** 比对单语种与基准，返回错误信息列表。 */
export function compareLocaleKeys(localeId, file, baseline, messages) {
    const errors = []
    const prefix = `${localeId}（${file}）`
    const baselineNamespaces = Object.keys(baseline).sort()
    const namespaces = Object.keys(messages).sort()

    for (const namespace of baselineNamespaces.filter((name) => !namespaces.includes(name))) {
        errors.push(`${prefix}缺少命名空间 ${namespace}`)
    }
    for (const namespace of namespaces.filter((name) => !baselineNamespaces.includes(name))) {
        errors.push(`${prefix}多出命名空间 ${namespace}`)
    }

    for (const namespace of baselineNamespaces.filter((name) => namespaces.includes(name))) {
        const expectedKeys = Object.keys(baseline[namespace]).sort()
        const actualKeys = Object.keys(messages[namespace]).sort()

        for (const key of expectedKeys.filter((name) => !actualKeys.includes(name))) {
            errors.push(`${prefix}命名空间 ${namespace} 缺少键 ${key}`)
        }
        for (const key of actualKeys.filter((name) => !expectedKeys.includes(name))) {
            errors.push(`${prefix}命名空间 ${namespace} 多出键 ${key}`)
        }

        for (const key of expectedKeys.filter((name) => actualKeys.includes(name))) {
            const label = `${prefix}命名空间 ${namespace} 的键 ${key}`
            const actual = messages[namespace][key]
            if (actual.trim() === '') {
                errors.push(`${label} 为空白字符串`)
                continue
            }
            errors.push(...comparePlaceholders(label, baseline[namespace][key], actual))
        }
    }

    return errors
}

/** 执行校验，返回 `{ ok, errors, details }`。 */
export function checkLocaleKeys(root = REPO_ROOT) {
    const errors = []
    const details = {}
    const dir = join(root, 'src', 'locale')
    const rel = (file) => relative(root, file).split('\\').join('/')

    const indexPath = join(dir, 'index.ts')
    if (!existsSync(indexPath)) {
        return { ok: false, errors: [`缺少文案注册表：${rel(indexPath)}`], details }
    }

    let registry
    try {
        registry = parseLocaleRegistry(readFileSync(indexPath, 'utf8'), rel(indexPath))
    } catch (error) {
        return {
            ok: false,
            errors: [error instanceof Error ? error.message : String(error)],
            details,
        }
    }

    if (registry.locales.length === 0) {
        errors.push(`${rel(indexPath)} 的 caomeiLocales 未注册任何语种`)
    }
    if (!registry.locales.some((locale) => locale.id === registry.defaultLocale)) {
        errors.push(
            `defaultLocale '${registry.defaultLocale}' 未在 caomeiLocales 注册`,
        )
    }

    const baselineEntry = registry.locales.find((locale) => locale.file === BASELINE_FILE)
    if (!baselineEntry) {
        errors.push(`基准语种文件 src/locale/${BASELINE_FILE} 未在 caomeiLocales 注册`)
    }

    const baselinePath = join(dir, BASELINE_FILE)
    if (!existsSync(baselinePath)) {
        return { ok: false, errors: [`缺少基准语种文案：src/locale/${BASELINE_FILE}`], details }
    }

    let baseline
    try {
        baseline = parseLocaleSource(readFileSync(baselinePath, 'utf8'), `src/locale/${BASELINE_FILE}`)
    } catch (error) {
        return {
            ok: false,
            errors: [error instanceof Error ? error.message : String(error)],
            details,
        }
    }

    details.locales = []
    for (const locale of registry.locales) {
        const file = `src/locale/${locale.file}`
        const absolute = join(dir, locale.file)

        const expectedFile = `${locale.id.toLowerCase()}.ts`
        if (locale.file !== expectedFile) {
            errors.push(
                `注册项 ${locale.id} 指向 ${file}，应为 src/locale/${expectedFile}`
                + '（语言标识须与文案文件名同源，避免语种与文案错配）',
            )
        }

        if (!existsSync(absolute)) {
            errors.push(`注册了语种 ${locale.id} 但缺少文案文件 ${file}`)
            continue
        }

        let messages
        try {
            messages = parseLocaleSource(readFileSync(absolute, 'utf8'), file)
        } catch (error) {
            errors.push(error instanceof Error ? error.message : String(error))
            continue
        }

        errors.push(...compareLocaleKeys(locale.id, file, baseline, messages))
        details.locales.push({
            id: locale.id,
            file,
            namespaces: Object.keys(messages).length,
            keys: Object.values(messages).reduce((total, group) => total + Object.keys(group).length, 0),
        })
    }

    const scannedFiles = readdirSync(dir).filter(
        (name) => name.endsWith('.ts') && !NON_LOCALE_FILE_RE.test(name),
    )
    for (const file of scannedFiles) {
        if (registry.locales.some((locale) => locale.file === file)) {
            continue
        }
        errors.push(`src/locale/${file} 未在 ${rel(indexPath)} 的 caomeiLocales 注册`)
    }

    details.baseline = {
        file: `src/locale/${BASELINE_FILE}`,
        id: baselineEntry?.id,
        namespaces: Object.keys(baseline).length,
        keys: Object.values(baseline).reduce((total, group) => total + Object.keys(group).length, 0),
    }

    return { ok: errors.length === 0, errors, details }
}

if (isDirectExecution(import.meta.url)) {
    const result = checkLocaleKeys()

    if (result.ok) {
        const summary = result.details.locales
            ?.map((locale) => `${locale.id} ${locale.keys} 条`)
            .join(' / ')
        console.info(
            `[check-locale-keys] 通过：基准 ${result.details.baseline?.id ?? BASELINE_FILE} `
            + `${result.details.baseline?.namespaces} 个命名空间 / `
            + `${result.details.baseline?.keys} 条文案；已注册语种 ${summary}`,
        )
        process.exit(0)
    }

    for (const error of result.errors) {
        console.error(`[check-locale-keys][error] ${error}`)
    }
    process.exit(1)
}
