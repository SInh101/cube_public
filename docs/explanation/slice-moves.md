# 中段列回転 M / E / S

## 回転規約

本実装では画面上の面配置ではなく、ステッカーが移動する向きで各quarter turnを固定する。

- `M`: `x = 0`の中段を回し、U面中央列をF面中央列へ移す。
- `E`: `y = 0`の中段を回し、F面中央行をR面中央行へ移す。
- `S`: `z = 0`の中段を回し、R面中央列をD面中央行へ移す。

それぞれ逆回転の`'`と180度回転の`2`を持つ。中段回転では、その層にある4面のセンターステッカーも移動する。

## ファイルの役割

- `packages/cube-core/src/types.ts`: APIとDomainが受け付ける9種類のslice moveを追加する。
- `packages/cube-core/src/Cube.ts`: 外面と同じ座標回転処理へlayer `0`の定義を追加する。
- `packages/api-contract/src/moves.ts`: REST DTOでもM/E/Sを公開する。
- `apps/web/src/components/cubeViewModel.ts`: layer `0`の部分アニメーション軸と向きを定義する。
- `apps/web/src/components/SliceControlPanel.tsx`: M/M'/M2、E/E'/E2、S/S'/S2の操作盤を提供する。
- `apps/web/src/App.tsx`: PracticeとAnalysis双方の手動操作盤、および入力欄外でのM/E/Sキー操作へ接続する。

Move sequence、Preset、Commutator、Analysis、batch moveは共通のMove型とparserを利用するため、追加したslice moveを個別分岐なしで扱える。
