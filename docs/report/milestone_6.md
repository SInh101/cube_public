# Milestone 6 — Interactive Cube UI 実施レポート

## Milestoneの目的

画面上のbuttonとkeyboardの両方からMove APIを呼び、API responseのCubeStateと3D表示を同期する。

## 実装した機能

- R／L／U／D／F／Bの6 button
- R／L／U／D／F／B keyboard操作
- Shift付きkeyによるinverse Move
- buttonとkeyboardで共有するMove送信処理
- Move API成功時のCubeState更新
- Move API失敗時の既存表示維持とerror表示
- keyboard listenerのcleanup
- 全18 Moveに対応するlayer回転animation
- CSS製の6面layer GUIと各面のCW／CCW操作
- GUI hover／focus時の対象layer highlightと半透明ghost animation

## 自力実装の有無と規模

あり。`apps/web/src/App.tsx` 1ファイルで、6 button、12 keyboard入力、1つのMove送信処理、1つの操作error状態を実装した。新規endpointは0件。

## 自力実装した対象

- cubeIdを保持するReact state
- Move APIを呼ぶ処理の初期実装
- keyboard eventと6 buttonの初期実装
- 操作error state

## 自分で設計した部分

- 初期取得後のcubeIdをMove送信に利用する構成
- buttonとkeyboardを同じMove処理へ接続する方針
- API responseを使って3D表示を更新する方針

## Agentが担当した部分

- Milestone 6のテスト設計と自動テスト
- Moveごとの3D layer animationとanimation変換テスト
- M6.1のFaceControl、FaceControlPanel、highlight／ghost表示とGUIテスト
- 自力実装用workbookとCodex実装解説
- 初期実装レビュー
- 明示依頼に基づくAppの修正
- 最終コード／アーキテクチャレビューと品質確認

## レビュー指摘と修正内容

- 不正な`/move`を`/moves`へ修正
- response未処理を修正し、成功時にCubeStateを保存
- button群をFragmentでまとめて正しいJSXへ修正
- 関数宣言後に置かれていた不正なdependency配列を削除
- `useCallback`と依存配列でkeyboard listenerが最新のcubeIdを参照できるよう修正
- Shift付きkeyをprime Moveへ変換
- FrontendからCube Coreへの型依存を削除し、Milestone内で必要なMoveだけを限定型で表現
- error時に現在のCubeStateを維持
- 面ごとの軸／layer設定を共通定数へ抽出し、実回転とpreviewで共有
- animation完了待ちと操作disableをMilestone 8のAgent担当へ移動

## コードレビュー結果

- Critical／Major／Minor指摘: なし
- 関数名は動詞始まりで、`applyMove`、`handleKeyDown`、`isFaceMove`の役割が明確
- 対応Moveの定義をbutton生成とvalidationで共有している
- buttonには`type="button"`、操作groupにはaccessibility labelがある
- GUIは6面を共通FaceControlから生成し、面ごとのコピー実装がない
- CW／CCW buttonは面と方向を含むaccessible nameを持つ

## アーキテクチャレビュー結果

- FrontendはCube Coreやrepositoryを直接操作せず、REST API responseを正としている
- CubeViewは引き続き描画専用で、eventやfetchを持たない
- AppがUI event、HTTP通信、React state同期を担当する
- Milestone 7のsequence parser、手順入力、再生制御を先取りしていない
- animationは描画層だけに置き、Appから直前のMoveをpropsで渡すため、HTTP／UI責務を侵食していない

## テスト結果

- Vitest: 185件成功
- Milestone 6: button、通常key、Shift key、対応外key、state同期、error時のstate維持に成功
- formatter、ESLint、TypeScript、build: 成功
- 実ブラウザ: buttonとkeyboardの両方でCubeを混ぜ、揃えられることを確認
- Animation: 全6 face、prime、2回転の軸／layer／方向を自動テストで確認
- M6.1: 6面×CW／CCW、Singmaster変換、preview開始／解除、現在のsticker色反映を自動テストで確認
- buildは成功したが、Three.jsを含むchunkが500 kBを超える警告あり

## 理解できたこと

- buttonとkeyboardで同じ非同期処理を共有する方法
- keyboard eventのkey正規化とShift判定
- API responseを正としてReact stateと3D表示を同期する理由
- effectでevent listenerを登録・解除する方法

## 理解が曖昧なこと

なし。

## 次Milestoneへの課題

- 複数Moveを表す文字列の構文を理解する
- sequenceのparseとinverseをCube Coreで扱う
- 単一Move APIと複数Move再生の責務を分離する

## M6.1 追加調整

- Move animationを操作単位のIDで識別し、hover/focus時に直前のanimationがGhostと重複して再生される問題を解消した。
- Ghostは正位置から選択方向へだけ12度動いて正位置へ戻る。反対方向へは越えない。
- Ghostを対象layerと同寸法の単一Boxに変更し、cubie間の段差をなくした。
- 広い画面では操作盤を立体Viewの右へ配置し、狭い画面では縦配置に戻るようにした。
- U/F/Rの文字を回転group外の中心面に配置し、Move animationの影響を受けないようにした。

検証結果: Vitest 188件、formatter、ESLint、TypeScript、production buildがすべて成功した。Viteの500 kB超chunk警告は既知であり、build自体は成功している。

## M6.1 Ghost・速度設定の再調整

- Ghostを往復運動から「0→指定角度→瞬時に0へリセット」する反復へ変更し、逆方向の動作に見える区間をなくした。
- Fast（120ms）、Standard（240ms）、Slow（600ms）のMove animation速度設定を追加した。
- 速度設定は表示層だけの値で、API requestやCubeStateには影響しない。
- 操作UI、共通Move処理、animation設定が分離されており、将来の操作方式切替を追加可能であることを確認した。
- 再検証ではVitest 188件、formatter、ESLint、TypeScript、production buildがすべて成功した。
