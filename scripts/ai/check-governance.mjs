#!/usr/bin/env node

/**
 * check-governance：校验 caomei-ui 的 AI 资产治理一致性。
 *
 * 检查项：
 * 1. agent 文件 frontmatter 含 name/description；
 * 2. skill 目录含 SKILL.md 且 frontmatter 含 name/description；
 * 3. agent / skill 中引用的 `.github/skills/<name>/SKILL.md` 必须存在；
 * 4. AGENTS.md 智能体矩阵中出现的 `@role` 必须存在对应 `.github/agents/<role>.agent.md`；
 * 5. 平台镜像（.claude / .agents / .opencode）为指向 .github 的符号链接；
 * 6. external-skills-registry.json 合法且字段完整；
 * 7. CLAUDE.md 与 .github/copilot-instructions.md 存在。
 *
 * 用法：node scripts/ai/check-governance.mjs
 */
import { existsSync, lstatSync, readdirSync, readFileSync, realpathSync } from 'node:fs'
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

function listDirs(dir) {
    if (!existsSync(dir)) {
        return []
    }
    return readdirSync(dir, { withFileTypes: true })
        .filter((e) => e.isDirectory() || (e.isSymbolicLink() && !e.name.startsWith('.')))
        .map((e) => e.name)
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

function checkSkills(errors) {
    const skillNames = listDirs(SKILLS_DIR)
    if (skillNames.length === 0) {
        errors.push('.github/skills/ 下没有 skill')
    }
    for (const name of skillNames) {
        const skillFile = join(SKILLS_DIR, name, 'SKILL.md')
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
    }
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
