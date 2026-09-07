# Milestone 7 — Codex実装解説

## `packages/cube-core/src/MoveSequence.ts`

- 役割: Move列の不変値、文字列parse、inverse生成を提供する。
- コード要約: 空白区切りtokenを既存の`MOVES`で検証し、不正位置をerrorに保持する。inverseは配列順と各Moveを反転する。

## `packages/cube-core/src/MoveSequence.test.ts`

- 役割: MoveSequenceのdomain契約を検証する。
- コード要約: 正常、空白、空手順、不正token、inverse、identity propertyを検証する。

## `packages/cube-core/src/index.ts`

- 役割: Cube Coreの公開APIを定義する。
- コード要約: MoveSequence関連class、function、errorを公開する。

## `docs/workbook/milestone_7.md`

- 役割: 自力実装の課題と規模、事前設計項目を示す。
- コード要約: REST endpointと入力UIを未着手として明示する。

## `docs/test-design/milestone_7.md`

- 役割: Agent実装済みdomain testと自力実装後の統合testを区別する。
- コード要約: 公開契約を中心に正常、境界、異常、原子性を列挙する。

## `docs/report/milestone_7.md`

- 役割: 現時点の達成範囲と残作業を記録する。
- コード要約: Agent担当完了、自力担当未着手、品質ゲート結果を記録する。
