# Milestone 3 — Move REST API設計ワークシート

このMilestoneでは、既存Cubeへ1手のMoveを適用するREST APIを学習者が設計・実装する。Agentはテスト設計・テストコード・レビューを担当し、production codeを代筆しない。

## 自力実装の規模

- endpoint: 1個
- application use case: 1個
- request DTO: 1個
- 既存response／error DTOの再利用または必要最小限の追加
- HTTP routerへのroute追加: 1操作

## 1. commandのREST表現を決める

次を自分で記入する。

```text
resource／command名: Move command
URI: /api/cubes/{cubeId}/moves
HTTP method: POST
この表現を選ぶ理由: Move適用は同じrequestを繰り返すたびにCubeStateが変わる非冪等なcommandであるため、Cube resource全体を置換するPUTではなく、対象Cubeへ新しいMove commandを送るPOSTとして表現する。Milestone 7のMoveSequenceは`/api/cubes/{cubeId}/move-sequences`という別resourceにできるため衝突しない。
```

確認観点：

- MoveはCube resource全体の置換ではなく、既存Cubeへ状態遷移を要求するcommandである
- 後続のMoveSequence APIとURIやrequestの意味が衝突しない
- URIへ動詞を含める場合、その理由を説明できる

## 2. HTTP契約を決める

```text
request Content-Type: application/json
request body: {move: string}
success status: 200
success response body: CubeStateResponseDto
```

JSON例を自分で記入する。

```json
{ "move": "R" }
```

確認観点：

- `R`、`R'`、`R2`などを文字列として一意に表現できる
- 適用後のCubeStateを返すか、clientにGETを要求するかを決める
- 同じ概念にはMilestone 2の`cubeId`、`state.faces`と同じfield名を使う

対応するMoveはCube Coreが公開する次の18値へ完全一致する文字列とする。

```text
R / R' / R2 / L / L' / L2 / U / U' / U2
D / D' / D2 / F / F' / F2 / B / B' / B2
```

## 3. validationとerrorを決める

| 状況                | 検出する層                                | Status | Error code               | 外部へ出す説明                                   |
| ------------------- | ----------------------------------------- | ------ | ------------------------ | ------------------------------------------------ |
| cubeId形式不正      | HTTP routerのpath validation              | `400`  | `IDENTIFIER_NOT_CORRECT` | `cubeId must be a valid UUID`                    |
| Cube不在            | application層がrepository検索結果から判定 | `404`  | `RESOURCE_NOT_FOUND`     | `Cube not found`                                 |
| JSON構文不正        | HTTP handlerのJSON parse時                | `400`  | `JSON_NOT_CORRECT`       | `Request body must be valid JSON`                |
| bodyの型／shape不正 | HTTP handlerのrequest DTO validation      | `400`  | `REQUEST_NOT_CORRECT`    | `Request body does not match the required shape` |
| 未対応Move          | HTTP handlerのMove validation             | `400`  | `MOVE_NOT_CORRECT`       | `move must be one of the supported Move values`  |
| Content-Type不正    | HTTP handlerのbody parse前                | `415`  | `UNSUPPORTED_MEDIA_TYPE` | `Content-Type must be application/json`          |
| 未許可method        | HTTP router                               | `405`  | `METHOD_NOT_ALLOWED`     | `Method not allowed`                             |
| 内部例外            | HTTP error変換部                          | `500`  | `INTERNAL_SERVER_ERROR`  | `internal server error`                          |

確認観点：

- JSONをparseできない場合と、parse後の値が契約違反の場合を区別するか
- `move`の前後空白、小文字、空文字を正規化するか拒否するか
- 不正request時にCubeStateを変更しない
- Cube Coreへ不正な文字列を渡す前にHTTP境界で検出する
- stack traceや内部例外messageをresponseへ漏らさない

設計決定：

- JSONとしてparseできない場合だけ`JSON_NOT_CORRECT`とする
- parse後の値がobjectでない、`move`がない、`move`が文字列でない場合は`REQUEST_NOT_CORRECT`とする
- `move`が文字列でもCube Coreの18 Moveに完全一致しない場合は`MOVE_NOT_CORRECT`とする
- 小文字、空文字、前後空白は正規化せず`MOVE_NOT_CORRECT`として拒否する
- field単位の理由が必要な場合は共通Error DTOの`error.details`へ`field: "move"`と`reason`を設定する
- validation errorではapplication use caseを呼ばず、CubeStateを変更しない
- bodyに`move`以外のfieldがある場合は`REQUEST_NOT_CORRECT`として拒否する
- Content-Typeがない場合やmedia typeが`application/json`以外の場合は、JSONの内容を読む前に`415`を返す
- `application/json; charset=utf-8`のようなparameter付きContent-Typeは受理する

## 4. 責務を分ける

次の担当を文章で記入する。

```text
HTTP router: handleCubeRequestはURIとmethodを判定し、Move用handlerへrequestとcubeIdを渡す
request validation／DTO変換: handleApplyMoveRequestがContent-Type、JSON、request DTO、Move値を検証し、application結果をHTTP responseへ変換する
application use case: application/applyMoveToCube.tsがrepositoryからCubeを取得し、Cube CoreへMove適用を委譲してCubeStateResponseDtoを返す
repository: repository/CubeRepository.ts
Cube Core: Cube.tsのapplyMoveが回転処理と状態遷移を担当する
```

禁止事項：

- HTTP routerへ回転処理を実装しない
- Cube CoreへHTTP status、Request、Response、Error DTOを追加しない
- handlerからin-memory `Map`を直接操作しない
- Milestone 7のMoveSequence parserを先取りしない

## 5. 実装開始チェック

- [x] URIとmethodを決めた
- [x] request JSON例を記入した
- [x] success statusとresponseを決めた
- [x] JSON不正とMove不正の扱いを決めた
- [x] 全18 Moveを受理する契約を説明できる
- [x] 不正requestでstateを変更しない方針を説明できる
- [x] 後続MoveSequence APIと衝突しない理由を説明できる
- [x] Agentが実装するテストの期待値を確定できる

すべて埋まった後、Agentが`docs/test-design/milestone_3.md`を契約値で確定して自動テストを実装する。そのテストを基準に学習者がproduction codeを自力実装する。
