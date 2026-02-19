---
description: 競合市場調査 — WebSearch でサイトを発見し、マルチデバイスのスクリーンショットを撮影
---

# 市場調査: $ARGUMENTS

以下の手順で競合市場調査を実行してください。

## Step 1: テーマ分析

ユーザーの調査テーマ「$ARGUMENTS」から:
- topic-slug を決定（kebab-case）
- 調査に適した検索キーワードを考える

## Step 2: 競合サイト検索

WebSearch ツールで競合サイトを検索し、5〜10件のサイトをリストアップしてください。

検索のコツ:
- 「$ARGUMENTS EC サイト」「$ARGUMENTS 通販」などで検索
- 大手・中堅・新興をバランスよく含める
- トップページの URL を特定する

## Step 3: ユーザー承認

以下の形式で URL リストを提示し、**承認を待ってください**:

| # | サイト名 | URL | 備考 |
|---|----------|-----|------|
| 1 | ... | ... | ... |

「この URL リストでスクリーンショットを撮影してよいですか？追加・削除があれば指示してください。」

**承認されるまで次のステップに進まないこと。**

## Step 4: スクリーンショット撮影

承認されたサイトを JSON ファイルにまとめ、一括で撮影:

1. まず JSON ファイルを作成:

```json
{
  "outputDir": "./screenshots/{topic-slug}",
  "sites": [
    { "url": "https://example.com", "name": "example-store" }
  ]
}
```

2. スクリプトを実行:

```bash
node scripts/take-screenshots.mjs --sites ./screenshots/{topic-slug}/sites.json
```

注意事項:
- `name` は kebab-case（英数字とハイフンのみ、特殊文字禁止）
- `url` は `https://` で始まる有効な URL のみ使用
- 1プロセスで全サイト・全デバイスを並列処理するため、サイトごとに個別実行しないこと
- JSON 結果を確認し、失敗サイトを記録

## Step 5: 結果サマリ

全サイトの撮影完了後、以下の形式で結果を報告:

| サイト名 | Desktop | Tablet | Mobile | 備考 |
|----------|---------|--------|--------|------|
| ... | ok/ng | ok/ng | ok/ng | ... |

- 保存先ディレクトリ: `./screenshots/{topic-slug}/`
- 失敗したサイトがあれば原因を記載
