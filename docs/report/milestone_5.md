# Milestone 5 — 3D Cube Viewer 実施レポート

## Milestoneの目的

REST APIから取得したCubeStateをReact stateへ保存し、Three.js製の`CubeView`で3D表示する。

## 実装した機能

- CubeStateを26個のcubieと54枚の外向きstickerへ変換する表示model
- Three.jsによるresponsiveな3D Cube表示
- mount時のCube作成、状態取得、loading／error表示
- 取得したstateの`CubeView`へのprops受け渡し
- component破棄時のfetchおよびThree.js resourceのcleanup

## 自力実装の有無と規模

あり。既存の`apps/web/src/App.tsx` 1ファイルで、1つの非同期取得フロー、3つの表示状態、2回のREST requestを実装した。

## 自力実装した対象

- `POST /api/cubes`から`GET /api/cubes/{cubeId}`へつなぐ非同期処理の初期実装
- loading／ready／errorのReact state管理
- CubeStateを保持するReact state

## 自分で設計した部分

- 画面表示直後にCubeを作成して状態を取得する処理順序
- `useEffect`内の非同期関数として取得処理を構成する方針

## Agentが担当した部分

- `CubeView`、3D表示model、CSS、公開export
- 3D変換テストとApp連携TDDテスト
- Three.js、型定義、Testing Library、jsdomの依存設定
- テスト設計、workbook、実装解説
- 明示依頼に基づくApp初期実装の修正

## レビュー指摘と修正内容

- POST responseをtextではなくCreateCubeResponseDtoとして解析
- React state更新直後の古いcubeId参照をやめ、ローカル変数でGETへ接続
- CubeStateの型を`CubeStateResponseDto['state'] | null`へ変更
- POST／GETの両方へAbortSignalを設定
- 未使用のHTTP method wrapperとcubeId stateを削除
- error表示へ`role="alert"`を付与
- success時だけ`CubeView`を描画

## コードレビュー結果

- Critical／Major／Minor指摘: なし
- 非同期処理、DTO、React state、条件描画の責務が読み取れる
- fetch失敗時とcomponent破棄時を区別している
- Three.js resourceをcleanupしている

## アーキテクチャレビュー結果

- FrontendはREST APIを経由し、repositoryやCube Coreを直接操作していない
- `CubeView`はAPI通信やReactの取得状態を持たず、propsで受け取ったstateの描画だけを担当する
- AppがHTTPと画面状態、表示componentが3D処理を担当している
- Milestone 6の操作UI、keyboard event、Move mutation、animationを先取りしていない

## テスト結果

- Vitest: 9ファイル、147件成功
- Milestone 5: 3D変換3件、App連携4件成功
- formatter、ESLint、TypeScript、build: 成功
- 実ブラウザ: 見出しと白・緑・赤面を持つsolved Cubeの3D表示を確認
- buildは成功したが、Three.jsを含むchunkが500 kBを超える警告あり

## 理解できたこと

- `useEffect`自体ではなく内部関数をasyncにする理由
- React state更新を待たず、responseのローカル値で次のrequestへ進む必要性
- loading／error／successによる条件描画
- API DTOと3D描画componentをpropsで接続する方法

## 理解が曖昧なこと

なし。bundle分割は機能完成後の最適化課題とする。

## 次Milestoneへの課題

- buttonとkeyboard eventを同じMove送信処理へ接続する
- Shift付きキーをinverse Moveへ変換する
- Move API responseでReact stateを更新し、UIとAPIの状態を同期する
- 操作中と失敗時の状態を管理する
