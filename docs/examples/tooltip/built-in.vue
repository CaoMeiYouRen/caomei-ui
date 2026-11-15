<script setup lang="ts">
import { Bold, Italic, Save, Underline } from '@lucide/vue'
import { ref } from 'vue'
import { CaomeiButton } from '@/components/button'
import { CaomeiDialog } from '@/components/dialog'
import { CaomeiDrawer } from '@/components/drawer'
import { CaomeiPaginator } from '@/components/paginator'
import { CaomeiSplitButton } from '@/components/split-button'
import type { SplitButtonMenuItem } from '@/components/split-button'
import { CaomeiToolbar, CaomeiToolbarButton, CaomeiToolbarSeparator } from '@/components/toolbar'
import { CaomeiIcon } from '@/icons'

const page = ref(3)
const dialogOpen = ref(false)
const drawerOpen = ref(false)

const menuItems: SplitButtonMenuItem[] = [
    { label: '另存为' },
    { label: '导出' },
]
</script>

<template>
    <div class="demo-section">
        <h4>Toolbar：图标按钮默认开启</h4>
        <p class="demo-hint">
            图标按钮没有可见文本，提示默认开启，内容取 label（即可访问名）；可访问名不变。
        </p>
        <CaomeiToolbar label="文本格式">
            <CaomeiToolbarButton label="加粗">
                <CaomeiIcon :icon="Bold" />
            </CaomeiToolbarButton>
            <CaomeiToolbarButton label="斜体">
                <CaomeiIcon :icon="Italic" />
            </CaomeiToolbarButton>
            <CaomeiToolbarSeparator />
            <CaomeiToolbarButton label="下划线">
                <CaomeiIcon :icon="Underline" />
            </CaomeiToolbarButton>
        </CaomeiToolbar>
    </div>

    <div class="demo-section">
        <h4>Paginator：四个翻页导航按钮</h4>
        <p class="demo-hint">
            首页 / 上一页 / 下一页 / 末页默认带提示，内容固定取各按钮的可访问名；传 <code>:tooltip="false"</code> 全部关闭。
        </p>
        <CaomeiPaginator
            v-model:page="page"
            :total="100"
            :items-per-page="10"
            show-edges
        />
    </div>

    <div class="demo-section">
        <h4>SplitButton：下拉按钮</h4>
        <p class="demo-hint">
            下拉（图标）按钮默认带提示，内容取 menuLabel；主按钮有可见文本，不挂提示。
        </p>
        <CaomeiSplitButton
            :model="menuItems"
            menu-label="更多操作"
        >
            保存
            <template #icon>
                <CaomeiIcon :icon="Save" />
            </template>
        </CaomeiSplitButton>
    </div>

    <div class="demo-section">
        <h4>Dialog / Drawer：关闭按钮</h4>
        <p class="demo-hint">
            关闭按钮默认带提示。面板打开时焦点会落在关闭按钮上，提示按「程序化聚焦不弹」处理，不会一开就弹。
        </p>
        <div class="demo-row">
            <CaomeiButton @click="dialogOpen = true">
                打开对话框
            </CaomeiButton>
            <CaomeiButton @click="drawerOpen = true">
                打开抽屉
            </CaomeiButton>
        </div>
        <CaomeiDialog
            v-model:open="dialogOpen"
            title="对话框标题"
            description="打开后把指针移到右上角关闭按钮上查看提示。"
        >
            <p class="demo-text">
                对话框正文内容。
            </p>
        </CaomeiDialog>
        <CaomeiDrawer
            v-model:open="drawerOpen"
            title="抽屉标题"
            description="打开后把指针移到关闭按钮上查看提示。"
        >
            <p class="demo-text">
                抽屉正文内容。
            </p>
        </CaomeiDrawer>
    </div>
</template>

<style scoped>
.demo-section {
    margin-bottom: 24px;
}

.demo-section h4 {
    margin: 0 0 8px;
    font-size: 14px;
    font-weight: 600;
    color: var(--caomei-color-text);
}

.demo-hint {
    margin: 0 0 12px;
    font-size: 13px;
    color: var(--caomei-color-text-muted);
}

.demo-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
}

.demo-text {
    margin: 0;
}
</style>
