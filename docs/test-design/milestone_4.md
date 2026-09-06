# Milestone 4 — REST API Test 設計

## 目的

Milestone 2と3で実装したREST APIの主要契約を、Milestone 4の最低要件ごとに独立した自動テストとして読み取れるようにする。

## テスト対象

| ID    | 観点           | 主な境界                             |
| ----- | -------------- | ------------------------------------ |
| M4-01 | 正常なCube生成 | HTTP／application／repository        |
| M4-02 | 存在しないCube | HTTP／application／repository        |
| M4-03 | 正常Move       | HTTP／application／Cube Core         |
| M4-04 | 不正Move       | HTTP validation／状態保護            |
| M4-05 | Reset          | HTTP／application／Cube Core         |
| M4-06 | `R^4`          | 連続HTTP command／Cube Core property |
| M4-07 | `R R'`         | 連続HTTP command／inverse property   |

## 設計方針

- production codeの内部関数ではなく、公開HTTP境界の`handleCubeRequest`へRequestを渡す。
- statusだけでなくresponse DTOと永続化された状態を確認する。
- 異常系ではError DTOに加え、Cube状態が変化しないことを確認する。
- propertyテストでは各Move requestの成功と最終状態の両方を確認する。
- 各テストを独立させ、他テストで生成したcubeIdへ依存しない。

## CIとの接続

ルートの`npm test`はVitestの全`*.test.ts`を実行する。GitHub Actionsの`.github/workflows/ci.yml`はpushとpull requestで`npm test`を実行するため、本テストも自動的にCI対象となる。
