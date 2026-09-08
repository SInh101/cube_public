# Milestone 8 — Codex実装解説

## `apps/web/src/components/CubeView.tsx`

- 役割: Move animationを描画し、完了を呼び出し元へ通知する。
- コード要約: 新しいanimation IDの描画が100%に到達したとき、同じIDにつき一度だけ`onAnimationComplete`を呼ぶ。

## `apps/web/src/components/FaceControl.tsx`

- 役割: 一面の回転操作を表示する。
- コード要約: `disabled`をCW/CCWボタンへ反映する。

## `apps/web/src/components/FaceControlPanel.tsx`

- 役割: 全面操作へ共通の操作可否を配る。
- コード要約: `disabled`を各`FaceControl`へ伝播する。

## `apps/web/src/components/MoveSequenceControl.tsx`

- 役割: 検証済みMoveを一手ずつ操作するUIを表示する。
- コード要約: M7のcomponentへ外部`disabled`境界を追加し、実回転中は入力・prepare・Move操作を無効にする。loading状態とは独立して扱う。

## `apps/web/src/App.tsx`

- 役割: M7のMove sequenceフローを保ちつつ、HTTP Moveと描画animationの境界を管理する。
- コード要約: Move成功時に`isAnimating`を立て、対応するanimation IDの完了通知で解除して`usePlayback`へ通知する。PlaybackへMove・ResetのREST関数を注入し、通信失敗をhookへ伝播する。sequence位置に依存しない通常の`Reset cube`操作も操作盤へ配置する。

## `apps/web/src/components/face-controls.css`

- 役割: 操作不能状態の見た目を定義する。
- コード要約: disabled buttonを色とcursorで識別可能にする。

## `apps/web/src/App.milestone8.test.tsx`

- 役割: animation境界と将来のPlayback要件を検証する。
- コード要約: animation中は面操作とsequence操作の双方が無効になり、完了後に再開することを検証する。自力実装する6操作はtodoとして予約する。

## `apps/web/src/components/MoveSequenceControl.test.tsx`

- 役割: Move sequence UI単体の無効化契約を検証する。
- コード要約: 外部`disabled`指定時に入力、prepare、各Moveボタンがすべて無効になることを検証する。

## Playback自力実装用ひな形

- `apps/web/src/playback/playbackTypes.ts`: 再生方向、状態、sequence位置の型境界を定義する。
- `apps/web/src/playback/usePlayback.ts`: 明示依頼によりPlayback state machineの6操作を実装する。Move送信時に完了後の`targetIndex`を保持し、animation完了通知でのみ位置を確定する。PreviousとReverse PlayはMoveをinverseに変換し、Resetは注入された`resetCube`を呼ぶ。
- `apps/web/src/playback/usePlayback.test.tsx`: Play、Pause、Next、Previous、Reverse Play、Resetのhook単体契約を検証する。
- `apps/web/src/playback/index.ts`: playback型の公開口。
- `apps/web/src/components/PlaybackControls.tsx`: 現在位置・状態・方向と6操作を表示する。境界と再生状態に応じて操作をdisableし、実animation中もPauseだけは利用可能にする。
- `apps/web/src/components/playback-controls.css`: Playback panelを既存操作盤に合わせて配置し、操作可能・不能状態とresponsive layoutを定義する。
- `apps/web/src/components/PlaybackControls.test.tsx`: 表示、callback、animation中のPause可否を検証する。
- `apps/web/src/components/index.ts`: `PlaybackControls`とprops型を公開する。

## 文書

- `docs/workbook/milestone_8.md`: 自力実装の規模、操作、animation境界の利用方法を示す。
- `docs/test-design/milestone_8.md`: 実装済み境界とpendingのPlayback test patternを列挙する。
- `docs/report/milestone_8.md`: Agent担当の達成範囲、残作業、検証結果を記録する。
