# Milestone 13 — Codex実装解説

## `packages/cube-core/src/PermutationAnalysis.ts`

- 役割: CubeState間のpermutation、cycle、orientationを解析する。
- コード要約: 安定Cubie IDで移動先を対応付け、fixedを除いてcycle分解する。長さ3を抽出し、edge mod 2・corner mod 3のorientation差を返す。座標は`URF`、`ULB`、`UF`などの教材用position名にも変換する。

## `packages/cube-core/src/PermutationAnalysis.test.ts`

- 役割: 解析数学を検証する。
- コード要約: identity、Rの4-cycle、orientation、既知手順の3-cycleを確認する。

## `packages/cube-core/src/index.ts`

- 役割: Cube Core公開APIを定義する。
- コード要約: permutation解析functionと関連型を公開する。

## `packages/cube-core/src/Cube.ts`

- 役割: 非変更解析用のCube複製を提供する。
- コード要約: sticker、position、normalを複製する`clone()`により、解析sequenceを元Cubeへ影響させず適用する。

## `packages/api-contract/src/analyses.ts`

- 役割: sequence解析のrequest/response DTOを定義する。
- コード要約: corner/edge別にpermutation、cycle、3-cycle、fixed label、orientation deltaを公開し、解析前stateとsimulation後の`resultState`を区別する。

## `apps/api/src/application/analyzeCubeSequence.ts`

- 役割: Cube取得、clone、sequence適用、domain解析、DTO変換を行う。
- コード要約: sequenceを先にparseし、Cubeをcloneしてsimulationする。cycleの内部色IDを開始position labelへ変換し、cornerとedgeを分ける。

## `apps/api/src/http/handlers/handleSequenceAnalysisRequest.ts`

- 役割: `POST /api/cubes/{cubeId}/analyses`のHTTP境界。
- コード要約: media type、JSON、shape、sequenceを検証し、400/404/405/415/500へ変換する。Vercel rewrite後のquery routeも`handleCubeRequest`が同じhandlerへ渡す。

## `apps/api/src/http/milestone13.analysis.test.ts`

- 役割: 解析RESTの公開契約と非変更性を検証する。
- コード要約: cycle、3-cycle、fixed、orientation、identity、不正sequence、404、HTTP validation、rewriteを実テストで確認する。

## `docs/workbook/milestone_13.md`

- 役割: Agent実装範囲とCore解析結果の意味を示す。
- コード要約: Core、REST、application、DTOの完了を記録する。

## `docs/test-design/milestone_13.md`

- 役割: Core解析とREST testを分類する。
- コード要約: 数学的不変条件、REST、integration testを列挙する。

## `docs/report/milestone_13.md`

- 役割: Milestone 13の完了状態と品質ゲートを記録する。
- コード要約: Coreから実HTTPまでの完成を記録する。

## 後続Milestoneへの影響

Milestone 14は`cycles`と`threeCycles`のposition labelを順序表示に、`permutation`の`cubieId`を3D強調に、`orientationChanges`をtwist/flip表示に利用できる。FrontendはCube Coreを直接importせず、REST DTOだけに依存する。
