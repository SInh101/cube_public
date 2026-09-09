# Milestone 13 — 3-cycle Analysis Workbook

## Agent実装済み

- Cubie permutation
- cycle decomposition
- 3-cycle抽出
- fixed cubie
- edge/corner orientation change
- 解析結果取得REST API: 最低1 endpoint
- request/response/error DTO
- Cubeを変更せずsequenceを解析へ渡すapplication処理
- corner/edgeを区別した公開response変換
- `URF`などの教材用position label
- Core、REST、rewrite、実HTTP test

## 自力実装

なし。Milestone 9以降の方針に従いAgentがすべて実装した。

## Core responseの意味

- `permutation`: 各pieceの移動元と移動先
- `cycles`: fixedを除いたcycle decomposition
- `threeCycles`: 長さ3のcycle
- `fixedCubieIds`: 位置が変わらないpiece。orientation changeは別項目で確認する
- `orientationChanges`: edgeはmod 2、cornerはmod 3のdelta

## 完了確認

- [x] corner/edge別のcycleを返す
- [x] identity、3-cycle、fixed、orientationを返す
- [x] `URF`などのposition labelを返す
- [x] 解析元Cubeを変更しない
- [x] 全品質ゲートが成功した
