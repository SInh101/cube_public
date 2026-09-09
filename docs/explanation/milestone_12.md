# Milestone 12 — Codex実装解説

## `packages/cube-core/src/CubieAnalysis.ts`

- 役割: Face状態をcubieへ再構成し、前後差分を解析する。
- コード要約: 色集合を向きに依存しないpiece IDとし、同じ位置のID・sticker向きを比較してpermutation/orientationを分類する。

## `packages/cube-core/src/CubieAnalysis.test.ts`

- 役割: cubie再構成と変化検出を検証する。
- コード要約: 個数内訳、同一状態、R/R2の対象layerを確認する。

## `packages/cube-core/src/index.ts`

- 役割: Cube Core公開APIを定義する。
- コード要約: snapshot・change解析functionと関連型を公開する。

## `apps/web/src/components/cubeViewModel.ts`

- 役割: CubeStateをThree.js用cubieへ変換する。
- コード要約: 各cubieへCoreと同じ色集合形式の安定IDを追加する。

## `apps/web/src/components/cubeViewModel.test.ts`

- 役割: Web描画model変換を検証する。
- コード要約: cornerのIDがsticker方向ではなく色集合から決まることを確認する。

## `apps/web/src/components/CubeView.tsx`

- 役割: CubeStateと教材用強調を3D表示する。
- コード要約: 指定IDを発光強調し、任意で対象外を半透明にするpropsを追加する。

## `packages/api-contract/src/commutators.ts`

- 役割: 交換子適用Responseと非変更の準備Responseに共通する公開DTOを定義する。
- コード要約: `PreparedCommutatorResponseDto`を基底にし、Milestone 11の適用ResponseはCube IDとstateを追加する。既存契約を壊さず教材用準備を追加する。

## `apps/api/src/application/prepareCommutator.ts`

- 役割: Cubeを変更せずA/Bのparse、交換子展開、DTO変換を行う。
- コード要約: A/B別の`CommutatorInputError`変換を一か所へ集約し、適用処理も同じ`createCommutator`を利用する。

## `apps/api/api/commutators.ts` / `handleCommutatorRequest.ts`

- 役割: `POST /api/commutators`をVercel Functionとローカルserverの両方で公開する。
- コード要約: cubeIdなしなら非変更の準備Response、cubeIdありならMilestone 11の適用Responseを返す。body validationとA/B error形式は共通である。

## `apps/web/src/components/CommutatorTeachingPanel.tsx` / CSS

- 役割: A/B入力、交換子表記、4部分、現在部分、Prepare/Playを表示する。
- コード要約: current partへ`aria-current="step"`を付け、視覚強調と支援技術の意味を一致させる。狭幅では4部分を2列へ折り返す。

## `apps/web/src/App.tsx`

- 役割: 準備API、既存Playback、CubeState、Teaching Panelを接続する。
- コード要約: Prepare時のCubeStateを基準として保持し、現在stateとの差から強調IDを求める。Playbackの方向とindexから現在partを計算する。同じ交換子でもrevisionを増やし、再準備時はindex 0へ戻す。
- 操作分離: 通常の面操作、Move Sequence、Presetへ移ると教材強調を解除する。教材Reset時は新しいsolved stateを比較基準にする。
- 回帰修正: keyboard listenerを一度だけ登録し、refから最新`applyMove`を参照することで再登録間の入力欠落を防ぐ。
- 部分再生: 現在indexを含むboundaryの`endIndex`を`playUntil`へ渡し、A、B、A⁻¹、B⁻¹の終端で自動停止する。通常のNextは従来どおり一手だけ進む。

## `apps/web/src/playback/usePlayback.ts`

- 役割: 通常再生に加え、指定indexまでの範囲再生を提供する。
- コード要約: `playUntil(targetIndex)`が停止位置を`PlaybackState.stopAtIndex`へ保持し、各animation完了後に到達判定する。sequence末尾ならidle、途中の部分境界ならpausedへ遷移する。Play、Pause、Next、Previous、Reverse Play、Resetでは古い停止位置を解除する。
- 競合対策: Prepare直後のsequence同期と部分再生開始が近接しても、再生statusと停止位置を同じstate transitionで確定し、境界情報だけが消えない。UIはPlayback側のMove同期が完了するまで再生buttonを無効にする。

## `apps/web/src/App.milestone12.test.tsx` / `CommutatorTeachingPanel.test.tsx`

- 役割: 4部分表示、ARIA強調、準備REST、Playback境界更新、CubeView propsを検証する。
- コード要約: Aの一手完了後にactive partがBへ移り、変化Cubie IDとdim指定がViewerへ渡ることを確認する。

## `docs/workbook/milestone_12.md`

- 役割: Agent実装範囲と3D境界の利用方法を示す。
- コード要約: 完了した機能と品質ゲートをチェックリストで記録する。

## `docs/test-design/milestone_12.md`

- 役割: 解析/3DとUI testを分類する。
- コード要約: Core、REST、UI、integrationのテスト観点を列挙する。

## `docs/report/milestone_12.md`

- 役割: Milestone 12の実装結果と品質ゲートを記録する。
- コード要約: Teaching UIを含む完了状態を記録する。

## 設計理由と後続Milestone

Milestone 11の`POST /api/cubes/{cubeId}/commutators`は交換子全体を即時適用する。そのResponseをPlaybackへ再投入すると二重適用になるため、Milestone 12では非変更の`POST /api/commutators`を追加した。Milestone 13以降はCube Coreの`CubieAnalysis`をREST解析へ利用でき、Frontendは引き続きCube Coreへ直接依存しない。

`URF / LFD / ULB`のような表記は、強調対象を示すだけでなくcornerの向きとcycle順を意味する。単純な変化強調はMilestone 12、順序付き3-cycle・orientation・固定pieceの表記と表示モード切替はMilestone 13の解析結果を利用する責務として分ける。
