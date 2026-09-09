# Move API通信の一括化

## 目的

Cube作成直後の余分なGETと、連続再生中の「1 moveにつき1回」の更新通信を削減する。既存の部分回転アニメーションは、各move適用後のCube stateを順番に受け取る前提なので、その境界は維持する。

## APIとDTO

- `POST /api/cubes`は`cubeId`と初期`state`を同時に返す。Webは通常1通信で初期表示できる。旧レスポンスを受ける場合だけGETへfallbackする。
- `POST /api/cubes/:cubeId/moves`は従来の`{ "move": "R" }`に加えて`{ "moves": ["R", "U"] }`を受ける。
- batch responseの`states[index]`は`moves[index]`適用直後の状態、`state`は最終状態である。
- repositoryへの保存は全move適用後の1回だけである。

## アニメーションとの境界

`usePlayback`はPlay、Reverse Play、Preset、Commutator、Play next partの開始時に、その再生区間を1回のbatchとして準備する。`App`は返された`states`をキューへ保持し、従来の`applyMove`へ1件ずつ渡す。このためCubeViewのanimation ID、完了通知、Pause、部分境界の進行は従来のまま動く。

batch送信後にPauseして方向を変えた場合、サーバーは未表示分まで適用済みである。次のbatchでは未表示moveの逆手を先頭へ加えてサーバー状態を画面状態まで戻してから、新しい再生方向を適用する。この補正moveは画面では再生しない。

NextとPreviousの単発操作、および通常操作盤の1 moveは後方互換の単発requestを使う。
