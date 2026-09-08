# Milestone 9 — Preset REST + Database 実装レポート

## 目的

PresetをREST経由でSupabase PostgreSQLへ永続化する。

## Agent実装の範囲と規模

DTO 4型、CRUD 5操作、application service 1件、repository interfaceと2実装、HTTP/Vercel/local routing、migration 1件、自動テストを実装した。

## 主要な設計判断

- BrowserからSupabaseへ直結しない
- service role keyはAPI serverだけで保持する
- RLSは有効にし、Browser用policyは作らない
- DB生成UUIDとDB timestampを永続化の正本にする
- HTTP/applicationをrepository interfaceから分離する

## 完了状況

コードと自動テストの完了条件は達成した。実Supabase projectへのmigration適用とcredentialを使った永続化確認は環境依存の運用確認として残る。

## テスト結果

- Test Files: 24 passed
- Tests: 249 passed / 0 todo
- TypeScript、ESLint、Prettier、production build: 成功

Preset REST backlogはすべて実テストへ置換した。外部Supabase projectへの実接続はcredentialが必要なため自動テスト対象外とし、adapterのHTTP契約をmockで検証している。

## 次の作業

Milestone 10でPreset RESTを利用するFrontend CRUDを実装する。
