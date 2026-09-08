# Milestone 7 — Move Sequence Workbook

## Agentが準備したもの

- Cube Coreの`MoveSequence`
- `parseSequence()`と`invertSequence()`
- parse、inverse、property test
- 自力実装するREST APIと手順入力UIのテスト観点
- `MoveSequenceControl`の表示要素とcomponent test

## 自力実装の進捗

- MoveSequence用REST API: 実装済み
- 手順入力UI要素: Agentが実装済み
- FrontendからSequence REST APIを呼び、検証済みMoveを単一Move APIへ渡す処理: 実装済み

自力実装規模: DTO 3型、application 1機能、HTTP handler 1件、Vercel entry 1件、Appの入力・通信・Move state接続。UI表示要素は明示依頼に基づきAgentが担当した。自動連続再生はMilestone 8へ残す。

## 実装前に決めること

1. sequence適用をCube resourceのcommandとして表すURIとmethod
2. request DTOで文字列を受け取るかMove配列を受け取るか
3. 空手順、不正token、存在しないCubeのHTTP契約
4. 複数Moveの途中失敗時にCubeStateを変更しない原子性

## 完了確認

- `R U R' U'`をHTTP経由で適用できる
- 不正手順は部分適用されない
- UIから手順を入力して結果を表示できる

## 配置済みひな形

- `apps/api/src/application/prepareMoveSequence.ts`
- `apps/api/src/http/handlers/handleMoveSequenceRequest.ts`
- `apps/api/api/move-sequences.ts`
- `apps/web/src/components/MoveSequenceControl.tsx`

DTOは`packages/api-contract/src/moves.ts`と`moveSequences.ts`へ分離済み。application → handler → entry point → UI → App接続の実装は完了した。

### Agentが決めたerror契約

- 不正なsequence token: `400 SEQUENCE_NOT_CORRECT`
- 公開message: `sequence contains an unsupported Move`
- `details`を付ける場合はfieldを`sequence`とし、token位置をreasonへ含める
