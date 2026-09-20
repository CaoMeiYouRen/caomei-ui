# Local Linking

Besides installing from npm, downstream projects can also consume the local build as a local dependency; this guide lists copy-ready steps and common issues.

> See the [release guide](/en-US/guide/release) for the release process; for usage after installing from npm see [Getting Started](/en-US/guide/getting-started).

## 1. Prerequisite: build the artifacts

A local dependency consumes the `dist/` build artifacts (`files` in `package.json` only includes `dist` and `THIRD-PARTY-LICENSES`), so build inside the caomei-ui repository first:

```bash
pnpm install
pnpm build
```

Then run the artifact smoke check to confirm every path declared in `exports` exists and the runtime entries (`index` / `resolver` / `nuxt`) load:

```bash
pnpm check:build
```

## 2. Declare the local dependency downstream

### 2.1 `file:` (recommended)

```json
{
  "dependencies": {
    "caomei-ui": "file:../caomei-ui"
  }
}
```

Then install in the downstream project:

```bash
pnpm install
```

pnpm adds the package through **hard links** (the files are not copied), so every rebuild in caomei-ui requires a fresh `pnpm install` downstream.

### 2.2 `link:` (convenient, but watch peer dependencies)

```json
{
  "dependencies": {
    "caomei-ui": "link:../caomei-ui"
  }
}
```

`link:` creates a symlink, so after editing caomei-ui you only need to run `pnpm build` again, with no reinstall.

> Note: pnpm does not resolve a linked package's `peerDependencies` from its own `node_modules` (it warns about this on install and recommends `file:` instead). caomei-ui has `vue` as a peer dependency, so `link:` can lead to a duplicated Vue instance or failed injections; switch to `file:` if that happens.

### 2.3 Imperative `pnpm link`

Instead of editing `package.json` by hand, run this from the downstream project:

```bash
pnpm link ../caomei-ui
```

In pnpm 11, `pnpm link <dir>` writes the dependency back as `link:../caomei-ui` in the downstream `package.json`; `--global` is **no longer supported**. To remove the link:

```bash
pnpm remove caomei-ui
```

## 3. Common issues

| Symptom | Cause and fix |
| --- | --- |
| Components or styles are stale | Forgot to run `pnpm build` in caomei-ui; with `file:` also reinstall downstream |
| `caomei-ui/theme.css` cannot be resolved | The package was not built, or the downstream install did not create the local dependency |
| Types point at an old version | The downstream cache holds an old dependency; remove `node_modules/.pnpm` and reinstall |
| Duplicate Vue instance warnings or failed injections | `link:` does not resolve peer dependencies; switch to `file:` |
| New dependencies missing after linking | Declare and install them in caomei-ui, rebuild, then reinstall downstream |
