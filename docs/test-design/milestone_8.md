# Milestone 8 — テスト設計

## Agent実装済み

- M8-AN-01: animation開始後は操作不能になり、同時Move requestを送らない
- M8-AN-01: 完了通知後に操作を再開する

## 自力実装待ち

- M8-PB-01〜06: Play、Pause、Next、Previous、Reverse Play、Reset
- Boundary: 空sequence、先頭でPrevious、末尾でNext
- State transition: pause/resume、reverse切替
- Regression: speed変更後も完了通知を基準に一手ずつ進む

自力実装の公開UIが未確定なケースは`it.todo`として置き、production codeを要求する失敗testにはしていない。
