<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiRichTextEditor } from '@/index'

/*
 * 富文本编辑器窄屏几何夹具（见 test/e2e/rich-text-editor-overflow.e2e.ts）。
 *
 * 独立入口（`/rich-text-editor.html`）而非并入共享夹具：编辑器内核体积与运行期开销大，
 * 且其 console 噪声会与既有常驻用例的「无 console error」断言耦合；隔离后共享夹具的
 * DOM 顺序假设（如 ButtonGroup 紧邻 Dialog 触发器）也不受影响。
 *
 * `#rich-text-editor-narrow` 的宿主刻意用 `display: grid`：组件根曾只设 `width: 100%`，
 * 作为 grid 项时 `min-width: auto` 会被内核 nowrap 工具栏的 min-content 撑开，
 * 在窄屏下单点抬高整页宽度。该形态即回归判定所需的压力场景。
 */
const content = ref('# 标题\n\n正文内容')
</script>

<template>
    <main class="fixture">
        <section id="rich-text-editor-narrow" class="fixture__case">
            <div class="editor-host">
                <CaomeiRichTextEditor v-model="content" />
            </div>
        </section>
    </main>
</template>

<style scoped>
.fixture {
    padding: 16px;
    background: var(--caomei-color-bg);
}

/*
  grid 单列自动轨道：轨道最小值取该项的 min-content。编辑器根若缺 `min-width: 0`，
  轨道即被工具栏 min-content 撑宽，页面随之横向溢出——这正是被测契约的压力面。
*/
.editor-host {
    display: grid;
}
</style>
