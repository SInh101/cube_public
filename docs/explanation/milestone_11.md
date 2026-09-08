# Milestone 11 — Commutator Core / REST 実装解説

## 全体設計

交換子`[A, B]`を`A B A^-1 B^-1`へ展開し、対象Cubeへ一括適用する。Cube数学はCube Core、処理の組み立てはapplication、HTTP検証とstatus変換はhandler、公開形式はapi-contractへ分離した。

```text
POST /api/cubes/{cubeId}/commutators
  -> HTTP validation
  -> applyCommutatorToCube
  -> Commutator / MoveSequence
  -> CubeRepository
```

## 公開HTTP契約

- Method / URI: `POST /api/cubes/{cubeId}/commutators`
- Request: `{ "a": "R", "b": "U" }`
- Success: `200 OK`
- Response: `cubeId`、展開済み`sequence`、`moves`、4部分の`boundaries`、適用後`state`
- 境界は`startIndex`を含み`endIndex`を含まない半開区間とする。

## `packages/cube-core/src/Commutator.ts`

- 役割: A/Bから交換子と教材表示用の4境界を生成する。
- コード要約: 既存の`invertSequence`を再利用し、A、B、Aの逆、Bの逆を順に連結する。各部分についてpart名、開始index、終了index、Move列を保持する。
- 設計理由: HTTPやCube IDをdomainへ持ち込まず、Milestone 12の段階強調でも同じ境界情報を再利用できるようにするため。

## `packages/api-contract/src/commutators.ts`

- 役割: Request、Response、境界の公開DTOを定義する。
- コード要約: domain classをHTTPへ直接公開せず、JSONにできる文字列、配列、CubeStateだけで契約を表す。

## `apps/api/src/application/applyCommutatorToCube.ts`

- 役割: 入力のparse、交換子生成、Cube取得、全Move適用、保存、DTO生成を順序付ける。
- コード要約: AとBを両方parseして`Commutator`を完成させた後にRepositoryからCubeを取得・変更する。不正Moveの場合はCubeへ一手も適用されない。
- エラー: A/Bのどちらが不正かを`CommutatorInputError`へ変換し、Cube不在は既存`CubeNotFoundError`を使用する。

## `apps/api/src/http/handlers/handleCommutatorRequest.ts`

- 役割: Commutator commandのHTTP境界を担当する。
- コード要約: Content-Type、JSON構文、bodyの厳密なshapeを検証し、application errorを400/404へ、予期しないerrorを500へ変換する。
- 公開エラー: 不正A/Bは`SEQUENCE_NOT_CORRECT`とfield・token位置、不正bodyは`REQUEST_NOT_CORRECT`、非JSONは`UNSUPPORTED_MEDIA_TYPE`を返す。

## Route / deployment

- `handleCubeRequest.ts`: `commutators` routeとPOST制約をCube API dispatcherへ追加する。
- `apps/api/vercel.json`: nested URIを単一の`cubes` Functionへrewriteする。query形式も同じhandlerで解決する。
- `localServer.ts`: Cube routeへの既存fallbackを通るため、新規server分岐なしで実HTTPから利用できる。

## テスト

- `Commutator.test.ts`: 展開順、半開区間、空入力を検証する。
- `milestone11.commutator.test.ts`: response、Cube更新、不正A/Bと非変更保証、404、body/media type/UUID/method、空入力、Vercel rewrite経路を検証する。
- `localServer.test.ts`: Node HTTP serverを介した実HTTP requestを検証する。

## 後続Milestoneへの影響

Milestone 12はResponseの`boundaries`と`moves`をPlaybackへ渡せば、現在indexがどの部分に属するかを`startIndex <= index < endIndex`で判定できる。Frontendが交換子の逆順計算を再実装する必要はない。Cubeの保存先は引き続き`CubeRepository`境界の内側にあり、永続化方式を変えてもHTTP DTOとCube Coreは維持できる。
