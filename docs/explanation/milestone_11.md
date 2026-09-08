# Milestone 11 — Codex実装解説

## `packages/cube-core/src/Commutator.ts`

- 役割: A/Bから交換子と教材用境界を生成する。
- コード要約: 既存inverseを再利用して4部分を連結し、各部分の半開区間とMove列を返す。

## `packages/cube-core/src/Commutator.test.ts`

- 役割: 交換子の数学と境界を検証する。
- コード要約: 展開結果、index、各部分のMove、空入力を確認する。

## `packages/cube-core/src/index.ts`

- 役割: Cube Core公開APIを定義する。
- コード要約: Commutatorと境界型を公開する。

## `apps/api/src/http/milestone11.commutator.todo.test.ts`

- 役割: Agentが実装するREST契約のtest枠を予約する。
- コード要約: 正常、適用、A/B validation、404を`todo`にする。

## `docs/workbook/milestone_11.md`

- 役割: Agent実装規模と境界の読み方を示す。
- コード要約: REST/applicationをAgentの未着手タスクとして記録する。

## `docs/test-design/milestone_11.md`

- 役割: domainとRESTのtest範囲を分離する。
- コード要約: 実装済み3観点とpending 5観点を列挙する。

## `docs/report/milestone_11.md`

- 役割: CoreとRESTの進捗を記録する。
- コード要約: Core完了、REST未着手を区別する。
