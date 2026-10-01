# 组件页「迁移映射」描述重复的专项评估（DataView 已合并 + 6 页待整改）

> 触发：用户 2026-10-02 报告「DataView 数据视图的文档中存在重复的『迁移映射（PrimeVue → caomei-ui）』描述，建议合并」，并指出「其他组件的文档也存在类似问题，需要专项计划一并整改。考虑到改动面较大，评估并生成分析文档后进入 backlog」。
> 性质：**非阶段条目**（用户直接工作指令为授权锚点；当前无进行中阶段，见[待办事项](../../plan/todo.md)）。**本记录只做评估与落点**：同批已合并 DataView 一页，其余 6 页按用户口径**不进本批实现**，登记 [Backlog](../../plan/backlog.md) §1.6 待决策。
> 范围载体：`docs/components/*.md` 与 `docs/i18n/en-US/components/*.md`（中英组件页）、[设计规范 §7](../design-spec.md) 的迁移映射条目、[文档与演示站设计](../documentation-site.md)（组件页结构约定）。

---

## 1. 结论

同一事实在组件页里被写了**两遍**，且它与设计规范 §7 的迁移映射条目构成**第三处副本**：

| 副本 | 位置 | 形态 |
|:---|:---|:---|
| ① 正文块 | 页面中段（常在「插槽」「无障碍」之前） | `> 迁移映射（PrimeVue → caomei-ui）：…` 单段长文，含字段映射 + 已知差异 + 未实现明细 |
| ② 迁移节 | 页面末尾 | `## 从 PrimeVue 迁移`：表格（PrimeVue ↔ 本组件）+ `**已知差异（有意）**` / `## **未实现**` + 指向 §7 的指针 |
| ③ 设计规范 | [design-spec §7](../design-spec.md) | `> <组件> 迁移映射（已实现）：…`（**唯一权威口径**；组件页的迁移节是它的**受守卫镜像**——`check:migration-consistency` 即按「§7 权威 + 组件页镜像」对账） |

危害：① 与 ② 同页重复（用户读到的现象）；② 正文块**不受 `check:migration-consistency` 守卫**（该守卫只对账 §7 ↔ 迁移节），改一处即静默漂移；③ 中英页已有实际漂移（见 §3）。

---

## 2. 扫描方法与判据

判据（可复算，纯文件系统扫描，无 revision 维度）：

- 命中 ①：页面存在以 `>` 开头且含「迁移映射」/「Migration mapping」的行；
- 命中 ②：页面存在 `## 从 PrimeVue 迁移` / `## Migration from PrimeVue` 节；
- ① ∧ ② 即「同页重复」。

```sh
# 逐页枚举（受检面 = 全部组件页；每页都打印「正文块行数 / 是否有迁移节 / 是否命中」，
# 未命中页同样可见，故不存在只打印命中项的静默豁免）
python3 - <<'PY'
import glob, io, os

for root, prose_key, section_key in [
    ('docs/components/*.md', '迁移映射', '## 从 PrimeVue 迁移'),
    ('docs/i18n/en-US/components/*.md', 'Migration mapping', '## Migration from PrimeVue'),
]:
    pages = sorted(glob.glob(root))
    hit = 0
    for path in pages:
        source = io.open(path, encoding='utf-8').read()
        prose = [line for line in source.split('\n') if line.startswith('> ') and prose_key in line]
        has_section = section_key in source
        matched = bool(prose) and has_section
        hit += matched
        print(os.path.basename(path), 'prose=' + str(len(prose)), 'section=' + ('Y' if has_section else '-'), 'hit=' + ('Y' if matched else '-'))
    print(root, len(pages), '页 / 命中', hit, '页')
PY
```

---

## 3. 盘点结果

| 页面 | 中文页 ①（正文块） | 中文页 ②（迁移节） | 英文页 ① | 英文页 ② | 设计规范 §7 对应条目 |
|:---|:---:|:---:|:---:|:---:|:---:|
| DataView | 1（**本批已合并**） | 有 | 1（**本批已合并**） | 有 | 有 |
| ColorPicker | 1 | 有 | 1 | 有 | 有 |
| DatePicker | 1 | 有 | **0** | 有 | 有 |
| Drawer | 1 | 有 | 1 | 有 | 有 |
| Message | 1 | 有 | 1 | 有 | 有 |
| SplitButton | 1 | 有 | 1 | 有 | 有 |
| Tag | 1 | 有 | 1 | 有 | 有 |

**中英漂移证据**：`docs/components/date-picker.md` 有正文块，而 `docs/i18n/en-US/components/date-picker.md` **没有**——同一页面两语种结构不一致（`docs:check:i18n-parity` 只对账页面与锚点，覆盖不到这种内容级差异）。

**覆盖声明**：受检面 = 中英组件页各 **53** 页（`docs/components/*.md` 与 `docs/i18n/en-US/components/*.md`），其中含迁移节的 **47** 页（53 − 6 个无迁移节页：`composables` / `icons` / `index` / `locale` / `rich-text-editor` / `showcase`）；命中 ① ∧ ② 共 **7** 页（**合并前口径**：DataView + 上表 6 页；本批合并 DataView 后按 §2 脚本复算为**中文 6 / 英文 5**，差异来自 `date-picker` 英文页本就无正文块）。其余 **6** 页待整改；逐页计数见上表，**无静默豁免**——§2 脚本逐页打印全部 53 页（未命中页亦输出 `prose=0` / `section=-`），可复算。

---

## 4. 逐页对账要点（为何不是机械删除）

正文块与迁移节并非逐字重复：正文块常带**节内没有的细节**，删除前须逐页比对（下表为初判，实施时须逐条 diff 后再落）：

| 页面 | 正文块中需要折入迁移节的候选内容 |
|:---|:---|
| ColorPicker | 字段级映射（`format` / `inline` / `invalid` ……）与「`appendTo` / `overlayClass` 未暴露」的明细 |
| DatePicker | `show-icon` / `date-format` / `show-time` / `hour-format` 等逐字段对应（迁移节表格可能只覆盖一部分） |
| Drawer | `visible → v-model:open`、`header → title`、`dismissable → closeOnOverlay` 等映射（迁移节以「未实现 / 未暴露」为主） |
| Message | `severity → tone` 的取值折叠（`error → danger`、`info → primary` ……） |
| SplitButton | 「本库 `label` 统一为**不可见可访问名**」这类**语义差异**（易被误删） |
| Tag | `severity → tone` 的取值折叠与 `variant` 新增说明 |

即：整改动作 = **删除正文块 → 把上表候选内容折入迁移节（表格 / 已知差异 / 未实现）→ 设计规范 §7 保持唯一权威**；中英两页必须同批改（避免像 DatePicker 那样再产生新的语种漂移）。

---

## 5. 风险与工作量

- **文件面**：6 页 × 2 语种 = **12 文件**（另有设计规范 §7 无需改动，因其为权威副本）。
- **不可机械化**：正文块含独有语义（见 §4），须逐页 diff；机械删除会丢信息（本仓已有「改写陈旧表述时把旧句式套到新对象上」的历史 finding）。
- **门禁面**：删除块引用不改变锚点 / 链接结构，`docs:check` 各段不受影响；`lint-md` 需复跑（块引用相邻空行易触发 `space-around-number` 类规则）。
- **建议批次**：按「页面 × 中英」拆为 3 个原子条目（每批 2 页 × 2 语种），每批独立走 Review Gate；或按用户裁定一次性整批（12 文件仍在粒度阈值内）。

---

## 6. 落点

- [Backlog](../../plan/backlog.md) §1.6 新增候选「组件页迁移映射描述去重（6 页 × 中英）」——含来源（本记录）、整改形态、覆盖声明与建议批次。
- 本记录 + [治理索引](./index.md) 登记。
