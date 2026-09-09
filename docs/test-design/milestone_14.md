# Milestone 14 — テスト設計

## View model

- cornerの3-cycleを優先して初期選択する
- position labelの巡回順を安定Cubie IDと1・2・3 markerへ変換する
- 選択先が存在しない場合は表示対象を返さない
- Coreの内部cycle方向を教材上のsticker移動方向へ正規化する
- 位置記号の先頭へ対象ステッカー面を置き、残りは基準位置の文字順を維持する
- corner cycleを3本、edge cycleを2本のsticker cycleへ分解する
- 選択した1本の物理ステッカーだけを現在向いている面へ配置する

## UI component

- cycle、orientation変化、固定pieceを表示する
- cycle選択と表示モード変更を通知する
- 解析結果と再生キューの同期前は再生操作だけを無効にする

## App integration

- 対象3 IDだけを`CubeView`へ渡し、対象外をdimする
- markerはlabelsモードでのみ渡す
- sticker markerはstickersモードでのみ渡す
- sticker cycle切替時は常に3枚だけを可視化する
- Nextは正方向の1手、Previousは直前の逆手を送る
- Play allとReverse allはanimation完了を待って順に送る
- animation完了前にstepを更新しない
- analysis APIの呼び出し自体はMove APIを呼ばない
- PracticeとAnalysisを上位tabで分離する
- 速度設定はtabより前、Analysisの手動操作盤は教材より後に配置する
- PresetはPracticeだけに表示する
- 右カラムが横overflowする前の90remで1列へ切り替え、広い画面では最大96remを利用する
- Close analysisで解析結果と3D highlight/markerを解除する

## 回帰ゲート

`npm test`、`npm run typecheck`、`npm run lint`、`npm run format:check`、`npm run build`をすべて成功させる。
