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

# 追加実装についての提案

この提案はMilestone 6完了後の追加機能`M6.1 固定カメラ用 面操作GUI`として扱う。Milestone 5の自力実装範囲には含めない。

以下の仕様で、Rubik's Cube教材Webアプリの「固定カメラ用 面操作GUI」を実装してください。

## 目的

3D Cubeを固定カメラで表示しつつ、各面 `U / D / L / R / F / B` を直感的に操作できるGUIを追加する。

単なる6面ボタンではなく、各面に対応する「1層分のCube」をGUIとして6個配置し、そこからCW / CCW操作できるようにする。

このGUIはルービックキューブ初心者向け教材として使うため、操作対象の面・層・回転方向が視覚的に分かることを重視する。

---

## 前提

- Frontend: React + TypeScript
- 3D描画: Three.js
- カメラは固定
- Cubeの論理面は `U / D / L / R / F / B`
- Singmaster notationに従う
- REST APIやCube Coreの仕様は変更しない
- 今回はフリーカメラ対応を行わない
- 今回はcamera-relativeな操作体系を導入しない
- GUI上の `R` は常にCube固定座標系のR面を意味する

---

## 実装するUI

メイン3D Cubeの周囲または下部に、6個の「面操作用レイヤーUI」を配置する。

イメージ：

```text
              [ U layer ]

[ L layer ] [ F layer ] [ R layer ] [ B layer ]

              [ D layer ]
```

各layer UIは、その面の1層だけを取り出したような3D表現にする。

たとえばRなら、CubeのR層に相当する3×3の1層を表示する。

各layer UIの中央には、対応する面名を大きく表示する。

```text
U
D
L
R
F
B
```

文字は3Dオブジェクト上、またはオーバーレイとして表示してよい。

---

## 各layer UIの操作

各layer UIにはCW / CCW用の矢印を表示する。

例：

```text
    ↺        ↻
       [ R ]
```

またはlayer UIの左右に矢印を配置する。

### 操作

- CW矢印クリック

  - 対応面を90度clockwise回転

- CCW矢印クリック

  - 対応面を90度counter-clockwise回転

回転方向はSingmaster notation基準とする。

つまり、その面をCubeの外側から正面に見たときの時計回りをCWとする。

---

## Hover時の挙動

layer UIまたはその操作領域にhoverしたら、以下を同時に行う。

### 1. メイン3D Cubeの対象面をハイライト

たとえばR UIにhoverした場合：

- メインCubeのR面に属するCubieを強調
- 他の部分より明るくする、アウトラインを付ける、半透明overlayを置く等で視認可能にする
- CubeState自体は変更しない

### 2. 対象layerのゴースト表示

メイン3D Cube上に、その操作対象の1層を複製した半透明のghost layerを表示する。

例：

```text
R hover
↓
R層だけ半透明コピー表示
```

ghost layerはかなり透明度を高くする。

目安：

```text
opacity: 0.15〜0.35
```

程度。

実際のCubeより前面に少し浮かせてもよい。

---

## Hover時の回転示唆アニメーション

ghost layerを軽く回転させ、ユーザーに「この層が回る」ことを示す。

ただし90度回し切らない。

例：

```text
0°
↓
+15°
↓
0°
↓
+15°
```

のようなループ。

または、

```text
-10° → +10° → -10°
```

でもよい。

重要なのは、これは操作そのものではなく「示唆アニメーション」であること。

CubeStateや実際のCubie位置は変更しない。

---

## CW / CCW方向のHover示唆

可能であれば、CW矢印hover時とCCW矢印hover時でghost layerの回転方向を変える。

例：

```text
CW hover
→ clockwise方向に15°

CCW hover
→ counter-clockwise方向に15°
```

これにより、矢印をクリックした際にどちらへ回るか直感的に理解できるようにする。

---

## クリック時の挙動

矢印クリック時：

1. Hover用ghost animationを停止
2. Cube操作処理を呼ぶ
3. メインCubeを90度回転アニメーション
4. CubeStateを更新
5. 必要ならhover ghostを新状態で再生成

API通信部分は既存のMove操作関数を利用する。

例：

```ts
applyMove('R');
applyMove("R'");
```

新しいCubeロジックは実装しない。

---

## コンポーネント分割

以下のような責務分離を推奨する。

```text
CubePage
├── CubeView
│   ├── MainCube
│   └── GhostLayer
│
└── FaceControlPanel
    ├── FaceControl U
    ├── FaceControl D
    ├── FaceControl L
    ├── FaceControl R
    ├── FaceControl F
    └── FaceControl B
```

`FaceControl`は共通コンポーネント化する。

例：

```ts
type Face = 'U' | 'D' | 'L' | 'R' | 'F' | 'B';

interface FaceControlProps {
  face: Face;
  onClockwise: () => void;
  onCounterClockwise: () => void;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}
```

6面ごとの個別実装をコピー&ペーストしないこと。

---

## 状態管理

最低限、Frontend側で以下を管理する。

```ts
hoveredFace: Face | null;
hoveredDirection: 'cw' | 'ccw' | null;
isAnimating: boolean;
```

必要なら拡張してよい。

ただしCubeの本体状態は既存のCubeStateをsingle source of truthとする。

Hover用ghostはCubeStateを変更しない。

---

## 面・層の定義

各面について、論理的な対応を明示的に定義する。

例：

```ts
const faceConfig = {
  R: {
    axis: 'x',
    layer: 1,
  },
  L: {
    axis: 'x',
    layer: -1,
  },
  U: {
    axis: 'y',
    layer: 1,
  },
  D: {
    axis: 'y',
    layer: -1,
  },
  F: {
    axis: 'z',
    layer: 1,
  },
  B: {
    axis: 'z',
    layer: -1,
  },
};
```

実際の座標系が異なる場合は既存Cube Coreに合わせる。

UIコンポーネント内に条件分岐を散らさず、設定データとしてまとめる。

---

## 重要：回転方向

CW / CCWの符号を画面座標やThree.jsの見た目だけで決めない。

必ずCube CoreのMove定義、

```text
R
R'
L
L'
U
U'
D
D'
F
F'
B
B'
```

を基準とする。

UIのCWボタンは、その面を外側から見た時計回りに対応させる。

表示アニメーションとCube Coreの実際の回転方向が一致していることをテストする。

---

## 見た目

教材として分かりやすいことを優先する。

必須：

- 面名 `U / D / L / R / F / B` が常に見える
- CW / CCW矢印が明確
- hover対象面が分かる
- ghost layerが本体Cubeと区別できる
- ghost layerの示唆アニメーションが派手すぎない

装飾は最小限でよい。

---

## アニメーション

### Hover

- 約10〜20度
- ease-in-out
- ループ
- 500〜1000ms程度
- CubeStateは変更しない

### 実操作

- 90度
- 200〜400ms程度
- animation完了後に正確なCubeStateへsnap

既存のCube animation機構がある場合はそれを利用する。

---

## 操作中の制御

`isAnimating`、アニメーション完了待ち、実回転中のCW／CCW操作disableはMilestone 8のAgent担当へ移す。M6.1では新しい再生state machineを実装せず、既存のAPI成功後animationを維持する。

GUI hover／focus previewは実操作と独立させ、CubeStateを変更しない。keyboard操作ではpreviewを開始しない。

---

## テスト・確認項目

最低限以下を確認する。

### UI

- 6面すべて表示される
- 面名が正しい
- CW / CCW矢印が存在する
- hover解除時にghostが消える

### 対応面

- U hover → U層
- D hover → D層
- L hover → L層
- R hover → R層
- F hover → F層
- B hover → B層

### 操作

- R CW → `R`
- R CCW → `R'`
- U CW → `U`
- U CCW → `U'`
- 以下L/D/F/Bも同様

### 不変条件

hoverだけではCubeStateが変化しない。

### アニメーション

ghost layerの示唆方向と、クリック後の実回転方向が一致する。

---

## 今回実装しないもの

以下は実装対象外。

- フリーカメラ
- camera-relative face selection
- ドラッグによる面回転
- Cube本体クリックによる回転
- タッチスワイプ操作
- wide move
- M / E / S
- x / y / z whole cube rotation
- keyboard shortcutの変更
- Cube Coreの再設計

将来追加しやすい構造にはしてよいが、先回りして複雑化しないこと。

---

## 実装時の優先順位

1. 6個のFaceControl表示
2. U/R等の面名表示
3. CW / CCWクリック
4. メインCube面hover highlight
5. ghost layer表示
6. ghost layer回転示唆
7. 実回転とのanimation統合
8. polish

---

## 実装方針

既存コードを確認し、既存のCubeView / Move API / CubeState / animation機構を再利用すること。

既存コードと重複するCubeロジックは追加しない。

変更はできるだけ局所化し、

```text
FaceControl
FaceControlPanel
GhostLayer
faceConfig
```

のように責務を分離する。

実装後、変更したファイル一覧、設計上の判断、今後フリーカメラ化する場合に変更が必要な箇所を簡潔にまとめること。
