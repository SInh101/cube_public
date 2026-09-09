# Milestone 14 — 3-cycle Teaching UI Workbook

## 目的

Milestone 13が返す順列解析を教材UIへ接続し、3-cycleの対象・巡回順・手順中の動きを立体表示で追えるようにする。

## 完成条件

- 任意の手順を現在のCube状態に対して解析できる
- cornerまたはedgeの3-cycleを選択できる
- 対象3 pieceだけを強調し、それ以外を薄く表示できる
- 表示モードを切り替えると、巡回順を1・2・3のmarkerで表示できる
- Next、Previous、Play all、Reverse allを利用できる
- step更新とmarker移動は実回転animationの完了に同期する
- 解析だけでは保存中のCube状態を変更しない

## 実装方針

REST DTOのposition labelは教材上の表示に使い、同じpermutation entryの安定Cubie IDは3D対象の追跡に使う。再生処理は既存の`usePlayback`へ集約し、M14専用の別state machineは作らない。

## 自力実装部分

0件。Milestone 10以降の運用ルールに従い、実装・テストはAgent担当とする。

## 確認方法

1. 3-cycle analysisで手順を入力してAnalyze sequenceを押す
2. cycleを選び、強調対象が3 pieceであることを確認する
3. Show position labelsへ切り替え、1・2・3がpieceに追従することを確認する
4. Next / Previous / Play all / Reverse allを試す
