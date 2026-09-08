# Milestone 10 — Agent実装解説

## 全体設計

`PresetPanel`が通信state hookと表示componentを接続し、`App`はPresetをCube Playbackへ渡す責務だけを持つ。

```text
App ── playback要求 ── PresetPanel
                         ├─ PresetManager（form/UI）
                         └─ usePresets（REST/state）
                                  ↓
                         Milestone 9 Preset API
```

## `apps/web/src/presets/usePresets.ts` / `index.ts`

- 役割: Preset一覧、loading/saving/error、CRUD REST通信を管理する。
- コード要約: 初回GET、POST、PATCH、DELETEを実行し、成功したmutationだけをlocal一覧へ反映する。失敗時は既存一覧を維持する。
- 設計理由: UIからfetchとDTO更新規則を分離し、Supabaseへ直接依存させないため。
- エラー処理: 非2xxとnetwork errorを公開messageへ変換し、既存dataを消さない。
- テスト: `usePresets.test.tsx`がload/createと失敗時の一覧維持を検証する。

## `apps/web/src/components/PresetManager.tsx` / `preset-manager.css`

- 役割: 一覧、作成form、inline編集、削除、通常・逆再生操作を表示する。
- コード要約: 通信やPlaybackをcallbackへ委譲し、loading/saving中はmutation操作を無効化する。空一覧とerrorを区別する。
- 設計理由: REST stateを知らないpresentational componentにして単体テスト可能にするため。
- テスト: `PresetManager.test.tsx`がM10-UI-01〜08の表示とcallback契約を検証する。

## `apps/web/src/components/PresetPanel.tsx`

- 役割: `usePresets`と`PresetManager`を接続するcontainer。
- コード要約: API base URLをhookへ渡し、CRUD callbackと取得stateをUIへ渡す。
- 設計理由: `App`直下でPreset取得するとCube初期化と不要に結合し、既存テストや将来の画面分割を壊すため。
- テスト: hookと表示componentを個別に検証し、App回帰テストではPanelを差し替える。

## `apps/web/src/App.tsx`

- 役割: Presetのmovesを既存Move sequence検証とPlaybackへ接続する。
- コード要約: Preset Play時に`/api/move-sequences`で再検証し、通常はそのまま、逆再生は逆順・inverseへ変換して既存`usePlayback.play`を起動する。`sequenceRevision`により同じPresetも再実行できる。
- 設計理由: Preset用の別animation loopを作らず、M8の完了通知・速度・操作disableを再利用するため。
- エラー処理: 不正または取得不能なsequenceはPlaybackを開始せず既存sequence error領域へ表示する。
- テスト: M5〜M8 App回帰テストとM10 component/hook testで境界を確認する。同じPresetの通常再生2回・逆再生2回を連続して完了できる回帰テストを含む。

## テスト・文書ファイル

- `apps/web/src/App.milestone10.todo.test.tsx`: pendingを実テストへ置換したため削除。
- `apps/web/src/components/PresetManager.test.tsx`: CRUDと再生UI、通信状態を検証する。
- `apps/web/src/presets/usePresets.test.tsx`: REST state transitionを検証する。
- `docs/workbook/milestone_10.md`: 実装範囲と責務境界。
- `docs/test-design/milestone_10.md`: テスト分類と実装状態。
- `docs/report/milestone_10.md`: 完了状況と品質ゲート。

## 後続Milestoneへの影響

M11以降がCube操作を拡張しても、Presetは文字列Move sequenceとREST DTOだけを公開する。Preset UIからCube CoreやSupabaseへ直接依存してはならない。
