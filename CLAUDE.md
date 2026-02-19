# playwright-searchtool

競合 EC サイトの市場調査スクリーンショットツール。

## セットアップ

```bash
npm install
npm run install-browser
```

## ツール

### バッチスクリーンショット（スクリプト）

複数サイト × 3デバイス（desktop / tablet / mobile）のフルページスクショを一括撮影。

#### 一括モード（推奨）

JSON ファイルで複数サイトを指定。1ブラウザで全サイト・全デバイスを並列処理。

```bash
node scripts/take-screenshots.mjs --sites sites.json
```

JSON 形式:
```json
{
  "outputDir": "./screenshots/topic-slug",
  "sites": [
    { "url": "https://example.com", "name": "example-store" },
    { "url": "https://other.com", "name": "other-store" }
  ]
}
```

#### 単体モード

```bash
node scripts/take-screenshots.mjs \
  --url "https://example.com" \
  --name "example-store" \
  --output-dir "./screenshots/topic-slug"
```

- 出力: `./screenshots/{topic-slug}/{name}/desktop.png`, `tablet.png`, `mobile.png`
- フルページスクリーンショット（ページ全体をキャプチャ）
- stdout に JSON 結果を出力
- 403/429 はスキップし JSON に記載

### Playwright MCP（インタラクティブ用）

`.mcp.json` で設定済み。個別ページの操作・調査に使用。バッチ撮影には使わない。

## 命名規則

- `topic-slug`: 調査テーマの kebab-case（例: `apparel-ec`, `organic-food`）
- `name`: サイト名の kebab-case（例: `uniqlo`, `zozo-town`）

## デバイスサイズ

| デバイス | 幅 | 高さ |
|----------|-----|------|
| Desktop  | 1280 | 800 |
| Tablet   | 768  | 1024 |
| Mobile   | 375  | 667  |

## 制約

- Headless モードのみ（バッチ用途）
- Cookie バナーはベストエフォートで dismiss
- Bot 検知でブロックされるサイトは結果に記載してスキップ
- スクリーンショットは git 管理外（`.gitignore` 済み）
