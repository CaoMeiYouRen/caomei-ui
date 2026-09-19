# 本地联调

除从 npm 安装外，下游项目也可通过本地依赖消费仓库构建产物完成联调；本文档给出可复制的操作步骤与常见问题。

> 发布流程见[发布指南](./release.md)；npm 安装后的用法见[快速上手](./getting-started.md)。

## 1. 前置：构建产物

本地依赖消费的是 `dist/` 构建产物（`package.json` 的 `files` 仅包含 `dist` 与 `THIRD-PARTY-LICENSES`），因此必须先在 caomei-ui 仓库完成构建：

```bash
pnpm install
pnpm build
```

构建后可运行产物冒烟校验，确认 `exports` 声明的产物齐全，且运行时入口（`index` / `resolver` / `nuxt`）可被加载：

```bash
pnpm check:build
```

## 2. 在下游项目声明本地依赖

### 2.1 `file:`（推荐）

```json
{
  "dependencies": {
    "caomei-ui": "file:../caomei-ui"
  }
}
```

然后在下游项目执行：

```bash
pnpm install
```

pnpm 以**硬链接**方式把包内容加入下游依赖（并非复制文件），因此 caomei-ui 每次重新构建后，都需要在下游重新执行 `pnpm install` 才会生效。

### 2.2 `link:`（便捷，注意 peer 依赖）

```json
{
  "dependencies": {
    "caomei-ui": "link:../caomei-ui"
  }
}
```

`link:` 建立软链，修改 caomei-ui 源码后只需重新 `pnpm build`，无需重装依赖。

> 注意：pnpm 不会从被链接包的 `node_modules` 解析其 `peerDependencies`（安装时会给出告警，并建议改用 `file:`）。caomei-ui 的 peer 依赖为 `vue`，使用 `link:` 时可能出现「重复的 Vue 实例」或注入失败；遇到此类问题请改用 `file:`。

### 2.3 命令式 `pnpm link`

不手工修改 `package.json`，可直接在下游项目执行：

```bash
pnpm link ../caomei-ui
```

pnpm 11 中 `pnpm link <dir>` 会把该依赖以 `link:../caomei-ui` 写回下游 `package.json`；该版本**不再支持 `--global`**。移除链接：

```bash
pnpm remove caomei-ui
```

## 3. 常见问题

| 现象 | 原因与处理 |
| --- | --- |
| 组件或样式没有更新 | 忘记在 caomei-ui 重新 `pnpm build`；使用 `file:` 时还需在下游重新 `pnpm install` |
| 解析不到 `caomei-ui/styles.css` | 未先构建，或下游未执行 `pnpm install` 建立本地依赖 |
| 类型报错指向旧版本 | 下游缓存了旧依赖，删除 `node_modules/.pnpm` 后重装 |
| 出现重复的 Vue 实例警告或注入失败 | `link:` 不解析 peer 依赖；改用 `file:` |
| 链接后缺少新增依赖 | caomei-ui 声明并安装依赖后重新构建，再在下游重装 |
