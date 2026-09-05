# Milestone 2 — REST APIテストパターン

`AGENT_SKILLS.md`のtest-designer方針に基づくテスト設計です。テストコードは学習者が書くため、ここではケース、事前条件、操作、期待結果だけを定義します。

URI、method、status、DTOの`<...>`は、`docs/workbook/milestone_2.md`で学習者が決めた値に置換してから使用します。

## API契約の置換欄

```text
<create-method>       =　POST
<collection-uri>      =  /api/cubes
<get-method>          =  GET
<resource-uri(:id)>   =  /api/cubes/{cubeId}
<reset-method>        =  PUT
<reset-uri(:id)>      =  /api/cubes/{cubeId}/reset
<create-status>       =  201
<get-status>          =  200
<reset-status>        =  200
<not-found-status>    =  404
<invalid-id-status>   =  400
```

## Happy path

### M2-HP-01 Cube生成

- 事前条件: repositoryにCubeがない
- 操作: `<create-method> <collection-uri>`を契約で決めたrequestとともに送る
- 期待結果:
  - statusが`<create-status>`
  - JSONのContent-Type
  - responseが契約で決めた識別子を含む
  - stateを返す契約ならsolved状態である
  - 全6面があり、各面9 stickersで、各面が同じ色

### M2-HP-02 作成したCubeState取得

- 事前条件: M2-HP-01で得た識別子がある
- 操作: `<get-method> <resource-uri(:id)>`
- 期待結果:
  - statusが`<get-status>`
  - responseの識別子がrequest対象と一致する
  - stateが生成直後のsolved状態と一致する
  - 取得の前後でserver stateが変わらない

### M2-HP-03 Cube reset

- 事前条件: 対象Cubeが存在する
- 操作: `<reset-method> <reset-uri(:id)>`
- 期待結果:
  - statusが`<reset-status>`
  - response body有無が契約どおり
  - 続けて取得するとsolved状態である

## State transition

### M2-ST-01 resetの冪等性

- 事前条件: 対象Cubeが存在する
- 操作: 同じCubeへresetを2回実行し、それぞれの後で取得する
- 期待結果:
  - 2回とも契約上のsuccess
  - 1回目と2回目の最終stateが同じsolved状態
  - resource identifierが変わらない

### M2-ST-02 複数Cubeの分離

- 事前条件: Cube AとCube Bを生成し、可能ならtest fixtureでAだけを非solved状態にする
- 操作: Aをresetし、AとBを取得する
- 期待結果:
  - Aの操作がBの識別子やstateへ影響しない
  - AとBを個別に取得できる
- 注記: 両方がsolved状態のままではstate干渉を十分に検出できない。fixtureを用意しない場合は識別子の分離だけをMilestone 2で確認し、Move APIが使えるMilestone 3でstate分離を必須確認する。

### M2-ST-03 非solved状態からのreset

- 事前条件: test fixtureまたはapplication層のtest seamで対象Cubeを非solved状態にする
- 操作: REST経由で対象Cubeをresetし、取得する
- 期待結果: solved状態へ戻る
- 注記: Milestone 2にはMove endpointがないため、HTTPだけで非solved状態を作れない。内部実装へ密結合せずfixtureを用意できない場合、このケースはMilestone 3で必須化する。

## Invalid input／Not found

### M2-IV-01 存在しないCubeの取得

- 操作: 正しい形式だが存在しない識別子で取得する
- 期待結果:
  - statusが`<not-found-status>`
  - 共通error DTO
  - errorが対象resource不在を機械判定できる
  - stack traceを含まない

### M2-IV-02 存在しないCubeのreset

- 操作: 正しい形式だが存在しない識別子でresetする
- 期待結果: M2-IV-01と同じnot-found契約

### M2-IV-03 不正形式の識別子

- 操作: 空、短すぎる値、許可外文字など、採用した識別子仕様に違反する値を送る
- 期待結果:
  - statusが`<invalid-id-status>`
  - repository検索より前にvalidationされる
  - not-foundとvalidation errorを契約どおり区別する

### M2-IV-04 不正JSON

- 対象: request bodyを採用した操作だけ
- 操作: 壊れたJSONまたは不正なContent-Typeを送る
- 期待結果: 決定したvalidation error契約になり、processが終了しない
- 実施判定: Milestone 2の3操作はいずれもrequest bodyを採用しないため対象外。bodyを導入する後続Milestoneで実施する。

### M2-IV-05 許可していないHTTP method

- 操作: 各URIへ契約外methodを送る
- 期待結果: 決定したmethod error契約となり、stateを変更しない

## Boundary

### M2-BD-01 識別子の境界

- 対象: 長さや文字種を持つ識別子を採用した場合
- 操作: 最小長、最大長、その直前／直後を試す
- 期待結果: 境界内だけを受理する

### M2-BD-02 空request body

- 対象: bodyが不要な操作、または任意bodyを採用した操作
- 操作: bodyなしで送る
- 期待結果: 契約どおりに成功またはvalidation errorとなり、偶然の例外にならない

## Integration

### M2-IN-01 作成から取得まで

- 操作: HTTPだけでCube生成後、responseの識別子を使って取得する
- 期待結果: 同じresourceのsolved stateを取得できる

### M2-IN-02 作成からreset、取得まで

- 操作: HTTPだけで生成、reset、取得を順に実行する
- 期待結果: 全操作が同じ識別子を対象とし、最後がsolved状態

### M2-IN-03 response schemaの一貫性

- 操作: create、get、resetの成功responseと各error responseを取得する
- 期待結果:
  - 同じ概念に同じfield名と型を使う
  - domain内部のprivate fieldを漏らさない
  - error shapeがendpoint間で一貫する

### M2-IN-04 process restartの制限

- 対象: in-memory repositoryを選んだ場合
- 操作: Cube生成後にlocal API processを再起動し、同じ識別子を取得する
- 期待結果: 永続化されないという明記済みの制限と実際の動作が一致する
- 注記: これはMilestone 2の暫定構成を可視化するテストであり、永続化成功を期待しない。
- 実施結果: ローカルAPI停止前に作成した`cubeId`へserver再起動後にGETし、`404 RESOURCE_NOT_FOUND`となることを手動確認した。

## Regression／Domain boundary

### M2-RG-01 API操作でCube Coreを壊さない

- 操作: 複数Cubeの生成、取得、resetを繰り返す
- 期待結果: 各stateが54 stickers、6色各9枚、固定centerを維持する

### M2-RG-02 responseの変更がdomain snapshotを変更しない

- 操作: test内でresponse DTOを変更してから同じCubeを再取得する
- 期待結果: server側CubeStateは変化しない

## 実装開始の最低条件

- [ ] API契約の置換欄がすべて埋まっている
- [ ] Happy path 3件の期待responseをJSON例として自分で書いた
- [ ] not-foundとinvalid identifierの違いを説明できる
- [ ] resetの表現を選んだ理由を説明できる
- [ ] 状態保存の暫定方針と制限を説明できる
- [ ] M2-ST-03をMilestone 2で実施するかMilestone 3へ送るか決めた

この条件が揃ったら自力実装を開始する。テストコード自体は学習者が記述する。
