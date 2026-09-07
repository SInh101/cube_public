# Milestone 12 — Commutator Teaching UI Workbook

## Agentが準備したもの

- CubeStateを26個の安定したCubie IDへ変換する解析
- 前後状態からpermutation/orientation変化を求める機能
- `CubeView`の`highlightedCubieIds`と`dimUnhighlighted`
- Core/3D testとUI pending test

## 自力実装（未着手）

- `[A, B]`と4部分の表示: 1教材画面
- 現在部分の強調: 1機能
- RESTから交換子・境界を取得する通信: 1機能
- Milestone 8 Playbackとの接続: 1機能
- 解析結果をCubeView propsへ変換する表示state: 1機能

規模: 最低5機能。component/file数は設計後に記録する。

## 3D境界の使い方

- `analyzeCubieChanges(before, after)`の`afterCubieId`を強調対象にする。
- `<CubeView highlightedCubieIds={ids} dimUnhighlighted />`へ渡す。
- 教材上の「変化」を開始状態との比較にするか、直前stepとの比較にするかはUIで明示する。

## 完了確認

交換子を4段階に分け、現在部分と変化Cubieを同期表示できる。
