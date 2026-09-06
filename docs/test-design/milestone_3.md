# Milestone 3 — Move REST APIテストパターン

テストの設計・コード実装・実行はAgentが担当する。production codeは学習者の自力実装範囲として変更しない。

以下の`<...>`は`docs/workbook/milestone_3.md`で学習者が契約を決めた後に確定する。

## 契約置換欄

```text
<move-uri(:cubeId)>         = /api/cubes/{cubeId}/moves
<move-method>               = POST
<request-json>              = {"move":"R"}
<request-content-type>      = application/json
<success-status>            = 200
<success-response>          = CubeStateResponseDto
<invalid-json-status>       = 400 JSON_NOT_CORRECT
<invalid-request-status>    = 400 REQUEST_NOT_CORRECT
<invalid-move-status>       = 400 MOVE_NOT_CORRECT
<unsupported-media-status>  = 415 UNSUPPORTED_MEDIA_TYPE
<not-found-status>          = 404 RESOURCE_NOT_FOUND
<method-not-allowed-status> = 405 METHOD_NOT_ALLOWED
```

## Happy path

### M3-HP-01 1手適用

- Cubeを作成する
- `<move-method> <move-uri(:cubeId)>`で`R`を送る
- success statusと契約どおりのresponseを確認する
- GETしたstateが`R`適用後と一致する

### M3-HP-02 全18 Move

- `R/R'/R2/L/L'/L2/U/U'/U2/D/D'/D2/F/F'/F2/B/B'/B2`を個別のCubeへ適用する
- すべてsuccessとなり、Cube Coreの期待stateと一致する

## State transition／Property

- M3-ST-01: `R`を4回適用するとidentity
- M3-ST-02: `R`の後に`R'`を適用するとidentity
- M3-ST-03: `R2`と`R`2回が同じstate
- M3-ST-04: Move後のresetでsolvedへ戻る
- M3-ST-05: Cube AへのMoveがCube Bへ影響しない

## Invalid input

- M3-IV-01: 正しいUUIDだがCubeが存在しない場合はnot found
- M3-IV-02: cubeId形式不正はrepository検索前にvalidation error
- M3-IV-03: 壊れたJSON
- M3-IV-04: bodyがobjectでない
- M3-IV-05: `move`がない
- M3-IV-06: `move`が文字列でない
- M3-IV-07: 空文字、未対応文字列、小文字、前後空白
- M3-IV-08: 不正requestでCubeStateが変化しない
- M3-IV-09: Content-Type不正
- M3-IV-10: 未許可method

## Boundary

- M3-BD-01: 最短の1文字Move
- M3-BD-02: prime付き2文字Move
- M3-BD-03: `2`付き2文字Move
- M3-BD-04: 余分なfieldの許可／拒否が契約どおり
- M3-BD-05: bodyなし

## Integration

- M3-IN-01: POST Cube→Move→GET
- M3-IN-02: POST Cube→複数Move→GET→reset→GET
- M3-IN-03: error responseがMilestone 2と同じshape
- M3-IN-04: local HTTP serverを通した実HTTP request

## Regression

- M3-RG-01: 全Move後も54 stickers、6色各9枚、固定centerを維持する
- M3-RG-02: response変更がrepository内stateへ影響しない
- M3-RG-03: Milestone 2のcreate／GET／resetが引き続き成功する

## テスト実装条件

workbookの契約が確定するまでは、AgentはURI、method、DTO、statusを推測してテストコードへ固定しない。契約確定後、公開HTTP境界を中心にテストを実装する。
