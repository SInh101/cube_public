# Milestone 6 — Interactive Cube UI テスト設計

## テストケース

- M6-01: R／L／U／D／F／Bのbuttonを表示する
- M6-02: buttonからMove APIへ送信し、response stateでCubeViewを更新する
- M6-03: R／L／U／D／F／B keyを通常Moveへ変換する
- M6-04: Shift付きkeyをinverse Moveへ変換する
- M6-05: 対応外keyではMove APIを呼ばない
- M6-06: Move API失敗時は現在のCubeStateを維持してerrorを表示する

## テスト境界

Appの初期POST／GETはmockし、操作後の`POST /api/cubes/{cubeId}/moves`を観測する。CubeViewも観測用componentへ置換し、API responseのstateがpropsへ渡ったことを確認する。Cube数学とThree.js内部描画は既存テストへ任せる。

## Error契約

- Move APIが非成功statusを返した場合、取得済みCubeを消さない
- `role="alert"`でerrorを表示する
- error responseをCubeStateとして保存しない

## TDD開始状態

自力実装前はMilestone 6テストが失敗する。production code完成後に、既存Milestone 5テストを含む全テストが成功することを確認する。

## 実装後の結果

Milestone 6実装後はM6-01〜06を含む全テストが成功し、buttonとkeyboardによる実ブラウザ操作も確認した。

## Animation追加テスト

- M6-AN-01: R／L／U／D／F／Bを正しい回転軸と外側layerへ対応づける
- M6-AN-02: prime Moveを通常Moveと反対方向へ回転する
- M6-AN-03: `2`付きMoveを180度回転する

## M6.1 面操作GUI追加テスト

- M6-GUI-01: 6面それぞれにCW／CCW操作を表示する
- M6-GUI-02: CWを通常Move、CCWをprime Moveへ変換する
- M6-GUI-03: GUIのhover／focusからだけpreviewを開始し、解除時に消す
- M6-GUI-04: API由来の現在のCubeStateをCSS layerのsticker色へ反映する
- highlightとghostは既存の軸／layer設定を共有し、CubeStateを変更しない
- animation完了待ちと操作disableはMilestone 8のAgentテストへ移す
