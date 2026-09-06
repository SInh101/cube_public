# Milestone 4 — REST API Test 実施レポート

## Milestoneの目的

Milestone 2と3で構築したREST APIの主要契約を自動テストで固定し、各テストが保証する仕様を説明できるようにする。

## 実装した機能

- Cube生成、Cube不在、正常／不正Move、reset、`R^4`、`R R'`の7テスト
- status、response DTO、保存された状態、不正入力時の状態不変の検証
- ルートの`npm test`を介したGitHub Actions CIへの接続

## 自力実装の有無と規模

production codeおよびテストコードの自力実装はなし（0ファイル・0 endpoint）。学習確認として7テストについて各4観点、合計28項目を説明した。

## 自力実装した対象

なし（0件）。

## 自分で設計した部分

- 各テストの目的
- HTTP入力
- 期待するstatus、DTO、状態
- テスト失敗時に示される契約違反
- GitHub Actionsからテストが実行される経路の説明

## Agentが担当した部分

- 7テストの設計、実装、実行
- テスト設計書と回答用workbookの作成
- 回答レビューと、明示依頼に基づく回答修正
- Codex実装解説

## レビュー指摘と修正内容

- Move APIを`POST /api/cubes/{cubeId}/moves`へ修正
- `R4`という入力ではなく、`R`を4回送る手順へ修正
- statusだけでなくresponse DTOとCubeStateを期待結果へ追加
- 不正Moveで状態が変化しない契約を追加
- 「失敗時に示す契約違反」を、返され得るstatusではなくテストが保証する仕様として修正
- CIのtriggerからVitestによるtest file検出までの経路を追記

## テスト結果

- Vitest: 7ファイル、140件成功
- formatter、ESLint、TypeScript、build: 成功
- GitHub Actions: push後のリモート実行結果確認が必要

## 理解できたこと

- 入力、期待結果、契約違反を分けてテストを読む方法
- HTTP statusだけでなくresponse bodyと状態遷移も契約になること
- property testが複数request間の状態管理とCube数学の両方を検証すること
- `npm test`からCI上のテスト実行へ至る経路

## 理解が曖昧なこと

なし。GitHub Actionsの実行結果はpush後に外部状態として確認する。

## 次Milestoneへの課題

- REST APIから取得したCubeStateをReact stateへ格納する
- loading／errorを区別する
- Agent提供の`CubeView`へstateをpropsとして渡す
