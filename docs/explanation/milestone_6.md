# Milestone 6 — Codex実装解説

Milestone 6の操作UIは学習者の自力実装範囲である。現段階ではAgent担当のテストと教材文書だけを追加し、production codeは変更していない。

学習者の初期実装後、明示依頼に基づいて`App.tsx`の修正も行った。

## `apps/web/src/App.tsx`

- 役割: Cubeの初期取得、表示状態、button／keyboard操作、Move API responseによるCubeState同期を管理する画面component。
- コード要約: 初期取得時にcubeIdを保持し、GUIとkeyboardが共有する`applyMove`から`POST /api/cubes/{cubeId}/moves`を呼ぶ。成功時はresponse stateとanimation対象Moveを保存する。GUI hover／focusだけでpreview stateを更新し、keyboardではpreviewを開始しない。

## `apps/web/src/components/CubeView.tsx`

- 役割: API確定後のCubeStateを表示しながら、直前のMoveに対応するlayer回転を補間する。
- コード要約: animationが指定された場合、完成後stateの対象9 cubieを回転groupへ分け、Moveと逆の角度から0まで240msでease-out補間する。GUI preview時は同じlayerを明るくし、透明なghostを複製して小角度で往復させる。previewはCubeStateを変更せず、描画終了時にはframeとGPU resourceをcleanupする。

## `apps/web/src/components/cubeViewModel.ts`

- 役割: 全18 Moveを回転軸、対象layer、回転角へ変換し、cubieが対象layerに属するか判定する。
- コード要約: R／Lをx、U／Dをy、F／Bをz軸へ対応づける設定を`CUBE_FACE_CONFIG`へ集約し、通常、prime、2回転の角度、highlight、ghostで共有する。sequenceの解釈やAPI処理は持たない。

## `apps/web/src/components/FaceControl.tsx`

- 役割: 1面分のCSS layer表示、面名、CW／CCW button、GUI preview通知を提供する共通component。
- コード要約: CubeStateから受け取った9色をCSS layerへ反映し、CWを通常Move、CCWをprime Moveへ変換する。mouse hoverとkeyboard focusで方向付きpreviewを通知し、click前と離脱時に解除する。

## `apps/web/src/components/FaceControlPanel.tsx`

- 役割: 6個のFaceControlを固定カメラ向けのCube net順に配置する。
- コード要約: U／L／F／R／B／Dをデータから生成し、Moveとpreview callbackを各FaceControlへ渡す。

## `apps/web/src/components/face-controls.css`

- 役割: WebGL rendererを追加せず、6個の3×3 layerを立体的に表現する。
- コード要約: CSS GridでCube netを配置し、perspective、face color、shadowでlayerを表現する。狭い画面では2列へ組み替える。

## `apps/web/src/components/FaceControlPanel.test.tsx`

- 役割: 面GUIの表示、Move変換、preview eventを検証する。
- コード要約: 6面すべてのCW／CCW、RとR'のcallback、U clockwise hoverの開始／解除、API由来sticker色の反映を確認する。

## `apps/web/src/components/index.ts`

- 役割: Appが描画componentとanimation Move型を同じ公開窓口から利用できるようにする。
- コード要約: `CubeView`、`FaceControlPanel`、`CubeMove`、`CubeFaceDirection`、`FacePreview`を再exportする。

## `apps/web/src/components/cubeAnimation.test.ts`

- 役割: 各Moveのanimation変換をThree.js描画から分離して検証する。
- コード要約: 6 faceの軸／layer、6 primeの逆方向、6 double Moveの半回転を検証する。

## `apps/web/src/App.milestone6.test.tsx`

- 役割: button、keyboard、Move API、React state同期、error表示の契約を自力実装に先行して固定する。
- コード要約: GUIのCW／CCW button、Move request、通常key、Shift付きinverse key、対応外key、Move失敗時のstate維持を検証する。新しいFaceControlPanelを観測用stubとしてmockし、既存App契約を維持する。

## `apps/web/src/App.milestone5.test.tsx`

- 役割: M6.1追加後もMilestone 5の初期取得とCubeView連携が回帰しないことを確認する。
- コード要約: FaceControlPanelを副作用のないstubとしてmockへ追加し、従来のloading／success／error契約を維持する。

## `MILESTONES.md`

- 役割: 後続Milestoneとの担当境界を固定する。
- コード要約: `isAnimating`、animation完了通知、実回転中の操作disableをMilestone 8のAgent担当として明記する。

## `docs/test-design/milestone_6.md`

- 役割: Milestone 6のテストケース、観測境界、Error契約、TDD開始状態を定義する。
- コード要約: UI eventからHTTP request、responseからCubeView propsまでを対象とし、Cube数学とThree.js内部を対象外にする。

## `docs/workbook/milestone_6.md`

- 役割: 学習者の実装範囲、操作契約、設計上の注意、禁止事項、確認方法を示す。
- コード要約: Appを中心にbuttonとkeyboardを共通Move送信関数へ接続する課題に加え、M6.1の固定カメラ用面操作GUI草案と確定した境界を記録する。animation完了制御はM8へ移し、CSS layer、GUI専用preview、既存Move設定の再利用を明記する。

## `docs/explanation/milestone_6.md`

- 役割: Milestone 6でCodexが追加・変更したファイルを追跡する本ファイル。
- コード要約: Agent担当のテストおよび教材文書を記録する。

## M6.1 追加調整

### `apps/web/src/App.tsx`

- Move成功ごとに単調増加するanimation IDを発行する。直前と同じMoveでも新しい操作は再生し、hover/focusによる再描画では過去のMoveを再生しない。
- `CubeView`と`FaceControlPanel`を`cube-workspace`でまとめ、広い画面では立体表示の右に操作盤を置ける構造にした。

### `apps/web/src/components/CubeView.tsx`

- 最後に再生したanimation IDを保持し、preview変更と直前Move animationの重複を防ぐ。
- Ghostをcubieの複製ではなく、対象layer全体を覆う半透明の単一Boxとして描画する。これによりパーツ間の段差や継ぎ目を表示しない。
- U/F/Rの中心ラベルを回転groupの外側に置く。中心パーツの表面に沿う位置と向きで描画し、各layerの回転には追従させない。
- 追加したtexture、geometry、materialもeffect終了時に破棄する。

### `apps/web/src/components/cubeViewModel.ts`

- `previewRotationAt`はGhostを正位置から指定方向へ動かし、反対方向を通らず正位置へ戻す角度を返す。

### `apps/web/src/components/face-controls.css` / `apps/web/src/styles.css`

- desktopでは立体Viewの右側に操作盤を配置し、狭い画面では従来どおり下へ折り返すresponsive layoutにした。
- main領域の最大幅を広げ、横方向の画面領域を利用する。
