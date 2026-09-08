# Milestone 9 — Agent実装解説

## 全体設計

Presetは「名前付きMove sequence」というREST resourceである。BrowserはREST APIだけを利用し、APIがapplication serviceとrepository interfaceを経由してSupabaseへ保存する。

```text
Frontend（Milestone 10）
  → Preset REST handler
    → Preset application service
      → Preset repository interface
        → Supabase PostgreSQL
```

この依存方向により、HTTP契約、業務処理、DB SDKを分離し、テストではSupabaseを使わずrepositoryを差し替えられる。

## `supabase/migrations/202609080001_create_presets.sql`

- 役割: Preset永続化schemaを作成する。
- コード要約: `id`、`name`、`moves`、`created_at`、`updated_at`を定義し、update triggerとRLSを設定する。
- 設計理由: UUIDとtimestampをDBで生成すると、複数API instanceから書き込んでも一貫した値になる。RLSを有効にしBrowser policyを作らないことで、service roleを持つAPI経由に限定する。
- エラー・制約: `name`はtrim後1〜100文字。`moves`はNOT NULLで空文字を許可する。Move文法はDBではなくapplication境界で検証する。
- テスト: `presetMigration.test.ts`がcolumn、UUID default、trigger、RLSをSQL textから検証する。実DBへの適用確認は未実施。

## `supabase/migrations/.gitkeep`

- 役割: 空directory維持用だったファイル。
- コード要約: 実migration追加により不要となったため削除した。
- 設計理由: 空directoryではなくmigration自体がdirectoryをGit管理対象にするため。
- テスト: 対象外。

## `apps/api/src/repository/presetMigration.test.ts`

- 役割: migrationの重要な安全条件を高速に検証する。
- コード要約: SQLを読み、column、UUID、updated_at trigger、RLSとpolicy不在を確認する。
- 設計理由: Supabase未接続のCIでもschema退行を検知できる。ただしPostgreSQLで実行可能かまでは保証しない。
- テスト: このファイル自身がmigration構造testである。

## `apps/api/src/http/milestone9.preset.todo.test.ts`

- 役割: Agentが実装するPreset RESTの受け入れ条件を予約する。
- コード要約: CRUD、永続化、validation、404の8観点を`todo`で列挙する。
- 設計理由: REST契約確定前に誤ったstatusやDTOを固定しないため、現段階では名前だけを置いている。
- テスト: 契約確定後に実テストへ置換する。

## `.env.example`

- 役割: Supabase接続に必要な環境変数名と秘密情報の境界を示す。
- コード要約: `SUPABASE_URL`と`SUPABASE_SERVICE_ROLE_KEY`をserver専用として定義する。
- 設計理由: `VITE_*`はBrowser bundleへ公開され得るため、service role keyには絶対に使用しない。
- テスト: repository/client testで環境変数不足時の失敗を追加予定。

## `README.md`

- 役割: migration適用と接続設定を案内する。
- コード要約: Supabase環境変数とmigration directoryを説明する。
- 設計理由: local、CI、Vercelで同じ変数名を使用するため。
- テスト: 文書のため自動テスト対象外。

## Milestone文書

- `docs/workbook/milestone_9.md`: Agent実装範囲、実装順、後続境界を記録する。
- `docs/test-design/milestone_9.md`: 実装済みmigration testと今後のCRUD testを分類する。
- `docs/report/milestone_9.md`: 規模、設計判断、進捗、品質ゲートを記録する。

## 後続Milestoneへの影響

Milestone 10はPreset REST DTOにのみ依存する。DB column名、Supabase response型、service role keyをFrontend契約に含めてはならない。将来schemaを変更してもREST DTOを維持できる境界を守る。

## CRUD実装ファイル

### `packages/api-contract/src/presets.ts` / `index.ts`

- 役割: create/update request、単体/list responseの共有DTOを公開する。
- コード要約: DBのsnake_case timestampを公開せず、`createdAt`と`updatedAt`へ統一する。
- 設計理由: Milestone 10をSupabase row形式から分離するため。
- テスト: HTTP contract testがresponse形状を利用する。

### `apps/api/src/application/PresetService.ts` / `PresetErrors.ts`

- 役割: CRUD use case、trim、name長、Move文法、not-foundを管理する。
- コード要約: `parseSequence`でmovesを正規化してからrepositoryへ渡し、DB recordをDTOへ変換する。
- 設計理由: HTTP handlerとSupabase adapterへvalidationを重複させないため。
- テスト: Preset REST contract testが全use caseと異常系を経由する。

### `apps/api/src/repository/PresetRepository.ts`

- 役割: applicationが必要とする永続化操作を定義する。
- 設計理由: Supabase SDK・PostgRESTと業務処理を分離し、test/localで差し替えるため。
- テスト: in-memory repositoryを使うHTTP contract testがinterface利用を保証する。

### `apps/api/src/repository/InMemoryPresetRepository.ts`

- 役割: test/local fallback用のprocess内repository。
- コード要約: UUIDとtimestampを生成し、MapでCRUDする。
- 設計理由: credentialなしでもREST契約を実行できる。process再起動を越える永続化は保証しない。
- テスト: `milestone9.preset.test.ts`。

### `apps/api/src/repository/SupabasePresetRepository.ts`

- 役割: PostgREST経由で`presets` tableをCRUDする本番adapter。
- コード要約: service role headersを付け、snake_case rowをrepository recordへ変換する。
- 設計理由: SDK依存を増やさず標準`fetch`だけでVercel Functionsから利用できる。
- テスト: `SupabasePresetRepository.test.ts`がURL、秘密header、row変換を検証する。

### `apps/api/src/repository/sharedPresetRepository.ts` / `index.ts`

- 役割: 環境変数が揃えばSupabase、なければin-memory実装を選び、repository公開口を形成する。
- 設計理由: productionとcredentialなしlocal/testで同じhandlerを使用するため。

### `apps/api/src/http/handlePresetRequest.ts`

- 役割: collection/resource URI、HTTP method、JSON、UUID、公開error responseを処理する。
- コード要約: POST/GET/PUT/PATCH/DELETEを`PresetService`へ委譲し、201/200/204、400/404/405/500へ変換する。
- 設計理由: handlerにはDB操作やMove文法を置かず、HTTP固有処理だけに限定する。
- テスト: `milestone9.preset.test.ts`がCRUD、validation、404を検証する。

### routing files

- `apps/api/api/presets.ts`: Vercel Function entry。
- `apps/api/vercel.json`: `/api/presets/{presetId}`を単一entryへrewriteする。
- `apps/api/src/local/localServer.ts`: local HTTP serverから同じhandlerを呼び、PATCH/DELETE CORSを許可する。
