# Milestone 1 — Codex実装解説

Milestone 1でCodexが追加・変更したソース管理対象ファイルの解説です。

## `apps/api/vercel.json`

- 役割: API workspaceのVercel設定を保持する。
- コード要約: Milestone 1の機能変更はなく、全体Prettier実行によりファイル末尾の改行だけを正規化した。Vercel設定値は変更していない。

## `packages/cube-core/package.json`

- 役割: Cube Core workspaceの公開入口、検証コマンド、テスト依存を定義する。
- コード要約: 既存のtypecheckにVitestのtest scriptとdevDependencyを追加する。Cube CoreにHTTP／React／DB依存は追加しない。

## `package-lock.json`

- 役割: workspace設定変更後のnpm依存解決を固定する自動生成ファイル。
- コード要約: `npm install`によってCube CoreのVitest開発依存がworkspace構成へ反映される。手作業では編集しない。

## `packages/cube-core/src/types.ts`

- 役割: Cube Coreの公開状態と入力Moveの型を定義する。
- コード要約: 6面、6色、18 Moveをreadonly tupleからunion型として導出する。各面9要素の`FaceState`と6面を持つ`CubeState`を定義し、不正なMoveをTypeScriptの呼び出し時点で防ぐ。

## `packages/cube-core/src/Cube.ts`

- 役割: Cubeの生成、初期化、状態snapshot、Move適用を実装するdomain本体。
- コード要約: 54枚のStickerを色、`-1/0/1`の3次元座標、外向き法線で保持する。各Moveは対象axis／layerを選び、外側から見た時計回りの整数回転を座標と法線へ適用する。逆Moveは3 quarter turns、2回転は2 quarter turnsへ正規化する。公開状態への変換時に各面を表示順へsortし、内部参照を漏らさない9色tupleを返す。

## `packages/cube-core/src/index.ts`

- 役割: Cube Core利用者向けの公開APIを一か所にまとめる。
- コード要約: `Cube`、定数`COLORS/FACES/MOVES`、型`Color/CubeState/Face/FaceState/Move`だけをexportし、内部のStickerや座標処理は非公開にする。

## `packages/cube-core/src/Cube.test.ts`

- 役割: Cube数学と公開APIの回帰を検出するunit test。
- コード要約: solved状態、snapshot分離、reset、全6面の4回転identity、Move＋inverse、2回転等価性、全18 Moveのステッカー／色数保存を検証する。F回転後の具体的な色配置も確認し、単なる可逆性テストでは検出できない回転方向の誤りを防ぐ。

## `docs/report/milestone_1.md`

- 役割: Milestone 1の担当境界、設計、レビュー観点、検証結果、次の課題を記録する。
- コード要約: 自力実装0件と学習確認未実施を明記し、CodexがCube Coreだけを実装したことを記録する。

## `docs/explanation/milestone_1.md`

- 役割: Milestone 1におけるCodexの変更をファイル単位で説明する本ファイル。
- コード要約: 各ファイルの責務、主要処理、依存境界、テスト意図をまとめる。
