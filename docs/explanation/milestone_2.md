# Milestone 2 — Codex準備内容解説

Milestone 2は学習者の自力実装Milestoneであるため、Codexは完成コードを作らず、実装開始用の設計資料だけを追加する。

## `apps/api/api/cubes.ts`

- 役割: Cube APIの全URIを同じVercel Functionへ入れるdeploy entrypoint。
- コード要約: Web標準`fetch` handlerとして`handleCubeRequest`を公開する。POST、GET、resetを別Functionへ分けず、warm instance内で同じin-memory repositoryを参照できるようにする。

## `apps/api/src/http/handleCubeRequest.ts`

- 役割: Cube APIのpathnameとHTTP methodをapplicationユースケースへ振り分ける。
- コード要約: collection、individual resource、reset commandを識別し、POST／GET／PUTだけを許可する。不正UUID、resource不在、method不許可、内部例外を共通Error DTOへ変換する。rewrite後のquery parameterと直接呼び出し時のpathnameの両方を解釈する。

## `apps/api/src/local/localServer.ts`

- 役割: Milestone 2～8でin-memory repositoryをrequest間維持するローカルNode HTTP server。
- コード要約: Node HTTP requestをWeb標準`Request`へ変換して共通`handleCubeRequest`へ渡し、`Response`をNode responseへ書き戻す。Frontendから利用できるCORS headerとOPTIONS応答もローカルadapterで提供する。

## `apps/api/src/local/startLocalServer.ts`

- 役割: ローカルAPI serverのcommand entrypoint。
- コード要約: 標準では`127.0.0.1:3000`でlistenし、`API_HOST`と`API_PORT`で変更できる。port値を起動前に検証する。

## `apps/api/src/local/localServer.test.ts`

- 役割: processが存続する実HTTP serverで複数request間のCube state維持を検証する。
- コード要約: 空きportでserverを起動し、実際の`fetch`でPOST→GET→reset→GETを送り、すべて成功して同じ識別子を取得できることを確認する。

## `apps/api/vercel.json`

- 役割: 外部公開URIを単一のCube Functionへrewriteする。
- コード要約: `/api/cubes/{cubeId}`と`/api/cubes/{cubeId}/reset`を`/api/cubes`へ送り、識別子と操作をquery parameterで内部routerへ渡す。公開するREST URIは変更しない。

## `apps/api/src/application/createSolvedCube.ts`

- 役割: HTTPから独立してsolved状態のCubeを生成する。
- コード要約: 学習者から明示的に依頼された支援関数として、Cube Coreの`Cube.solved()`を呼んで`Cube`を返す。UUID、repository、DTO、HTTP responseは扱わない。

## `apps/api/src/application/createCubeId.ts`

- 役割: 新しいCube resourceへ割り当てるUUIDをAPI側で生成する。
- コード要約: Web Cryptoの`crypto.randomUUID()`を利用してUUID文字列を返す。HTTP requestやresponseには依存しない。

## `apps/api/src/application/index.ts`

- 役割: POST handlerからapplication支援関数をimportするための公開入口。
- コード要約: UUID生成、solved Cube生成、`createCube`ユースケースを再exportし、handlerから内部ファイル構成を隠す。

## `apps/api/src/application/createCube.ts`

- 役割: 新しいCubeを生成・保存し、HTTP入口へ成功レスポンス用DTOを返すapplicationユースケース。
- コード要約: 学習者が組み立てた生成・保存処理は維持し、明示依頼に基づいてローカルDTO型を共通contractの`CreateCubeResponseDto`へ置き換えた。戻り値は保存したresourceの`cubeId`だけを持つDTOである。

## `apps/api/src/application/getCube.ts`

- 役割: 指定されたCubeをrepositoryから取得し、状態取得DTOへ変換するapplicationユースケース。
- コード要約: Cubeが存在しなければ共通`CubeNotFoundError`を送出し、存在すればdomain object自体ではなく`cubeId`と`getState()`の結果を`CubeStateResponseDto`として返す。

## `apps/api/src/http/resetCube.state-transitions.test.ts`

- 役割: resetに関する状態遷移テスト`M2-ST-01`〜`M2-ST-03`を検証する。
- コード要約: Move endpoint未実装のため、Cube Coreで非solvedなfixtureを作って共有repositoryへ保存する。resetの冪等性、複数Cube間の状態分離、非solved状態からsolved状態への復元をHTTP handler経由で確認する。各テストでは衝突しないUUIDを生成し、共有repositoryの残存stateに依存しない。

## `apps/api/src/http/milestone2.behavior.test.ts`

- 役割: `M2-IV`、`M2-BD`、`M2-IN`、`M2-RG`のうち、現在のendpoint構成で実行可能な契約・境界・統合・回帰ケースを検証する。
- コード要約: 単一HTTP routerを通してresource不在、不正UUID、method不許可、UUID境界、bodyなしreset、create→GET、create→reset→GET、response schema、Cube不変条件、responseとrepository stateの分離を検証する。VercelがFunctionとして収集する`api`ディレクトリの外へ配置する。

## `apps/api/src/application/resetCube.ts`

- 役割: 指定されたCubeをrepositoryから取得してsolved状態へ戻すapplicationユースケース。
- コード要約: Cubeがなければ`CubeNotFoundError`を送出する。存在すればdomainの`reset()`を呼び、同じ`cubeId`と更新後の`state`を`CubeStateResponseDto`として返す。HTTP statusやURL解析は扱わない。

## `apps/api/src/application/CubeNotFoundError.ts`

- 役割: repositoryに対象Cubeが存在しないことを複数のapplicationユースケースで共通表現する。
- コード要約: 対象の`cubeId`を保持する専用Error classを定義する。resetやGETなどのユースケースが同じエラー型を送出でき、HTTP handlerはそれを共通の404 responseへ変換できる。

## `apps/api/src/validation/isUuid.ts`

- 役割: resource identifierがUUID形式かをrepositoryやdomainから独立して判定する。
- コード要約: UUIDの一般形式とvariantを正規表現で検証する。生成方式をUUID v4だけに固定せず、version 1～5を受理する。

## `apps/api/src/repository/CubeRepository.ts`

- 役割: Cubeの保存方式をapplication層から隠すrepository境界。
- コード要約: `save(cubeId, cube)`と`findById(cubeId)`をPromiseベースで定義する。in-memoryと将来のSupabase repositoryを同じ非同期契約で扱えるようにし、HTTP statusやDTOは持ち込まない。

## `apps/api/src/repository/InMemoryCubeRepository.ts`

- 役割: Milestone 2で利用する暫定的なin-memory repository実装。
- コード要約: privateな`Map<string, Cube>`へCubeを保存し、IDから同じCube instanceを検索する。DB実装と同じPromise契約を満たすが、process再起動、cold start、instance分割を越えた永続化は提供しない。

## `apps/api/src/repository/sharedCubeRepository.ts`

- 役割: create、GET、resetの各handlerが同じin-memory stateを参照するための共有instance。
- コード要約: module scopeで`InMemoryCubeRepository`を1つ生成してexportする。handlerごとのrepository再生成によるstate消失を避けるが、Vercel instance間の共有は保証しない。

## `apps/api/src/repository/index.ts`

- 役割: repository関連の公開入口。
- コード要約: interface、in-memory実装、共有instanceを再exportし、利用側から内部ファイル構成を隠す。

## `apps/api/src/repository/InMemoryCubeRepository.test.ts`

- 役割: Codexが実装したrepositoryの保存・検索契約を検証するunit test。
- コード要約: 保存したCubeを同じIDで取得できること、不在時に`undefined`となること、別repository instance間でstateを共有しないことを確認する。REST APIテストは含まない。

## `apps/api/package.json`

- 役割: API workspaceの依存関係を定義する。
- コード要約: application層からCube Coreを、handlerから共通DTOを正規のworkspace packageとして利用できるよう、`@rubiks-learning/cube-core`と`@rubiks-learning/api-contract`を追加する。

## `apps/api/tsconfig.json`

- 役割: API workspaceのTypeScript検査対象とcompiler設定を定義する。
- コード要約: 従来のVercel Functions用`api/**/*.ts`に、application層の`src/**/*.ts`を型検査対象として追加する。

## `package-lock.json`

- 役割: APIからCube Coreへのworkspace依存を再現可能に記録する自動生成ファイル。
- コード要約: `npm install`により更新し、手作業では編集しない。

## `packages/api-contract/src/errors.ts`

- 役割: 全REST endpointで共有するError response DTOを定義する。
- コード要約: ワークシートで決定されたmachine-readableなerror code、任意のfield details、`error.code/message/details`という共通response shapeをreadonly型として提供する。

## `packages/api-contract/src/cubes.ts`

- 役割: Cube APIの成功レスポンス契約をHTTP処理やapplication実装から独立して定義する。
- コード要約: `POST /api/cubes`が返す`cubeId`をreadonly propertyとして持つ`CreateCubeResponseDto`を公開する。

## `packages/api-contract/src/index.ts`

- 役割: API contract packageの公開入口。
- コード要約: Cube成功DTO、Error DTO、error code定数を公開し、applicationやhandlerがcontract packageの内部ファイルへ直接依存しないようにする。

## `docs/workbook/milestone_2.md`

- 役割: 学習者がREST契約と責務境界を自分で決めるための設計ワークシート。
- コード要約: resource、URI、method、status、DTO、error、validation、状態管理を空欄形式で整理する。完成値はCodexが記入せず、Cube CoreとHTTPの分離、Vercel Functions上のin-memory状態の制限、実装前チェックを示す。

## `docs/test-design/milestone_2.md`

- 役割: 自力実装前に必要なREST APIテストパターンを定義する。
- コード要約: test-designerの分類に従い、Happy path、State transition、Invalid input、Boundary、Integration、Regressionをケース化する。URI、method、statusはplaceholderとし、学習者の契約決定後に置換する。テストコードそのものは含まない。

## `docs/explanation/milestone_2.md`

- 役割: Milestone 2開始準備としてCodexが追加したファイルを説明する本ファイル。
- コード要約: 当初の準備資料に加え、その後の明示依頼でCodexが実装したDTO、repository、HTTP adapter、ローカルserver、自動テストと役割変更をファイル単位で記録する。

## `docs/report/milestone_2.md`

- 役割: Milestone 2の担当境界、REST契約、検証結果、暫定制約、次Milestoneへの課題を記録する終了レポート。
- コード要約: 自力設計・初期実装の規模、Agentへの明示依頼範囲、61件の自動テスト、実HTTPの201／200／400／404／405、再起動後のstate消失、Vercel延期をまとめる。

## `AGENT_SKILLS.md`

- 役割: 本教材で利用するAgent役割と作業境界を定義する。
- コード要約: 学習者の方針変更に基づき、Milestone 3以降の`test-designer`をテスト観点提示だけでなく自動テスト実装・実行まで担当する役割へ変更する。テスト担当をproduction codeの実装許可とは扱わない制約も明記する。

## `LEARNING_GUIDE.md`

- 役割: 全Milestone共通の学習者／Agent担当境界と開発サイクルを定義する。
- コード要約: Milestone 3以降の自動テストをAgent担当へ移し、自力実装対象のproduction codeは従来どおり学習者が担当することを明記する。

## `MILESTONES.md`

- 役割: 各Milestoneの目的、担当、完了条件を定義する。
- コード要約: Milestone 3以降に適用するテスト方針を追加し、特にMilestone 3とテスト専用のMilestone 4についてAgentがテスト設計・実装・実行を担当するよう整合させる。
