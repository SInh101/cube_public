# Rubik's Cube Web教材 Agent Skill仕様

## Skill 1 — cube-domain

### 目的
ルービックキューブ固有の数学・ロジックを担当する。

### 担当
- CubeState
- Cubie
- Move
- MoveSequence
- permutation
- orientation
- Singmaster記法
- inverse
- commutator
- conjugate
- cycle decomposition
- 3-cycle
- parity
- Cube合法状態
- Cube Coreのunit test

### 原則
- Cube数学の正しさを最優先する
- REST endpointを設計しない
- React componentを実装しない
- DB処理を実装しない

### レビュー観点
- 回転方向
- permutation
- orientation
- inverse
- cycle
- parity
- solved判定

---

## Skill 2 — code-reviewer

### 目的
自力実装コードを教育目的でレビューする。

### 最重要ルール
原則としてコードを直接修正しない。
レビュー対象者に修正機会を残す。

### 出力形式
- Critical
- Major
- Minor
- Suggestion

各指摘に以下を含める。

- 場所
- 問題
- 理由
- 改善方針

### REST観点
- resource設計
- URI
- HTTP method
- status code
- request
- response
- error response
- validation

### Frontend観点
- component responsibility
- state
- side effect
- async
- loading/error
- type safety

### General
- readability
- naming
- duplication
- testability

### 禁止
明示的に要求されない限り、完成コードを丸ごと書き直さない。

---

## Skill 3 — test-designer

### 目的
必要なテストケースを設計する。

### 原則
原則としてテストコードそのものは書かない。
テスト実装は学習者に任せる。

### 分類
- Happy path
- Boundary
- Invalid input
- State transition
- Regression
- Property
- Integration

### Cube特有のProperty Test例
- `R^4 = identity`
- `R R' = identity`
- `Move + inverse(Move) = identity`
- `sequence + inverse(sequence) = identity`

Cube数学上の期待結果については `cube-domain` と連携する。

---

## Skill 4 — project-maintainer

### 目的
学習対象外の開発環境・雑務を担当する。

### 担当
- package設定
- ESLint
- Prettier
- tsconfig
- Vitest設定
- Vite設定
- GitHub Actions
- GitHub Pages deployment
- Vercel deployment設定
- Supabase migration補助
- env.example
- README
- dependency更新
- build failure調査

### 原則
REST APIやFrontendの学習対象コードを勝手に実装しない。

---

## Skill 5 — architecture-guardian

### 目的
プロジェクトの責務分離を維持する。

### 基本依存方向

```text
Frontend
    ↓
REST API
    ↓
Cube Core / Repository
    ↓
Database
```

### チェック事項
- FrontendがSupabase DBへ直接アクセスしていないか
- REST handlerへCube数学が直接書かれていないか
- Cube CoreがHTTPを知っていないか
- Cube CoreがReactを知っていないか
- DB schemaとFrontend modelが直接結合していないか
- 同じvalidationが各所に重複していないか
- 循環依存がないか

### レビュー出力
- Violation
- Risk
- Reason
- Recommended boundary

### 原則
小規模教材アプリなので過剰な抽象化を避け、必要十分を優先する。

---

# Skill間の役割分担

```text
                cube-domain
                    │
                Cube Core
                    │
                    ▼
Frontend ── REST API ── Database
    │           │
    └─────┬─────┘
          │
   code-reviewer
          │
architecture-guardian

test-designer
    └── テスト観点

project-maintainer
    └── 開発基盤
```

## 推奨Agent利用順

```text
1. test-designer
      ↓
2. 自力実装
      ↓
3. code-reviewer
      ↓
4. 自力修正
      ↓
5. architecture-guardian
      ↓
6. project-maintainer
      ↓
7. Milestone Report
```

Cube数学を扱うMilestoneでは、先頭に `cube-domain` を追加する。

## 将来の追加Skill候補

`ux-teaching-reviewer`

交換子や3-cycleが初心者に本当に理解できる表示になっているかを、教材UXの観点だけでレビューする。Milestone 12以降で必要になった場合に追加する。
