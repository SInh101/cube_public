# Milestone 9 — テスト設計

## Agent実装済み

- migration必須column
- database生成UUID primary key
- `updated_at` trigger
- RLS有効化とbrowser向けpolicy不在

## 自力実装待ち（todo）

- CRUD 5操作
- processをまたぐ永続化
- 不正name/moves/UUID
- 存在しないresource
- repositoryが返すDB errorのHTTP変換

endpointとDTOを学習者が設計するため、REST testは名前のみ予約している。
