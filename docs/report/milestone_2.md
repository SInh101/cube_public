# Milestone 2 — Cube REST API 実施レポート

## Milestoneの目的

HTTPだけでCubeを作成し、状態を取得し、同じresourceをresetできるREST APIを設計・実装する。

## 実装した機能

- `POST /api/cubes`: solved Cubeを作成し、`201`と`cubeId`を返す
- `GET /api/cubes/{cubeId}`: CubeStateを取得し、`200`で返す
- `PUT /api/cubes/{cubeId}/reset`: 同じCubeをsolved状態へ戻し、`200`で更新後stateを返す
- 不正UUIDの`400`、resource不在の`404`、未許可methodの`405`、内部例外の`500`
- process内でstateを維持するローカルNode HTTP server

## 自力実装の有無と規模

あり。

- REST resource／URI／method／success status／response形式: 3操作
- error／validation契約: 5分類
- 初期実装対象: create、get、resetのapplication／handler／DTO

学習者がHTTP契約とDTOを決定し、初期コードを組み立てた。その後の明示依頼に基づき、Agentが共通化、修正、実HTTP対応、自動テストを担当した。

## 自分で設計・実装した対象

- Cubeをresource、UUIDをserver生成識別子とする設計
- collection／individual resource／reset commandのURI
- POST／GET／PUTと201／200の選択
- `cubeId`および`state.faces`を持つresponse設計
- 400／404／405／500の区別
- create／get／resetの初期application処理

## Agentが担当した部分

- Cube生成支援関数、UUID生成、repository境界とin-memory実装
- DTOのcontract package配置とError DTO
- reset／GETのレビュー後修正
- 単一HTTP routerとローカルNode HTTP server
- repository契約の非同期化
- 全自動テストの設計、実装、実行
- Vercel Functionsでのin-memory非共有の調査とローカル実行への切り替え

詳細は`docs/explanation/milestone_2.md`に記録する。

## レビュー指摘と修正内容

- `CubeStateResponseDto`の未定義Sticker、配列長、field名、exportを修正
- `cubeReset`を動詞先頭の`resetCube`へ変更
- `CubeNotFoundError`を複数ユースケースで共有できるファイルへ分離
- GETのURIとファイル配置、reset用のまま残っていたpath解析を修正
- 複数Vercel Function間でin-memory stateを共有できないため、Cube APIのVercel公開をMilestone 9まで延期
- Milestone 2～8では永続processのローカルHTTP serverを使用

## テスト結果

- Vitest: 61件成功、todoなし
- ESLint: 成功
- TypeScript全workspace: 成功
- build: 成功
- 実HTTP:
  - POST→GET→reset→GET: 201→200→200→200
  - 不正UUID: 400 `IDENTIFIER_NOT_CORRECT`
  - 存在しないUUID: 404 `RESOURCE_NOT_FOUND`
  - 未許可method: 405 `METHOD_NOT_ALLOWED`
  - server再起動後の既存ID: 404 `RESOURCE_NOT_FOUND`

## 状態管理の制限

Cubeはlocal API process内だけに保持する。server停止、再起動、process分割を越えて永続化しない。Milestone 9で外部repositoryを導入するまで、stateを持つCube APIはVercelへ公開しない。

repositoryはPromiseベースのinterfaceを持つため、DB導入時は保存形式とCube復元方法を設計したうえで実装を差し替える。

## 理解できたこと

- resource URIとcommand URIの使い分け
- validation errorとresource不在の違い
- domain modelとHTTP DTOの境界
- handler、application、repositoryの責務
- serverless functionでprocess memoryを永続stateとして扱えない理由

## 理解が曖昧なこと

なし。DBでのCubeState保存形式と復元方法はMilestone 9で設計する。

## 次Milestoneへの課題

- Move適用をcommandとして表現するHTTP契約を自力設計する
- Move文字列をHTTP境界でvalidationする
- AgentがMilestone 3のテストパターンと自動テストを実装する
- production codeの自力実装境界を維持する
