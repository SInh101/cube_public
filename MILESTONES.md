# Rubik's Cube Web教材 開発マイルストーン

## Milestone 0 — Project Bootstrap

### Agent
- Monorepo作成
- React + TypeScript + Vite
- Vercel Functions
- Vitest
- ESLint / Prettier
- GitHub Actions
- GitHub Pages deployment
- Vercel deployment
- Supabase接続用設定
- README雛形

### 自力
Frontend / REST API / Cube Core / DB の依存関係を説明できる状態にする。

### 完了条件
- `GET /api/health` が `200 OK`
- FrontendからHealth APIを呼び出せる

---

## Milestone 1 — Cube Core

### Agent
以下の教材基盤を実装する。

- `Cube.solved()`
- `Cube.reset()`
- `Cube.getState()`
- `Cube.applyMove()`

対応Move：

- R / R' / R2
- L / L' / L2
- U / U' / U2
- D / D' / D2
- F / F' / F2
- B / B' / B2

Unit Test例：

- `R^4 = identity`
- `R R' = identity`
- `U^4 = identity`

### 自力
Cube CoreのAPIと状態モデルを理解する。

### 完了条件
Cube Coreのテストがすべて通る。

---

## Milestone 2 — Cube REST API

### 自力実装
- Cube生成
- CubeState取得
- Cubeリセット

endpoint、HTTP method、response形式を自分で設計する。

### Agent
REST設計の一般原則のみ説明する。完成コードは作らない。

### Review
`code-reviewer` で URI / method / status / request / response / error をレビューする。

### 完了条件
RESTだけで Cube作成 → 状態取得 → Reset ができる。

---

## Milestone 3 — Move REST API

### 自力実装
CubeにMoveを適用するREST APIを追加する。

### 学習テーマ
- commandのREST表現
- validation
- 400 / 404
- DTO
- domain objectとの変換

### Agent
Cube Coreのみ担当。

### 完了条件
HTTP経由で `R U R' U'` を順番に適用できる。

---

## Milestone 4 — REST API Test

### Agent
`test-designer` がテストケースを設計する。

### 自力
テストコードを書く。

最低限：

- 正常なCube生成
- 存在しないCube
- 正常Move
- 不正Move
- Reset
- R^4
- R R'

### 完了条件
自動テストがCIで通る。

---

## Milestone 5 — 3D Cube Viewer

### Agent
Three.jsによるCube表示コンポーネントを作る。

```tsx
<CubeView state={state} />
```

### 自力
REST APIから取得したCubeStateをReactへ格納し、CubeViewへ渡す。

### 学習対象
- fetch
- async / await
- React state
- loading
- error
- component props

### 完了条件
REST APIのCubeStateが3D表示される。

---

## Milestone 6 — Interactive Cube UI

### 自力
- R / L / U / D / F / B キー
- Shift + key で逆回転
- 画面上の操作ボタン

### 学習対象
- keyboard event
- event handler
- API mutation
- React state更新
- UI/API同期

### Agent
3D animation部分のみ補助。

### 完了条件
キーボードとボタンの両方からCubeを回せる。

---

## Milestone 7 — Move Sequence

### Agent
Cube Coreへ以下を追加。

- `MoveSequence`
- `parseSequence()`
- `invertSequence()`

### 自力
MoveSequence用REST APIと手順入力UIを実装する。

### 完了条件
`R U R' U'` のような文字列を適用できる。

---

## Milestone 8 — Playback

### 自力
Frontendに以下を追加。

- Play
- Pause
- Next
- Previous
- Reverse Play
- Reset

### Agent
CubeView側のアニメーション機構を補助。

### 学習対象
- UI state machine
- timer
- async処理
- animation完了待ち
- button disable

### 完了条件
MoveSequenceを一手ずつ確認できる。

---

## Milestone 9 — Preset REST + Database

### 自力
SupabaseへPresetを保存する。

例：

```text
id
name
moves
created_at
updated_at
```

CRUD APIを自力設計・実装する。

### Agent
migrationやSupabase接続設定を補助。

### 学習対象
- PostgreSQL
- CRUD
- REST resource
- persistence
- repository/service分離

### 完了条件
PresetをREST経由で永続化できる。

---

## Milestone 10 — Preset Frontend

### 自力
- Preset一覧
- 新規登録
- 名前変更
- 手順変更
- 削除
- Play
- Reverse Play

### 完了条件
ブラウザだけでPresetを管理・再生できる。

---

## Milestone 11 — Commutator Core

### Agent
`cube-domain` が交換子を実装する。

```text
Commutator(A, B)
A B A^-1 B^-1
```

A / B / A^-1 / B^-1 の境界情報も返す。

### 自力
Commutator用REST APIを設計する。

### 完了条件
A/Bを渡すと交換子を取得・実行できる。

---

## Milestone 12 — Commutator Teaching UI

### 自力
教材画面を作る。

表示：

```text
[A, B]

A
B
A^-1
B^-1
```

現在実行中の部分をUI上で強調する。

### Agent
変化したCubieを求める解析機能と3D表示を補助する。

### 完了条件
交換子を4段階に分けて視覚的に理解できる。

---

## Milestone 13 — 3-cycle Analysis

### Agent
Cube Coreへ以下を追加。

- permutation
- cycle decomposition
- 3-cycle検出
- fixed cubie
- orientation change

### 自力
解析結果取得用REST APIを設計する。

### 完了条件
手順実行後に例えば以下を取得できる。

```text
Corner:
(1 4 6)

Edge:
identity
```

---

## Milestone 14 — 3-cycle Teaching UI

### 自力
- 対象3ピース強調
- 対象外を薄く表示
- 移動順表示
- 1手進む
- 1手戻る
- 全体再生
- 逆再生

### Agent
3D表現を補助。

### 完了条件
「3個のピースが循環し、それ以外が元に戻る」ことを視覚的に確認できる。

---

## Milestone 15 — Final Review

5 Skillを順番に実行する。

1. cube-domain
2. test-designer
3. code-reviewer
4. architecture-guardian
5. project-maintainer

最後に `docs/report/final.md` を作成する。

内容：

- アーキテクチャ
- REST API一覧
- Frontend構成
- Cube教材機能
- テスト結果
- 技術的負債
- 改善案
- 学習成果
