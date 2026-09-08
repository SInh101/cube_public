# Milestone 11 — Commutator Core / REST 実装レポート

## 完了内容

- Commutator domain model
- 交換子展開
- 4部分の境界情報
- Commutator DTO
- Cubeへの交換子一括適用
- Commutator REST API
- validationと公開error変換
- local HTTP / Vercel rewrite対応
- domain、REST、integration test

## REST契約

`POST /api/cubes/{cubeId}/commutators`へA/Bを渡すと、`A B A^-1 B^-1`を対象Cubeへ適用し、展開手順、4境界、更新後stateを返す。

## 品質と制約

A/BはCube変更前に完全にparseされる。不正tokenではfieldと1始まりのtoken位置を返し、CubeStateを維持する。HTTP層、application層、Cube Core、Repositoryの依存方向を維持した。

Cube Repositoryは現時点でもprocess memory実装なので、ローカルserver再起動や別serverless instanceを越えたCube永続化はMilestone 11の範囲外である。

## テスト結果

- Test Files: 29 passed
- Tests: 276 passed / 0 todo
- TypeScript、ESLint、Prettier、production build: 成功

初回の全体テストでは既存Milestone 6の非同期UIテスト1件がtimeoutしたが、単独再実行と全体再実行で成功し、再現しなかった。Milestone 11の対象テストは全実行で成功した。
