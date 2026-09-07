# Milestone 6 — Codex実装解説

Milestone 6の操作UIは学習者の自力実装範囲である。現段階ではAgent担当のテストと教材文書だけを追加し、production codeは変更していない。

学習者の初期実装後、明示依頼に基づいて`App.tsx`の修正も行った。

## `apps/web/src/App.tsx`

- 役割: Cubeの初期取得、表示状態、button／keyboard操作、Move API responseによるCubeState同期を管理する画面component。
- コード要約: 初期取得時にcubeIdを保持し、buttonとkeyboardが共有する`applyMove`から`POST /api/cubes/{cubeId}/moves`を呼ぶ。R／L／U／D／F／BとShift付きinverseをFrontend用の限定型で表し、成功時はresponse stateとanimation対象Moveを保存する。失敗時は現在のCubeを残してalertを表示し、keyboard listenerをcleanupする。

## `apps/web/src/components/CubeView.tsx`

- 役割: API確定後のCubeStateを表示しながら、直前のMoveに対応するlayer回転を補間する。
- コード要約: animationが指定された場合、完成後stateの対象9 cubieを回転groupへ分け、Moveと逆の角度から0まで240msでease-out補間する。描画終了時または再描画時にはanimation frameとThree.js resourceをcleanupする。

## `apps/web/src/components/cubeViewModel.ts`

- 役割: 全18 Moveを回転軸、対象layer、回転角へ変換し、cubieが対象layerに属するか判定する。
- コード要約: R／Lをx、U／Dをy、F／Bをz軸へ対応づけ、通常、prime、2回転の角度を生成する。sequenceの解釈やAPI処理は持たない。

## `apps/web/src/components/index.ts`

- 役割: Appが描画componentとanimation Move型を同じ公開窓口から利用できるようにする。
- コード要約: 既存の`CubeView`に加え、`CubeMove`型を再exportする。

## `apps/web/src/components/cubeAnimation.test.ts`

- 役割: 各Moveのanimation変換をThree.js描画から分離して検証する。
- コード要約: 6 faceの軸／layer、6 primeの逆方向、6 double Moveの半回転を検証する。

## `apps/web/src/App.milestone6.test.tsx`

- 役割: button、keyboard、Move API、React state同期、error表示の契約を自力実装に先行して固定する。
- コード要約: 6 button、buttonからのMove request、通常key、Shift付きinverse key、対応外key、Move失敗時のstate維持を検証する。初期APIとMove API、CubeViewをmockし、HTTP requestとprops更新を観測する。

## `docs/test-design/milestone_6.md`

- 役割: Milestone 6のテストケース、観測境界、Error契約、TDD開始状態を定義する。
- コード要約: UI eventからHTTP request、responseからCubeView propsまでを対象とし、Cube数学とThree.js内部を対象外にする。

## `docs/workbook/milestone_6.md`

- 役割: 学習者の実装範囲、操作契約、設計上の注意、禁止事項、確認方法を示す。
- コード要約: Appを中心にbuttonとkeyboardを共通Move送信関数へ接続する課題を定義し、後続Milestoneの先取りを防ぐ。

## `docs/explanation/milestone_6.md`

- 役割: Milestone 6でCodexが追加・変更したファイルを追跡する本ファイル。
- コード要約: Agent担当のテストおよび教材文書を記録する。
