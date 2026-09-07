# Milestone 5 — Codex実装解説

## `apps/web/src/components/CubeView.tsx`

- 役割: `CubeState`を受け取り、Three.jsで3D Cubeを表示する純粋なviewer component。
- コード要約: scene、camera、light、26個のBox mesh、rendererをReact effect内で管理する。state更新時に表示を再構築し、resize対応とGPU resourceのcleanupを行う。API通信と操作処理は持たない。

## `apps/web/src/components/cubeViewModel.ts`

- 役割: APIの6 face×9 stickersを、3D上の26 cubieと外向き面へ変換する。
- コード要約: x／y／zが-1〜1の座標から中心を除外し、R／L／U／D／F／B配列のrow／columnをThree.jsの各Box面へ対応づける。

## `apps/web/src/components/cube-view.css`

- 役割: viewerの表示領域とcanvas layoutを定義する。
- コード要約: 正方形のresponsive領域、背景、角丸、canvasの表示寸法を設定する。

## `apps/web/src/components/index.ts`

- 役割: 学習者が`CubeView`とprops型を安定したpathからimportできる公開窓口。
- コード要約: `CubeView`と`CubeViewProps`を再exportする。

## `apps/web/src/components/cubeViewModel.test.ts`

- 役割: face配列から3D表示データへの変換を検証するAgent担当テスト。
- コード要約: 26 cubie、54 stickers、各色9枚、face上の位置対応を検証する。

## `apps/web/src/App.milestone5.test.tsx`

- 役割: 学習者のREST取得、React state、loading、error、props連携を検証するTDDテスト。
- コード要約: CubeViewを観測可能なstubへ置き換え、loading、POST→GET→state受け渡し、create／GET失敗時のerror表示を検証する。

## `apps/web/src/App.tsx`

- 役割: Cubeの初期取得とloading／error／successのReact stateを管理し、取得済みstateを`CubeView`へ渡す画面component。
- コード要約: 学習者の初期実装レビュー後の明示依頼に基づいて修正した。mount時にAbortSignal付きでCubeをPOST作成し、responseのローカル`cubeId`を使ってGETする。成功時はDTOのstateを保存して`CubeView`を表示し、非成功statusではalertを表示する。cleanup時は進行中のfetchを中止する。

## `apps/web/package.json`／`package-lock.json`

- 役割: 3D描画とcomponent testに必要な依存を管理する。
- コード要約: `three`、`@types/three`、`@rubiks-learning/api-contract`、Testing Library、jsdomをweb workspaceへ追加する。lockfileは解決済みversionを固定する。

## `packages/api-contract/src/index.ts`

- 役割: Frontendが既存DTOの構成型を共有する公開窓口。
- コード要約: 既に定義されていた`CubeColorDto`と`FaceStateDto`を追加公開し、表示層で型を重複定義せず利用できるようにする。

## `docs/test-design/milestone_5.md`

- 役割: Agent実装と自力実装のテスト範囲、責務境界、TDD開始状態を記録する。
- コード要約: 3D変換3件とApp連携4パターンを定義する。

## `docs/workbook/milestone_5.md`

- 役割: 自力実装するファイル、完成条件、利用可能な基盤、禁止事項を示す。
- コード要約: AppのPOST→GET、3状態、CubeView props、fetch cleanupに実装範囲を限定する。

## `docs/explanation/milestone_5.md`

- 役割: Milestone 5でCodexが追加・変更した全ファイルの役割とコード要約を記録する本ファイル。
- コード要約: production基盤、テスト、依存設定、教材文書を追跡する。
