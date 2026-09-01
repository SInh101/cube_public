# Milestone 1 — Cube Core

## 目的

HTTP、React、Databaseに依存しないCube教材基盤として、solved状態、reset、状態取得、18種類のMove適用を提供する。

## 実装した機能

- `Cube.solved()`
- `Cube.reset()`
- `Cube.getState()`
- `Cube.applyMove()`
- R／L／U／D／F／Bの通常、逆、2回転
- 6面54ステッカーの型付き状態モデル
- 座標・法線を利用した共通回転処理
- Cube Core unit test

## 自力実装

- 有無: なし
- 規模: 0ファイル、0機能、0 endpoint
- 対象: なし
- 自力担当: Cube CoreのAPIと状態モデルを説明できるようにする学習確認

学習者本人の理解確認は未実施であり、Agentによる回答の代筆は行っていない。

## Agentが担当した部分

Cube状態モデル、Move型、18種類のMove適用、座標回転ロジック、公開export、unit testを実装した。REST endpoint、HTTP DTO、React component、DB処理は実装していない。

## 設計

公開状態は`U/R/F/D/L/B`各面を左上から右下へ並べた9色の配列とした。内部では各ステッカーに整数座標と外向き法線を持たせ、対象layerだけを面の外側から見て時計回りに90度回転する。逆回転は時計回り3回、2回転は2回として同じ基礎処理を再利用する。

`getState()`は内部配列を公開せずsnapshotを返すため、取得後のMoveで過去の状態が変化しない。

## レビュー観点と修正

- 回転方向: F時計回り後の隣接4面の具体的な色配置で検証した。
- inverse: 全6面で通常Moveと逆Moveがidentityになることを検証した。
- permutation: 全18 Moveで54ステッカーと各色9枚が保存されることを検証した。
- 責務分離: Cube CoreはHTTP、React、Supabaseをimportしない。
- 後段互換性: 座標・法線モデルは3D表示、Cubie特定、cycle解析へ拡張可能である。

## テスト結果

- Cube Core: 40 tests passed
- Prettier: 成功
- ESLint: 成功
- TypeScript typecheck: 全workspaceで成功
- Production build: API、Frontendともに成功

## 理解確認

学習者本人によるCube Core APIと状態モデルの説明は未確認。

## 次Milestoneへの課題

Milestone 2で学習者がCube生成、状態取得、resetのREST resource、URI、method、status、request／responseを設計・実装する。Cube Core側へHTTP都合を持ち込まない。
