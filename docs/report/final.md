# Final Review

## 結論

Milestone 0から14までの要求を統合した学習用Webアプリとして、最終品質ゲートを通過できる状態である。Cube操作、手順再生、Preset、Commutator教材、3-cycle解析と共役による位置移動の可視化まで、Frontend・REST API・Cube Coreが接続されている。

Milestone 15でVercel上のMove endpointにrewriteが不足している問題を発見し、`/api/cubes/:cubeId/moves`を`operation=move`へ接続して回帰テストを追加した。

指定された`cube-domain`、`test-designer`、`code-reviewer`、`architecture-guardian`、`project-maintainer` Skillは実行環境に存在しなかったため、同じ5観点を通常のコード監査として実施した。

## アーキテクチャ

```text
React App (apps/web)
  | HTTP + api-contract DTO
  v
Vercel Functions / Local HTTP server (apps/api)
  | handlers -> application services -> repositories
  +--------------------------+
  v                          v
Cube Core                 Preset Repository
(packages/cube-core)      (Supabase / in-memory fallback)
```

- `packages/cube-core`: Cube状態、18 Move、MoveSequence、Commutator、cubie/permutation解析を持つ。HTTPやReactへ依存しない。
- `packages/api-contract`: FrontendとAPIが共有するrequest/response/error DTOを持つ。
- `apps/api`: URI・method・validation・error変換をHTTP層、操作の組み立てをapplication層、保存をrepository層に分ける。
- `apps/web`: API状態と再生状態を統合し、Three.js表示とPractice / Analysis教材UIを提供する。

依存方向は`web -> api-contract`、`api -> api-contract + cube-core`であり、Cube Coreから外側への逆依存はない。

## REST API一覧

| Method               | URI                              | 役割                                 |
| -------------------- | -------------------------------- | ------------------------------------ |
| GET                  | `/api/health`                    | API稼働確認                          |
| POST                 | `/api/cubes`                     | solved Cube作成                      |
| GET                  | `/api/cubes/:cubeId`             | Cube状態取得                         |
| PUT                  | `/api/cubes/:cubeId/reset`       | solved状態へ戻す                     |
| POST                 | `/api/cubes/:cubeId/moves`       | 1 Move適用                           |
| POST                 | `/api/move-sequences`            | 手順の検証・正規化                   |
| POST                 | `/api/commutators`               | Commutatorの展開                     |
| POST                 | `/api/cubes/:cubeId/commutators` | Cubeに対するCommutator準備・適用情報 |
| POST                 | `/api/cubes/:cubeId/analyses`    | 手順・共役手順の非破壊解析           |
| GET/POST             | `/api/presets`                   | Preset一覧・作成                     |
| GET/PUT/PATCH/DELETE | `/api/presets/:presetId`         | Preset取得・更新・削除               |

共通エラーは`{ "error": { "code", "message", "details?" } }`で返す。UUID、JSON、Content-Type、Move/Sequence、存在しないresource、許可されないmethodを区別する。

## Frontend構成

- `App.tsx`: Cube作成、REST同期、animation待機、playback、教材モードを統合する。
- `CubeView.tsx`: Cube stateをThree.jsへ変換し、回転animation、piece/sticker marker、変更piece highlightを描画する。
- Practice: 面操作、キーボード操作、MoveSequence、Playback、Reset、Preset管理。
- Analysis: Commutatorの4部分再生、3-cycleのpiece/sticker解析、共役前後の位置比較。
- 共通: animation速度を広い範囲で調整できる。左のCube Viewを固定し、右のtool columnだけをスクロールする。

## Cube教材機能

- Singmaster記法18 Moveと逆手順・連続手順
- `R^4 = identity`、`R R' = identity`などの群的性質
- Commutator `[A, B] = A B A' B'`の部分境界と段階再生
- corner/edge permutation、cycle decomposition、fixed cubie、orientation change
- 向き付きsticker表記。例:`URF`はU面上のRF側corner sticker
- 1つのcorner 3-cycleを3つのsticker cycleへ分けて表示
- 共役`[X: A] = X A X'`による3-cycle位置の移動とpure 3-cycle保存判定

## 5観点レビュー

### Cube domain

Move、sequence、inverse、commutator、conjugation、permutation解析が純粋なdomain層にまとまっている。状態取得とcloneは防御的コピーとして使われ、解析は保存Cubeを変更しない。

### Test design

正常系だけでなく、逆操作、4回転、境界値、不正JSON、不正DTO、404/405、repository非破壊、animation完了待ち、連続再生、共役保存を検証している。最終レビュー時点でskip/only/TODOテストはない。

### Code review

DTOを境界に使い、例外をHTTP errorへ変換している。最終監査でVercel Move rewrite漏れを修正した。秘密情報をFrontendへ渡すコードはなく、Supabase service-role keyはAPI環境変数だけから取得する。

### Architecture

domain、contract、API、UIの境界は維持されている。既存playbackとCubeViewを教材機能から再利用しており、Tutorialなど将来のtool modeを追加できる構造である。

### Maintainability

workspace単位のTypeScript、ESLint、Prettier、Vitest、buildをCIで強制する。Milestoneごとのworkbook、test-design、explanation、reportが実装意図と履歴を残す。

## 技術的負債と改善候補

1. Cube Repositoryはin-memoryである。ローカル学習用途では適切だが、Vercel Functionsではinstanceをまたいだ永続性を保証できない。公開環境でCube状態を維持する場合はSupabase/Redis等の`CubeRepository`実装へ差し替える。
2. Web production bundleはThree.jsを含むため約750 kBで、Viteの500 kB警告が出る。機能上は問題ないが、初期表示を軽量化するならCubeViewまたはAnalysis modeをdynamic importする。
3. `App.tsx`は統合責務が増えている。次の大規模機能追加時はCube session、analysis、playback orchestrationをcustom hookへ段階的に分離する。
4. CORSは学習・開発向けに`*`である。認証を導入する公開サービスでは許可originを設定値へ限定する。
5. Supabase migrationはRLSを有効にしてservice-role経由に限定している。ユーザー別Presetを導入する場合は認証主体、owner列、RLS policyが必要になる。

## 学習成果

- domain modelとHTTP DTOを分け、REST境界でvalidation/errorを扱う方法
- repository interfaceによってin-memoryとDB実装を交換する方法
- 非同期API mutationとanimation完了を同期させるReact state machine
- Cubeの置換をcubie ID、位置、向き、cycleとして解析する方法
- CommutatorとConjugationを教材UIへ落とし込む方法
- 自動テスト、静的解析、format、production buildを同一CIで守る方法

## 最終確認コマンド

```sh
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
```

最終実行結果:

- Vitest: 40ファイル、345テスト成功
- TypeScript: 全workspace成功
- ESLint: 成功
- Prettier: 成功
- API/Web production build: 成功
- `git diff --check`: 成功
- skip / only / TODOテスト: 0件

Production buildにはThree.jsを含むchunkが500 kBを超える警告があるが、build自体は成功しており、上記の技術的負債に記録済みである。

## 自力実装部分

なし。Milestone 10以降のルールに従い、最終レビュー、修正、テスト、文書化はAgent担当とした。
