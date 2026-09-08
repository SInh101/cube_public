# Milestone 10 — テスト設計

テストとproduction codeはAgentが実装する。pending項目は自力実装待ちではなくAgent backlogとして扱う。

- Happy path: 一覧、登録、名前変更、手順変更、削除
- Playback: Play、Reverse Play
- Boundary: 空一覧、空手順、長い名前
- Invalid input: form validationとAPI validation error
- State transition: 編集開始・保存・cancel、削除確認
- Error: mutation失敗時に既存表示を維持する
- Architecture: Browserから呼ぶ先はREST APIだけ

公開UIのAgent実装前であるため、8件は`todo`として置いている。
