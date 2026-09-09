# Milestone 14 — Codex実装解説

## `apps/web/src/analysis/cycleVisualization.ts`

- 役割: REST解析結果を3D表示用の値へ変換する。
- コード要約: 最初の3-cycleを選び、Coreの内部cycle方向を教材で読むsticker移動方向へ反転する。position labelから安定Cubie IDを引き、解析前後のsticker色を照合してcornerを3本のsticker cycleへ分解する。`URF`や`LDF`の先頭文字が対象面となり、残り2文字はそのpositionの基準順を保つ。選択中の物理ステッカーは現在のCube状態でも色で追跡する。

## `apps/web/src/components/CycleTeachingPanel.tsx`

- 役割: 3-cycle教材の入力、解析結果、選択、表示モード、再生操作をまとめる。
- コード要約: corner/edge cycle、orientation、固定pieceを表示する。Visualize stickersでは3本のsticker cycleを個別ボタンとして表示し、1セットずつ選択する。Close analysisから解析表示を明示的に終了できる。解析中・回転中・再生中・キュー同期前を分けてボタンを制御する。

## `apps/web/src/components/cycle-teaching-panel.css`

- 役割: 教材パネルを既存の右カラムへ収まるレスポンシブなUIにする。
- コード要約: 入力、cycle候補、モード、再生ボタンをgrid/flexで整理する。

## `apps/web/src/components/CubeView.tsx`

- 役割: 3-cycleの順序markerを3D Cube上に描画する。
- コード要約: markerを安定Cubie IDとステッカー色へ関連付ける。選択中の3枚だけを対象面の法線方向へ配置する。回転対象markerを同じturning groupへ移すため、animation中も対象piece・ステッカーに追従する。Sprite用resourceはcleanup時に破棄する。

## `apps/web/src/App.tsx`

- 役割: analysis REST境界、教材UI、CubeView、既存playbackを統合する。
- コード要約: 解析結果から初期cycleを選択し、movesを`usePlayback`へ設定する。解析結果とplayback queueが一致するまで再生を止め、更新競合を防ぐ。Practice / Analysisを切り替え、Analysisでは教材、共通Playback、手動操作盤の順に配置する。タブ切替時は再生をpauseするが、Cube状態と解析結果は保持する。

## `apps/web/src/components/ToolModeTabs.tsx`

- 役割: 通常操作と解析教材を切り替える上位navigationを提供する。
- コード要約: WAI-ARIAのtab / tabpanel関係を使い、PracticeとAnalysisを選択する。独立した`ToolMode`へ将来Tutorialを追加できる。

## `apps/web/src/components/tool-mode-tabs.css`

- 役割: 上位タブとモード内パネル、Analysis下段の手動操作領域を視覚的に区切る。
- コード要約: 選択tabを強調し、教材と低優先度操作盤の間へseparatorを置く。

## `apps/web/src/components/face-controls.css` / `apps/web/src/styles.css`

- 役割: 2列表示と1列表示の安全な境界を管理する。
- コード要約: 右カラムの必要幅を考慮して82rem以下で1列へ移行する。広い画面では右カラムだけを縦scrollとし、横overflowを防ぐ。mainはpaddingを含めてviewport幅へ収める。

## テストファイル

- `apps/web/src/analysis/cycleVisualization.test.ts`: labelから安定ID・markerへの変換
- `apps/web/src/components/CycleTeachingPanel.test.tsx`: 実コンポーネントの表示と操作制御
- `apps/web/src/App.milestone14.test.tsx`: REST、3D props、step、連続・逆再生、animation同期

## 後続への配慮

解析はCoreをFrontendへ直接持ち込まずREST DTOだけに依存する。3D表示は安定Cubie ID、再生は共通`usePlayback`を利用するため、将来の操作方式追加でも解析・描画・再生を独立して交換できる。Tutorialは上位モードとして追加でき、共有CubeViewと速度設定を再利用できる。
