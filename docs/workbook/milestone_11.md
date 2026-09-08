# Milestone 11 — Commutator Core Workbook

## Agentが準備したもの

- `Commutator(A, B)`
- `A B A^-1 B^-1`の生成
- A / B / A^-1 / B^-1の半開区間境界
- domain testとREST pending test

## Agent実装予定

- Commutator用REST API: 最低1 endpoint
- request/response/error DTO
- parse errorとCube not foundのHTTP変換
- 交換子をCubeへ適用するapplication処理

規模: endpoint 1件以上、application機能1件、DTO/validation一式。

## 自力実装

なし。Milestone 9以降の方針に従い、production code、テスト、エラー処理をAgentが一貫して実装する。

## 境界情報

`startIndex`は含み、`endIndex`は含まない。たとえばAがindex 0〜1なら`startIndex: 0, endIndex: 2`となる。この形式なら現在Move indexがどの部分かを`startIndex <= index < endIndex`で判定できる。

## 完了確認

RESTでA/Bを渡すと展開手順と4境界を取得でき、対象Cubeへ適用できる。
