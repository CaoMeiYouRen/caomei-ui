<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import type { Component } from 'vue'
import { useData, withBase } from 'vitepress'
import registry from '../../showcase-registry.json'

/**
 * 组件画廊：以 `docs/.vitepress/showcase-registry.json` 登记表为单一事实源，
 * 渲染真实组件预览卡片（登记表的对账守卫见 `scripts/docs/check-showcase-registry.mjs`）。
 *
 * 登记表只声明组件名 / 分组 / 示例路径 / 中英描述；预览组件由登记路径**机械推导**
 * 的 glob 映射取得，卡片链接由组件名按 `kebab-case` 推导，两者都不在组件内另立清单。
 */
interface RegistryEntry {
    name: string
    group: { zh: string, en: string }
    example: string
    description: { zh: string, en: string }
}

interface ShowcaseItem {
    name: string
    group: string
    description: string
    link: string
    component: Component | null
}

type Locale = 'zh' | 'en'

/** 中文示例（`docs/examples/<组件>/`）与英文示例（`docs/i18n/en-US/examples/<组件>/`）分 locale glob。 */
const zhExamples = import.meta.glob('../../../examples/*/*.vue')
const enExamples = import.meta.glob('../../../i18n/en-US/examples/*/*.vue')

const entries = registry as RegistryEntry[]

/** 组件名 → 文档页 basename（`DatePicker` → `date-picker`）。 */
function toKebabCase(name: string): string {
    return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

/** 取 glob 映射中与登记路径匹配的加载器：按路径尾匹配，不依赖 glob key 的前缀形态。 */
function pickLoader(map: Record<string, () => Promise<unknown>>, example: string): (() => Promise<unknown>) | undefined {
    const suffix = `/${example}`
    const key = Object.keys(map).find((candidate) => candidate.endsWith(suffix))
    return key ? map[key] : undefined
}

/** 按登记顺序装配某一 locale 的卡片清单（示例缺失时退化为无预览，不抛错阻断整页）。 */
function buildItems(map: Record<string, () => Promise<unknown>>, locale: Locale): ShowcaseItem[] {
    return entries.map((entry) => {
        const loader = pickLoader(map, entry.example)
        return {
            name: entry.name,
            group: entry.group[locale],
            description: entry.description[locale],
            // 站点支持非根 base（VITEPRESS_BASE）：站内绝对路径须过 withBase，否则子路径部署下全部 404
            link: withBase(`${locale === 'en' ? '/en-US' : ''}/components/${toKebabCase(entry.name)}`),
            component: loader ? defineAsyncComponent(loader as () => Promise<Component>) : null,
        }
    })
}

const zhItems = buildItems(zhExamples, 'zh')
const enItems = buildItems(enExamples, 'en')

const { lang } = useData()
const locale = computed<Locale>(() => (String(lang.value).toLowerCase().startsWith('en') ? 'en' : 'zh'))
const items = computed(() => (locale.value === 'en' ? enItems : zhItems))

/** 连续同分组折叠为一段，保持登记顺序（登记表已按 §11 分组顺序与组内字母序排列）。 */
const groups = computed(() => {
    const result: { name: string, items: ShowcaseItem[] }[] = []
    for (const item of items.value) {
        const current = result.at(-1)
        if (current?.name === item.group) {
            current.items.push(item)
        } else {
            result.push({ name: item.group, items: [item] })
        }
    }
    return result
})
</script>

<template>
    <div class="caomei-showcase">
        <section
            v-for="group in groups"
            :key="group.name"
            class="caomei-showcase__group"
        >
            <h3 class="caomei-showcase__group-title">
                {{ group.name }}
            </h3>
            <ul class="caomei-showcase__grid">
                <li
                    v-for="item in group.items"
                    :key="item.name"
                    class="caomei-showcase__card"
                >
                    <div class="caomei-showcase__preview">
                        <div class="caomei-showcase__stage">
                            <component
                                :is="item.component"
                                v-if="item.component"
                            />
                        </div>
                    </div>
                    <div class="caomei-showcase__meta">
                        <a
                            class="caomei-showcase__name"
                            :href="item.link"
                        >{{ item.name }}</a>
                        <p class="caomei-showcase__description">
                            {{ item.description }}
                        </p>
                    </div>
                </li>
            </ul>
        </section>
    </div>
</template>

<style scoped>
.caomei-showcase__group-title {
    margin: 32px 0 0;
    border-top: none;
    font-size: 18px;
    letter-spacing: 0;
}

.caomei-showcase__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(280px, 100%), 1fr));
    gap: 16px;
    margin: 16px 0 0;
    padding: 0;
    list-style: none;
}

.caomei-showcase__card {
    display: flex;
    flex-direction: column;
    margin: 0;
    overflow: hidden;
    border: 1px solid var(--vp-c-divider);
    border-radius: 10px;
    background-color: var(--vp-c-bg);
    transition: border-color 0.25s, box-shadow 0.25s;
}

.caomei-showcase__card:hover {
    border-color: var(--vp-c-brand-1);
    box-shadow: 0 6px 20px rgb(0 0 0 / 8%);
}

.caomei-showcase__preview {
    display: flex;
    align-items: center;
    min-height: 168px;
    padding: 20px;
    overflow: auto;
    background-color: var(--vp-c-bg-soft);
    border-bottom: 1px solid var(--vp-c-divider);
}

.caomei-showcase__stage {
    width: 100%;
}

.caomei-showcase__meta {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 6px;
    padding: 14px 16px 16px;
}

.caomei-showcase__name {
    font-size: 15px;
    font-weight: 600;
    color: var(--vp-c-text-1);
    text-decoration: none;
}

.caomei-showcase__name:hover {
    color: var(--vp-c-brand-1);
}

.caomei-showcase__description {
    margin: 0;
    font-size: 13px;
    line-height: 1.6;
    color: var(--vp-c-text-2);
}
</style>
