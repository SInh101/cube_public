# Milestone 8 — Playback Workbook

## Agentが準備したもの

- `CubeView`のanimation完了通知
- `App`の`isAnimating`境界
- 実回転中の面GUI・keyboard操作disable
- animation終了後の操作再開test
- Playback自力実装用のpending test名

## 自力実装（未着手）

- Playback state machine: 1機能
- Play / Pause / Next / Previous / Reverse Play / Reset: 6操作
- sequenceと現在位置のstate管理
- timerまたはanimation完了通知を使った逐次実行

規模: UI操作6件、state machine 1件。対象ファイル数は設計後に記録する。

## 利用できる境界

- `CubeViewProps.onAnimationComplete(animationId)`で描画完了を受け取れる。
- `isAnimating`中は既存Move操作が無効になる。
- 次のMoveは完了通知を受け取った後に送る。固定時間の`setTimeout`でanimation durationを複製しない。

## 完了確認

pendingのM8-PB-01〜06を実装済みtestへ変更し、全件成功させる。
