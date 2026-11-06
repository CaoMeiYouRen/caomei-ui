# 视觉回归测试字体

`test/visual/components.visual.ts` 的截图基线使用仓库内自带的两个字体子集，避免依赖
操作系统 / CI runner 的 CJK 回退字体：

| 文件 | family | 覆盖范围 |
|:---|:---|:---|
| `caomei-test-latin.woff2` | `CaomeiTestLatin` | ASCII、Latin-1、常用标点（`U+0020-007E` / `U+00A0-00FF` / `U+2000-206F`） |
| `caomei-test-cjk.woff2` | `CaomeiTestCJK` | 夹具与组件文案中的 CJK 字符、CJK 标点 |

两个子集都来自 **Noto Sans CJK SC Regular**（SIL Open Font License 1.1）。测试夹具通过
`visual-fonts.css` 把 `--caomei-font-sans` 覆盖为
`"CaomeiTestLatin", "CaomeiTestCJK", sans-serif`，仍保留「Latin → CJK」回退链；
`font-latin` / `font-mixed` 采样面继续覆盖跨字体回退路径。

覆盖范围只保证视觉受检面使用的文本；新增采样面若引入新字符，先运行
`pnpm exec playwright test --config playwright.visual.config.ts --grep "字体已加载"`
获取缺失码点，再按下面的命令重新生成子集，并在 Review Gate 中说明。若缺失码点来自
运行时生成文本，先把码点追加到 `/tmp/cjk-chars.txt` 或 `--unicodes`；若缺失码点属于
Latin 范围（`U+0020-007E` / `U+00A0-00FF` / `U+2000-206F`），加到 Latin 子集的
`--unicodes`；emoji / 彩色字形需单独字体或显式登记排除。生成命令：

```bash
# 1. 准备 Noto Sans CJK SC Regular（Ubuntu：apt install fonts-noto-cjk）
#    从 TTC 中取出 SC face（font number 2）
python3 - <<'PY'
from fontTools.ttLib import TTCollection
c = TTCollection('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc')
c.fonts[2].save('/tmp/NotoSansCJKSC-Regular.ttf')
PY

# 2. 收集受检面文本中不属于 Latin 子集范围的字符（CJK / 符号 / 箭头等）
python3 - <<'PY'
from pathlib import Path
root = Path('.')
chars = set()
for p in [root / 'test/e2e/fixtures/app.vue', root / 'test/visual/components.visual.ts', *root.glob('src/**/*.vue'), *root.glob('src/**/*.ts')]:
    try:
        text = p.read_text(encoding='utf-8')
    except UnicodeDecodeError:
        continue
    for ch in text:
        if ch.isspace():
            continue
        o = ord(ch)
        if o < 0x20 or o == 0x7F:
            continue
        if (0x20 <= o <= 0x7E) or (0xA0 <= o <= 0xFF) or (0x2000 <= o <= 0x206F):
            continue
        chars.add(ch)
Path('/tmp/cjk-chars.txt').write_text(''.join(sorted(chars)), encoding='utf-8')
PY

# 3. 生成两个 woff2 子集（需要 fonttools + brotli）
python3 -m fontTools.subset /tmp/NotoSansCJKSC-Regular.ttf \
  --text-file=/tmp/cjk-chars.txt \
  --unicodes=U+3000-303F,U+FF00-FFEF,U+00B7,U+2026 \
  --flavor=woff2 --layout-features='*' \
  --output-file=test/e2e/fixtures/fonts/caomei-test-cjk.woff2

python3 -m fontTools.subset /tmp/NotoSansCJKSC-Regular.ttf \
  --unicodes=U+0020-007E,U+00A0-00FF,U+2000-206F \
  --flavor=woff2 --layout-features='*' \
  --output-file=test/e2e/fixtures/fonts/caomei-test-latin.woff2
```

字体子集与测试夹具同仓库提交；不要改为引用系统字体，否则会把本地 / CI 的字体差异
重新引入视觉基线。
