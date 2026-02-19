# playwright-searchtool

競合 EC サイトの市場調査スクリーンショットツール。Claude Code から `/market-research` コマンドで一発実行。

## セットアップ

```bash
cd ~/git/playwright-searchtool
npm install
npm run install-browser
```

## 使い方

### スラッシュコマンド（推奨）

Claude Code でプロジェクトを開き:

```
/market-research アパレル EC
```

WebSearch で競合サイトを検索 → URL リスト承認 → マルチデバイスのフルページスクリーンショットを自動撮影。

### 一括撮影（JSON）

複数サイトを1回で並列処理:

```bash
node scripts/take-screenshots.mjs --sites sites.json
```

```json
{
  "outputDir": "./screenshots/apparel-ec",
  "sites": [
    { "url": "https://example.com", "name": "example-store" },
    { "url": "https://other.com", "name": "other-store" }
  ]
}
```

### 単体撮影

```bash
node scripts/take-screenshots.mjs \
  --url "https://example.com" \
  --name "example-store" \
  --output-dir "./screenshots/apparel-ec"
```

## 出力

```
screenshots/
└── apparel-ec/
    └── example-store/
        ├── desktop.png   (1280x800)
        ├── tablet.png    (768x1024)
        └── mobile.png    (375x667)
```

フルページスクリーンショット（ビューポートではなくページ全体をキャプチャ）。
