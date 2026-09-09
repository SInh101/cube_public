# Milestone 15 - Final Review テスト設計

## 自動検証

- 全workspaceのTypeScript型検査
- ESLintによる静的検査
- Prettier差分検査
- 全Vitest回帰テスト
- APIとWebのproduction build
- `git diff --check`による空白エラー検査
- skip/only/TODOテストの検索

## 追加回帰

Vercel rewrite後の`?cubeId=<uuid>&operation=move`をhandlerへ入力し、Moveが適用されることを検証する。これにより、ローカルpath routeだけが成功して公開環境routeが失敗する退行を防ぐ。

## 手動確認候補

1. PracticeでCubeを作成し、面操作・Reset・sequence playbackを行う。
2. Presetを作成し、同じPresetを複数回Play/Reverse Playする。
3. AnalysisでCommutatorを準備し、Play next partを4部分ぶん進める。
4. 3-cycleでpiece・position label・3種類のsticker cycleを切り替える。
5. Conjugate setupを入力し、Base/Shifted positionと保存判定を確認する。
6. narrow viewportで1列化し、操作盤が切れずCube Viewと重ならないことを確認する。
