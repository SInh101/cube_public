# Milestone 12 — Commutator Teaching UI Workbook

## Agent実装済み

- CubeStateを26個の安定したCubie IDへ変換する解析
- 前後状態からpermutation/orientation変化を求める機能
- `CubeView`の`highlightedCubieIds`と`dimUnhighlighted`
- `[A, B]`と4部分の表示: 1教材画面
- 現在部分の強調: 1機能
- 非変更の`POST /api/commutators`から交換子・境界を取得する通信: 1機能
- Milestone 8 Playbackとの接続: 1機能
- A / B / A⁻¹ / B⁻¹単位の`Play next part`: 1機能
- 解析結果をCubeView propsへ変換する表示state: 1機能
- Core、REST、UI、integration test

## 自力実装

なし。Milestone 9以降の方針に従いAgentがすべて実装した。

## 3D境界の使い方

- 教材開始stateと現在stateを`findChangedCubieIds`で比較し、現在位置のCubie IDを強調対象にする。
- `<CubeView highlightedCubieIds={ids} dimUnhighlighted />`へ渡す。
- 教材上の「変化」を開始状態との比較にするか、直前stepとの比較にするかはUIで明示する。

## 完了確認

- [x] 交換子を4段階に分けて表示できる
- [x] 現在部分をPlayback indexと同期して強調できる
- [x] 変化Cubieを強調し、対象外を薄く表示できる
- [x] Play、Pause、Next、Previous、Reverse Play、Resetを再利用できる
- [x] `Play next part`が現在部分の終端で停止する
- [x] 全品質ゲートが成功した
