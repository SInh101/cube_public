# Milestone 7 — テスト設計

## Agent実装済み

- Happy path: sequence parse
- Boundary: 空文字、任意個の空白
- Invalid input: 不正tokenと位置
- State transition: inverseの順序とMove反転
- Property: sequence + inverse = identity

## 自力実装後にAgentが追加する統合テスト

- RESTで複数Moveを順番どおり適用する
- 不正tokenを400として返し、CubeStateを変更しない
- 存在しないCubeを404として返す
- 未対応methodを405として返す
- UI入力からrequest、response state反映までを確認する

production codeが未着手のため、統合テストコードはまだ追加しない。
