# Milestone 9 — Preset REST + Database Workbook

## Agentが準備したもの

- `presets` table migration
- UUID、timestamp自動更新、name制約、RLS有効化
- migration構造test
- CRUD/persistenceのpending test一覧
- server環境変数の安全な境界

## 自力実装（未着手）

- Preset CRUD REST API: 作成、一覧、単体取得、更新、削除の5操作
- Supabase client生成とPreset repository: 1境界
- application service: CRUDに必要な機能
- request/response/error DTOとvalidation

規模: REST操作5件、DB repository 1件以上。対象ファイル数は設計後に記録する。

## DB model

- `id`: database生成UUID
- `name`: trim後1〜100文字
- `moves`: text。空手順も保存可能
- `created_at`, `updated_at`: timezone付きtimestamp

RLSは有効でpolicyを作成していない。BrowserからSupabaseへ直接アクセスせず、service role keyを保持するREST APIだけがDBを操作する。

## 自力設計項目

1. Preset resourceのURIと各HTTP method/status
2. create/update DTOの必須・任意field
3. Move sequenceを保存時にvalidationする場所
4. Supabase errorを公開errorへ変換する境界
5. repository interfaceとSupabase実装の分離
