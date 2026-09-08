# Milestone 11 — Commutator Core Workbook

## Agent実装済み

- `Commutator(A, B)`
- `A B A^-1 B^-1`の生成
- A / B / A^-1 / B^-1の半開区間境界
- Commutator request / response DTO
- Cubeへ交換子を一括適用するapplication処理
- `POST /api/cubes/{cubeId}/commutators`
- A/B別のvalidation error、404、415、405、500変換
- domain、handler、実HTTP、Vercel rewrite経路のテスト

## 自力実装

なし。Milestone 9以降の方針に従い、production code、テスト、エラー処理をAgentが実装した。

## 境界情報

`startIndex`は含み、`endIndex`は含まない。たとえばAがindex 0〜1なら`startIndex: 0, endIndex: 2`となる。この形式なら現在Move indexがどの部分かを`startIndex <= index < endIndex`で判定できる。

## 完了確認

- [x] A/Bから交換子を展開できる
- [x] 4部分の境界を取得できる
- [x] RESTで対象Cubeへ適用できる
- [x] 不正A/BでCubeを変更しない
- [x] 公開DTOとerror契約を自動テストで固定した
- [x] 全品質ゲートが成功した
