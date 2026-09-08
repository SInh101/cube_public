# Milestone 12 — テスト設計

## Agent実装済み

- 26 cubieとcenter/edge/corner内訳
- 同一stateで変化なし
- R/R2の対象layerだけを変化として検出
- Web表示用Cubie IDの安定性

## REST / Teaching UI実装済み

- 交換子と4部分表示
- current part強調
- 解析結果からCubeView propsへの接続
- 部分境界での表示更新
- Cubeを変更しない交換子準備APIとvalidation
- 同一交換子を再準備した場合のPlayback位置初期化
- ローカル実HTTPから準備APIを利用できること

pending testはすべて実テストへ置換した。公開表示、ARIA current、REST request、Playback完了通知、CubeView propsを観測して検証する。
