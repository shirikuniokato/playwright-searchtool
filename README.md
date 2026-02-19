# playwright-searchtool

Web サイトのマルチデバイス・フルページスクリーンショットツール。Claude Code から `/market-research` で調査を一発実行できる。

## セットアップ

```bash
cd ~/git/playwright-searchtool
npm install
npm run install-browser
```

## 使い方

### スラッシュコマンド

Claude Code でプロジェクトを開き:

```
/market-research アパレル EC
/market-research SaaS LP デザイン
/market-research ポートフォリオサイト
```

WebSearch でサイトを検索 → URL リスト承認 → マルチデバイスのフルページスクリーンショットを自動撮影。

### 一括撮影（JSON）

複数サイトを1回で並列処理:

```bash
node scripts/take-screenshots.mjs --sites sites.json
```

```json
{
  "outputDir": "./screenshots/saas-lp",
  "sites": [
    { "url": "https://example.com", "name": "example-site" },
    { "url": "https://other.com", "name": "other-site" }
  ]
}
```

### 単体撮影

```bash
node scripts/take-screenshots.mjs \
  --url "https://example.com" \
  --name "example-site" \
  --output-dir "./screenshots/saas-lp"
```

## 出力

```
screenshots/
└── saas-lp/
    └── example-site/
        ├── desktop.png   (1280x800)
        ├── tablet.png    (768x1024)
        └── mobile.png    (375x667)
```

フルページスクリーンショット（ビューポートではなくページ全体をキャプチャ）。
