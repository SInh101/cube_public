# Milestone 8 — Codex実装解説

## `apps/web/src/components/CubeView.tsx`

- 役割: Move animationを描画し、完了を呼び出し元へ通知する。
- コード要約: 新しいanimation IDの描画が100%へ到達したとき一度だけ`onAnimationComplete`を呼ぶ。

## `apps/web/src/components/FaceControl.tsx`

- 役割: 一面の回転操作を表示する。
- コード要約: `disabled`をCW/CCW buttonへ反映する。

## `apps/web/src/components/FaceControlPanel.tsx`

- 役割: 全面操作へ共通の操作可否を配る。
- コード要約: `disabled`を各`FaceControl`へ伝播する。

## `apps/web/src/components/MoveSequenceControl.tsx`

- 役割: 検証済みMoveを一手ずつ操作するUIを表示する。
- コード要約: M7から引き継いだcomponentへ`disabled`境界を追加し、実回転中は入力・prepare・Move操作を無効にする。loading表示とは区別する。

## `apps/web/src/App.tsx`

- 役割: HTTP Moveと描画animationの境界を管理する。
- コード要約: Move成功時に`isAnimating`を立て、対応IDの完了通知で解除する。実回転中のGUIとkeyboard Moveを拒否する。

## `apps/web/src/components/face-controls.css`

- 役割: 操作盤の見た目を定義する。
- コード要約: disabled buttonを操作不能と判別できる色・cursorで示す。

## `apps/web/src/App.milestone8.test.tsx`

- 役割: animation境界と将来のPlayback契約を検証する。
- コード要約: disable・完了後再開を自動検証し、自力実装6操作をtodoとして予約する。

## `docs/workbook/milestone_8.md`

- 役割: 自力実装の規模とanimation境界の使用方法を示す。
- コード要約: 6操作とstate machineを未着手として記録する。

## `docs/test-design/milestone_8.md`

- 役割: 実装済みとpendingのtest patternを分類する。
- コード要約: animation、境界、状態遷移、回帰観点を記載する。

## `docs/report/milestone_8.md`

- 役割: Agent担当の達成範囲と残作業を記録する。
- コード要約: animation基盤完了とPlayback未着手を分離する。
