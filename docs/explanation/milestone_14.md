# Milestone 14 — Codex実装解説

## `apps/web/src/analysis/cycleVisualization.ts`

- 役割: REST解析結果を3D表示用の値へ変換する。
- コード要約: 最初の3-cycleを選び、position labelからpermutation entryを引いて安定Cubie IDへ変換する。cycle順と同じ順に1・2・3 markerを作る。ステッカー表示では現在のCube状態から選択pieceを引き、色をホーム面記号へ変換して現在向いている面と対応付ける。

## `apps/web/src/components/CycleTeachingPanel.tsx`

- 役割: 3-cycle教材の入力、解析結果、選択、表示モード、再生操作をまとめる。
- コード要約: corner/edge cycle、orientation、固定pieceを表示する。解析中・回転中・再生中・キュー同期前を分けてボタンを制御する。

## `apps/web/src/components/cycle-teaching-panel.css`

- 役割: 教材パネルを既存の右カラムへ収まるレスポンシブなUIにする。
- コード要約: 入力、cycle候補、モード、再生ボタンをgrid/flexで整理する。

## `apps/web/src/components/CubeView.tsx`

- 役割: 3-cycleの順序markerを3D Cube上に描画する。
- コード要約: markerを安定Cubie IDへ関連付ける。ステッカーmarkerは対象面の法線方向へ配置する。回転対象markerを同じturning groupへ移すため、animation中も対象piece・ステッカーに追従する。Sprite用resourceはcleanup時に破棄する。

## `apps/web/src/App.tsx`

- 役割: analysis REST境界、教材UI、CubeView、既存playbackを統合する。
- コード要約: 解析結果から初期cycleを選択し、movesを`usePlayback`へ設定する。解析結果とplayback queueが一致するまで再生を止め、更新競合を防ぐ。別の操作体系を開始した場合は古い教材表示を消す。

## テストファイル

- `apps/web/src/analysis/cycleVisualization.test.ts`: labelから安定ID・markerへの変換
- `apps/web/src/components/CycleTeachingPanel.test.tsx`: 実コンポーネントの表示と操作制御
- `apps/web/src/App.milestone14.test.tsx`: REST、3D props、step、連続・逆再生、animation同期

## 後続への配慮

解析はCoreをFrontendへ直接持ち込まずREST DTOだけに依存する。3D表示は安定Cubie ID、再生は共通`usePlayback`を利用するため、将来の操作方式追加でも解析・描画・再生を独立して交換できる。
