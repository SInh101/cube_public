# Milestone 2 — REST API設計ワークシート

このワークシートは学習者がCube生成、CubeState取得、Cube resetのREST APIを自力設計するためのものです。Codexは選択肢と確認観点だけを示し、URI、HTTP method、status、DTOの完成値は記入しません。

## 実装境界

### 自力実装するもの

- Cube resourceの単位と識別子
- endpointのURI
- HTTP method
- request／response DTO
- success／error status
- validationとerror response
- API handlerからCube Coreを呼ぶ処理
- Cubeを複数request間で参照するためのAPI側状態管理

### Codexが実装しないもの

- 完成endpoint
- handler／service／repositoryの完成コード
- request／response DTOの確定
- status codeの確定
- REST APIテストコード

### 変更してはいけない境界

- Cube CoreにHTTP request、response、status codeを持ち込まない
- FrontendからCube CoreやSupabaseを直接呼ばない
- API handlerへ回転数学を複製しない
- Milestone 9より前にPreset用DB schemaやCRUDを実装しない

## 1. Resourceを決める

次の問いへ文章で回答する。

- 作成・取得・resetの対象となるresourceは何か：`Cube`
- 1つのresourceを識別する値は何か：`UUID`
- 識別子をserverとclientのどちらが作るか：`server`
- collection URI：`/api/cubes`
- individual resource URI：`/api/cubes/{cubeId}`
- resetをresource更新とcommand resourceのどちらで表現するか：`command resource`
- その表現を選ぶ理由：`単純な操作の送信として扱うため。URIで明確になる。`

## 2. HTTP契約を決める

値は自分で記入する。

| 操作          | URI                         | Method | Request body | Success status | Response body                                                     |
| ------------- | --------------------------- | ------ | ------------ | -------------- | ----------------------------------------------------------------- |
| Cube生成      | `/api/cubes`                | `POST` | `none`       | `201`          | `{cubeId:{cubeId}}`                                               |
| CubeState取得 | `/api/cubes/{cubeId}`       | `GET`  | `none`       | `200`          | `cubeの全面を返す。state:{faces:{U:{},R:{},F:{},D:{},L:{},B:{}}}` |
| Cube reset    | `/api/cubes/{cubeId}/reset` | `PUT`  | `none`       | `200`          | `cubeの全面を返す。state:{faces:{U:{},R:{},F:{},D:{},L:{},B:{}}}` |

確認事項：

- 生成responseから、後続の取得・resetに必要な識別子を得られるか
- 取得操作がserver stateを変更しないか
- resetを同じ状態で複数回実行しても結果が変わらないか
- responseがCube Core内部classをそのままJSON化したものになっていないか
- clientが次に何を呼べばよいか判断できる情報があるか

## 3. DTOを決める

### CubeState response

```text
resource identifier: cubeId
state representation: state.facesにU/R/F/D/L/Bの6面 各面は左上から右下へ並べた9個のColor文字列の配列
additional fields and reason: 現在はなし
```

Cube Coreの`CubeState`を確認し、HTTP上で必要な情報だけをresponse DTOへ変換する。domain objectへHTTP専用fieldを追加しない。

### Error response

```text
machine-readable error identifier: error.code
human-readable message: error.message
field-level details, if needed: error.details  入力項目に関するエラーがある場合だけ付加する。
```

全endpointで同じerror shapeを使えるか確認する。

## 4. Errorとvalidationを決める

| 状況                                           | 検出する層          | Status | Error identifier         | 外部へ出す説明           |
| ---------------------------------------------- | ------------------- | ------ | ------------------------ | ------------------------ |
| resourceが存在しない                           | `repository`        | `404`  | `RESOURCE_NOT_FOUND`     | `resource not found`     |
| 識別子の形式が不正                             | `HTTP入力の処理時`  | `400`  | `IDENTIFIER_NOT_CORRECT` | `identifier not correct` |
| JSON形式が不正(bodyは後続マイルストーンで設定) | `HTTP bodyの処理時` | `400`  | `JSON_NOT_CORRECT`       | `JSON not correct`       |
| 許可しないmethod                               | `routing`           | `405`  | `METHOD_NOT_ALLOWED`     | `method not allowed`     |
| 予期しない内部エラー                           | `error処理部`       | `500`  | `INTERNAL_SERVER_ERROR`  | `internal server error`  |

内部例外のstack traceや秘密情報をresponseへ含めない。

## 5. 一時的な状態管理を決める

Milestone 2ではCube resourceを複数requestから参照する必要がある一方、Database学習はMilestone 9です。Vercel Functionsのprocess memoryはcold startやinstance分割で失われるため、本番永続化には使えません。

Milestone 2の候補：

- API process内のin-memory repositoryを教材用の暫定実装にする
- repository境界を設け、handlerから`Map`を直接操作しない
- restart／cold startで消える制限をREADMEとテスト前提に明記する
- DatabaseやSupabaseへの移行は後続Milestoneまで行わない

今回選ぶ方針と制限：`in-memory repositoryで暫定実装。永続化されてなくて問題ない。後々差し替えるので。同じMapは共有されない。`

## 6. 実装前チェック

- [〇] 3操作すべてのURIとmethodを自分で決めた
- [〇] success statusとresponseを自分で決めた
- [〇] 存在しないresourceのerrorを決めた
- [〇] DTOとCube Core domain modelの境界を説明できる
- [〇] handler、application logic、repositoryの責務を説明できる
- [〇] in-memory状態の制限を説明できる
- [〇] `docs/test-design/milestone_2.md`の空欄をAPI契約で置換した
- [〇] Codexから完成コードを受け取らずに実装を開始できる

## 7. 実装後にレビューへ出す情報

- 設計済みのHTTP契約表
- 変更ファイル一覧
- 実行したテストと結果
- 判断に迷った箇所
- 自分で理解できている点／曖昧な点

code-reviewerはURI、method、status、request、response、error、validationを確認する。原則として直接修正せず、学習者へ修正機会を残す。
