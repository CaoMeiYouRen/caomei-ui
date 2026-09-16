# Development Guide

## Requirements

- Node.js >= 20
- pnpm (use the version pinned by `packageManager` in the root `package.json`)

## Setup

```bash
pnpm install
```

## Common commands

| Command | Description |
|------|------|
| `pnpm dev` | Start the playground dev/demo environment |
| `pnpm build` | Build the library output (tsdown) |
| `pnpm build:watch` | tsdown watch mode |
| `pnpm lint` | ESLint check and fix |
| `pnpm lint:css` | Stylelint check and fix |
| `pnpm lint:md` | Markdown check |
| `pnpm typecheck` | `vue-tsc --noEmit` |
| `pnpm typecheck:docs` | Type-check the docs site (runs `docs:gen` first) |
| `pnpm test` | Unit tests |
| `pnpm test:coverage` | Coverage |
| `pnpm test:e2e` | Playwright E2E |
| `pnpm check:nuxt` | Minimal Nuxt consumption smoke (requires `pnpm build` first) |
| `pnpm test:nuxt-smoke` | Build + minimal Nuxt consumption smoke |
| `pnpm docs:dev` | Docs site development |
| `pnpm docs:build` | Docs site build |

## Directory conventions

```
src/
├─ components/    # Components (kebab-case directory + kebab-case.vue)
├─ composables/   # useToast / useConfirm / useTheme / useLocale / provideLocale
├─ locale/        # Component built-in text
├─ styles/        # tokens and base styles
├─ icons/         # Icon wrappers
├─ resolver/      # unplugin resolver
├─ nuxt/          # Nuxt module
├─ types.ts       # Shared types
└─ index.ts       # Public API exports
playground/       # Local dev/demo environment and Nuxt smoke fixture (not published)
docs/             # VitePress docs site
examples/         # Integration examples
test/             # Tests
```

## Adding a component

1. Confirm the component belongs to the component set in `docs/design/components.md` (Chinese); if not, start with the [Backlog](/plan/backlog) (Chinese).
2. Create `src/components/<name>/`: `<name>.vue` + `types.ts` + `index.ts` (kebab-case for both directories and files).
3. Export the component and types from `src/index.ts`.
4. Add unit tests and component documentation.
5. Pass the quality gates and the `@code-reviewer` Review Gate.

## Quality gates

See [Development standards - Quality gates](/standards/development#_11-质量门) (Chinese) and [Testing standards - Verification matrix](/standards/testing#_5-验证矩阵) (Chinese).

## Notes

- **Do not introduce Tailwind / UnoCSS.**
- The component prefix is always `Caomei`; component directory and file naming is always kebab-case.
- Public API changes must consider backward compatibility.
- After modifying a `types.ts` referenced by `defineProps<ImportedType>()`, the dev server may serve semi-stale HMR output (the template references the new prop while `defineProps` is not updated); on abnormal behavior, restart the dev server before investigating the source.
- Vite / VitePress bundle config with `codeSplitting: false`, so relative dynamic imports are inlined (the dependency is pulled in as soon as the config loads) and cannot be used to defer loading.
- `docs:preview` serves the old build output; `pkill -f "vitepress preview"` does not match the real process name (`vitepress.js preview`), so browser validation should use the dev server or restart preview by port.
- When a script contains a non-statically-analyzable `import(variable)`, Vitest / Vite injects the `/@vite/client` helper, which breaks parsing of `.mjs` files with a shebang; run artifact-loading smoke tests in a child process.
- The in-repo Nuxt fixture consumes the build output through a symlink from its `node_modules` to the repo root (equivalent to `link:`); the script verifies the target with `realpath` before reusing or rebuilding, so it never consumes a non-local artifact by mistake.
- After adding a Nuxt fixture, sync `.gitignore` (`.nuxt` / `.output`), the ESLint `ignores` and the root `tsconfig` `exclude`; otherwise `eslint .` scans the generated bundles and `vue-tsc` fails on missing Nuxt auto-import types.
