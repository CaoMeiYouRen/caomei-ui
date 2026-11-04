#!/usr/bin/env node

/**
 * diff-api：发布时 API 表面差分（仅比对 `.d.ts`）。
 *
 * 依据 [API 表面基线评估记录](../../docs/design/governance/2026-10-24-phase26-m1-3-api-surface-baseline-evaluation.md)：
 * **删除 / 重命名 / required 收紧**属 breaking，**新增不阻断**，
 * 其余声明内容变化属 warning（人工复核）。覆盖：
 * 1. 基线有、当前没有的 `.d.ts` 文件（删除 / 重命名）；
 * 2. 基线有、当前没有的导出名（删除 / 重命名）；
 * 3. 非继承导出接口 / 类型字面量中消失的成员（删除 / 重命名）；
 * 4. 同一成员由 optional 变为 required（required 收紧）。
 *
 * 继承接口的成员删除不在此判定（成员可能上移到基接口）；含索引签名的接口同样跳过成员删除
 * （索引签名覆盖任意键）。联合 / 交叉 / `Readonly<>` 包裹 / 映射类型 / accessor / `new` 签名 /
 * 带泛型约束的方法不解析，随声明内容变化提示人工复核。`export * from` 不静态展开，
 * 报告提示人工复核。scoped CSS / JS 产物的哈希文件名**不在比对面**，避免样式变更产生假阳性。
 *
 * 用法：
 *   node scripts/release/diff-api.mjs --baseline=/tmp/api-diff/package/dist
 *   pnpm check:api-surface --baseline=<dir> --current=dist --json
 *
 * 退出码：0 通过；1 存在 breaking；2 参数或路径错误。
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDirectExecution, parseCliOptions } from '../shared/cli.mjs'

export const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
export const DEFAULT_CURRENT = join(REPO_ROOT, 'dist')
export const DECLARATION_EXTENSION = '.d.ts'

const DECLARATION_EXPORT_RE = /export\s+declare\s+(?:class|function|const|let|var|interface|type|enum|namespace)\s+([\w$]+)/gu
const EXPORT_LIST_RE = /export\s+(?:type\s+)?\{([^}]*)\}/gu
const STAR_EXPORT_RE = /export\s+(?:type\s+)?\*\s*from/gu

/**
 * 递归收集目录下的 `.d.ts` 文件（仓库相对路径，正斜杠）。
 *
 * @param {string} root 目录
 * @returns {string[]} 相对路径（排序）
 */
export function collectDeclarationFiles(root) {
    if (!existsSync(root) || !statSync(root).isDirectory()) {
        throw new Error(`不是目录：${root}`)
    }
    const files = []
    const walk = (dir) => {
        for (const entry of readdirSync(dir, { withFileTypes: true })) {
            const full = join(dir, entry.name)
            if (entry.isDirectory()) {
                walk(full)
            } else if (entry.isFile() && entry.name.endsWith(DECLARATION_EXTENSION)) {
                files.push(relative(root, full).replaceAll('\\', '/'))
            }
        }
    }
    walk(root)
    return files.sort()
}

/**
 * 提取声明文件里的导出名。
 *
 * 覆盖 `export declare <kind> Name` 与 `export { A, B as C, type D }`；`export * from` 只计数
 * （无法静态展开），由调用方作为人工复核提示。
 *
 * @param {string} text 声明文件内容
 * @returns {{ names: string[], starExports: number }} 导出名与星号导出数量
 */
export function extractExportedNames(text) {
    const names = new Set()
    for (const match of text.matchAll(DECLARATION_EXPORT_RE)) {
        names.add(match[1])
    }
    for (const match of text.matchAll(EXPORT_LIST_RE)) {
        for (const part of match[1].split(',')) {
            const cleaned = part.trim().replace(/^type\s+/u, '')
            if (!cleaned) {
                continue
            }
            const alias = cleaned.split(/\s+as\s+/u).pop()?.trim() ?? ''
            if (/^[\w$]+$/u.test(alias)) {
                names.add(alias)
            }
        }
    }
    return { names: [...names].sort(), starExports: [...text.matchAll(STAR_EXPORT_RE)].length }
}

/**
 * 去掉 JSDoc / 行注释，避免注释中的示例代码参与成员解析。
 *
 * 维护单 / 双引号与反引号状态，字符串字面量内的 `//` / `/*` 不会被误当作注释。
 *
 * @param {string} text 声明文件内容
 * @returns {string}
 */
export function stripDeclarationComments(text) {
    let result = ''
    let quote = null
    let escaped = false
    for (let i = 0; i < text.length; i += 1) {
        const char = text[i]
        if (quote) {
            result += char
            if (escaped) {
                escaped = false
            } else if (char === '\\') {
                escaped = true
            } else if (char === quote) {
                quote = null
            }
            continue
        }
        if (char === '\'' || char === '"' || char === '`') {
            quote = char
            result += char
            continue
        }
        if (char === '/' && text[i + 1] === '*') {
            const end = text.indexOf('*/', i + 2)
            if (end === -1) {
                break
            }
            i = end + 1
            continue
        }
        if (char === '/' && text[i + 1] === '/') {
            while (i < text.length && text[i] !== '\n') {
                i += 1
            }
            result += '\n'
            continue
        }
        result += char
    }
    return result
}

/**
 * 从 `{` 起找到配对的 `}`（简单花括号计数；声明文件不包含模板字符串以外的复杂字面量）。
 *
 * @param {string} text 文本
 * @param {number} openIndex `{` 的下标
 * @returns {number} 配对 `}` 的下标；未找到返回 -1
 */
function findMatchingBrace(text, openIndex) {
    let depth = 0
    for (let i = openIndex; i < text.length; i += 1) {
        if (text[i] === '{') {
            depth += 1
        } else if (text[i] === '}') {
            depth -= 1
            if (depth === 0) {
                return i
            }
        }
    }
    return -1
}

/**
 * 按顶层分隔符切分接口 / 类型字面量的成员。
 *
 * 只处理声明文件的一行一成员形态；跨行联合类型会被当作多个片段，随后无法解析的属性会被忽略。
 *
 * @param {string} body 花括号内的正文
 * @returns {string[]} 成员片段
 */
function splitMemberSegments(body) {
    const segments = []
    let current = ''
    let brace = 0
    let paren = 0
    let bracket = 0
    let angle = 0
    for (let i = 0; i < body.length; i += 1) {
        const char = body[i]
        if (char === '{') {
            brace += 1
        } else if (char === '}') {
            brace -= 1
        } else if (char === '(') {
            paren += 1
        } else if (char === ')') {
            paren -= 1
        } else if (char === '[') {
            bracket += 1
        } else if (char === ']') {
            bracket -= 1
        } else if (char === '<') {
            angle += 1
        } else if (char === '>' && body[i - 1] !== '=') {
            angle -= 1
        }
        if ((char === ';' || char === ',' || char === '\n')
            && brace === 0 && paren === 0 && bracket === 0 && angle === 0) {
            if (current.trim()) {
                segments.push(current.trim())
            }
            current = ''
        } else {
            current += char
        }
    }
    if (current.trim()) {
        segments.push(current.trim())
    }
    return segments
}

/**
 * 归一化成员名：去掉 quoted key 的引号并还原转义，避免引号风格变化产生假阳。
 *
 * @param {string} name 原始成员名
 * @returns {string}
 */
function normalizeMemberName(name) {
    if ((name.startsWith('\'') && name.endsWith('\'')) || (name.startsWith('"') && name.endsWith('"'))) {
        return name.slice(1, -1).replace(/\\(["'\\])/gu, '$1')
    }
    return name
}

/**
 * 解析单个成员片段，识别属性 / 方法签名及 optional 标记。
 *
 * @param {string} segment 成员片段
 * @returns {{ name: string, optional: boolean } | null}
 */
function parseMemberSegment(segment) {
    const cleaned = segment.replace(/^\s*(?:readonly|declare)\s+/u, '')
    const property = cleaned.match(/^([A-Za-z_$][\w$]*|'[^']*'|"[^"]*")(\?)?\s*:/u)
    if (property) {
        return { name: normalizeMemberName(property[1]), optional: Boolean(property[2]) }
    }
    const method = cleaned.match(/^([A-Za-z_$][\w$]*)(\?)?\s*(?:<[^>]*>)?\s*\(/u)
    if (method && method[1] !== 'new' && method[1] !== 'constructor') {
        return { name: normalizeMemberName(method[1]), optional: Boolean(method[2]) }
    }
    return null
}

/**
 * 判断声明头（泛型参数之后）是否存在顶层 `extends`。
 *
 * 泛型约束 `T extends object` 不算；只认 `interface X extends Base` 形态。
 *
 * @param {string} text 声明头
 * @returns {boolean}
 */
function hasTopLevelExtends(text) {
    let angle = 0
    for (let i = 0; i < text.length; i += 1) {
        const char = text[i]
        if (char === '<') {
            angle += 1
        } else if (char === '>' && text[i - 1] !== '=') {
            angle = Math.max(0, angle - 1)
        } else if (angle === 0 && text.startsWith('extends', i)
            && !/[\w$]/u.test(text[i - 1] ?? '')
            && !/[\w$]/u.test(text[i + 'extends'.length] ?? '')) {
            return true
        }
    }
    return false
}

/**
 * 从声明头之后扫描到类型字面量的 `{`，跳过泛型参数内的花括号（如 `= {}`）。
 *
 * @param {string} text 文本
 * @param {number} fromIndex 起始下标
 * @returns {number} 类型体 `{` 的下标；未找到返回 -1
 */
function findTypeBodyStart(text, fromIndex) {
    let angle = 0
    for (let i = fromIndex; i < text.length; i += 1) {
        const char = text[i]
        if (char === '<') {
            angle += 1
        } else if (char === '>' && text[i - 1] !== '=') {
            angle = Math.max(0, angle - 1)
        } else if (char === '{' && angle === 0) {
            return i
        } else if (char === ';' && angle === 0) {
            return -1
        }
    }
    return -1
}

/**
 * 从声明头之后找顶层 `=`（跳过泛型参数内的默认值）。
 *
 * @param {string} text 文本
 * @param {number} fromIndex 起始下标
 * @returns {number} `=` 的下标；未找到返回 -1
 */
function findTopLevelEquals(text, fromIndex) {
    let angle = 0
    for (let i = fromIndex; i < text.length; i += 1) {
        const char = text[i]
        if (char === '<') {
            angle += 1
        } else if (char === '>' && text[i - 1] !== '=') {
            angle = Math.max(0, angle - 1)
        } else if (char === '=' && angle === 0) {
            return i
        } else if (char === ';' && angle === 0) {
            return -1
        }
    }
    return -1
}

/**
 * 提取导出的接口 / 类型字面量成员（名称 + required 状态）。
 *
 * 只解析 `export interface` 与 `export type X = { ... }`；不含继承展开（继承接口的成员
 * 由其基接口自身参与比较，成员删除也不在继承类型上判定）。索引签名按**顶层成员片段**
 * 识别，元组标签（`[query: string]`）不会误判。以下形态不解析，只作为声明内容变化
 * 提示人工复核：联合 / 交叉类型、`Readonly<>` / `Partial<>` 包裹、映射类型、accessor、
 * `new` 签名、带泛型约束的方法。
 *
 * @param {string} text 声明文件内容
 * @returns {Map<string, { members: Map<string, { optional: boolean }>, hasExtends: boolean, hasIndexSignature: boolean }>}
 */
export function extractTypeMembers(text) {
    const stripped = stripDeclarationComments(text)
    const types = new Map()
    const declarations = []
    for (const match of stripped.matchAll(/export\s+(?:declare\s+)?interface\s+([\w$]+)/gu)) {
        declarations.push({ kind: 'interface', name: match[1], headerEnd: match.index + match[0].length })
    }
    for (const match of stripped.matchAll(/export\s+(?:declare\s+)?type\s+([\w$]+)/gu)) {
        declarations.push({ kind: 'type', name: match[1], headerEnd: match.index + match[0].length })
    }
    declarations.sort((a, b) => a.headerEnd - b.headerEnd)
    for (const declaration of declarations) {
        let bodyStart
        let hasExtends = false
        if (declaration.kind === 'interface') {
            bodyStart = findTypeBodyStart(stripped, declaration.headerEnd)
            if (bodyStart === -1) {
                continue
            }
            hasExtends = hasTopLevelExtends(stripped.slice(declaration.headerEnd, bodyStart))
        } else {
            const equalsIndex = findTopLevelEquals(stripped, declaration.headerEnd)
            if (equalsIndex === -1) {
                continue
            }
            bodyStart = findTypeBodyStart(stripped, equalsIndex + 1)
            if (bodyStart === -1 || stripped.slice(equalsIndex + 1, bodyStart).trim() !== '') {
                continue
            }
        }
        const closeIndex = findMatchingBrace(stripped, bodyStart)
        if (closeIndex === -1) {
            continue
        }
        const body = stripped.slice(bodyStart + 1, closeIndex)
        const segments = splitMemberSegments(body)
        const existing = types.get(declaration.name) ?? {
            members: new Map(),
            hasExtends: false,
            hasIndexSignature: false,
        }
        existing.hasExtends ||= hasExtends
        existing.hasIndexSignature ||= segments.some((segment) => /^(?:readonly\s+)?\[\s*[\w$]+\s*:/u.test(segment.trim()))
        for (const segment of segments) {
            const parsed = parseMemberSegment(segment)
            if (parsed) {
                existing.members.set(parsed.name, { optional: parsed.optional })
            }
        }
        types.set(declaration.name, existing)
    }
    return types
}

/**
 * 比较两套 `.d.ts` 表面。
 *
 * @param {{ baselineRoot: string, currentRoot: string }} input 基线 / 当前 dist 目录
 * @returns {Record<string, any>} 比较结果（`removedExports` / `addedExports` 为 `{ file, name }` 列表）
 */
export function compareApiSurfaces({ baselineRoot, currentRoot }) {
    const baselineFiles = collectDeclarationFiles(baselineRoot)
    const currentFiles = collectDeclarationFiles(currentRoot)
    const baselineSet = new Set(baselineFiles)
    const currentSet = new Set(currentFiles)
    const removedFiles = baselineFiles.filter((file) => !currentSet.has(file))
    const addedFiles = currentFiles.filter((file) => !baselineSet.has(file))

    const baselineNames = new Set()
    const currentNames = new Set()
    const baselineFileNames = new Map()
    const currentFileNames = new Map()
    const baselineTypesByFile = new Map()
    const currentTypesByFile = new Map()
    const baselineTexts = new Map()
    const currentTexts = new Map()
    let baselineStarExports = 0
    let currentStarExports = 0
    for (const file of baselineFiles) {
        const text = readFileSync(join(baselineRoot, file), 'utf8')
        baselineTexts.set(file, text)
        const { names, starExports } = extractExportedNames(text)
        names.forEach((name) => baselineNames.add(name))
        baselineFileNames.set(file, new Set(names))
        baselineTypesByFile.set(file, extractTypeMembers(text))
        baselineStarExports += starExports
    }
    for (const file of currentFiles) {
        const text = readFileSync(join(currentRoot, file), 'utf8')
        currentTexts.set(file, text)
        const { names, starExports } = extractExportedNames(text)
        names.forEach((name) => currentNames.add(name))
        currentFileNames.set(file, new Set(names))
        currentTypesByFile.set(file, extractTypeMembers(text))
        currentStarExports += starExports
    }

    // 按「文件 + 导出名」比对：同名导出可能出现在多个声明文件（如每个 SFC 的 default），
    // 只比全局集合会漏掉单文件删除。
    const commonFiles = baselineFiles.filter((file) => currentSet.has(file))
    const removedExports = []
    const addedExports = []
    for (const file of commonFiles) {
        const before = baselineFileNames.get(file) ?? new Set()
        const after = currentFileNames.get(file) ?? new Set()
        for (const name of before) {
            if (!after.has(name)) {
                removedExports.push({ file, name })
            }
        }
        for (const name of after) {
            if (!before.has(name)) {
                addedExports.push({ file, name })
            }
        }
    }
    removedExports.sort((a, b) => a.file.localeCompare(b.file) || a.name.localeCompare(b.name))
    addedExports.sort((a, b) => a.file.localeCompare(b.file) || a.name.localeCompare(b.name))

    // 成员级比较：只在同名导出类型仍存在时进行。继承类型的成员删除不判定（可能上移到基接口），
    // 但 required 收紧仍按「同类型 + 同成员」比对（基接口自身也会参与比较）。
    const requiredTightened = []
    const removedMembers = []
    for (const file of commonFiles) {
        const beforeTypes = baselineTypesByFile.get(file) ?? new Map()
        const afterTypes = currentTypesByFile.get(file) ?? new Map()
        for (const [typeName, before] of beforeTypes) {
            const after = afterTypes.get(typeName)
            if (!after) {
                continue
            }
            for (const [member, meta] of before.members) {
                const afterMeta = after.members.get(member)
                if (!afterMeta) {
                    if (!before.hasExtends && !after.hasExtends
                        && !before.hasIndexSignature && !after.hasIndexSignature) {
                        removedMembers.push({ file, type: typeName, member })
                    }
                    continue
                }
                if (meta.optional && !afterMeta.optional) {
                    requiredTightened.push({ file, type: typeName, member })
                }
            }
        }
    }
    requiredTightened.sort((a, b) => a.file.localeCompare(b.file)
        || a.type.localeCompare(b.type) || a.member.localeCompare(b.member))
    removedMembers.sort((a, b) => a.file.localeCompare(b.file)
        || a.type.localeCompare(b.type) || a.member.localeCompare(b.member))

    const changedFiles = commonFiles
        .filter((file) => baselineTexts.get(file) !== currentTexts.get(file))

    return {
        baselineFiles,
        currentFiles,
        removedFiles,
        addedFiles,
        baselineExports: [...baselineNames].sort(),
        currentExports: [...currentNames].sort(),
        removedExports,
        addedExports,
        requiredTightened,
        removedMembers,
        changedFiles,
        baselineStarExports,
        currentStarExports,
        breaking: removedFiles.length > 0 || removedExports.length > 0
            || requiredTightened.length > 0 || removedMembers.length > 0,
    }
}

/**
 * 渲染文本报告。
 *
 * @param {ReturnType<typeof compareApiSurfaces>} result 结果
 * @returns {string} 报告
 */
export function formatReport(result) {
    const lines = [
        `[api-surface] 基线 ${result.baselineFiles.length} 个声明文件 / ${result.baselineExports.length} 个导出；当前 ${result.currentFiles.length} / ${result.currentExports.length}`,
    ]
    if (result.baselineStarExports > 0 || result.currentStarExports > 0) {
        lines.push(`  ! 存在 export * from（基线 ${result.baselineStarExports} 处 / 当前 ${result.currentStarExports} 处），导出名无法完全静态展开，需人工复核`)
    }
    for (const file of result.removedFiles) {
        lines.push(`  ✖ 删除 / 重命名文件：${file}`)
    }
    for (const { file, name } of result.removedExports) {
        lines.push(`  ✖ 删除 / 重命名导出：${file} → ${name}`)
    }
    for (const { file, type, member } of result.removedMembers) {
        lines.push(`  ✖ 删除成员：${file} → ${type}.${member}`)
    }
    for (const { file, type, member } of result.requiredTightened) {
        lines.push(`  ✖ required 收紧：${file} → ${type}.${member}`)
    }
    for (const file of result.addedFiles) {
        lines.push(`  + 新增文件：${file}`)
    }
    for (const { file, name } of result.addedExports) {
        lines.push(`  + 新增导出：${file} → ${name}`)
    }
    lines.push(result.changedFiles.length > 0
        ? `  · ${result.changedFiles.length} 个声明文件内容变化，需人工复核是否改变类型`
        : '  · 无声明文件内容变化')
    if (result.breaking) {
        lines.push('[api-surface] 未通过：存在删除 / 重命名 / 成员删除 / required 收紧（breaking）')
    } else if (result.changedFiles.length > 0) {
        lines.push('[api-surface] 通过：无删除 / 重命名 / 成员删除 / required 收紧（内容变化需人工复核）')
    } else {
        lines.push('[api-surface] 通过：无删除 / 重命名 / 成员删除 / required 收紧（无需人工复核）')
    }
    return lines.join('\n')
}

/**
 * CLI 入口。
 *
 * @param {string[]} argv 参数
 * @returns {number} 退出码
 */
export function main(argv = process.argv) {
    let options
    try {
        options = parseCliOptions(argv, {
            flags: { '--json': { key: 'json' } },
            values: {
                '--baseline': { key: 'baseline' },
                '--current': { key: 'current' },
            },
            defaults: { current: DEFAULT_CURRENT },
        })
        if (!options.baseline) {
            throw new Error('缺少 --baseline=<dir>（上一已发布版本的解包 dist 目录）')
        }
        const result = compareApiSurfaces({ baselineRoot: options.baseline, currentRoot: options.current })
        if (options.json) {
            console.info(JSON.stringify(result, null, 2))
        } else {
            console.info(formatReport(result))
        }
        return result.breaking ? 1 : 0
    } catch (error) {
        console.error(`[api-surface] ${error.message}`)
        return 2
    }
}

if (isDirectExecution(import.meta.url)) {
    process.exitCode = main()
}
