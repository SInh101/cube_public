# Milestone 7 — テスト設計

## Agent実装済み

- Happy path: sequence parse
- Boundary: 空文字、任意個の空白
- Invalid input: 不正tokenと位置
- State transition: inverseの順序とMove反転
- Property: sequence + inverse = identity
- Application: 空白を含む入力から検証済みMove DTOを返す
- Application: 不正tokenのdomain errorをHTTP境界へ伝える
- Integration: AppからSequence APIへ入力を送り、選択した一手を既存Move APIへ送る
- Error: Sequence API失敗時に古いMoveを消してerrorを表示する

## 自力実装後にAgentが追加する統合テスト

- RESTで複数Moveを順番どおり適用する
- 不正tokenを400として返し、CubeStateを変更しない
- 存在しないCubeを404として返す
- 未対応methodを405として返す
- UI入力からrequest、response state反映までを確認する

REST handlerの実装後、正常、正規化、validation、JSON、media type、method、非mutation、DTO shapeを自動testへ変更した。UI 4件も表示・callback・loading/errorの自動testへ変更した。
