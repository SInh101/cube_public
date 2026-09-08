# Milestone 9 — テスト設計

テスト設計・実装・実行はすべてAgentが担当する。

## 実装済み

- migration必須column
- database生成UUID primary key
- `updated_at` trigger
- RLS有効化とBrowser向けpolicy不在

## Agent実装予定

- Happy path: create/list/get/update/delete
- Boundary: 空moves、name 1文字・100文字
- Invalid input: body、name、moves、UUID
- State transition: create後取得、update後取得、delete後404
- Persistence: repository再生成またはprocess再起動後も取得可能
- Repository failure: DB errorを内部情報のない公開errorへ変換
- Routing: local serverとVercel entryが同じhandlerを利用
- Architecture: FrontendやHTTP handlerがSupabaseへ直接依存しない

`milestone9.preset.todo.test.ts`の8件はAgentの実装backlogであり、自力実装待ちではない。REST契約確定後に観測可能な振る舞いを検証する実テストへ置き換える。
