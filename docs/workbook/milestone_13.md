# Milestone 13 — 3-cycle Analysis Workbook

## Agentが準備したもの

- Cubie permutation
- cycle decomposition
- 3-cycle抽出
- fixed cubie
- edge/corner orientation change
- Core testとREST pending test

## 自力実装（未着手）

- 解析結果取得REST API: 最低1 endpoint
- request/response/error DTO
- Cubeまたはsequenceを解析へ渡すapplication処理
- corner/edgeを区別した公開response変換

規模: endpoint 1件以上、application処理1件、DTO/validation一式。

## Core responseの意味

- `permutation`: 各pieceの移動元と移動先
- `cycles`: fixedを除いたcycle decomposition
- `threeCycles`: 長さ3のcycle
- `fixedCubieIds`: 位置が変わらないpiece。orientation changeは別項目で確認する
- `orientationChanges`: edgeはmod 2、cornerはmod 3のdelta

## 完了確認

REST responseでcorner/edgeのcycle、identity、3-cycle、fixed、orientationを説明できる。
