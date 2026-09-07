# Milestone 5 — 3D Cube Viewer ワークブック

## 自力実装の有無と規模

あり。既存の`apps/web/src/App.tsx` 1ファイルで、1つの非同期取得フローとloading／error／successの3状態を実装する。endpointの新規実装はなし。

## 完成条件

- mount時に`POST /api/cubes`でCubeを作成する
- responseの`cubeId`を使い、`GET /api/cubes/{cubeId}`でCubeStateを取得する
- 取得中は`loading`を含む表示を出す
- createまたはGETの非成功statusでは、`role="alert"`の要素に`error`を含む表示を出す
- 取得成功時だけ`<CubeView state={取得したstate} />`を表示する
- cleanup時に進行中のfetchを中止する

## 自力実装対象

`apps/web/src/App.tsx`だけを変更する。

利用する既存要素：

- `CubeView`: `apps/web/src/components`からimportする
- DTO: `CubeStateResponseDto`と`CreateCubeResponseDto`を`@rubiks-learning/api-contract`からimportする
- API base URL: 既存と同じ`import.meta.env.VITE_API_BASE_URL ?? ''`

## 禁止事項

- `CubeView.tsx`や`cubeViewModel.ts`へfetchを追加しない
- FrontendからCube Coreを直接操作しない
- Milestone 6のMove button、keyboard event、API mutationを先取りしない
- テストを成功させるためにtest fileを変更しない

## 実装後の確認

```bash
npm test -- --run
npm run typecheck
npm run dev:web
```

ローカルAPIも起動し、ブラウザでsolved Cubeが3D表示されることを確認する。
