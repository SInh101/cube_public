# Vercel workspace runtime対応

## 原因

`@rubiks-learning/cube-core`はpackage exportがTypeScriptソースを直接指していた。Vercel Functionの成果物ではAPI側のTypeScriptはJavaScriptへ変換される一方、外部workspace packageは実行時依存として扱われる。そのため、実行環境が`node_modules/@rubiks-learning/cube-core/src/index.ts`を見つけられず、Function起動時に停止していた。

## 実装

- `packages/cube-core/tsconfig.build.json`: テストを除外し、`src`から実行用JavaScriptと型宣言を`dist`へ生成する。
- `packages/cube-core/package.json`: TypeScript利用時の型は`src/index.ts`、Node.js実行時のモジュールは`dist/index.js`へ解決する。
- `apps/api/package.json`: APIのVercel buildより先に`cube-core`をbuildする。
- `vitest.config.ts`: ローカルテストでは`cube-core`のソースを直接利用し、事前buildを不要にする。

`dist`は生成物であり、`.gitignore`の対象なのでrepositoryへcommitしない。
