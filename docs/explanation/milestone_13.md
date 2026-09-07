# Milestone 13 — Codex実装解説

## `packages/cube-core/src/PermutationAnalysis.ts`

- 役割: CubeState間のpermutation、cycle、orientationを解析する。
- コード要約: 安定Cubie IDで移動先を対応付け、fixedを除いてcycle分解する。長さ3を抽出し、edge mod 2・corner mod 3のorientation差を返す。

## `packages/cube-core/src/PermutationAnalysis.test.ts`

- 役割: 解析数学を検証する。
- コード要約: identity、Rの4-cycle、orientation、既知手順の3-cycleを確認する。

## `packages/cube-core/src/index.ts`

- 役割: Cube Core公開APIを定義する。
- コード要約: permutation解析functionと関連型を公開する。

## `apps/api/src/http/milestone13.analysis.todo.test.ts`

- 役割: 自力実装する解析RESTのtest枠を予約する。
- コード要約: cycle、3-cycle、fixed、orientation、identity、errorを`todo`にする。

## `docs/workbook/milestone_13.md`

- 役割: 自力実装規模とCore解析結果の意味を示す。
- コード要約: REST/application/DTOを未着手として記録する。

## `docs/test-design/milestone_13.md`

- 役割: Core解析とREST testを分類する。
- コード要約: 実装済み数学testとpending REST testを列挙する。

## `docs/report/milestone_13.md`

- 役割: Agent担当と自力担当の進捗を記録する。
- コード要約: Core解析完了、REST未着手を区別する。
