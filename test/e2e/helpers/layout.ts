import { expect, type Locator, type Page } from '@playwright/test'

/**
 * 布局断言的公共基座。
 *
 * 口径来源：[响应式设计 §4](../../../docs/design/responsive.md) 的 6 条验收标准。
 * 几何断言只由 Playwright 承担（happy-dom 无布局引擎），见测试规范 §5。
 */

/** 几何容差：吸收子像素取整与 1px 边框 */
export const TOLERANCE = 1

export interface Box {
    x: number
    y: number
    width: number
    height: number
}

export interface Viewport {
    width: number
    height: number
}

/**
 * 视口尺寸以运行期 `window.innerWidth / innerHeight` 为准。
 * 移动端模拟（`isMobile`）下实际布局视口可能与配置值不同，取实测值可避免误判。
 */
export async function viewportOf(page: Page): Promise<Viewport> {
    return page.evaluate(() => ({ width: window.innerWidth, height: window.innerHeight }))
}

export async function boxOf(locator: Locator): Promise<Box> {
    const box = await locator.boundingBox()
    if (!box) {
        throw new Error('元素不可见或无几何盒，无法测量')
    }
    return box
}

/**
 * 元素的 client rect（padding box，视口坐标系）。
 *
 * 容器的「可视区」判定按响应式设计 §4 的口径使用 client rect（`boundingBox()` 是 border box，
 * 会多出边框宽）；成员侧仍用 border box 与容器 client rect 比较，避免边框处的子像素误差。
 */
export async function clientRectOf(locator: Locator): Promise<Box> {
    return locator.evaluate((element) => {
        const rect = element.getBoundingClientRect()
        return {
            x: rect.left + element.clientLeft,
            y: rect.top + element.clientTop,
            width: element.clientWidth,
            height: element.clientHeight,
        }
    })
}

/** 判定 `inner` 是否完整落在 `outer` 内（含容差） */
export function isBoxWithin(inner: Box, outer: Box): boolean {
    return inner.x >= outer.x - TOLERANCE
        && inner.y >= outer.y - TOLERANCE
        && inner.x + inner.width <= outer.x + outer.width + TOLERANCE
        && inner.y + inner.height <= outer.y + outer.height + TOLERANCE
}

/** 判定 `inner` 完整落在 `outer` 内（含容差） */
export function expectBoxWithin(inner: Box, outer: Box, label: string): void {
    expect(inner.x, `${label} 左侧越出容器`).toBeGreaterThanOrEqual(outer.x - TOLERANCE)
    expect(inner.y, `${label} 顶部越出容器`).toBeGreaterThanOrEqual(outer.y - TOLERANCE)
    expect(inner.x + inner.width, `${label} 右侧越出容器`).toBeLessThanOrEqual(outer.x + outer.width + TOLERANCE)
    expect(inner.y + inner.height, `${label} 底部越出容器`).toBeLessThanOrEqual(outer.y + outer.height + TOLERANCE)
}

/** 判定 `inner` 与 `outer` 可视区的重叠是否**超过** `minOverlap` 像素（判定用 `>`，等值不算） */
export function isBoxIntersecting(inner: Box, outer: Box, minOverlap = TOLERANCE): boolean {
    const overlapX = Math.min(inner.x + inner.width, outer.x + outer.width) - Math.max(inner.x, outer.x)
    const overlapY = Math.min(inner.y + inner.height, outer.y + outer.height) - Math.max(inner.y, outer.y)
    return overlapX > minOverlap && overlapY > minOverlap
}

/** 判定 `inner` 与 `outer` 可视区的重叠是否**超过** `minOverlap` 像素（判定用 `>`，等值不算） */
export function expectBoxIntersects(inner: Box, outer: Box, label: string, minOverlap = TOLERANCE): void {
    expect(
        isBoxIntersecting(inner, outer, minOverlap),
        `${label} 未落在容器可视区内：inner=(${inner.x}, ${inner.y}, ${inner.width}×${inner.height})，outer=(${outer.x}, ${outer.y}, ${outer.width}×${outer.height})`,
    ).toBe(true)
}

/** §4 断言 1：页面不得出现非预期横向溢出 */
export async function expectPageNoHorizontalOverflow(page: Page): Promise<void> {
    const metrics = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
    }))
    expect(
        metrics.scrollWidth,
        `页面横向溢出：scrollWidth=${metrics.scrollWidth} > clientWidth=${metrics.clientWidth}`,
    ).toBeLessThanOrEqual(metrics.clientWidth + TOLERANCE)
}

/** §4 断言 1：最近的容器不得出现非预期横向溢出 */
export async function expectLocatorNoHorizontalOverflow(locator: Locator, label: string): Promise<void> {
    const metrics = await locator.evaluate((element) => ({
        scrollWidth: element.scrollWidth,
        clientWidth: element.clientWidth,
    }))
    expect(
        metrics.scrollWidth,
        `${label} 横向溢出：scrollWidth=${metrics.scrollWidth} > clientWidth=${metrics.clientWidth}`,
    ).toBeLessThanOrEqual(metrics.clientWidth + TOLERANCE)
}

/**
 * §4 断言 2：浮层 / 面板的 bounding rect 必须落在视口内。
 *
 * 纵向是本断言的**加固项**（§4 只规定横向 `left >= 0 && right <= innerWidth`）：面板越出视口上下边
 * 同属可见性问题，当前用例的面板高度远小于视口高度，不会产生规范外的失败。
 */
export async function expectInsideViewport(locator: Locator, viewport: Viewport, label: string): Promise<void> {
    const box = await boxOf(locator)
    expect(box.x, `${label} 左侧越出视口`).toBeGreaterThanOrEqual(-TOLERANCE)
    expect(box.y, `${label} 顶部越出视口`).toBeGreaterThanOrEqual(-TOLERANCE)
    expect(box.x + box.width, `${label} 右侧越出视口`).toBeLessThanOrEqual(viewport.width + TOLERANCE)
    expect(box.y + box.height, `${label} 底部越出视口`).toBeLessThanOrEqual(viewport.height + TOLERANCE)
}

/**
 * §4 断言 6：面板宽度不得窄于触发器（可用宽足够时）。
 * 守卫 `min-width: min(触发器宽, 可用宽)` 的收敛语义，以及 Reka 可用宽变量重命名导致的静默失效。
 */
export async function expectPanelNotNarrowerThanTrigger(panel: Locator, trigger: Locator, label: string): Promise<void> {
    const [panelBox, triggerBox] = await Promise.all([boxOf(panel), boxOf(trigger)])
    expect(
        panelBox.width,
        `${label} 面板宽 ${panelBox.width} 低于触发器宽 ${triggerBox.width}`,
    ).toBeGreaterThanOrEqual(triggerBox.width - TOLERANCE)
}

/**
 * §4 断言 3（换行类容器）：容器纵向不得裁切，且每个成员的 rect 完整落在容器 client rect 内。
 * 只测横向 `scrollWidth` 会漏检「固定高度裁掉新增行」——口径与成因见 `docs/design/responsive.md` §4 断言 3。
 */
export async function expectWrapContainerNotClipped(container: Locator, members: Locator, label: string): Promise<void> {
    const metrics = await container.evaluate((element) => ({
        scrollHeight: element.scrollHeight,
        clientHeight: element.clientHeight,
    }))
    expect(
        metrics.scrollHeight,
        `${label} 纵向裁切：scrollHeight=${metrics.scrollHeight} > clientHeight=${metrics.clientHeight}`,
    ).toBeLessThanOrEqual(metrics.clientHeight + TOLERANCE)

    const count = await members.count()
    expect(count, `${label} 应至少有一个成员`).toBeGreaterThan(0)

    const containerRect = await clientRectOf(container)
    for (let index = 0; index < count; index += 1) {
        expectBoxWithin(await boxOf(members.nth(index)), containerRect, `${label} 第 ${index + 1} 个成员`)
    }
}

export interface ScrollContainerExpectation {
    /** 期望的计算 `overflow-x`：md 档（≤768px）为 `auto`，桌面为 `visible` */
    overflowX: 'auto' | 'visible'
    /** 内容是否确实超宽（「确有滚动量」） */
    scrollable: boolean
}

/**
 * §4 断言 1 / 3（滚动类容器）：容器按档位可滚动、每个成员自身内容不被裁切。
 *
 * 滚动量是否必须存在由用例声明：成员总宽未超出容器的组件（如 SplitButton）在窄屏同样
 * 命中 md 档规则，但不应被要求产生滚动条。
 */
export async function expectScrollContainerMembersNotClipped(
    container: Locator,
    members: Locator,
    expectation: ScrollContainerExpectation,
    label: string,
): Promise<void> {
    const metrics = await container.evaluate((element) => ({
        overflowX: getComputedStyle(element).overflowX,
        scrollWidth: element.scrollWidth,
        clientWidth: element.clientWidth,
    }))
    expect(metrics.overflowX, `${label} 的 overflow-x`).toBe(expectation.overflowX)
    if (expectation.scrollable) {
        expect(
            metrics.scrollWidth,
            `${label} 应确有滚动量：scrollWidth=${metrics.scrollWidth} <= clientWidth=${metrics.clientWidth}`,
        ).toBeGreaterThan(metrics.clientWidth)
    }

    const count = await members.count()
    expect(count, `${label} 应至少有一个成员`).toBeGreaterThan(0)

    for (let index = 0; index < count; index += 1) {
        const member = await members.nth(index).evaluate((element) => ({
            scrollWidth: element.scrollWidth,
            clientWidth: element.clientWidth,
        }))
        expect(
            member.scrollWidth,
            `${label} 第 ${index + 1} 个成员自身被裁切：scrollWidth=${member.scrollWidth} > clientWidth=${member.clientWidth}`,
        ).toBeLessThanOrEqual(member.clientWidth + TOLERANCE)
    }
}

/**
 * §4 断言 3（滚动类容器）的**可判定部分**：以真实按键节奏（Tab）遍历到最后一个成员后，
 * 聚焦成员必须落在容器可视区内（不得被裁切到可视区外）。
 *
 * 返回值：聚焦成员是否**完整**落在容器内（供行为观测与用例的补充断言）。
 *
 * **为何不是「必须完整」**：规范口径要求聚焦成员完整落在容器 client rect 内，但该强口径
 * **当前不可达且待用户裁定**（见 `docs/design/responsive.md` §4 的键盘聚焦段）。已实测的
 * native 行为：Chromium 的焦点滚动只在聚焦元素**与滚动区完全不相交**时才介入（触发后居中）；
 * 若聚焦前已有一条像素级可见边（前一个成员居中滚动后留下的窄边），浏览器不再滚动。该行为已在
 * 无组件 CSS 的纯 HTML 夹具上复现同构几何，判为非本库特有。故本用例只断言「相交」，
 * 强口径的可判定形态见 `expectKeyboardEntryRevealsFirstMember`，组件侧补偿见 backlog 候选。
 */
export async function expectKeyboardTabFocusVisibleInContainer(
    page: Page,
    container: Locator,
    members: Locator,
    label: string,
): Promise<boolean> {
    const count = await members.count()
    expect(count, `${label} 应至少有一个成员`).toBeGreaterThan(0)

    const last = members.nth(count - 1)
    await members.first().focus()
    for (let index = 1; index < count; index += 1) {
        await page.keyboard.press('Tab')
    }

    await expect(last, `${label} 键盘焦点应落在最后一个成员`).toBeFocused()

    const containerRect = await clientRectOf(container)
    const lastBox = await boxOf(last)
    expectBoxIntersects(lastBox, containerRect, `${label} 键盘聚焦的最后一个成员`)
    return isBoxWithin(lastBox, containerRect)
}

/** 把容器滚到最右端，构造「后续成员完全落在滚动区外」的确定性前置状态 */
export async function scrollContainerToEnd(container: Locator): Promise<void> {
    await container.evaluate((element) => {
        element.scrollLeft = element.scrollWidth
    })
}

/**
 * §4 断言 3（滚动类容器）：容器已滚到末尾时，键盘从容器外进入的首个成员必须被滚入可视区。
 *
 * 契约按聚焦前的实际几何判定（依据见 `expectKeyboardTabFocusVisibleInContainer` 的边界说明：
 * native 焦点滚动只保证「与滚动区相交」，仅当聚焦元素完全落在滚动区外时才保证完整滚入）：
 * - 聚焦前完全在滚动区外 ⇒ 聚焦后必须**完整**落在容器内；
 * - 聚焦前已相交 ⇒ 聚焦后必须仍相交。
 *
 * 返回值：strict 分支是否被触发（供行为观测；夹具几何应使其在 390 / 768 下触发）。
 * `entryFrom` 必须是 DOM 顺序上紧邻容器的可聚焦元素（夹具保证），否则 Tab 不会进入容器。
 */
export async function expectKeyboardEntryRevealsFirstMember(
    page: Page,
    container: Locator,
    members: Locator,
    entryFrom: Locator,
    label: string,
): Promise<boolean> {
    const count = await members.count()
    expect(count, `${label} 应至少有一个成员`).toBeGreaterThan(0)

    const first = members.first()
    await scrollContainerToEnd(container)

    const wasFullyOutside = !isBoxIntersecting(await boxOf(first), await clientRectOf(container))

    await entryFrom.focus()
    await page.keyboard.press('Tab')
    await expect(first, `${label} 键盘焦点应落在首个成员`).toBeFocused()

    const containerRect = await clientRectOf(container)
    const firstBox = await boxOf(first)
    expectBoxIntersects(firstBox, containerRect, `${label} 键盘进入的首个成员`)
    if (wasFullyOutside) {
        expectBoxWithin(firstBox, containerRect, `${label} 聚焦前完全在滚动区外的首个成员`)
    }
    return wasFullyOutside
}
