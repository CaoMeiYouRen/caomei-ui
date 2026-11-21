import { expect, test as base } from '@playwright/test'

/**
 * DataTable 固定表头与滚动（`scrollable` / `scrollHeight`）的真实浏览器回归。
 *
 * 判别口径：
 * 1. `scrollHeight` 给数字时限高必须是 `240px`（不能把 `240` 直接塞进 `max-height`）；
 *    给字符串 `18rem` 时按 CSS 长度生效；
 * 2. 容器 `scrollHeight > clientHeight` 才证明表体真的溢出（否则后续滚动断言无判别力）；
 * 3. 滚动后表体首行移出可视区，而 `th` 的顶边仍贴住容器顶边（吸顶），且表头计算定位为 `sticky`；
 * 4. 分页器在滚动容器内吸底（`position: sticky; bottom: 0`），滚到底部仍可见；
 * 5. 未开启 `scrollable` 的既有表格零行为变更（无限高、表头非 sticky）。
 *
 * 夹具见 `test/e2e/fixtures/app.vue` 的 `#data-table-scroll`。
 */

const NUMBER_TABLE = '#data-table-scroll-number'
const STRING_TABLE = '#data-table-scroll-string'
const FROZEN_TABLE = '#data-table-scroll-frozen'

/** 每个用例独立收集 console error / page error，并统一导航（与既有 e2e 同构）。 */
const test = base.extend<{ pageErrors: string[] }>({
    pageErrors: [async ({ page }, use) => {
        const errors: string[] = []
        page.on('console', (message) => {
            if (message.type() === 'error') {
                errors.push(`console.error: ${message.text()}`)
            }
        })
        page.on('pageerror', (error) => {
            errors.push(`pageerror: ${error.message}`)
        })

        await page.goto('/')
        await use(errors)
    }, { auto: true }],
})

test.afterEach(({ pageErrors }) => {
    expect(pageErrors, '页面不得产生 console error').toEqual([])
})

test('数字 scrollHeight 归一化为 px，表体溢出且表头吸顶', async ({ page }) => {
    await page.locator(NUMBER_TABLE).scrollIntoViewIfNeeded()
    const container = page.locator(NUMBER_TABLE)
    const header = page.locator(`${NUMBER_TABLE} thead th`).first()

    const limits = await container.evaluate((element) => ({
        maxHeight: getComputedStyle(element).maxHeight,
        scrollHeight: element.scrollHeight,
        clientHeight: element.clientHeight,
        overflowY: getComputedStyle(element).overflowY,
    }))
    expect(limits.maxHeight, '数字 scrollHeight 必须归一化为 px').toBe('240px')
    expect(limits.overflowY, '限高容器必须可纵向滚动').toBe('auto')
    expect(
        limits.scrollHeight,
        '40 行数据在 240px 限高下必须溢出（否则本用例无判别力）',
    ).toBeGreaterThan(limits.clientHeight)

    const headerPosition = await header.evaluate((element) => getComputedStyle(element).position)
    expect(headerPosition, '限高模式下表头必须 sticky').toBe('sticky')

    const containerTop = await container.evaluate((element) => element.getBoundingClientRect().top)

    await container.evaluate((element) => {
        element.scrollTop = element.scrollHeight
    })
    await expect.poll(
        () => container.evaluate((element) => element.scrollTop),
        { message: '滚到底部后滚动位置应大于 0' },
    ).toBeGreaterThan(0)

    const after = await container.evaluate((element) => {
        const headerCell = element.querySelector('thead th')
        const firstRow = element.querySelector('tbody tr')
        return {
            containerTop: element.getBoundingClientRect().top,
            headerTop: headerCell?.getBoundingClientRect().top ?? Number.NaN,
            firstRowTop: firstRow?.getBoundingClientRect().top ?? Number.NaN,
        }
    })
    expect(Math.abs(after.headerTop - after.containerTop), '滚动后表头顶边仍贴住容器顶边').toBeLessThanOrEqual(1)
    expect(after.firstRowTop, '滚动后首行应移出可视区（证明内容真的在动）').toBeLessThan(after.containerTop)
    expect(after.containerTop).toBe(containerTop)
})

test('字符串 scrollHeight 按 CSS 长度生效，分页器吸底且行可达', async ({ page }) => {
    await page.locator(STRING_TABLE).scrollIntoViewIfNeeded()
    const container = page.locator(STRING_TABLE)
    const pagination = page.locator(`${STRING_TABLE} .caomei-data-table__pagination`)

    const limits = await container.evaluate((element) => {
        const rootFontSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize)
        return {
            maxHeight: getComputedStyle(element).maxHeight,
            expected: `${18 * rootFontSize}px`,
            scrollHeight: element.scrollHeight,
            clientHeight: element.clientHeight,
        }
    })
    expect(limits.maxHeight, '`18rem` 必须按根字号换算生效').toBe(limits.expected)
    expect(limits.maxHeight).not.toBe('none')
    expect(limits.scrollHeight, '字符串限高下表体同样必须溢出').toBeGreaterThan(limits.clientHeight)

    const paginationPosition = await pagination.evaluate((element) => ({
        position: getComputedStyle(element).position,
        bottom: getComputedStyle(element).bottom,
    }))
    expect(paginationPosition.position, '限高模式下分页器必须吸底').toBe('sticky')
    expect(paginationPosition.bottom).toBe('0px')

    /** 测量分页器是否落在容器可视区内。 */
    const paginatorVisible = () => container.evaluate((element) => {
        const paginator = element.querySelector('.caomei-data-table__pagination')
        if (!paginator) {
            return null
        }
        const box = element.getBoundingClientRect()
        const paginatorBox = paginator.getBoundingClientRect()
        return paginatorBox.top >= box.top - 1 && paginatorBox.bottom <= box.bottom + 1
    })

    // 停在顶部：分页器在正常文档流里位于端口下方，只有 sticky 才能让它可见（有判别力的采样点）
    expect(await paginatorVisible(), '顶部时吸底分页器仍应在容器内可见').toBe(true)

    // 滚到中部：分页器仍吸底可见，且至少一行在端口内可读
    await container.evaluate((element) => {
        element.scrollTop = (element.scrollHeight - element.clientHeight) / 2
    })
    expect(await paginatorVisible(), '中部时吸底分页器仍在容器内可见').toBe(true)
    const rowVisible = await container.evaluate((element) => {
        const box = element.getBoundingClientRect()
        return [...element.querySelectorAll('tbody tr')].some((row) => {
            const rect = row.getBoundingClientRect()
            return rect.top >= box.top - 1 && rect.bottom <= box.bottom + 1
        })
    })
    expect(rowVisible, '中部时至少一行应完整落在可视区').toBe(true)

    // 滚到底部：最后一行进入容器可视区
    await container.evaluate((element) => {
        element.scrollTop = element.scrollHeight
    })
    const lastRowVisible = await container.evaluate((element) => {
        const rows = [...element.querySelectorAll('tbody tr')]
        const lastRow = rows.at(-1)
        if (!lastRow) {
            return null
        }
        const box = element.getBoundingClientRect()
        const row = lastRow.getBoundingClientRect()
        return row.top >= box.top - 1 && row.bottom <= box.bottom + 1
    })
    expect(lastRowVisible, '滚动到底部后最后一行应可达').toBe(true)
    expect(await paginatorVisible(), '底部时吸底分页器仍应可见').toBe(true)
})

test('scrollable + 冻结列：横向滚动后冻结表头仍是最上层', async ({ page }) => {
    await page.locator(FROZEN_TABLE).scrollIntoViewIfNeeded()
    const container = page.locator(FROZEN_TABLE)

    const metrics = await container.evaluate((element) => ({
        scrollWidth: element.scrollWidth,
        clientWidth: element.clientWidth,
    }))
    expect(
        metrics.scrollWidth,
        '冻结列用例必须横向溢出（否则本用例无判别力）',
    ).toBeGreaterThan(metrics.clientWidth)

    const layering = await container.evaluate((element) => {
        const headers = [...element.querySelectorAll('thead th')]
        const frozen = element.querySelector('thead th.caomei-data-table__cell--pinned-start')
        const plain = headers.find((header) => header !== frozen)
        return {
            frozenPosition: frozen ? getComputedStyle(frozen).position : null,
            frozenZ: frozen ? Number(getComputedStyle(frozen).zIndex) : Number.NaN,
            plainZ: plain ? Number(getComputedStyle(plain).zIndex) : Number.NaN,
        }
    })
    expect(layering.frozenPosition, '冻结表头必须 sticky').toBe('sticky')
    expect(
        layering.frozenZ,
        '冻结表头的层级必须高于普通吸顶表头（同层会按树序把冻结列盖住）',
    ).toBeGreaterThan(layering.plainZ)

    // 横向滚动后，冻结表头中心点必须命中自身（被普通表头覆盖时会命中后者）
    await container.evaluate((element) => {
        element.scrollLeft = 120
    })
    await expect.poll(
        () => container.evaluate((element) => element.scrollLeft),
        { message: '横向滚动应生效' },
    ).toBeGreaterThan(80)
    const hit = await container.evaluate((element) => {
        const frozen = element.querySelector('thead th.caomei-data-table__cell--pinned-start')
        if (!frozen) {
            return null
        }
        const box = frozen.getBoundingClientRect()
        const target = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)
        return { hitSelf: Boolean(target && (target === frozen || frozen.contains(target))) }
    })
    expect(hit, '冻结表头必须存在').not.toBeNull()
    expect(hit?.hitSelf, '横向滚动后冻结表头中心必须命中自身').toBe(true)

    // 选择 / 行展开 / 排序与限高同用：三者都在滚动容器内可用。
    const firstRow = container.locator('tbody tr').first()
    const checkbox = firstRow.locator('.caomei-checkbox__control').first()
    await checkbox.click()
    await expect.poll(
        () => container.locator('tbody tr').first().locator('.caomei-checkbox__control').evaluate(
            (element) => element.getAttribute('aria-checked'),
        ),
        { message: '限高容器内行选择应可用' },
    ).toBe('true')

    await firstRow.locator('.caomei-data-table__row-expander').click()
    await expect(
        container.locator('.caomei-data-table__row-expansion').first(),
        '限高容器内应渲染展开区',
    ).toBeVisible()

    const sortName = container.locator('thead th').filter({ hasText: '姓名' }).locator('.caomei-data-table__sort')
    const firstRowText = () => container.locator('tbody tr').first().innerText()
    const beforeSort = await firstRowText()
    await sortName.click()
    await expect.poll(
        () => container.locator('thead th').filter({ hasText: '姓名' }).getAttribute('aria-sort'),
        { message: '限高容器内排序应生效' },
    ).toBe('ascending')
    await sortName.click()
    await expect.poll(
        () => container.locator('thead th').filter({ hasText: '姓名' }).getAttribute('aria-sort'),
        { message: '再次点击应切换为降序' },
    ).toBe('descending')
    expect(await firstRowText(), '降序后首行必须不同于初始首行（证明行序真的变了）').not.toBe(beforeSort)
})

test('未开启 scrollable 的表格零行为变更', async ({ page }) => {
    const plain = page.locator('#data-table-sort-width .caomei-data-table').first()
    await plain.scrollIntoViewIfNeeded()
    const state = await plain.evaluate((element) => {
        const headerCell = element.querySelector('thead th')
        return {
            maxHeight: getComputedStyle(element).maxHeight,
            scrollHeight: element.scrollHeight,
            clientHeight: element.clientHeight,
            headerPosition: headerCell ? getComputedStyle(headerCell).position : null,
        }
    })
    expect(state.maxHeight, '未开启 scrollable 时不得限高').toBe('none')
    // `overflow-x: auto` 会让另一轴按 CSS 规则计算为 `auto`，故用「无纵向溢出」证明未新增纵向滚动
    expect(
        state.scrollHeight,
        '未开启 scrollable 时不应出现纵向溢出',
    ).toBeLessThanOrEqual(state.clientHeight)
    expect(state.headerPosition, '未开启 scrollable 时表头不得吸顶').not.toBe('sticky')
})
