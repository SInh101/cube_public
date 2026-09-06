# Milestone 4 — REST API Test 理解ワークブック

## 自力実装の有無と規模

production codeおよびテストコードの自力実装はなし（0ファイル・0 endpoint）。自力担当は、7テストについて目的、入力、期待結果、失敗時に示す契約違反を説明する学習確認である。

## M4-01 正常なCube生成

- 目的: Cube resourceを新規作成できることを確認する。
- 入力: `POST /api/cubes`（request bodyなし）。
- 期待結果: `201 Created`と、UUID形式の`cubeId`を持つresponse bodyが返る。
- 失敗時に示す契約違反: Cube生成APIが`201`を返す契約、または生成したCubeをUUID形式の`cubeId`で識別して返すresponse契約に違反している。

## M4-02 存在しないCube

- 目的: UUIDとして正しいが、保存されていないCubeを取得できないことを確認する。
- 入力: `GET /api/cubes/{cubeId}`へ、存在しないUUIDを指定する。
- 期待結果: `404 Not Found`と、codeが`RESOURCE_NOT_FOUND`、messageが`Cube not found`のError DTOが返る。
- 失敗時に示す契約違反: 存在しないCubeをresource不在として扱うstatus契約、または共通Error DTOのresponse契約に違反している。

## M4-03 正常Move

- 目的: 指定したCubeへ正常なMoveを適用できることを確認する。
- 入力: Cubeを作成後、`Content-Type: application/json`を付けて`POST /api/cubes/{cubeId}/moves`へ`{"move":"R"}`を送る。
- 期待結果: `200 OK`と、同じ`cubeId`および`R`適用後のstateを持つ`CubeStateResponseDto`が返る。
- 失敗時に示す契約違反: Move commandのmethod／URI、成功status、または適用後のCubeStateを返すresponse契約に違反している。

## M4-04 不正Move

- 目的: 対応していないMoveを拒否し、Cubeの状態を変更しないことを確認する。
- 入力: Cubeを作成後、`Content-Type: application/json`を付けて`POST /api/cubes/{cubeId}/moves`へ`{"move":"X"}`を送る。
- 期待結果: `400 Bad Request`と、codeが`MOVE_NOT_CORRECT`のError DTOが返り、request前後のCubeStateが同一である。
- 失敗時に示す契約違反: 未対応Moveをvalidation errorとして拒否する契約、共通Error DTOの契約、または不正requestで状態を変更しない契約に違反している。

## M4-05 Reset

- 目的: Move適用後のCubeをsolved状態へ戻せることを確認する。
- 入力: Cubeを作成して`R`を適用した後、`PUT /api/cubes/{cubeId}/reset`を送る。
- 期待結果: `200 OK`と、同じ`cubeId`およびsolved状態を持つ`CubeStateResponseDto`が返る。
- 失敗時に示す契約違反: reset commandのmethod／URI、成功status、識別子を維持する契約、またはCubeをsolved状態へ戻す状態遷移に違反している。

## M4-06 `R^4`

- 目的: `R`を4回適用すると開始時のsolved状態へ戻る性質を、連続するHTTP commandでも維持できることを確認する。
- 入力: Cubeを作成後、`POST /api/cubes/{cubeId}/moves`へ`{"move":"R"}`を4回送る。
- 期待結果: 4回のrequestがすべて`200 OK`となり、最後に取得したCubeStateがsolved状態と同一になる。
- 失敗時に示す契約違反: 同じCubeへMoveを順番に蓄積する状態管理、各Move requestの成功契約、または`R^4 = identity`というCube Coreの性質に違反している。

## M4-07 `R R'`

- 目的: `R`の後に逆回転`R'`を適用すると開始時のsolved状態へ戻ることを確認する。
- 入力: Cubeを作成後、`POST /api/cubes/{cubeId}/moves`へ`{"move":"R"}`、続けて`{"move":"R'"}`を送る。
- 期待結果: 2回のrequestがどちらも`200 OK`となり、最後に取得したCubeStateがsolved状態と同一になる。
- 失敗時に示す契約違反: 同じCubeへMoveを順番に適用する状態管理、各Move requestの成功契約、またはMoveとinverseでidentityになるCube Coreの性質に違反している。

## CIで実行される経路

pushまたはpull requestを契機に`.github/workflows/ci.yml`の`verify` jobが開始される。そこで`npm test`が実行され、Vitestが`apps/api/src/http/milestone4.rest-api.test.ts`を自動検出してM4-01〜07を実行する。

## 完了チェック

- [x] 7テストすべての4項目を記載した
- [x] response statusとresponse bodyの両方に触れた
- [x] M4-04で不正request時に状態が変わらないことを説明した
- [x] M4-06とM4-07が例示するCubeの性質を説明した
- [x] テストがCIで実行される経路を説明した
