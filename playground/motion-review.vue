<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import {
    CaomeiAccordion,
    CaomeiAccordionItem,
    CaomeiBreadcrumb,
    CaomeiBreadcrumbItem,
    CaomeiButton,
    CaomeiDialog,
    CaomeiDropdownMenu,
    CaomeiDropdownMenuContent,
    CaomeiDropdownMenuItem,
    CaomeiDropdownMenuLabel,
    CaomeiDropdownMenuTrigger,
    CaomeiMenu,
    CaomeiMenuItem,
    CaomeiPopover,
    CaomeiPopoverContent,
    CaomeiPopoverTrigger,
    CaomeiSubMenu,
    CaomeiTabContent,
    CaomeiTabList,
    CaomeiTabTrigger,
    CaomeiTabs,
    CaomeiToastProvider,
    CaomeiTooltip,
    CaomeiTooltipContent,
    CaomeiTooltipProvider,
    CaomeiTooltipTrigger,
} from '@/index'
import MotionToast from './motion-toast.vue'

/**
 * 动效审查页（`pnpm review:motion`）。
 *
 * 与文档站的差异：文档站的 VitePress 默认主题在「减少动态效果」下注入
 * `* { transition-duration: 0s !important; animation-duration: 1ms !important }`，
 * 会把演示区的过渡全部压平；本页不加载 VitePress 样式，展示组件库的真实行为。
 * 系统级 `prefers-reduced-motion` 仍会被组件库尊重（这是正确行为），页头会显示当前状态。
 */

declare const __CAOMEI_REVIEW_FORCE_MOTION__: boolean | undefined

/** 单文件审查产物在构建期移除了 reduce 规则，因此不受系统偏好影响。 */
const FORCE_MOTION = typeof __CAOMEI_REVIEW_FORCE_MOTION__ !== 'undefined' && __CAOMEI_REVIEW_FORCE_MOTION__

const TOKEN_KEYS = [
    '--caomei-motion-duration-instant',
    '--caomei-motion-duration-fast',
    '--caomei-motion-duration-base',
    '--caomei-motion-duration-emphasis',
    '--caomei-motion-duration-slow',
    '--caomei-motion-duration-slower',
    '--caomei-motion-ease-standard',
    '--caomei-motion-ease-out',
    '--caomei-motion-ease-in-out',
    '--caomei-motion-ease-linear',
    '--caomei-motion-distance-sm',
    '--caomei-motion-distance-md',
    '--caomei-motion-scale-from',
] as const

const expressive = ref(true)
const simulateReduce = ref(false)
const systemReduce = ref(false)
const dialogOpen = ref(false)
const demoRunning = ref(false)
const accordionOpen = ref<string | string[] | undefined>('shipping')
const activeTab = ref('account')
const tokens = ref<Record<string, string>>({})

let mediaQuery: MediaQueryList | null = null
let demoTimer: ReturnType<typeof setTimeout> | null = null
/** 用户一旦操作页面即中止演示，避免自动切换覆盖手动状态。 */
let demoAborted = false

/** 审查用自动演示：不点击也能看到进出场 / 展开 / 切换。 */
function cancelDemo(): void {
    demoAborted = true
    if (demoTimer) {
        clearTimeout(demoTimer)
    }
}

async function runDemo(): Promise<void> {
    if (demoRunning.value) {
        return
    }
    demoRunning.value = true
    demoAborted = false
    const wait = (ms: number) => new Promise((resolve) => {
        demoTimer = setTimeout(resolve, ms)
    })
    const stopped = () => demoAborted
    try {
        dialogOpen.value = true
        await wait(900)
        if (stopped()) {
            return
        }
        dialogOpen.value = false
        await wait(600)
        if (stopped()) {
            return
        }
        accordionOpen.value = accordionOpen.value ? undefined : 'shipping'
        await wait(600)
        if (stopped()) {
            return
        }
        accordionOpen.value = 'shipping'
        await wait(400)
        if (stopped()) {
            return
        }
        activeTab.value = activeTab.value === 'account' ? 'password' : 'account'
        await wait(500)
        if (stopped()) {
            return
        }
        activeTab.value = 'account'
    } finally {
        demoRunning.value = false
    }
}

function readTokens(): void {
    const computed = getComputedStyle(document.documentElement)
    const next: Record<string, string> = {}
    for (const key of TOKEN_KEYS) {
        next[key] = computed.getPropertyValue(key).trim()
    }
    tokens.value = next
}

function applyAxis(): void {
    if (expressive.value) {
        document.documentElement.setAttribute('data-motion', 'expressive')
    } else {
        document.documentElement.removeAttribute('data-motion')
    }
    // 等属性生效后再读 token
    requestAnimationFrame(readTokens)
}

function applyReducePreview(): void {
    document.documentElement.classList.toggle('motion-review--reduce', simulateReduce.value)
    requestAnimationFrame(readTokens)
}

function onSystemPreferenceChange(event: MediaQueryListEvent): void {
    systemReduce.value = event.matches
}

watch(expressive, applyAxis)
watch(simulateReduce, applyReducePreview)

onMounted(() => {
    mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    systemReduce.value = mediaQuery.matches
    mediaQuery.addEventListener('change', onSystemPreferenceChange)
    applyAxis()
    // 用户首次操作即停止自动演示；reduce 下动画会被压平，只展示警告不自动弹窗
    window.addEventListener('pointerdown', cancelDemo, { once: true })
    window.addEventListener('keydown', cancelDemo, { once: true })
    if (!systemReduce.value || FORCE_MOTION) {
        demoTimer = setTimeout(() => {
            if (!demoAborted) {
                void runDemo()
            }
        }, 800)
    }
})

onUnmounted(() => {
    cancelDemo()
    window.removeEventListener('pointerdown', cancelDemo)
    window.removeEventListener('keydown', cancelDemo)
    mediaQuery?.removeEventListener('change', onSystemPreferenceChange)
    document.documentElement.removeAttribute('data-motion')
    document.documentElement.classList.remove('motion-review--reduce')
})
</script>

<template>
    <CaomeiToastProvider>
        <CaomeiTooltipProvider>
            <div class="review">
                <header class="review-header">
                    <div>
                        <h1>动效审查</h1>
                        <p class="review-note">
                            用于目视核对 <code>data-motion</code> 轴、进出场节奏与减少动效行为；不加载文档站样式。
                        </p>
                    </div>
                    <div class="review-controls">
                        <CaomeiButton @click="expressive = !expressive">
                            {{ expressive ? '切到 minimal' : '切到 expressive' }}
                        </CaomeiButton>
                        <label class="review-check">
                            <input
                                v-model="simulateReduce"
                                type="checkbox"
                            >
                            模拟 reduce（仅 token 层）
                        </label>
                    </div>
                    <p
                        class="review-status"
                        :data-active="systemReduce"
                    >
                        系统动效偏好：{{ systemReduce ? (FORCE_MOTION ? 'reduce（本审查单文件已忽略该偏好）' : 'reduce（组件库会按无障碍规范压平；审查前请在系统或 DevTools 关闭）') : 'no-preference' }}
                    </p>
                    <div
                        v-if="systemReduce"
                        class="review-warning"
                        :class="{'review-warning--info': FORCE_MOTION}"
                        role="status"
                    >
                        <strong v-if="FORCE_MOTION">
                            检测到系统已开启「减少动态效果」；本单文件为审查用途已移除 reduce 规则，因此仍会播放动画。
                        </strong>
                        <strong v-else>
                            检测到系统已开启「减少动态效果」，本页与文档站都会压平动画——这是无障碍行为，不是缺陷。
                        </strong>
                        <span v-if="FORCE_MOTION">
                            真实减少动效行为请用 <code>pnpm review:motion</code>（开发态）或自动测试证据核对。
                        </span>
                        <span v-else>
                            关闭方式：Windows 设置 → 辅助功能 → 视觉效果 → 动画效果；macOS 辅助功能 → 显示 → 减少动态效果；
                            或在 Chrome DevTools → Rendering → Emulate CSS media feature
                            <code>prefers-reduced-motion</code> 选择 <code>no-preference</code> 后刷新。
                        </span>
                    </div>
                    <dl class="review-tokens">
                        <div
                            v-for="key in TOKEN_KEYS"
                            :key="key"
                            class="review-token"
                        >
                            <dt>{{ key.replace('--caomei-motion-', '') }}</dt>
                            <dd>{{ tokens[key] || '—' }}</dd>
                        </div>
                    </dl>
                    <p class="review-note">
                        Portal 面板跟随 <code>html</code> 上的属性；本页的轴开关直接作用于根节点。
                    </p>
                </header>

                <main class="review-main">
                    <section class="review-section">
                        <h2>反馈与浮层</h2>
                        <div class="review-row">
                            <CaomeiButton @click="dialogOpen = true">
                                打开对话框
                            </CaomeiButton>
                            <CaomeiPopover>
                                <CaomeiPopoverTrigger as-child unstyled>
                                    <CaomeiButton variant="secondary">
                                        打开 Popover
                                    </CaomeiButton>
                                </CaomeiPopoverTrigger>
                                <CaomeiPopoverContent>
                                    Popover 面板内容，可按 Esc 或点击外部关闭。
                                </CaomeiPopoverContent>
                            </CaomeiPopover>
                            <CaomeiDropdownMenu>
                                <CaomeiDropdownMenuTrigger as-child unstyled>
                                    <CaomeiButton variant="secondary">
                                        打开菜单
                                    </CaomeiButton>
                                </CaomeiDropdownMenuTrigger>
                                <CaomeiDropdownMenuContent>
                                    <CaomeiDropdownMenuLabel>操作</CaomeiDropdownMenuLabel>
                                    <CaomeiDropdownMenuItem>编辑</CaomeiDropdownMenuItem>
                                    <CaomeiDropdownMenuItem>复制</CaomeiDropdownMenuItem>
                                    <CaomeiDropdownMenuItem>删除</CaomeiDropdownMenuItem>
                                </CaomeiDropdownMenuContent>
                            </CaomeiDropdownMenu>
                            <CaomeiTooltip>
                                <CaomeiTooltipTrigger as-child unstyled>
                                    <CaomeiButton variant="secondary">
                                        悬停看 Tooltip
                                    </CaomeiButton>
                                </CaomeiTooltipTrigger>
                                <CaomeiTooltipContent>
                                    工具提示
                                </CaomeiTooltipContent>
                            </CaomeiTooltip>
                        </div>
                        <MotionToast class="review-subblock" />
                        <CaomeiDialog
                            v-model:open="dialogOpen"
                            title="动效审查对话框"
                            description="观察遮罩淡入、内容位移与缩放，以及关闭时的退场。"
                        >
                            <p class="review-note">
                                对话框内容示例。退场结束前 DOM 会保留，结束后再移除。
                            </p>
                            <template #footer>
                                <CaomeiButton
                                    variant="secondary"
                                    @click="dialogOpen = false"
                                >
                                    关闭
                                </CaomeiButton>
                            </template>
                        </CaomeiDialog>
                    </section>

                    <section class="review-section">
                        <h2>展开与切换</h2>
                        <CaomeiAccordion
                            v-model="accordionOpen"
                            collapsible
                        >
                            <CaomeiAccordionItem
                                value="shipping"
                                title="配送方式"
                            >
                                <p class="review-note">
                                    高度动画叠加淡入；连续点击可观察是否被打断。
                                </p>
                            </CaomeiAccordionItem>
                            <CaomeiAccordionItem
                                value="payment"
                                title="支付方式"
                            >
                                <p class="review-note">
                                    支持信用卡、支付宝与微信支付。
                                </p>
                            </CaomeiAccordionItem>
                        </CaomeiAccordion>

                        <CaomeiTabs
                            v-model="activeTab"
                            class="review-subblock"
                        >
                            <CaomeiTabList aria-label="动效审查分区">
                                <CaomeiTabTrigger value="account">
                                    账户
                                </CaomeiTabTrigger>
                                <CaomeiTabTrigger value="password">
                                    安全
                                </CaomeiTabTrigger>
                                <CaomeiTabTrigger value="team">
                                    团队
                                </CaomeiTabTrigger>
                            </CaomeiTabList>
                            <CaomeiTabContent value="account">
                                <p class="review-note">
                                    账户面板：切换时观察内容淡入与指示器移动。
                                </p>
                            </CaomeiTabContent>
                            <CaomeiTabContent value="password">
                                <p class="review-note">
                                    安全面板。
                                </p>
                            </CaomeiTabContent>
                            <CaomeiTabContent value="team">
                                <p class="review-note">
                                    团队面板。
                                </p>
                            </CaomeiTabContent>
                        </CaomeiTabs>
                    </section>

                    <section class="review-section">
                        <h2>导航与操作</h2>
                        <div class="review-columns">
                            <CaomeiMenu
                                label="主导航"
                                class="review-menu"
                            >
                                <CaomeiMenuItem
                                    href="#review"
                                    current
                                >
                                    概览
                                </CaomeiMenuItem>
                                <CaomeiSubMenu label="内容管理">
                                    <CaomeiMenuItem href="#review">
                                        文章
                                    </CaomeiMenuItem>
                                    <CaomeiMenuItem href="#review">
                                        评论
                                    </CaomeiMenuItem>
                                </CaomeiSubMenu>
                                <CaomeiMenuItem>退出登录</CaomeiMenuItem>
                            </CaomeiMenu>
                            <div class="review-column">
                                <CaomeiBreadcrumb label="面包屑">
                                    <CaomeiBreadcrumbItem href="#review">
                                        首页
                                    </CaomeiBreadcrumbItem>
                                    <CaomeiBreadcrumbItem href="#review">
                                        内容管理
                                    </CaomeiBreadcrumbItem>
                                    <CaomeiBreadcrumbItem current>
                                        文章详情
                                    </CaomeiBreadcrumbItem>
                                </CaomeiBreadcrumb>
                                <div class="review-row">
                                    <CaomeiButton>主要按钮</CaomeiButton>
                                    <CaomeiButton variant="secondary">
                                        次要按钮
                                    </CaomeiButton>
                                </div>
                                <p class="review-note">
                                    悬停按钮看抬升与颜色过渡；连续点击对话框可观察打断与终态。
                                </p>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </CaomeiTooltipProvider>
    </CaomeiToastProvider>
</template>

<style>
/*
  模拟 reduce：与组件库 `@media (prefers-reduced-motion: reduce)` 的 token 压平同构。
  只压 token 层（组件级 `animation: none` 仍由系统偏好触发），用于在没有系统设置时对比。
*/
html.motion-review--reduce {
    --caomei-motion-duration-instant: 0s;
    --caomei-motion-duration-fast: 0s;
    --caomei-motion-duration-base: 0s;
    --caomei-motion-duration-emphasis: 0s;
    --caomei-motion-duration-slow: 0s;
    --caomei-motion-duration-slower: 0s;
    --caomei-motion-distance-sm: 0px;
    --caomei-motion-distance-md: 0px;
    --caomei-motion-scale-from: 1;
}

body {
    margin: 0;
    background: var(--caomei-color-bg);
    color: var(--caomei-color-text);
    font-family: var(--caomei-font-sans);
}
</style>

<style scoped>
.review {
    max-width: 960px;
    margin: 0 auto;
    padding: 24px 20px 64px;
}

.review-header {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--caomei-color-border);
}

.review-header h1 {
    margin: 0 0 4px;
    font-size: 24px;
}

.review-controls {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
}

.review-check {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
}

.review-status {
    margin: 0;
    padding: 8px 12px;
    border-radius: var(--caomei-radius-md);
    background: var(--caomei-color-bg-elevated);
    font-size: 14px;
}

.review-status[data-active='true'] {
    color: var(--caomei-color-warning-text, var(--caomei-color-text));
}

.review-warning {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 12px 14px;
    border: 1px solid var(--caomei-color-warning, #b45309);
    border-radius: var(--caomei-radius-md);
    background: color-mix(in srgb, var(--caomei-color-warning, #b45309) 10%, transparent);
    font-size: 14px;
    line-height: 1.7;
}

.review-warning--info {
    border-color: var(--caomei-color-info, #2563eb);
    background: color-mix(in srgb, var(--caomei-color-info, #2563eb) 8%, transparent);
}

.review-warning code {
    font-family: var(--caomei-font-mono, monospace);
}

.review-tokens {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 4px 12px;
    margin: 0;
    font-size: 12px;
}

.review-token {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    padding: 4px 8px;
    border-radius: var(--caomei-radius-sm);
    background: var(--caomei-color-bg-elevated);
}

.review-token dt {
    color: var(--caomei-color-text-muted);
}

.review-token dd {
    margin: 0;
    font-variant-numeric: tabular-nums;
}

.review-main {
    display: flex;
    flex-direction: column;
    gap: 28px;
    padding-top: 24px;
}

.review-section {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.review-section h2 {
    margin: 0;
    font-size: 18px;
}

.review-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
}

.review-subblock {
    margin-top: 4px;
}

.review-columns {
    display: grid;
    grid-template-columns: minmax(180px, 240px) minmax(0, 1fr);
    gap: 24px;
    align-items: start;
}

.review-column {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.review-note {
    margin: 0;
    color: var(--caomei-color-text-muted);
    font-size: 14px;
    line-height: 1.6;
}

.review-note code {
    font-family: var(--caomei-font-mono, monospace);
}

@media (width <= 640px) {
    .review-columns {
        grid-template-columns: minmax(0, 1fr);
    }
}
</style>
