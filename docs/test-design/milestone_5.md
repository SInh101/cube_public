# Milestone 5 — 3D Cube Viewer テスト設計

## Agent実装のテスト

- M5-01: CubeStateから26個のcubieを生成する
- M5-02: 54 stickersを各色9個ずつ外側へ割り当てる
- M5-03: face配列の位置を対応する3D面へ割り当てる

## 自力実装を検証するテスト

- M5-IN-01: 非同期取得中はloadingを表示し、未取得stateでCubeViewを描画しない
- M5-IN-02: `POST /api/cubes`で作成し、`GET /api/cubes/{cubeId}`で取得したstateをCubeViewへ渡す
- M5-IN-03: createまたはGETが失敗した場合はerrorを表示し、CubeViewを描画しない

## 境界

`CubeView`はAPI通信、Reactの取得状態、Move操作を持たない。`App`がREST通信とloading／error／successを管理し、success時だけ取得済みstateをpropsとして渡す。Milestone 6のkeyboard、button、mutation、animationは対象外とする。

## TDD開始状態

`App.milestone5.test.tsx`は自力実装前には失敗する。これは未完成を示す意図した状態であり、production codeを自力実装して全テストを成功させる。
