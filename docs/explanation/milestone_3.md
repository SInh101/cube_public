# Milestone 3 — Codex実装解説

Milestone 3のproduction codeは学習者の自力実装範囲である。設計支援資料とテストに加え、学習者から明示された範囲に限りHTTP routerとMove専用handlerをCodexが実装した。

## `docs/workbook/milestone_3.md`

- 役割: 学習者がMove commandのURI、method、request／response、validation、責務境界を決定するための設計ワークシート。
- コード要約: 学習者の回答とレビュー後の明示依頼に基づき、非冪等なMove commandを`POST /api/cubes/{cubeId}/moves`として確定する。`application/json`、全18 Move、200と`CubeStateResponseDto`、validation/error契約、router／Move handler／`applyMoveToCube` application／repository／Cube Coreの責務を記録し、自力実装規模も明記する。

## `docs/test-design/milestone_3.md`

- 役割: 契約確定後にAgentが実装するMove REST APIテストの網羅範囲を定義する。
- コード要約: Happy path、State transition、Property、Invalid input、Boundary、Integration、Regressionを対象にし、確定したURI、method、Content-Type、status、response DTO、error codeをテスト契約欄へ反映する。production codeは含まない。

## `apps/api/src/http/milestone3.move.test.ts`

- 役割: 確定したMove REST契約を、学習者のproduction実装に先行して固定する自動テスト。
- コード要約: 全18 Move、Rのidentity／inverse／R2、resetと複数Cubeの状態遷移、UUID・JSON・DTO・Move・Content-Type・method validation、境界値、Cube不変条件、response snapshot分離、Milestone 2回帰、ローカルserver経由の実HTTPを検証する。未実装endpointに対して意図的に失敗するTDD開始状態を提供する。

## `apps/api/src/http/handleCubeRequest.ts`

- 役割: Cube APIのURIとHTTP methodを識別し、対応する専用handlerまたはapplication処理へ振り分けるrouter。
- コード要約: `POST /api/cubes/{cubeId}/moves`をMove routeとして認識し、既存と同じUUID validation後に`handleApplyMoveRequest`へ委譲する。JSON解析やMove validationはrouterへ持ち込まない。

## `apps/api/src/http/handlers/handleApplyMoveRequest.ts`

- 役割: Move command固有のHTTP入力検証、application呼び出し、HTTP response変換を担当する。
- コード要約: Content-Type、JSON構文、`{move: string}`だけを持つDTO shape、Cube Coreの18 Move完全一致を順番に検証する。成功時は`applyMoveToCube`結果を200で返し、確定済み契約に従って400／404／415／500の共通Error DTOへ変換する。

## `apps/api/src/application/applyMoveToCube.ts`

- 役割: 指定したCube resourceへ1手のMoveを適用するapplication use case。
- コード要約: repositoryからCubeを取得し、存在しなければ`CubeNotFoundError`を送出する。Cube Coreの`applyMove`へ処理を委譲した後に保存し、更新後の`CubeStateResponseDto`を返す。Cube Coreのメソッドとapplication use caseを区別し、既存の`createCube`／`getCube`／`resetCube`と対象名を揃えるため、`applyMove`から`applyMoveToCube`へ改名した。

## `docs/explanation/milestone_3.md`

- 役割: Milestone 3でCodexが追加・変更したファイルを追跡する本ファイル。
- コード要約: 設計支援資料、テスト、学習者から明示的に依頼されたrouterとMove専用handlerの実装内容を、学習者の自力実装部分と区別して記録する。

## `AGENT_SKILLS.md`

- 役割: 教材内のAgent役割とレビュー境界を定義する。
- コード要約: Milestone 3以降のエラー契約設計をAgent担当とし、error class、validation、catch、response変換などのproduction実装は学習者へ残す境界を追加する。

## `LEARNING_GUIDE.md`

- 役割: 全Milestone共通の学習者／Agent担当境界を定義する。
- コード要約: Agentがエラーのstatus、code、message、分類を設計し、学習者がproduction codeへ実装する学習方針を追加する。

## `MILESTONES.md`

- 役割: 各Milestoneへ適用する共通方針と完了条件を定義する。
- コード要約: Milestone 3以降へ適用するエラー設計／実装の分担ルールを追加する。
