#!/usr/bin/env node

/**
 * check-locale-keys：内建文案（`src/locale`）结构与**分发面**守卫。
 *
 * 以简体中文（zh-CN）为基准，校验全部内建语种的结构一致性，并校验「内建语言集合 ↔
 * 文案文件 ↔ 语言子路径登记」三者一一对应：
 *
 * 1. **语言集合与注册表**：
 *    a. `CaomeiLocale` 为**显式声明的字面量联合**（不由注册表派生）——注册表在运行期可变，
 *       派生式联合会随注册表内容漂移并破坏各处 `Record<CaomeiLocale, string>` 全函数映射；
 *    b. 注册表 `caomeiLocales` 字面量的键集合 **等值于** `PRE_REGISTERED_LOCALES`（不是「至少」：
 *       预注册集合被静默扩大即等同于按需引入的收益归零）；
 *    c. `defaultLocale` 必须同时是联合成员与预注册成员；基线文件与 `defaultLocale` 同源。
 * 2. **语言集合 ↔ 文案文件一一对应**：联合的每个成员须有同名文案文件（小写化比对），
 *    且 `src/locale/*.ts` 中每个语言文件都须在联合内声明（双向，防漏发与悬空）。
 * 3. **结构一致性**：命名空间集合、每个命名空间的键集合、每条文案的占位符集合与基准一致；
 *    文案值必须是非空白字符串。**遍历集合为「联合的全部成员」**（不是注册表成员）——
 *    按需引入的语种退出注册表后仍须逐条比对，否则键位守卫会静默收窄。
 * 4. **语言子路径登记（分发面）**：联合中**非预注册**的每个成员，须同时登记于
 *    `package.json` 的 `exports`（`./locale/<code>`）与 `tsdown.config.ts` 的 `entry`
 *    （`'locale/<code>'`），并双向校验（登记项须对应存在的语言文件，无悬空登记）。
 * 5. **受检面下界**：联合成员数与子路径登记数均不得低于下界常量（防约定形态被削弱后静默通过）。
 *
 * 本脚本只校验结构、占位符与分发登记，**不校验译文质量**——译文质量以人工复核结论为准。
 *
 * 用法：
 *   node scripts/governance/check-locale-keys.mjs   # 有问题 exit 1
 *
 * 维护：
 * - 新增组件文案时，需同步补齐**全部内建语种**；漏译会被本脚本拦截。
 * - 新增语言时：① 在 `CaomeiLocale` 联合追加成员；② 决定是否预注册（在 `PRE_REGISTERED_LOCALES`
 *   与注册表字面量中成对增删）；③ 非预注册者须补 `package.json` 子路径与 `tsdown.config.ts` 入口。
 * - 文案模块允许 `//` 行注释（顶格或缩进）、行尾 `//` 注释与 `/* ... *\/` 块注释：解析前会**字符串感知**地
 *   剥离注释（单引号字符串内的 `//` / `/*` 不会被误判为注释）。除注释与既定格式外的行仍会被判为无法解析，
 *   属有意的响亮失败——改文案格式前须同步此处。
 * - `index.ts` / `types.ts` 与 `*.test.ts` / `*.spec.ts` 不参与注册检查。
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDirectExecution } from '../shared/cli.mjs'

export const REPO_ROOT = join(fileURLToPath(import.meta.url), '..', '..', '..')

/** 基准语种文件（键集合与占位符的比对基准）。 */
export const BASELINE_FILE = 'zh-cn.ts'

/** 预注册集合常量名（注册表初值的**单一事实源**）。 */
export const PRE_REGISTERED_CONST = 'PRE_REGISTERED_LOCALES'

/** 语言子路径导出的前缀（`package.json` 的 `exports` 键）。 */
export const SUBPATH_EXPORT_PREFIX = './locale/'

/** 受检面下界：联合成员数不得低于此值（防内建语言集合被静默收窄）。 */
export const MIN_UNION_LOCALES = 5

/** 受检面下界：语言子路径登记数不得低于此值（防按需引入能力被静默移除）。 */
export const MIN_SUBPATH_LOCALES = 3

/** 不参与「已注册文案文件」检查的模块：注册表、类型定义与同目录测试。 */
const NON_LOCALE_FILE_RE = /^(?:index|types)\.ts$|\.(?:test|spec)\.ts$/

const NAMESPACE_RE = /^ {4}([A-Za-z][A-Za-z0-9]*): \{$/
const KEY_RE = /^ {8}([A-Za-z][A-Za-z0-9]*): '((?:[^'\\]|\\.)*)',$/
const NAMESPACE_END_RE = /^ {4}\},$/
const MESSAGES_HEADER_RE = /^const \w+: CaomeiLocaleMessages = \{$/
const IMPORT_RE = /^import\s+([A-Za-z_$][\w$]*)\s+from\s+'(\.\/[^']+)'$/gm

/** 注册表声明：允许可选类型注解（`Partial<Record<CaomeiLocale, CaomeiLocaleMessages>>`）。 */
const REGISTRY_RE = /^export const caomeiLocales(?::[^=\n]*)? = \{\n([\s\S]*?)\n\}$/m
const REGISTRY_ENTRY_RE = /^ {4}'([^']+)': ([A-Za-z_$][\w$]*),$/gm

/** 预注册集合声明：`export const PRE_REGISTERED_LOCALES = ['zh-CN', 'en-US'] as const ...`。 */
const PRE_REGISTERED_RE = /^export const PRE_REGISTERED_LOCALES = \[([^\]]*)\](?: as const[^\n]*)?$/m

/** 显式语言联合声明：`export type CaomeiLocale = 'zh-CN' | 'en-US'`。 */
const LOCALE_UNION_RE = /^export type CaomeiLocale = ([^\n]+)$/m

/** 联合成员的字面量（单引号字符串）。 */
const UNION_MEMBER_RE = /'([^']+)'/g

const DEFAULT_LOCALE_RE = /^export const defaultLocale: CaomeiLocale = '([^']+)'$/m

/** `tsdown.config.ts` 的语言入口声明：`'locale/<code>': 'src/locale/<code>.ts'`。 */
const TSDOWN_ENTRY_RE = /'(locale\/[a-z-]+)':\s*'src\/locale\/([a-z-]+)\.ts'/g

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
 * 字符串感知地剥离注释：移除 `/* ... *\/` 块注释与 `// ...` 行注释，
 * 但保留单引号字符串内的内容（其中的 `//` / `/*` 不被当作注释）。
 *
 * 词法假定：单引号即字符串起点（文案模块中的游离撇号属非法 TS，由 `typecheck` 兜底）；
 * 未闭合的块注释会抛错（响亮失败，不静默吞掉其后内容）。
 */
export function stripComments(text) {
    let output = ''
    let index = 0
    let inString = false
    while (index < text.length) {
        const char = text[index]
        if (inString) {
            output += char
            if (char === '\\') {
                output += text[index + 1] ?? ''
                index += 2
                continue
            }
            if (char === '\'') {
                inString = false
            }
            index += 1
            continue
        }
        if (char === '\'') {
            inString = true
            output += char
            index += 1
            continue
        }
        if (char === '/' && text[index + 1] === '/') {
            while (index < text.length && text[index] !== '\n') {
                index += 1
            }
            continue
        }
        if (char === '/' && text[index + 1] === '*') {
            index += 2
            let closed = false
            while (index < text.length) {
                if (text[index] === '*' && text[index + 1] === '/') {
                    closed = true
                    index += 2
                    break
                }
                index += 1
            }
            if (!closed) {
                throw new Error('存在未闭合的块注释')
            }
            continue
        }
        output += char
        index += 1
    }
    return output
}

/**
 * 解析单个语种文案模块，返回 `{ 命名空间: { 键: 值 } }`。
 *
 * 解析前先字符串感知地剥离注释（`//` 行注释 / 行尾注释、`/* ... *\/` 块注释）；
 * 其余只接受仓库既定的格式化形态（4 / 8 空格缩进、单引号字符串）；
 * 遇到无法识别的行直接抛错，避免「静默漏解析 → 守卫假通过」。
 */
export function parseLocaleSource(text, file = 'locale.ts') {
    const namespaces = {}
    let current = null

    const lines = stripComments(text).split(/\r?\n/)
    for (const [index, line] of lines.entries()) {
        const code = line.trimEnd()
        if (code.trim() === '') {
            continue
        }

        const namespaceMatch = code.match(NAMESPACE_RE)
        if (namespaceMatch) {
            if (current !== null) {
                throw new Error(`${file}:${index + 1} 命名空间未闭合即开启新命名空间：${namespaceMatch[1]}`)
            }
            current = namespaceMatch[1]
            namespaces[current] = {}
            continue
        }

        const keyMatch = code.match(KEY_RE)
        if (keyMatch && current !== null) {
            if (Object.prototype.hasOwnProperty.call(namespaces[current], keyMatch[1])) {
                throw new Error(`${file}:${index + 1} 重复的文案键：${current}.${keyMatch[1]}`)
            }
            namespaces[current][keyMatch[1]] = unescapeValue(keyMatch[2])
            continue
        }

        if (code === '}') {
            // 文案对象结束；后续仅剩 `export default`。
            continue
        }

        if (NAMESPACE_END_RE.test(code)) {
            current = null
            continue
        }

        if (MESSAGES_HEADER_RE.test(code) || /^import\b/.test(code) || /^export default\b/.test(code)) {
            current = null
            continue
        }

        if (keyMatch && current === null) {
            throw new Error(`${file}:${index + 1} 文案键出现在命名空间之外：${code.trim()}`)
        }

        throw new Error(`${file}:${index + 1} 无法解析的文案行：${code}`)
    }

    return namespaces
}

/**
 * 解析注册表模块，返回 `{ locales, defaultLocale, preRegistered, union }`。
 *
 * - `locales`：注册表字面量成员 `[{ id, file }]`（按声明顺序）；
 * - `preRegistered`：`PRE_REGISTERED_LOCALES` 数组的字面量成员（按声明顺序）；
 * - `union`：`CaomeiLocale` 显式联合的字面量成员（按声明顺序）。
 */
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

    const preRegisteredBlock = text.match(PRE_REGISTERED_RE)
    const preRegistered = preRegisteredBlock
        ? [...preRegisteredBlock[1].matchAll(UNION_MEMBER_RE)].map((match) => match[1])
        : []

    const unionBlock = text.match(LOCALE_UNION_RE)
    const union = unionBlock
        ? [...unionBlock[1].matchAll(UNION_MEMBER_RE)].map((match) => match[1])
        : []

    const defaultLocale = text.match(DEFAULT_LOCALE_RE)?.[1]
    if (!defaultLocale) {
        throw new Error(`${file} 未找到 defaultLocale 声明`)
    }

    return { locales, defaultLocale, preRegistered, union }
}

/** 从仓库根读取语言子路径登记（`package.json` 的 `exports` + `tsdown.config.ts` 的入口）。 */
export function readSubpathRegistration(root) {
    const packagePath = join(root, 'package.json')
    const tsdownPath = join(root, 'tsdown.config.ts')
    const result = { exports: [], entries: [], errors: [] }

    if (!existsSync(packagePath)) {
        result.errors.push('缺少 package.json：无法校验语言子路径导出')
    } else {
        try {
            const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'))
            result.exports = Object.keys(packageJson.exports ?? {})
                .filter((key) => key.startsWith(SUBPATH_EXPORT_PREFIX))
                .map((key) => key.slice(SUBPATH_EXPORT_PREFIX.length))
        } catch (error) {
            result.errors.push(`package.json 解析失败：${error instanceof Error ? error.message : String(error)}`)
        }
    }

    if (!existsSync(tsdownPath)) {
        result.errors.push('缺少 tsdown.config.ts：无法校验语言子路径构建入口')
    } else {
        // 剥离注释后再匹配：注释掉的入口不得被计为「已登记」（否则悬空/漏登记会静默通过）。
        const source = stripComments(readFileSync(tsdownPath, 'utf8'))
        for (const match of source.matchAll(TSDOWN_ENTRY_RE)) {
            const [, entryKey, entryFile] = match
            if (entryKey !== `locale/${entryFile}`) {
                result.errors.push(`构建入口键 ${entryKey} 与目标 src/locale/${entryFile}.ts 不同源（应为 locale/${entryFile}）`)
                continue
            }
            result.entries.push(entryFile)
        }
    }

    return result
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

    const { locales, defaultLocale, preRegistered, union } = registry
    const duplicatesOf = (list) => [...new Set(list.filter((item, index) => list.indexOf(item) !== index))]
    details.preRegistered = preRegistered
    details.union = union

    // 1a. 显式联合
    if (union.length === 0) {
        errors.push(`${rel(indexPath)} 的 CaomeiLocale 未声明任何语言（须为显式字面量联合）`)
    }
    if (union.length > 0 && union.length < MIN_UNION_LOCALES) {
        errors.push(
            `CaomeiLocale 联合仅 ${union.length} 项，低于受检面下界 ${MIN_UNION_LOCALES}：`
            + '内建语言集合被静默收窄（如确需收缩，须同步调整下界常量并说明理由）',
        )
    }

    for (const duplicated of duplicatesOf(union)) {
        errors.push(`CaomeiLocale 联合存在重复成员：${duplicated}`)
    }
    for (const duplicated of duplicatesOf(preRegistered)) {
        errors.push(`${PRE_REGISTERED_CONST} 存在重复成员：${duplicated}`)
    }
    for (const duplicated of duplicatesOf(locales.map((locale) => locale.id))) {
        errors.push(`caomeiLocales 注册表存在重复键：${duplicated}`)
    }

    // 1b. 预注册集合与注册表键集合**等值**
    if (preRegistered.length === 0) {
        errors.push(`${rel(indexPath)} 未声明 ${PRE_REGISTERED_CONST}（预注册集合的单一事实源）`)
    }
    const registryKeys = locales.map((locale) => locale.id)
    for (const id of preRegistered.filter((code) => !registryKeys.includes(code))) {
        errors.push(`预注册语言 ${id} 未在 caomeiLocales 注册表字面量中登记`)
    }
    for (const id of registryKeys.filter((code) => !preRegistered.includes(code))) {
        errors.push(
            `注册表字面量多出预注册集合之外的语种 ${id}：`
            + `非预注册语言须经 ${SUBPATH_EXPORT_PREFIX}<code> 子路径按需引入，不得默认随包根注册`,
        )
    }

    // 1c. 默认语言
    if (!preRegistered.includes(defaultLocale)) {
        errors.push(`defaultLocale '${defaultLocale}' 不在 ${PRE_REGISTERED_CONST} 内（默认语言须免注册可用）`)
    }
    if (union.length > 0 && !union.includes(defaultLocale)) {
        errors.push(`defaultLocale '${defaultLocale}' 不是 CaomeiLocale 的成员`)
    }

    const baselineEntry = locales.find((locale) => locale.file === BASELINE_FILE)
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

    // 2 + 3. 联合 ↔ 文案文件一一对应；结构一致性遍历**联合的全部成员**
    details.locales = []
    for (const id of union) {
        const expectedFile = `${id.toLowerCase()}.ts`
        const file = `src/locale/${expectedFile}`
        const absolute = join(dir, expectedFile)

        if (registryKeys.includes(id)) {
            const entry = locales.find((locale) => locale.id === id)
            if (entry && entry.file !== expectedFile) {
                errors.push(
                    `注册项 ${id} 指向 src/locale/${entry.file}，应为 ${file}`
                    + '（语言标识须与文案文件名同源，避免语种与文案错配）',
                )
            }
        }

        if (!existsSync(absolute)) {
            errors.push(`内建语言 ${id} 缺少文案文件 ${file}`)
            continue
        }

        let messages
        try {
            messages = parseLocaleSource(readFileSync(absolute, 'utf8'), file)
        } catch (error) {
            errors.push(error instanceof Error ? error.message : String(error))
            continue
        }

        errors.push(...compareLocaleKeys(id, file, baseline, messages))
        details.locales.push({
            id,
            file,
            preRegistered: preRegistered.includes(id),
            namespaces: Object.keys(messages).length,
            keys: Object.values(messages).reduce((total, group) => total + Object.keys(group).length, 0),
        })
    }

    const scannedFiles = readdirSync(dir).filter(
        (name) => name.endsWith('.ts') && !NON_LOCALE_FILE_RE.test(name),
    )
    const declaredFiles = new Set(union.map((id) => `${id.toLowerCase()}.ts`))
    for (const file of scannedFiles) {
        if (declaredFiles.has(file)) {
            continue
        }
        errors.push(
            `src/locale/${file} 未在 ${rel(indexPath)} 的 CaomeiLocale 联合中声明`
            + '（语言文件与内建语言集合须一一对应）',
        )
    }

    // 4. 语言子路径登记（分发面）：非预注册成员须双向登记
    const registration = readSubpathRegistration(root)
    errors.push(...registration.errors)
    const required = union.filter((id) => !preRegistered.includes(id))
    const requiredSubpaths = required.map((id) => id.toLowerCase())

    for (const code of requiredSubpaths) {
        if (!registration.exports.includes(code)) {
            errors.push(`内建语言 ${code} 未在 package.json 的 exports 中登记子路径 ${SUBPATH_EXPORT_PREFIX}${code}`)
        }
        if (!registration.entries.includes(code)) {
            errors.push(`内建语言 ${code} 未在 tsdown.config.ts 的构建入口中登记（期望 'locale/${code}': 'src/locale/${code}.ts'）`)
        }
    }
    const danglingHint = '（悬空登记：无对应语言文件，或该语言已预注册、不应再有子路径）'
    for (const code of registration.exports.filter((item) => !requiredSubpaths.includes(item))) {
        errors.push(`package.json 的 exports 子路径 ${SUBPATH_EXPORT_PREFIX}${code} 不在「非预注册内建语言」集合内${danglingHint}`)
    }
    for (const code of registration.entries.filter((item) => !requiredSubpaths.includes(item))) {
        errors.push(`tsdown.config.ts 的构建入口 locale/${code} 不在「非预注册内建语言」集合内${danglingHint}`)
    }

    // 5. 受检面下界
    if (registration.exports.length < MIN_SUBPATH_LOCALES) {
        errors.push(
            `语言子路径登记仅 ${registration.exports.length} 项，低于受检面下界 ${MIN_SUBPATH_LOCALES}：`
            + '按需引入能力被静默移除（如确需收缩，须同步调整下界常量并说明理由）',
        )
    }

    details.subpaths = { exports: registration.exports, entries: registration.entries }
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
            ?.map((locale) => `${locale.id}${locale.preRegistered ? '' : '*'}`)
            .join(' / ')
        console.info(
            `[check-locale-keys] 通过：基准 ${result.details.baseline?.id ?? BASELINE_FILE} `
            + `${result.details.baseline?.namespaces} 个命名空间 / `
            + `${result.details.baseline?.keys} 条文案；内建语种 ${summary}`
            + `（* = 经子路径按需引入：${result.details.subpaths?.exports?.join(' / ') || '无'}）`,
        )
        process.exit(0)
    }

    for (const error of result.errors) {
        console.error(`[check-locale-keys][error] ${error}`)
    }
    process.exit(1)
}
