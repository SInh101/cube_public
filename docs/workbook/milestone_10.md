# Milestone 10 — Preset Frontend Workbook

## Agentが準備したもの

- 必須機能8件のpending test名
- UI、HTTP、Playbackの責務分離観点
- 自力実装規模と完了確認

## 自力実装（未着手）

- Preset一覧: 1画面機能
- 新規登録、名前変更、手順変更、削除: 4 mutation
- Play、Reverse Play: 2再生操作
- loading/error表示: 1状態群

規模: 最低8機能。component/file分割は設計後に記録する。

## 設計時の境界

- FrontendはSupabaseへ直接接続せず、Milestone 9のREST APIだけを呼ぶ。
- Preset formは入力値を管理し、Cubeの数学処理を持たない。
- 再生はMilestone 8のstate machineと完了通知を再利用し、Preset画面内へ別の再生loopを作らない。
- request中、失敗、空一覧を区別する。

## 完了確認

M10-UI-01〜08を具体的な公開UIに合わせて実装済みtestへ変更し、全件成功させる。
