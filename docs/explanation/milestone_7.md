# Milestone 7 — Codex実装解説

## `packages/cube-core/src/MoveSequence.ts`

- 役割: Move列の不変値、文字列parse、inverse生成を提供する。
- コード要約: 空白区切りtokenを既存の`MOVES`で検証し、不正位置をerrorに保持する。inverseは配列順と各Moveを反転する。

## `packages/cube-core/src/MoveSequence.test.ts`

- 役割: MoveSequenceのdomain契約を検証する。
- コード要約: 正常、空白、空手順、不正token、inverse、identity propertyを検証する。

## `packages/cube-core/src/index.ts`

- 役割: Cube Coreの公開APIを定義する。
- コード要約: MoveSequence関連class、function、errorを公開する。

## `docs/workbook/milestone_7.md`

- 役割: 自力実装の課題と規模、事前設計項目を示す。
- コード要約: REST/UI要素の完了と、App接続の残作業を区別する。

## `docs/test-design/milestone_7.md`

- 役割: Agent実装済みdomain testと自力実装後の統合testを区別する。
- コード要約: 公開契約を中心に正常、境界、異常、原子性を列挙する。

## `docs/report/milestone_7.md`

- 役割: 現時点の達成範囲と残作業を記録する。
- コード要約: 自力実装・Agent修正・残作業・品質ゲート結果を記録する。

## `packages/api-contract/src/index.ts`

- 役割: HTTP DTOの公開入口を定義する。
- コード要約: Cube、Move、MoveSequenceをそれぞれのmoduleから公開する。

## `packages/api-contract/src/cubes.ts`

- 役割: Cube作成・状態取得のDTOだけを保持する。
- コード要約: MoveとMoveSequenceのDTOを責務別ファイルへ移し、Cube DTOとの混在を解消した。

## `packages/api-contract/src/moves.ts`

- 役割: 単一MoveのHTTP表現を定義する。
- コード要約: 18種類の`MoveDto` unionと`MoveRequestDto`を保持する。

## `packages/api-contract/src/moveSequences.ts`

- 役割: MoveSequence resourceのrequest/responseを定義する。
- コード要約: 入力文字列と検証済み`MoveDto`配列を、単一Move DTOを再利用して表現する。

## `packages/api-contract/src/errors.ts`

- 役割: machine-readableな公開error codeを定義する。
- コード要約: 不正sequence用の`SEQUENCE_NOT_CORRECT`を追加する。

## `apps/api/src/application/prepareMoveSequence.ts`

- 役割: Core parse結果をHTTP DTOへ変換するapplication境界のひな形。
- コード要約: 学習者の初期実装を修正し、`parseSequence()`の検証済みreadonly Move配列を型を広げずDTOへ格納する。CubeとRepositoryは変更しない。

## `apps/api/src/application/prepareMoveSequence.test.ts`

- 役割: sequence準備applicationの公開動作を検証する。
- コード要約: 空白正規化後のMove配列と、不正tokenのdomain error伝播を確認する。

## `apps/api/src/http/handlers/handleMoveSequenceRequest.ts`

- 役割: Sequence APIのHTTP境界ひな形。
- コード要約: 学習者の初期実装を修正し、method優先、Content-Type、JSON、厳密DTO shape、domain error、型付きError DTOを処理する。

## `apps/api/api/move-sequences.ts`

- 役割: Vercel Function entry pointの配置先を予約する。
- コード要約: 学習者の接続を整形し、`handleMoveSequenceRequest`をVercel Functionのdefault fetchへ割り当てる。

## `apps/web/src/components/MoveSequenceControl.tsx`

- 役割: sequence入力と一手適用UIのprops境界を定義するひな形。
- コード要約: 親が管理するstate/callback propsを使い、textarea、prepare、検証済みMove button、loading、errorを描画する。HTTP通信やstateは持たない。

## `apps/api/src/http/milestone7.sequence.test.ts`

- 役割: Sequence REST handlerの公開契約を検証する。
- コード要約: 正常、正規化、validation details、JSON、media type、method、非mutation、DTO shapeを自動検証する。

## `apps/web/src/components/MoveSequenceControl.test.tsx`

- 役割: Sequence入力UIの公開操作を検証する。
- コード要約: 入力・submit callback、Move一覧、一手適用callback、loading/errorを自動検証する。

## `apps/web/src/components/move-sequence-control.css`

- 役割: Sequence入力UIのlayoutと状態表現を定義する。
- コード要約: form、textarea、Move button、disabled、error、折返しMove一覧を装飾する。

## `apps/web/src/components/index.ts`

- 役割: Web componentの公開入口を定義する。
- コード要約: `MoveSequenceControl`とprops型を公開する。

## `apps/api/src/local/localServer.ts`

- 役割: ローカル実HTTP requestを適切なhandlerへ振り分ける。
- コード要約: `/api/move-sequences`をSequence handlerへ接続し、それ以外のCube経路を維持する。

## `apps/api/src/local/localServer.test.ts`

- 役割: ローカルAPIの実HTTP経路を検証する。
- コード要約: Sequence POSTが200と検証済みMove配列を返すことを追加確認する。

## `apps/web/src/App.tsx`

- 役割: Cube画面全体のstate、HTTP通信、component接続を管理する。
- コード要約: 学習者の`validateMoveSequence`初期案を修正し、入力・loading・error・検証済みMove stateを追加した。Sequence API成功時にMove配列を保持し、各Moveを既存`applyMove`へ渡す。

## `apps/web/src/App.milestone7.test.tsx`

- 役割: Sequence入力から単一Move適用までのFrontend統合を検証する。
- コード要約: Sequence request、Move配列表示、既存Move API呼び出し、CubeState更新、prepare失敗を確認する。

## `apps/web/src/App.milestone5.test.tsx`

- 役割: Milestone 5のFrontend回帰を検証する。
- コード要約: 新しいSequence componentを無作用mockへ追加し、既存Cube取得testを維持する。

## `apps/web/src/App.milestone6.test.tsx`

- 役割: Milestone 6の操作回帰を検証する。
- コード要約: 新しいSequence componentを無作用mockへ追加し、既存Move操作testを維持する。
