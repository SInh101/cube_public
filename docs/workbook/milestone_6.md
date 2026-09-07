# Milestone 6 — Interactive Cube UI ワークブック

## 自力実装の有無と規模

あり。`apps/web/src/App.tsx`を中心に、6個のbutton、6種類のkeyboard input、通常／inverse Move、1つのMove送信処理を実装する。新規API endpointはない。

## 自力実装対象

- 初期POSTで取得した`cubeId`をMove送信用にReact stateへ保持する
- `R`／`L`／`U`／`D`／`F`／`B`を受け取る共通Move送信関数を作る
- `POST /api/cubes/{cubeId}/moves`へJSONを送る
- 成功responseのstateで既存CubeStateを更新する
- 6個のbuttonを共通Move送信関数へ接続する
- windowの`keydown`を登録し、cleanupで解除する
- Shiftなしを通常Move、Shiftありをprime付きMoveへ変換する
- Move失敗時は現在のCubeを残して`role="alert"`でerrorを表示する

## 操作契約

| 入力            | APIへ送るMove      |
| --------------- | ------------------ |
| `r`／`R`        | `R`                |
| `l`／`L`        | `L`                |
| `u`／`U`        | `U`                |
| `d`／`D`        | `D`                |
| `f`／`F`        | `F`                |
| `b`／`B`        | `B`                |
| Shift + 上記key | 対応する`R'`〜`B'` |

## 設計上の注意

- buttonとkeyboardで別々のfetch処理を作らず、同じMove送信関数を利用する
- key比較時は大文字／小文字を正規化し、Shift判定とは分ける
- listenerへ渡した関数と同じ参照をcleanup時に解除する
- `Content-Type: application/json`と`{"move":"..."}`を送る
- 非成功statusではresponseをCubeStateとして保存しない

## 禁止事項

- FrontendからCube Coreの`applyMove`を呼ばない
- CubeViewへkeyboard、button、fetchを実装しない
- API handlerやrepositoryを変更しない
- Milestone 7の複数Move文字列、parser、再生制御を先取りしない
- テストを通すためにtest fileを変更しない

## 実装対象ファイル

基本は`apps/web/src/App.tsx` 1ファイル。見た目の調整が必要な場合だけ`apps/web/src/styles.css`を変更してよい。

## 実装後の確認

```bash
npm test -- --run apps/web/src/App.milestone6.test.tsx
npm test -- --run
npm run typecheck
npm run dev:api
VITE_API_BASE_URL=http://127.0.0.1:3000 npm run dev:web
```
