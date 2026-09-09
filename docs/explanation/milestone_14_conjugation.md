# Milestone 14追加実装: 共役操作による3-cycle解析

## 目的

基本手順`A`へsetup手順`X`を適用し、共役`[X: A] = X A X'`によって3-cycleの構造を保ったまま対象位置が移ることを可視化する。

## 各ファイルの役割とコード要約

- `packages/cube-core/src/MoveSequence.ts`: `conjugateSequence`が`X`、`A`、既存の`invertSequence`で作った`X'`を順に連結する。
- `packages/api-contract/src/analyses.ts`: 任意の`conjugate`入力と、基本解析・展開手順・保存判定を返すDTOを定義する。
- `apps/api/src/application/analyzeCubeSequence.ts`: 基本手順と共役後を同じCube状態から非破壊で解析し、pure corner/edge 3-cycleが同じ種別で保たれるか判定する。
- `apps/api/src/application/ConjugateInputError.ts`: setup欄の構文エラーを基本手順のエラーと区別する。
- `apps/api/src/http/handlers/handleSequenceAnalysisRequest.ts`: `conjugate`を検証してapplication層へ渡し、不正なsetupを`conjugate`フィールドの400応答へ変換する。
- `apps/web/src/components/CycleTeachingPanel.tsx`: setup入力、`X A X'`の展開、元のcycle位置、移動後のcycle位置、保存判定を表示する。
- `apps/web/src/App.tsx`: optionalな`conjugate`をanalysis APIへ送り、共役後の解析を既存の3D強調・sticker表示・playbackへ接続する。

## 判定の意味

`preservesThreeCycle`は、基本手順が「cornerまたはedgeの片方だけを動かす単一の3-cycle」であり、共役後も同じ種別の単一3-cycleである場合に`true`になる。任意の手順を誤って3-cycleと表示しないため、基本手順自体がpure 3-cycleでなければ`false`とする。

群論上、正しい共役はcycle型を保存する。API側でも実際の置換を独立に解析して確認するため、展開やCube実装に不具合があれば判定・テストで検出できる。

## テストパターン

- `X A X'`の展開順、および`X'`の逆順・逆回転
- pure 3-cycleの位置が変わり、cycle種別と純粋性は保たれること
- 3-cycleでない基本手順を保存済みと誤判定しないこと
- 不正なsetup tokenが`conjugate`フィールドの400になること
- 解析前後でRepository内のCube状態が変わらないこと
- UIが共役入力を送信し、元位置・移動後位置・保存判定を表示すること

## 自力実装部分

なし。Milestone 10以降の運用ルールに従い、実装・テスト・文書化はAgent担当とする。
