# 一万城区域・マンション管理プロトタイプ

既存Google My Maps由来の区域KML上にマンションピンを重ね、Googleスプレッドシートの部屋管理表を開くスマートフォン向け静的Webアプリです。

## 起動

```bash
cd ichimanjo-area-map
python3 -m http.server 8080
```

ブラウザで `http://localhost:8080` を開きます。`file://` ではKMLを読み込めないため、必ずHTTPサーバー経由で開いてください。

## 構成

- `index.html` — 画面
- `styles.css` — スマートフォン向けUI
- `app.js` — KML解析、区域・マンション描画
- `data/areas.kml` — My Mapsから取得した区域データ
- `data/apartments.js` — マンションデータ
- `data/restricted-homes.js` — 訪問しない家のサンプルデータ
- `data/area-statuses.js` — 区域管理シートから反映する状態スナップショット
- `assets/` — 建物確認用画像

## 公開

ビルド不要のため、フォルダーをNetlify Dropへドラッグ＆ドロップするか、GitHubリポジトリのルートとしてGitHub Pagesを有効化すれば公開できます。VercelでもFramework Presetを `Other`、Output Directoryを `.` として公開できます。

## データ更新

マンション追加は `data/apartments.js` の配列へ同じ形式のオブジェクトを追加します。区域更新はMy MapsからKMLを再取得し、`data/areas.kml` を差し替えます。KMLのポリゴン名、境界、線色、塗り色、透明度を画面へ反映します。

訪問しない家は `data/restricted-homes.js` に追加し、確認画像を `assets/` に置きます。サンプル画像はAI生成した架空の建物で、実在住所とは関係ありません。

Google Maps APIキーは不要です。背景地図にはLeaflet + OpenStreetMapを使用しています。公開利用時はOpenStreetMapのタイル利用ポリシーに従ってください。

画面下部の切替で「すべて」「マンション」「訪問しない家」を絞り込み、区域境界も表示・非表示にできます。

## LINE内ブラウザ

HTTPSの公開URLを共有してください。Google Sheetsボタンは新しいタブで開きますが、LINE内ブラウザの設定により同一画面または外部ブラウザへ移る場合があります。Googleアカウントの閲覧権限がない利用者はシートを開けません。
