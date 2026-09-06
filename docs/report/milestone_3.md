# Milestone 3 — Move REST API 実施レポート

## Milestoneの目的

Cubeに1手のMoveを適用するcommand APIを設計・実装し、HTTP経由で複数のMoveを順番に適用できるようにする。

## 実装した機能

- `POST /api/cubes/{cubeId}/moves`: JSONで受け取ったMoveをCubeへ適用し、`200`と更新後の`CubeStateResponseDto`を返す
- Cube Coreが公開する18種類のMoveだけを受理する
- Content-Type、JSON構文、request shape、Move、UUID、Cube存在有無、HTTP methodを検証する
- 既存のcreate、GET、resetと同じrepository上で状態遷移を維持する

## 自力実装の有無と規模

あり。

- endpoint: 1個
- application use case: 1個
- request DTO: 1個
- HTTP routerへのroute追加: 1操作
- validation／error契約: 7分類

学習者がHTTP契約、DTO、`applyMoveToCube` application処理、error production実装を担当した。Agentはテスト設計と自動テストを担当し、明示依頼された範囲に限ってrouterとMove専用handlerを実装した。

## 自分で設計・実装した対象

- MoveをCubeに対する非冪等なcommandとして表現するREST契約
- `POST /api/cubes/{cubeId}/moves`のrequest／response
- `MoveRequestDto`
- repositoryからCubeを取得し、Move適用後に保存する`applyMoveToCube`
- エラー契約に基づくvalidation、例外処理、Error DTOへの変換

## Agentが担当した部分

- Milestone 3のworkbookとテスト設計書
- 全18 Move、状態遷移、異常系、境界値、回帰、実HTTPの自動テスト
- 明示依頼に基づく`handleCubeRequest`のMove route追加
- 明示依頼に基づく`handleApplyMoveRequest`の実装
- Agent担当ファイルの実装解説
- Milestone終了時のformatter、lint、typecheck、test、build確認

詳細は`docs/explanation/milestone_3.md`に記録する。

## レビュー指摘と修正内容

- `applyMoveToCube`の非同期repository呼び出しに不足していた`await`を追加
- application packageから`applyMoveToCube`を公開
- application use caseの対象を明確にし、Cube Coreの同名メソッドと区別するため`applyMove`を`applyMoveToCube`へ改名
- routerへMove処理を直接書かず、Move専用handlerへ委譲
- URI、method、Content-Type、JSON、DTO shape、MoveをHTTP境界で検証
- 余分なrequest fieldを許可しない契約を固定
- Prettier違反3ファイルを整形

## コードレビュー結果

- Critical／Major／Minor指摘: なし
- Move routeは既存create／GET／resetとの責務を維持している
- handlerはHTTP入力検証とresponse変換、applicationは状態遷移、repositoryは保存を担当している
- 不正入力時にapplication use caseを呼ばず、Cube状態を変更しないことをテストで確認した

## アーキテクチャレビュー結果

- HTTP routerからCubeの回転処理を分離している
- HTTP固有のRequest／Response／status codeをCube Coreへ持ち込んでいない
- handlerからin-memory Mapを直接操作せず、applicationとrepositoryの境界を経由している
- Milestone 7のMoveSequence parserを先取りしていない
- 後続の永続repository導入時にapplication APIを維持できる

## テスト結果

- Vitest: 133件成功、todoなし
- Milestone 3: 全18 Move、`R^4`、`R R'`、`R2`、複数Cube、reset、validation、回帰を確認
- 実HTTP統合: Cube作成後に`R U R' U'`を順番に適用し、GETで同じstateを取得できることを確認
- ESLint: 成功
- TypeScript全workspace: 成功
- build: 成功
- Prettier: 成功

## 理解できたこと

- resourceの置換とcommand送信の違い
- router、handler、application、repository、Cube Coreの責務分担
- request DTOの構造検証とdomainのMove検証の違い
- 不正入力で状態遷移を発生させない重要性

## 理解が曖昧なこと

なし。複数Moveを1requestで扱う設計とparserはMilestone 7で扱う。

## 次Milestoneへの課題

- 各自動テストが保証するHTTP契約と、失敗時に示す違反を説明する
- Milestone 4では既存テストを教材として整理し、後段の機能を先取りしない
