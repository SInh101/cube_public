# Milestone 8 — Playback Workbook

## Agentが準備したもの

- `CubeView`のanimation完了通知
- `App`の`isAnimating`境界
- 実回転中の面GUI・keyboard操作disable
- animation終了後の操作再開test
- Playback自力実装用のpending test名

## 自力実装

- Playback state machine: 1機能
- Play / Pause / Next / Previous / Reverse Play / Reset: 6操作
- sequenceと現在位置のstate管理
- timerまたはanimation完了通知を使った逐次実行

進捗: 明示依頼により`Play`と`Next`のhook内部処理はAgentが実装済み。App/UIへの接続と、Pause / Previous / Reverse Play / Resetは未着手。

規模: UI操作6件、state machine 1件。主な自力実装対象は新規2ファイル、接続1ファイル。

## 配置済みひな形

- `apps/web/src/playback/playbackTypes.ts`: 再生方向・状態・現在位置を表す型
- `apps/web/src/playback/usePlayback.ts`: Playback state machineと6操作の境界。関数本体が自力実装対象
- `apps/web/src/playback/index.ts`: playback型の公開口
- `apps/web/src/components/PlaybackControls.tsx`: 6操作を表示するcomponent。描画本体が自力実装対象
- `apps/web/src/App.tsx`: `usePlayback`と`PlaybackControls`を既存sequence・Move・animation完了通知へ接続する場所

`playbackTypes.ts`とprops/interfaceはAgentが用意した設計境界であり、自力実装数には含めない。自力実装の主対象は`usePlayback.ts`、`PlaybackControls.tsx`、`App.tsx`の接続部分である。

## 実装順序

1. ~~`usePlayback.ts`でstate初期値とNextを作る。~~ Agent実装済み
2. ~~animation完了通知を使い、Playの逐次実行を作る。~~ Agent実装済み
3. Pauseを実装する。
4. PreviousとReverse Playで必要なinverse変換を接続する。
5. Resetを既存Cube reset endpointと接続する。
6. `PlaybackControls.tsx`に6操作と現在位置を表示する。
7. `App.tsx`でprepared moves、`applyMove`、animation完了通知、操作disableを接続する。

## 利用できる境界

- `CubeViewProps.onAnimationComplete(animationId)`で描画完了を受け取れる。
- `isAnimating`中は既存Move操作が無効になる。
- 次のMoveは完了通知を受け取った後に送る。固定時間の`setTimeout`でanimation durationを複製しない。

## 完了確認

pendingのM8-PB-01〜06を実装済みtestへ変更し、全件成功させる。
