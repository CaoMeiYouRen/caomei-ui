# AI-Assisted Development Guide

This guide is for developers using AI agents to work on caomei-ui. The core rules live in the root `AGENTS.md`; this document is only an overview.

## 1. Authoritative sources

- `AGENTS.md` (repository root): project-level AI behavior rules, the PDTFC+ workflow, the agent matrix and security red lines.
- [docs/standards/ai-collaboration.md](/standards/ai-collaboration) (Chinese): the PDTFC+ and search-first details.
- [docs/standards/ai-governance.md](/standards/ai-governance) (Chinese): the agents / skills inventory and governance.

## 2. Workflow overview

```
P requirements/planning → D implementation → A audit → V UI validation → T testing → F wrap-up commit
```

- **P**: `@product-manager` clarifies requirements and acceptance criteria, aligned with `docs/plan/todo.md`.
- **D**: `@full-stack-master` coordinates the implementation, following the [Development standards](/standards/development) (Chinese).
- **A**: `@code-reviewer` mandatory Review Gate; nothing may be committed without it passing.
- **V**: `@ui-validator` browser validation of component rendering, theme and responsiveness.
- **T**: `@test-engineer` test reinforcement.
- **F**: `@documentation-specialist` syncs the docs, and `conventional-committer` commits.

## 3. Agents and skills

- Main definition directory: `.github/agents/`, `.github/skills/`.
- Platform mirrors: `.claude/`, `.opencode/`, `.agents/` (symlinks).
- Sync command: `pnpm setup:ai`.

See [AI asset governance](/standards/ai-governance) (Chinese).

## 4. Commit discipline

- Commits must follow Conventional Commits, with Chinese descriptions.
- A bare `git commit -m` is forbidden; commits must go through the `conventional-committer` skill.
- **Never push without permission.**

## 5. Search first

When facing an unfamiliar API (Reka UI, tsdown, Vue 3.6 compatibility, etc.) or when a fix has failed >= 2 times, search the official docs and authoritative sources before continuing the analysis.

## 6. Handling new requirements

New requirements default to "evaluate → [backlog](/plan/backlog) (Chinese) → user decision" and must not be auto-promoted to the highest priority of the current stage. See the [Planning standards](/standards/planning) (Chinese).
