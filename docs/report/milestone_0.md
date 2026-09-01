# Milestone 0 — Project Bootstrap

## 目的

後続の学習を妨げない、Frontend・REST API・Cube Core・Databaseの開発基盤を準備する。

## 実装した機能

- npm workspacesによるモノレポ
- React + TypeScript + Viteの最小Frontend
- `GET /api/health` のVercel Function
- FrontendからHealth APIへの最小疎通表示
- Vitest、ESLint、Prettier、TypeScript設定
- GitHub ActionsのCIとGitHub Pagesデプロイ
- VercelとSupabase接続用の設定雛形

## 自力実装

- 有無: なし
- 規模: 0ファイル、0機能、0 endpoint
- 対象: なし
- 自力担当: 実装ではなく、Frontend・REST API・Cube Core／Repository・Databaseの依存関係を説明できるようにする学習確認

この学習確認は学習者本人が行うため、Agentによる「理解済み」の判定や回答の代筆は行っていない。

## Agentが担当した部分

Agentは開発基盤とHealth疎通のみを担当した。Cube Core、Cube用REST API、API contract、Reactの教材UI、DB migrationは後続Milestoneのため未実装としている。

## 依存関係

```text
Frontend -> REST API -> Cube Core / Repository -> Database
```

FrontendはHTTP経由でREST APIだけを利用する。Cube CoreはHTTPやReactを知らず、Supabaseの秘密情報はREST APIだけが保持する。

## テスト結果

- Prettier: 成功
- ESLint: 成功
- TypeScript typecheck: 全workspaceで成功
- Vitest: 成功（Milestone 0ではテストケースなし）
- Production build: API、Frontendともに成功
- Health handler: `200` / `{ "status": "ok" }` を確認

`npm audit` には、開発時にのみ利用する`tsx`配下の`esbuild`について低重要度1件が残る。依存元の互換範囲内に修正版がまだ解決されないため、破壊的なoverrideは行っていない。

## 理解確認

依存方向と秘密情報をAPI側だけに置く理由はREADMEに教材情報として整理した。学習者本人による理解状況は未確認である。実際のCube resource、HTTP method、DTO、エラー形式は学習者が後続Milestoneで設計するため、現時点では未確定である。

## 次Milestoneへの課題

Milestone 1で、HTTPやReactに依存しないCube Coreを実装する。
