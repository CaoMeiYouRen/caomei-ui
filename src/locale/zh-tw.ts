import type { CaomeiLocaleMessages } from './types'

const zhTW: CaomeiLocaleMessages = {
    qrcode: {
        label: '二維碼',
        loading: '正在產生二維碼…',
        loadFailed: '二維碼產生失敗，請確認已安裝 qrcode 且內容可編碼。',
    },
    rating: {
        label: '評分',
        readonlyLabel: '唯讀評分',
        valueLabel: '{value}',
    },
    anchor: {
        label: '錨點導覽',
    },
    autoComplete: {
        empty: '沒有符合的建議',
        open: '展開建議',
    },
    calendar: {
        prev: '上個月',
        next: '下個月',
        label: '日曆',
    },
    chart: {
        loading: '正在載入圖表…',
        loadFailed: '圖表載入失敗，請確認已安裝 vue-echarts',
    },
    cascader: {
        empty: '暫無資料',
        clear: '清除',
    },
    checkbox: {
        selectAll: '全選',
    },
    colorPicker: {
        label: '顏色',
        hex: '十六進位顏色',
        hue: '色相',
        area: '飽和度與明度',
        swatches: '預設顏色',
        saturation: '飽和度',
        brightness: '明度',
        areaRole: '顏色選擇區域',
        thumbRole: '顏色滑桿',
    },
    confirm: {
        confirm: '確定',
        cancel: '取消',
    },
    dataView: {
        empty: '暫無資料',
    },
    datePicker: {
        label: '日期',
        range: '日期範圍',
        rangeStart: '開始',
        rangeEnd: '結束',
        time: '時間',
        hour: '時',
        minute: '分',
        second: '秒',
        prevYear: '上一年',
        nextYear: '下一年',
    },
    navBar: {
        label: '導覽列',
        back: '返回',
    },
    dialog: {
        label: '對話框',
        close: '關閉',
    },
    drawer: {
        label: '抽屜',
        close: '關閉',
    },
    fileUpload: {
        choose: '選擇檔案',
        prompt: '點擊選擇檔案，或將檔案拖曳到此處',
        noFileChosen: '未選擇檔案',
        fileChosen: '已選擇 {count} 個檔案',
        sizeExceeded: '{name} 超過大小上限 {max}',
        remove: '移除 {name}',
    },
    image: {
        label: '圖片預覽',
        preview: '預覽圖片',
        close: '關閉',
    },
    input: {
        clear: '清除',
    },
    inputNumber: {
        increase: '增加',
        decrease: '減少',
    },
    inputOtp: {
        cellLabel: '驗證碼第 {index} 位，共 {total} 位',
    },
    message: {
        close: '關閉',
    },
    multiSelect: {
        open: '展開選項',
        remove: '移除',
        empty: '沒有符合的選項',
        clear: '清除',
    },
    pagination: {
        label: '分頁',
        first: '首頁',
        previous: '上一頁',
        next: '下一頁',
        last: '末頁',
        page: '第 {page} 頁',
        rowsPerPage: '每頁筆數',
    },
    password: {
        show: '顯示密碼',
        hide: '隱藏密碼',
        prompt: '請輸入密碼',
        weak: '強度：弱',
        medium: '強度：中',
        strong: '強度：強',
    },
    progress: {
        loading: '載入中',
        bar: '進度',
    },
    richTextEditor: {
        loading: '正在載入編輯器…',
        loadFailed: '編輯器載入失敗，請確認已安裝 md-editor-v3',
    },
    select: {
        clear: '清除',
    },
    slider: {
        thumb: '滑桿',
        minimum: '最小值',
        maximum: '最大值',
    },
    splitButton: {
        menu: '更多操作',
    },
    splitter: {
        resize: '調整面板大小',
    },
    stepper: {
        label: '步驟',
    },
    tag: {
        close: '刪除',
    },
    table: {
        empty: '暫無資料',
        selectAll: '全選本頁',
        selectRow: '選擇此列',
        expandRowGroup: '展開分組',
        collapseRowGroup: '收合分組',
        expandRow: '展開此列',
        collapseRow: '收合此列',
        columnResize: '調整「{column}」欄寬',
    },
    tagsInput: {
        clear: '清空',
    },
    transfer: {
        source: '來源列表',
        target: '目標列表',
        search: '搜尋',
        empty: '暫無資料',
        moveToTarget: '移到右側',
        moveToSource: '移到左側',
    },
    toast: {
        label: '通知',
        viewport: '通知 ({hotkey})',
        close: '關閉',
    },
    backTop: {
        label: '回到頂部',
    },
    timePicker: {
        hour: '時',
        minute: '分',
        second: '秒',
        am: '上午',
        pm: '下午',
    },
    actionSheet: {
        label: '操作面板',
        cancel: '取消',
    },
    tabbar: {
        label: '主導覽',
    },
    tour: {
        label: '產品導覽',
        next: '下一步',
        prev: '上一步',
        skip: '略過',
        finish: '完成',
    },
    carousel: {
        prev: '上一張',
        next: '下一張',
        slide: '第 {index} 張，共 {total} 張',
    },
}

export default zhTW
