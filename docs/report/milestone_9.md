# Milestone 9 — Preset REST + Database 実装レポート

## 目的

PresetをREST経由でSupabase PostgreSQLへ永続化する。

## Agent実装の範囲と規模

現段階は準備中。migration 1件、migration test 1ファイル、REST backlog 8件、接続環境変数を追加済み。CRUD 5操作とrepository/application/HTTP実装は次工程でAgentが実装する。

## 主要な設計判断

- BrowserからSupabaseへ直結しない
- service role keyはAPI serverだけで保持する
- RLSは有効にし、Browser用policyは作らない
- DB生成UUIDとDB timestampを永続化の正本にする
- HTTP/applicationをrepository interfaceから分離する

## 完了状況

Milestone 8からの移行とDB migration準備は完了。Milestone 9全体は未完了。

## テスト結果

- Test Files: 22 passed / 1 skipped
- Tests: 239 passed / 8 todo
- TypeScript、ESLint、Prettier、production build: 成功

8件のtodoはAgentが次工程で実装するPreset REST backlogである。skipped 1ファイルは外部Supabase環境を必要とする既存の任意integration testである。

## 次の作業

REST契約とDTOを確定し、in-memory repositoryでCRUD契約テストとproduction codeを同時に実装する。
