# GitHub Pages + Vercel + Supabase 公開手順

## 1. Supabase

Free projectを作成する際はData APIを有効、Automatically expose new tablesを無効、automatic RLSを有効にする。`supabase/migrations`をファイル名順に適用する。`presets`と`cubes`はいずれもRLSが有効で、browser roleをrevokeし、Vercelの`service_role`だけへ明示的にCRUD権限を与える。

控える値:

- Project URL
- `service_role` key

これらをファイルへ書かない。特にservice-role keyは公開してはいけない。Vercelでは`SUPABASE_SERVICE_ROLE_KEY`をSensitiveとして登録する。

## 2. Vercel

GitHub repositoryをImportし、Root Directoryを`apps/api`にする。Root Directory設定の「Include source files outside of the Root Directory」を有効にし、workspaceの`packages/cube-core`と`packages/api-contract`をbuild対象へ含める。新しいVercel projectでは通常この設定は既定で有効だが、明示的に確認する。Framework PresetはOther、Overrideは不要で、repository内の`vercel.json`を利用する。

Vercel Environment Variablesへ次を設定する。

```text
SUPABASE_URL=<Supabase Project URL>
SUPABASE_SERVICE_ROLE_KEY=<Supabase service-role key>
CORS_ALLOWED_ORIGIN=https://<GITHUB_OWNER>.github.io
```

Preview/Productionで異なるFrontend originを使う場合は環境ごとに値を分ける。現在のAPIはcookie認証を使わないため、未設定時は`*`へfallbackするが、Productionでは正確なoriginを推奨する。

デプロイ後に`https://<VERCEL_PROJECT>.vercel.app/api/health`が`200`を返すことを確認する。

## 3. GitHub Pages

Repository SettingsでPages SourceをGitHub Actionsにする。ActionsのRepository variableへ公開API URLを設定する。

```text
VITE_API_BASE_URL=https://<VERCEL_PROJECT>.vercel.app
```

これはbrowserへ埋め込まれる公開URLなのでSecretではなくVariableでよい。`SUPABASE_SERVICE_ROLE_KEY`をGitHub Pages workflowへ渡してはいけない。

`main`へのpush、または`Deploy web to GitHub Pages` workflowの手動実行で配信する。

## 4. 公開後の確認

1. Pagesを開き、Cubeが表示される。
2. DevTools ConsoleにCORS errorがない。
3. Move、Reset、sequence playbackが動く。
4. ページを再読込して新しいCubeを作成できる。
5. Presetを保存し、再読込後も残る。
6. AnalysisでCommutator、3-cycle、Conjugationを実行できる。

## 無料枠を守る設計

- polling、cron、WebSocket、Realtime subscriptionを使用しない。
- ユーザー操作時だけ短時間のVercel Functionを呼ぶ。
- Cubeは1件あたり小さな54 sticker JSON、Presetは短いname/movesだけを保存する。
- 画像変換、Vercel Analytics、Speed Insights、Supabase Storage/Edge Functionsを使用しない。
- 学習用データに個人情報を保存しない。
- Usage dashboardを定期確認し、一般公開で想定外のtrafficが来た場合はdeploymentを停止できるようにする。

Cube行は現在自動削除しない。通常利用では小さいが、長期公開では古い行の手動削除または保存期限の導入を検討する。無料枠節約のため、常時実行cronは導入しない。
