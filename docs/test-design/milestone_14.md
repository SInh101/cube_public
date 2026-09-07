# Milestone 14 — テスト設計

- Highlight: cycleの3 IDだけを強調する
- Dim: 3 ID以外を薄くする
- Order: cycle順を1/2/3 markerへ変換する
- Step: Next / Previous
- Playback: Play / Reverse Play
- Synchronization: animation完了までstepを進めない
- Boundary: 先頭、末尾、identity、3-cycleなし

UI/state管理は自力実装のため8件を`todo`として予約した。`CubeView`はmarkerを描画groupへ接続する低レベル表現のみ担当する。
