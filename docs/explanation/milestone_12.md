# Milestone 12 — Codex実装解説

## `packages/cube-core/src/CubieAnalysis.ts`

- 役割: Face状態をcubieへ再構成し、前後差分を解析する。
- コード要約: 色集合を向きに依存しないpiece IDとし、同じ位置のID・sticker向きを比較してpermutation/orientationを分類する。

## `packages/cube-core/src/CubieAnalysis.test.ts`

- 役割: cubie再構成と変化検出を検証する。
- コード要約: 個数内訳、同一状態、R/R2の対象layerを確認する。

## `packages/cube-core/src/index.ts`

- 役割: Cube Core公開APIを定義する。
- コード要約: snapshot・change解析functionと関連型を公開する。

## `apps/web/src/components/cubeViewModel.ts`

- 役割: CubeStateをThree.js用cubieへ変換する。
- コード要約: 各cubieへCoreと同じ色集合形式の安定IDを追加する。

## `apps/web/src/components/cubeViewModel.test.ts`

- 役割: Web描画model変換を検証する。
- コード要約: cornerのIDがsticker方向ではなく色集合から決まることを確認する。

## `apps/web/src/components/CubeView.tsx`

- 役割: CubeStateと教材用強調を3D表示する。
- コード要約: 指定IDを発光強調し、任意で対象外を半透明にするpropsを追加する。

## `apps/web/src/App.milestone12.todo.test.tsx`

- 役割: 自力実装する教材UIのtest枠を予約する。
- コード要約: 4部分表示、current強調、3D接続、境界更新を`todo`にする。

## `docs/workbook/milestone_12.md`

- 役割: 自力実装規模と3D境界の利用方法を示す。
- コード要約: 最低5機能を未着手として記録する。

## `docs/test-design/milestone_12.md`

- 役割: 解析/3DとUI testを分類する。
- コード要約: 実装済み解析とpending UIを列挙する。

## `docs/report/milestone_12.md`

- 役割: Agent担当と自力担当の進捗を記録する。
- コード要約: 解析・3D境界完了、Teaching UI未着手を区別する。
