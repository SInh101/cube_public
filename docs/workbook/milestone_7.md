# Milestone 7 — Move Sequence Workbook

## Agentが準備したもの

- Cube Coreの`MoveSequence`
- `parseSequence()`と`invertSequence()`
- parse、inverse、property test
- 自力実装するREST APIと手順入力UIのテスト観点

## 自力実装（未着手）

- MoveSequence用REST API: 1 endpoint（URI、method、request、responseは自分で設計する）
- 手順入力UI: 1機能
- FrontendからREST APIを呼び、返されたCubeStateを表示へ反映する処理: 1機能

規模: production codeは最低3機能、endpointは1件。対象ファイル数は設計後に記録する。

## 実装前に決めること

1. sequence適用をCube resourceのcommandとして表すURIとmethod
2. request DTOで文字列を受け取るかMove配列を受け取るか
3. 空手順、不正token、存在しないCubeのHTTP契約
4. 複数Moveの途中失敗時にCubeStateを変更しない原子性

## 完了確認

- `R U R' U'`をHTTP経由で適用できる
- 不正手順は部分適用されない
- UIから手順を入力して結果を表示できる
