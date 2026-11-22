<script setup lang="ts">
import { ref } from 'vue'
import { Bell, Compass, Home, User } from '@lucide/vue'
import { CaomeiButton } from '@/components/button'
import { CaomeiInput } from '@/components/input'
import { CaomeiInputGroup } from '@/components/input-group'
import { CaomeiNavBar } from '@/components/nav-bar'
import { CaomeiTabbar, CaomeiTabbarItem } from '@/components/tabbar'

const active = ref('home')
const keyword = ref('')
const lastAction = ref('')

function submitSearch(): void {
    lastAction.value = keyword.value.trim() ? `搜索：${keyword.value.trim()}` : '请输入关键词'
}
</script>

<template>
    <div class="shell-demo">
        <div class="shell-demo__scroll">
            <CaomeiNavBar
                title="项目列表"
                sticky
                label="页面导航"
                @back="lastAction = '返回'"
            >
                <template #end>
                    <CaomeiButton
                        size="sm"
                        variant="ghost"
                    >
                        新建
                    </CaomeiButton>
                </template>
            </CaomeiNavBar>
            <div class="shell-demo__body">
                <CaomeiInputGroup>
                    <CaomeiInput
                        v-model="keyword"
                        clearable
                        placeholder="搜索项目"
                        label="搜索项目"
                        @enter="submitSearch"
                    />
                    <CaomeiButton
                        variant="secondary"
                        @click="submitSearch"
                    >
                        搜索
                    </CaomeiButton>
                </CaomeiInputGroup>
                <p class="shell-demo__hint">
                    {{ lastAction || '输入关键词或点击返回' }}
                </p>
                <div class="shell-demo__list">
                    <p
                        v-for="index in 8"
                        :key="index"
                        class="shell-demo__row"
                    >
                        项目 {{ index }}
                    </p>
                </div>
            </div>
        </div>
        <div class="shell-demo__actions">
            <CaomeiButton
                variant="secondary"
                @click="lastAction = '取消'"
            >
                取消
            </CaomeiButton>
            <CaomeiButton @click="lastAction = '保存'">
                保存
            </CaomeiButton>
        </div>
        <CaomeiTabbar
            v-model="active"
            label="主导航"
        >
            <CaomeiTabbarItem
                value="home"
                label="首页"
                :icon="Home"
            />
            <CaomeiTabbarItem
                value="explore"
                label="发现"
                :icon="Compass"
            />
            <CaomeiTabbarItem
                value="notice"
                label="通知"
                badge="5"
                :icon="Bell"
            />
            <CaomeiTabbarItem
                value="me"
                label="我的"
                :icon="User"
            />
        </CaomeiTabbar>
    </div>
</template>

<style scoped>
.shell-demo {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 420px;
    height: 520px;
    overflow: hidden;
    border: 1px solid var(--caomei-color-border);
    border-radius: var(--caomei-radius-lg);
}

/* 滚动容器：页头作为其子元素才能吸顶 */
.shell-demo__scroll {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    overflow: auto;
}

.shell-demo__body {
    display: flex;
    flex-direction: column;
    gap: var(--caomei-space-3);
    padding: var(--caomei-space-3);
}

.shell-demo__hint {
    margin: 0;
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-sm);
}

.shell-demo__list {
    display: flex;
    flex-direction: column;
    gap: var(--caomei-space-2);
}

.shell-demo__row {
    margin: 0;
    padding: var(--caomei-space-2) var(--caomei-space-3);
    background: var(--caomei-color-bg-elevated);
    border-radius: var(--caomei-radius-md);
}

/* 操作条位于标签栏之上：底部安全区由标签栏承担，这里只留常规内边距 */
.shell-demo__actions {
    display: flex;
    gap: var(--caomei-space-2);
    padding: var(--caomei-space-3);
    border-top: 1px solid var(--caomei-color-border);
}

.shell-demo__actions > * {
    flex: 1;
}
</style>
