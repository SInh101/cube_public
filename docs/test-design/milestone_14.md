# Milestone 14 — テスト設計

## View model

- cornerの3-cycleを優先して初期選択する
- position labelの巡回順を安定Cubie IDと1・2・3 markerへ変換する
- 選択先が存在しない場合は表示対象を返さない
- 選択pieceの色をホーム面記号へ変換し、現在向いている面へsticker markerを配置する

## UI component

- cycle、orientation変化、固定pieceを表示する
- cycle選択と表示モード変更を通知する
- 解析結果と再生キューの同期前は再生操作だけを無効にする

## App integration

- 対象3 IDだけを`CubeView`へ渡し、対象外をdimする
- markerはlabelsモードでのみ渡す
- sticker markerはstickersモードでのみ渡す
- Nextは正方向の1手、Previousは直前の逆手を送る
- Play allとReverse allはanimation完了を待って順に送る
- animation完了前にstepを更新しない
- analysis APIの呼び出し自体はMove APIを呼ばない

## 回帰ゲート

`npm test`、`npm run typecheck`、`npm run lint`、`npm run format:check`、`npm run build`をすべて成功させる。
