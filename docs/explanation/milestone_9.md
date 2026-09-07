# Milestone 9 — Codex実装解説

## `supabase/migrations/202609080001_create_presets.sql`

- 役割: Preset永続化schemaを作成する。
- コード要約: UUID primary key、name/moves、timestamp、updated_at trigger、RLSを定義する。Frontend用policyは作らない。

## `supabase/migrations/.gitkeep`

- 役割: 空directory維持用だったファイル。
- コード要約: 実migrationが追加されたため削除した。

## `apps/api/src/repository/presetMigration.test.ts`

- 役割: migrationの重要な安全条件を自動検証する。
- コード要約: column、UUID、timestamp trigger、RLSをSQL textから確認する。

## `apps/api/src/http/milestone9.preset.todo.test.ts`

- 役割: 自力実装するPreset REST契約のtest枠を予約する。
- コード要約: CRUD、永続化、validation、404を`todo`として列挙する。

## `.env.example`

- 役割: Supabase接続に必要な環境変数名を示す。
- コード要約: service role keyはserver専用で`VITE_*`にしないことを明記する。

## `README.md`

- 役割: projectの実行・接続方法を案内する。
- コード要約: migration適用と自力実装境界を追記する。

## `docs/workbook/milestone_9.md`

- 役割: DB modelと自力実装範囲を示す。
- コード要約: CRUD 5操作とrepositoryを未着手として記録する。

## `docs/test-design/milestone_9.md`

- 役割: migration testとREST test予定を分類する。
- コード要約: DB構造、CRUD、永続化、異常系を列挙する。

## `docs/report/milestone_9.md`

- 役割: Agent担当の達成状況を記録する。
- コード要約: migration完了とCRUD未着手を区別する。
