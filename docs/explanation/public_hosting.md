# Public hosting対応の実装解説

- `withCors.ts`: Vercel Functionの通常応答へCORS headerを追加し、browserのpreflightへ204を返す。
- 各`apps/api/api/*.ts`: handlerを`withCors`で包み、GitHub Pagesから全endpointを呼べるようにする。
- `Cube.fromState`: DBへ保存した6面54 stickerのstateからdomain objectを復元する。
- `SupabaseCubeRepository`: Cube stateをPostgRESTでupsert/取得する。service-role keyはserver環境だけから読む。
- `sharedCubeRepository.ts`: Supabase設定が揃うVercelでは永続Repository、ローカルではin-memoryを選ぶ。
- `202609090001_create_cubes.sql`: RLSを有効にしたCube tableを追加する。公開policyを作らず、API serverだけが操作する。
- `SECURITY.md`: 今後の全変更に適用する公開repository向け秘密情報ルールを定義する。

自力実装部分はない。
