# Milestone 14 — Codex実装解説

## `apps/web/src/components/CubeView.tsx`

- 役割: 3-cycle教材用のCubie markerを3D描画する。
- コード要約: `cubieMarkers`を安定Cubie IDで対応付け、camera方向を向くSpriteとして描画する。実回転対象markerはturning groupへ入れ、layer animationへ追従させる。texture/materialをcleanupする。

## `apps/web/src/components/index.ts`

- 役割: Web componentの公開APIを定義する。
- コード要約: `CubeViewMarker`型を公開する。

## `apps/web/src/App.milestone14.todo.test.tsx`

- 役割: 自力実装する3-cycle Teaching UIのtest枠を予約する。
- コード要約: highlight、dim、順序、step、正逆再生、同期を`todo`にする。

## `docs/workbook/milestone_14.md`

- 役割: 自力実装規模と3D propsの利用例を示す。
- コード要約: 最低8機能を未着手として記録する。

## `docs/test-design/milestone_14.md`

- 役割: 3-cycle Teaching UIのtest patternを分類する。
- コード要約: 強調、順序、再生、同期、境界を列挙する。

## `docs/report/milestone_14.md`

- 役割: Agent担当と自力担当の進捗を記録する。
- コード要約: 3D marker完了、Teaching UI未着手を区別する。
