# Milestone 11 — テスト設計

## Domain

- Happy path: `A B A^-1 B^-1`の順に展開する
- Teaching boundary: 4部分のpart、Move、半開区間が一致する
- Boundary: 空のA/Bでも4境界を維持する

## REST / Application

- Happy path: 展開手順、Move、4境界、適用後stateを返す
- State transition: Responseと再取得したCubeStateが一致する
- Atomic validation: AまたはBのparse失敗時にCubeStateを変更しない
- Invalid input: fieldとtoken位置を含む400を返す
- Resource: 存在しないCubeを404にする
- HTTP contract: 不正shape、media type、UUID、methodを400/415/400/405にする
- Boundary: 空のA/Bをidentityとして受理する
- Integration: Vercel rewrite後のquery routeとローカル実HTTPを検証する

公開契約と観測可能なstateを検証し、handler内部の関数呼び出し順には依存しない。
