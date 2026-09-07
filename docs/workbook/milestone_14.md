# Milestone 14 — 3-cycle Teaching UI Workbook

## Agentが準備したもの

- Milestone 12のCubie強調・対象外dim props
- `CubeViewMarker`と`cubieMarkers`による3D順序marker
- markerが対象layer animationへ追従する描画
- 自力実装8機能のpending test

## 自力実装（未着手）

- 対象3 piece強調と対象外dim: 2表示機能
- 移動順を解析cycleからmarkerへ変換: 1機能
- Next / Previous / Play / Reverse Play: 4操作
- step・animation・marker同期: 1状態管理

規模: 最低8機能。component/file数は設計後に記録する。

## 3D props

```tsx
<CubeView
  highlightedCubieIds={cycle}
  dimUnhighlighted
  cubieMarkers={[
    { cubieId: cycle[0], label: '1' },
    { cubieId: cycle[1], label: '2' },
    { cubieId: cycle[2], label: '3' },
  ]}
/>
```

この配列を作る処理とUI stateは自力実装する。markerはSpriteとしてcameraを向き、Move対象ならlayerと一緒に動く。

## 完了確認

3 pieceの循環順、対象外が固定されること、正逆の一手再生を同期して確認できる。
