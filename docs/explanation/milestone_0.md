# Milestone 0 — Codex実装解説

Milestone 0でCodexが追加・変更した開発基盤とHealth疎通の解説です。後続MilestoneのCubeロジック、REST resource設計、DTO、DB schemaは含みません。

## ルート設定

### `package.json`

- 役割: npm workspacesとリポジトリ共通コマンドを定義する。
- コード要約: `apps/*`と`packages/*`をworkspaceにし、build、format、lint、typecheck、testをルートから実行できるようにする。Node.jsの最低バージョンと共通開発依存も定義する。

### `package-lock.json`

- 役割: npm依存関係を再現可能に固定する自動生成ファイル。
- コード要約: `npm install`が生成した各workspaceの解決済みパッケージ、バージョン、整合性情報を保持する。手作業では編集しない。

### `tsconfig.base.json`

- 役割: 全TypeScript workspaceで共有する型検査方針を定義する。
- コード要約: strict mode、未確認の配列アクセス、override、switch fallthroughなどに関する安全な既定値を提供する。

### `eslint.config.js`

- 役割: リポジトリ共通の静的解析設定を提供する。
- コード要約: JavaScriptとTypeScriptの推奨ルール、Browser／Nodeのglobal、Prettierと衝突するルールの無効化、生成物の除外を設定する。

### `.prettierrc.json`

- 役割: コード整形規則を定義する。
- コード要約: semicolon、single quote、trailing commaの統一方針を設定する。

### `.prettierignore`

- 役割: Prettierの検査・整形対象外を定義する。
- コード要約: 依存物、生成物、lockfile、ユーザー提供の教材Markdownを除外し、原文を自動整形で変更しないようにする。

### `vitest.config.ts`

- 役割: Vitestの共通設定を提供する。
- コード要約: テストがまだ存在しないMilestone 0でもCIが失敗しないよう`passWithNoTests`を有効にする。

### `.gitignore`

- 役割: Git管理しないローカルファイルと生成物を定義する。
- コード要約: `node_modules`、build／coverage出力、Vercelローカル情報、秘密を含み得るenvファイル、TypeScript生成情報を除外する。

### `.env.example`

- 役割: 必要になる環境変数名を秘密値なしで示す。
- コード要約: Frontend用API base URLと、後続のAPI用Supabase接続変数を定義する。service role keyをBrowserへ渡さない境界を示す。

## Frontend

### `apps/web/package.json`

- 役割: React／Viteアプリの依存とコマンドを定義する。
- コード要約: 開発サーバー、production build、preview、型検査のscriptと、React、Vite、React plugin、型定義を宣言する。

### `apps/web/index.html`

- 役割: Viteが配信するHTML entry point。
- コード要約: Reactのmount先`#root`を用意し、`src/main.tsx`をES moduleとして読み込む。

### `apps/web/tsconfig.json`

- 役割: FrontendのTypeScript project referencesの入口。
- コード要約: Browserアプリ設定とVite設定用Node projectを分離して参照する。

### `apps/web/tsconfig.app.json`

- 役割: Browserで動くReactコードの型検査設定。
- コード要約: DOM／ES2022、Bundler module resolution、React JSX、no emitを設定し、`src`だけを対象にする。

### `apps/web/tsconfig.node.json`

- 役割: `vite.config.ts`の型検査設定。
- コード要約: composite projectとしてES moduleとBundler resolutionを使用し、設定ファイルだけを対象にする。

### `apps/web/vite.config.ts`

- 役割: FrontendのVite buildを設定する。
- コード要約: React pluginを有効にし、GitHub Actions上ではrepository名をbase pathに使ってGitHub Pagesのsubpath配信に対応する。

### `apps/web/src/vite-env.d.ts`

- 役割: Vite固有の型をFrontendへ導入する。
- コード要約: `import.meta.env`などのVite client型をTypeScriptに認識させるreference directiveを持つ。

### `apps/web/src/main.tsx`

- 役割: ReactアプリをDOMへmountするentry point。
- コード要約: `StrictMode`内で`App`を`#root`へ描画し、共通CSSを読み込む。

### `apps/web/src/App.tsx`

- 役割: Milestone 0のHealth疎通だけを表示する最小コンポーネント。
- コード要約: mount時に`VITE_API_BASE_URL + /api/health`へfetchし、checking／ok／errorを表示する。unmount時はAbortControllerで通信を中止する。後続のCube UIや一般的なAPI状態管理は実装しない。

### `apps/web/src/styles.css`

- 役割: Health画面の最小スタイルを提供する。
- コード要約: 基本文字・背景・余白と、ok／error状態の色だけを定義する。

## REST API

### `apps/api/package.json`

- 役割: Vercel Functions workspaceの情報と検証コマンドを定義する。
- コード要約: buildとtypecheckをTypeScriptのno-emit検査として実行する。後続API用のdomain依存はまだ持たない。

### `apps/api/tsconfig.json`

- 役割: Vercel FunctionのTypeScript型検査設定。
- コード要約: NodeNext module、ES2022とWeb標準Request／Response用DOM型、no emitを設定し、`api/**/*.ts`だけを対象にする。

### `apps/api/vercel.json`

- 役割: API workspaceをVercel projectとして認識させる設定入口。
- コード要約: Vercel設定schema、Framework Presetなし、Output Directory `public`を指定する。Vercel Dashboardとローカル設定の差をなくし、Node.js runtimeは既定動作を利用する。

### `apps/api/public/index.html`

- 役割: API projectの最小静的ランディングページ兼、VercelのOutput Directory成立条件を満たすファイル。
- コード要約: API project名だけを表示する静的HTML。REST API処理、Frontend UI、状態管理は含まない。

### `apps/api/api/health.ts`

- 役割: 配備状態を確認する`GET /api/health` Function。
- コード要約: 現行VercelのWeb Handler形式で`fetch`を公開し、Web標準`Response.json`でHTTP 200と`{"status":"ok"}`を返す。Cube用endpoint設計は含まない。

## 後続Milestone用の境界

### `packages/cube-core/package.json`

- 役割: 将来のCube domain packageのworkspace境界を予約する。
- コード要約: package名、ES module export、型検査コマンドだけを定義する。

### `packages/cube-core/tsconfig.json`

- 役割: Cube Core用TypeScript設定を準備する。
- コード要約: HTTPやReactに依存しないES moduleとして`src`を型検査する設定だけを持つ。

### `packages/cube-core/src/index.ts`

- 役割: Cube Coreの公開entry pointを予約する。
- コード要約: Milestone 1より前にCube数学を先取りしないよう、空exportと説明コメントだけを持つ。

### `packages/api-contract/package.json`

- 役割: 将来のHTTP契約packageのworkspace境界を予約する。
- コード要約: package名、ES module export、型検査コマンドだけを定義する。

### `packages/api-contract/tsconfig.json`

- 役割: API contract用TypeScript設定を準備する。
- コード要約: Bundler resolutionを使う独立したES moduleとして`src`を型検査する。

### `packages/api-contract/src/index.ts`

- 役割: API contractの公開entry pointを予約する。
- コード要約: 学習者が後続MilestoneでHTTP契約を設計できるよう、空exportと説明コメントだけを持つ。

### `supabase/migrations/.gitkeep`

- 役割: 空のmigration directoryをGit管理可能にする。
- コード要約: コードやDB schemaは含まない。Preset schemaを先取りしないための空ファイル。

## CI・Deployment

### `.github/workflows/ci.yml`

- 役割: push／pull request時の自動検証を定義する。
- コード要約: Node.jsを準備し、`npm ci`後にformat、lint、typecheck、test、buildを順に実行する。

### `.github/workflows/pages.yml`

- 役割: main branchのFrontendをGitHub Pagesへ配備する。
- コード要約: Frontendをbuildし、`apps/web/dist`をPages artifactとしてupload／deployする。API URLはrepository variableからbuildへ渡す。

## 文書

### `README.md`

- 役割: 開発者向けのセットアップ、構成、検証、配備方法を案内する。
- コード要約: 依存方向、ローカル起動、env設定、検証コマンド、GitHub Pages／Vercel／Supabaseの扱いと未実装範囲を説明する。API projectの`public`はVercel出力成立用で、REST API本体は`api`配下のFunctionsであることも明記する。

### `docs/report/milestone_0.md`

- 役割: Milestone 0の実施内容と境界、検証結果を記録する。
- コード要約: 自力実装が0件であること、Codex担当範囲、依存方向、テスト結果、残存監査事項、次Milestoneへの課題をまとめる。

### `LEARNING_GUIDE.md`

- 役割: MilestoneごとのCodex実装解説を必須にするルールを保持する。
- コード要約: `docs/explanation/milestone_X.md`の作成、全変更ファイルの列挙、役割とコード要約の記載、後日の同期更新を規定する。

### `docs/explanation/milestone_0.md`

- 役割: このMilestoneでCodexが実装した各ファイルを学習者向けに説明する。
- コード要約: ファイル単位で責務、主要設定、処理の流れ、他の層との境界をまとめる本ファイル。
