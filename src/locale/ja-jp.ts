import type { CaomeiLocaleMessages } from './types'

const jaJP: CaomeiLocaleMessages = {
    qrcode: {
        label: 'QR コード',
        loading: 'QR コードを生成しています…',
        loadFailed: 'QR コードの生成に失敗しました。qrcode がインストールされ、内容がエンコード可能か確認してください。',
    },
    rating: {
        label: '評価',
        readonlyLabel: '読み取り専用の評価',
        valueLabel: '{value}',
    },
    autoComplete: {
        empty: '一致する候補がありません',
        open: '候補を表示',
    },
    calendar: {
        prev: '前月',
        next: '翌月',
        label: 'カレンダー',
    },
    chart: {
        loading: 'グラフを読み込み中…',
        loadFailed: 'グラフの読み込みに失敗しました。vue-echarts がインストールされているか確認してください',
    },
    cascader: {
        empty: 'データなし',
        clear: 'クリア',
    },
    checkbox: {
        selectAll: 'すべて選択',
    },
    colorPicker: {
        label: '色',
        hex: '16進数カラー',
        hue: '色相',
        area: '彩度と明度',
        swatches: 'プリセットカラー',
        saturation: '彩度',
        brightness: '明度',
        areaRole: 'カラーピッカー領域',
        thumbRole: 'カラースライダー',
    },
    confirm: {
        confirm: '確認',
        cancel: 'キャンセル',
    },
    dataView: {
        empty: 'データがありません',
    },
    datePicker: {
        label: '日付',
        range: '日付範囲',
        rangeStart: '開始',
        rangeEnd: '終了',
        time: '時刻',
        hour: '時',
        minute: '分',
        second: '秒',
        prevYear: '前年',
        nextYear: '翌年',
    },
    navBar: {
        label: 'ナビゲーションバー',
        back: '戻る',
    },
    dialog: {
        label: 'ダイアログ',
        close: '閉じる',
    },
    drawer: {
        label: 'ドロワー',
        close: '閉じる',
    },
    fileUpload: {
        choose: 'ファイルを選択',
        prompt: 'クリックしてファイルを選択、またはここにドラッグ＆ドロップ',
        noFileChosen: 'ファイルが選択されていません',
        fileChosen: '{count} 件のファイルを選択済み',
        sizeExceeded: '{name} はサイズ上限 {max} を超えています',
        remove: '{name} を削除',
    },
    image: {
        label: '画像プレビュー',
        preview: '画像をプレビュー',
        close: '閉じる',
    },
    input: {
        clear: 'クリア',
    },
    inputNumber: {
        increase: '増やす',
        decrease: '減らす',
    },
    inputOtp: {
        cellLabel: '確認コード {total} 桁中 {index} 桁目',
    },
    message: {
        close: '閉じる',
    },
    multiSelect: {
        open: '選択肢を表示',
        remove: '削除',
        empty: '一致する選択肢がありません',
        clear: 'クリア',
    },
    pagination: {
        label: 'ページネーション',
        first: '最初のページ',
        previous: '前のページ',
        next: '次のページ',
        last: '最後のページ',
        page: '{page} ページ',
        rowsPerPage: '1 ページあたりの件数',
    },
    password: {
        show: 'パスワードを表示',
        hide: 'パスワードを非表示',
        prompt: 'パスワードを入力してください',
        weak: '強度：弱',
        medium: '強度：中',
        strong: '強度：強',
    },
    progress: {
        loading: '読み込み中',
        bar: '進捗',
    },
    richTextEditor: {
        loading: 'エディターを読み込み中…',
        loadFailed: 'エディターの読み込みに失敗しました。md-editor-v3 がインストールされているか確認してください。',
    },
    select: {
        clear: 'クリア',
    },
    slider: {
        thumb: 'スライダー',
        minimum: '最小値',
        maximum: '最大値',
    },
    splitButton: {
        menu: 'その他の操作',
    },
    splitter: {
        resize: 'パネルのサイズを変更',
    },
    stepper: {
        label: 'ステップ',
    },
    tag: {
        close: '削除',
    },
    table: {
        empty: 'データがありません',
        selectAll: '現在のページをすべて選択',
        selectRow: '行を選択',
        expandRowGroup: 'グループを展開',
        collapseRowGroup: 'グループを折りたたむ',
        expandRow: '行を展開',
        collapseRow: '行を折りたたむ',
        columnResize: '「{column}」の列幅を調整',
    },
    tagsInput: {
        clear: 'クリア',
    },
    transfer: {
        source: 'ソース',
        target: 'ターゲット',
        search: '検索',
        empty: 'データなし',
        moveToTarget: '右へ移動',
        moveToSource: '左へ移動',
    },
    toast: {
        label: '通知',
        viewport: '通知 ({hotkey})',
        close: '閉じる',
    },
    backTop: {
        label: 'トップへ戻る',
    },
    timePicker: {
        hour: '時',
        minute: '分',
        second: '秒',
        am: '午前',
        pm: '午後',
    },
    actionSheet: {
        label: '操作パネル',
        cancel: 'キャンセル',
    },
    tabbar: {
        label: 'メインナビゲーション',
    },
    tour: {
        label: 'ツアー',
        next: '次へ',
        prev: '戻る',
        skip: 'スキップ',
        finish: '完了',
    },
}

export default jaJP
