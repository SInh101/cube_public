# Milestone 4 — Codex実装解説

Milestone 4ではAgentがテスト設計、テストコード実装、実行確認を担当する。production codeは変更していない。

## `apps/api/src/http/milestone4.rest-api.test.ts`

- 役割: Milestone 4の最低要件7項目を、公開HTTP境界に対する独立した自動テストとして固定する。
- コード要約: Cube生成、存在しないCube、正常／不正Move、reset、`R^4`、`R R'`を検証する。statusとDTO、保存後のstate、不正入力時の状態不変を確認し、共通helperでRequest生成だけを集約する。

## `docs/test-design/milestone_4.md`

- 役割: 各テストの対象境界と、CIまで含めたテスト方針を説明する。
- コード要約: 7要件をM4-01〜07へ対応づけ、公開HTTP境界、response DTO、状態保護、property、テスト独立性を設計原則として記録する。

## `docs/workbook/milestone_4.md`

- 役割: 学習者が各テストの目的、入力、期待結果、失敗時の契約違反を説明するための回答用紙。
- コード要約: production／テストコードの自力実装が0件であることと、7テスト×4観点の学習確認規模を明記する。当初は自力説明の記入欄だけを提供し、学習者の回答レビュー後の明示依頼に基づいて、正しいHTTP入力、期待するstatus／DTO／状態、テスト失敗が示す契約違反、CI実行経路へ修正した。

## `docs/explanation/milestone_4.md`

- 役割: Milestone 4でCodexが追加・変更したファイルを追跡する本ファイル。
- コード要約: Agent担当のテスト、テスト設計書、学習者用workbookの役割と内容を記録する。
