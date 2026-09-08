# Milestone 8 — テスト設計

## Agent実装済み

- M8-AN-01: animation開始後は操作不能になり、同時Move requestを送らない
- M8-AN-01: 完了通知後に操作を再開する
- M8-AN-02: 実回転中はSequence入力・prepare・一手適用もdisableする
- M8-PB-01〜06 hook単体: Play、Pause、Next、Previous、Reverse Play、Reset
- Boundary: hook単体の先頭・末尾でindexを範囲内に保つ
- State transition: hook単体のpause、forward/reverse、完了時idle遷移
- M8-PB-01〜06 App/UI統合: 各操作からhook、Move・Reset REST、animation完了通知への接続
- PlaybackControls: 現在位置表示、callback、animation中もPauseだけ利用可能
- Regression: Move Sequenceなどの編集可能要素でkeydownしてもCube Moveを送らない

## 追加確認候補

- Regression: speed変更後も完了通知を基準に一手ずつ進む
