#!/usr/bin/env node

/**
 * check-governance：校验 caomei-ui 的 AI 资产治理一致性。
 *
 * 检查项：
 * 1. agent 文件 frontmatter 含 name/description；
 * 2. skill 目录含 SKILL.md 且 frontmatter 含 name/description/metadata.internal；
 * 3. agent / skill 中引用的 `.github/skills/<name>/SKILL.md` 必须存在；
 * 4. skill 的 `references/*.md` 必须在 SKILL.md 中被索引；
 * 5. AGENTS.md 智能体矩阵中出现的 `@role` 必须存在对应 `.github/agents/<role>.agent.md`；
 * 6. 平台镜像（.claude / .agents / .opencode）为指向 .github 的符号链接；
 * 7. external-skills-registry.json 合法且字段完整；
 * 8. CLAUDE.md 与 .github/copilot-instructions.md 存在。
 *
 * 用法：node scripts/ai/check-governance.mjs
 */
import { existsSync, lstatSync, readdirSync, readFileSync, realpathSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDirectExecution } from '../shared/cli.mjs'

export const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')

const AGENTS_DIR = join(projectRoot, '.github/agents')
const SKILLS_DIR = join(projectRoot, '.github/skills')

export const MIRRORS = [
    { link: '.claude/agents', target: '.github/agents' },
    { link: '.claude/skills', target: '.github/skills' },
    { link: '.agents/agents', target: '.github/agents' },
    { link: '.agents/skills', target: '.github/skills' },
    { link: '.opencode/agents', target: '.github/agents' },
    { link: '.opencode/skills', target: '.github/skills' },
]

function hasFrontmatterField(content, field) {
    if (!content.startsWith('---')) {
        return false
    }
    const end = content.indexOf('\n---', 3)
    if (end === -1) {
        return false
    }
    const frontmatter = content.slice(3, end)
    return new RegExp(`^${field}\\s*:`, 'm').test(frontmatter)
}

/**
 * 判断 frontmatter 的嵌套字段是否存在（如 `metadata.internal`）。
 *
 * 只认父键的**下一层**：`metadata.foo.internal` 不算 `metadata.internal`；
 * 支持块形式（`metadata:` 换行后 `  internal: false`）与行内对象
 * （`metadata: { internal: false }`）；键名允许引号。
 *
 * @param {string} content 文件内容
 * @param {string} parent 顶层字段
 * @param {string} field 嵌套字段
 * @returns {boolean} 是否存在
 */
function hasFrontmatterNestedField(content, parent, field) {
    if (!content.startsWith('---')) {
        return false
    }
    const end = content.indexOf('\n---', 3)
    if (end === -1) {
        return false
    }
    const lines = content.slice(3, end).split('\n')
    const parentPattern = new RegExp(`^(\\s*)${parent}\\s*:`, 'u')
    const parentIndex = lines.findIndex((line) => parentPattern.test(line))
    if (parentIndex === -1) {
        return false
    }
    const parentLine = lines[parentIndex]
    const parentIndent = parentLine.match(/^(\s*)/u)[1].length
    const inlineValue = parentLine.slice(parentLine.indexOf(':') + 1)
    if (/\{/u.test(inlineValue) && new RegExp(`[{,]\\s*["']?${field}["']?\\s*:`, 'u').test(inlineValue)) {
        return true
    }
    let childIndent = null
    for (let i = parentIndex + 1; i < lines.length; i += 1) {
        const line = lines[i]
        if (line.trim() === '' || line.trim().startsWith('#')) {
            continue
        }
        const indent = line.match(/^(\s*)/u)[1].length
        if (indent <= parentIndent) {
            return false
        }
        childIndent ??= indent
        if (indent !== childIndent) {
            continue
        }
        if (new RegExp(`^\\s{${childIndent}}["']?${field}["']?\\s*:`, 'u').test(line)) {
            return true
        }
    }
    return false
}

function listDirs(dir) {
    if (!existsSync(dir)) {
        return []
    }
    return readdirSync(dir, { withFileTypes: true })
        .filter((e) => e.isDirectory() || (e.isSymbolicLink() && !e.name.startsWith('.')))
        .map((e) => e.name)
}

/**
 * 递归列出目录下的 markdown 文件（相对路径）。
 *
 * @param {string} dir 目录
 * @param {string} [prefix] 相对前缀
 * @returns {string[]} 相对路径列表
 */
function listMarkdownFiles(dir, prefix = '') {
    if (!existsSync(dir)) {
        return []
    }
    const files = []
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const relPath = prefix === '' ? entry.name : `${prefix}/${entry.name}`
        if (entry.isDirectory()) {
            files.push(...listMarkdownFiles(join(dir, entry.name), relPath))
        } else if (/\.md$/iu.test(entry.name)) {
            files.push(relPath)
        }
    }
    return files
}

function checkAgents(errors) {
    if (!existsSync(AGENTS_DIR)) {
        errors.push('.github/agents/ 目录不存在')
        return
    }
    for (const file of readdirSync(AGENTS_DIR).filter((f) => f.endsWith('.agent.md'))) {
        const content = readFileSync(join(AGENTS_DIR, file), 'utf8')
        if (!hasFrontmatterField(content, 'name')) {
            errors.push(`${file}: 缺少 frontmatter name`)
        }
        if (!hasFrontmatterField(content, 'description')) {
            errors.push(`${file}: 缺少 frontmatter description`)
        }
    }
}

/**
 * 校验 skill frontmatter 必填字段（name / description / metadata.internal）。
 *
 * @param {string} [skillsDir] skills 目录
 * @returns {string[]} 问题列表
 */
export function checkSkillMetadata(skillsDir = SKILLS_DIR) {
    const errors = []
    for (const name of listDirs(skillsDir)) {
        const skillFile = join(skillsDir, name, 'SKILL.md')
        if (!existsSync(skillFile)) {
            errors.push(`skill ${name}: 缺少 SKILL.md`)
            continue
        }
        const content = readFileSync(skillFile, 'utf8')
        if (!hasFrontmatterField(content, 'name')) {
            errors.push(`skill ${name}: 缺少 frontmatter name`)
        }
        if (!hasFrontmatterField(content, 'description')) {
            errors.push(`skill ${name}: 缺少 frontmatter description`)
        }
        if (!hasFrontmatterNestedField(content, 'metadata', 'internal')) {
            errors.push(`skill ${name}: 缺少 frontmatter metadata.internal`)
        }
    }
    return errors
}

/**
 * 校验技能 `references/` 下的 markdown 均被执行入口（SKILL.md）索引。
 *
 * 索引口径 = SKILL.md 中出现 `references/<相对路径>`（可带 `./` 前缀）；同名文件必须写全路径，
 * 避免 basename 命中造成孤儿放行。反向断链（SKILL.md 指向不存在的文件）由
 * `scripts/governance/check-ai-asset-links.mjs` 的 `missing-target` 覆盖，此处不重复实现。
 *
 * @param {string} [skillsDir] skills 目录
 * @returns {string[]} 问题列表
 */
export function checkReferencesIndexed(skillsDir = SKILLS_DIR) {
    const errors = []
    for (const name of listDirs(skillsDir)) {
        const referencesDir = join(skillsDir, name, 'references')
        const skillFile = join(skillsDir, name, 'SKILL.md')
        if (!existsSync(referencesDir) || !existsSync(skillFile)) {
            continue
        }
        if (!statSync(referencesDir).isDirectory()) {
            errors.push(`skill ${name}: references 必须是目录`)
            continue
        }
        const content = readFileSync(skillFile, 'utf8')
        for (const relPath of listMarkdownFiles(referencesDir)) {
            const candidates = [`references/${relPath}`, `./references/${relPath}`]
            if (!candidates.some((candidate) => content.includes(candidate))) {
                errors.push(`skill ${name}: references/${relPath} 未在 SKILL.md 中索引（需写 references/${relPath}）`)
            }
        }
    }
    return errors
}

function checkSkills(errors) {
    if (listDirs(SKILLS_DIR).length === 0) {
        errors.push('.github/skills/ 下没有 skill')
    }
    errors.push(...checkSkillMetadata())
    errors.push(...checkReferencesIndexed())
}

function checkSkillReferences(errors) {
    const skillNames = new Set(listDirs(SKILLS_DIR))
    const mdFiles = [
        ...readdirSync(AGENTS_DIR).filter((f) => f.endsWith('.md')).map((f) => join(AGENTS_DIR, f)),
        ...listDirs(SKILLS_DIR).map((name) => join(SKILLS_DIR, name, 'SKILL.md')),
    ]
    const re = /\.\.\/skills\/([a-z0-9-]+)\/SKILL\.md|\.\.\/\.\.\/\.github\/skills\/([a-z0-9-]+)\/SKILL\.md/g
    for (const file of mdFiles) {
        const content = readFileSync(file, 'utf8')
        for (const m of content.matchAll(re)) {
            const ref = m[1] ?? m[2]
            if (!skillNames.has(ref)) {
                errors.push(`${relative(projectRoot, file)}: 引用了不存在的 skill "${ref}"`)
            }
        }
    }
}

function checkAgentsMatrix(errors) {
    const agentsMd = join(projectRoot, 'AGENTS.md')
    if (!existsSync(agentsMd)) {
        errors.push('AGENTS.md 不存在')
        return
    }
    const content = readFileSync(agentsMd, 'utf8')
    const roles = new Set()
    for (const m of content.matchAll(/(?<![a-z0-9@/])@([a-z0-9-]+)(?![a-z0-9/-])/g)) {
        roles.add(m[1])
    }
    for (const role of roles) {
        if (!existsSync(join(AGENTS_DIR, `${role}.agent.md`))) {
            errors.push(`AGENTS.md 引用的 @${role} 缺少对应 agent 文件`)
        }
    }
}

function checkMirrors(errors) {
    for (const { link, target } of MIRRORS) {
        const linkPath = join(projectRoot, link)
        const targetPath = join(projectRoot, target)
        if (!existsSync(linkPath)) {
            errors.push(`镜像缺失: ${link}（应指向 ${target}，运行 pnpm setup:ai）`)
            continue
        }
        let st
        try {
            st = lstatSync(linkPath)
        } catch {
            errors.push(`镜像无法读取: ${link}`)
            continue
        }
        if (!st.isSymbolicLink()) {
            errors.push(`镜像不是符号链接: ${link}`)
            continue
        }
        const resolvedLink = realpathSync(linkPath)
        const resolvedTarget = realpathSync(targetPath)
        if (resolvedLink !== resolvedTarget) {
            errors.push(`镜像指向错误: ${link} -> ${resolvedLink}（期望 ${resolvedTarget}）`)
        }
    }
}

function checkRegistry(errors) {
    const registryPath = join(projectRoot, '.github/external-skills-registry.json')
    if (!existsSync(registryPath)) {
        errors.push('.github/external-skills-registry.json 不存在')
        return
    }
    let data
    try {
        data = JSON.parse(readFileSync(registryPath, 'utf8'))
    } catch (error) {
        errors.push(`external-skills-registry.json 解析失败: ${error.message}`)
        return
    }
    if (!Array.isArray(data)) {
        errors.push('external-skills-registry.json 必须是数组')
        return
    }
    for (const [index, item] of data.entries()) {
        for (const field of ['id', 'displayName', 'sourceType', 'adoptedFor']) {
            if (!item[field]) {
                errors.push(`external-skills-registry.json[${index}]: 缺少字段 ${field}`)
            }
        }
    }
}

function checkAdapterEntrypoints(errors) {
    for (const file of ['CLAUDE.md', '.github/copilot-instructions.md']) {
        if (!existsSync(join(projectRoot, file))) {
            errors.push(`平台适配入口缺失: ${file}`)
        }
    }
}

export function runCheckGovernance() {
    const errors = []
    checkAgents(errors)
    checkSkills(errors)
    checkSkillReferences(errors)
    checkAgentsMatrix(errors)
    checkMirrors(errors)
    checkRegistry(errors)
    checkAdapterEntrypoints(errors)
    return errors
}

if (isDirectExecution(import.meta.url)) {
    const errors = runCheckGovernance()
    if (errors.length > 0) {
        console.error(`[ai-check-governance] ${errors.length} 个问题:`)
        for (const error of errors) {
            console.error(`  - ${error}`)
        }
        process.exitCode = 1
    } else {
        console.info('[ai-check-governance] OK：AI 资产治理一致性校验通过')
    }
}
