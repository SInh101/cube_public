# Rubik's Cube Learning

公開リポジトリでの秘密情報の扱いは[`SECURITY.md`](SECURITY.md)、GitHub Pages・Vercel・Supabaseの設定は[`docs/deployment/public-hosting.md`](docs/deployment/public-hosting.md)を参照してください。

Rubik's Cubeを題材に、ReactとTypeScriptでREST API連携を学ぶためのモノレポです。Milestone 2までのCube CoreとローカルCube REST APIを含みます。

## 構成

```text
apps/web              React + TypeScript + Vite
apps/api              Vercel Functions
packages/cube-core    Cube教材基盤（Milestone 1以降）
packages/api-contract HTTP契約（後続Milestoneで学習者が設計）
supabase/migrations   DB migration（後続Milestone）
docs/report           Milestoneの実施・検証記録
docs/explanation      Codex実装のファイル別解説
```

依存方向は `Frontend -> REST API -> Cube Core / Repository -> Database` です。FrontendからCube CoreやSupabaseを直接操作しません。

## セットアップ

Node.js 20.19以上を用意し、ルートで次を実行します。

```sh
npm install
```

Milestone 2～8では、process内の一時的なCube stateをrequest間で維持するローカルAPIを起動します。別のターミナルでFrontendを起動します。

```sh
npm run dev:api
npm run dev:web
```

Cube APIのVercel公開は、永続repositoryを導入するMilestone 9まで延期します。ローカルAPIのstateはprocessを停止すると消えます。

APIのVercel projectはOutput Directoryとして`public`を使用します。`public/index.html`はVercel CLIが空ディレクトリエラーにしないための最小ページで、REST APIは引き続き`api`ディレクトリのFunctionsとして動作します。

FrontendをローカルAPIへ接続する場合、`apps/web/.env.local` に次を設定します。

```dotenv
VITE_API_BASE_URL=http://localhost:3000
```

## 確認

```sh
curl http://localhost:3000/api/health
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
```

Health APIは `200` と `{ "status": "ok" }` を返し、FrontendにはAPI statusが表示されます。

## デプロイ

- GitHub Pages: repository variable `VITE_API_BASE_URL` にVercel APIのURLを設定し、PagesのsourceをGitHub Actionsにします。
- Vercel: Milestone 8まではHealth APIだけを対象とし、stateを持つCube APIの公開は永続repositoryを導入するMilestone 9まで延期します。
- Supabase: API側に `SUPABASE_URL` と `SUPABASE_SERVICE_ROLE_KEY` を設定し、`supabase/migrations`を適用します。サービスロールキーをFrontendへ公開しないでください。Preset CRUDとrepository接続はMilestone 9でAgentが実装します。

## 学習範囲

後続MilestoneのREST resource、HTTP method、DTO、Cubeロジック、React状態管理、DB schemaは意図的に未実装です。
