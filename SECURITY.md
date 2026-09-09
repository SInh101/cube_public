# Security policy for the public repository

## 公開リポジトリの実装ルール

このリポジトリへcommitするコード、設定、文書、fixtureには実際の秘密情報を含めない。

- API key、service-role key、access token、password、private key、接続文字列をcommitしない。
- 秘密情報はVercelまたはGitHubのEnvironment/Repository secretsへ保存する。
- `VITE_*`はbrowser bundleへ公開される。秘密情報には絶対に使用しない。
- Supabaseの`SUPABASE_SECRET_KEY`（legacyでは`SUPABASE_SERVICE_ROLE_KEY`）はVercel server環境だけで使用する。
- `.env.example`には変数名と無害な説明だけを置き、実値や実在するproject URLを置かない。
- ログ、error response、test snapshotへtoken、環境変数値、stack traceを出さない。
- 外部入力はHTTP境界で検証し、DBはRLSを有効にしてbrowserから直接service-role操作させない。
- 新しい外部サービスや依存を追加する場合、無料枠、従量課金、秘密情報の保管場所を実装前に確認する。
- commit前にtracked filesを秘密情報らしいpatternで検索し、`git diff`も確認する。

秘密情報を誤ってcommitした場合、履歴から消すだけでなく、対象credentialを直ちに失効・再発行する。

## 公開してよい設定

- GitHub Pagesの公開URL
- Vercel APIの公開URL
- `VITE_API_BASE_URL`
- 空欄または明らかなexample値

公開URLはcredentialではない。ただしSupabase service-role keyなど、権限を持つ値とは区別する。
