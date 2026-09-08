# Rubik's Cube Web教材 開発学習手順書

## 1. プロジェクト目的

ルービックキューブを題材として、以下を学習する。

- REST APIの設計・実装
- HTTPメソッド、ステータスコード、リソース設計
- TypeScript
- Reactによるフロントエンド開発
- REST APIとFrontendの連携
- Webアプリケーションの状態管理
- CRUD API
- DBアクセス
- テスト設計と実装
- コードレビューを受けながら改善する開発サイクル

完成するアプリケーションは、次の教材機能を持つ。

- 3Dルービックキューブ表示
- R / L / U / D / F / B 操作
- 逆回転
- 手順の入力と再生
- プリセット手順の保存・編集・削除
- 逆再生
- 交換子 `[A, B] = A B A⁻¹ B⁻¹` の可視化
- 3-cycleの可視化
- 操作前後で変化したCubieの強調
- 3-cycle、偶奇置換などの教材表示

## 2. 技術スタック

```text
Frontend
  React + TypeScript + Vite + Three.js
  GitHub Pages

REST API
  TypeScript
  Vercel Functions

Database
  Supabase PostgreSQL
```

推奨Monorepo構成：

```text
rubiks-learning/
├── apps/
│   ├── web/
│   └── api/
├── packages/
│   ├── cube-core/
│   └── api-contract/
├── supabase/
│   └── migrations/
├── docs/
│   └── report/
└── .github/
    └── workflows/
```

`cube-core` はCube数学を扱うTypeScriptライブラリとする。

FrontendとREST APIの両方から利用できるが、REST APIの学習を損なわないよう、Frontendから直接Cube操作を完結させない。

## 3. 学習対象とAgent担当の境界

Milestone 9以降は自力実装枠を設けない。以下の旧境界はMilestone 8までの履歴である。

### 自力実装するもの

- REST endpoint
- HTTP methodの選択
- request / response設計
- status code
- エラー処理
- FrontendからのREST通信
- React component
- state管理
- form
- CRUD画面
- loading / error表示
- DBを利用したPreset管理

### Agentに任せるもの

- Cube数学の正しさ
- permutation / orientation
- Move適用ロジック
- commutator生成
- 3-cycle解析
- Three.jsの低レベル3D処理
- 開発環境設定
- CI
- formatter / linter
- テストケース設計
- Milestone 3以降の自動テストコード実装と実行
- コードレビュー
- アーキテクチャ違反検出

## 4. 基本学習サイクル

Milestone 9以降の開発サイクル：

```text
1. Agentが仕様と設計判断を確認
        ↓
2. Agentがproduction code・テスト・エラー処理・設定を実装
        ↓
3. Agentがコード・アーキテクチャ・品質をレビューして修正
        ↓
4. Agentが全品質ゲートを実行
        ↓
5. 詳細なdocs/reportとdocs/explanationを作成
        ↓
6. 次Milestoneへ
```

以下はMilestone 8までの旧学習サイクルである。

```text
1. Agentが土台・仕様・テスト観点・自動テストを準備
        ↓
2. 自力実装
        ↓
3. code-reviewerによるレビュー
        ↓
4. 自力修正
        ↓
5. architecture-guardianによる確認
        ↓
6. テスト
        ↓
7. docs/report/milestone_X.md と docs/explanation/milestone_X.md 作成
        ↓
8. 次Milestoneへ
```

Agentは原則として、自力実装フェーズ中に完成コードを提示しない。

Milestone 3以降のテストコードはAgentの担当とする。これはproduction codeの自力実装境界を変更せず、Agentはテストを通すために自力実装部分を無断で実装・修正しない。

Milestone 3以降のエラー契約はAgentが設計する。Agentの担当はHTTP status、error code、公開message、validation分類までとし、error class、validation処理、例外処理、Error DTOを返すproduction codeは学習者が自力実装する。

支援レベルは以下の順とする。

1. 問題点の指摘
2. 考え方
3. 擬似コード
4. 部分コード
5. 明示的に要求された場合のみ完成例

## 5. REST API学習方針

Supabaseの自動REST APIをFrontendから直接利用しない。

```text
Browser
   │
   │ HTTP
   ▼
REST API
   │
   ▼
Supabase
```

これにより以下を自分で設計する。

- resource
- URI
- HTTP method
- status code
- validation
- DTO
- error response

## 6. Cube Coreの位置付け

Cube Coreは学習対象ではなく教材基盤とする。

最低限次の型を提供する。

```text
Cube
CubeState
Cubie
Move
MoveSequence
Orientation
Permutation
Commutator
Cycle
```

例：

```ts
const cube = Cube.solved();
cube.applyMove("R");
const state = cube.getState();
```

REST APIからCube Coreをどう呼び出し、何をHTTPレスポンスとして返すかは自力で設計する。

## 7. 3D Rendererの位置付け

Three.jsそのものを深く学ぶことは今回の主目的としない。

Agentが例えば次の程度のインターフェースを提供する。

```tsx
<CubeView
  state={cubeState}
  animation={animation}
/>
```

自力で担当するもの：

- APIからCubeState取得
- React stateへの反映
- Move操作
- 再生制御
- UI
- エラー処理

## 8. レビュー方針

主な観点：

- RESTとして自然か
- FrontendとAPIの責務が分離されているか
- domain modelがHTTP仕様に依存していないか
- API handlerにCube数学が入り込んでいないか
- DBアクセスが散らばっていないか
- 型安全か
- テスト可能か
- 読みやすいか

## 9. Milestone終了レポート

各Milestone終了時に以下を作成する。

```text
docs/report/milestone_X.md
```

Milestone 9以降の内容：

- Milestoneの目的
- 実装した機能
- Agent実装の範囲と規模
- 主要な設計判断
- レビュー指摘
- 修正内容
- テスト結果
- 理解できたこと
- 理解が曖昧なこと
- 次Milestoneへの課題

Milestone 8以前のreportは当時の自力実装項目を履歴として維持する。規模は行数ではなく、原則としてファイル数・機能数・endpoint数で示す。

## 10. Codex実装解説

Codexがコードまたは設定を追加・変更したMilestoneでは、終了時に次のファイルを作成または更新する。

```text
docs/explanation/milestone_X.md
```

この解説は学習者がCodexの実装を追跡できることを目的とし、以下を必須とする。

- Codexが追加・変更したソース管理対象ファイルを漏れなく列挙する
- 各ファイルについて「役割」と「コード要約」を記載する
- lockfileなどソース管理する自動生成ファイルは、その旨と生成元を記載し、内容を逐語的には解説しない
- `node_modules`、`dist`、coverageなどGit管理外の依存物・一時生成物は対象外とする
- ディレクトリ維持用などコードを含まないファイルも役割を記載する
- 後から同じMilestoneのCodex実装を修正した場合、その解説も同時に更新する
- 主要な設計判断と、その方式を選んだ理由を記載する
- layer間の依存関係と主要処理フローを記載する
- REST、DTO、DB schemaなどの公開・永続化契約を記載する
- validation、例外、公開error responseの変換経路を記載する
- 各テスト群が保証する振る舞いと、未検証事項を記載する
- 後続Milestoneが利用する境界と、壊してはいけない互換性を記載する

記載形式：

```markdown
## `path/to/file`

- 役割: このファイルが担う責務
- コード要約: 主要な設定、処理の流れ、他ファイルとの関係
- 設計理由: 採用した方式と主なtrade-off
- テスト: このファイルの振る舞いを保証するテスト
```

Codexによる実装がないMilestoneでもファイルを作成し、`Codex実装なし` と明記する。
