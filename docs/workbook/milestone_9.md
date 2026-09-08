# Milestone 9 — Preset REST + Database Workbook

## 実装方針

Milestone 9以降は自力実装枠を設けず、設計、production code、テスト、エラー処理、検証をAgentが担当する。本書は実装順と確認ポイントを追跡するために使う。

## 目的

名前付きMove sequenceをPreset resourceとしてREST経由でCRUDし、API processの再起動を越えてSupabase PostgreSQLへ永続化する。

## 準備済み

- `presets` table migration
- database生成UUID、timestamp自動更新、name制約、RLS
- migration構造test
- CRUD/persistenceのテスト項目
- server専用Supabase環境変数

## Agent実装予定

- Preset DTOと公開error契約
- create/list/get/update/deleteの5 REST操作
- request body、UUID、name、Move sequenceのvalidation
- application service
- repository interface
- Supabase repositoryとclient生成
- local/test用repository
- local serverとVercel Functionsのrouting
- integration testと永続化確認手順

## DB model

- `id`: database生成UUID
- `name`: trim後1〜100文字
- `moves`: validation済みSingmaster sequenceを文字列で保存。空手順も許可
- `created_at`, `updated_at`: timezone付きtimestamp

RLSは有効化し、Browser向けpolicyは作成しない。service role keyを保持するREST APIだけがDBを操作し、FrontendからSupabaseへ直接接続しない。

## REST契約の設計対象

1. `/api/presets`に対するPOSTとGET
2. `/api/presets/{presetId}`に対するGET、PUTまたはPATCH、DELETE
3. create/update DTOの必須・任意field
4. success statusとresponse DTO
5. validation、not found、repository failureの公開error変換

## 実装順

1. REST契約、DTO、error codeを確定する。
2. repository interfaceとin-memory実装でHTTP/application testを完成させる。
3. Supabase clientとrepositoryを実装する。
4. migrationを実環境へ適用し、process再起動を越える永続化を確認する。
5. Vercel routingと環境変数を設定する。
6. 全品質ゲートと詳細解説を完成させる。

## 後続Milestoneとの境界

Milestone 10はこのREST DTOだけを利用してPreset UIを作る。DB row形式やservice role keyをFrontendへ漏らさない。
